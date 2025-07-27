// 'use client';

// import React, { useState, useEffect } from 'react';
// import { Button, Pagination, Spinner, Alert } from 'react-bootstrap';
// import ReviewItem from './ReviewItem';
// import ReviewForm from './ReviewForm';
// import ReviewStats from './ReviewStats';
// import { useReviews } from '@/hooks/useReviews';
// import { useAuth } from '@/context/AuthContext';

// const ReviewList = ({ courseId }) => {
//   const { user } = useAuth();
//   const [showReviewForm, setShowReviewForm] = useState(false);
//   const [userHasReviewed, setUserHasReviewed] = useState(false);
//   const [userReview, setUserReview] = useState(null);

//   const {
//     reviews,
//     isLoading,
//     error,
//     pagination,
//     submitReview,
//     updateUserReview,
//     deleteUserReview,
//     changePage,
//     fetchReviews
//   } = useReviews(courseId);

//   // Log the courseId for debugging and fetch reviews when component mounts
//   useEffect(() => {
//     console.log('ReviewList received courseId:', courseId);
//     if (!courseId) {
//       console.warn('ReviewList: No courseId provided');
//     } else {
//       // Fetch reviews when courseId is available
//       fetchReviews(1, 10);
//     }
//   }, [courseId, fetchReviews]);

//   // Calculate rating distribution
//   const ratingDistribution = {
//     5: 0,
//     4: 0,
//     3: 0,
//     2: 0,
//     1: 0
//   };

//   // Safely calculate rating distribution
//   if (reviews && Array.isArray(reviews)) {
//     reviews.forEach(review => {
//       if (review && typeof review.rating !== 'undefined') {
//         const rating = Math.floor(review.rating);
//         if (rating >= 1 && rating <= 5) {
//           ratingDistribution[rating]++;
//         }
//       }
//     });
//   }

//   // Check if the current user has already reviewed this course
//   useEffect(() => {
//     if (user && reviews && Array.isArray(reviews) && reviews.length > 0) {
//       const foundReview = reviews.find(review => review.user_id === user.id);
//       if (foundReview) {
//         setUserHasReviewed(true);
//         setUserReview(foundReview);
//       } else {
//         setUserHasReviewed(false);
//         setUserReview(null);
//       }
//     } else {
//       setUserHasReviewed(false);
//       setUserReview(null);
//     }
//   }, [user, reviews]);

//   const handleSubmitReview = async (reviewData) => {
//     console.log('Submitting review:', reviewData);
//     try {
//       const result = await submitReview(reviewData);
//       console.log('Review submission result:', result);

//       if (result.success) {
//         // Refresh the reviews list
//         await fetchReviews(pagination.page, pagination.limit);
//       }

//       return result;
//     } catch (error) {
//       console.error('Error in handleSubmitReview:', error);
//       return { success: false, error: error.message || 'Failed to submit review' };
//     }
//   };

//   const handleUpdateReview = async (reviewId, reviewData) => {
//     return await updateUserReview(reviewId, reviewData);
//   };

//   const handleDeleteReview = async (reviewId) => {
//     return await deleteUserReview(reviewId);
//   };

//   // Generate pagination items
//   const renderPaginationItems = () => {
//     const items = [];

//     // Previous button
//     items.push(
//       <Pagination.Prev
//         key="prev"
//         onClick={() => changePage(pagination.page - 1)}
//         disabled={pagination.page === 1 || isLoading}
//       />
//     );

//     // First page
//     if (pagination.page > 2) {
//       items.push(
//         <Pagination.Item
//           key={1}
//           onClick={() => changePage(1)}
//           active={pagination.page === 1}
//         >
//           1
//         </Pagination.Item>
//       );
//     }

//     // Ellipsis if needed
//     if (pagination.page > 3) {
//       items.push(<Pagination.Ellipsis key="ellipsis1" disabled />);
//     }

//     // Pages around current page
//     for (let i = Math.max(1, pagination.page - 1); i <= Math.min(pagination.totalPages, pagination.page + 1); i++) {
//       items.push(
//         <Pagination.Item
//           key={i}
//           onClick={() => changePage(i)}
//           active={pagination.page === i}
//           disabled={isLoading}
//         >
//           {i}
//         </Pagination.Item>
//       );
//     }

