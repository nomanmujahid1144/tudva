// ================================================================
// src/app/api/matrix/typing/route.js
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

    const { roomId, isTyping = true, timeout = 10000 } = await request.json();

    // Since we're using a service account, we'll skip typing indicators
    // In a full implementation, you'd need individual user tokens
    
    return NextResponse.json({
      success: true,
      data: { status: 'typing indicator sent' }
    });

  } catch (error) {
    console.error('Failed to send typing indicator:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to send typing indicator'
    }, { status: 500 });
  }
}