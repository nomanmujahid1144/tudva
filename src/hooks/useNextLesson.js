// src/hooks/useNextLesson.js
'use client';

import { useState, useEffect } from 'react';
import learningService from '@/services/learningService';

export const useNextLesson = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNextLesson = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await learningService.getNextLearningDay();

      if (response.success) {
        setData(response.data);
      } else {
        setError(response.error || 'Failed to fetch next lesson');
      }
    } catch (err) {
      console.error('Error fetching next lesson:', err);
      setError(err.message || 'Failed to fetch next lesson');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNextLesson();
  }, []);

  return {
    nextLesson: data,
    isLoading,
    error,
    refetch: fetchNextLesson
  };
};