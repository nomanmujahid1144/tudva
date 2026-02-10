'use client';

import React, { useState, useEffect } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import favoritesService from '@/services/favoritesService'; // ✅ FIXED: Only use favoritesService
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

/**
 * Unified FavoriteButton component that can be used in different contexts
 *
 * @param {string} courseId - The ID of the course to favorite/unfavorite
 * @param {string} courseName - The name of the course (for toast messages)
 * @param {string} variant - Button variant (primary, outline-primary, link, etc.)
 * @param {string} size - Button size (sm, md, lg)
 * @param {string} className - Additional CSS classes
 * @param {boolean} iconOnly - Whether to show only the icon without text
 * @param {boolean} asButton - Whether to render as a Button or a clickable span
 * @param {function} onFavoriteChange - Callback when favorite status changes
 */
const FavoriteButton = ({
  courseId,
  courseName = 'Course',
  variant = 'primary',
  size = 'sm',
  className = '',
  iconOnly = false,
  asButton = true,
  onFavoriteChange = null
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!user || !courseId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log('Checking favorite status for course:', courseId, 'user:', user.userId || user.id);

        // ✅ FIXED: Only use favoritesService
        const response = await favoritesService.checkFavoriteStatus(courseId);
        console.log('Favorite check result:', response);

        if (response.success) {
          setIsFavorite(response.data.isFavorite);
        }
      } catch (error) {
        console.error('Error checking favorite status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkFavoriteStatus();
  }, [courseId, user]);

  const handleToggleFavorite = async (e) => {
    // Prevent default behavior if it's a link or inside a link
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!user) {
      toast.error('Please log in to add favorites');
      router.push('/login');
      return;
    }

    if (isProcessing) return;

    try {
      setIsProcessing(true);
      console.log('Toggling favorite for course:', courseId, 'current status:', isFavorite);

      // ✅ FIXED: Only use favoritesService
      const response = await favoritesService.toggleFavorite(courseId, isFavorite);

      if (response.success) {
        const newStatus = response.data.isFavorite;
        setIsFavorite(newStatus);
        
        toast.success(
          newStatus 
            ? `${courseName} added to favorites` 
            : `${courseName} removed from favorites`
        );

        // Call the callback if provided
        if (onFavoriteChange) {
          onFavoriteChange(newStatus);
        }
      } else {
        toast.error(response.error || 'Failed to update favorites. Please try again.');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error(error.message || 'Failed to update favorites');
    } finally {
      setIsProcessing(false);
    }
  };

  // Loading state
  if (isLoading) {
    if (asButton) {
      return (
        <Button
          variant={variant}
          size={size}
          className={`favorite-button ${className}`}
          disabled
        >
          <Spinner
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
          />
          {!iconOnly && <span className="ms-2">Loading...</span>}
        </Button>
      );
    } else {
      return (
        <span className={`${className} text-muted`}>
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        </span>
      );
    }
  }

  // Button version
  if (asButton) {
    return (
      <Button
        variant={variant}
        size={size}
        className={`favorite-button ${className}`}
        onClick={handleToggleFavorite}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <Spinner
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
          />
        ) : (
          isFavorite ? <FaHeart /> : <FaRegHeart />
        )}
        {!iconOnly && (
          <span className="ms-2">
            {isProcessing
              ? 'Processing...'
              : isFavorite
                ? 'Remove from Favorites'
                : 'Add to Favorites'
            }
          </span>
        )}
      </Button>
    );
  }

  // Span version
  return (
    <span
      role="button"
      className={className}
      onClick={handleToggleFavorite}
      style={{ cursor: 'pointer' }}
    >
      {isProcessing ? (
        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      ) : (
        isFavorite ? <FaHeart className="text-danger" /> : <FaRegHeart />
      )}
    </span>
  );
};

export default FavoriteButton;