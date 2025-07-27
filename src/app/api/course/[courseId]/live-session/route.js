// src/app/api/course/[courseId]/live-session/route.js - ENHANCED VERSION
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course, { CourseType } from '@/models/Course';
import mongoose from 'mongoose';
import { authenticateRequest } from '@/middlewares/authMiddleware';
import axios from 'axios';

// Configure Matrix client
const MATRIX_HOME_SERVER = process.env.MATRIX_HOME_SERVER || 'https://chat.151.hu';
const MATRIX_ACCESS_TOKEN = process.env.MATRIX_ACCESS_TOKEN;

/**
 * Create a Matrix room for a live session
 */
async function createMatrixRoom(courseName, sessionDate, instructorId) {
  try {
    const response = await axios.post(
      `${MATRIX_HOME_SERVER}/_matrix/client/r0/createRoom`,
      {
        name: `${courseName} - Live Session`,
        topic: `Live session for ${courseName} on ${sessionDate}`,
        preset: 'public_chat',
        visibility: 'private',
        // Configure room for education use
        power_levels: {
          users: {
            [instructorId]: 100, // Instructor has admin power
          },
          users_default: 0, // Students can only read and send messages
          events_default: 0,
          state_default: 50,
          ban: 50,
          kick: 50,
          redact: 50,
          invite: 0, // Students can't invite others
        },
        initial_state: [
          {
            type: 'm.room.guest_access',
            state_key: '',
            content: { guest_access: 'forbidden' }
          },
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

    const roomId = response.data.room_id;
    console.log('✅ Matrix room created:', roomId);

    // Automatically join the room (in case the creator isn't auto-joined)
    try {
      await axios.post(
        `${MATRIX_HOME_SERVER}/_matrix/client/r0/rooms/${roomId}/join`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${MATRIX_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Successfully joined newly created room');
    } catch (joinError) {
      console.log('ℹ️ Join room after creation (might already be joined):', joinError.response?.data?.errcode);
      // This is often normal - the creator is usually auto-joined
    }

    return roomId;
  } catch (error) {
    console.error('❌ Error creating Matrix room:', error.response?.data || error.message);
    throw new Error('Failed to create Matrix room for live session');
  }
}

/**
 * Send message to Matrix room
 */
async function sendMessageToRoom(roomId, message, msgType = 'm.text') {
  try {
    await axios.post(
      `${MATRIX_HOME_SERVER}/_matrix/client/r0/rooms/${roomId}/send/m.room.message`,
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
    console.log('ℹ️ Matrix message failed (session continues normally):', error.response?.data?.errcode);
    // console.error('❌ Error sending message to room:', error.response?.data || error.message);

    // If it's a 403 (user not in room), try to join the room first
    // if (error.response?.status === 403) {
    //   try {
    //     console.log('🔄 Attempting to join room first...');
    //     await axios.post(
    //       `${MATRIX_HOME_SERVER}/_matrix/client/r0/rooms/${roomId}/join`,
    //       {},
    //       {
    //         headers: {
    //           'Authorization': `Bearer ${MATRIX_ACCESS_TOKEN}`,
    //           'Content-Type': 'application/json'
    //         }
    //       }
    //     );

    //     console.log('✅ Successfully joined room, retrying message...');

    //     // Retry sending the message
    //     await axios.post(
    //       `${MATRIX_HOME_SERVER}/_matrix/client/r0/rooms/${roomId}/send/m.room.message`,
    //       {
    //         msgtype: msgType,
    //         body: message
    //       },
    //       {
    //         headers: {
    //           'Authorization': `Bearer ${MATRIX_ACCESS_TOKEN}`,
    //           'Content-Type': 'application/json'
    //         }
    //       }
    //     );

    //     console.log('✅ Message sent successfully after joining room');
    //     return true;
    //   } catch (joinError) {
    //     console.error('❌ Failed to join room and send message:', joinError.response?.data || joinError.message);
    //     return false;
    //   }
    // }

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
          const matrixUserId = `@instructor_${auth.user.id}:chat.151.hu`;
          const roomId = await createMatrixRoom(
            course.title,
            sessionDate || new Date().toLocaleDateString(),
            matrixUserId
          );

          // Get or create the time slot
          if (!course.liveCourseMeta.timeSlots) {
            course.liveCourseMeta.timeSlots = [];
          }

          let timeSlot;
          if (slotIndex !== undefined && course.liveCourseMeta.timeSlots[slotIndex]) {
            timeSlot = course.liveCourseMeta.timeSlots[slotIndex];
          } else {
            // Create new time slot
            timeSlot = {
              weekDay: 'wednesday', // Default, can be customized
              slot: 'slot_1', // Default, can be customized
              matrixRoomId: roomId,
              sessionDate: new Date(sessionDate || Date.now()),
              sessionStatus: 'scheduled'
            };
            course.liveCourseMeta.timeSlots.push(timeSlot);
          }

          // Update time slot with room info
          timeSlot.matrixRoomId = roomId;
          timeSlot.sessionDate = new Date(sessionDate || Date.now());
          timeSlot.sessionStatus = 'scheduled';

          await course.save();

          // Send welcome message to room
          await sendMessageToRoom(
            roomId,
            `Live session room created for "${course.title}". Students will be able to join when you start the session.`
          );

          return NextResponse.json({
            success: true,
            message: 'Live session created successfully',
            data: {
              roomId,
              slotIndex: slotIndex || course.liveCourseMeta.timeSlots.length - 1,
              sessionStatus: 'scheduled',
              sessionDate: timeSlot.sessionDate,
              courseTitle: course.title
            }
          });
        } catch (matrixError) {
          console.error('Matrix error:', matrixError);
          return NextResponse.json({
            success: false,
            error: 'Failed to create live session room'
          }, { status: 500 });
        }

      case 'start':
        console.log('=== START SESSION DEBUG ===');
        console.log('courseId:', courseId);
        console.log('slotIndex received:', slotIndex, 'type:', typeof slotIndex);
        console.log('course.liveCourseMeta exists:', !!course.liveCourseMeta);
        console.log('timeSlots array:', course.liveCourseMeta?.timeSlots);
        console.log('timeSlots length:', course.liveCourseMeta?.timeSlots?.length);

        // Check if we have liveCourseMeta and timeSlots
        if (!course.liveCourseMeta || !course.liveCourseMeta.timeSlots) {
          return NextResponse.json({
            success: false,
            error: 'No live course metadata found. Please create a session first.',
            debug: {
              hasLiveCourseMeta: !!course.liveCourseMeta,
              hasTimeSlots: !!(course.liveCourseMeta?.timeSlots)
            }
          }, { status: 400 });
        }

        // If no time slots exist, return specific error
        if (course.liveCourseMeta.timeSlots.length === 0) {
          return NextResponse.json({
            success: false,
            error: 'No time slots found. Please create a session first.',
            debug: {
              timeSlotsLength: course.liveCourseMeta.timeSlots.length
            }
          }, { status: 400 });
        }

        // Handle slotIndex - if undefined or null, use the first available slot
        let actualSlotIndex = slotIndex;
        if (actualSlotIndex === undefined || actualSlotIndex === null) {
          actualSlotIndex = 0;
          console.log('slotIndex was undefined, defaulting to 0');
        }

        // Convert to integer if it's a string
        actualSlotIndex = parseInt(actualSlotIndex);

        // Validate slot index
        if (isNaN(actualSlotIndex) || actualSlotIndex < 0 || actualSlotIndex >= course.liveCourseMeta.timeSlots.length) {
          return NextResponse.json({
            success: false,
            error: `Invalid slot index ${actualSlotIndex}. Available slots: 0 to ${course.liveCourseMeta.timeSlots.length - 1}`,
            debug: {
              providedSlotIndex: slotIndex,
              actualSlotIndex: actualSlotIndex,
              availableSlots: course.liveCourseMeta.timeSlots.length,
              isNaN: isNaN(actualSlotIndex)
            }
          }, { status: 400 });
        }

        const startTimeSlot = course.liveCourseMeta.timeSlots[actualSlotIndex];
        console.log('Selected time slot:', startTimeSlot);
        console.log('Matrix room ID:', startTimeSlot.matrixRoomId);

        // Check if the time slot has a Matrix room
        if (!startTimeSlot.matrixRoomId) {
          // Try to find any time slot with a Matrix room (fallback)
          const slotWithRoom = course.liveCourseMeta.timeSlots.find(slot => slot.matrixRoomId);

          if (slotWithRoom) {
            console.log('Found alternative slot with room:', slotWithRoom);
            // Use the slot that has a room
            actualSlotIndex = course.liveCourseMeta.timeSlots.indexOf(slotWithRoom);
            startTimeSlot.matrixRoomId = slotWithRoom.matrixRoomId;
            startTimeSlot.sessionStatus = slotWithRoom.sessionStatus || 'scheduled';
          } else {
            return NextResponse.json({
              success: false,
              error: `No Matrix room found for slot ${actualSlotIndex}. Please create a session first.`,
              debug: {
                slotIndex: actualSlotIndex,
                timeSlot: startTimeSlot,
                allTimeSlots: course.liveCourseMeta.timeSlots.map(slot => ({
                  hasRoomId: !!slot.matrixRoomId,
                  status: slot.sessionStatus,
                  roomId: slot.matrixRoomId
                }))
              }
            }, { status: 400 });
          }
        }

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

        // Start the session
        try {
          startTimeSlot.sessionStatus = 'live';
          startTimeSlot.sessionStartedAt = new Date();

          console.log('Saving course with updated time slot...');
          await course.save();
          console.log('Course saved successfully');

          // Announce session start
          console.log('Sending announcement to Matrix room...');
          const messageSuccess = await sendMessageToRoom(
            startTimeSlot.matrixRoomId,
            `🔴 LIVE: The session has started! Welcome everyone. Feel free to ask questions in the chat.`
          );
          console.log('Matrix message sent:', messageSuccess);

          console.log('=== SESSION STARTED SUCCESSFULLY ===');
          return NextResponse.json({
            success: true,
            message: 'Live session started successfully',
            data: {
              roomId: startTimeSlot.matrixRoomId,
              slotIndex: actualSlotIndex,
              sessionStatus: 'live',
              sessionStartedAt: startTimeSlot.sessionStartedAt,
              courseTitle: course.title,
              matrixIntegration: messageSuccess ? 'active' : 'room_created_messaging_pending'
            }
          });


        } catch (saveError) {
          console.error('Error saving course or sending message:', saveError);
          return NextResponse.json({
            success: false,
            error: 'Failed to start session due to database or Matrix error',
            debug: {
              error: saveError.message
            }
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

// GET - Get live session data (unchanged from previous version)
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