// src/app/api/course/[courseId]/join-session/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course, { CourseType } from '@/models/Course';
import CourseSchedulerEnrollment from '@/models/CourseSchedulerEnrollment';
import User from '@/models/User';
import mongoose from 'mongoose';
import { authenticateRequest } from '@/middlewares/authMiddleware';
import axios from 'axios';

// Configure Matrix client
const MATRIX_HOME_SERVER = process.env.MATRIX_HOME_SERVER || 'https://chat.151.hu';
const MATRIX_ACCESS_TOKEN = process.env.MATRIX_ACCESS_TOKEN;

/**
 * Invite user to Matrix room
 */
async function inviteUserToRoom(roomId, userId) {
  try {
    await axios.post(
      `${MATRIX_HOME_SERVER}/_matrix/client/r0/rooms/${roomId}/invite`,
      {
        user_id: userId
      },
      {
        headers: {
          'Authorization': `Bearer ${MATRIX_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return true;
  } catch (error) {
    console.error('Error inviting user to room:', error);
    return false;
  }
}

/**
 * Send message to Matrix room
 */
async function sendMessageToRoom(roomId, message) {
  try {
    await axios.post(
      `${MATRIX_HOME_SERVER}/_matrix/client/r0/rooms/${roomId}/send/m.room.message`,
      {
        msgtype: 'm.text',
        body: message
      },
      {
        headers: {
          'Authorization': `Bearer ${MATRIX_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return true;
  } catch (error) {
    console.error('Error sending message to room:', error);
    return false;
  }
}

/**
 * POST /api/course/[courseId]/join-session
 * Allow student to join a live session
 */
export async function POST(request, { params }) {
  try {
    // Connect to the database
    await connectDB();
    
    const { courseId } = params;
    const reqBody = await request.json();
    const { itemId, slotId } = reqBody;
    
    // Validate course ID
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid course ID' 
      }, { status: 400 });
    }
    
    // Authenticate the request
    const auth = await authenticateRequest(request);
    
    if (!auth.success) {
      return NextResponse.json({ 
        success: false, 
        error: auth.error 
      }, { status: 401 });
    }
    
    // Find the course
    const course = await Course.findById(courseId);
    
    if (!course) {
      return NextResponse.json({ 
        success: false, 
        error: 'Course not found' 
      }, { status: 404 });
    }
    
    // Verify it's a live course
    if (course.type !== CourseType.LIVE) {
      return NextResponse.json({ 
        success: false, 
        error: 'This operation is only valid for live courses' 
      }, { status: 400 });
    }
    
    // Check if user is enrolled in this course
    const enrollment = await CourseSchedulerEnrollment.findOne({
      learner: new mongoose.Types.ObjectId(auth.user.id),
      'scheduledCourses.course': new mongoose.Types.ObjectId(courseId)
    });
    
    if (!enrollment) {
      return NextResponse.json({
        success: false,
        error: 'You are not enrolled in this course'
      }, { status: 403 });
    }
    
    // Find the specific scheduled item for this student
    let scheduledItem = null;
    let scheduledCourse = null;
    
    for (const course of enrollment.scheduledCourses) {
      if (course.course.toString() === courseId) {
        scheduledCourse = course;
        scheduledItem = course.scheduledItems.find(item => 
          item.itemId === itemId || item.slotId === slotId
        );
        if (scheduledItem) break;
      }
    }
    
    if (!scheduledItem) {
      return NextResponse.json({
        success: false,
        error: 'This session is not in your schedule'
      }, { status: 404 });
    }
    
    // Check if it's time to join (session should have started)
    const now = new Date();
    const sessionTime = new Date(scheduledItem.date);
    
    // Allow joining 5 minutes before session starts
    const joinAllowedTime = new Date(sessionTime.getTime() - 5 * 60 * 1000);
    
    if (now < joinAllowedTime) {
      const timeDiff = joinAllowedTime - now;
      const minutesLeft = Math.ceil(timeDiff / (1000 * 60));
      
      return NextResponse.json({
        success: false,
        error: `Session starts in ${minutesLeft} minutes. You can join 5 minutes before the session.`,
        data: {
          sessionTime: sessionTime.toISOString(),
          joinAllowedTime: joinAllowedTime.toISOString(),
          minutesUntilJoin: minutesLeft
        }
      }, { status:425 }); // 425 Too Early
    }
    
    // Check if session is too old (more than 2 hours past)
    const maxJoinTime = new Date(sessionTime.getTime() + 2 * 60 * 60 * 1000);
    
    if (now > maxJoinTime) {
      return NextResponse.json({
        success: false,
        error: 'This session has ended. You can no longer join.',
        data: {
          sessionTime: sessionTime.toISOString(),
          maxJoinTime: maxJoinTime.toISOString()
        }
      }, { status: 410 }); // 410 Gone
    }
    
    // Find the time slot in the course to get Matrix room ID
    let timeSlot = null;
    if (course.liveCourseMeta && course.liveCourseMeta.timeSlots) {
      // Try to match by slot ID first
      timeSlot = course.liveCourseMeta.timeSlots.find(slot => 
        slot.slot === scheduledItem.slotId
      );
    }
    
    if (!timeSlot || !timeSlot.matrixRoomId) {
      return NextResponse.json({
        success: false,
        error: 'Live session room has not been created yet. Please contact the instructor.'
      }, { status: 400 });
    }
    
    // Check session status
    if (timeSlot.sessionStatus === 'cancelled') {
      return NextResponse.json({
        success: false,
        error: 'This session has been cancelled.'
      }, { status: 410 });
    }
    
    // Get user information for Matrix
    const user = await User.findById(auth.user.id).select('fullName email');
    const matrixUserId = `@student_${auth.user.id}:chat.151.hu`;
    
    // Invite user to the Matrix room
    const inviteSuccess = await inviteUserToRoom(timeSlot.matrixRoomId, matrixUserId);
    
    if (!inviteSuccess) {
      return NextResponse.json({
        success: false,
        error: 'Failed to join the session room. Please try again.'
      }, { status: 500 });
    }
    
    // Send welcome message
    await sendMessageToRoom(
      timeSlot.matrixRoomId,
      `${user.fullName} has joined the session.`
    );
    
    // Return session join details
    return NextResponse.json({
      success: true,
      message: 'Successfully joined the live session',
      data: {
        roomId: timeSlot.matrixRoomId,
        sessionTitle: scheduledItem.title,
        sessionTime: sessionTime.toISOString(),
        courseTitle: course.title,
        matrixRoomUrl: `${MATRIX_HOME_SERVER}/#/room/${timeSlot.matrixRoomId}`,
        sessionStatus: timeSlot.sessionStatus || 'scheduled',
        joinedAt: new Date().toISOString(),
        user: {
          id: auth.user.id,
          name: user.fullName,
          matrixUserId
        }
      }
    });
    
  } catch (error) {
    console.error('Error joining live session:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to join live session'
    }, { status: 500 });
  }
}

