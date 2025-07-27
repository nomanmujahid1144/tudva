// src/app/api/course/[courseId]/convert-to-recorded/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course, { CourseType } from '@/models/Course';
import mongoose from 'mongoose';
import { authenticateRequest } from '@/middlewares/authMiddleware';

export async function POST(request, { params }) {
  try {
    // Connect to the database
    await connectDB();
    
    const { courseId } = params;
    
    // Validate course ID
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid course ID' 
      }, { status: 400 });
    }
    
    // Authenticate request
    const auth = await authenticateRequest(request);
    
    if (!auth.success) {
      return NextResponse.json({ 
        success: false, 
        error: auth.error 
      }, { status: 401 });
    }
    
    // Find the course
    const course = await Course.findById(courseId);
    
    if (!course) {
      return NextResponse.json({ 
        success: false, 
        error: 'Course not found' 
      }, { status: 404 });
    }
    
    // Verify it's a live course
    if (course.type !== CourseType.LIVE) {
      return NextResponse.json({ 
        success: false, 
        error: 'This operation is only valid for live courses' 
      }, { status: 400 });
    }
    
    // Verify the user is the instructor of this course
    if (course.instructor.toString() !== auth.user.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'You do not have permission to manage this course' 
      }, { status: 403 });
    }
    
    // Check if the course has completed sessions
    const hasCompletedSessions = course.liveCourseMeta.timeSlots.some(
      slot => slot.sessionStatus === 'completed' && slot.recordingUrl
    );
    
    if (!hasCompletedSessions) {
      return NextResponse.json({
        success: false,
        error: 'Cannot convert to recorded course: no completed sessions with recordings'
      }, { status: 400 });
    }
    
    // Generate modules from time slots
    const modules = [];
    const sessionsByWeekDay = {};
    
    // Group sessions by weekday
    course.liveCourseMeta.timeSlots.forEach((slot, index) => {
      if (slot.sessionStatus === 'completed' && slot.recordingUrl) {
        if (!sessionsByWeekDay[slot.weekDay]) {
          sessionsByWeekDay[slot.weekDay] = [];
        }
        sessionsByWeekDay[slot.weekDay].push({
          slot,
          index
        });
      }
    });
    
    // Create modules for each weekday
    Object.entries(sessionsByWeekDay).forEach(([weekDay, sessions], moduleIndex) => {
      const moduleTitle = `${weekDay.charAt(0).toUpperCase() + weekDay.slice(1)} Sessions`;
      
      const videos = sessions.map((session, videoIndex) => {
        const slot = session.slot;
        const slotDisplay = slot.slot.replace('slot_', 'Slot ');
        const sessionDate = new Date(slot.sessionDate).toLocaleDateString();
        
        return {
          title: `Session ${videoIndex + 1} (${slotDisplay} - ${sessionDate})`,
          description: `Recorded live session from ${sessionDate}`,
          url: slot.recordingUrl,
          duration: 3600, // Placeholder, ideally would get actual duration
          isPreview: videoIndex === 0 // Make first video a preview
        };
      });
      
      modules.push({
        title: moduleTitle,
        description: `Recorded live sessions from ${weekDay}`,
        order: moduleIndex + 1,
        videos
      });
    });
    
    // Convert the course to recorded type
    course.type = CourseType.RECORDED;
    course.modules = modules;
    
    // Save the updated course
    await course.save();
    
    return NextResponse.json({
      success: true,
      message: 'Course successfully converted to recorded format',
      data: {
        courseId: course._id,
        slug: course.slug,
        moduleCount: modules.length
      }
    });
    
  } catch (error) {
    console.error('Error converting course to recorded:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to convert course to recorded format'
    }, { status: 500 });
  }
}