// FIXED: src/app/api/instructor/scheduled-sessions/route.js
// Fixed course ID matching and data structure

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CourseSchedulerEnrollment from '@/models/CourseSchedulerEnrollment';
import Course from '@/models/Course';
import { authenticateRequest } from '@/middlewares/authMiddleware';
import mongoose from 'mongoose';

export async function GET(request) {
  try {
    await connectDB();

    // Authenticate request
    const auth = await authenticateRequest(request);
    if (!auth.success) {
      return NextResponse.json({
        success: false,
        error: auth.error
      }, { status: 401 });
    }

    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (courseId) {
      // Get scheduled sessions for specific course
      const scheduledSessions = await CourseSchedulerEnrollment.find({
        'scheduledCourses.course': courseId
      }).populate('learner', 'fullName email')
        .populate('scheduledCourses.course', 'title instructor');

      const sessionsData = [];

      scheduledSessions.forEach(enrollment => {
        const courseData = enrollment.scheduledCourses.find(
          sc => sc.course._id.toString() === courseId
        );

        if (courseData) {
          courseData.scheduledItems.forEach(item => {
            sessionsData.push({
              sessionId: item.itemId,
              sessionTitle: item.title,
              sessionDate: item.date,
              slotId: item.slotId,
              isCompleted: item.isCompleted,
              completedAt: item.completedAt,
              studentName: enrollment.learner.fullName,
              studentEmail: enrollment.learner.email,
              studentId: enrollment.learner._id
            });
          });
        }
      });

      // Sort by date
      sessionsData.sort((a, b) => new Date(a.sessionDate) - new Date(b.sessionDate));

      return NextResponse.json({
        success: true,
        data: {
          courseId,
          sessions: sessionsData,
          totalStudents: scheduledSessions.length,
          nextSession: sessionsData.find(s => !s.isCompleted && new Date(s.sessionDate) > new Date())
        }
      });

    } else {
      // FIXED: Get all scheduled sessions for instructor's courses
      const instructorCourses = await Course.find({
        instructor: auth.user.id,
        type: 'live'
      }).select('_id title');

      // FIXED: Convert ObjectIds to strings for proper matching
      const courseIds = instructorCourses.map(c => c._id.toString());
      const courseObjectIds = instructorCourses.map(c => c._id);

      // FIXED: Search using both string and ObjectId formats
      const allScheduledSessions = await CourseSchedulerEnrollment.find({
        $or: [
          { 'scheduledCourses.course': { $in: courseObjectIds } },
          { 'scheduledCourses.course': { $in: courseIds } }
        ]
      }).populate('learner', 'fullName email')
        .populate('scheduledCourses.course', 'title instructor');

      const coursesWithSessions = {};

      // Group sessions by course
      allScheduledSessions.forEach(enrollment => {
        
        enrollment.scheduledCourses.forEach(courseData => {
          const courseIdStr = courseData.course._id.toString();
          
          if (courseIds.includes(courseIdStr)) {
            if (!coursesWithSessions[courseIdStr]) {
              coursesWithSessions[courseIdStr] = {
                courseId: courseIdStr,
                courseTitle: courseData.course.title,
                sessions: [],
                students: new Set(),
                nextSession: null
              };
            }

            // Add sessions
            courseData.scheduledItems.forEach(item => {
              coursesWithSessions[courseIdStr].sessions.push({
                sessionId: item.itemId,
                sessionTitle: item.title,
                sessionDate: item.date,
                slotId: item.slotId,
                isCompleted: item.isCompleted,
                completedAt: item.completedAt,
                studentName: enrollment.learner.fullName,
                studentEmail: enrollment.learner.email,
                studentId: enrollment.learner._id
              });
              
              coursesWithSessions[courseIdStr].students.add(enrollment.learner._id.toString());
            });
          }
        });
      });

      // Process each course to find next session and sort
      Object.keys(coursesWithSessions).forEach(courseId => {
        const courseData = coursesWithSessions[courseId];
        
        // Convert Set to count
        courseData.totalStudents = courseData.students.size;
        delete courseData.students;

        // Sort sessions by date
        courseData.sessions.sort((a, b) => new Date(a.sessionDate) - new Date(b.sessionDate));

        // Find next upcoming session
        const now = new Date();
        courseData.nextSession = courseData.sessions.find(s => 
          !s.isCompleted && new Date(s.sessionDate) > now
        );
      });

      return NextResponse.json({
        success: true,
        data: {
          courses: Object.values(coursesWithSessions),
          totalCourses: Object.keys(coursesWithSessions).length
        }
      });
    }

  } catch (error) {
    console.error('💥 Error fetching scheduled sessions:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch scheduled sessions',
      details: error.message
    }, { status: 500 });
  }
}