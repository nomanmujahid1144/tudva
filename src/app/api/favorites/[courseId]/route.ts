import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Helper function to get the backend URL
const getBackendUrl = () => {
  return process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:3001';
};

// GET /api/favorites/[courseId] - Check if a course is in favorites
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  const courseId = params.courseId;
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader) {
    return NextResponse.json({
      error: 'Authorization header is required',
      success: false,
      isFavorite: false
    }, { status: 401 });
  }

  try {
    const backendResponse = await axios.get(
      `${getBackendUrl()}/api/favorites/${courseId}`,
      {
        headers: {
          'Authorization': authHeader
        },
        timeout: 5000 // 5 second timeout
      }
    );

    return NextResponse.json(backendResponse.data, { status: 200 });
  } catch (error: any) {
    console.error('Error checking favorite status from backend:', error.message);
    return NextResponse.json({
      error: error.message || 'Failed to check favorite status',
      success: false,
      isFavorite: false
    }, { status: error.response?.status || 500 });
  }
}

// DELETE /api/favorites/[courseId] - Remove a course from favorites
export async function DELETE(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  const courseId = params.courseId;
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader) {
    return NextResponse.json({
      error: 'Authorization header is required',
      success: false
    }, { status: 401 });
  }

  try {
    const backendResponse = await axios.delete(
      `${getBackendUrl()}/api/favorites/${courseId}`,
      {
        headers: {
          'Authorization': authHeader
        },
        timeout: 5000 // 5 second timeout
      }
    );

    return NextResponse.json(backendResponse.data, { status: 200 });
  } catch (error: any) {
    console.error('Error removing from favorites from backend:', error.message);
    return NextResponse.json({
      error: error.message || 'Failed to remove from favorites',
      success: false
    }, { status: error.response?.status || 500 });
  }
}
