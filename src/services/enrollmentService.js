// src/services/enrollmentService.js
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
 * Check if a course has available enrollment capacity
 * @param {string} courseId - Course identifier
 * @returns {Promise<Object>} Capacity information
 */
export const checkCourseCapacity = async (courseId) => {
  return handleApiCall(
    () => api.get(`/api/course/${courseId}/check-capacity`),
    'Failed to check course capacity.'
  );
};

/**
 * Check if current user can enroll in a specific course
 * @param {string} courseId - Course identifier
 * @returns {Promise<Object>} Enrollment eligibility information
 */
export const checkUserEnrollmentEligibility = async (courseId) => {
  return handleApiCall(
    () => api.post(`/api/course/${courseId}/check-capacity`),
    'Failed to check enrollment eligibility.'
  );
};

/**
 * Get enrollment statistics for a course (for instructors)
 * @param {string} courseId - Course identifier
 * @returns {Promise<Object>} Detailed enrollment statistics
 */
export const getCourseEnrollmentStats = async (courseId) => {
  return handleApiCall(
    () => api.get(`/api/course/${courseId}/enrollment-stats`),
    'Failed to fetch enrollment statistics.'
  );
};

// Default export with all functions
export default {
  checkCourseCapacity,
  checkUserEnrollmentEligibility,
  getCourseEnrollmentStats
};