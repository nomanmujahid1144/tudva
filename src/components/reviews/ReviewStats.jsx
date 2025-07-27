'use client';

import React from 'react';
import { Card, ProgressBar } from 'react-bootstrap';
import { FaStar } from 'react-icons/fa';

const ReviewStats = ({ averageRating, reviewCount, ratingDistribution = null }) => {
  // Default rating distribution if not provided
  const distribution = ratingDistribution || {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0
  };

  // Calculate percentages for each rating
  const calculatePercentage = (count) => {
    if (reviewCount === 0) return 0;
    return Math.round((count / reviewCount) * 100);
  };

  // If there are no reviews, show a simplified card
  if (reviewCount === 0) {
    return (
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="text-center py-4">
          <p className="mb-0">No reviews yet. Be the first to review this course!</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm mb-4">
      <Card.Body>
        <div className="d-flex align-items-center mb-4">
          <div className="text-center me-4">
            <h2 className="display-4 fw-bold mb-0">{averageRating.toFixed(1)}</h2>
            <div className="d-flex justify-content-center mb-1">
              {[...Array(5)].map((_, index) => (
                <FaStar
                  key={index}
                  className={index < Math.round(averageRating) ? "text-warning" : "text-muted"}
                  size={16}
                />
              ))}
            </div>
            <p className="text-muted mb-0">{reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}</p>
          </div>

          <div className="flex-grow-1">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="d-flex align-items-center mb-2">
                <div className="me-2" style={{ width: '30px' }}>
                  {rating} <FaStar className="text-warning" size={12} />
                </div>
                <ProgressBar
                  now={calculatePercentage(distribution[rating])}
                  className="flex-grow-1"
                  style={{ height: '8px' }}
                />
                <div className="ms-2" style={{ width: '40px' }}>
                  {calculatePercentage(distribution[rating])}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ReviewStats;
