// src/app/api/course/[courseId]/live-session/route.js - COMPLETE UPDATED VERSION
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course, { CourseType } from '@/models/Course';
import mongoose from 'mongoose';
import { authenticateRequest } from '@/middlewares/authMiddleware';
import axios from 'axios';

// ✅ UPDATED: New Matrix server configuration
const MATRIX_HOME_SERVER = process.env.MATRIX_HOME_SERVER || 'https://matrix.151.hu';
const MATRIX_ACCESS_TOKEN = process.env.MATRIX_ACCESS_TOKEN;
const MATRIX_DOMAIN = process.env.MATRIX_DOMAIN || '151.hu';
const MATRIX_USER_ID = process.env.MATRIX_USER_ID || '@proj-admin3:151.hu';

/**
 * ✅ UPDATED: Create a Matrix room for a live session with new server
 */
async function createMatrixRoom(courseName, sessionDate, instructorId) {
  try {
    console.log('🔄 Creating Matrix room for:', courseName);
    console.log('📡 Using Matrix server:', MATRIX_HOME_SERVER);

    // Step 1: Create the room with correct format
    const createResponse = await axios.post(
      `${MATRIX_HOME_SERVER}/_matrix/client/v3/createRoom`, // ✅ Changed to v3
      {
        name: `${courseName} - Live Session`,
        topic: `Live session for ${courseName} on ${sessionDate}`,
        preset: 'private_chat', // ✅ Using private_chat as per dev3.md
        visibility: 'private',
        power_level_content_override: {
          users: {
            [`@instructor_${instructorId}:${MATRIX_DOMAIN}`]: 100, // Instructor admin
            [MATRIX_USER_ID]: 100, // API user admin
          },
          users_default: 0,
          events_default: 0,
          state_default: 50,
          ban: 50,
          kick: 50,
          redact: 50,
          invite: 0,
        },
        initial_state: [
          {
            type: 'm.room.history_visibility',
            state_key: '',
            content: { history_visibility: 'joined' }
          },
          {
            type: 'm.room.join_rules',
            state_key: '',
            content: { join_rule: 'invite' }
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${MATRIX_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const roomId = createResponse.data.room_id;
    console.log('✅ Matrix room created:', roomId);

    // Step 2: Send welcome message
    try {
      const txnId = Date.now(); // Transaction ID
      await axios.put(
        `${MATRIX_HOME_SERVER}/_matrix/client/v3/rooms/${roomId}/send/m.room.message/${txnId}`,
        {
          msgtype: 'm.text',
          body: `🎓 Live session room created for "${courseName}". Session will begin when instructor starts it.`
        },
        {
          headers: {
            'Authorization': `Bearer ${MATRIX_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Welcome message sent successfully');

    } catch (msgError) {
      console.log('ℹ️ Welcome message failed (room still created):', msgError.response?.data?.errcode);
    }

    // Step 3: Invite instructor to room
    try {
      console.log('🔄 Inviting instructor to room...');

      await axios.post(
        `${MATRIX_HOME_SERVER}/_matrix/client/v3/rooms/${roomId}/invite`,
        {
          user_id: `@instructor_${instructorId}:${MATRIX_DOMAIN}`
        },
        {
          headers: {
            'Authorization': `Bearer ${MATRIX_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Instructor invited to room');

    } catch (inviteError) {
      console.log('ℹ️ Instructor invite failed (they can join later):', inviteError.response?.data?.errcode);
    }

    return {
      success: true,
      roomId,
      message: 'Room created successfully',
      matrixUrl: `${MATRIX_HOME_SERVER}/#/room/${roomId}`
    };

  } catch (error) {
    console.error('❌ Matrix room creation error:', error.response?.data || error.message);
    throw new Error(`Matrix room creation failed: ${error.response?.data?.error || error.message}`);
  }
}

/**
 * ✅ KEPT: Ensure user joins room before sending messages (from your original)
 */
async function ensureUserInRoom(roomId, userId) {
  try {
    // Try to join the room first
    await axios.post(
      `${MATRIX_HOME_SERVER}/_matrix/client/v3/rooms/${roomId}/join`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${MATRIX_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ User joined room successfully');
    return true;

  } catch (error) {
    console.error('❌ Failed to ensure user in room:', error.response?.data);
    return false;
  }
}

/**
 * ✅ UPDATED: Send message to Matrix room
 */
async function sendMessageToRoom(roomId, message, msgType = 'm.text') {
  try {
    const txnId = Date.now(); // Transaction ID

    await axios.put(
      `${MATRIX_HOME_SERVER}/_matrix/client/v3/rooms/${roomId}/send/m.room.message/${txnId}`,
      {
        msgtype: msgType,
        body: message
      },
      {
        headers: {
          'Authorization': `Bearer ${MATRIX_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Matrix message sent successfully');
    return true;
  } catch (error) {
    console.log('ℹ️ Matrix message failed (session continues):', error.response?.data?.errcode);

    // If it's a 403 (user not in room), try to join the room first
    if (error.response?.status === 403) {
      try {
        console.log('🔄 Attempting to join room first...');
        await axios.post(
          `${MATRIX_HOME_SERVER}/_matrix/client/v3/rooms/${roomId}/join`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${MATRIX_ACCESS_TOKEN}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('✅ Successfully joined room, retrying message...');

        // Retry sending the message with new transaction ID
        const retryTxnId = Date.now();
        await axios.put(
          `${MATRIX_HOME_SERVER}/_matrix/client/v3/rooms/${roomId}/send/m.room.message/${retryTxnId}`,
          {
            msgtype: msgType,
            body: message
          },
          {
            headers: {
              'Authorization': `Bearer ${MATRIX_ACCESS_TOKEN}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('✅ Message sent successfully after joining room');
        return true;
      } catch (joinError) {
        console.error('❌ Failed to join room and send message:', joinError.response?.data || joinError.message);
        return false;
      }
    }

    return false;
  }
}

// POST - Create/Manage live session
export async function POST(request, { params }) {
  try {
    await connectDB();

    const { courseId } = params;
    const reqBody = await request.json();
    const { action, slotIndex, sessionDate, recordingUrl, sessionTitle } = reqBody;

    // Validate course ID
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid course ID'
      }, { status: 400 });
    }

    // Authenticate request
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

    // Verify it's a live course and user is instructor
    if (course.type !== CourseType.LIVE) {
      return NextResponse.json({
        success: false,
        error: 'This operation is only valid for live courses'
      }, { status: 400 });
    }

    if (course.instructor.toString() !== auth.user.id) {
      return NextResponse.json({
        success: false,
        error: 'Only the instructor can manage live sessions'
      }, { status: 403 });
    }

    // Handle different actions
    switch (action) {
      case 'create-session':
        // Create Matrix room for the session
        try {
          const roomResult = await createMatrixRoom(
            course.title,
            sessionDate || new Date().toLocaleDateString(),
            auth.user.id
          );

          // FIXED: Always use the first timeSlot (index 0) instead of creating new ones
          if (!course.liveCourseMeta.timeSlots || course.liveCourseMeta.timeSlots.length === 0) {
            // If no timeSlots exist, create the first one
            course.liveCourseMeta.timeSlots = [{
              weekDay: 'wednesday',
              slot: 'slot_1',
              sessionStatus: 'scheduled'
            }];
          }

          // ALWAYS update the first timeSlot (index 0) with Matrix room info
          const timeSlot = course.liveCourseMeta.timeSlots[0];

          // Update time slot with room info
          timeSlot.matrixRoomId = roomResult.roomId;
          timeSlot.sessionDate = new Date(sessionDate || Date.now());
          timeSlot.sessionStatus = 'scheduled';

          await course.save();

          // Send welcome message to room
          await sendMessageToRoom(
            roomResult.roomId,
            `Live session room created for "${course.title}". Students will be able to join when you start the session.`
          );

          return NextResponse.json({
            success: true,
            message: 'Live session created successfully',
            data: {
              roomId: roomResult.roomId,
              matrixUrl: roomResult.matrixUrl,
              slotIndex: 0, // Always return 0 since we're updating the first slot
              sessionStatus: 'scheduled',
              sessionDate: timeSlot.sessionDate,
              courseTitle: course.title
            }
          });
        } catch (matrixError) {
          console.error('Matrix error:', matrixError);
          return NextResponse.json({
            success: false,
            error: 'Failed to create live session room',
            details: matrixError.message
          }, { status: 500 });
        }

      case 'start':
        console.log('=== START SESSION DEBUG ===');
        console.log('courseId:', courseId);
        console.log('slotIndex received:', slotIndex, 'type:', typeof slotIndex);

        // Validate course meta and time slots
        if (!course.liveCourseMeta || !course.liveCourseMeta.timeSlots || course.liveCourseMeta.timeSlots.length === 0) {
          return NextResponse.json({
            success: false,
            error: 'No sessions found. Please create a session first.',
            action: 'create_session_first'
          }, { status: 400 });
        }

        // Convert slotIndex to number and validate
        const actualSlotIndex = Number(slotIndex) || 0;

        if (actualSlotIndex >= course.liveCourseMeta.timeSlots.length) {
          return NextResponse.json({
            success: false,
            error: `Invalid slot index. Available slots: 0 to ${course.liveCourseMeta.timeSlots.length - 1}`
          }, { status: 400 });
        }

        const startTimeSlot = course.liveCourseMeta.timeSlots[actualSlotIndex];
        console.log('Selected time slot:', startTimeSlot);

        // Check if session is already live
        if (startTimeSlot.sessionStatus === 'live') {
          return NextResponse.json({
            success: true,
            message: 'Session is already live',
            data: {
              roomId: startTimeSlot.matrixRoomId,
              slotIndex: actualSlotIndex,
              sessionStatus: 'live',
              sessionStartedAt: startTimeSlot.sessionStartedAt
            }
          });
        }

        // If no Matrix room exists, create one automatically
        if (!startTimeSlot.matrixRoomId || startTimeSlot.matrixRoomId === '') {
          console.log('🔄 No Matrix room found, creating new one...');

          try {
            const roomResult = await createMatrixRoom(
              course.title,
              new Date().toLocaleDateString(),
              auth.user.id
            );

            startTimeSlot.matrixRoomId = roomResult.roomId;
            startTimeSlot.sessionDate = new Date();
            console.log('✅ New Matrix room created and assigned:', roomResult.roomId);

          } catch (roomError) {
            return NextResponse.json({
              success: false,
              error: 'Failed to create session room',
              details: roomError.message
            }, { status: 500 });
          }
        }

        // Start the session
        try {
          startTimeSlot.sessionStatus = 'live';
          startTimeSlot.sessionStartedAt = new Date();

          await course.save();
          console.log('✅ Session status updated to live');

          // Send session start announcement
          try {
            const startTxnId = Date.now();
            await axios.put(
              `${MATRIX_HOME_SERVER}/_matrix/client/v3/rooms/${startTimeSlot.matrixRoomId}/send/m.room.message/${startTxnId}`,
              {
                msgtype: 'm.text',
                body: `🔴 LIVE: "${course.title}" session has started! Welcome everyone. Feel free to ask questions in the chat.`
              },
              {
                headers: {
                  'Authorization': `Bearer ${MATRIX_ACCESS_TOKEN}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            console.log('✅ Session start announcement sent');
          } catch (msgError) {
            console.log('ℹ️ Announcement failed but session started:', msgError.response?.data?.errcode);
          }

          return NextResponse.json({
            success: true,
            message: 'Live session started successfully',
            data: {
              roomId: startTimeSlot.matrixRoomId,
              slotIndex: actualSlotIndex,
              sessionStatus: 'live',
              sessionStartedAt: startTimeSlot.sessionStartedAt,
              courseTitle: course.title,
              matrixRoomUrl: `${MATRIX_HOME_SERVER}/#/room/${startTimeSlot.matrixRoomId}`,
              roomCreated: !startTimeSlot.matrixRoomId // Indicates if new room was created
            }
          });

        } catch (error) {
          console.error('❌ Error starting session:', error);
          return NextResponse.json({
            success: false,
            error: 'Failed to start session',
            details: error.message
          }, { status: 500 });
        }

      case 'end':
        // End the session
        if (slotIndex === undefined || !course.liveCourseMeta.timeSlots[slotIndex]) {
          return NextResponse.json({
            success: false,
            error: 'Invalid slot index'
          }, { status: 400 });
        }

        const endTimeSlot = course.liveCourseMeta.timeSlots[slotIndex];

        if (endTimeSlot.sessionStatus !== 'live') {
          return NextResponse.json({
            success: false,
            error: 'Session is not currently live'
          }, { status: 400 });
        }

        endTimeSlot.recordingUrl = recordingUrl || '';
        endTimeSlot.sessionStatus = 'completed';
        endTimeSlot.sessionEndedAt = new Date();
        await course.save();

        // Announce session end
        await sendMessageToRoom(
          endTimeSlot.matrixRoomId,
          `✅ Session completed! Thank you for participating. The recording will be available shortly.`
        );

        return NextResponse.json({
          success: true,
          message: 'Live session ended and recording saved',
          data: {
            recordingUrl: endTimeSlot.recordingUrl,
            slotIndex,
            sessionStatus: 'completed',
            sessionEndedAt: endTimeSlot.sessionEndedAt
          }
        });

      case 'cancel':
        // Cancel the session
        if (slotIndex === undefined || !course.liveCourseMeta.timeSlots[slotIndex]) {
          return NextResponse.json({
            success: false,
            error: 'Invalid slot index'
          }, { status: 400 });
        }

        const cancelTimeSlot = course.liveCourseMeta.timeSlots[slotIndex];
        cancelTimeSlot.sessionStatus = 'cancelled';
        await course.save();

        if (cancelTimeSlot.matrixRoomId) {
          await sendMessageToRoom(
            cancelTimeSlot.matrixRoomId,
            `❌ This session has been cancelled. Please check the course page for updates.`
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Live session cancelled',
          data: {
            slotIndex,
            sessionStatus: 'cancelled'
          }
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Error managing live session:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to manage live session'
    }, { status: 500 });
  }
}

// GET - Get live session data
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { courseId } = params;
    const url = new URL(request.url);
    const slotIndex = url.searchParams.get('slotIndex');

    // Validate course ID
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

    // Verify it's a live course
    if (course.type !== CourseType.LIVE) {
      return NextResponse.json({
        success: false,
        error: 'This operation is only valid for live courses'
      }, { status: 400 });
    }

    // Return specific slot data if slotIndex is provided
    if (slotIndex !== null) {
      const index = parseInt(slotIndex);

      if (isNaN(index) || index < 0 || !course.liveCourseMeta.timeSlots[index]) {
        return NextResponse.json({
          success: false,
          error: 'Invalid slot index'
        }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        data: course.liveCourseMeta.timeSlots[index]
      });
    }

    // Return all live sessions data
    return NextResponse.json({
      success: true,
      data: {
        courseId: course._id,
        courseTitle: course.title,
        timeSlots: course.liveCourseMeta?.timeSlots || [],
        startDate: course.liveCourseMeta?.startDate,
        endDate: course.liveCourseMeta?.endDate,
        plannedLessons: course.liveCourseMeta?.plannedLessons || 0,
        maxEnrollment: course.liveCourseMeta?.maxEnrollment || 0
      }
    });

  } catch (error) {
    console.error('Error getting live session data:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to get live session data'
    }, { status: 500 });
  }
}