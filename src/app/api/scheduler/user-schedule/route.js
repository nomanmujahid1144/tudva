// src/app/api/scheduler/user-schedule/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course, { CourseType } from '@/models/Course';
import CourseSchedulerEnrollment from '@/models/CourseSchedulerEnrollment';
import { authenticateRequest } from '@/middlewares/authMiddleware';
import mongoose from 'mongoose';

// Mapping of slot IDs to time ranges for display
const slotTimes = {
  'slot_1': '9:00 - 9:40',
  'slot_2': '9:45 - 10:25',
  'slot_3': '10:45 - 11:25',
  'slot_4': '11:30 - 12:10',
  'slot_5': '13:35 - 14:15',
  'slot_6': '14:20 - 15:00'
};

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

    // Get query parameters for date range filtering
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    // Parse dates if provided
    let startDate, endDate;
    if (startDateParam) startDate = new Date(startDateParam);
    if (endDateParam) endDate = new Date(endDateParam);

    // Find the user's scheduler enrollment
    const scheduler = await CourseSchedulerEnrollment.findOne({
      learner: new mongoose.Types.ObjectId(auth.user.id)
    });

    // If no scheduler exists, return default settings
    if (!scheduler) {
      return NextResponse.json({
        success: true,
        data: {
          settings: {
            defaultWeekDay: 'wednesday',
            reminderEnabled: true,
            reminderTime: 30
          },
          scheduledItems: []
        }
      }, { status: 200 });
    }

    // Get course IDs to fetch course details
    const courseIds = scheduler.scheduledCourses.map(sc => sc.course);

    // Fetch all course details in one query
    const courses = await Course.find({
      _id: { $in: courseIds }
    }).select('_id title type backgroundColorHex iconUrl modules liveCourseMeta');

    // Create a map for quick lookup
    const courseMap = {};
    courses.forEach(course => {
      courseMap[course._id.toString()] = course;
    });

    // Process scheduled items
    const scheduledItems = [];

    // Go through each scheduled course
    for (const scheduledCourse of scheduler.scheduledCourses) {
      const courseId = scheduledCourse.course.toString();
      const course = courseMap[courseId];

      // Skip if course not found
      if (!course) continue;

      // Process each scheduled item in the course
      for (const item of scheduledCourse.scheduledItems) {
        const itemDate = new Date(item.date);

        // Apply date filters if provided
        if (startDate && itemDate < startDate) continue;
        if (endDate && itemDate > endDate) continue;

        // Determine module title for recorded courses
        let moduleTitle = '';
        if (course.type === CourseType.RECORDED && item.itemId.includes('/')) {
          const [moduleId, videoId] = item.itemId.split('/');

          // Find the module and video to get titles
          if (course.modules) {
            const module = course.modules.find(m => m._id.toString() === moduleId);
            if (module) {
              moduleTitle = module.title;
            }
          }
        }

        // Create formatted scheduled item
        const scheduledItem = {
          id: item._id.toString(),
          courseId: courseId,
          itemId: item.itemId,
          title: item.title,
          moduleTitle: moduleTitle,
          date: itemDate,
          dateFormatted: itemDate.toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
          }),
          slotId: item.slotId,
          slotTime: slotTimes[item.slotId] || 'Unknown time',
          isCompleted: item.isCompleted,
          completedAt: item.completedAt,
          courseTitle: course.title,
          lessonNumber: item.lessonNumber,
          totalLessons: item.totalLessons,
          backgroundColorHex: course.backgroundColorHex,
          type: course.type,
          iconUrl: course.iconUrl || (course.type === CourseType.LIVE ?
            '/assets/custom-icons/live-course.png' :
            '/assets/custom-icons/recorded-course.png')
        };

        scheduledItems.push(scheduledItem);
      }
    }

    // Sort scheduled items by date and slot
    scheduledItems.sort((a, b) => {
      // First sort by date
      const dateCompare = a.date - b.date;
      if (dateCompare !== 0) return dateCompare;

      // If same date, sort by slot ID (convert to slot number)
      const slotA = parseInt(a.slotId.replace('slot_', ''), 10);
      const slotB = parseInt(b.slotId.replace('slot_', ''), 10);
      return slotA - slotB;
    });

    // Return the schedule data
    return NextResponse.json({
      success: true,
      data: {
        settings: scheduler.settings || {
          defaultWeekDay: 'wednesday',
          reminderEnabled: true,
          reminderTime: 30
        },
        scheduledItems: scheduledItems
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error getting user schedule:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch user schedule'
    }, { status: 500 });
  }
}