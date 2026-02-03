// src/app/api/matrix/join-room/route.js
// FIXED: Detect user role and use correct Matrix user prefix

import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/middlewares/authMiddleware';
import axios from 'axios';

const MATRIX_HOME_SERVER = process.env.MATRIX_HOME_SERVER || 'https://matrix.151.hu';
const MATRIX_ACCESS_TOKEN = process.env.MATRIX_ACCESS_TOKEN;
const MATRIX_DOMAIN = process.env.MATRIX_DOMAIN || '151.hu';

export async function POST(request) {
  try {
    const auth = await authenticateRequest(request);

    console.log(request.headers.get('Authorization')?.replace('Bearer ', ''));

    console.log(auth, 'AUTH')
    if (!auth.success) {
      return NextResponse.json({
        success: false,
        error: auth.error
      }, { status: 401 });
    }

    const { roomId, userRole } = await request.json();

    // ✅ FIXED: Determine correct Matrix user ID based on role
    let matrixUserId;
    
    if (userRole === 'instructor') {
      matrixUserId = `@instructor_${auth.user.id}:${MATRIX_DOMAIN}`;
      console.log('🎓 Instructor joining as:', matrixUserId);
    } else {
      matrixUserId = `@student_${auth.user.id}:${MATRIX_DOMAIN}`;
      console.log('👨‍🎓 Student joining as:', matrixUserId);
    }

    // Invite user to the room (will fail if already invited - that's ok)
    try {
      await axios.post(
        `${MATRIX_HOME_SERVER}/_matrix/client/v3/rooms/${roomId}/invite`,
        { user_id: matrixUserId },
        {
          headers: {
            'Authorization': `Bearer ${MATRIX_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ User invited to room');
    } catch (inviteError) {
      // Already invited or already in room - this is normal
      const errCode = inviteError.response?.data?.errcode;
      if (errCode === 'M_FORBIDDEN' || errCode === 'M_UNKNOWN') {
        console.log('ℹ️ User already in room or invited');
      } else {
        console.log('ℹ️ Invite error (continuing):', errCode);
      }
    }

    // Get room info
    let roomInfo = { roomName: 'Live Session', memberCount: 0 };
    try {
      const roomStateResponse = await axios.get(
        `${MATRIX_HOME_SERVER}/_matrix/client/v3/rooms/${roomId}/state`,
        {
          headers: { 'Authorization': `Bearer ${MATRIX_ACCESS_TOKEN}` }
        }
      );
      
      const roomNameEvent = roomStateResponse.data.find(e => e.type === 'm.room.name');
      if (roomNameEvent) {
        roomInfo.roomName = roomNameEvent.content.name;
      }
      console.log('✅ Room info fetched:', roomInfo.roomName);
    } catch (stateError) {
      console.log('ℹ️ Could not fetch room state');
    }

    // Send welcome message (only for students, not instructors)
    if (userRole !== 'instructor') {
      try {
        const txnId = Date.now();
        await axios.put(
          `${MATRIX_HOME_SERVER}/_matrix/client/v3/rooms/${roomId}/send/m.room.message/${txnId}`,
          {
            msgtype: 'm.text',
            body: `${auth.user.fullName || 'User'} has joined the session.`
          },
          {
            headers: {
              'Authorization': `Bearer ${MATRIX_ACCESS_TOKEN}`,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log('✅ Welcome message sent');
      } catch (messageError) {
        console.log('ℹ️ Welcome message failed');
      }
    } else {
      console.log('ℹ️ Skipping welcome message for instructor');
    }

    return NextResponse.json({
      success: true,
      data: {
        roomId,
        matrixUserId,
        userRole,
        ...roomInfo,
        messages: []
      }
    });

  } catch (error) {
    console.error('❌ Failed to join Matrix room:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to join room'
    }, { status: 500 });
  }
}