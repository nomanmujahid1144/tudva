// src/services/reviewService.js
import { handleApiCall } from '@/utils/apiUtils';
import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Get reviews for a specific course
 * @param {string} courseId - Course identifier
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Number of reviews per page (default: 10)
 * @param {string} options.sortBy - Sort criteria (default: 'newest')
 * @returns {Promise<Object>} Reviews data with statistics and pagination
 */
export const getCourseReviews = async (courseId, options = {}) => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'newest'
  } = options;
  
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sortBy
  });
  
  return handleApiCall(
    () => api.get(`/api/course/${courseId}/reviews?${queryParams}`),
    'Failed to fetch course reviews.'
  );
};

/**
 * Submit a new review for a course
 * @param {string} courseId - Course identifier
 * @param {Object} reviewData - Review data
 * @param {number} reviewData.rating - Rating (1-5)
 * @param {string} reviewData.comment - Review comment
 * @returns {Promise<Object>} Created review data
 */
export const submitReview = async (courseId, reviewData) => {
  const response = await handleApiCall(
    () => api.post(`/api/course/${courseId}/reviews`, reviewData),
    'Failed to submit review.'
  );
  
  // If review was created successfully, update course rating
  if (response.success) {
    try {
      await updateCourseRating(courseId);
    } catch (error) {
      console.warn('Failed to update course rating after review submission:', error);
      // Don't fail the whole operation if rating update fails
    }
  }
  
  return response;
};

/**
 * Update an existing review
 * @param {string} courseId - Course identifier
 * @param {string} reviewId - Review identifier
 * @param {Object} reviewData - Updated review data
 * @param {number} reviewData.rating - Rating (1-5)
 * @param {string} reviewData.comment - Review comment
 * @returns {Promise<Object>} Updated review data
 */
export const updateReview = async (courseId, reviewId, reviewData) => {
  const response = await handleApiCall(
    () => api.put(`/api/course/${courseId}/reviews/${reviewId}`, reviewData),
    'Failed to update review.'
  );
  
  // If review was updated successfully, update course rating
  if (response.success) {
    try {
      await updateCourseRating(courseId);
    } catch (error) {
      console.warn('Failed to update course rating after review update:', error);
    }
  }
  
  return response;
};

/**
 * Delete a review
 * @param {string} courseId - Course identifier
 * @param {string} reviewId - Review identifier
 * @returns {Promise<Object>} Deletion result
 */
export const deleteReview = async (courseId, reviewId) => {
  const response = await handleApiCall(
    () => api.delete(`/api/course/${courseId}/reviews/${reviewId}`),
    'Failed to delete review.'
  );
  
  // If review was deleted successfully, update course rating
  if (response.success) {
    try {
      await updateCourseRating(courseId);
    } catch (error) {
      console.warn('Failed to update course rating after review deletion:', error);
    }
  }
  
  return response;
};

/**
 * Update course rating by calling the update API
 * @param {string} courseId - Course identifier
 * @returns {Promise<Object>} Update result
 */
export const updateCourseRating = async (courseId) => {
  return handleApiCall(
    () => api.post(`/api/course/${courseId}/update-rating`),
    'Failed to update course rating.'
  );
};

/**
 * Get a specific review by ID
 * @param {string} courseId - Course identifier
 * @param {string} reviewId - Review identifier
 * @returns {Promise<Object>} Review data
 */
export const getReviewById = async (courseId, reviewId) => {
  return handleApiCall(
    () => api.get(`/api/course/${courseId}/reviews/${reviewId}`),
    'Failed to fetch review details.'
  );
};

/**
 * Vote on a review (helpful/unhelpful)
 * @param {string} courseId - Course identifier
 * @param {string} reviewId - Review identifier
 * @param {string} voteType - Vote type ('helpful' or 'unhelpful')
 * @returns {Promise<Object>} Vote result with updated counts
 */
export const voteOnReview = async (courseId, reviewId, voteType) => {
  return handleApiCall(
    () => api.post(`/api/course/${courseId}/reviews/${reviewId}/vote`, { voteType }),
    'Failed to record vote on review.'
  );
};

/**
 * Get user's vote on a specific review
 * @param {string} courseId - Course identifier
 * @param {string} reviewId - Review identifier
 * @returns {Promise<Object>} User's vote data
 */
export const getUserVote = async (courseId, reviewId) => {
  return handleApiCall(
    () => api.get(`/api/course/${courseId}/reviews/${reviewId}/vote`),
    'Failed to get vote information.'
  );
};

/**
 * Add instructor reply to a review
 * @param {string} courseId - Course identifier
 * @param {string} reviewId - Review identifier
 * @param {string} comment - Reply comment
 * @returns {Promise<Object>} Reply data
 */
