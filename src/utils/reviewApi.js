import axios from 'axios';

// Helper function to get auth token
const getAuthHeader = () => {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Create a review
export const createReview = async (reviewData) => {
  try {
    const response = await axios.post(
      '/api/reviews',
      reviewData,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

// Get reviews for a course
export const getReviewsForCourse = async (courseId, page = 1, limit = 10) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    queryParams.append('limit', limit);

    const response = await axios.get(
      `/api/reviews/course/${courseId}?${queryParams.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
};

// Update a review
export const updateReview = async (reviewId, reviewData) => {
  try {
    const response = await axios.put(
      `/api/reviews/${reviewId}`,
      reviewData,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

// Delete a review
export const deleteReview = async (reviewId) => {
  try {
    const response = await axios.delete(
      `/api/reviews/${reviewId}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

// Mark a review as helpful
export const markReviewAsHelpful = async (reviewId) => {
  try {
    const response = await axios.post(
      `/api/reviews/${reviewId}/helpful`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('Error marking review as helpful:', error);
    throw error;
  }
};

// Check if a user has marked a review as helpful
export const hasMarkedReviewAsHelpful = async (reviewId) => {
  try {
    const response = await axios.get(
      `/api/reviews/${reviewId}/helpful`,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('Error checking if review is marked as helpful:', error);
    return { success: false, hasMarked: false };
  }
};
