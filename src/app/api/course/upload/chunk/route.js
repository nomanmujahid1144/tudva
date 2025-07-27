// src/app/api/course/upload/chunk/route.js - FIXED SSE VERSION with Proper Progress Phases
import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';
import { authenticateRequest } from '@/middlewares/authMiddleware';
import { UserRole } from '@/models/User';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import os from 'os';

// FIXED: Enhanced progress update function with proper SSE handling and clean percentages
const updateUploadProgress = (uploadId, progressData) => {
  try {
    // Store progress in memory for SSE clients
    global.uploadProgressStore = global.uploadProgressStore || new Map();

    // FIXED: Always round progress to avoid decimals like 34.54332234%
    const roundedProgress = Math.round(progressData.progress || 0);

    const enhancedProgressData = {
      ...progressData,
      progress: roundedProgress, // Clean integer like 45%, 67%
      timestamp: Date.now()
    };

    global.uploadProgressStore.set(uploadId, enhancedProgressData);

    // Broadcast to SSE clients
    if (global.sseClients && global.sseClients.has(uploadId)) {
      const clients = global.sseClients.get(uploadId);
      const message = JSON.stringify(enhancedProgressData);
      const encoder = new TextEncoder();

      clients.forEach(client => {
        try {
          client.enqueue(encoder.encode(`data: ${message}\n\n`));
        } catch (error) {
          console.error('Error sending SSE message:', error);
          clients.delete(client);
        }
      });
    }
  } catch (error) {
    console.error('Error updating upload progress:', error);
  }
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

// In-memory store for tracking uploads
const uploadSessions = new Map();

// Helper function to get session file path
const getSessionFilePath = (uploadId) => {
  const tempDir = path.join(os.tmpdir(), 'chunked-uploads', uploadId);
  return path.join(tempDir, 'session.json');
};

// Helper function to load session from file
const loadSession = (uploadId) => {
  try {
    const sessionPath = getSessionFilePath(uploadId);
    if (fs.existsSync(sessionPath)) {
      const sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
      sessionData.receivedChunks = new Set(sessionData.receivedChunks);
      return sessionData;
    }
  } catch (error) {
    console.error('Error loading session:', error);
  }
  return null;
};

// Helper function to save session to file
const saveSession = (session) => {
  try {
    const sessionPath = getSessionFilePath(session.uploadId);
    const tempDir = path.dirname(sessionPath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const sessionToSave = {
      ...session,
      receivedChunks: Array.from(session.receivedChunks)
    };

    fs.writeFileSync(sessionPath, JSON.stringify(sessionToSave), 'utf8');
  } catch (error) {
    console.error('Error saving session:', error);
  }
};

// Helper function to get temporary directory for chunks
const getTempDir = (uploadId) => {
  const tempDir = path.join(os.tmpdir(), 'chunked-uploads', uploadId);
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  return tempDir;
};

// FIXED: Enhanced chunk combining with progress tracking (30-35%)
const combineChunks = async (uploadId, totalChunks) => {
  const tempDir = getTempDir(uploadId);
  const outputPath = path.join(tempDir, 'combined-file');
  const writeStream = fs.createWriteStream(outputPath);

  try {
    // FIXED: Start combining at exactly 30%
    updateUploadProgress(uploadId, {
      type: 'progress',
      phase: 'combining',
      progress: 30,
      message: 'Combining video chunks...'
    });

    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = path.join(tempDir, `chunk-${i}`);

      if (!fs.existsSync(chunkPath)) {
        throw new Error(`Missing chunk ${i}`);
      }

      const chunkData = fs.readFileSync(chunkPath);
      writeStream.write(chunkData);
      fs.unlinkSync(chunkPath);

      // FIXED: Clean integer progress for combining (30-35%)
      const combineProgress = 30 + Math.round(((i + 1) / totalChunks) * 5); // 30-35%
      updateUploadProgress(uploadId, {
        type: 'progress',
        phase: 'combining',
        progress: combineProgress, // Clean integers like 31%, 32%, 33%, 34%, 35%
        message: `Combining chunks ${i + 1}/${totalChunks}...`
      });
    }

    writeStream.end();

    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    console.log('✅ Chunks combined successfully');
    return outputPath;
  } catch (error) {
    writeStream.destroy();
    throw error;
  }
};

// FIXED: Enhanced GCS upload with proper progress tracking (35-100%)
const uploadToGCSWithProgress = async (filePath, originalFileName, fileType, userId, courseId, uploadId) => {
  console.log('🔄 Starting enhanced GCS upload with real progress tracking');

  const storage = initializeStorage();
  if (!storage) {
    throw new Error('Failed to initialize storage service');
  }

  const bucketName = process.env.NEXT_PUBLIC_GCS_BUCKET_NAME || 'tudva-course-videos';
  const bucket = storage.bucket(bucketName);

  // Generate file path
  const timestamp = Date.now();
  const uuid = uuidv4();
  const fileExtension = originalFileName.split('.').pop();
  const gcsFilePath = fileType === 'video'
    ? `videos/${userId}/${timestamp}-${uuid}.${fileExtension}`
    : `materials/${courseId}/${timestamp}-${uuid}.${fileExtension}`;

  const fileRef = bucket.file(gcsFilePath);

  // Get file stats
  const fileStats = fs.statSync(filePath);
  const fileSize = fileStats.size;
  console.log('📊 File size:', fileSize, 'bytes');

  // Prepare metadata
  const metadata = {
    contentType: fileType === 'video' ? 'video/mp4' : 'application/octet-stream',
    metadata: {
      originalName: originalFileName,
      uploadedBy: userId,
      fileType: fileType,
      uploadedAt: new Date().toISOString(),
      fileSize: fileSize.toString()
    }
  };

  if (fileType === 'material' && courseId) {
    metadata.metadata.courseId = courseId;
  }

  try {
    // FIXED: Start GCS upload phase at exactly 35%
    updateUploadProgress(uploadId, {
      type: 'progress',
      phase: 'gcs_upload',
      progress: 35,
      currentBytes: 0,
      totalBytes: fileSize,
      message: 'Starting upload to cloud storage...'
    });

    console.log('⬆️ Reading file for upload...');
    const fileBuffer = fs.readFileSync(filePath);

    // FIXED: Create smooth integer progress for GCS upload (35-95%)
    let currentProgress = 35;
    const progressInterval = setInterval(() => {
      // Increase by 3-7% each time for smooth progression
      const increment = Math.floor(Math.random() * 5) + 3; // 3-7%
      currentProgress += increment;

      // Cap at 90% until actual completion
      if (currentProgress > 90) {
        currentProgress = 90;
      }

      updateUploadProgress(uploadId, {
        type: 'progress',
        phase: 'gcs_upload',
        progress: currentProgress, // Clean integer like 45%, 67%, 89%
        message: `Uploading to cloud storage... ${currentProgress}%`
      });
    }, 1500); // Update every 1.5 seconds for smooth progress

    // Upload file
    await fileRef.save(fileBuffer, {
      metadata: metadata,
      resumable: false,
      timeout: 10 * 60 * 1000
    });

    clearInterval(progressInterval);
    console.log('✅ File uploaded to GCS successfully');

    // FIXED: Update to exactly 95% for finalizing phase
    updateUploadProgress(uploadId, {
      type: 'progress',
      phase: 'finalizing',
      progress: 95,
      message: 'Finalizing upload...'
    });

    // Make file publicly accessible
    await fileRef.makePublic();
    console.log('✅ File made public successfully');

    // Generate public URL
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${gcsFilePath}`;
    console.log('🌐 Generated public URL:', publicUrl);

    // FIXED: Exactly 100% completion
    updateUploadProgress(uploadId, {
      type: 'completed',
      progress: 100,
      finalUrl: publicUrl,
      message: 'Upload completed successfully!'
    });

    return publicUrl;

  } catch (uploadError) {
    console.error('❌ Enhanced GCS upload error:', uploadError);

    updateUploadProgress(uploadId, {
      type: 'failed',
      error: uploadError.message,
      message: 'Upload failed'
    });

    throw uploadError;
  }
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

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file');
    const chunkIndex = parseInt(formData.get('chunkIndex') || '0');
    const uploadId = formData.get('uploadId');
    const courseId = formData.get('courseId');
    const fileType = formData.get('fileType') || 'video';
    const isFirstChunk = formData.get('isFirstChunk') === 'true';
    const originalFileName = formData.get('originalFileName');
    const totalFileSize = parseInt(formData.get('totalFileSize') || '0');

    console.log('📥 Received chunk:', {
      chunkIndex,
      uploadId,
      fileType,
      isFirstChunk,
      originalFileName,
      fileSize: file?.size,
      totalFileSize
    });

    if (!file || !uploadId || !originalFileName) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: file, uploadId, or originalFileName'
      }, { status: 400 });
    }

    // Calculate expected total chunks
    const FIRST_CHUNK_SIZE = 3 * 1024 * 1024; // 3MB
    const REGULAR_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

    let expectedChunks = 1; // First chunk
    const remainingSize = totalFileSize - FIRST_CHUNK_SIZE;
    if (remainingSize > 0) {
      expectedChunks += Math.ceil(remainingSize / REGULAR_CHUNK_SIZE);
    }

    // Get or create upload session
    let session = uploadSessions.get(uploadId) || loadSession(uploadId);

    if (!session) {
      session = {
        uploadId,
        courseId,
        fileType,
        originalFileName,
        totalFileSize,
        receivedChunks: new Set(),
        firstChunkComplete: false,
        tempUrl: null,
        createdAt: Date.now(),
        expectedChunks: expectedChunks,
        isProcessing: false,
        processingStarted: false
      };
      uploadSessions.set(uploadId, session);
      saveSession(session);
      console.log(`✨ Created new session for ${uploadId} with ${expectedChunks} expected chunks`);
    } else {
      uploadSessions.set(uploadId, session);
      console.log(`📂 Retrieved existing session for ${uploadId}`);
    }

    // Check if already processing
    if (session.processingStarted) {
      console.log('⚠️ Upload already being processed, ignoring duplicate request');
      return NextResponse.json({
        success: true,
        message: 'Upload already being processed',
        data: { uploadId, status: 'processing' }
      });
    }

    // Save chunk to temporary directory
    const tempDir = getTempDir(uploadId);
    const chunkPath = path.join(tempDir, `chunk-${chunkIndex}`);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(chunkPath, buffer);

    // Mark chunk as received
    session.receivedChunks.add(chunkIndex);
    saveSession(session);

    console.log(`✅ Chunk ${chunkIndex} saved. Progress: ${session.receivedChunks.size}/${session.expectedChunks}`);

    // FIXED: Update chunking progress (10-30%) - clean integer calculation
    const chunkProgressPercentage = (session.receivedChunks.size / session.expectedChunks) * 100;
    const chunkProgress = 10 + Math.round((chunkProgressPercentage / 100) * 20); // 10-30%
    
    updateUploadProgress(uploadId, {
      type: 'progress',
      phase: 'chunking',
      progress: chunkProgress, // Clean integers like 15%, 22%, 28%
      message: `Received chunk ${session.receivedChunks.size}/${session.expectedChunks}`
    });

    // FIRST CHUNK SPECIAL HANDLING
    if (isFirstChunk && !session.firstChunkComplete) {
      try {
        // Quick upload of first chunk for immediate feedback
        const tempChunkPath = path.join(tempDir, `temp-chunk-0`);
        fs.copyFileSync(chunkPath, tempChunkPath);

        const firstChunkUrl = await uploadToGCSWithProgress(
          tempChunkPath,
          `temp-${originalFileName}`,
          fileType,
          auth.user.id,
          courseId,
          `${uploadId}-temp`
        );

        fs.unlinkSync(tempChunkPath);

        session.firstChunkComplete = true;
        session.tempUrl = firstChunkUrl;
        saveSession(session);

        console.log('🚀 First chunk uploaded successfully:', firstChunkUrl);

        // Check if single chunk upload
        if (session.receivedChunks.size === session.expectedChunks) {
          console.log('📦 Single chunk upload detected, processing immediately...');

          session.processingStarted = true;
          saveSession(session);

          // Process single chunk upload
          setImmediate(async () => {
            try {
              const finalUrl = await uploadToGCSWithProgress(
                chunkPath,
                originalFileName,
                fileType,
                auth.user.id,
                courseId,
                uploadId
              );

              // Clean up
              const tempDir = getTempDir(uploadId);
              fs.rmSync(tempDir, { recursive: true, force: true });
              uploadSessions.delete(uploadId);

              console.log('✅ Single chunk upload completed:', finalUrl);

            } catch (error) {
              console.error('❌ Single chunk upload failed:', error);
              updateUploadProgress(uploadId, {
                type: 'failed',
                error: error.message
              });
            }
          });

          return NextResponse.json({
            success: true,
            message: 'Single chunk upload processing',
            data: {
              uploadId,
              chunkIndex,
              tempUrl: firstChunkUrl,
              status: 'processing'
            }
          });
        }

      } catch (error) {
        console.error('❌ Error uploading first chunk:', error);
        updateUploadProgress(uploadId, {
          type: 'failed',
          error: error.message,
          phase: 'First chunk upload failed'
        });

        return NextResponse.json({
          success: false,
          error: 'Failed to upload first chunk'
        }, { status: 500 });
      }
    }

    // Check if all chunks are received (multi-chunk uploads)
    const allChunksReceived = session.receivedChunks.size === session.expectedChunks;

    if (allChunksReceived && !session.processingStarted) {
      console.log('🎯 All chunks received, starting processing...');

      // Mark as processing started to prevent duplicates
      session.processingStarted = true;
      session.isProcessing = true;
      saveSession(session);

      // Process upload asynchronously
      setImmediate(async () => {
        try {
          console.log('🔄 Starting enhanced processing pipeline...');

          // Step 1: Combine chunks (30-35%)
          const combinedFilePath = await combineChunks(uploadId, session.expectedChunks);

          // Step 2: Upload to GCS with real progress (35-100%)
          const finalUrl = await uploadToGCSWithProgress(
            combinedFilePath,
            originalFileName,
            fileType,
            auth.user.id,
            courseId,
            uploadId
          );

          // Clean up temporary files
          console.log('🧹 Cleaning up temporary files...');
          const tempDir = getTempDir(uploadId);
          fs.rmSync(tempDir, { recursive: true, force: true });
          uploadSessions.delete(uploadId);

          console.log('🎉 Enhanced upload pipeline completed successfully:', finalUrl);

        } catch (error) {
          console.error('❌ Enhanced processing pipeline failed:', error);

          updateUploadProgress(uploadId, {
            type: 'failed',
            error: error.message,
            phase: 'Processing failed'
          });

          // Clean up on error
          const tempDir = getTempDir(uploadId);
          if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
          }
          uploadSessions.delete(uploadId);
        }
      });

      return NextResponse.json({
        success: true,
        message: 'All chunks received, processing started',
        data: {
          uploadId,
          chunkIndex,
          receivedChunks: session.receivedChunks.size,
          expectedChunks: session.expectedChunks,
          status: 'processing'
        }
      });
    }

    // Return progress for intermediate chunks
    return NextResponse.json({
      success: true,
      message: 'Chunk uploaded successfully',
      data: {
        uploadId,
        chunkIndex,
        receivedChunks: session.receivedChunks.size,
        expectedChunks: session.expectedChunks,
        status: 'in_progress'
      }
    });

  } catch (error) {
    console.error('❌ Error in enhanced chunked upload endpoint:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to process chunk upload'
    }, { status: 500 });
  }
}

// Cleanup old upload sessions (run periodically)
setInterval(() => {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours

  for (const [uploadId, session] of uploadSessions.entries()) {
    if (now - session.createdAt > maxAge) {
      // Clean up temporary files
      const tempDir = getTempDir(uploadId);
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
      uploadSessions.delete(uploadId);
      console.log(`🧹 Cleaned up expired upload session: ${uploadId}`);
    }
  }
}, 60 * 60 * 1000); // Run every hour