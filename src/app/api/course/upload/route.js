// src/app/api/course/upload/route.js
import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';
import { authenticateRequest } from '@/middlewares/authMiddleware';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '@/models/User';

// Configure formidable to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// Initialize Google Cloud Storage
const initializeStorage = () => {
  try {
    const credentials = {
      type: "service_account",
      project_id: process.env.NEXT_PUBLIC_GCS_PROJECT_ID || "tudva-storage",
      private_key: process.env.NEXT_PUBLIC_GCS_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.NEXT_PUBLIC_GCS_CLIENT_EMAIL,
    };

    const storage = new Storage({
      credentials,
      projectId: process.env.NEXT_PUBLIC_GCS_PROJECT_ID || "tudva-storage"
    });

    return storage;
  } catch (error) {
    console.error('Failed to initialize Google Cloud Storage:', error);
    return null;
  }
};

// File type validation
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

// Get file size limits based on type
const getFileSizeLimit = (fileType) => {
  if (fileType === 'video') {
    return 500 * 1024 * 1024; // 500MB for videos
  } else if (fileType === 'material') {
    return 50 * 1024 * 1024; // 50MB for materials
  }
  return 10 * 1024 * 1024; // 10MB default
};

// Generate file path based on type
const generateFilePath = (fileType, userId, courseId, fileExtension) => {
  const timestamp = Date.now();
  const uuid = uuidv4();
  
  if (fileType === 'video') {
    // videos/userId/timestamp-uuid.ext
    return `videos/${userId}/${timestamp}-${uuid}.${fileExtension}`;
  } else if (fileType === 'material') {
    // materials/courseId/timestamp-uuid.ext
    return `materials/${courseId}/${timestamp}-${uuid}.${fileExtension}`;
  }
  
  // Default fallback
  return `uploads/${userId}/${timestamp}-${uuid}.${fileExtension}`;
};

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
    
    // Only allow instructors to upload files
    if (auth.user.role !== UserRole.INSTRUCTOR) {
      return NextResponse.json({
        success: false,
        error: 'Only instructors can upload files'
      }, { status: 403 });
    }
    
    // Initialize Google Cloud Storage
    const storage = initializeStorage();
    if (!storage) {
      return NextResponse.json({
        success: false,
        error: 'Failed to initialize storage service'
      }, { status: 500 });
    }
    
    // Get bucket
    const bucketName = process.env.NEXT_PUBLIC_GCS_BUCKET_NAME || 'tudva-course-videos';
    
    // Check if bucket exists, create it if it doesn't
    let bucket;
    try {
      bucket = storage.bucket(bucketName);
      const [exists] = await bucket.exists();
      
      if (!exists) {
        console.log(`Bucket ${bucketName} does not exist, creating it...`);
        await storage.createBucket(bucketName, {
          location: 'us-central1',
          storageClass: 'STANDARD'
        });
        console.log(`Bucket ${bucketName} created successfully`);
      }
    } catch (error) {
      console.error('Error checking/creating bucket:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to access or create storage bucket'
      }, { status: 500 });
    }
    
    // Get form data
    const formData = await request.formData();
    const file = formData.get('file');
    const fileType = formData.get('type') || 'video'; // 'video' or 'material'
    const courseId = formData.get('courseId'); // Required for materials

    console.log('Received file:', file);
    console.log('File type:', fileType);
    console.log('Course ID:', courseId);
    
    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file provided'
      }, { status: 400 });
    }
    
    // Validate file type parameter
    if (!['video', 'material'].includes(fileType)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid file type. Must be "video" or "material"'
      }, { status: 400 });
    }
    
    // Validate courseId for materials
    if (fileType === 'material' && !courseId) {
      return NextResponse.json({
        success: false,
        error: 'Course ID is required for material uploads'
      }, { status: 400 });
    }
    
    // Validate file type against allowed types
    if (!validateFileType(file, fileType)) {
      const allowedTypes = fileType === 'video' 
        ? 'MP4, WebM, MOV, AVI' 
        : 'PDF, DOC, DOCX, PPT, PPTX, TXT, JPG, PNG';
        
      return NextResponse.json({
        success: false,
        error: `Invalid file format for ${fileType}. Allowed types: ${allowedTypes}`
      }, { status: 400 });
    }
    
    // Validate file size
    const maxSize = getFileSizeLimit(fileType);
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      return NextResponse.json({
        success: false,
        error: `File size exceeds limit. Maximum allowed: ${maxSizeMB}MB`
      }, { status: 400 });
    }
    
    // Generate file path based on type
    const fileExtension = file.name.split('.').pop();
    const filePath = generateFilePath(fileType, auth.user.id, courseId, fileExtension);
    
    // Create a file reference in the bucket
    const fileRef = bucket.file(filePath);
    
    // Get file buffer from FormData
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Prepare metadata
    const metadata = {
      contentType: file.type,
      metadata: {
        originalName: file.name,
        uploadedBy: auth.user.id,
        fileType: fileType,
        uploadedAt: new Date().toISOString()
      }
    };
    
    // Add courseId to metadata for materials
    if (fileType === 'material' && courseId) {
      metadata.metadata.courseId = courseId;
    }
    
    try {
      // Upload the file
      await fileRef.save(buffer, metadata);
      
      // Make the file publicly accessible
      await fileRef.makePublic();
      
      // Get the public URL
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${filePath}`;
      
      // Prepare response data
      const responseData = {
        fileUrl: publicUrl,
        filename: filePath,
        originalName: file.name,
        fileSize: file.size,
        fileType: fileType,
        mimeType: file.type
      };
      
      // Add type-specific information
      if (fileType === 'material') {
        responseData.courseId = courseId;
      }
      
      // Return success with file information
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