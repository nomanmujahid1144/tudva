// src/app/api/scheduler/add-item/route.js
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
    console.log(reqBody, 'reqBody')
    // Extract required data
    const {
      courseId,   // The course to add or update
      itemId,     // The specific item (video ID or session ID)
      title,      // Item title
      moduleTitle, // Module title for recorded courses
      lessonNumber,
      totalLessons,
      type,
      date,       // Scheduled date
      slotId      // Time slot ID
    } = reqBody;

    // Validate required fields
    if (!courseId || !date || !slotId || !itemId || !title) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: courseId, itemId, title, date, and slotId are required'
      }, { status: 400 });
    }

    // Validate courseId
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

    // Check if course is published
    if (course.status !== 'published') {
      return NextResponse.json({
        success: false,
        error: 'Course is not published'
      }, { status: 400 });
    }

    // Parse date
    const scheduledDate = new Date(date);

    // Find or create the scheduler enrollment for this user
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

    // Prepare the new scheduled item
    const newScheduledItem = {
      itemId,
      title,
      moduleTitle: moduleTitle || '',
      date: scheduledDate,
      lessonNumber,
      totalLessons,
      type,
      slotId,
      isCompleted: false
    };

    console.log(newScheduledItem, 'newScheduledItem')

    // Handle based on whether course is already in scheduler
    if (existingCourseIndex === -1) {
      // Course not yet in scheduler, add it with the first item

      // Determine total count for progress tracking
      let totalItems = 1;

      if (course.type === CourseType.LIVE) {
        totalItems = course.liveCourseMeta?.plannedLessons || 1;
      } else if (course.type === CourseType.RECORDED) {
        // Count videos across all modules
        if (course.modules) {
          totalItems = course.modules.reduce(
            (count, module) => count + (module.videos?.length || 0), 0
          );
        }
      }

      // Add course to scheduler
      scheduler.scheduledCourses.push({
        course: courseId,
        scheduledItems: [newScheduledItem],
        progress: {
          completed: 0,
          total: totalItems
        },
        startDate: scheduledDate,
        status: 'active'
      });
    } else {
      // Course already exists in scheduler, add the new item

      // Check if this item is already scheduled (avoid duplicates)
      const duplicateItem = scheduler.scheduledCourses[existingCourseIndex].scheduledItems.find(
        item => item.itemId === itemId
      );

      if (duplicateItem) {
        return NextResponse.json({
          success: false,
          error: 'This item is already scheduled'
        }, { status: 400 });
      }

      // Add the new item
      scheduler.scheduledCourses[existingCourseIndex].scheduledItems.push(newScheduledItem);
    }

    // Save the updated scheduler
    await scheduler.save();

    console.log(course, 'course')

    // Return success with the created item
    return NextResponse.json({
      success: true,
      message: 'Item added to schedule successfully',
      data: {
        schedulerId: scheduler._id,
        scheduledItem: {
          id: newScheduledItem._id, // MongoDB should generate this
          courseId: courseId,
          itemId: newScheduledItem.itemId,
          title: newScheduledItem.title,
          moduleTitle: newScheduledItem.moduleTitle,
          date: newScheduledItem.date,
          slotId: newScheduledItem.slotId,
          isCompleted: newScheduledItem.isCompleted,
          courseTitle: course.title,
          type: course.type,
          backgroundColorHex: course.backgroundColorHex,
          iconUrl: course.iconUrl,
          lessonNumber: newScheduledItem.lessonNumber,
          totalLessons: newScheduledItem.totalLessons,
        }
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding item to scheduler:', error);

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
      error: 'Failed to add item to scheduler'
    }, { status: 500 });
  }
}