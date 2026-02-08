// src/app/api/matrix/join-room/route.js
// UPDATED: Handle rate limits + retry logic + prevent duplicate invites

import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/middlewares/authMiddleware';
import axios from 'axios';

const MATRIX_HOME_SERVER = process.env.MATRIX_HOME_SERVER || 'https://matrix.151.hu';
const MATRIX_ACCESS_TOKEN = process.env.MATRIX_ACCESS_TOKEN;
const MATRIX_DOMAIN = process.env.MATRIX_DOMAIN || '151.hu';

// ✅ NEW: Helper to wait for retry
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request) {
  try {
    const auth = await authenticateRequest(request);

    if (!auth.success) {
      return NextResponse.json({
        success: false,
        error: auth.error
      }, { status: 401 });
    }

    const { roomId, userRole } = await request.json();

    // Determine correct Matrix user ID based on role
    let matrixUserId;
    
    if (userRole === 'instructor') {
      matrixUserId = `@instructor_${auth.user.id}:${MATRIX_DOMAIN}`;
      console.log('🎓 Instructor joining as:', matrixUserId);
    } else {
      matrixUserId = `@student_${auth.user.id}:${MATRIX_DOMAIN}`;
      console.log('👨‍🎓 Student joining as:', matrixUserId);
    }

    // ✅ NEW: Check if user is already in the room FIRST
    let isAlreadyMember = false;
    try {
      const membersResponse = await axios.get(
        `${MATRIX_HOME_SERVER}/_matrix/client/v3/rooms/${roomId}/joined_members`,
        {
          headers: { 'Authorization': `Bearer ${MATRIX_ACCESS_TOKEN}` }
        }
      );
      
      isAlreadyMember = membersResponse.data.joined && 
                        Object.keys(membersResponse.data.joined).includes(matrixUserId);
      
      if (isAlreadyMember) {
        console.log('✅ User already in room, skipping invite');
      }
    } catch (memberCheckError) {
      console.log('⚠️ Could not check membership:', memberCheckError.message);
    }

    // ✅ UPDATED: Only invite if NOT already a member
    if (!isAlreadyMember) {
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
        const errCode = inviteError.response?.data?.errcode;
        
        // ✅ NEW: Handle rate limit
        if (errCode === 'M_LIMIT_EXCEEDED') {
          const retryAfter = inviteError.response?.data?.retry_after_ms || 1000;
          console.log(`⏳ Rate limited, waiting ${retryAfter}ms before retry...`);
          
          // Wait for the specified time
          await wait(retryAfter);
          
          // ✅ Retry the invite once
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
            console.log('✅ User invited to room (after retry)');
          } catch (retryError) {
            // If retry also fails, just proceed - user might already be in room
            console.log('ℹ️ Retry failed, proceeding anyway');
          }
        }
        // Handle other errors
        else if (errCode === 'M_FORBIDDEN' || errCode === 'M_UNKNOWN') {
          console.log('ℹ️ User already in room or invited');
        } else {
          console.log('ℹ️ Invite error (continuing):', errCode);
        }
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

    // ✅ UPDATED: Send welcome message ONLY if NOT already a member
    if (userRole !== 'instructor' && !isAlreadyMember) {
      try {
        const txnId = Date.now();
        const roleEmoji = '🎓';
        
        await axios.put(
          `${MATRIX_HOME_SERVER}/_matrix/client/v3/rooms/${roomId}/send/m.room.message/${txnId}`,
          {
            msgtype: 'm.text',
            body: `${roleEmoji} ${auth.user.fullName || 'User'} has joined the session.`
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
        console.log('ℹ️ Welcome message failed:', messageError.message);
      }
    } else if (isAlreadyMember) {
      console.log('ℹ️ Skipping welcome message (already member)');
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
        messages: [],
        alreadyMember: isAlreadyMember
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