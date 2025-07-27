'use client';

import React, { useState, useEffect } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { addToFavorites, removeFromFavorites, checkIsFavorite } from '@/services/favoriteService';
import { addToWishlist, removeFromWishlist, isInWishlist } from '@/utils/fileWishlistApi';
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

        // Try both methods in sequence
        let favoriteStatus = false;

        // First try file-based wishlist API
        try {
          const isInWishlistResult = await isInWishlist(user.userId || user.id, courseId);
          console.log('File-based wishlist check result:', isInWishlistResult);
          favoriteStatus = isInWishlistResult;
        } catch (fileWishlistError) {
          console.warn('Error checking file-based wishlist:', fileWishlistError);

          // Fall back to database API
          try {
            const response = await checkIsFavorite(courseId);
            console.log('Database favorite check result:', response);
            favoriteStatus = response.isFavorite;
          } catch (dbError) {
            console.warn('Error checking database favorites:', dbError);
          }
        }

        setIsFavorite(favoriteStatus);
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

      let success = false;
      const userId = user.userId || user.id;

      // Try file-based wishlist API first
      try {
        if (isFavorite) {
          await removeFromWishlist(userId, courseId);
          console.log('Successfully removed from wishlist');
          success = true;
        } else {
          await addToWishlist(userId, courseId);
          console.log('Successfully added to wishlist');
          success = true;
        }
      } catch (fileWishlistError) {
        console.warn('Error using file-based wishlist:', fileWishlistError);
      }

      // If file-based API failed, try database API
      if (!success) {
        try {
          if (isFavorite) {
            await removeFromFavorites(courseId);
            console.log('Successfully removed from database favorites');
            success = true;
          } else {
            await addToFavorites(courseId);
            console.log('Successfully added to database favorites');
            success = true;
          }
        } catch (dbError) {
          console.warn('Error using database favorites:', dbError);
        }
      }

      if (success) {
        toast.success(isFavorite ? `${courseName} removed from favorites` : `${courseName} added to favorites`);
        setIsFavorite(!isFavorite);

        // Call the callback if provided
        if (onFavoriteChange) {
          onFavoriteChange(!isFavorite);
        }
      } else {
        toast.error('Failed to update favorites. Please try again.');
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
