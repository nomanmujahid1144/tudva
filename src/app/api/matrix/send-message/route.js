// FIXED: src/app/api/matrix/send-message/route.js
import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/middlewares/authMiddleware';
import axios from 'axios';

const MATRIX_HOME_SERVER = process.env.MATRIX_HOME_SERVER || 'https://chat.151.hu';
const MATRIX_ACCESS_TOKEN = process.env.MATRIX_ACCESS_TOKEN;

/**
 * Ensure API user is in room before sending message
 */
async function ensureApiUserInRoom(roomId) {
  try {
    // Try to join the room (idempotent operation)
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
    return true;
  } catch (error) {
    console.error('Failed to join room:', error.response?.data);
    return false;
  }
}

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

    const { roomId, content, msgType = 'm.text' } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Message content is required'
      }, { status: 400 });
    }

    if (!roomId) {
      return NextResponse.json({
        success: false,
        error: 'Room ID is required'
      }, { status: 400 });
    }

    // CRITICAL FIX: Ensure API user is in room before sending
    console.log('🔄 Ensuring API user is in room before sending message...');
    const joinSuccess = await ensureApiUserInRoom(roomId);
    
    if (!joinSuccess) {
      console.error('❌ Failed to join room, attempting message send anyway...');
    }

    // Send message using service account with user attribution
    const messageBody = `${auth.user.fullName || 'User'}: ${content.trim()}`;
    
    try {
      const response = await axios.post(
        `${MATRIX_HOME_SERVER}/_matrix/client/r0/rooms/${roomId}/send/m.room.message`,
        {
          msgtype: msgType,
          body: messageBody,
          // Add custom fields to identify the real sender
          'tudva.sender_id': auth.user.id,
          'tudva.sender_name': auth.user.fullName || 'User'
        },
        {
          headers: {
            'Authorization': `Bearer ${MATRIX_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Message sent successfully');

      return NextResponse.json({
        success: true,
        data: {
          eventId: response.data.event_id,
          content: messageBody
        }
      });

    } catch (sendError) {
      console.error('❌ Failed to send message:', sendError.response?.data);
      
      // If it's a permission error, try one more time after joining
      if (sendError.response?.status === 403) {
        console.log('🔄 Permission denied, trying to rejoin room and retry...');
        
        // Force rejoin
        await ensureApiUserInRoom(roomId);
        
        // Wait a moment
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Retry message send
        try {
          const retryResponse = await axios.post(
            `${MATRIX_HOME_SERVER}/_matrix/client/r0/rooms/${roomId}/send/m.room.message`,
            {
              msgtype: msgType,
              body: messageBody,
              'tudva.sender_id': auth.user.id,
              'tudva.sender_name': auth.user.fullName || 'User'
            },
            {
              headers: {
                'Authorization': `Bearer ${MATRIX_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
              }
            }
          );

          console.log('✅ Message sent successfully on retry');

          return NextResponse.json({
            success: true,
            data: {
              eventId: retryResponse.data.event_id,
              content: messageBody
            }
          });

        } catch (retryError) {
          console.error('❌ Retry also failed:', retryError.response?.data);
          throw retryError;
        }
      } else {
        throw sendError;
      }
    }

  } catch (error) {
    console.error('Failed to send Matrix message:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to send message',
      details: error.response?.data?.errcode || error.message
    }, { status: 500 });
  }
}