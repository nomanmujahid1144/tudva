'use client';

import React, { useState } from 'react';
import { Button, Form, ProgressBar, Alert } from 'react-bootstrap';
import { uploadFile } from '@/utils/supabaseStorage';

const FileUpload = ({ 
  onUploadComplete, 
  folder = 'uploads',
  allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'],
  maxSizeMB = 5,
  buttonText = 'Upload File'
}) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError('');
    setSuccess('');
    
    if (!selectedFile) {
      setFile(null);
      return;
    }
    
    // Check file type
    if (!allowedTypes.includes(selectedFile.type)) {
      setError(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
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
    
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    try {
      setUploading(true);
      setProgress(10);
      
      // Simulate progress (in a real app, you might use XHR to track actual progress)
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 10;
          if (newProgress >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return newProgress;
        });
      }, 300);
      
      // Upload file to Supabase
      const fileUrl = await uploadFile(file, folder);
      
      clearInterval(progressInterval);
      setProgress(100);
      setSuccess('File uploaded successfully!');
      
      // Call the callback with the file URL
      if (onUploadComplete) {
        onUploadComplete(fileUrl);
      }
    } catch (err) {
      setError(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="file-upload-component mb-4">
      <Form.Group controlId="formFile" className="mb-3">
        <Form.Label>Select file to upload</Form.Label>
        <Form.Control 
          type="file" 
          onChange={handleFileChange}
          disabled={uploading}
        />
        <Form.Text className="text-muted">
          Max file size: {maxSizeMB}MB. Allowed types: {allowedTypes.join(', ')}
        </Form.Text>
      </Form.Group>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      {uploading && (
        <ProgressBar 
          now={progress} 
          label={`${progress}%`} 
          className="mb-3" 
          animated
        />
      )}
      
      <Button 
        variant="primary" 
        onClick={handleUpload} 
        disabled={!file || uploading}
      >
        {uploading ? 'Uploading...' : buttonText}
      </Button>
    </div>
  );
};

export default FileUpload;
