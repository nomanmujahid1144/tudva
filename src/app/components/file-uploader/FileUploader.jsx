// src/components/FileUploader.jsx
'use client';
import React, { useState, useRef } from 'react';
import { Button, ProgressBar } from 'react-bootstrap';
import { FaUpload, FaTrash } from 'react-icons/fa';
import { useCourseContext } from '@/context/CourseContext';

const FileUploader = ({ 
  accept = 'image/*,video/*', 
  maxSize = 100 * 1024 * 1024, // 100MB
  onUploadComplete, 
  label = 'Upload File',
  fileType = 'file'
}) => {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const { uploadFile } = useCourseContext();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) return;
    
    // Validate file size
    if (selectedFile.size > maxSize) {
      setError(`File is too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`);
      return;
    }
    
    // Reset states
    setFile(selectedFile);
    setProgress(0);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setError('');
    
    try {
      const result = await uploadFile(file, setProgress);
      
      if (result.success) {
        onUploadComplete(result.data.url);
        setFile(null);
      } else {
        setError(result.error || 'Upload failed. Please try again.');
      }
    } catch (error) {
      setError('An unexpected error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setProgress(0);
    setError('');
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      
      {file ? (
        <div>
          <div className="d-flex align-items-center mb-2">
            <div className="text-truncate me-auto">
              {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
            </div>
            <Button 
              variant="link" 
              className="text-danger p-0 ms-2" 
              onClick={handleCancel}
              disabled={isUploading}
            >
              <FaTrash />
            </Button>
          </div>
          
          {isUploading ? (
            <div className="mb-2">
              <ProgressBar 
                now={progress} 
                label={`${progress}%`} 
                animated={progress < 100}
              />
            </div>
          ) : (
            <Button 
              variant="primary" 
              onClick={handleUpload} 
              className="mt-2"
              disabled={isUploading}
            >
              <FaUpload className="me-2" />
              Start Upload
            </Button>
          )}
        </div>
      ) : (
        <div className="input-group">
          <input
            type="file"
            className="form-control"
            accept={accept}
            onChange={handleFileChange}
            ref={fileInputRef}
          />
        </div>
      )}
      
      {error && (
        <div className="text-danger small mt-1">{error}</div>
      )}
    </div>
  );
};

export default FileUploader;