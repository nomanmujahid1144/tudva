// src/services/courseService.js - FIXED VERSION with correct API endpoint
import axios from 'axios';
import { handleApiCall } from '@/utils/apiUtils';
import { getAuthToken } from './authService';

// Create axios instance with default config
const api = axios.create({
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error?.response?.status, error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Ensure auth token is set in headers
getAuthToken();

/**
 * Create a new course
 * @param {Object} courseData - Basic course details
 * @returns {Promise<Object>} Creation result
 */
export const createCourse = async (courseData) => {
  return handleApiCall(
    () => api.post('/api/course/create', courseData),
    'Course creation failed. Please try again.'
  );
};

/**
 * FIXED: Get course by ID - uses the correct endpoint from your API
 * @param {string} courseId - Course identifier
 * @returns {Promise<Object>} Course data
 */
export const getCourseById = async (courseId) => {
  return handleApiCall(
    () => api.get(`/api/course/${courseId}`), // FIXED: This matches your API route
    'Failed to fetch course details.'
  );
};

/**
 * Get course by slug
 * @param {string} slug - Course slug
 * @returns {Promise<Object>} Course data
 */
export const getCourseBySlug = async (slug) => {
  return handleApiCall(
    () => api.get(`/api/courses/slug/${slug}`),
    'Failed to fetch course details.'
  );
};

/**
 * Get published courses with pagination and filters
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Object>} List of published courses with pagination
 */
export const getPublishedCourses = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  
  if (filters.page) queryParams.append('page', filters.page);
  if (filters.limit) queryParams.append('limit', filters.limit);
  if (filters.sort) queryParams.append('sort', filters.sort);
  if (filters.category && filters.category !== 'All') queryParams.append('category', filters.category);
  if (filters.subcategory) queryParams.append('subcategory', filters.subcategory);
  if (filters.level) queryParams.append('level', filters.level);
  if (filters.type) queryParams.append('type', filters.type);
  if (filters.search) queryParams.append('search', filters.search);
  if (filters.rating) queryParams.append('rating', filters.rating);
  
  return handleApiCall(
    () => api.get(`/api/courses?${queryParams.toString()}`),
    'Failed to fetch published courses.'
  );
};

/**
 * Get related courses
 * @param {string} courseId - Course identifier
 * @param {number} limit - Maximum number of courses to return
 * @returns {Promise<Object>} List of related courses
 */
export const getRelatedCourses = async (courseId, limit = 4) => {
  return handleApiCall(
    () => api.get(`/api/courses/id/${courseId}/related?limit=${limit}`),
    'Failed to fetch related courses.'
  );
};

/**
 * Get course categories with counts
 * @returns {Promise<Object>} List of categories with counts
 */
export const getCourseCategories = async () => {
  return handleApiCall(
    () => api.get('/api/courses/categories'),
    'Failed to fetch course categories.'
  );
};

/**
 * Get featured courses
 * @param {number} limit - Maximum number of courses to return
 * @param {string} category - Optional category filter
 * @returns {Promise<Object>} List of featured courses
 */
export const getFeaturedCourses = async (limit = 6, category = '') => {
  const queryParams = new URLSearchParams();
  queryParams.append('limit', limit);
  if (category && category !== 'All') queryParams.append('category', category);
  
  return handleApiCall(
    () => api.get(`/api/courses/featured?${queryParams.toString()}`),
    'Failed to fetch featured courses.'
  );
};

/**
 * Update course basic details
 * @param {string} courseId - Course identifier
 * @param {Object} data - Updated course details
 * @returns {Promise<Object>} Update result
 */
export const updateBasicDetails = async (courseId, data) => {
  return handleApiCall(
    () => api.put(`/api/course/${courseId}/basic-details`, data),
    'Failed to update course details.'
  );
};

/**
 * Update course media (images, colors)
 * @param {string} courseId - Course identifier
 * @param {Object} data - Media data
 * @returns {Promise<Object>} Update result
 */
export const updateCourseMedia = async (courseId, data) => {
  return handleApiCall(
    () => api.put(`/api/course/${courseId}/update-media`, data),
    'Failed to update course media.'
  );
};

/**
 * Update course curriculum (modules and videos)
 * @param {string} courseId - Course identifier
 * @param {Object} data - Curriculum data
 * @returns {Promise<Object>} Update result
 */
export const updateCurriculum = async (courseId, data) => {
  return handleApiCall(
    () => api.put(`/api/course/${courseId}/curriculum`, data),
    'Failed to update curriculum.'
  );
};

/**
 * Update course additional information
 * @param {string} courseId - Course identifier
 * @param {Object} data - Additional info data
 * @returns {Promise<Object>} Update result
 */
export const updateAdditionalInfo = async (courseId, data) => {
  return handleApiCall(
    () => api.put(`/api/course/${courseId}/additional-info`, data),
    'Failed to update additional information.'
  );
};

/**
 * ENHANCED: Upload single material file with real progress
 * @param {File} file - Material file to upload
 * @param {string} courseId - Course identifier
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} Upload result with file URL
 */
export const uploadCourseMaterial = async (file, courseId, onProgress) => {
  if (!courseId) {
    return {
      success: false,
      error: 'Course ID is required for material uploads'
    };
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'material');
  formData.append('courseId', courseId);

  return handleApiCall(
    () => api.post('/api/course/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        if (onProgress) onProgress(percentCompleted);
      }
    }),
    'Material upload failed. Please try again.'
  );
};

