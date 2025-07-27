// utils/uploadUtils.js - ENHANCED VERSION with Real Progress Tracking

/**
 * Enhanced Chunked Upload Configuration
 */
export const UPLOAD_CONFIG = {
  FIRST_CHUNK_SIZE: 3 * 1024 * 1024, // 3MB for first chunk
  REGULAR_CHUNK_SIZE: 5 * 1024 * 1024, // 5MB for subsequent chunks
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  SUPPORTED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/mov', 'video/avi', 'video/quicktime'],
  SUPPORTED_MATERIAL_TYPES: [
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 'image/jpeg', 'image/jpg', 'image/png',
    'image/gif', 'image/bmp', 'image/svg+xml'
  ]
};

/**
 * Get authentication token from cookies
 */
export const getAuthToken = () => {
  return document.cookie.split('; ').find(row => row.startsWith('authToken='))?.split('=')[1];
};

/**
 * Enhanced file validation with better error messages
 */
export const validateFile = (file, type = 'video') => {
  const maxSize = type === 'video' ? 500 * 1024 * 1024 : 50 * 1024 * 1024;
  const allowedTypes = type === 'video' ? UPLOAD_CONFIG.SUPPORTED_VIDEO_TYPES : UPLOAD_CONFIG.SUPPORTED_MATERIAL_TYPES;

  if (!allowedTypes.includes(file.type)) {
    const typeList = type === 'video' ? 'MP4, WebM, MOV, AVI, QuickTime' : 'PDF, DOC, DOCX, PPT, PPTX, TXT, JPG, PNG, GIF';
    throw new Error(`Invalid file type. Supported formats: ${typeList}`);
  }

  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    throw new Error(`File size exceeds ${maxSizeMB}MB limit`);
  }

  return true;
};

/**
 * Enhanced file preview generation
 */
export const generateFilePreview = async (file) => {
  const fileInfo = {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    preview: null,
    icon: getFileIcon(file.type)
  };

  // Generate preview for images
  if (file.type.startsWith('image/')) {
    try {
      fileInfo.preview = await createImagePreview(file);
    } catch (error) {
      console.warn('Failed to generate image preview:', error);
    }
  }

  // Generate thumbnail for videos
  if (file.type.startsWith('video/')) {
    try {
      fileInfo.preview = await generateVideoThumbnail(file);
    } catch (error) {
      console.warn('Failed to generate video thumbnail:', error);
    }
  }

  return fileInfo;
};

/**
 * Create image preview
 */
const createImagePreview = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Get file icon based on MIME type
 */
const getFileIcon = (mimeType) => {
  const iconMap = {
    'application/pdf': '📄',
    'application/msword': '📝',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
    'application/vnd.ms-powerpoint': '📊',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📊',
    'text/plain': '📃',
    'image/jpeg': '🖼️',
    'image/jpg': '🖼️',
    'image/png': '🖼️',
    'image/gif': '🖼️',
    'video/mp4': '🎥',
    'video/webm': '🎥',
    'video/mov': '🎥'
  };

  return iconMap[mimeType] || '📁';
};

/**
 * Enhanced video thumbnail generation
 */
export const generateVideoThumbnail = (file) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    video.onloadedmetadata = function () {
      // Seek to 25% of video duration or 1 second, whichever is smaller
      const seekTime = Math.min(1, video.duration * 0.25);
      video.currentTime = seekTime;
    };

    video.onseeked = function () {
      // Set canvas dimensions
      canvas.width = Math.min(video.videoWidth, 320);
      canvas.height = Math.min(video.videoHeight, 180);

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

      // Clean up
      URL.revokeObjectURL(video.src);
      resolve(dataUrl);
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video for thumbnail'));
    };

    video.src = URL.createObjectURL(file);
    video.load();
  });
};

/**
 * Get video duration
 */
export const getVideoDuration = (file) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = function () {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to get video duration'));
    };

    video.src = URL.createObjectURL(file);
  });
};

/**
 * Enhanced progress calculation with phases
 */
