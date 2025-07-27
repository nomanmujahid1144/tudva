import { NextResponse } from 'next/server';
import axios from 'axios';
import { getAuthHeader } from '@/utils/auth';

// Helper function to get the backend URL
const getBackendUrl = () => {
  return process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:3001';
};

export async function POST(request) {
  try {
    // Get auth token from request headers
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({
        error: 'Authentication required',
        success: false
      }, { status: 401 });
    }

    // Get the form data from the request
    const formData = await request.formData();

    // Get the video file from the form data
    const videoFile = formData.get('video');

    if (!videoFile) {
      return NextResponse.json({
        error: 'No video file provided',
        success: false
      }, { status: 400 });
    }

    // Convert the file to a buffer
    const buffer = Buffer.from(await videoFile.arrayBuffer());

    // Create a new FormData object for the backend request
    const backendFormData = new FormData();
    backendFormData.append('video', new Blob([buffer]), videoFile.name);

    console.log(`Uploading video to ${getBackendUrl()}/api/courses/upload-video`);
    console.log(`Video file name: ${videoFile.name}, size: ${buffer.length} bytes`);

    // Make request to backend
    const backendResponse = await axios.post(
      `${getBackendUrl()}/api/courses/upload-video`,
      backendFormData,
      {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'multipart/form-data'
        },
        timeout: 60000 // 60 second timeout for large uploads
      }
    );

    console.log('Backend response:', backendResponse.data);

    return NextResponse.json({
      success: true,
      url: backendResponse.data.url,
      message: 'Video uploaded successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('Error uploading video:', error.message);
    if (error.response) {
      console.error('Backend error response:', error.response.data);
      return NextResponse.json(error.response.data, { status: error.response.status });
    }
    return NextResponse.json({
      error: error.message || 'Failed to upload video',
      success: false
    }, { status: 500 });
  }
}

// Configure the API route to handle large files
export const config = {
  api: {
    bodyParser: false,
    responseLimit: '50mb',
  },
};
