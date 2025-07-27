// src/app/api/course/[courseId]/live-session/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course, { CourseType } from '@/models/Course';
import mongoose from 'mongoose';
import { authenticateRequest } from '@/middlewares/authMiddleware';
import axios from 'axios';

// Configure Matrix client
const MATRIX_HOME_SERVER = process.env.MATRIX_HOME_SERVER || 'https://chat.151.hu';
const MATRIX_ACCESS_TOKEN = process.env.MATRIX_ACCESS_TOKEN;

/**
 * Create a Matrix room for a live session
 * @param {string} courseName - Name of the course
 * @param {string} sessionDate - Formatted date string for the session
 * @returns {Promise<string>} Room ID
 */
async function createMatrixRoom(courseName, sessionDate) {
  try {
    const response = await axios.post(
      `${MATRIX_HOME_SERVER}/_matrix/client/r0/createRoom`,
      {
        name: `${courseName} - Session ${sessionDate}`,
        topic: `Live session for ${courseName}`,
        preset: 'public_chat',
        visibility: 'private',
        initial_state: [
          {
            type: 'm.room.guest_access',
            state_key: '',
            content: { guest_access: 'forbidden' }
          },
          {
            type: 'm.room.history_visibility',
            state_key: '',
            content: { history_visibility: 'joined' }
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${MATRIX_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.room_id;
  } catch (error) {
    console.error('Error creating Matrix room:', error);
    throw new Error('Failed to create Matrix room for live session');
  }
}

// Handler for creating/updating a live session
export async function POST(request, { params }) {
  try {
    // Connect to the database
    await connectDB();
    
    const { courseId } = params;
    
    // Validate course ID
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid course ID' 
      }, { status: 400 });
    }
    
    // Authenticate request
    const auth = await authenticateRequest(request);
    
    if (!auth.success) {
      return NextResponse.json({ 
        success: false, 
        error: auth.error 
      }, { status: 401 });
    }
    
    // Find the course
    const course = await Course.findById(courseId);
    
    if (!course) {
      return NextResponse.json({ 
        success: false, 
        error: 'Course not found' 
      }, { status: 404 });
    }
    
    // Verify it's a live course
    if (course.type !== CourseType.LIVE) {
      return NextResponse.json({ 
        success: false, 
        error: 'This operation is only valid for live courses' 
      }, { status: 400 });
    }
    
    // Verify the user is the instructor of this course
    if (course.instructor.toString() !== auth.user.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'You do not have permission to manage this course' 
      }, { status: 403 });
    }
    
    // Parse the request body - IMPORTANT: Only read the body once
    const reqBody = await request.json();
    
    // Extract data from request body
    const { slotIndex, action, sessionDate, recordingUrl } = reqBody;
    
    // Validate slotIndex
    if (typeof slotIndex !== 'number' || slotIndex < 0 || !course.liveCourseMeta.timeSlots[slotIndex]) {
      return NextResponse.json({
        success: false,
        error: 'Invalid slot index'
      }, { status: 400 });
    }
    
    const timeSlot = course.liveCourseMeta.timeSlots[slotIndex];
    
    // Handle different actions
    switch (action) {
      case 'create':
        // Create Matrix room for the session
        try {
          const roomId = await createMatrixRoom(course.title, sessionDate);
          
          // Update time slot with room ID and session info
          timeSlot.matrixRoomId = roomId;
          timeSlot.sessionDate = new Date(sessionDate);
          timeSlot.sessionStatus = 'scheduled';
          
          await course.save();
          
          return NextResponse.json({
            success: true,
            message: 'Live session created successfully',
            data: {
              roomId,
              slotIndex,
              sessionStatus: 'scheduled'
            }
          });
        } catch (matrixError) {
          console.error('Matrix error:', matrixError);
          return NextResponse.json({
            success: false,
            error: 'Failed to create live session room'
          }, { status: 500 });
        }
      
      case 'start':
        // Start the session
        if (!timeSlot.matrixRoomId) {
          return NextResponse.json({
            success: false,
            error: 'Session room not created yet'
          }, { status: 400 });
        }
        
        timeSlot.sessionStatus = 'live';
        await course.save();
        
        return NextResponse.json({
          success: true,
          message: 'Live session started',
          data: {
            roomId: timeSlot.matrixRoomId,
            slotIndex,
            sessionStatus: 'live'
          }
        });
      
      case 'end':
        // End the session and store recording URL
        if (timeSlot.sessionStatus !== 'live') {
          return NextResponse.json({
            success: false,
            error: 'Session is not currently live'
          }, { status: 400 });
        }
        
        if (!recordingUrl) {
          return NextResponse.json({
            success: false,
            error: 'Recording URL is required'
          }, { status: 400 });
        }
        
        timeSlot.recordingUrl = recordingUrl;
        timeSlot.sessionStatus = 'completed';
        await course.save();
        
        return NextResponse.json({
          success: true,
          message: 'Live session ended and recording saved',
          data: {
            recordingUrl,
            slotIndex,
            sessionStatus: 'completed'
          }
        });
      
      case 'cancel':
        // Cancel the session
        timeSlot.sessionStatus = 'cancelled';
        await course.save();
        
        return NextResponse.json({
          success: true,
          message: 'Live session cancelled',
          data: {
            slotIndex,
            sessionStatus: 'cancelled'
          }
        });
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Error managing live session:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to manage live session'
    }, { status: 500 });
  }
}

// Handler for getting live session data
export async function GET(request, { params }) {
  try {
    // Connect to the database
    await connectDB();
    
    const { courseId } = params;
    const url = new URL(request.url);
    const slotIndex = url.searchParams.get('slotIndex');
    
    // Validate course ID
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid course ID' 
      }, { status: 400 });
    }
    
    // Authenticate request
    const auth = await authenticateRequest(request);
    
    if (!auth.success) {
      return NextResponse.json({ 
        success: false, 
        error: auth.error 
      }, { status: 401 });
    }
    
    // Find the course
    const course = await Course.findById(courseId);
    
    if (!course) {
      return NextResponse.json({ 
        success: false, 
        error: 'Course not found' 
      }, { status: 404 });
    }
    
    // Verify it's a live course
    if (course.type !== CourseType.LIVE) {
      return NextResponse.json({ 
        success: false, 
        error: 'This operation is only valid for live courses' 
      }, { status: 400 });
    }
    
    // Return specific slot data if slotIndex is provided
    if (slotIndex !== null) {
      const index = parseInt(slotIndex);
      
      if (isNaN(index) || index < 0 || !course.liveCourseMeta.timeSlots[index]) {
        return NextResponse.json({
          success: false,
          error: 'Invalid slot index'
        }, { status: 400 });
      }
      
      return NextResponse.json({
        success: true,
        data: course.liveCourseMeta.timeSlots[index]
      });
    }
    
    // Return all live sessions data
    return NextResponse.json({
      success: true,
      data: {
        timeSlots: course.liveCourseMeta.timeSlots,
        startDate: course.liveCourseMeta.startDate,
        endDate: course.liveCourseMeta.endDate,
        plannedLessons: course.liveCourseMeta.plannedLessons
      }
    });
    
  } catch (error) {
    console.error('Error getting live session data:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to get live session data'
    }, { status: 500 });
  }
}