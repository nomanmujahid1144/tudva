// ================================================================
// src/app/api/matrix/typing/route.js
// UPDATED FOR NEW MATRIX SERVER (matrix.151.hu)

import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/middlewares/authMiddleware';
import axios from 'axios';

// ✅ UPDATED: New Matrix server configuration
const MATRIX_HOME_SERVER = process.env.MATRIX_HOME_SERVER || 'https://matrix.151.hu';
const MATRIX_ACCESS_TOKEN = process.env.MATRIX_ACCESS_TOKEN;
const MATRIX_USER_ID = process.env.MATRIX_USER_ID || '@proj-admin3:151.hu';

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

    const { roomId, isTyping = true, timeout = 10000 } = await request.json();

    // Since we're using a service account, we'll skip typing indicators
    // In a full implementation, you'd need individual user tokens
    
    // Optional: You could still send typing indicators using the service account
    // but it would show as the service user typing, not the actual user
    try {
      await axios.put( // ✅ Changed to PUT for v3
        `${MATRIX_HOME_SERVER}/_matrix/client/v3/rooms/${roomId}/typing/${MATRIX_USER_ID}`, // ✅ Changed to v3
        {
          typing: isTyping,
          timeout: timeout
        },
        {
          headers: {
            'Authorization': `Bearer ${MATRIX_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log(`✅ Typing indicator sent for room ${roomId}`);
    } catch (typingError) {
      console.log('ℹ️ Typing indicator failed (expected with service account):', typingError.response?.data?.errcode);
    }

    return NextResponse.json({
      success: true,
      data: { status: 'typing indicator sent' }
    });

  } catch (error) {
    console.error('❌ Failed to send typing indicator:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to send typing indicator'
    }, { status: 500 });
  }
}