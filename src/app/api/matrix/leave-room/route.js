// ================================================================
// src/app/api/matrix/leave-room/route.js
import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/middlewares/authMiddleware';

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

    // In this proxy approach, we don't need to actually leave the room
    // since we're using a service account. Just return success.
    
    return NextResponse.json({
      success: true,
      data: { message: 'Left room successfully' }
    });

  } catch (error) {
    console.error('Failed to leave Matrix room:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to leave room'
    }, { status: 500 });
  }
}