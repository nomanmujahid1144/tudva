// src/app/api/instructor/scheduled-sessions/route.js
// Get real scheduled sessions from CourseSchedulerEnrollment

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CourseSchedulerEnrollment from '@/models/CourseSchedulerEnrollment';
import Course from '@/models/Course';
import { authenticateRequest } from '@/middlewares/authMiddleware';

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
      // Get all scheduled sessions for instructor's courses
      const instructorCourses = await Course.find({
        instructor: auth.user.id,
        type: 'live'
      }).select('_id title');

      const courseIds = instructorCourses.map(c => c._id);

      const allScheduledSessions = await CourseSchedulerEnrollment.find({
        'scheduledCourses.course': { $in: courseIds }
      }).populate('learner', 'fullName email')
        .populate('scheduledCourses.course', 'title instructor');

      const coursesWithSessions = {};

      // Group sessions by course
      allScheduledSessions.forEach(enrollment => {
        enrollment.scheduledCourses.forEach(courseData => {
          if (courseIds.includes(courseData.course._id)) {
            const courseId = courseData.course._id.toString();
            
            if (!coursesWithSessions[courseId]) {
              coursesWithSessions[courseId] = {
                courseId,
                courseTitle: courseData.course.title,
                sessions: [],
                students: new Set(),
                nextSession: null
              };
            }

            // Add sessions
            courseData.scheduledItems.forEach(item => {
              coursesWithSessions[courseId].sessions.push({
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
              
              coursesWithSessions[courseId].students.add(enrollment.learner._id.toString());
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

        // Find current live session
        courseData.currentSession = courseData.sessions.find(s => {
          const sessionTime = new Date(s.sessionDate);
          const timeDiff = Math.abs(now - sessionTime);
          return timeDiff <= 2 * 60 * 60 * 1000; // Within 2 hours of session time
        });
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
    console.error('Error fetching scheduled sessions:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch scheduled sessions',
      details: error.message
    }, { status: 500 });
  }
}