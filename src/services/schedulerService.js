// src/services/schedulerService.js
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
 * Get user's course schedule
 * @param {Object} params - Optional filters (startDate, endDate)
 * @returns {Promise<Object>} User's scheduled items
 */
export const getUserSchedule = async (params = {}) => {
  // Build query string from params
  const queryParams = new URLSearchParams();

  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);

  return handleApiCall(
    () => api.get(`/api/scheduler/user-schedule?${queryParams.toString()}`),
    'Failed to fetch your schedule.'
  );
};

/**
 * Get available courses for scheduling
 * @param {Object} params - Search parameters
 * @returns {Promise<Object>} List of available courses with details
 */
export const getAvailableCourses = async (params = {}) => {
  // Build query string from params
  const queryParams = new URLSearchParams();

  if (params.query) queryParams.append('query', params.query);
  if (params.type) queryParams.append('type', params.type);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);

  return handleApiCall(
    () => api.get(`/api/scheduler/available-courses?${queryParams.toString()}`),
    'Failed to fetch available courses.'
  );
};

/**
 * Add a single course item to the scheduler
 * @param {Object} data - Item data to schedule
 * @returns {Promise<Object>} Result with scheduled item details
 */
export const addCourseItem = async (data) => {
  console.log(data, 'data')
  return handleApiCall(
    () => api.post('/api/scheduler/add-item', data),
    'Failed to add item to schedule.'
  );
};

/**
 * Add a live course to the scheduler (schedules all sessions)
 * @param {Object} data - Course data with courseId
 * @returns {Promise<Object>} Result with scheduled items
 */
export const addLiveCourse = async (data) => {
  return handleApiCall(
    () => api.post('/api/scheduler/add-live-course', data),
    'Failed to add live course to schedule.'
  );
};

/**
 * Update a scheduled item (reschedule, mark complete, remove)
 * @param {Object} data - Update data
 * @returns {Promise<Object>} Update result
 */
export const updateScheduledItem = async (data) => {
  return handleApiCall(
    () => api.put('/api/scheduler/update-item', data),
    'Failed to update scheduled item.'
  );
};

/**
 * Update the order of items within a course
 * @param {string} courseId - ID of the course
 * @param {Array<string>} orderedItemIds - Array of item IDs in the desired order
 * @returns {Promise<Object>} Update result
 */
export const updateItemsOrder = async (courseId, orderedItemIds) => {
  return handleApiCall(
    () => api.put('/api/scheduler/update-item-order', { courseId, orderedItemIds }),
    'Failed to update items order.'
  );
};

// Then update your default export to include the new function
export default {
  getUserSchedule,
  getAvailableCourses,
  addCourseItem,
  addLiveCourse,
  updateScheduledItem,
  updateItemsOrder  // Add this line
};