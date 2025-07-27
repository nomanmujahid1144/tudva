'use client';

import React, { useState, useRef } from 'react';
import { Button, Form, ProgressBar, Alert } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const VideoUpload = ({
  onUploadComplete,
  maxSizeMB = 100,
  buttonText = 'Upload Video'
}) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [videoPreview, setVideoPreview] = useState('');
  const videoRef = useRef(null);

  const allowedTypes = ['video/mp4', 'video/avi', 'video/quicktime'];

  const [videoDuration, setVideoDuration] = useState(0);

  const checkVideoDuration = (videoElement) => {
    return new Promise((resolve, reject) => {
      videoElement.onloadedmetadata = () => {
        const duration = videoElement.duration;
        setVideoDuration(duration);
        console.log(`Video duration: ${duration} seconds`);

        // Check if duration exceeds 45 minutes (2700 seconds)
        if (duration > 2700) {
          reject(new Error('Video exceeds the maximum duration of 45 minutes'));
        } else {
          resolve(duration);
        }
      };

      videoElement.onerror = () => {
        reject(new Error('Error loading video metadata'));
      };
    });
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    setError('');
    setVideoPreview('');
    setVideoDuration(0);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Check file type
    if (!allowedTypes.includes(selectedFile.type)) {
      setError(`Invalid file type. Allowed types: MP4, AVI, QuickTime`);
      setFile(null);
      return;
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (selectedFile.size > maxSizeBytes) {
      setError(`File size exceeds the maximum allowed size (${maxSizeMB}MB)`);
      setFile(null);
      return;
    }

    // Create a preview URL for the video
    const previewUrl = URL.createObjectURL(selectedFile);
    setVideoPreview(previewUrl);

    // Create a temporary video element to check duration
    const videoElement = document.createElement('video');
    videoElement.src = previewUrl;

    try {
      await checkVideoDuration(videoElement);
      setFile(selectedFile);
    } catch (error) {
      setError(error.message);
      setFile(null);
      URL.revokeObjectURL(previewUrl);
      setVideoPreview('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a video file first');
      return;
    }

    try {
      setUploading(true);
      setProgress(0);
      toast.loading('Preparing to upload video...', { id: 'video-upload' });

      // Create FormData for upload
      const formData = new FormData();
      formData.append('video', file);

      // Upload using axios with progress tracking
      const response = await axios.post('/api/upload/video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);

          // Update toast with progress at certain intervals to avoid too many updates
          if (percentCompleted % 20 === 0 || percentCompleted === 100) {
            toast.loading(`Uploading: ${percentCompleted}%`, { id: 'video-upload' });
          }
        }
      });

      if (response.data.success) {
        setProgress(100);
        toast.success('Video uploaded successfully!', { id: 'video-upload' });

        console.log('Video uploaded successfully to Supabase. URL:', response.data.url);

        // Call the callback with the file URL and the original file
        if (onUploadComplete) {
          onUploadComplete({
            url: response.data.url, // This is the Supabase storage URL
            file: file,
            previewUrl: videoPreview, // Local preview URL for UI display
            duration: videoDuration
          });
        }
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(`Upload failed: ${err.message || 'Unknown error'}`);
      toast.error(`Upload failed: ${err.message || 'Unknown error'}`, { id: 'video-upload' });
    } finally {
      setUploading(false);
    }
  };

  // Function to simulate upload for development
  const simulateUpload = () => {
    if (!file) {
      setError('Please select a video file first');
      return;
    }

    setUploading(true);
    setProgress(0);
    toast.loading('Uploading video...', { id: 'video-upload' });

    // Simulate progress
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      setProgress(currentProgress);

      // Update toast with progress
      if (currentProgress % 20 === 0) {
        toast.loading(`Uploading: ${currentProgress}%`, { id: 'video-upload' });
      }

      if (currentProgress >= 100) {
        clearInterval(interval);
        setUploading(false);
        toast.success('Video uploaded successfully!', { id: 'video-upload' });

        // Call the callback with the file and preview URL
        if (onUploadComplete) {
          onUploadComplete({
            url: videoPreview, // In simulation, we use the local preview URL
            file: file,
            previewUrl: videoPreview,
            duration: videoDuration
          });
        }
      }
    }, 300);
  };

  return (
    <div className="video-upload-component mb-4">
      <Form.Group controlId="formVideo" className="mb-3">
        <Form.Label>Select video to upload</Form.Label>
        <Form.Control
          type="file"
          accept="video/mp4,video/avi,video/quicktime"
          onChange={handleFileChange}
          disabled={uploading}
        />
        <Form.Text className="text-muted">
          Max file size: {maxSizeMB}MB. Max duration: 45 minutes. Allowed types: MP4, AVI, QuickTime
        </Form.Text>
      </Form.Group>

      {error && <Alert variant="danger">{error}</Alert>}

      {videoPreview && (
        <div className="video-preview mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <p className="mb-0">Preview:</p>
            {videoDuration > 0 && (
              <p className="mb-0 text-muted">
                Duration: {Math.floor(videoDuration / 60)}:{(videoDuration % 60).toFixed(0).padStart(2, '0')}
                {videoDuration > 2400 && videoDuration <= 2700 && (
                  <span className="text-warning ms-2">(Approaching 45-minute limit)</span>
                )}
              </p>
            )}
          </div>
          <video
            ref={videoRef}
            width="100%"
            height="auto"
            controls
            className="rounded"
          >
            <source src={videoPreview} type={file?.type || 'video/mp4'} />
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {uploading && (
        <div className="mb-3">
          <p className="mb-1">Uploading: {progress}%</p>
          <ProgressBar
            now={progress}
            label={`${progress}%`}
            animated
            variant={progress < 100 ? "primary" : "success"}
          />
        </div>
      )}

      <Button
        variant="primary"
        onClick={process.env.NODE_ENV === 'development' ? simulateUpload : handleUpload}
        disabled={!file || uploading}
        className="mt-2"
      >
        {uploading ? 'Uploading...' : buttonText}
      </Button>
    </div>
  );
};

export default VideoUpload;
