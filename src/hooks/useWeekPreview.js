// useWeekPreview.js
'use client';

import { useState, useEffect } from 'react';
import learningService from '@/services/learningService';

export const useWeekPreview = ({ skip = false } = {}) => {
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
      setError(err.message || 'Failed to fetch week preview');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (skip) {
      setIsLoading(false);
      return;
    }
    fetchWeekPreview();
  }, [skip]);

  return { weekPreview: data, isLoading, error, refetch: fetchWeekPreview };
};