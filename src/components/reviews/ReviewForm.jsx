'use client';

import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { FaStar } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

const ReviewForm = ({ courseId, onReviewSubmitted, existingReview = null }) => {
  const { user, isAuthenticated } = useAuth();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState(existingReview?.content || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate input
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (content.trim().length < 10) {
      setError('Review must be at least 10 characters long');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      // Check if user is authenticated
      if (!isAuthenticated || !user) {
        toast.error('Please log in to submit a review');
        setError('You must be logged in to submit a review');
        return;
      }

      // Call the onReviewSubmitted callback with the review data
      const result = await onReviewSubmitted({
        rating,
        content,
        reviewId: existingReview?.id,
        userId: user.id,
        userName: user.fullName || user.name
      });

      if (result.success) {
        toast.success(existingReview ? 'Review updated successfully' : 'Review submitted successfully');

        // Reset form if it's a new review
        if (!existingReview) {
          setRating(0);
          setContent('');
        }
      } else {
        toast.error(result.error || 'Failed to submit review');
        setError(result.error || 'Failed to submit review');
      }
    } catch (err) {
      toast.error(err.message || 'An error occurred');
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="review-form-container mb-4 p-4 border rounded bg-light">
      <h5 className="mb-3">{existingReview ? 'Edit Your Review' : 'Write a Review'}</h5>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Rating</Form.Label>
          <div className="star-rating d-flex mb-2">
            {[...Array(5)].map((_, index) => {
              const ratingValue = index + 1;
              return (
                <div
                  key={index}
                  className="star-container me-2"
                  onClick={() => setRating(ratingValue)}
                  onMouseEnter={() => setHoverRating(ratingValue)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{ cursor: 'pointer' }}
                >
                  <FaStar
                    size={24}
                    color={ratingValue <= (hoverRating || rating) ? '#ffc107' : '#e4e5e9'}
                  />
                </div>
              );
            })}
            <span className="ms-2 text-muted">
              {rating > 0 ? `${rating} out of 5` : 'Select a rating'}
            </span>
          </div>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Your Review</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your experience with this course..."
            required
            minLength={10}
            maxLength={1000}
          />
          <Form.Text className="text-muted">
            {content.length}/1000 characters
          </Form.Text>
        </Form.Group>

        <Button
          variant="primary"
          type="submit"
          disabled={isSubmitting}
          className="mt-2"
        >
          {isSubmitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
        </Button>
      </Form>
    </div>
  );
};

export default ReviewForm;