export const calculateUploadProgress = (phase, currentValue, totalValue, materialProgress = 0) => {
  const phaseWeights = {
    'preparing': { start: 0, weight: 1 },        // 0-1%
    'materials': { start: 1, weight: 9 },        // 1-10% 
    'chunking': { start: 10, weight: 20 },       // 10-30%
    'combining': { start: 30, weight: 5 },       // 30-35%
    'gcs_upload': { start: 35, weight: 60 },     // 35-95%
    'finalizing': { start: 95, weight: 5 }       // 95-100%
  };

  const phaseInfo = phaseWeights[phase];
  if (!phaseInfo) return Math.round(currentValue || 0);

  let phaseProgress = 0;

  if (phase === 'materials') {
    // Use material progress directly
    phaseProgress = materialProgress / 100;
  } else if (totalValue > 0) {
    phaseProgress = Math.min(currentValue / totalValue, 1);
  } else {
    phaseProgress = 0;
  }

  const calculatedProgress = phaseInfo.start + (phaseProgress * phaseInfo.weight);

  // FIXED: Always return rounded integer, no decimals
  return Math.round(Math.min(100, Math.max(0, calculatedProgress)));
};

/**
 * Enhanced SSE connection with real GCS progress
 */
const setupEnhancedSSE = (uploadId, onProgressUpdate) => {
  return new Promise((resolve, reject) => {
    console.log('🔗 Setting up enhanced SSE for upload:', uploadId);

    const eventSource = new EventSource(`/api/course/upload/progress/${uploadId}`);
    let isCompleted = false;

    const connectionTimeout = setTimeout(() => {
      if (!isCompleted) {
        console.warn('⚠️ SSE timeout, checking backend status...');
        eventSource.close();
        checkBackendStatus(uploadId).then(resolve).catch(() => {
          resolve({ success: true, timeout: true });
        });
      }
    }, 15 * 60 * 1000);

    eventSource.onopen = () => {
      console.log('✅ Enhanced SSE connection established');
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📡 Enhanced SSE data:', data);

        if (data.type === 'progress') {
          // FIXED: Map backend progress to frontend phases with clean integers
          let overallProgress = 30; // Start from where chunking ended

          if (data.phase === 'combining') {
            overallProgress = calculateUploadProgress('combining', data.progress || 0, 100);
          } else if (data.phase === 'gcs_upload') {
            overallProgress = calculateUploadProgress('gcs_upload', data.progress || 0, 100);
          } else if (data.phase === 'finalizing') {
            overallProgress = calculateUploadProgress('finalizing', data.progress || 0, 100);
          } else {
            // Generic progress mapping - ensure it's rounded
            overallProgress = Math.round(Math.min(95, Math.max(30, 30 + (data.progress || 0) * 0.65)));
          }

          onProgressUpdate({
            ...data,
            overallProgress, // Clean integer like 45%, 67%, 89%
            phase: data.phase || 'processing',
            message: data.message || `Processing... ${overallProgress}%`,
            realTime: true
          });
        }

        if (data.type === 'completed') {
          console.log('✅ Enhanced upload completed:', data.finalUrl);
          isCompleted = true;
          clearTimeout(connectionTimeout);
          eventSource.close();

          onProgressUpdate({
            ...data,
            overallProgress: 100, // Exactly 100%
            completed: true,
            finalUrl: data.finalUrl,
            message: 'Upload completed successfully!'
          });

          resolve({ success: true, finalUrl: data.finalUrl });
        }

        if (data.type === 'failed') {
          console.error('❌ Enhanced upload failed:', data.error);
          isCompleted = true;
          clearTimeout(connectionTimeout);
          eventSource.close();
          reject(new Error(data.error));
        }

      } catch (error) {
        console.error('❌ Error parsing enhanced SSE data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('❌ Enhanced SSE error:', error);
      if (!isCompleted) {
        eventSource.close();
        clearTimeout(connectionTimeout);
        checkBackendStatus(uploadId).then(resolve).catch(() => {
          resolve({ success: true, error: true });
        });
      }
    };
  });
};

/**
 * Check backend status
 */
const checkBackendStatus = async (uploadId) => {
  try {
    const response = await fetch(`/api/course/upload/status/${uploadId}`, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });

    if (response.ok) {
      const data = await response.json();
      return data.success ? { success: true, finalUrl: data.finalUrl } : { success: false };
    }
  } catch (error) {
    console.error('Error checking backend status:', error);
  }
  return { success: false };
};

