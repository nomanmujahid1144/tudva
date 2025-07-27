import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Helper function to get the backend URL
const getBackendUrl = () => {
  return process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:3001';
};

// GET /api/favorites - Get all favorites for the current user
export async function GET(request: NextRequest) {
  // Get the authorization header from the request
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader) {
    return NextResponse.json({
      error: 'Authorization header is required',
      success: false
    }, { status: 401 });
  }

  try {
    const backendResponse = await axios.get(
      `${getBackendUrl()}/api/favorites`,
      {
        headers: {
          'Authorization': authHeader
        },
        timeout: 5000 // 5 second timeout
      }
    );

    return NextResponse.json(backendResponse.data, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching favorites from backend:', error.message);
    return NextResponse.json({
      error: error.message || 'Failed to fetch favorites',
      success: false
    }, { status: error.response?.status || 500 });
  }
}

// POST /api/favorites - Add a course to favorites
export async function POST(request: NextRequest) {
  // Get the authorization header from the request
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader) {
    return NextResponse.json({
      error: 'Authorization header is required',
      success: false
    }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json({
        error: 'Course ID is required',
        success: false
      }, { status: 400 });
    }

    const backendResponse = await axios.post(
      `${getBackendUrl()}/api/favorites`,
      { courseId },
      {
        headers: {
          'Authorization': authHeader
        },
        timeout: 5000 // 5 second timeout
      }
    );

    return NextResponse.json(backendResponse.data, { status: 201 });
  } catch (error: any) {
    console.error('Error adding to favorites from backend:', error.message);
    return NextResponse.json({
      error: error.message || 'Failed to add to favorites',
      success: false
    }, { status: error.response?.status || 500 });
  }
}
