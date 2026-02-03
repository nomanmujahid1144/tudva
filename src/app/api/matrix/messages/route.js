// ================================================================
// src/app/api/matrix/messages/route.js
// UPDATED FOR NEW MATRIX SERVER (matrix.151.hu)

import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/middlewares/authMiddleware';
import axios from 'axios';

// ✅ UPDATED: New Matrix server configuration
const MATRIX_HOME_SERVER = process.env.MATRIX_HOME_SERVER || 'https://matrix.151.hu';
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

    const { roomId } = await request.json();

    // ✅ UPDATED: Get recent messages from the room using v3 API
    const response = await axios.get(
      `${MATRIX_HOME_SERVER}/_matrix/client/v3/rooms/${roomId}/messages?limit=50&dir=b`, // ✅ Changed to v3
      {
        headers: {
          'Authorization': `Bearer ${MATRIX_ACCESS_TOKEN}`
        }
      }
    );

    // Process and format messages
    const messages = response.data.chunk
      .filter(event => event.type === 'm.room.message')
      .reverse() // Show oldest first
      .map(event => ({
        id: event.event_id,
        content: event.content.body,
        sender: event.content['tudva.sender_name'] || 'System',
        senderId: event.content['tudva.sender_id'] || 'system',
        timestamp: new Date(event.origin_server_ts).toISOString(),
        type: event.content['tudva.sender_id'] ? 'user' : 'system'
      }));

    return NextResponse.json({
      success: true,
      data: {
        messages,
        count: messages.length
      }
    });

  } catch (error) {
    console.error('❌ Failed to fetch Matrix messages:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch messages'
    }, { status: 500 });
  }
}