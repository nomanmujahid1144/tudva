import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:3001',
});

// Function to get cookies by name
function getCookie(name) {
  if (typeof document === 'undefined') return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

const addTokenToRequest = async (config) => {
  // Try to get token in browser environment
  if (typeof window !== 'undefined') {
    // First try to get token from cookie (client-accessible)
    const cookieToken = getCookie('auth_token');
    if (cookieToken) {
      config.headers.Authorization = `Bearer ${cookieToken}`;
      return config;
    }

    // Then try localStorage
    const localToken = localStorage.getItem('token');
    if (localToken) {
      config.headers.Authorization = `Bearer ${localToken}`;
      return config;
    }

    // If not in cookie or localStorage, try to get it from the API
    try {
      const response = await fetch('/api/auth/get-token');
      const data = await response.json();
      if (data.success && data.token) {
        // Store token in localStorage for future requests
        localStorage.setItem('token', data.token);
        config.headers.Authorization = `Bearer ${data.token}`;
      }
    } catch (error) {
      console.error('Error fetching token:', error);
    }
  }
  return config;
};

// Create a synchronous version of the token handler for the interceptor
const syncTokenHandler = (config) => {
  return Promise.resolve(addTokenToRequest(config)).then(updatedConfig => {
    return updatedConfig;
  });
};

axiosInstance.interceptors.request.use(syncTokenHandler);

export default axiosInstance;