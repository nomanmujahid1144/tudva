// src/app/api/scheduler/remaining-items/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course, { CourseType } from '@/models/Course';
import CourseSchedulerEnrollment from '@/models/CourseSchedulerEnrollment';
import { authenticateRequest } from '@/middlewares/authMiddleware';
import mongoose from 'mongoose';

export async function GET(request) {
  try {
    // Connect to the database
    await connectDB();
    
    // Authenticate the request
    const auth = await authenticateRequest(request);
    
    if (!auth.success) {
      return NextResponse.json({
        success: false,
        error: auth.error
      }, { status: 401 });
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    
    // Validate course ID
    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or missing course ID'
      }, { status: 400 });
    }
    
    // Find the course
    const course = await Course.findById(courseId);
    
    if (!course) {
      return NextResponse.json({
        success: false,
        error: 'Course not found'
      }, { status: 404 });
    }
    
    // Find the user's scheduler enrollment
    const scheduler = await CourseSchedulerEnrollment.findOne({
      learner: new mongoose.Types.ObjectId(auth.user.id),
      'scheduledCourses.course': new mongoose.Types.ObjectId(courseId)
    });
    
    if (!scheduler) {
      return NextResponse.json({
        success: false,
        error: 'Course not found in user\'s schedule'
      }, { status: 404 });
    }
    
    // Find the scheduled course
    const scheduledCourse = scheduler.scheduledCourses.find(
      sc => sc.course.toString() === courseId
    );
    
    if (!scheduledCourse) {
      return NextResponse.json({
        success: false,
        error: 'Course not found in user\'s schedule'
      }, { status: 404 });
    }
    
    // Get all scheduled item IDs for this course
    const scheduledItemIds = scheduledCourse.scheduledItems.map(item => item.itemId);
    
    // Prepare response based on course type
    let remainingItems = [];
    
    if (course.type === CourseType.RECORDED) {
      // For recorded courses, we need to get all videos that aren't scheduled
      if (course.modules && course.modules.length > 0) {
        course.modules.forEach(module => {
          if (module.videos && module.videos.length > 0) {
            module.videos.forEach(video => {
              // Create the item ID format used in our scheduler (moduleId/videoId)
              const itemId = `${module._id}/${video._id}`;
              
              // Check if this video is already scheduled
              if (!scheduledItemIds.includes(itemId)) {
                remainingItems.push({
                  itemId,
                  moduleId: module._id,
                  videoId: video._id,
                  moduleTitle: module.title,
                  title: video.title,
                  duration: video.duration || 0,
                  description: video.description || '',
                  type: 'video'
                });
              }
            });
          }
        });
      }
    } else if (course.type === CourseType.LIVE) {
      // For live courses, check remaining sessions
      if (course.liveCourseMeta && course.liveCourseMeta.timeSlots) {
        // Find how many sessions should be scheduled based on plannedLessons
        const totalSessions = course.liveCourseMeta.plannedLessons || 0;
        
        // Count the scheduled items for this course
        const scheduledSessionCount = scheduledCourse.scheduledItems.length;
        
        // If we have scheduled fewer sessions than planned, we can add more
        if (scheduledSessionCount < totalSessions) {
          // Calculate remaining sessions
          const remainingSessions = totalSessions - scheduledSessionCount;
          
          // Add placeholder sessions
          for (let i = 0; i < remainingSessions; i++) {
            const sessionNumber = scheduledSessionCount + i + 1;
            
            remainingItems.push({
              itemId: `session_${sessionNumber}`,
              title: `Session ${sessionNumber}`,
              type: 'session',
              isPlaceholder: true
            });
          }
        }
      }
    }
    
    // Return the remaining items
    return NextResponse.json({
      success: true,
      data: {
        courseId: course._id,
        courseTitle: course.title,
        courseType: course.type,
        backgroundColorHex: course.backgroundColorHex,
        iconUrl: course.iconUrl,
        remainingItems
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error getting remaining course items:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch remaining course items'
    }, { status: 500 });
  }
}