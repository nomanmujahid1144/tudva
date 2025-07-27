/**
 * Get the auth token from a request
 * @param {Request} request - The request object
 * @returns {string|null} - The auth token or null if not found
 */
export const getAuthTokenFromRequest = (request) => {
  // Try to get the token from the Authorization header
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // If no token in header, try to get it from cookies
  const cookies = request.cookies;
  const tokenCookie = cookies.get('auth_token') || cookies.get('token');
  if (tokenCookie) {
    return tokenCookie.value;
  }

  return null;
};

/**
 * Get the auth token from localStorage
 * @returns {string|null} - The auth token or null if not found
 */
export const getAuthTokenFromLocalStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  return localStorage.getItem('auth_token') || localStorage.getItem('token');
};

/**
 * Get the user ID from localStorage
 * @returns {string|null} - The user ID or null if not found
 */
export const getUserIdFromLocalStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    // Try to get the user from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.id || user.userId || null;
    }
  } catch (error) {
    console.error('Error getting user ID from localStorage:', error);
  }
  
  return null;
};

/**
 * Get auth headers for API requests
 * @returns {Object} - The headers object
 */
export const getAuthHeaders = () => {
  const token = getAuthTokenFromLocalStorage();
  const userId = getUserIdFromLocalStorage();
  
  const headers = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (userId) {
    headers['X-User-Id'] = userId;
  }
  
  return headers;
};
