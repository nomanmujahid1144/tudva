// src/components/favorites/FavoriteButton.js
'use client';

import React from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useFavorite } from '@/hooks/useFavorites';
import { toast } from 'sonner';

const FavoriteButton = ({
  courseId,
  initialFavoriteStatus = false,
  skipInitialCheck = false, // Skip the initial API check
  onToggle = null, // Callback when toggle happens
  className = '',
  size = '1.25rem'
}) => {
  const { user } = useAuth();
  const router = useRouter();
  const { isFavorite, isLoading, toggleFavorite } = useFavorite(
    courseId, 
    initialFavoriteStatus, 
    skipInitialCheck
  );

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please log in to add favorites');
      router.push('/auth/sign-in');
      return;
    }

    if (isLoading) return;

    try {
      const result = await toggleFavorite();
      
      if (result.success) {
        toast.success(
          result.added ? 'Added to favorites' : 'Removed from favorites'
        );

        // Call the onToggle callback if provided
        if (onToggle) {
          onToggle(courseId, result.isFavorite);
        }
      } else {
        toast.error('Failed to update favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Something went wrong');
    }
  };

  // Don't show heart for unauthenticated users or non-learners
  if (!user || user.role !== 'learner') {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`favorite-heart-button ${className}`}
      style={{
        background: 'none',
        border: 'none',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        padding: '4px',
        fontSize: size,
        color: isFavorite ? '#dc3545' : '#6c757d',
        transition: 'all 0.2s ease',
        opacity: isLoading ? 0.6 : 1
      }}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isFavorite ? <FaHeart /> : <FaRegHeart />}
      
      <style jsx>{`
        .favorite-heart-button:hover {
          color: #dc3545 !important;
          transform: scale(1.1);
        }
        
        .favorite-heart-button:active {
          transform: scale(0.95);
        }
        
        .favorite-heart-button:disabled {
          transform: none;
        }
      `}</style>
    </button>
  );
};

export default FavoriteButton;