export const addInstructorReply = async (courseId, reviewId, comment) => {
  return handleApiCall(
    () => api.post(`/api/course/${courseId}/reviews/${reviewId}/reply`, { comment }),
    'Failed to add instructor reply.'
  );
};

/**
 * Update instructor reply
 * @param {string} courseId - Course identifier
 * @param {string} reviewId - Review identifier
 * @param {string} comment - Updated reply comment
 * @returns {Promise<Object>} Updated reply data
 */
export const updateInstructorReply = async (courseId, reviewId, comment) => {
  return handleApiCall(
    () => api.put(`/api/course/${courseId}/reviews/${reviewId}/reply`, { comment }),
    'Failed to update instructor reply.'
  );
};

/**
 * Delete instructor reply
 * @param {string} courseId - Course identifier
 * @param {string} reviewId - Review identifier
 * @returns {Promise<Object>} Deletion result
 */
export const deleteInstructorReply = async (courseId, reviewId) => {
  return handleApiCall(
    () => api.delete(`/api/course/${courseId}/reviews/${reviewId}/reply`),
    'Failed to delete instructor reply.'
  );
};

/**
 * Get current user's reviews
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Number of reviews per page (default: 10)
 * @param {string} options.status - Filter by status (default: 'published')
 * @returns {Promise<Object>} User's reviews data with pagination
 */
export const getUserReviews = async (options = {}) => {
  const {
    page = 1,
    limit = 10,
    status = 'published'
  } = options;
  
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    status
  });
  
  return handleApiCall(
    () => api.get(`/api/user/reviews?${queryParams}`),
    'Failed to fetch user reviews.'
  );
};

/**
 * Get course rating statistics
 * @param {string} courseId - Course identifier
 * @returns {Promise<Object>} Rating statistics
 */
export const getCourseRatingStats = async (courseId) => {
  const response = await getCourseReviews(courseId, { page: 1, limit: 1 });
  
  if (response.success) {
    return {
      success: true,
      data: response.data.ratingStats
    };
  }
  
  return response;
};

/**
 * Check if user has reviewed a course
 * @param {string} courseId - Course identifier
 * @returns {Promise<Object>} Review status result
 */
export const checkUserReviewStatus = async (courseId) => {
  try {
    const response = await getUserReviews({ limit: 100, status: 'all' });
    
    if (response.success) {
      // Only consider non-deleted reviews as "reviewed"
      const activeReviews = response.data.reviews.filter(review => !review.isDeleted);
      const hasReviewed = activeReviews.some(review => review.course.id === courseId);
      const userReview = activeReviews.find(review => review.course.id === courseId);
      
      return {
        success: true,
        data: {
          hasReviewed,
          review: userReview || null
        }
      };
    }
    
    return response;
  } catch (error) {
    console.error('Error checking user review status:', error);
    return {
      success: false,
      error: 'Failed to check review status.'
    };
  }
};

/**
 * Get reviews with instructor replies for a course
 * @param {string} courseId - Course identifier
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Reviews with replies
 */
export const getReviewsWithReplies = async (courseId, options = {}) => {
  const response = await getCourseReviews(courseId, options);
  
  if (response.success) {
    // Filter reviews that have instructor replies
    const reviewsWithReplies = response.data.reviews.filter(
      review => review.instructorReply && review.instructorReply.comment
    );
    
    return {
      success: true,
      data: {
        ...response.data,
        reviews: reviewsWithReplies,
        totalWithReplies: reviewsWithReplies.length
      }
    };
  }
  
  return response;
};

/**
 * Get recent reviews for a course (for dashboard/preview)
 * @param {string} courseId - Course identifier
 * @param {number} limit - Number of recent reviews to fetch (default: 5)
 * @returns {Promise<Object>} Recent reviews data
 */
export const getRecentReviews = async (courseId, limit = 5) => {
  return getCourseReviews(courseId, {
    page: 1,
    limit,
    sortBy: 'newest'
  });
};

/**
 * Get top-rated reviews for a course
 * @param {string} courseId - Course identifier
 * @param {number} limit - Number of top reviews to fetch (default: 5)
 * @returns {Promise<Object>} Top-rated reviews data
 */
export const getTopRatedReviews = async (courseId, limit = 5) => {
  return getCourseReviews(courseId, {
    page: 1,
    limit,
    sortBy: 'rating_high'
  });
};

/**
 * Get most helpful reviews for a course
 * @param {string} courseId - Course identifier
 * @param {number} limit - Number of helpful reviews to fetch (default: 5)
 * @returns {Promise<Object>} Most helpful reviews data
 */
export const getMostHelpfulReviews = async (courseId, limit = 5) => {
  return getCourseReviews(courseId, {
    page: 1,
    limit,
    sortBy: 'helpful'
  });
};

