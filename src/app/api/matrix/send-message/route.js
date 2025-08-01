// ================================================================
// src/app/api/matrix/send-message/route.js
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

    const { roomId, content, msgType = 'm.text' } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Message content is required'
      }, { status: 400 });
    }

    // Send message using service account with user attribution
    const messageBody = `${auth.user.fullName || 'User'}: ${content.trim()}`;
    
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

    return NextResponse.json({
      success: true,
      data: {
        eventId: response.data.event_id,
        content: messageBody
      }
    });

  } catch (error) {
    console.error('Failed to send Matrix message:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to send message'
    }, { status: 500 });
  }
}