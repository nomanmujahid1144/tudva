/**
 * Authentication Utilities
 *
 * This file contains utility functions for authentication.
 */

import authService from '@/services/authService';

/**
 * Get the authentication header with the JWT token
 * @returns {Object} The authentication header
 */
export const getAuthHeader = () => {
  return authService.getAuthHeader();
};

/**
 * Get the authentication token
 * @returns {string|null} The JWT token or null if not found
 */
export const getAuthToken = () => {
  return authService.getToken();
};

/**
 * Check if the user is authenticated
 * @returns {boolean} Whether the user is authenticated
 */
export const isAuthenticated = () => {
  return authService.isAuthenticated();
};

/**
 * Get the current user ID from localStorage
 * @returns {string|null} The user ID or null if not found
 */
export const getCurrentUserId = () => {
  const user = authService.getUser();
  return user ? user.id : null;
};

/**
 * Get the current user data from localStorage
 * @returns {Object|null} The user data or null if not found
 */
export const getCurrentUser = () => {
  return authService.getUser();
};