/**
 * ENHANCED: Upload multiple material files with batch progress
 * @param {File[]} files - Array of material files
 * @param {string} courseId - Course identifier 
 * @param {Function} onProgress - Progress callback (fileIndex, progress, fileName)
 * @param {Function} onFileComplete - File completion callback
 * @returns {Promise<Object[]>} Array of upload results
 */
export const uploadMultipleCourseMaterials = async (files, courseId, onProgress, onFileComplete) => {
  if (!courseId) {
    throw new Error('Course ID is required for material uploads');
  }

  const results = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    try {
      const result = await uploadCourseMaterial(file, courseId, (progress) => {
        if (onProgress) {
          onProgress(i, progress, file.name);
        }
      });

      if (result.success) {
        results.push({
          success: true,
          file: file,
          data: result.data
        });
        
        if (onFileComplete) {
          onFileComplete(i, result, file.name);
        }
      } else {
        results.push({
          success: false,
          file: file,
          error: result.error
        });
      }
      
    } catch (error) {
      console.error(`Failed to upload material: ${file.name}`, error);
      results.push({
        success: false,
        file: file,
        error: error.message
      });
    }
  }

  return results;
};

/**
 * ENHANCED: Chunked video upload with real-time progress and multiple materials
 * @param {File} videoFile - Video file to upload
 * @param {string} courseId - Course identifier
 * @param {File[]} materialFiles - Array of material files
 * @param {Function} onProgress - Enhanced progress callback
 * @returns {Promise<Object>} Upload result with video and materials data
 */
