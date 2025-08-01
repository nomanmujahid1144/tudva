// ================================================================
// src/app/api/matrix/join-room/route.js
import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/middlewares/authMiddleware';
import axios from 'axios';

const MATRIX_HOME_SERVER = process.env.MATRIX_HOME_SERVER || 'https://chat.151.hu';
const MATRIX_ACCESS_TOKEN = process.env.MATRIX_ACCESS_TOKEN;

export async function POST(request) {
  try {
    // Authenticate request
    const auth = await authenticateRequest(request);
    if (!auth.success) {
      return NextResponse.json({
        success: false,
        error: auth.error
      }, { status: 401 });
    }

    const { roomId, userId } = await request.json();

    // Generate Matrix user ID for this user
    const matrixUserId = `@user_${auth.user.id}:chat.151.hu`;

    // Invite user to the room (using service account)
    try {
      await axios.post(
        `${MATRIX_HOME_SERVER}/_matrix/client/r0/rooms/${roomId}/invite`,
        {
          user_id: matrixUserId
        },
        {
          headers: {
            'Authorization': `Bearer ${MATRIX_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (inviteError) {
      // User might already be invited, continue
      console.log('User already invited or invitation failed:', inviteError.response?.data?.errcode);
    }

    // Get room info
    let roomInfo = { roomName: 'Live Session', memberCount: 0 };
    try {
      const roomStateResponse = await axios.get(
        `${MATRIX_HOME_SERVER}/_matrix/client/r0/rooms/${roomId}/state`,
        {
          headers: {
            'Authorization': `Bearer ${MATRIX_ACCESS_TOKEN}`
          }
        }
      );
      
      const roomNameEvent = roomStateResponse.data.find(event => event.type === 'm.room.name');
      if (roomNameEvent) {
        roomInfo.roomName = roomNameEvent.content.name;
      }
    } catch (stateError) {
      console.log('Could not fetch room state:', stateError.response?.data?.errcode);
    }

    // Send welcome message
    try {
      await axios.post(
        `${MATRIX_HOME_SERVER}/_matrix/client/r0/rooms/${roomId}/send/m.room.message`,
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
    } catch (messageError) {
      console.log('Welcome message failed:', messageError.response?.data?.errcode);
    }

    return NextResponse.json({
      success: true,
      data: {
        roomId,
        matrixUserId,
        ...roomInfo,
        messages: [] // Initial empty messages, will be populated by polling
      }
    });

  } catch (error) {
    console.error('Failed to join Matrix room:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to join room'
    }, { status: 500 });
  }
}