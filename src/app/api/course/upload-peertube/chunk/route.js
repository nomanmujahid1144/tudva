// src/app/api/course/upload-peertube/chunk/route.js
import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/middlewares/authMiddleware';
import { UserRole } from '@/models/User';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Enhanced progress update function with proper SSE handling (same as GCS)
const updateUploadProgress = (uploadId, progressData) => {
  try {
    global.uploadProgressStore = global.uploadProgressStore || new Map();

    const roundedProgress = Math.round(progressData.progress || 0);

    const enhancedProgressData = {
      ...progressData,
      progress: roundedProgress,
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

// Get PeerTube OAuth access token
const getPeerTubeAccessToken = async () => {
  try {
    const { client_id, client_secret } = await fetch(
      `${process.env.PEERTUBE_BASE_URL}/api/v1/oauth-clients/local`
    ).then(r => r.json());

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

// In-memory store for tracking uploads (same as GCS)
const uploadSessions = new Map();

// Helper function to get session file path (same as GCS)
const getSessionFilePath = (uploadId) => {
  const tempDir = path.join(os.tmpdir(), 'chunked-uploads', uploadId);
  return path.join(tempDir, 'session.json');
};

// Helper function to load session from file (same as GCS)
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

// Helper function to save session to file (same as GCS)
const saveSession = (uploadId, session) => {
  try {
    const sessionPath = getSessionFilePath(uploadId);
    const sessionDir = path.dirname(sessionPath);
    
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }
    
    const sessionData = {
      ...session,
      receivedChunks: Array.from(session.receivedChunks)
    };
    
    fs.writeFileSync(sessionPath, JSON.stringify(sessionData), 'utf8');
  } catch (error) {
    console.error('Error saving session:', error);
  }
};

// Combine chunks into single file (same as GCS)
const combineChunks = async (uploadId, totalChunks, outputPath) => {
  const tempDir = path.join(os.tmpdir(), 'chunked-uploads', uploadId);
  const writeStream = fs.createWriteStream(outputPath);

  try {
    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = path.join(tempDir, `chunk_${i}`);
      
      if (!fs.existsSync(chunkPath)) {
        throw new Error(`Missing chunk ${i}`);
      }

      const chunkData = fs.readFileSync(chunkPath);
      writeStream.write(chunkData);
      fs.unlinkSync(chunkPath);

      // Progress update for combining (30-35%)
      const combineProgress = 30 + Math.round(((i + 1) / totalChunks) * 5);
      updateUploadProgress(uploadId, {
        type: 'progress',
        phase: 'combining',
        progress: combineProgress,
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

// Upload to PeerTube with progress tracking (35-100%)
const uploadToPeerTubeWithProgress = async (filePath, originalFileName, fileType, userId, courseId, uploadId) => {
  console.log('🔄 Starting PeerTube upload with progress tracking');

  try {
    const accessToken = await getPeerTubeAccessToken();

    // Start PeerTube upload phase at 35%
    updateUploadProgress(uploadId, {
      type: 'progress',
      phase: 'peertube_upload',
      progress: 35,
      currentBytes: 0,
      totalBytes: fs.statSync(filePath).size,
      message: 'Starting upload to PeerTube...'
    });

    console.log('⬆️ Reading file for upload...');
    const fileBuffer = fs.readFileSync(filePath);
    const fileSize = fileBuffer.length;

    // Create smooth progress for PeerTube upload (35-95%)
    let currentProgress = 35;
    const progressInterval = setInterval(() => {
      const increment = Math.floor(Math.random() * 5) + 3; // 3-7%
      currentProgress += increment;

      if (currentProgress > 90) {
        currentProgress = 90;
      }

      updateUploadProgress(uploadId, {
        type: 'progress',
        phase: 'peertube_upload',
        progress: currentProgress,
        message: `Uploading to PeerTube... ${currentProgress}%`
      });
    }, 1500);

    // Prepare form data
    const FormData = (await import('form-data')).default;
    const formData = new FormData();
    
    const fileName = originalFileName.split('.').slice(0, -1).join('.');
    const title = fileName || `Course Video - ${Date.now()}`;
    
    formData.append('name', title);
    formData.append('channelId', process.env.PEERTUBE_CHANNEL_ID);
    formData.append('videofile', fileBuffer, {
      filename: originalFileName,
      contentType: 'video/mp4'
    });
    formData.append('privacy', '2'); // Unlisted
    formData.append('category', '15'); // Education
    formData.append('language', 'en');
    formData.append('tags[0]', 'tudva');
    formData.append('tags[1]', 'course');

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

    clearInterval(progressInterval);

    const result = response.data;
    console.log('✅ File uploaded to PeerTube successfully');

    // Update to 95% for finalizing
    updateUploadProgress(uploadId, {
      type: 'progress',
      phase: 'finalizing',
      progress: 95,
      message: 'Finalizing upload...'
    });

    // Generate public URLs
    const publicUrl = `${process.env.PEERTUBE_BASE_URL}/videos/embed/${result.video.uuid}`;
    console.log('🌐 Generated public URL:', publicUrl);

    // 100% completion
    updateUploadProgress(uploadId, {
      type: 'completed',
      progress: 100,
      finalUrl: publicUrl,
      message: 'Upload completed successfully!'
    });

    return publicUrl;

  } catch (uploadError) {
    console.error('❌ PeerTube upload error:', uploadError);

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
    // Authenticate request (same as GCS)
    const auth = await authenticateRequest(request);

    if (!auth.success) {
      return NextResponse.json({
        success: false,
        error: auth.error
      }, { status: 401 });
    }

    // Only allow instructors (same as GCS)
    if (auth.user.role !== UserRole.INSTRUCTOR) {
      return NextResponse.json({
        success: false,
        error: 'Only instructors can upload files'
      }, { status: 403 });
    }

    // Get form data (same as GCS)
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

    // Calculate expected total chunks (same as GCS)
    const FIRST_CHUNK_SIZE = 3 * 1024 * 1024; // 3MB
    const REGULAR_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

    let expectedChunks = 1;
    const remainingSize = totalFileSize - FIRST_CHUNK_SIZE;
    if (remainingSize > 0) {
      expectedChunks += Math.ceil(remainingSize / REGULAR_CHUNK_SIZE);
    }

    // Get or create upload session (same as GCS)
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
        expectedChunks
      };
      uploadSessions.set(uploadId, session);
      saveSession(uploadId, session);
    }

    // Create temp directory (same as GCS)
    const tempDir = path.join(os.tmpdir(), 'chunked-uploads', uploadId);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Save chunk (same as GCS)
    const chunkPath = path.join(tempDir, `chunk_${chunkIndex}`);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(chunkPath, buffer);

    session.receivedChunks.add(chunkIndex);
    saveSession(uploadId, session);

    // Calculate progress (0-30% for chunking)
    const chunkProgress = Math.round((session.receivedChunks.size / expectedChunks) * 30);
    
    updateUploadProgress(uploadId, {
      type: 'progress',
      phase: 'chunking',
      progress: chunkProgress,
      message: `Uploading chunks ${session.receivedChunks.size}/${expectedChunks}...`
    });

    console.log(`✅ Chunk ${chunkIndex} saved. Progress: ${chunkProgress}%`);

    // Check if all chunks received
    if (session.receivedChunks.size === expectedChunks) {
      console.log('🎉 All chunks received, starting combination...');

      const outputPath = path.join(tempDir, originalFileName);

      // Combine chunks
      await combineChunks(uploadId, expectedChunks, outputPath);

      // Upload to PeerTube
      const publicUrl = await uploadToPeerTubeWithProgress(
        outputPath,
        originalFileName,
        fileType,
        auth.user.id,
        courseId,
        uploadId
      );

      // Cleanup
      fs.unlinkSync(outputPath);
      const sessionPath = getSessionFilePath(uploadId);
      if (fs.existsSync(sessionPath)) {
        fs.unlinkSync(sessionPath);
      }
      if (fs.existsSync(tempDir)) {
        fs.rmdirSync(tempDir, { recursive: true });
      }

      uploadSessions.delete(uploadId);

      // Prepare response data (same format as GCS)
      const responseData = {
        fileUrl: publicUrl,
        filename: `peertube/${publicUrl.split('/').pop()}`,
        originalName: originalFileName,
        fileSize: totalFileSize,
        fileType: fileType,
        mimeType: fileType === 'video' ? 'video/mp4' : 'application/octet-stream'
      };
      
      // Add type-specific information (same as GCS)
      if (fileType === 'material' && courseId) {
        responseData.courseId = courseId;
      }

      return NextResponse.json({
        success: true,
        message: `${fileType.charAt(0).toUpperCase() + fileType.slice(1)} uploaded successfully`,
        data: responseData
      });
    }

    // Return chunk received response
    return NextResponse.json({
      success: true,
      chunkReceived: chunkIndex,
      totalChunks: expectedChunks,
      receivedChunks: session.receivedChunks.size,
      progress: chunkProgress
    });

  } catch (error) {
    console.error('Chunk upload error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to process chunk'
    }, { status: 500 });
  }
}