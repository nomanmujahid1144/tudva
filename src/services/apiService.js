/**
 * Helper to handle API responses consistently
 * @param {Function} apiCall - Async function making the API call
 * @param {string} errorMessage - Default error message
 * @returns {Promise<Object>} Standardized response object
 */
export const handleApiCall = async (apiCall, errorMessage) => {
    try {
      const response = await apiCall();
      return response.data;
    } catch (error) {
      if (error.response) {
        // Server responded with error
        return {
          success: false,
          error: error.response.data?.error || error.response.data?.message || `Error: ${error.response.status}`
        };
      } else if (error.request) {
        // Request was made but no response received
        return {
          success: false,
          error: 'No response from server. Please check your internet connection.'
        };
      } else {
        // Something else caused the error
        return {
          success: false,
          error: errorMessage
        };
      }
    }
  };
  