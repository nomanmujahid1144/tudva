/**
 * API Configuration Utilities
 * 
 * This file contains utility functions for API configuration.
 */

/**
 * Get the backend URL from environment variables or use the default
 * @returns {string} The backend URL
 */
export const getBackendUrl = () => {
  return process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:3001';
};

/**
 * Get the frontend URL from environment variables or use the default
 * @returns {string} The frontend URL
 */
export const getFrontendUrl = () => {
  return process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
};
