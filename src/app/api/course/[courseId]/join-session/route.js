// src/app/api/course/[courseId]/join-session/route.js - UPDATED FOR NEW MATRIX SERVER
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course, { CourseType } from '@/models/Course';
import CourseSchedulerEnrollment from '@/models/CourseSchedulerEnrollment';
import User from '@/models/User';
import mongoose from 'mongoose';
import { authenticateRequest } from '@/middlewares/authMiddleware';
import axios from 'axios';

// ✅ UPDATED: New Matrix server configuration
const MATRIX_HOME_SERVER = process.env.MATRIX_HOME_SERVER || 'https://matrix.151.hu';
const MATRIX_ACCESS_TOKEN = process.env.MATRIX_ACCESS_TOKEN;
const MATRIX_DOMAIN = process.env.MATRIX_DOMAIN || '151.hu';

/**
 * ✅ UPDATED: Invite user to Matrix room
 */
async function inviteUserToRoom(roomId, userId) {
  try {
    await axios.post(
      `${MATRIX_HOME_SERVER}/_matrix/client/v3/rooms/${roomId}/invite`, // ✅ Changed to v3
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
    console.error('Error inviting user to room:', error.response?.data || error.message);
    return false;
  }
}

/**
 * ✅ UPDATED: Send message to Matrix room
 */
async function sendMessageToRoom(roomId, message) {
  try {
    const txnId = Date.now(); // Transaction ID
    await axios.put(
      `${MATRIX_HOME_SERVER}/_matrix/client/v3/rooms/${roomId}/send/m.room.message/${txnId}`, // ✅ Changed to PUT with txnId
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
    console.error('Error sending message to room:', error.response?.data || error.message);
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
    
    console.log('🔄 Student join request:', {
      courseId,
      itemId,
      slotId,
      timestamp: new Date().toISOString()
    });
    
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
    
    for (const courseData of enrollment.scheduledCourses) {
      if (courseData.course.toString() === courseId) {
        scheduledCourse = courseData;
        scheduledItem = courseData.scheduledItems.find(item => 
          item._id.toString() === itemId || item.slotId === slotId
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
    
    console.log('✅ Found scheduled item:', {
      itemId: scheduledItem._id,
      title: scheduledItem.title,
      slotId: scheduledItem.slotId,
      scheduledDate: scheduledItem.date
    });
    
    // Find the time slot in the course to get Matrix room ID
    let timeSlot = null;
    if (course.liveCourseMeta && course.liveCourseMeta.timeSlots) {
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
    
    console.log('✅ Found time slot:', {
      slot: timeSlot.slot,
      sessionStatus: timeSlot.sessionStatus,
      matrixRoomId: timeSlot.matrixRoomId
    });
    
    // CRITICAL FIX: Check if session is currently LIVE first
    if (timeSlot.sessionStatus === 'live') {
      console.log('🚀 Session is LIVE - bypassing time restrictions and allowing immediate join');
      
      // Skip all timing validation - session is live, student can join
      
    } else {
      console.log('⏰ Session not live, applying time restrictions');
      
      // Only apply timing validation if session is not currently live
      const now = new Date();
      const sessionTime = new Date(scheduledItem.date);
      
      // Allow joining 5 minutes before session starts
      const joinAllowedTime = new Date(sessionTime.getTime() - 5 * 60 * 1000);
      
      if (now < joinAllowedTime) {
        const timeDiff = joinAllowedTime - now;
        const minutesLeft = Math.ceil(timeDiff / (1000 * 60));
        
        console.log('❌ Too early to join:', {
          now: now.toISOString(),
          sessionTime: sessionTime.toISOString(),
          joinAllowedTime: joinAllowedTime.toISOString(),
          minutesLeft
        });
        
        return NextResponse.json({
          success: false,
          error: `Session starts in ${minutesLeft} minutes. You can join 5 minutes before the session.`,
          data: {
            sessionTime: sessionTime.toISOString(),
            joinAllowedTime: joinAllowedTime.toISOString(),
            minutesUntilJoin: minutesLeft
          }
        }, { status: 425 }); // 425 Too Early
      }
      
      // Check if session is too old (more than 2 hours past)
      const maxJoinTime = new Date(sessionTime.getTime() + 2 * 60 * 60 * 1000);
      
      if (now > maxJoinTime) {
        console.log('❌ Session ended:', {
          now: now.toISOString(),
          sessionTime: sessionTime.toISOString(),
          maxJoinTime: maxJoinTime.toISOString()
        });
        
        return NextResponse.json({
          success: false,
          error: 'This session has ended. You can no longer join.',
          data: {
            sessionTime: sessionTime.toISOString(),
            maxJoinTime: maxJoinTime.toISOString()
          }
        }, { status: 410 }); // 410 Gone
      }
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
    const matrixUserId = `@student_${auth.user.id}:${MATRIX_DOMAIN}`; // ✅ Updated domain
    
    console.log('🔗 Inviting student to Matrix room:', {
      userId: auth.user.id,
      userName: user.fullName,
      matrixUserId,
      roomId: timeSlot.matrixRoomId
    });
    
    // Invite user to the Matrix room
    const inviteSuccess = await inviteUserToRoom(timeSlot.matrixRoomId, matrixUserId);
    
    if (!inviteSuccess) {
      console.log('❌ Failed to invite user to Matrix room');
      return NextResponse.json({
        success: false,
        error: 'Failed to join the session room. Please try again.'
      }, { status: 500 });
    }
    
    console.log('✅ User invited to Matrix room successfully');
    
    // Send welcome message
    try {
      await sendMessageToRoom(
        timeSlot.matrixRoomId,
        `🎓 ${user.fullName} has joined the session.`
      );
      console.log('✅ Welcome message sent');
    } catch (msgError) {
      console.log('⚠️ Welcome message failed, but join succeeded');
    }
    
    // Return session join details
    const joinResponse = {
      success: true,
      message: 'Successfully joined the live session',
      data: {
        roomId: timeSlot.matrixRoomId,
        sessionTitle: scheduledItem.title,
        sessionTime: new Date(scheduledItem.date).toISOString(),
        courseTitle: course.title,
        matrixRoomUrl: `${MATRIX_HOME_SERVER}/#/room/${timeSlot.matrixRoomId}`,
        sessionStatus: timeSlot.sessionStatus || 'live',
        joinedAt: new Date().toISOString(),
        user: {
          id: auth.user.id,
          name: user.fullName,
          matrixUserId
        }
      }
    };
    
    console.log('🎉 Student successfully joined session:', {
      courseTitle: course.title,
      sessionTitle: scheduledItem.title,
      studentName: user.fullName,
      roomId: timeSlot.matrixRoomId
    });
    
    return NextResponse.json(joinResponse);
    
  } catch (error) {
    console.error('💥 Error joining live session:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to join live session',
      details: error.message
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
    
    for (const courseData of enrollment.scheduledCourses) {
      if (courseData.course.toString() === courseId) {
        scheduledItem = courseData.scheduledItems.find(item => 
          item._id.toString() === itemId || item.slotId === slotId
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
    
    // Find time slot for additional info
    let timeSlot = null;
    if (course.liveCourseMeta && course.liveCourseMeta.timeSlots) {
      timeSlot = course.liveCourseMeta.timeSlots.find(slot => 
        slot.slot === scheduledItem.slotId
      );
    }
    
    // FIXED: Consider live session status in timing calculation
    const now = new Date();
    const sessionTime = new Date(scheduledItem.date);
    const joinAllowedTime = new Date(sessionTime.getTime() - 5 * 60 * 1000);
    const maxJoinTime = new Date(sessionTime.getTime() + 2 * 60 * 60 * 1000);
    
    const timeDiff = sessionTime - now;
    const minutesUntilSession = Math.ceil(timeDiff / (1000 * 60));
    
    // If session is live, student can join regardless of scheduled time
    let canJoinNow;
    let sessionStatus;
    
    if (timeSlot?.sessionStatus === 'live') {
      canJoinNow = true;
      sessionStatus = 'live';
    } else {
      canJoinNow = now >= joinAllowedTime && now <= maxJoinTime;
      sessionStatus = now > maxJoinTime ? 'ended' : 
                     now >= sessionTime ? 'ready' : 
                     now >= joinAllowedTime ? 'ready' : 'waiting';
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
        matrixRoomStatus: timeSlot?.sessionStatus || 'scheduled',
        isSessionLive: timeSlot?.sessionStatus === 'live' // Added this for debugging
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