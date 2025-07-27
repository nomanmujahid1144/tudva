// src/services/learningService.js - FINAL UPDATED VERSION
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
    // Handle error globally
    console.error('API Error:', error?.response?.status, error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Ensure auth token is set in headers
getAuthToken();

/**
 * Get next learning day schedule with course slots
 * @returns {Promise<Object>} Next learning day data with scheduled slots
 */
export const getNextLearningDay = async () => {
  return handleApiCall(
    () => api.get('/api/learning/next-learning-day'),
    'Failed to fetch next learning day.'
  );
};

/**
 * Mark a course item as completed
 * @param {string} itemId - The scheduled item ID to mark as completed
 * @returns {Promise<Object>} Result with updated course progress
 */
export const markItemCompleted = async (itemId) => {
  return handleApiCall(
    () => api.post('/api/learning/mark-completed', { itemId }),
    'Failed to mark item as completed.'
  );
};

/**
 * Get learning materials for a course
 * @param {string} courseId - The course ID
 * @returns {Promise<Object>} Course learning materials
 */
export const getCourseMaterials = async (courseId) => {
  return handleApiCall(
    () => api.get(`/api/learning/course-materials/${courseId}`),
    'Failed to fetch course materials.'
  );
};

/**
 * UPDATED: Join a live session
 * @param {string} courseId - The course ID
 * @param {string} itemId - The scheduled item ID
 * @param {string} slotId - The time slot ID (optional)
 * @returns {Promise<Object>} Session joining details with Matrix room info
 */
export const joinLiveSession = async (courseId, itemId, slotId = null) => {
  const payload = { itemId };
  if (slotId) payload.slotId = slotId;
  
  return handleApiCall(
    () => api.post(`/api/course/${courseId}/join-session`, payload),
    'Failed to join live session.'
  );
};

/**
 * Get live session join information
 * @param {string} courseId - The course ID
 * @param {string} itemId - The scheduled item ID
 * @param {string} slotId - The time slot ID (optional)
 * @returns {Promise<Object>} Session information and join eligibility
 */
export const getSessionJoinInfo = async (courseId, itemId, slotId = null) => {
  const queryParams = new URLSearchParams();
  queryParams.append('itemId', itemId);
  if (slotId) queryParams.append('slotId', slotId);
  
  return handleApiCall(
    () => api.get(`/api/course/${courseId}/join-session?${queryParams.toString()}`),
    'Failed to get session information.'
  );
};

/**
 * Check if user can join a specific session
 * @param {string} courseId - The course ID
 * @param {string} itemId - The scheduled item ID
 * @returns {Promise<Object>} Join eligibility status
 */
export const checkSessionJoinEligibility = async (courseId, itemId) => {
  return handleApiCall(
    () => api.get(`/api/course/${courseId}/join-session?itemId=${itemId}`),
    'Failed to check session join eligibility.'
  );
};

// Default export with all functions
export default {
  getNextLearningDay,
  markItemCompleted,
  getCourseMaterials,
  joinLiveSession,
  getSessionJoinInfo,
  checkSessionJoinEligibility
};