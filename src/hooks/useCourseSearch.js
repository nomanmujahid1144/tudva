// src/hooks/useCourseSearch.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import courseService from '@/services/courseService';
import { debounce } from 'lodash';

export const useCourseSearch = (initialQuery = '', limit = 10) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery) => {
      if (!searchQuery || searchQuery.length < 2) {
        setResults([]);
        setTotal(0);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await courseService.searchCourses(searchQuery, limit);

        if (response.success) {
          setResults(response.data.courses || []);
          setTotal(response.data.total || 0);
        } else {
          setError(response.error || 'Search failed');
          setResults([]);
          setTotal(0);
        }
      } catch (err) {
        console.error('Search error:', err);
        setError(err.message || 'Search failed');
        setResults([]);
        setTotal(0);
      } finally {
        setIsLoading(false);
      }
    }, 500), // 500ms debounce
    [limit]
  );

  // Trigger search when query changes
  useEffect(() => {
    if (query) {
      setIsLoading(true);
      debouncedSearch(query);
    } else {
      setResults([]);
      setTotal(0);
      setIsLoading(false);
    }

    // Cleanup
    return () => {
      debouncedSearch.cancel();
    };
  }, [query, debouncedSearch]);

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setTotal(0);
    setError(null);
  };

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    total,
    clearSearch
  };
};