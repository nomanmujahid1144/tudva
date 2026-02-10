// src/hooks/useWeekPreview.js
'use client';

import { useState, useEffect } from 'react';
import learningService from '@/services/learningService';

export const useWeekPreview = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWeekPreview = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await learningService.getWeekPreview();

      if (response.success) {
        setData(response.data);
      } else {
        setError(response.error || 'Failed to fetch week preview');
      }
    } catch (err) {
      console.error('Error fetching week preview:', err);
      setError(err.message || 'Failed to fetch week preview');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeekPreview();
  }, []);

  return {
    weekPreview: data,
    isLoading,
    error,
    refetch: fetchWeekPreview
  };
};