// src/app/api/course/upload-peertube/route.js
import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/middlewares/authMiddleware';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '@/models/User';

/**
 * PeerTube API Helper Functions
 */

// Get PeerTube OAuth access token
const getPeerTubeAccessToken = async () => {
  try {
    // Step 1: Get OAuth client credentials
    const { client_id, client_secret } = await fetch(
      `${process.env.PEERTUBE_BASE_URL}/api/v1/oauth-clients/local`
    ).then(r => r.json());

    // Step 2: Get access token
    const response = await fetch(
      `${process.env.PEERTUBE_BASE_URL}/api/v1/users/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id,
          client_secret,
          username: process.env.PEERTUBE_USERNAME,
          password: process.env.PEERTUBE_PASSWORD,
          grant_type: 'password'
        })
      }
    );

    const data = await response.json();
    
    if (!data.access_token) {
      throw new Error('Failed to get PeerTube access token');
    }

    return data.access_token;
  } catch (error) {
    console.error('PeerTube auth error:', error);
    throw error;
  }
};

// File type validation (same as GCS)
const validateFileType = (file, fileType) => {
  const videoTypes = [
    'video/mp4',
    'video/webm', 
    'video/mov',
    'video/avi',
    'video/quicktime'
  ];
  
  const materialTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'image/jpeg',
    'image/jpg',
    'image/png'
  ];
  
  if (fileType === 'video') {
    return videoTypes.includes(file.type);
  } else if (fileType === 'material') {
    return materialTypes.includes(file.type);
  }
  
  return false;
};

// Get file size limits (same as GCS)
const getFileSizeLimit = (fileType) => {
  if (fileType === 'video') {
    return 500 * 1024 * 1024; // 500MB for videos
  } else if (fileType === 'material') {
    return 50 * 1024 * 1024; // 50MB for materials
  }
  return 10 * 1024 * 1024; // 10MB default
};

// Upload video to PeerTube
const uploadToPeerTube = async (file, fileType, userId, courseId) => {
  try {
    const accessToken = await getPeerTubeAccessToken();
    
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Prepare form data
    const FormData = (await import('form-data')).default;
    const formData = new FormData();
    
    // Generate title from filename
    const fileName = file.name.split('.').slice(0, -1).join('.');
    const title = fileName || `Course Video - ${Date.now()}`;
    
    formData.append('name', title);
    formData.append('channelId', process.env.PEERTUBE_CHANNEL_ID);
    formData.append('videofile', buffer, {
      filename: file.name,
      contentType: file.type
    });
    formData.append('privacy', '2'); // 2 = Unlisted (only people with link)
    formData.append('category', '15'); // 15 = Education
    formData.append('language', 'en');
    
    // Add tags
    formData.append('tags[0]', 'tudva');
    formData.append('tags[1]', 'course');
    formData.append('tags[2]', 'education');
    
    console.log('📤 Uploading to PeerTube:', {
      filename: file.name,
      size: file.size,
      type: file.type,
      title
    });

    // Upload to PeerTube using axios (better form-data support than fetch)
    const axios = (await import('axios')).default;
    
    const response = await axios.post(
      `${process.env.PEERTUBE_BASE_URL}/api/v1/videos/upload`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          ...formData.getHeaders()
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );

    const result = response.data;
    
    console.log('✅ PeerTube upload successful:', result);
    
    // Return in same format as GCS
    const publicUrl = `${process.env.PEERTUBE_BASE_URL}/videos/embed/${result.video.uuid}`;
    
    return {
      success: true,
      url: publicUrl,
      videoId: result.video.uuid,
      videoShortId: result.video.shortUUID,
      embedUrl: publicUrl,
      watchUrl: `${process.env.PEERTUBE_BASE_URL}/videos/watch/${result.video.uuid}`,
      thumbnailUrl: result.video.thumbnailPath 
        ? `${process.env.PEERTUBE_BASE_URL}${result.video.thumbnailPath}`
        : null
    };
    
  } catch (error) {
    console.error('❌ PeerTube upload error:', error);
    throw error;
  }
};

export async function POST(request) {
  try {
    // Authenticate request (same as GCS)
    const auth = await authenticateRequest(request);
    
    if (!auth.success) {
      return NextResponse.json({
        success: false,
        error: auth.error
      }, { status: 401 });
    }
    
    // Only allow instructors to upload files (same as GCS)
    if (auth.user.role !== UserRole.INSTRUCTOR) {
      return NextResponse.json({
        success: false,
        error: 'Only instructors can upload files'
      }, { status: 403 });
    }
    
    // Get form data (same as GCS)
    const formData = await request.formData();
    const file = formData.get('file');
    const fileType = formData.get('type') || 'video'; // 'video' or 'material'
    const courseId = formData.get('courseId'); // Required for materials

    console.log('Received file:', file);
    console.log('File type:', fileType);
    console.log('Course ID:', courseId);
    
    // CRITICAL: PeerTube only accepts video files!
    // Materials (.docx, .pdf, etc.) should use GCS upload endpoint
    if (fileType === 'material') {
      return NextResponse.json({
        success: false,
        error: 'PeerTube only accepts video files. Please use /api/course/upload for course materials (PDFs, documents, etc.)'
      }, { status: 400 });
    }
    
    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file provided'
      }, { status: 400 });
    }
    
    // Validate file type parameter (same as GCS)
    if (!['video', 'material'].includes(fileType)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid file type. Must be "video" or "material"'
      }, { status: 400 });
    }
    
    // Validate courseId for materials (same as GCS)
    if (fileType === 'material' && !courseId) {
      return NextResponse.json({
        success: false,
        error: 'Course ID is required for material uploads'
      }, { status: 400 });
    }
    
    // Validate file type against allowed types (same as GCS)
    if (!validateFileType(file, fileType)) {
      const allowedTypes = fileType === 'video' 
        ? 'MP4, WebM, MOV, AVI' 
        : 'PDF, DOC, DOCX, PPT, PPTX, TXT, JPG, PNG';
        
      return NextResponse.json({
        success: false,
        error: `Invalid file format for ${fileType}. Allowed types: ${allowedTypes}`
      }, { status: 400 });
    }
    
    // Validate file size (same as GCS)
    const maxSize = getFileSizeLimit(fileType);
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      return NextResponse.json({
        success: false,
        error: `File size exceeds limit. Maximum allowed: ${maxSizeMB}MB`
      }, { status: 400 });
    }
    
    try {
      // Upload to PeerTube
      console.log('Starting PeerTube upload...');
      const uploadResult = await uploadToPeerTube(
        file,
        fileType,
        auth.user.id,
        courseId
      );
      
      console.log('✅ Upload completed successfully');
      console.log('Public URL:', uploadResult.url);
      
      // Prepare response data (same format as GCS)
      const responseData = {
        fileUrl: uploadResult.url, // PeerTube embed URL
        filename: `peertube/${uploadResult.videoId}`, // Virtual path for reference
        originalName: file.name,
        fileSize: file.size,
        fileType: fileType,
        mimeType: file.type,
        // PeerTube-specific extras
        embedUrl: uploadResult.embedUrl,
        watchUrl: uploadResult.watchUrl,
        videoId: uploadResult.videoId,
        thumbnailUrl: uploadResult.thumbnailUrl
      };
      
      // Add type-specific information (same as GCS)
      if (fileType === 'material') {
        responseData.courseId = courseId;
      }
      
      // Return success with file information (exact GCS format)
      return NextResponse.json({
        success: true,
        message: `${fileType.charAt(0).toUpperCase() + fileType.slice(1)} uploaded successfully`,
        data: responseData
      }, { status: 200 });
      
    } catch (uploadError) {
      console.error('Error during file upload:', uploadError);
      return NextResponse.json({
        success: false,
        error: 'Failed to upload file to storage'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Error in upload endpoint:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process upload request'
    }, { status: 500 });
  }
}