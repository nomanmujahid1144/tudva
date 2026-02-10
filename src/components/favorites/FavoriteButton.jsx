// src/components/common/FavoriteButton.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { Button, Spinner } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import favoritesService from '@/services/favoritesService'; // ✅ NEW

const FavoriteButton = ({ 
  courseId, 
  initialStatus = false,
  size = 'md',
  variant = 'light',
  className = '',
  showText = false,
  onToggle = null
}) => {
  const { user } = useAuth();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);

  // Check favorite status on mount
  useEffect(() => {
    if (user && courseId) {
      checkFavoriteStatus();
    }
  }, [user, courseId]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await favoritesService.checkFavoriteStatus(courseId);
      if (response.success) {
        setIsFavorite(response.data.isFavorite);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please login to add favorites');
      router.push('/auth/sign-in');
      return;
    }

    setIsLoading(true);

    try {
      const response = await favoritesService.toggleFavorite(courseId, isFavorite);
      
      if (response.success) {
        const newStatus = response.data.isFavorite;
        setIsFavorite(newStatus);
        
        toast.success(
          newStatus 
            ? '❤️ Added to favorites!' 
            : 'Removed from favorites'
        );

        // Call parent callback if provided
        if (onToggle) {
          onToggle(courseId, newStatus);
        }
      } else {
        toast.error(response.error || 'Failed to update favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    } finally {
      setIsLoading(false);
    }
  };

  const buttonSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md';

  return (
    <Button
      variant={variant}
      size={buttonSize}
      className={`favorite-button d-flex align-items-center justify-content-center ${className}`}
      onClick={handleToggle}
      disabled={isLoading}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isLoading ? (
        <Spinner animation="border" size="sm" />
      ) : (
        <>
          {isFavorite ? (
            <FaHeart className="text-danger" />
          ) : (
            <FaRegHeart />
          )}
          {showText && (
            <span className="ms-2">
              {isFavorite ? 'Favorited' : 'Add to Favorites'}
            </span>
          )}
        </>
      )}
    </Button>
  );
};

export default FavoriteButton;