/**
 * Bulk vote on multiple reviews
 * @param {string} courseId - Course identifier
 * @param {Array} votes - Array of vote objects {reviewId, voteType}
 * @returns {Promise<Object>} Bulk vote result
 */
export const bulkVoteOnReviews = async (courseId, votes) => {
  const results = [];
  
  for (const vote of votes) {
    try {
      const result = await voteOnReview(courseId, vote.reviewId, vote.voteType);
      results.push({
        reviewId: vote.reviewId,
        success: result.success,
        data: result.data,
        error: result.error
      });
    } catch (error) {
      results.push({
        reviewId: vote.reviewId,
        success: false,
        error: error.message
      });
    }
  }
  
  return {
    success: true,
    data: {
      results,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    }
  };
};

/**
 * Search reviews by content
 * @param {string} courseId - Course identifier
 * @param {string} searchTerm - Search term
 * @param {Object} options - Additional query options
 * @returns {Promise<Object>} Search results
 */
export const searchReviews = async (courseId, searchTerm, options = {}) => {
  const queryParams = new URLSearchParams({
    search: searchTerm,
    page: (options.page || 1).toString(),
    limit: (options.limit || 10).toString(),
    sortBy: options.sortBy || 'newest'
  });
  
  return handleApiCall(
    () => api.get(`/api/course/${courseId}/reviews/search?${queryParams}`),
    'Failed to search reviews.'
  );
};

// Utility functions for review data processing
export const ReviewUtils = {
  /**
   * Format time since review was created
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted time string
   */
  formatTimeSince: (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} minutes ago`;
      }
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return months === 1 ? '1 month ago' : `${months} months ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return years === 1 ? '1 year ago' : `${years} years ago`;
    }
  },

  /**
   * Validate review data
   * @param {Object} reviewData - Review data to validate
   * @returns {Object} Validation result
   */
  validateReviewData: (reviewData) => {
    const errors = {};
    
    if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
      errors.rating = 'Rating must be between 1 and 5 stars';
    }
    
    if (!reviewData.comment || !reviewData.comment.trim()) {
      errors.comment = 'Comment is required';
    } else if (reviewData.comment.trim().length < 10) {
      errors.comment = 'Comment must be at least 10 characters long';
    } else if (reviewData.comment.trim().length > 1000) {
      errors.comment = 'Comment cannot exceed 1000 characters';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * Calculate helpfulness ratio
   * @param {number} helpfulVotes - Number of helpful votes
   * @param {number} unhelpfulVotes - Number of unhelpful votes
   * @returns {number} Helpfulness ratio (0-1)
   */
  calculateHelpfulnessRatio: (helpfulVotes, unhelpfulVotes) => {
    const total = helpfulVotes + unhelpfulVotes;
    return total > 0 ? helpfulVotes / total : 0;
  },

  /**
   * Get rating distribution percentages
   * @param {Object} ratingDistribution - Rating distribution object
   * @param {number} totalReviews - Total number of reviews
   * @returns {Object} Percentage distribution
   */
  getRatingPercentages: (ratingDistribution, totalReviews) => {
    const percentages = {};
    
    for (let rating = 1; rating <= 5; rating++) {
      const count = ratingDistribution[rating] || 0;
      percentages[rating] = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    }
    
    return percentages;
  },

  /**
   * Sort reviews by criteria
   * @param {Array} reviews - Array of reviews
   * @param {string} sortBy - Sort criteria
   * @returns {Array} Sorted reviews
   */
  sortReviews: (reviews, sortBy) => {
    switch (sortBy) {
      case 'newest':
        return reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return reviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'helpful':
        return reviews.sort((a, b) => b.helpfulVotes - a.helpfulVotes);
      case 'rating_high':
        return reviews.sort((a, b) => b.rating - a.rating);
      case 'rating_low':
        return reviews.sort((a, b) => a.rating - b.rating);
      default:
        return reviews;
    }
  }
};

export default {
  // Core review operations
  getCourseReviews,
  submitReview,
  updateReview,
  deleteReview,
  getReviewById,
  
  // Voting operations
  voteOnReview,
  getUserVote,
  bulkVoteOnReviews,
  
  // Instructor reply operations
  addInstructorReply,
  updateInstructorReply,
  deleteInstructorReply,
  
  // User review operations
  getUserReviews,
  checkUserReviewStatus,
  
  // Statistics and analytics
  getCourseRatingStats,
  getReviewsWithReplies,
  
  // Specialized queries
  getRecentReviews,
  getTopRatedReviews,
  getMostHelpfulReviews,
  searchReviews,
  
  // Utilities
  ReviewUtils,
  
  // Course rating management
  updateCourseRating
};