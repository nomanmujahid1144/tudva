'use client';

import { useFavorites } from '@/hooks/useFavorites';
import React from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import toast from 'react-hot-toast';

const FavoriteButton = ({ courseId, className = '', courseName = 'Course' }) => {
  const { isFavorite, isLoading, toggleFavorite } = useFavorites(courseId);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const result = await toggleFavorite();
      if (result.success) {
        if (result.added) {
          toast.success(`${courseName} added to favorites`);
        } else {
          toast.success(`${courseName} removed from favorites`);
        }
      }
    } catch (error) {
      toast.error(`Failed to update favorites: ${error.message || 'Unknown error'}`);
    }
  };

  if (isLoading) {
    return (
      <span className={`${className} text-muted`}>
        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      </span>
    );
  }

  return (
    <span
      role="button"
      className={className}
      onClick={handleClick}
    >
      {isFavorite ? <FaHeart className="text-danger" /> : <FaRegHeart />}
    </span>
  );
};

export default FavoriteButton;
