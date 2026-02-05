// src/app/api/matrix/send-message/route.js
// FINAL: Uses actual user names (John Doe, Sarah Smith, etc.)

import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/middlewares/authMiddleware';
import axios from 'axios';

const MATRIX_HOME_SERVER = process.env.MATRIX_HOME_SERVER || 'https://matrix.151.hu';
const MATRIX_ACCESS_TOKEN = process.env.MATRIX_ACCESS_TOKEN;

async function ensureApiUserInRoom(roomId) {
  try {
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
    console.log('✅ API user joined room successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to join room:', error.response?.data);
    return false;
  }
}

export async function POST(request) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.success) {
      return NextResponse.json({
        success: false,
        error: auth.error
      }, { status: 401 });
    }

    const { roomId, content, msgType = 'm.text', userId } = await request.json();

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

    // ✅ CRITICAL: Use ACTUAL user's full name from auth
    let senderRole = 'student'; // Default
    
    console.log(auth, 'auth')

    let senderName = auth.user.fullName || auth.user.email?.split('@')[0] || 'User';
    
    // Determine role from userId or auth.user.role
    if (userId && userId.includes('@instructor_')) {
      senderRole = 'instructor';
    } else if (auth.user.role === 'instructor') {
      senderRole = 'instructor';
    }

    console.log('📨 Sending message from:', senderName, `(${senderRole})`);

    await ensureApiUserInRoom(roomId);

    try {
      const txnId = Date.now();
      const response = await axios.put(
        `${MATRIX_HOME_SERVER}/_matrix/client/v3/rooms/${roomId}/send/m.room.message/${txnId}`,
        {
          msgtype: msgType,
          body: content.trim(), // ✅ Just the message
          // ✅ Metadata with REAL name
          'tudva.sender_id': auth.user.id,
          'tudva.sender_name': senderName, // ✅ "John Doe" or "Sarah Smith"
          'tudva.sender_role': senderRole   // ✅ "instructor" or "student"
        },
        {
          headers: {
            'Authorization': `Bearer ${MATRIX_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Message sent:', senderName, '->', content.substring(0, 30));

      return NextResponse.json({
        success: true,
        data: {
          eventId: response.data.event_id,
          content: content.trim(),
          senderName,
          senderRole
        }
      });

    } catch (sendError) {
      console.error('❌ Failed to send message:', sendError.response?.data);
      
      if (sendError.response?.status === 403) {
        console.log('🔄 Permission denied, retrying...');
        
        await ensureApiUserInRoom(roomId);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          const txnId = Date.now();
          const retryResponse = await axios.put(
            `${MATRIX_HOME_SERVER}/_matrix/client/v3/rooms/${roomId}/send/m.room.message/${txnId}`,
            {
              msgtype: msgType,
              body: content.trim(),
              'tudva.sender_id': auth.user.id,
              'tudva.sender_name': senderName,
              'tudva.sender_role': senderRole
            },
            {
              headers: {
                'Authorization': `Bearer ${MATRIX_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
              }
            }
          );

          console.log('✅ Message sent on retry');

          return NextResponse.json({
            success: true,
            data: {
              eventId: retryResponse.data.event_id,
              content: content.trim(),
              senderName,
              senderRole
            }
          });

        } catch (retryError) {
          console.error('❌ Retry failed:', retryError.response?.data);
          throw retryError;
        }
      } else {
        throw sendError;
      }
    }

  } catch (error) {
    console.error('❌ Matrix send message error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to send message',
      details: error.response?.data?.errcode || error.message
    }, { status: 500 });
  }
}