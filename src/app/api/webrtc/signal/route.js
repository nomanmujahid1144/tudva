// src/app/api/webrtc/signal/route.js
import { NextResponse } from 'next/server';

const sessions = new Map();
const peers = new Map();

export async function POST(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({
        error: 'Authentication required',
        success: false
      }, { status: 401 });
    }

    const { action, roomId, peerId, offer, answer, candidate, role, userId } = await request.json();

    switch (action) {
      case 'join':
        if (!sessions.has(roomId)) {
          sessions.set(roomId, { instructor: null, students: new Set() });
        }
        
        const session = sessions.get(roomId);
        
        if (role === 'instructor') {
          session.instructor = peerId;
        } else {
          session.students.add(peerId);
        }

        peers.set(peerId, { roomId, userId, role });

        return NextResponse.json({
          success: true,
          data: { session }
        });

      case 'offer':
        return NextResponse.json({
          success: true,
          data: { offer, from: peerId }
        });

      case 'answer':
        return NextResponse.json({
          success: true,
          data: { answer, from: peerId }
        });

      case 'ice-candidate':
        return NextResponse.json({
          success: true,
          data: { candidate, from: peerId }
        });

      case 'leave':
        const peerData = peers.get(peerId);
        if (peerData) {
          const sess = sessions.get(peerData.roomId);
          if (sess) {
            if (sess.instructor === peerId) {
              sess.instructor = null;
            } else {
              sess.students.delete(peerId);
            }
          }
          peers.delete(peerId);
        }

        return NextResponse.json({
          success: true,
          data: { message: 'Left session' }
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Signaling error:', error);
    return NextResponse.json({
      success: false,
      error: 'Signaling failed'
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({
        error: 'Authentication required',
        success: false
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');

    if (!roomId) {
      return NextResponse.json({
        success: false,
        error: 'Room ID required'
      }, { status: 400 });
    }

    const session = sessions.get(roomId);

    return NextResponse.json({
      success: true,
      data: {
        instructor: session?.instructor || null,
        studentCount: session?.students.size || 0
      }
    });

  } catch (error) {
    console.error('❌ Get session error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get session'
    }, { status: 500 });
  }
}