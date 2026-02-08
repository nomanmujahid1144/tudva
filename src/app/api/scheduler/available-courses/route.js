// src/app/api/scheduler/available-courses/route.js
// FIXED: Prevent infinite loop in live course session calculation

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course, { CourseStatus, CourseType } from '@/models/Course';
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
    const courseType = searchParams.get('type');
    const query = searchParams.get('query') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    // Build query object for finding courses
    const queryObj = {
      status: CourseStatus.PUBLISHED,
      isDeleted: false
    };
    
    // Add type filter if specified
    if (courseType && (courseType === CourseType.LIVE || courseType === CourseType.RECORDED)) {
      queryObj.type = courseType;
    }
    
    // Add text search if query is provided
    if (query) {
      queryObj.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ];
    }
    
    // Get the user's scheduler enrollment
    const scheduler = await CourseSchedulerEnrollment.findOne({
      learner: new mongoose.Types.ObjectId(auth.user.id)
    });
    
    // Find courses with pagination
    const courses = await Course.find(queryObj)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const totalCourses = await Course.countDocuments(queryObj);
    
    // Map courses to include available lessons info
    const formattedCourses = [];
    
    for (const course of courses) {
      // Find if this course is already in the scheduler
      let scheduledItems = [];
      let scheduledItemIds = [];
      let scheduledCourse = null;
      
      if (scheduler && scheduler.scheduledCourses) {
        scheduledCourse = scheduler.scheduledCourses.find(
          sc => sc.course.toString() === course._id.toString()
        );
        
        if (scheduledCourse) {
          scheduledItems = scheduledCourse.scheduledItems;
          scheduledItemIds = scheduledItems.map(item => item.itemId);
        }
      }
      
      // Base course info
      const result = {
        _id: course._id,
        title: course.title,
        description: course.shortDescription || (course.description?.substring(0, 150) + '...'),
        type: course.type,
        backgroundColorHex: course.backgroundColorHex,
        iconUrl: course.iconUrl,
        level: course.level,
        progress: {
          scheduledCount: scheduledItemIds.length,
          totalCount: 0
        }
      };
      
      // ✅ LIVE COURSES - FIXED INFINITE LOOP
      if (course.type === CourseType.LIVE) {
        const plannedLessons = course.liveCourseMeta?.plannedLessons || 0;
        result.progress.totalCount = plannedLessons;
        
        // Skip if all sessions are already scheduled
        if (scheduledItemIds.length >= plannedLessons) {
          continue;
        }
        
        const timeSlots = course.liveCourseMeta?.timeSlots || [];
        const sessionSchedule = [];
        const startDate = course.liveCourseMeta?.startDate ? new Date(course.liveCourseMeta.startDate) : new Date();
        
        // Slot display times
        const slotTimes = {
          'slot_1': '9:00 - 9:40',
          'slot_2': '9:45 - 10:25',
          'slot_3': '10:45 - 11:25',
          'slot_4': '11:30 - 12:10',
          'slot_5': '13:35 - 14:15',
          'slot_6': '14:20 - 15:00'
        };
        
        // ✅ FIX: Calculate next Wednesday properly
        const firstWednesday = new Date(startDate);
        const currentDay = firstWednesday.getDay();
        
        // If it's Wednesday (3), use same day. Otherwise, get next Wednesday
        if (currentDay !== 3) {
          const daysTillWednesday = (3 - currentDay + 7) % 7;
          firstWednesday.setDate(firstWednesday.getDate() + daysTillWednesday);
        }
        
        // Reset to midnight
        firstWednesday.setHours(0, 0, 0, 0);
        
        // ✅ FIX: Add safety check to prevent infinite loop
        const slotsPerWeek = timeSlots.length;
        const weeksNeeded = Math.ceil(plannedLessons / Math.max(slotsPerWeek, 1)); // Prevent division by zero
        
        let sessionCount = 0;
        const maxIterations = weeksNeeded + 1; // Safety limit
        
        // ✅ FIX: Use proper loop with break conditions
        for (let week = 0; week < maxIterations && sessionCount < plannedLessons; week++) {
          const weekDate = new Date(firstWednesday);
          weekDate.setDate(weekDate.getDate() + (week * 7));
          
          // Process each time slot for this week
          for (const slot of timeSlots) {
            if (sessionCount >= plannedLessons) break; // ✅ Safety break
            
            sessionCount++;
            const sessionDate = new Date(weekDate);
            
            const session = {
              sessionNumber: sessionCount,
              sessionId: `session_${sessionCount}`,
              title: `Session ${sessionCount}`,
              date: sessionDate,
              formattedDate: sessionDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric'
              }),
              weekDay: 'wednesday',
              slotId: slot.slot,
              slotTime: slotTimes[slot.slot] || 'Unknown time',
              isScheduled: scheduledItemIds.includes(`session_${sessionCount}`),
              isFirstSession: sessionCount === 1
            };
            
            sessionSchedule.push(session);
          }
        }
        
        // Include live course meta
        result.liveCourseMeta = {
          maxEnrollment: course.liveCourseMeta?.maxEnrollment || 0,
          plannedLessons: plannedLessons,
          startDate: course.liveCourseMeta?.startDate,
          endDate: course.liveCourseMeta?.endDate,
          timeSlots: timeSlots.map(slot => ({
            weekDay: slot.weekDay,
            slot: slot.slot,
            slotTime: slotTimes[slot.slot] || 'Unknown time'
          })),
          sessionSchedule: sessionSchedule,
          remainingSessions: plannedLessons - scheduledItemIds.length,
          nextSessionNumber: scheduledItemIds.length + 1,
          isFullySchedulable: true,
          weeksOfInstruction: weeksNeeded
        };
      }
      
      // ✅ RECORDED COURSES
      if (course.type === CourseType.RECORDED) {
        // Calculate total videos
        let totalVideos = 0;
        if (course.modules) {
          course.modules.forEach(module => {
            if (module.videos) {
              totalVideos += module.videos.length;
            }
          });
        }
        
        result.progress.totalCount = totalVideos;
        
        // Skip if all videos are already scheduled
        if (scheduledItemIds.length >= totalVideos) {
          continue;
        }
        
        // Track scheduled lesson sequences
        const scheduledLessonSequences = new Set();
        let totalLessonIndex = 0;
        const itemIdToSequence = {};
        
        // Map all lessons to sequence numbers
        for (const module of course.modules) {
          if (module.videos && module.videos.length > 0) {
            for (const video of module.videos) {
              const itemId = `${module._id}/${video._id}`;
              itemIdToSequence[itemId] = ++totalLessonIndex;
            }
          }
        }
        
        // Identify scheduled sequences
        for (const itemId of scheduledItemIds) {
          const sequence = itemIdToSequence[itemId];
          if (sequence) {
            scheduledLessonSequences.add(sequence);
          }
        }
        
        // Reset and create available lessons list
        totalLessonIndex = 0;
        result.availableLessons = [];
        
        for (const module of course.modules) {
          if (module.videos && module.videos.length > 0) {
            for (const video of module.videos) {
              const itemId = `${module._id}/${video._id}`;
              const lessonSequence = ++totalLessonIndex;
              
              // Skip if already scheduled
              if (scheduledLessonSequences.has(lessonSequence)) {
                continue;
              }
              
              // Check if all previous lessons are scheduled
              const allPreviousScheduled = Array.from(Array(lessonSequence - 1).keys())
                .map(i => i + 1)
                .every(seq => scheduledLessonSequences.has(seq));
              
              result.availableLessons.push({
                id: itemId,
                type: 'recorded-lesson',
                title: video.title,
                description: video.description?.substring(0, 100) || '',
                moduleTitle: module.title,
                moduleOrder: module.order,
                duration: video.duration || 0,
                lessonNumber: lessonSequence,
                totalLessons: totalVideos,
                requiresPrevious: !allPreviousScheduled,
                isAvailable: allPreviousScheduled
              });
            }
          }
        }
      }
      
      // Only add course if it has available content
      if ((course.type === CourseType.RECORDED && result.availableLessons?.length > 0) || 
          (course.type === CourseType.LIVE && result.progress.scheduledCount < result.progress.totalCount)) {
        formattedCourses.push(result);
      }
    }
    
    // Return response
    return NextResponse.json({
      success: true,
      data: {
        courses: formattedCourses,
        pagination: {
          total: totalCourses,
          page,
          limit,
          pages: Math.ceil(totalCourses / limit)
        }
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error getting available courses:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch available courses'
    }, { status: 500 });
  }
}