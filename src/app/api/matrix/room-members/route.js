// src/app/api/matrix/room-members/route.js
// Get real Matrix room members (not mock data)

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

    const { roomId } = await request.json();

    if (!roomId) {
      return NextResponse.json({
        success: false,
        error: 'Room ID is required'
      }, { status: 400 });
    }

    // Get room members from Matrix
    try {
      const membersResponse = await axios.get(
        `${MATRIX_HOME_SERVER}/_matrix/client/r0/rooms/${roomId}/members`,
        {
          headers: {
            'Authorization': `Bearer ${MATRIX_ACCESS_TOKEN}`
          }
        }
      );

      // Process and format member data
      const members = membersResponse.data.chunk
        .filter(event => event.type === 'm.room.member' && event.content.membership === 'join')
        .map(event => {
          const userId = event.state_key;
          const displayName = event.content.displayname || event.state_key;
          
          // Extract user type and clean name
          let userType = 'user';
          let cleanName = displayName;
          
          if (userId.includes('instructor_')) {
            userType = 'instructor';
            cleanName = displayName.replace(/^instructor_/, '');
          } else if (userId.includes('student_')) {
            userType = 'student';  
            cleanName = displayName.replace(/^student_/, '');
          } else if (userId.includes('@nom:')) {
            userType = 'system';
            cleanName = 'System';
          }

          return {
            id: userId,
            name: cleanName || 'Unknown User',
            type: userType,
            matrixUserId: userId,
            joinedAt: new Date(event.origin_server_ts || Date.now()).toISOString(),
            isOnline: true // In a real implementation, you'd check presence
          };
        })
        .filter(member => member.type !== 'system'); // Exclude system users from display

      // Separate instructors and students
      const instructors = members.filter(m => m.type === 'instructor');
      const students = members.filter(m => m.type === 'student');

      return NextResponse.json({
        success: true,
        data: {
          members,
          instructors,
          students,
          totalCount: members.length,
          instructorCount: instructors.length,
          studentCount: students.length
        }
      });

    } catch (matrixError) {
      console.error('Failed to fetch Matrix room members:', matrixError);
      
      // If Matrix request fails, return empty but successful response
      return NextResponse.json({
        success: true,
        data: {
          members: [],
          instructors: [],
          students: [],
          totalCount: 0,
          instructorCount: 0,
          studentCount: 0,
          error: 'Could not fetch live member data'
        }
      });
    }

  } catch (error) {
    console.error('Failed to get room members:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get room members'
    }, { status: 500 });
  }
}