import React from 'react';
import Reviews from './components/Reviews';
import TopRatedCourses from './components/TopRatedCourses';
import ReviewsAnalytics from './components/ReviewsAnalytics';
import { Row } from 'react-bootstrap';
export const metadata = {
  title: 'Reviews'
};
const ReviewsPage = () => {
  return <>
      <Reviews />
      <Row className="g-4">
        <TopRatedCourses />
        <ReviewsAnalytics />
      </Row>
    </>;
};
export default ReviewsPage;
