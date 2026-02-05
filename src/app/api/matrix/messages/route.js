// // ================================================================
// // src/app/api/matrix/messages/route.js
// // UPDATED FOR NEW MATRIX SERVER (matrix.151.hu)

// import { NextResponse } from 'next/server';
// import { authenticateRequest } from '@/middlewares/authMiddleware';
// import axios from 'axios';

// // ✅ UPDATED: New Matrix server configuration
// const MATRIX_HOME_SERVER = process.env.MATRIX_HOME_SERVER || 'https://matrix.151.hu';
// const MATRIX_ACCESS_TOKEN = process.env.MATRIX_ACCESS_TOKEN;

// export async function POST(request) {
//   try {
//     // Authenticate request
//     const auth = await authenticateRequest(request);
//     if (!auth.success) {
//       return NextResponse.json({
//         success: false,
//         error: auth.error
//       }, { status: 401 });
//     }

//     const { roomId } = await request.json();

//     // ✅ UPDATED: Get recent messages from the room using v3 API
//     const response = await axios.get(
//       `${MATRIX_HOME_SERVER}/_matrix/client/v3/rooms/${roomId}/messages?limit=50&dir=b`, // ✅ Changed to v3
//       {
//         headers: {
//           'Authorization': `Bearer ${MATRIX_ACCESS_TOKEN}`
//         }
//       }
//     );

//     // Process and format messages
//     const messages = response.data.chunk
//       .filter(event => event.type === 'm.room.message')
//       .reverse() // Show oldest first
//       .map(event => ({
//         id: event.event_id,
//         content: event.content.body,
//         sender: event.content['tudva.sender_name'] || 'System',
//         senderId: event.content['tudva.sender_id'] || 'system',
//         timestamp: new Date(event.origin_server_ts).toISOString(),
//         type: event.content['tudva.sender_id'] ? 'user' : 'system'
//       }));

//     return NextResponse.json({
//       success: true,
//       data: {
//         messages,
//         count: messages.length
//       }
//     });

//   } catch (error) {
//     console.error('❌ Failed to fetch Matrix messages:', error);
//     return NextResponse.json({
//       success: false,
//       error: 'Failed to fetch messages'
//     }, { status: 500 });
//   }
// }

// src/app/api/matrix/messages/route.js
// FIXED: Properly extract sender name and role + FALLBACK for old messages

import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/middlewares/authMiddleware';
import axios from 'axios';

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

    // Get recent messages from the room using v3 API
    const response = await axios.get(
      `${MATRIX_HOME_SERVER}/_matrix/client/v3/rooms/${roomId}/messages?limit=50&dir=b`,
      {
        headers: {
          'Authorization': `Bearer ${MATRIX_ACCESS_TOKEN}`
        }
      }
    );

    // ✅ FIXED: Process messages with fallback for old messages
    const messages = response.data.chunk
      .filter(event => event.type === 'm.room.message')
      .reverse() // Show oldest first
      .map(event => {
        // Extract sender information from content
        let senderName = event.content['tudva.sender_name'] || 'Unknown';
        const senderId = event.content['tudva.sender_id'] || 'unknown';
        let senderRole = event.content['tudva.sender_role'];
        
        // ✅ CRITICAL FALLBACK: Handle old messages without role metadata
        if (!senderRole || senderRole === 'undefined') {
          // Try to detect from Matrix sender ID (event.sender)
          if (event.sender) {
            if (event.sender.includes('@instructor_') || event.sender.includes('instructor')) {
              senderRole = 'instructor';
              console.log('🔍 Detected instructor from sender ID:', event.sender);
            } else if (event.sender.includes('@student_')) {
              senderRole = 'student';
            } else if (event.sender.includes('@proj-admin') || event.sender.includes('nom:')) {
              senderRole = 'system';
            } else {
              senderRole = 'student'; // default
            }
          } else {
            senderRole = 'student'; // default
          }
        }
        
        // ✅ Fix sender name if it's "User"
        if (senderName === 'User' || senderName === 'Unknown') {
          // Use role-based fallback name
          senderName = senderRole === 'instructor' ? 'Instructor' : 'Student';
        }
        
        // ✅ Clean message body (remove any prefixes if present)
        let messageBody = event.content.body || '';
        
        // Remove "User: " or "Instructor: " prefix if it exists
        messageBody = messageBody.replace(/^(User|Instructor|Student):\s*/i, '');

        return {
          id: event.event_id,
          content: messageBody, // ✅ Clean message without prefix
          sender: senderName, // ✅ Actual sender name (or role-based fallback)
          senderId: senderId,
          senderRole: senderRole, // ✅ Role (instructor/student)
          timestamp: new Date(event.origin_server_ts).toISOString(),
          type: senderRole // ✅ Type based on role
        };
      });

    console.log(`✅ Retrieved ${messages.length} messages`);

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