//     // Ellipsis if needed
//     if (pagination.page < pagination.totalPages - 2) {
//       items.push(<Pagination.Ellipsis key="ellipsis2" disabled />);
//     }

//     // Last page
//     if (pagination.page < pagination.totalPages - 1 && pagination.totalPages > 1) {
//       items.push(
//         <Pagination.Item
//           key={pagination.totalPages}
//           onClick={() => changePage(pagination.totalPages)}
//           active={pagination.page === pagination.totalPages}
//           disabled={isLoading}
//         >
//           {pagination.totalPages}
//         </Pagination.Item>
//       );
//     }

//     // Next button
//     items.push(
//       <Pagination.Next
//         key="next"
//         onClick={() => changePage(pagination.page + 1)}
//         disabled={pagination.page === pagination.totalPages || pagination.totalPages === 0 || isLoading}
//       />
//     );

//     return items;
//   };

//   return (
//     <div className="reviews-container">
//       <h4 className="mb-4">Student Reviews</h4>

//       {/* Review Statistics */}
//       <ReviewStats
//         averageRating={
//           reviews && Array.isArray(reviews) && reviews.length > 0 ?
//             reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length :
//             0
//         }
//         reviewCount={pagination?.total || (reviews && Array.isArray(reviews) ? reviews.length : 0)}
//         ratingDistribution={ratingDistribution}
//       />

//       {/* Write Review Button - Always visible */}
//       {!showReviewForm && (
//         <Button
//           variant="primary"
//           className="mb-4"
//           onClick={() => setShowReviewForm(true)}
//         >
//           Write a Review
//         </Button>
//       )}

//       {/* Review Form - Always available */}
//       {showReviewForm && (
//         <div className="mb-4 p-4 border rounded bg-light">
//           <h5 className="mb-3">Write Your Review</h5>
//           <ReviewForm
//             courseId={courseId}
//             onReviewSubmitted={async (data) => {
//               const result = await handleSubmitReview(data);
//               if (result.success) {
//                 setShowReviewForm(false);
//                 // Refresh reviews after submission
//                 await fetchReviews(1, 10);
//               }
//               return result;
//             }}
//           />
//           <div className="mt-3">
//             <Button
//               variant="secondary"
//               size="sm"
//               onClick={() => setShowReviewForm(false)}
//             >
//               Cancel
//             </Button>
//           </div>
//         </div>
//       )}

//       {/* User's Review */}
//       {user && userHasReviewed && userReview && (
//         <div className="mb-4">
//           <h5 className="mb-3">Your Review</h5>
//           <ReviewItem
//             review={userReview}
//             currentUserId={user.id}
//             onUpdateReview={handleUpdateReview}
//             onDeleteReview={handleDeleteReview}
//           />
//         </div>
//       )}

//       {/* Content Container with Fixed Height to Prevent Layout Shifts */}
//       <div style={{ minHeight: '200px' }}>
//         {/* Loading State */}
//         {isLoading && (
//           <div className="text-center my-4">
//             <Spinner animation="border" role="status">
//               <span className="visually-hidden">Loading...</span>
//             </Spinner>
//           </div>
//         )}

//         {/* Error State */}
//         {error && !isLoading && (
//           <Alert variant="danger" className="my-4">
//             {error}
//           </Alert>
//         )}

//         {/* No Reviews State */}
//         {!isLoading && !error && reviews.length === 0 && (
//           <Alert variant="info" className="my-4">
//             No reviews yet. Be the first to review this course!
//           </Alert>
//         )}

//         {/* Reviews List */}
//         {!isLoading && !error && reviews.length > 0 && (
//           <div className="reviews-list">
//             <h5 className="mb-3">All Reviews</h5>
//             {reviews.map(review => (
//               <ReviewItem
//                 key={review.id}
//                 review={review}
//                 currentUserId={user?.id}
//                 onUpdateReview={handleUpdateReview}
//                 onDeleteReview={handleDeleteReview}
//               />
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Pagination */}
//       {pagination.totalPages > 1 && (
//         <div className="d-flex justify-content-center mt-4">
//           <Pagination>{renderPaginationItems()}</Pagination>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ReviewList;
