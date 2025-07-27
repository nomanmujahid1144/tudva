// src/context/CourseContext.js - FIXED VERSION - No Infinite Loops
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import courseService from '@/services/courseService';
import { toast } from 'sonner';

// Create the context
const CourseContext = createContext();

// Hook to use the course context
export const useCourseContext = () => useContext(CourseContext);

// Enhanced Course provider component
export const CourseProvider = ({ children, mode = 'create', courseId = null }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isUpdating, setIsUpdating] = useState(mode === 'edit');

  // NEW: Edit mode loading states
  const [courseLoading, setCourseLoading] = useState(false);
  const [courseLoadError, setCourseLoadError] = useState(null);
  const [courseDataLoaded, setCourseDataLoaded] = useState(false); // CRITICAL: Prevent infinite loops

  // Enhanced upload management
  const [activeUploads, setActiveUploads] = useState(new Map());
  const [uploadHistory, setUploadHistory] = useState([]);

  // Enhanced course data state with better material support
  const [courseData, setCourseData] = useState({
    // Step 1: Basic details
    title: '',
    description: '',
    shortDescription: '',
    category: '',
    subcategory: '',
    level: 'beginner',
    language: 'english',
    type: 'recorded',
    promoVideoUrl: '',

    // Step 2: Course media
    backgroundColorHex: '#ffffff',
    iconUrl: '',
    thumbnailUrl: '',

    // Step 3: Enhanced curriculum (for recorded courses)
    modules: [],

    // Step 4: Additional info
    faqs: [],
    tags: [],
    liveCourseMeta: {
      startDate: '',
      plannedLessons: 0,
      maxEnrollment: 30,
      timeSlots: [],
      courseMaterials: []
    },
    publish: false
  });

  // FIXED: Load course data function
  const loadCourseData = async (courseIdToLoad) => {
    if (courseDataLoaded) return; // Prevent multiple calls

    setCourseLoading(true);
    setCourseLoadError(null);

    try {
      console.log('Loading course data for ID:', courseIdToLoad);
      const result = await courseService.getCourseById(courseIdToLoad);

      if (result.success && result.data) {
        console.log('Course data loaded successfully:', result.data);
        setCourseData(result.data);
        setIsUpdating(true);
        setCourseDataLoaded(true); // CRITICAL: Mark as loaded

        // Update localStorage with loaded course data
        localStorage.setItem('currentCourseData', JSON.stringify({
          ...result.data,
          _isUpdating: true
        }));

        return result.data;
      } else {
        throw new Error(result.error || 'Failed to load course data');
      }
    } catch (error) {
      console.error('Error loading course:', error);
      setCourseLoadError(error.message);
      toast.error('Failed to load course data: ' + error.message);
      setCourseDataLoaded(true); // Mark as attempted to prevent retries
      throw error;
    } finally {
      setCourseLoading(false);
    }
  };

  // FIXED: Load course data when in edit mode - WITH PROPER DEPENDENCIES
  useEffect(() => {
    if (mode === 'edit' && courseId && !courseDataLoaded && !courseLoading) {
      console.log('CourseProvider: Loading course data for edit mode, courseId:', courseId);
      loadCourseData(courseId).catch(error => {
        console.error('Failed to load course data:', error);
      });
    }
  }, [mode, courseId, courseDataLoaded, courseLoading]); // FIXED: Proper dependencies

  // Load course data from localStorage on mount (only for create mode)
  useEffect(() => {
    if (mode === 'create') {
      const savedCourseData = localStorage.getItem('currentCourseData');
      if (savedCourseData) {
        try {
          const parsedData = JSON.parse(savedCourseData);
          const { _isUpdating, ...courseDataWithoutFlag } = parsedData;
          setCourseData(courseDataWithoutFlag);

          if (_isUpdating) {
            setIsUpdating(true);
          }
        } catch (error) {
          console.error('Error parsing course data from localStorage:', error);
          localStorage.removeItem('currentCourseData');
        }
      }
      setCourseDataLoaded(true); // Mark as loaded for create mode
    }
  }, [mode]); // Only run when mode changes

  // KEEPING ALL YOUR EXISTING FUNCTIONS AS-IS

  // Enhanced step 1 - Basic details
  const saveBasicDetails = async (data) => {
    setIsLoading(true);
    try {
      if (isUpdating && courseData._id) {
        console.log('Updating course basic details for ID:', courseData._id);
        const response = await courseService.updateBasicDetails(courseData._id, data);
        if (response.success) {
          setCourseData(prev => ({ ...prev, ...data }));

          localStorage.setItem('currentCourseData', JSON.stringify({
            ...courseData,
            ...data,
            _isUpdating: true
          }));

          toast.success('Course details updated successfully');
          return true;
        } else {
          toast.error(response.error || 'Failed to update course details');
          return false;
        }
      } else {
        console.log('Creating new course with data:', data);
        const response = await courseService.createCourse(data);
        if (response.success) {
          setCourseData(prev => ({
            ...prev,
            ...data,
            _id: response.data.courseId,
            slug: response.data.slug
          }));
          setIsUpdating(true);

          localStorage.setItem('currentCourseData', JSON.stringify({
            ...data,
            _id: response.data.courseId,
            slug: response.data.slug,
            _isUpdating: true
          }));

          toast.success('Course created successfully');
          return true;
        } else {
          toast.error(response.error || 'Failed to create course');
          return false;
        }
      }
    } catch (error) {
      console.error('Error saving course details:', error);
      toast.error('An error occurred while saving course details');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced step 2 - Course media
  const saveCourseMedia = async (data) => {
    setIsLoading(true);
    try {
      const response = await courseService.updateCourseMedia(courseData._id, data);
      if (response.success) {
        setCourseData(prev => ({ ...prev, ...data }));
        toast.success('Course media updated successfully');
        return true;
      } else {
        toast.error(response.error || 'Failed to update course media');
        return false;
      }
    } catch (error) {
      toast.error('An error occurred while saving course media');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced step 3 - Curriculum (for recorded courses)
  const saveCurriculum = async (data) => {
    setIsLoading(true);
    try {
      const response = await courseService.updateCurriculum(courseData._id, data);
      if (response.success) {
        setCourseData(prev => ({ ...prev, ...data }));
        toast.success('Curriculum updated successfully');
        return true;
      } else {
        toast.error(response.error || 'Failed to update curriculum');
        return false;
      }
    } catch (error) {
      toast.error('An error occurred while saving curriculum');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced step 4 - Additional info
  const saveAdditionalInfo = async (data) => {
    setIsLoading(true);
    try {
      const response = await courseService.updateAdditionalInfo(courseData._id, data);
      if (response.success) {
        if (data.publish) {
          // Reset state when publishing
          setCourseData({
            title: '',
            description: '',
            shortDescription: '',
            category: '',
            subcategory: '',
            level: 'beginner',
            language: 'english',
            type: 'recorded',
            promoVideoUrl: '',
            backgroundColorHex: '#ffffff',
            iconUrl: '',
            thumbnailUrl: '',
            modules: [],
            faqs: [],
            tags: [],
            liveCourseMeta: {
              startDate: '',
              plannedLessons: 0,
              maxEnrollment: 30,
              timeSlots: [],
              courseMaterials: []
            },
            publish: false
          });

          setIsUpdating(false);
          toast.success('Course published successfully');
        } else {
          setCourseData(prev => ({ ...prev, ...data }));
          toast.success('Additional info saved successfully');
        }
        return true;
      } else {
        toast.error(response.error || 'Failed to update additional info');
        return false;
      }
    } catch (error) {
      toast.error('An error occurred while saving additional info');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ENHANCED: Upload single material file
  const uploadCourseMaterial = async (file, onProgress) => {
    if (!courseData._id) {
      toast.error('Course must be created before uploading materials');
      return { success: false, error: 'Course ID required' };
    }

    try {
      const uploadId = `material-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Track upload in active uploads
      setActiveUploads(prev => new Map(prev).set(uploadId, {
        id: uploadId,
        type: 'material',
        fileName: file.name,
        fileSize: file.size,
        progress: 0,
        status: 'uploading',
        startTime: Date.now()
      }));

      // FIXED: Call your existing uploadCourseMaterial with correct parameters
      const result = await courseService.uploadCourseMaterial(file, courseData._id, (progress) => {
        // Update progress in active uploads
        setActiveUploads(prev => {
          const updated = new Map(prev);
          const upload = updated.get(uploadId);
          if (upload) {
            updated.set(uploadId, {
              ...upload,
              progress,
              status: progress === 100 ? 'completed' : 'uploading'
            });
          }
          return updated;
        });

        if (onProgress) onProgress(progress);
      });

      // Remove from active uploads and add to history
      setActiveUploads(prev => {
        const updated = new Map(prev);
        updated.delete(uploadId);
        return updated;
      });

      if (result.success) {
        setUploadHistory(prev => [...prev, {
          id: uploadId,
          type: 'material',
          fileName: file.name,
          fileSize: file.size,
          result: result.data,
          completedAt: Date.now()
        }]);
      }

      return result;
    } catch (error) {
      // Remove from active uploads on error
      setActiveUploads(prev => {
        const updated = new Map(prev);
        updated.delete(uploadId);
        return updated;
      });

      toast.error('Material upload failed');
      return { success: false, error: 'Material upload failed' };
    }
  };

  // ENHANCED: Upload multiple material files
  const uploadMultipleCourseMaterials = async (files, onProgress, onFileComplete) => {
    if (!courseData._id) {
      toast.error('Course must be created before uploading materials');
      return { success: false, error: 'Course ID required' };
    }

    try {
      const uploadId = `materials-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      console.log(`Starting upload of ${files.length} materials for course ${courseData._id}`);

      // FIXED: Call your existing uploadMultipleCourseMaterials with correct parameters
      const results = await courseService.uploadMultipleCourseMaterials(
        files,
        courseData._id, // Pass courseId as second parameter
        (fileIndex, progress, fileName) => {
          // Track upload in active uploads
          setActiveUploads(prev => {
            const updated = new Map(prev);
            const upload = updated.get(`${uploadId}-${fileIndex}`) || {
              id: `${uploadId}-${fileIndex}`,
              type: 'material',
              fileName: fileName,
              fileSize: files[fileIndex]?.size || 0,
              progress: 0,
              status: 'uploading',
              startTime: Date.now()
            };

            updated.set(`${uploadId}-${fileIndex}`, {
              ...upload,
              progress,
              status: progress === 100 ? 'completed' : 'uploading'
            });
            return updated;
          });

          if (onProgress) onProgress(fileIndex, progress, fileName);
        },
        (fileIndex, result, fileName) => {
          // Remove from active uploads when complete
          setActiveUploads(prev => {
            const updated = new Map(prev);
            updated.delete(`${uploadId}-${fileIndex}`);
            return updated;
          });

          if (onFileComplete) onFileComplete(fileIndex, result, fileName);
        }
      );

      // Update upload history
      const successfulUploads = results.filter(r => r.success);
      if (successfulUploads.length > 0) {
        setUploadHistory(prev => [
          ...prev,
          ...successfulUploads.map(upload => ({
            id: `${uploadId}-${Date.now()}`,
            type: 'material',
            fileName: upload.file.name,
            fileSize: upload.file.size,
            result: upload.data,
            completedAt: Date.now()
          }))
        ]);
      }

      const successCount = successfulUploads.length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        toast.success(`${successCount} file(s) uploaded successfully`);
      }
      if (failCount > 0) {
        toast.error(`${failCount} file(s) failed to upload`);
      }

      console.log(`Upload completed: ${successCount}/${results.length} successful`);

      // Return the results array - this should fix the "results.filter is not a function" error
      return results;

    } catch (error) {
      console.error('Batch upload error:', error);
      toast.error('Failed to upload materials');

      // Return empty array on error to prevent filter error
      return [];
    }
  };

  // ENHANCED: Upload video with materials using chunked upload
  const uploadVideoWithMaterials = async (videoFile, materialFiles = [], onProgress) => {
    if (!courseData._id) {
      toast.error('Course must be created before uploading videos');
      return { success: false, error: 'Course ID required' };
    }

    try {
      const uploadId = `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Track upload in active uploads
      setActiveUploads(prev => new Map(prev).set(uploadId, {
        id: uploadId,
        type: 'video',
        fileName: videoFile.name,
        fileSize: videoFile.size,
        materialCount: materialFiles.length,
        progress: 0,
        phase: 'preparing',
        status: 'uploading',
        startTime: Date.now()
      }));

      const result = await courseService.uploadVideoWithMaterials(
        videoFile,
        courseData._id,
        materialFiles,
        (progressData) => {
          // Update progress in active uploads
          setActiveUploads(prev => {
            const updated = new Map(prev);
            const upload = updated.get(uploadId);
            if (upload) {
              updated.set(uploadId, {
                ...upload,
                progress: progressData.overallProgress || 0,
                phase: progressData.phase || 'uploading',
                message: progressData.message || '',
                status: progressData.completed ? 'completed' : 'uploading'
              });
            }
            return updated;
          });

          if (onProgress) onProgress(progressData);
        }
      );

      // Remove from active uploads
      setActiveUploads(prev => {
        const updated = new Map(prev);
        updated.delete(uploadId);
        return updated;
      });

      if (result.success) {
        // Add to upload history
        setUploadHistory(prev => [...prev, {
          id: uploadId,
          type: 'video_with_materials',
          fileName: videoFile.name,
          fileSize: videoFile.size,
          materialCount: materialFiles.length,
          result: result,
          completedAt: Date.now()
        }]);

        toast.success(`Video and ${materialFiles.length} material(s) uploaded successfully`);
      }

      return result;
    } catch (error) {
      // Remove from active uploads on error
      setActiveUploads(prev => {
        const updated = new Map(prev);
        updated.delete(uploadId);
        return updated;
      });

      toast.error('Video upload failed');
      return { success: false, error: 'Video upload failed' };
    }
  };

  // ENHANCED: Upload video only (legacy compatibility)
  const uploadVideo = async (file, onProgress) => {
    if (!courseData._id) {
      toast.error('Course must be created before uploading videos');
      return { success: false, error: 'Course ID required' };
    }

    try {
      const uploadId = `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      setActiveUploads(prev => new Map(prev).set(uploadId, {
        id: uploadId,
        type: 'video',
        fileName: file.name,
        fileSize: file.size,
        progress: 0,
        status: 'uploading',
        startTime: Date.now()
      }));

      const result = await courseService.uploadVideo(file, courseData._id, (progressData) => {
        setActiveUploads(prev => {
          const updated = new Map(prev);
          const upload = updated.get(uploadId);
          if (upload) {
            updated.set(uploadId, {
              ...upload,
              progress: progressData.overallProgress || 0,
              phase: progressData.phase || 'uploading',
              status: progressData.completed ? 'completed' : 'uploading'
            });
          }
          return updated;
        });

        if (onProgress) onProgress(progressData);
      });

      setActiveUploads(prev => {
        const updated = new Map(prev);
        updated.delete(uploadId);
        return updated;
      });

      if (result.success) {
        setUploadHistory(prev => [...prev, {
          id: uploadId,
          type: 'video',
          fileName: file.name,
          fileSize: file.size,
          result: result.data,
          completedAt: Date.now()
        }]);
      }

      return result;
    } catch (error) {
      setActiveUploads(prev => {
        const updated = new Map(prev);
        updated.delete(uploadId);
        return updated;
      });

      toast.error('Video upload failed');
      return { success: false, error: 'Video upload failed' };
    }
  };

  // ENHANCED: Legacy upload file method (backward compatibility)
  const uploadFile = async (file, onProgress, fileType = 'video') => {
    if (fileType === 'material') {
      return uploadCourseMaterial(file, onProgress);
    } else {
      return uploadVideo(file, onProgress);
    }
  };

  // Upload management functions
  const getActiveUploads = () => Array.from(activeUploads.values());
  const getActiveUploadCount = () => activeUploads.size;
  const getUploadHistory = () => uploadHistory;
  const clearUploadHistory = () => setUploadHistory([]);

  const cancelUpload = async (uploadId) => {
    try {
      await courseService.cancelUpload(uploadId);

      setActiveUploads(prev => {
        const updated = new Map(prev);
        updated.delete(uploadId);
        return updated;
      });

      toast.info('Upload cancelled');
      return true;
    } catch (error) {
      toast.error('Failed to cancel upload');
      return false;
    }
  };

  const getUploadProgress = (uploadId) => activeUploads.get(uploadId) || null;

  // File validation and utilities
  const validateFile = async (file, type = 'video') => {
    try {
      const validation = await courseService.FileUtils.validateFile(file, type);
      if (!validation.valid) {
        toast.error(validation.error);
        return false;
      }
      return true;
    } catch (error) {
      toast.error('File validation failed');
      return false;
    }
  };

  const generateFilePreview = async (file) => {
    try {
      return await courseService.FileUtils.generatePreview(file);
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
  };

  // Enhanced step validation
  const canNavigateToStep = (step) => {
    if (step === 1) return true;

    if (step === 2) {
      return courseData._id && courseData.title && courseData.description && courseData.category;
    }

    if (step === 3) {
      if (courseData.type === 'live') return true;
      return courseData._id && courseData.backgroundColorHex && courseData.iconUrl;
    }

    if (step === 4) {
      if (courseData.type === 'recorded') {
        return courseData._id && courseData.modules && courseData.modules.length > 0;
      }
      return courseData._id;
    }

    return false;
  };

  // Enhanced navigation between steps
  const goToStep = (step) => {
    if (canNavigateToStep(step)) {
      setCurrentStep(step);
      return true;
    }

    if (step > currentStep) {
      toast.error('Please complete the current step first');
    }

    return false;
  };

  // Enhanced context value
  const value = {
    // Course data
    courseData,
    setCourseData,
    isLoading,
    currentStep,
    isUpdating,

    // NEW: Edit mode support
    courseLoading,
    courseLoadError,
    loadCourseData,

    // Course operations
    saveBasicDetails,
    saveCourseMedia,
    saveCurriculum,
    saveAdditionalInfo,

    // Enhanced upload functions
    uploadFile, // Legacy compatibility
    uploadVideo, // Single video upload
    uploadCourseMaterial, // Single material upload
    uploadMultipleCourseMaterials, // Batch material upload
    uploadVideoWithMaterials, // Video with materials upload

    // Upload management
    getActiveUploads,
    getActiveUploadCount,
    getUploadHistory,
    clearUploadHistory,
    cancelUpload,
    getUploadProgress,

    // File utilities
    validateFile,
    generateFilePreview,

    // Navigation
    goToStep,
    canNavigateToStep,

    // Upload state
    activeUploads: Array.from(activeUploads.values()),
    uploadHistory
  };

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
};

export default CourseContext;