/**
 * Enhanced chunked video upload with smooth progress
 */
export const uploadVideoChunked = async (file, courseId, materials = [], onProgress) => {
  try {
    validateFile(file, 'video');

    const uploadId = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('🚀 Starting enhanced chunked upload:', uploadId);

    // Phase 1: Preparing (0-1%)
    onProgress({
      phase: 'preparing',
      overallProgress: 0,
      message: 'Preparing upload...'
    });

    // Generate video metadata
    const [duration, thumbnail] = await Promise.all([
      getVideoDuration(file).catch(() => 0),
      generateVideoThumbnail(file).catch(() => null)
    ]);

    onProgress({
      phase: 'preparing',
      overallProgress: 1,
      message: 'Generated video metadata'
    });

    // Phase 2: Upload materials first (1-10%)
    let uploadedMaterials = [];
    if (materials.length > 0) {
      onProgress({
        phase: 'materials',
        overallProgress: 1,
        message: `Uploading ${materials.length} material file(s)...`,
        materialFiles: materials.map(m => ({
          name: m.file.name,
          size: m.file.size,
          status: 'pending'
        }))
      });

      for (let i = 0; i < materials.length; i++) {
        const material = materials[i];
        try {
          const result = await uploadMaterial(material.file, courseId, (materialProgress) => {
            const completedMaterials = i;
            const currentMaterialProgress = materialProgress;
            const totalMaterialProgress = ((completedMaterials + (currentMaterialProgress / 100)) / materials.length) * 100;

            // FIXED: Use proper phase calculation
            const overallProgress = calculateUploadProgress('materials', 0, 0, totalMaterialProgress);

            onProgress({
              phase: 'materials',
              overallProgress, // This will be a clean integer like 5%, 8%, etc.
              message: `Uploading ${material.file.name}...`,
              materialFiles: materials.map((m, idx) => ({
                name: m.file.name,
                size: m.file.size,
                status: idx < i ? 'completed' : idx === i ? 'uploading' : 'pending',
                progress: idx === i ? Math.round(materialProgress) : (idx < i ? 100 : 0) // FIXED: Round progress
              }))
            });
          });

          uploadedMaterials.push({
            name: result.originalName || result.fileName || material.file.name,
            url: result.fileUrl,
            size: result.fileSize || material.file.size,
            type: result.mimeType || material.file.type,
            uploadedAt: new Date()
          });
        } catch (error) {
          console.warn(`Failed to upload material: ${material.file.name}`, error);
        }
      }

      // All materials completed - exactly 10%
      onProgress({
        phase: 'materials',
        overallProgress: 10,
        message: `${uploadedMaterials.length}/${materials.length} materials uploaded successfully`,
        materialFiles: materials.map((m, idx) => ({
          name: m.file.name,
          size: m.file.size,
          status: idx < uploadedMaterials.length ? 'completed' : 'failed',
          progress: idx < uploadedMaterials.length ? 100 : 0
        }))
      });
    }

    // Phase 3: Chunk upload (10-30%)
    onProgress({
      phase: 'chunking',
      overallProgress: 10,
      message: 'Starting video upload...'
    });

    // Calculate chunks
    const chunks = calculateChunks(file.size);
    let uploadedBytes = 0;

    // Upload chunks with FIXED progress calculation
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      await uploadChunk(file, chunk, uploadId, courseId, 'video', (chunkIndex, chunkProgress, loadedBytes) => {
        const currentChunkBytes = Math.round((loadedBytes / chunk.size) * chunk.size);
        const totalUploadedBytes = uploadedBytes + currentChunkBytes;
        const chunkingProgressPercentage = (totalUploadedBytes / file.size) * 100;

        // FIXED: Use proper phase calculation - will give clean integers 10-30%
        const overallProgress = calculateUploadProgress('chunking', chunkingProgressPercentage, 100);

        onProgress({
          phase: 'chunking',
          overallProgress, // Clean integer like 15%, 22%, 28%
          message: `Uploading chunk ${i + 1}/${chunks.length}...`,
          chunksComplete: i,
          totalChunks: chunks.length,
          uploadedBytes: totalUploadedBytes,
          totalBytes: file.size
        });
      });

      uploadedBytes += chunk.size;
    }

    // Phase 4: Processing starts (30%+)
    onProgress({
      phase: 'combining',
      overallProgress: 30, // Exactly 30%
      message: 'All chunks uploaded, processing...'
    });

    // Setup enhanced SSE for real-time GCS progress (30-100%)
    const sseResult = await setupEnhancedSSE(uploadId, onProgress);

    return {
      success: true,
      uploadId,
      fileUrl: sseResult.finalUrl,
      fileName: file.name,
      fileSize: file.size,
      duration,
      thumbnail,
      materials: uploadedMaterials
    };

  } catch (error) {
    console.error('Enhanced chunked upload failed:', error);
    throw error;
  }
};

