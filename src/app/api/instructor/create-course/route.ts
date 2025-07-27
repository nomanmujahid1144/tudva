import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Helper function to get the backend URL
const getBackendUrl = () => {
  return process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:3001';
};

// POST /api/instructor/create-course - Create a new course
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
    
    // Validate required fields
    const requiredFields = ['title', 'shortDesription', 'category', 'level', 'language', 'modulesCount', 'description'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({
          error: `${field} is required`,
          success: false
        }, { status: 400 });
      }
    }

    console.log('Sending course data to backend:', JSON.stringify(body, null, 2));

    // Make request to backend
    const backendResponse = await axios.post(
      `${getBackendUrl()}/api/courses`,
      body,
      {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      }
    );

    console.log('Backend response:', backendResponse.data);

    return NextResponse.json(backendResponse.data, { status: 201 });
  } catch (error: any) {
    console.error('Error creating course:', error.message);
    if (error.response) {
      console.error('Backend error response:', error.response.data);
    }
    return NextResponse.json({
      error: error.response?.data?.message || error.message || 'Failed to create course',
      success: false
    }, { status: error.response?.status || 500 });
  }
}