export const uploadVideoWithMaterials = async (videoFile, courseId, materialFiles = [], onProgress) => {
  try {
    // Import upload utils
    const { uploadVideoChunked } = await import('@/utils/uploadUtils');
    
    // Use the enhanced chunked upload from utils
    const result = await uploadVideoChunked(
      videoFile,
      courseId,
      materialFiles.map(file => ({ file })), // Convert to material objects
      onProgress
    );

    return {
      success: true,
      video: {
        url: result.fileUrl,
        fileName: result.fileName,
        fileSize: result.fileSize,
        duration: result.duration,
        thumbnail: result.thumbnail
      },
      materials: result.materials || []
    };

  } catch (error) {
    console.error('Enhanced video upload failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * ENHANCED: Legacy upload file method (backward compatibility)
 * @param {File} file - File to upload
 * @param {Function} onProgress - Progress callback
 * @param {string} fileType - Type of file ('video' or 'material')
 * @param {string} courseId - Course ID (required for materials)
 * @returns {Promise<Object>} Upload result with file URL
 */
export const uploadFile = async (file, onProgress, fileType = 'video', courseId = null) => {
  if (fileType === 'material') {
    return uploadCourseMaterial(file, courseId, onProgress);
  }

  // For video files, use simple upload (for backward compatibility)
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', fileType);
  
  return handleApiCall(
    () => api.post('/api/course/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        if (onProgress) onProgress(percentCompleted);
      }
    }),
    'File upload failed. Please try again.'
  );
};

/**
 * ENHANCED: Upload video file with chunked upload
 * @param {File} file - Video file to upload
 * @param {string} courseId - Course identifier
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} Upload result with file URL
 */
export const uploadVideo = async (file, courseId, onProgress) => {
  try {
    const { uploadVideoChunked } = await import('@/utils/uploadUtils');
    
    const result = await uploadVideoChunked(file, courseId, [], onProgress);
    
    return {
      success: true,
      data: {
        fileUrl: result.fileUrl,
        fileName: result.fileName,
        fileSize: result.fileSize,
        duration: result.duration,
        thumbnail: result.thumbnail
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get course curriculum with materials
 * @param {string} courseId - Course identifier
 * @returns {Promise<Object>} Curriculum data with materials
 */
export const getCourseCurriculum = async (courseId) => {
  return handleApiCall(
    () => api.get(`/api/course/${courseId}/curriculum`),
    'Failed to fetch course curriculum.'
  );
};

/**
 * Get course additional info with live course materials
 * @param {string} courseId - Course identifier  
 * @returns {Promise<Object>} Additional info data with materials
 */
export const getCourseAdditionalInfo = async (courseId) => {
  return handleApiCall(
    () => api.get(`/api/course/${courseId}/additional-info`),
    'Failed to fetch course additional information.'
  );
};

/**
 * ENHANCED: Get upload progress status
 * @param {string} uploadId - Upload identifier
 * @returns {Promise<Object>} Upload status and progress
 */
export const getUploadStatus = async (uploadId) => {
  return handleApiCall(
    () => api.post(`/api/course/upload/progress/${uploadId}`, {
      action: 'status'
    }),
    'Failed to get upload status.'
  );
};

/**
 * ENHANCED: Cancel/abort upload
 * @param {string} uploadId - Upload identifier
 * @returns {Promise<Object>} Cancellation result
 */
export const cancelUpload = async (uploadId) => {
  return handleApiCall(
    () => api.post(`/api/course/upload/progress/${uploadId}`, {
      action: 'fail',
      error: 'Upload cancelled by user',
      phase: 'cancelled'
    }),
    'Failed to cancel upload.'
  );
};

/**
 * Manage live session
 * @param {string} courseId - Course identifier
 * @param {Object} data - Session data
 * @returns {Promise<Object>} Operation result
 */
export const manageLiveSession = async (courseId, data) => {
  return handleApiCall(
    () => api.post(`/api/course/${courseId}/live-session`, data),
    'Failed to manage live session.'
  );
};

/**
 * Get live session data
 * @param {string} courseId - Course identifier
 * @param {number|null} slotIndex - Optional slot index
 * @returns {Promise<Object>} Session data
 */
export const getLiveSessionData = async (courseId, slotIndex = null) => {
  const url = slotIndex !== null 
    ? `/api/course/${courseId}/live-session?slotIndex=${slotIndex}`
    : `/api/course/${courseId}/live-session`;
    
  return handleApiCall(
    () => api.get(url),
    'Failed to fetch live session data.'
  );
};

/**
 * Convert live course to recorded
 * @param {string} courseId - Course identifier
 * @returns {Promise<Object>} Conversion result
 */
export const convertToRecorded = async (courseId) => {
  return handleApiCall(
    () => api.post(`/api/course/${courseId}/convert-to-recorded`, {}),
    'Failed to convert course to recorded format.'
  );
};

/**
 * Get instructor courses with pagination
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @param {string} sort - Sort parameter
 * @returns {Promise<Object>} List of instructor courses with pagination
 */
export const getInstructorCourses = async (page = 1, limit = 10, sort = '-createdAt') => {
  return handleApiCall(
    () => api.get(`/api/course/instructor?page=${page}&limit=${limit}&sort=${sort}`),
    'Failed to fetch instructor courses.'
  );
};

/**
 * Delete a course
 * @param {string} courseId - Course identifier
 * @returns {Promise<Object>} Deletion result
 */
export const deleteCourse = async (courseId) => {
  return handleApiCall(
    () => api.delete(`/api/course/${courseId}`),
    'Failed to delete course.'
  );
};

// ENHANCED: File and upload utilities
export const FileUtils = {
  /**
   * Validate file type and size
   * @param {File} file - File to validate
   * @param {string} type - File type ('video' or 'material')
   * @returns {Object} Validation result
   */
  validateFile: async (file, type = 'video') => {
    try {
      const { validateFile } = await import('@/utils/uploadUtils');
      validateFile(file, type);
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  },

  /**
   * Generate file preview
   * @param {File} file - File to preview
   * @returns {Promise<Object>} File preview data
   */
  generatePreview: async (file) => {
    try {
      const { generateFilePreview } = await import('@/utils/uploadUtils');
      return await generateFilePreview(file);
    } catch (error) {
      console.error('Failed to generate file preview:', error);
      return {
        name: file.name,
        size: file.size,
        type: file.type,
        preview: null,
        icon: '📁'
      };
    }
  },

  /**
   * Format file size for display
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  formatSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Format duration for display
   * @param {number} seconds - Duration in seconds
   * @returns {string} Formatted duration
   */
  formatDuration: (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
};

export default {
  // Course management
  createCourse,
  getCourseById,
  getCourseBySlug,
  getPublishedCourses,
  getRelatedCourses,
  getCourseCategories,
  getFeaturedCourses,
  updateBasicDetails,
  updateCourseMedia,
  updateCurriculum,
  updateAdditionalInfo,
  getCourseCurriculum,
  getCourseAdditionalInfo,

  // File uploads (enhanced)
  uploadFile, // Legacy compatibility
  uploadVideo, // Enhanced video upload
  uploadCourseMaterial, // Single material upload
  uploadMultipleCourseMaterials, // Batch material upload
  uploadVideoWithMaterials, // Combined upload

  // Upload management
  getUploadStatus,
  cancelUpload,

  // Live sessions
  manageLiveSession,
  getLiveSessionData,
  convertToRecorded,

  // Course management
  getInstructorCourses,
  deleteCourse,

  // Utilities
  FileUtils
};