// src/app/api/scheduler/add-live-course/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course, { CourseType } from '@/models/Course';
import CourseSchedulerEnrollment from '@/models/CourseSchedulerEnrollment';
import { authenticateRequest } from '@/middlewares/authMiddleware';
import mongoose from 'mongoose';

// Mapping of slot IDs to time ranges
const slotTimes = {
  'slot_1': '9:00 - 9:40',
  'slot_2': '9:45 - 10:25',
  'slot_3': '10:45 - 11:25',
  'slot_4': '11:30 - 12:10',
  'slot_5': '13:35 - 14:15',
  'slot_6': '14:20 - 15:00'
};

// Mapping of day names to day numbers (for Date objects)
const dayToNumber = {
  'sunday': 0,
  'monday': 1,
  'tuesday': 2,
  'wednesday': 3,
  'thursday': 4,
  'friday': 5,
  'saturday': 6
};

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

    // Extract course ID
    const { courseId } = reqBody;
    
    // Validate course ID
    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or missing course ID'
      }, { status: 400 });
    }
    
    // Find the course
    const course = await Course.findById(courseId);

    console.log(course, 'course')
    
    if (!course) {
      return NextResponse.json({
        success: false,
        error: 'Course not found'
      }, { status: 404 });
    }
    
    // Verify the course is a live course
    if (course.type !== CourseType.LIVE) {
      return NextResponse.json({
        success: false,
        error: 'This API is only for live courses'
      }, { status: 400 });
    }
    
    // Check if course is published
    if (course.status !== 'published') {
      return NextResponse.json({
        success: false,
        error: 'Course is not published'
      }, { status: 400 });
    }
    
    // Get course details
    const timeSlots = course.liveCourseMeta?.timeSlots || [];
    const plannedLessons = course.liveCourseMeta?.plannedLessons || 0;
    const startDate = course.liveCourseMeta?.startDate ? new Date(course.liveCourseMeta.startDate) : new Date();
    
    console.log(timeSlots, 'timeSlots')
    console.log(plannedLessons, 'plannedLessons')
    console.log(startDate, 'startDate')

    // Verify course has time slots and planned lessons
    if (timeSlots.length === 0 || plannedLessons === 0) {
      return NextResponse.json({
        success: false,
        error: 'Course does not have any time slots or planned lessons'
      }, { status: 400 });
    }
    
    // Find or create the scheduler enrollment for this user
    let scheduler = await CourseSchedulerEnrollment.findOne({
      learner: new mongoose.Types.ObjectId(auth.user.id)
    });
    
    console.log(scheduler, 'scheduler')

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

    console.log(existingCourseIndex, 'existingCourseIndex')
    
    // If course is already fully scheduled, return error
    if (existingCourseIndex !== -1) {
      const existingScheduledItems = scheduler.scheduledCourses[existingCourseIndex].scheduledItems;
      if (existingScheduledItems.length >= plannedLessons) {
        return NextResponse.json({
          success: false,
          error: 'This course is already fully scheduled'
        }, { status: 400 });
      }
    }
    
    // Get the day of the week for each time slot
    const timeSlotsByDay = {};
    timeSlots.forEach(slot => {
      if (!timeSlotsByDay[slot.weekDay]) {
        timeSlotsByDay[slot.weekDay] = [];
      }
      timeSlotsByDay[slot.weekDay].push(slot);
    });
    
    // Prepare the session items to schedule
    const scheduledItems = [];
    
    // For each supported day of the week
    for (const weekDay in timeSlotsByDay) {
      // Get the slots for this day
      const slots = timeSlotsByDay[weekDay];
      
      // Calculate first occurrence of this weekday
      const firstDayOfWeek = new Date(startDate);
      const dayNumber = dayToNumber[weekDay] || 3; // Default to Wednesday (3)
      const dayDiff = (dayNumber - firstDayOfWeek.getDay() + 7) % 7;
      firstDayOfWeek.setDate(firstDayOfWeek.getDate() + dayDiff);
      firstDayOfWeek.setHours(0, 0, 0, 0); // Reset to midnight
      
      // Calculate needed sessions
      const slotsPerWeek = slots.length;
      const weeksNeeded = Math.ceil(plannedLessons / slotsPerWeek);
      
      // Generate session schedule
      let sessionCount = 0;
      
      for (let week = 0; week < weeksNeeded; week++) {
        const weekDate = new Date(firstDayOfWeek);
        weekDate.setDate(weekDate.getDate() + (week * 7));
        
        // For each slot on this day
        for (const slot of slots) {
          sessionCount++;
          
          // Break if we've reached plannedLessons
          if (sessionCount > plannedLessons) break;
          
          // Create scheduled item for this session
          scheduledItems.push({
            itemId: `session_${sessionCount}`,
            title: `Session ${sessionCount}`,
            date: new Date(weekDate),
            slotId: slot.slot,
            isCompleted: false
          });
        }
        
        // If we've reached plannedLessons, break
        if (sessionCount >= plannedLessons) break;
      }
    }
    
    // Add course to scheduler
    if (existingCourseIndex === -1) {
      // Add new course with all sessions
      scheduler.scheduledCourses.push({
        course: courseId,
        scheduledItems: scheduledItems,
        progress: {
          completed: 0,
          total: plannedLessons
        },
        startDate: startDate,
        status: 'active'
      });
    } else {
      // Add new sessions to existing course
      // First, get IDs of already scheduled sessions
      const existingSessionIds = scheduler.scheduledCourses[existingCourseIndex].scheduledItems.map(item => item.itemId);
      
      // Only add sessions that aren't already scheduled
      const newItems = scheduledItems.filter(item => !existingSessionIds.includes(item.itemId));
      
      // Add new items
      scheduler.scheduledCourses[existingCourseIndex].scheduledItems.push(...newItems);
    }
    
    // Save the updated scheduler
    await scheduler.save();
    
    // Format and return scheduled items with course info
    const formattedItems = scheduledItems.map(item => ({
      id: item._id, // MongoDB should generate this
      courseId: courseId,
      itemId: item.itemId,
      title: item.title,
      date: item.date,
      slotId: item.slotId,
      isCompleted: item.isCompleted,
      courseTitle: course.title,
      type: course.type,
      backgroundColorHex: course.backgroundColorHex,
      iconUrl: course.iconUrl,
    }));
    
    // Return success with scheduled items
    return NextResponse.json({
      success: true,
      message: 'Live course added to scheduler successfully',
      data: {
        schedulerId: scheduler._id,
        scheduledItems: formattedItems
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error adding live course to scheduler:', error);
    
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
      error: 'Failed to add live course to scheduler'
    }, { status: 500 });
  }
}