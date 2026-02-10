// src/app/api/scheduler/week-preview/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CourseSchedulerEnrollment from '@/models/CourseSchedulerEnrollment';
import Course from '@/models/Course';
import { authenticateRequest } from '@/middlewares/authMiddleware';
import { format, addDays, startOfDay, endOfDay } from 'date-fns';
import mongoose from 'mongoose';

export async function GET(request) {
  try {
    await connectDB();

    const auth = await authenticateRequest(request);

    if (!auth.success) {
      return NextResponse.json({
        success: false,
        error: auth.error
      }, { status: 401 });
    }

    const userId = auth.user.id;

    // Calculate next Wednesday (week 8)
    const today = new Date();
    const dayOfWeek = today.getDay();
    let daysToAdd = 3 - dayOfWeek; // Wednesday is day 3
    
    if (daysToAdd < 0) {
      daysToAdd += 7;
    } else if (daysToAdd === 0) {
      daysToAdd = 0;
    }
    
    const nextWednesday = addDays(today, daysToAdd);
    const startOfNextWednesday = startOfDay(nextWednesday);
    const endOfNextWednesday = endOfDay(nextWednesday);

    // Format the date for display
    const formattedDate = format(nextWednesday, 'EEEE dd, yyyy');
    const weekNumber = Math.ceil((nextWednesday.getDate() + 6 - nextWednesday.getDay()) / 7);

    // Define the time slots
    const TIME_SLOTS = [
      { id: 'slot_1', name: 'Slot 1', time: '9:00 - 9:40' },
      { id: 'slot_2', name: 'Slot 2', time: '9:45 - 10:25' },
      { id: 'slot_3', name: 'Slot 3', time: '10:45 - 11:25' },
      { id: 'slot_4', name: 'Slot 4', time: '11:30 - 12:10' },
      { id: 'slot_5', name: 'Slot 5', time: '13:35 - 14:15' },
      { id: 'slot_6', name: 'Slot 6', time: '14:20 - 15:00' }
    ];

    // Find user's scheduler enrollment
    const schedulerEnrollment = await CourseSchedulerEnrollment.findOne({ 
      learner: new mongoose.Types.ObjectId(userId) 
    });

    if (!schedulerEnrollment) {
      return NextResponse.json({
        success: true,
        data: {
          weekDate: {
            date: nextWednesday.toISOString(),
            formattedDate: formattedDate,
            weekNumber: weekNumber
          },
          courses: []
        }
      }, { status: 200 });
    }

    // Get all items for next Wednesday
    const weekItems = [];
    const courseIds = schedulerEnrollment.scheduledCourses.map(sc => sc.course);
    
    const courses = await Course.find({ 
      _id: { $in: courseIds } 
    }).select('title type backgroundColorHex iconUrl modules').lean();
    
    const courseMap = new Map();
    courses.forEach(course => {
      courseMap.set(course._id.toString(), course);
    });
    
    schedulerEnrollment.scheduledCourses.forEach(scheduledCourse => {
      const courseInfo = courseMap.get(scheduledCourse.course.toString()) || { _id: scheduledCourse.course };

      const courseItems = scheduledCourse.scheduledItems.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= startOfNextWednesday && itemDate <= endOfNextWednesday;
      });
      
      // Sort by slot ID to maintain order
      courseItems.sort((a, b) => {
        const slotA = parseInt(a.slotId.replace('slot_', ''));
        const slotB = parseInt(b.slotId.replace('slot_', ''));
        return slotA - slotB;
      });

      courseItems.forEach(item => {
        weekItems.push({
          _id: item._id,
          itemId: item.itemId,
          title: item.title,
          moduleTitle: item.moduleTitle || '',
          slotId: item.slotId,
          type: item.type || 'live',
          lessonNumber: item.lessonNumber,
          totalLessons: item.totalLessons,
          isCompleted: item.isCompleted,
          courseInfo: {
            _id: courseInfo._id,
            title: courseInfo.title || 'Unknown Course',
            backgroundColorHex: courseInfo.backgroundColorHex || '#5a975a',
            iconUrl: courseInfo.iconUrl || ''
          }
        });
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        weekDate: {
          date: nextWednesday.toISOString(),
          formattedDate: formattedDate,
          weekNumber: weekNumber
        },
        courses: weekItems
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching week preview:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch week preview'
    }, { status: 500 });
  }
}