/**
 * GET /api/course/[courseId]/join-session
 * Get session join information without actually joining
 */
export async function GET(request, { params }) {
  try {
    // Connect to the database
    await connectDB();
    
    const { courseId } = params;
    const url = new URL(request.url);
    const itemId = url.searchParams.get('itemId');
    const slotId = url.searchParams.get('slotId');
    
    // Validate course ID
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid course ID' 
      }, { status: 400 });
    }
    
    // Authenticate the request
    const auth = await authenticateRequest(request);
    
    if (!auth.success) {
      return NextResponse.json({ 
        success: false, 
        error: auth.error 
      }, { status: 401 });
    }
    
    // Find the course
    const course = await Course.findById(courseId);
    
    if (!course) {
      return NextResponse.json({ 
        success: false, 
        error: 'Course not found' 
      }, { status: 404 });
    }
    
    // Verify it's a live course
    if (course.type !== CourseType.LIVE) {
      return NextResponse.json({ 
        success: false, 
        error: 'This operation is only valid for live courses' 
      }, { status: 400 });
    }
    
    // Check if user is enrolled in this course
    const enrollment = await CourseSchedulerEnrollment.findOne({
      learner: new mongoose.Types.ObjectId(auth.user.id),
      'scheduledCourses.course': new mongoose.Types.ObjectId(courseId)
    });
    
    if (!enrollment) {
      return NextResponse.json({
        success: false,
        error: 'You are not enrolled in this course'
      }, { status: 403 });
    }
    
    // Find the specific scheduled item for this student
    let scheduledItem = null;
    
    for (const course of enrollment.scheduledCourses) {
      if (course.course.toString() === courseId) {
        scheduledItem = course.scheduledItems.find(item => 
          item.itemId === itemId || item.slotId === slotId
        );
        if (scheduledItem) break;
      }
    }
    
    if (!scheduledItem) {
      return NextResponse.json({
        success: false,
        error: 'This session is not in your schedule'
      }, { status: 404 });
    }
    
    // Calculate timing information
    const now = new Date();
    const sessionTime = new Date(scheduledItem.date);
    const joinAllowedTime = new Date(sessionTime.getTime() - 5 * 60 * 1000);
    const maxJoinTime = new Date(sessionTime.getTime() + 2 * 60 * 60 * 1000);
    
    const timeDiff = sessionTime - now;
    const minutesUntilSession = Math.ceil(timeDiff / (1000 * 60));
    
    const canJoinNow = now >= joinAllowedTime && now <= maxJoinTime;
    const sessionStatus = now > maxJoinTime ? 'ended' : 
                         now >= sessionTime ? 'live' : 
                         now >= joinAllowedTime ? 'ready' : 'waiting';
    
    // Find time slot for additional info
    let timeSlot = null;
    if (course.liveCourseMeta && course.liveCourseMeta.timeSlots) {
      timeSlot = course.liveCourseMeta.timeSlots.find(slot => 
        slot.slot === scheduledItem.slotId
      );
    }
    
    return NextResponse.json({
      success: true,
      data: {
        sessionTitle: scheduledItem.title,
        courseTitle: course.title,
        sessionTime: sessionTime.toISOString(),
        joinAllowedTime: joinAllowedTime.toISOString(),
        maxJoinTime: maxJoinTime.toISOString(),
        canJoinNow,
        sessionStatus,
        minutesUntilSession: minutesUntilSession > 0 ? minutesUntilSession : 0,
        hasMatrixRoom: !!(timeSlot && timeSlot.matrixRoomId),
        matrixRoomStatus: timeSlot?.sessionStatus || 'scheduled'
      }
    });
    
  } catch (error) {
    console.error('Error getting session join info:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to get session information'
    }, { status: 500 });
  }
}