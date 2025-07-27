// src/hooks/useFavorites.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import favoritesService from '@/services/favoritesService';

/**
 * Custom hook for managing individual course favorite status
 * @param {string} courseId - The course ID
 * @param {boolean} initialStatus - Initial favorite status from course data
 * @param {boolean} skipInitialCheck - Skip the initial API check (useful when status is already known)
 * @returns {Object} - Favorite status and toggle function
 */
export const useFavorite = (courseId, initialStatus = false, skipInitialCheck = false) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const hasCheckedRef = useRef(false);

  // Check favorite status when user changes or courseId changes
  useEffect(() => {
    if (!user || !courseId || user.role !== 'learner') {
      setIsFavorite(false);
      hasCheckedRef.current = true;
      return;
    }

    // Skip initial check if we already know the status (e.g., from favorites page)
    if (skipInitialCheck) {
      setIsFavorite(initialStatus);
      hasCheckedRef.current = true;
      return;
    }

    // Only check once per mount unless explicitly requested
    if (!hasCheckedRef.current) {
      checkFavoriteStatus();
      hasCheckedRef.current = true;
    }
  }, [user, courseId, skipInitialCheck, initialStatus]);

  // Check favorite status from API
  const checkFavoriteStatus = useCallback(async () => {
    if (!user || !courseId || user.role !== 'learner') return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await favoritesService.checkFavoriteStatus(courseId);
      if (response.success) {
        setIsFavorite(response.data.isFavorite);
      } else {
        setError(response.error);
        // Fall back to initial status if API call fails
        setIsFavorite(initialStatus);
      }
    } catch (err) {
      setError('Failed to check favorite status');
      console.error('Error checking favorite status:', err);
      // Fall back to initial status if API call fails
      setIsFavorite(initialStatus);
    } finally {
      setIsLoading(false);
    }
  }, [user, courseId, initialStatus]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async () => {
    if (!user || !courseId || isLoading || user.role !== 'learner') {
      return { success: false, error: 'User not authenticated, not a learner, or course not found' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await favoritesService.toggleFavorite(courseId, isFavorite);
      
      if (response.success) {
        const newStatus = response.data.isFavorite;
        setIsFavorite(newStatus);
        
        return { 
          success: true, 
          isFavorite: newStatus,
          added: newStatus,
          removed: !newStatus
        };
      } else {
        setError(response.error);
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMessage = 'Failed to update favorite status';
      setError(errorMessage);
      console.error('Error toggling favorite:', err);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [user, courseId, isFavorite, isLoading]);

  // Manual refresh function that bypasses the "hasChecked" flag
  const refreshStatus = useCallback(() => {
    hasCheckedRef.current = false;
    checkFavoriteStatus();
  }, [checkFavoriteStatus]);

  return {
    isFavorite,
    isLoading,
    error,
    toggleFavorite,
    checkFavoriteStatus: refreshStatus
  };
};

/**
 * Custom hook for managing user's favorite courses list
 * IMPORTANT: This hook fetches ALL favorites once and does client-side filtering
 * @returns {Object} - Favorite courses data and management functions
 */
export const useFavorites = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalCourses: 0,
    hasMore: false,
    hasPrevious: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch ALL favorite courses (no pagination, no filters)
  // We'll do filtering on the client side for smooth search
  const fetchFavorites = useCallback(async () => {
    if (!user || user.role !== 'learner') {
      setCourses([]);
      setPagination({
        currentPage: 1,
        totalPages: 0,
        totalCourses: 0,
        hasMore: false,
        hasPrevious: false
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch ALL favorites with a high limit to get everything at once
      const response = await favoritesService.getFavoriteCourses({ 
        page: 1, 
        limit: 1000 // High limit to get all favorites
      });
      
      if (response.success) {
        setCourses(response.data.courses || []);
        setPagination(response.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalCourses: response.data.courses?.length || 0,
          hasMore: false,
          hasPrevious: false
        });
      } else {
        setError(response.error);
        setCourses([]);
      }
    } catch (err) {
      setError('Failed to fetch favorite courses');
      setCourses([]);
      console.error('Error fetching favorites:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch when user changes or when explicitly called
  useEffect(() => {
    if (user && user.role === 'learner') {
      fetchFavorites();
    } else {
      // Clear data if no user or not a learner
      setCourses([]);
      setPagination({
        currentPage: 1,
        totalPages: 0,
        totalCourses: 0,
        hasMore: false,
        hasPrevious: false
      });
    }
  }, [user, fetchFavorites]);

  // Refresh favorites list
  const refresh = useCallback(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // Remove course from local state when unfavorited
  const removeCourseFromList = useCallback((courseId) => {
    setCourses(prev => prev.filter(course => course.id !== courseId));
    setPagination(prev => ({
      ...prev,
      totalCourses: Math.max(0, prev.totalCourses - 1)
    }));
  }, []);

  return {
    courses,
    pagination,
    isLoading,
    error,
    refresh,
    removeCourseFromList,
    fetchFavorites
  };
};

/**
 * Custom hook for getting favorites count
 * @returns {Object} - Favorites count and loading state
 */
export const useFavoritesCount = () => {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCount = useCallback(async () => {
    if (!user || user.role !== 'learner') {
      setCount(0);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await favoritesService.getFavoritesCount();
      if (response.success) {
        setCount(response.data.count);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to fetch favorites count');
      console.error('Error fetching favorites count:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  const refresh = useCallback(() => {
    fetchCount();
  }, [fetchCount]);

  return {
    count,
    isLoading,
    error,
    refresh
  };
};