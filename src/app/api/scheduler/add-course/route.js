// src/app/api/scheduler/add-course/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course, { CourseType } from '@/models/Course';
import CourseSchedulerEnrollment from '@/models/CourseSchedulerEnrollment';
import { authenticateRequest } from '@/middlewares/authMiddleware';
import mongoose from 'mongoose';

export async function POST(request) {
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
    
    // Parse the request body
    const reqBody = await request.json();
    
    // Extract course info
    const { 
      courseId, 
      date, 
      slotId,
      itemId, // Optional: specific video/session ID for initial scheduling
      title  // Optional: title for the scheduled item
    } = reqBody;
    
    // Validate required fields
    if (!courseId || !date || !slotId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: courseId, date, and slotId are required'
      }, { status: 400 });
    }
    
    // Validate course ID
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid course ID'
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
    
    // Verify the course is published
    if (course.status !== 'published') {
      return NextResponse.json({
        success: false,
        error: 'Course is not published'
      }, { status: 400 });
    }
    
    // Parse date
    const scheduledDate = new Date(date);
    
    // Find or create the scheduler enrollment
    let scheduler = await CourseSchedulerEnrollment.findOne({
      learner: new mongoose.Types.ObjectId(auth.user.id)
    });
    
    if (!scheduler) {
      // Create new scheduler for the learner
      scheduler = new CourseSchedulerEnrollment({
        learner: auth.user.id,
        scheduledCourses: [],
        settings: {
          defaultWeekDay: 'wednesday',
          reminderEnabled: true,
          reminderTime: 30
        }
      });
    }
    
    // Check if the course is already in the scheduler
    const existingCourseIndex = scheduler.scheduledCourses.findIndex(
      sc => sc.course.toString() === courseId
    );
    
    // Prepare the new scheduledItem
    const newScheduledItem = {
      date: scheduledDate,
      slotId,
      isCompleted: false
    };
    
    // Add additional fields based on the course type
    if (course.type === CourseType.RECORDED) {
      // For recorded courses, we need to identify the specific video
      let firstVideoItem = null;
      
      // If no specific item ID is provided, find the first video
      if (!itemId) {
        if (course.modules && course.modules.length > 0) {
          const firstModule = course.modules[0];
          
          if (firstModule.videos && firstModule.videos.length > 0) {
            const firstVideo = firstModule.videos[0];
            
            firstVideoItem = {
              itemId: `${firstModule._id}/${firstVideo._id}`,
              title: firstVideo.title
            };
          }
        }
      } else {
        // Use the provided item ID and title
        firstVideoItem = {
          itemId,
          title: title || 'Scheduled Lesson'
        };
      }
      
      if (!firstVideoItem) {
        return NextResponse.json({
          success: false,
          error: 'No videos found in the course'
        }, { status: 400 });
      }
      
      // Add the item info to the scheduled item
      newScheduledItem.itemId = firstVideoItem.itemId;
      newScheduledItem.title = firstVideoItem.title;
      
      // Calculate total videos for progress tracking
      let totalVideos = 0;
      if (course.modules) {
        course.modules.forEach(module => {
          totalVideos += module.videos?.length || 0;
        });
      }
      
      // If the course doesn't exist in the scheduler, add it
      if (existingCourseIndex === -1) {
        scheduler.scheduledCourses.push({
          course: courseId,
          scheduledItems: [newScheduledItem],
          progress: {
            completed: 0,
            total: totalVideos
          },
          startDate: scheduledDate,
          status: 'active'
        });
      } else {
        // If the course exists, add the new item
        scheduler.scheduledCourses[existingCourseIndex].scheduledItems.push(newScheduledItem);
      }
    } else if (course.type === CourseType.LIVE) {
      // For live courses, we need to identify the specific time slot
      let liveSessionItem = null;
      
      // If no specific item ID is provided, use the first available time slot
      if (!itemId) {
        if (course.liveCourseMeta && course.liveCourseMeta.timeSlots && course.liveCourseMeta.timeSlots.length > 0) {
          const firstTimeSlot = course.liveCourseMeta.timeSlots[0];
          
          liveSessionItem = {
            itemId: firstTimeSlot._id.toString(),
            title: `Session 1`
          };
        }
      } else {
        // Use the provided item ID and title
        liveSessionItem = {
          itemId,
          title: title || 'Live Session'
        };
      }
      
      if (!liveSessionItem) {
        return NextResponse.json({
          success: false,
          error: 'No time slots found in the course'
        }, { status: 400 });
      }
      
      // Add the item info to the scheduled item
      newScheduledItem.itemId = liveSessionItem.itemId;
      newScheduledItem.title = liveSessionItem.title;
      
      // Get total planned lessons for progress tracking
      const totalLessons = course.liveCourseMeta?.plannedLessons || 0;
      
      // If the course doesn't exist in the scheduler, add it
      if (existingCourseIndex === -1) {
        scheduler.scheduledCourses.push({
          course: courseId,
          scheduledItems: [newScheduledItem],
          progress: {
            completed: 0,
            total: totalLessons
          },
          startDate: scheduledDate,
          status: 'active'
        });
      } else {
        // If the course exists, add the new item
        scheduler.scheduledCourses[existingCourseIndex].scheduledItems.push(newScheduledItem);
      }
    }
    
    // Save the scheduler
    await scheduler.save();
    
    // Return success
    return NextResponse.json({
      success: true,
      message: 'Course added to scheduler successfully',
      data: {
        schedulerId: scheduler._id,
        scheduledCourse: scheduler.scheduledCourses.find(sc => sc.course.toString() === courseId)
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error adding course to scheduler:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json({
        success: false,
        error: `Validation error: ${validationErrors.join(', ')}`
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to add course to scheduler'
    }, { status: 500 });
  }
}