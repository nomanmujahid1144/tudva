// src/services/favoritesService.js
import { handleApiCall } from '@/utils/apiUtils';
import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Check if a course is in user's favorites
 * @param {string} courseId - Course identifier
 * @returns {Promise<Object>} Favorite status result
 */
export const checkFavoriteStatus = async (courseId) => {
  return handleApiCall(
    () => api.get(`/api/course/${courseId}/favourite`),
    'Failed to check favorite status.'
  );
};

/**
 * Add a course to favorites
 * @param {string} courseId - Course identifier
 * @returns {Promise<Object>} Add to favorites result
 */
export const addToFavorites = async (courseId) => {
  return handleApiCall(
    () => api.post(`/api/course/${courseId}/favourite`),
    'Failed to add course to favorites.'
  );
};

/**
 * Remove a course from favorites
 * @param {string} courseId - Course identifier
 * @returns {Promise<Object>} Remove from favorites result
 */
export const removeFromFavorites = async (courseId) => {
  return handleApiCall(
    () => api.delete(`/api/course/${courseId}/favourite`),
    'Failed to remove course from favorites.'
  );
};

/**
 * Toggle favorite status of a course
 * @param {string} courseId - Course identifier
 * @param {boolean} currentStatus - Current favorite status
 * @returns {Promise<Object>} Toggle result
 */
export const toggleFavorite = async (courseId, currentStatus) => {
  if (currentStatus) {
    return await removeFromFavorites(courseId);
  } else {
    return await addToFavorites(courseId);
  }
};

/**
 * Get all favorite courses for the authenticated user
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Number of courses per page (default: 10)
 * @param {string} options.category - Filter by category (optional)
 * @param {string} options.level - Filter by level (optional)
 * @param {string} options.type - Filter by type (optional)
 * @returns {Promise<Object>} Favorite courses result
 */
export const getFavoriteCourses = async (options = {}) => {
  const {
    page = 1,
    limit = 10,
    category,
    level,
    type
  } = options;

  // Build query parameters
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  });

  if (category) queryParams.append('category', category);
  if (level) queryParams.append('level', level);
  if (type) queryParams.append('type', type);

  return handleApiCall(
    () => api.get(`/api/user/favorites?${queryParams}`),
    'Failed to fetch favorite courses.'
  );
};

/**
 * Get favorite courses count for the authenticated user
 * @returns {Promise<Object>} Favorites count result
 */
export const getFavoritesCount = async () => {
  const response = await getFavoriteCourses({ limit: 1 });
  
  if (response.success) {
    return {
      success: true,
      data: {
        count: response.data.pagination.totalCourses
      }
    };
  }
  
  return response;
};

/**
 * Bulk check favorite status for multiple courses
 * @param {string[]} courseIds - Array of course identifiers
 * @returns {Promise<Object>} Bulk favorite status result
 */
export const bulkCheckFavorites = async (courseIds) => {
  return handleApiCall(
    () => api.post('/api/user/favorites/check', { courseIds }),
    'Failed to check bulk favorite status.'
  );
};

export default {
  checkFavoriteStatus,
  addToFavorites,
  removeFromFavorites,
  toggleFavorite,
  getFavoriteCourses,
  getFavoritesCount,
  bulkCheckFavorites
};