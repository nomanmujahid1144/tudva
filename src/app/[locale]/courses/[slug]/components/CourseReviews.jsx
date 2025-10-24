'use client';

import React from 'react';
import { Card, CardBody } from 'react-bootstrap';
import ReviewList from '@/components/reviews/ReviewList';

const CourseReviews = ({ courseId }) => {
  return (
    <Card className="border-0 shadow-sm mb-4">
      <CardBody>
        <ReviewList courseId={courseId} />
      </CardBody>
    </Card>
  );
};

export default CourseReviews;
