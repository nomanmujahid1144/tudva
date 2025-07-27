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
 * Join a live session
 * @param {string} sessionId - The session ID to join
 * @returns {Promise<Object>} Session joining details
 */
export const joinLiveSession = async (sessionId) => {
  return handleApiCall(
    () => api.post('/api/learning/join-live-session', { sessionId }),
    'Failed to join live session.'
  );
};

// Default export with all functions
export default {
  getNextLearningDay,
  markItemCompleted,
  getCourseMaterials,
  joinLiveSession
};