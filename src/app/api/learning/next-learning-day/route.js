// /api/learning/next-learning-day
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

    // FIXED: Calculate next Wednesday's date properly
    const today = new Date();
    const dayOfWeek = today.getDay();
    let daysToAdd = 3 - dayOfWeek; // Wednesday is day 3
    
    // IMPORTANT FIX: Only move to next Wednesday if today is NOT Wednesday
    // or if it's Wednesday but past a certain time (optional)
    if (daysToAdd < 0) {
      // If today is Thursday-Sunday, get next Wednesday
      daysToAdd += 7;
    } else if (daysToAdd === 0) {
      // Today IS Wednesday - show today's schedule
      // Optional: You could add time-based logic here
      // For example, if it's past 6 PM, show next Wednesday:
      // const currentHour = today.getHours();
      // if (currentHour >= 18) {
      //   daysToAdd = 7;
      // }
      daysToAdd = 0; // Keep it as today (Wednesday)
    }
    // If daysToAdd > 0, it means today is Monday/Tuesday, so we keep the original value
    
    const nextWednesday = addDays(today, daysToAdd);
    const startOfNextWednesday = startOfDay(nextWednesday);
    const endOfNextWednesday = endOfDay(nextWednesday);

    // Format the date for display (DD.MM.YY format)
    const formattedDate = format(nextWednesday, 'dd.MM.yy');

    // Define the time slots
    const TIME_SLOTS = [
      { id: 'slot_1', name: 'SLOT 1', time: '9:00 - 9:40' },
      { id: 'slot_2', name: 'SLOT 2', time: '9:45 - 10:25' },
      { id: 'slot_3', name: 'SLOT 3', time: '10:45 - 11:25' },
      { id: 'slot_4', name: 'SLOT 4', time: '11:30 - 12:10' },
      { id: 'slot_5', name: 'SLOT 5', time: '13:35 - 14:15' },
      { id: 'slot_6', name: 'SLOT 6', time: '14:20 - 15:00' }
    ];

    // Find user's scheduler enrollment
    const schedulerEnrollment = await CourseSchedulerEnrollment.findOne({ 
      learner: new mongoose.Types.ObjectId(userId) 
    });

    // Return empty slots if no enrollment found
    if (!schedulerEnrollment) {
      return NextResponse.json({
        success: true,
        data: {
          nextWednesday: {
            date: nextWednesday.toISOString(),
            formattedDate: formattedDate,
            daysFromNow: daysToAdd
          },
          slots: TIME_SLOTS.map(slot => ({
            ...slot,
            isReserved: false,
            course: null
          })),
          hasScheduledCourses: false
        }
      }, { status: 200 });
    }

    // Rest of your existing code remains the same...
    const nextWednesdayItems = [];

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
      
      courseItems.forEach(item => {
        const [moduleId, videoId] = item.itemId.split('/');
        
        let videoUrl = '';
        let videoData = null;
        
        if (courseInfo.modules && moduleId && videoId) {
          const module = courseInfo.modules.find(mod => mod._id.toString() === moduleId);
          if (module && module.videos) {
            videoData = module.videos.find(vid => vid._id.toString() === videoId);
            if (videoData) {
              videoUrl = videoData.url;
            }
          }
        }

        console.log(item, 'Item')

        let joinUrl = '';
        if (item.type === 'recorded' && videoUrl) {
          joinUrl = videoUrl;
        } else if (item.type === 'live') {
          joinUrl = `/live-session/${scheduledCourse.course}/${item._id}`;
        } else {
          joinUrl = `/live-session/${scheduledCourse.course}/${item._id}`;
        }

        console.log(joinUrl, 'joinUrl')

        nextWednesdayItems.push({
          _id: item._id,
          itemId: item.itemId,
          title: item.title,
          moduleTitle: item.moduleTitle || '',
          slotId: item.slotId,
          type: item.type || 'live',
          lessonNumber: item.lessonNumber,
          totalLessons: item.totalLessons,
          isCompleted: item.isCompleted,
          joinUrl: joinUrl,
          videoUrl: videoUrl,
          videoData: videoData ? {
            duration: videoData.duration,
            thumbnailUrl: videoData.thumbnailUrl,
            materials: videoData.materials
          } : null,
          courseInfo: {
            _id: courseInfo._id,
            title: courseInfo.title || 'Unknown Course',
            backgroundColorHex: courseInfo.backgroundColorHex || '#5a975a',
            iconUrl: courseInfo.iconUrl || ''
          }
        });
      });
    });

    const slots = TIME_SLOTS.map(slot => {
      const slotItem = nextWednesdayItems.find(item => item.slotId === slot.id);
      
      return {
        ...slot,
        isReserved: !!slotItem,
        course: slotItem || null
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        nextWednesday: {
          date: nextWednesday.toISOString(),
          formattedDate: formattedDate,
          daysFromNow: daysToAdd
        },
        slots: slots,
        hasScheduledCourses: nextWednesdayItems.length > 0
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching next learning day:', error);

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json({
        success: false,
        error: `Validation error: ${validationErrors.join(', ')}`
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch next learning day'
    }, { status: 500 });
  }
}