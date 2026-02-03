import axios from 'axios';
import Cookies from 'js-cookie';
import { handleApiCall } from '@/utils/apiUtils';

// Configuration
const TOKEN_NAME = 'auth_token';
const TOKEN_EXPIRATION = 1; // 1 day

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

/**
 * Set authentication token in cookies
 * @param {string} token - JWT token
 */
export const setAuthToken = (token) => {
  if (token) {
    Cookies.set(TOKEN_NAME, token, { expires: TOKEN_EXPIRATION, sameSite: 'strict' });

    // Add token to axios default headers for subsequent requests
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

/**
 * Get authentication token from cookies
 * @returns {string|null} The token or null if not found
 */
export const getAuthToken = () => {
  const token = Cookies.get(TOKEN_NAME);

  // If token exists, ensure it's in axios headers
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  return token || null;
};

/**
 * Remove authentication token from cookies
 */
export const removeAuthToken = () => {
  Cookies.remove(TOKEN_NAME);

  // Remove from axios headers
  delete api.defaults.headers.common['Authorization'];
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Registration result
 */
export const register = async (userData) => {
  return handleApiCall(
    () => api.post('/api/users/auth/register', userData),
    'Registration failed. Please try again.'
  );
};

/**
 * Login user
 * @param {Object} credentials - User login credentials
 * @returns {Promise<Object>} Login result with user data
 */
export const login = async (credentials) => {
  const result = await handleApiCall(
    () => api.post('/api/users/auth/login', credentials),
    'Login failed. Please try again.'
  );

  if (result.success && result.data?.token) {
    // Store token in cookies
    setAuthToken(result.data.token);
  }

  return result;
};

/**
 * Logout user
 * @returns {Promise<Object>} Logout result
 */
export const logout = async () => {
  const result = await handleApiCall(
    () => api.post('/api/users/auth/logout'),
    'Logout failed.'
  );

  // Always remove token regardless of server response
  removeAuthToken();

  return result.success
    ? result
    : { success: true, message: 'Logged out successfully.' };
};

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise<Object>} Request result
 */
export const requestPasswordReset = async (data) => {
  return handleApiCall(
    () => api.post('/api/users/auth/forget-password', data ),
    'Please check your email and try again!'
  );
};

/**
 * Verify password reset token
 * @param {string} token - Reset token
 * @returns {Promise<Object>} Verification result
 */
export const verifyResetToken = async (token) => {
  return handleApiCall(
    () => api.post('/api/users/auth/verify-reset-token', { token }),
    'Token verification failed. Please try again.'
  );
};

/**
 * Reset password
 * @param {Object} data - Reset data { token, newPassword }
 * @returns {Promise<Object>} Reset result
 */
export const resetPassword = async (data) => {
  return handleApiCall(
    () => api.post('/api/users/auth/reset-password', data),
    'Password reset failed. Please try again.'
  );
};

/**
 * Get current user profile
 * @returns {Promise<Object>} User profile data
 */
export const getUserProfile = async () => {
  // Get token from cookies to check if we're authenticated
  const token = getAuthToken();
  if (!token) {
    return { success: false, error: 'No authentication token found' };
  }

  // Call API endpoint - token will be included automatically in headers by axios interceptor
  return handleApiCall(
    () => api.get('/api/users/auth/profile'),
    'Failed to fetch user profile'
  );
};

/**
 * Verify email token
 * @param {string} token - Email verification token
 * @returns {Promise<Object>} Verification result
 */
export const verifyEmailToken = async (data) => {
  return handleApiCall(
    () => api.post('/api/users/auth/confirm-email', data),
    'Email verification failed. Please try again.'
  );
};


/**
 * Update user profile
 * @param {Object} userData - User profile data to update
 * @returns {Promise<Object>} Update result
 */
export const updateProfile = async (userData) => {
  return handleApiCall(
    () => api.post('/api/users/auth/update-profile', userData),
    'Failed to update profile'
  );
};

export default {
  register,
  login,
  logout,
  isAuthenticated,
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  requestPasswordReset,
  verifyResetToken,
  verifyEmailToken,
  resetPassword,
  getUserProfile,
  updateProfile
};