/**
 * Calculate chunks (existing function)
 */
export const calculateChunks = (fileSize) => {
  const chunks = [];
  let currentPosition = 0;

  const firstChunkSize = Math.min(UPLOAD_CONFIG.FIRST_CHUNK_SIZE, fileSize);
  chunks.push({
    start: 0,
    end: firstChunkSize,
    size: firstChunkSize,
    index: 0,
    isFirst: true
  });
  currentPosition = firstChunkSize;

  let chunkIndex = 1;
  while (currentPosition < fileSize) {
    const remainingSize = fileSize - currentPosition;
    const chunkSize = Math.min(UPLOAD_CONFIG.REGULAR_CHUNK_SIZE, remainingSize);

    chunks.push({
      start: currentPosition,
      end: currentPosition + chunkSize,
      size: chunkSize,
      index: chunkIndex,
      isFirst: false
    });

    currentPosition += chunkSize;
    chunkIndex++;
  }

  return chunks;
};

/**
 * Upload single chunk (existing function with enhancements)
 */
export const uploadChunk = async (file, chunk, uploadId, courseId, fileType, onProgress) => {
  const formData = new FormData();
  const fileChunk = file.slice(chunk.start, chunk.end);

  formData.append('file', fileChunk);
  formData.append('chunkIndex', chunk.index.toString());
  formData.append('uploadId', uploadId);
  formData.append('courseId', courseId);
  formData.append('fileType', fileType);
  formData.append('isFirstChunk', chunk.isFirst.toString());
  formData.append('originalFileName', file.name);
  formData.append('totalFileSize', file.size.toString());

  let retries = 0;

  while (retries < UPLOAD_CONFIG.MAX_RETRIES) {
    try {
      const result = await uploadChunkXHR(formData, chunk, onProgress);
      return result;
    } catch (error) {
      retries++;
      if (retries < UPLOAD_CONFIG.MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, UPLOAD_CONFIG.RETRY_DELAY * retries));
      } else {
        throw error;
      }
    }
  }
};

/**
 * Upload chunk using XMLHttpRequest
 */
const uploadChunkXHR = (formData, chunk, onProgress) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const chunkProgress = Math.round((event.loaded / event.total) * 100);
        onProgress(chunk.index, chunkProgress, event.loaded, event.total);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          reject(new Error('Invalid response format'));
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during chunk upload'));
    });

    xhr.timeout = 2 * 60 * 1000;

    const token = getAuthToken();
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    xhr.open('POST', '/api/course/upload/chunk');
    xhr.send(formData);
  });
};

/**
 * Upload material file
 */
const uploadMaterial = async (file, courseId, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'material');
  formData.append('courseId', courseId);

  const token = getAuthToken();

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.success) {
            resolve(response.data);
          } else {
            reject(new Error(response.error));
          }
        } catch (error) {
          reject(new Error('Invalid response format'));
        }
      } else {
        reject(new Error(`Material upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during material upload'));
    });

    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    xhr.open('POST', '/api/course/upload');
    xhr.send(formData);
  });
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format duration for display
 */
export const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};