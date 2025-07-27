// 'use client';

// import React, { useState, useEffect } from 'react';
// import Image from 'next/image';
// import { Button, Card, Modal } from 'react-bootstrap';
// import { FaStar, FaRegStar, FaEdit, FaTrash, FaThumbsUp } from 'react-icons/fa';
// import { formatDistanceToNow } from 'date-fns';
// import { toast } from 'react-hot-toast';
// import ReviewForm from './ReviewForm';
// import { useReviews } from '@/hooks/useReviews';
// import defaultAvatar from '@/assets/images/avatar/01.jpg'; // Default avatar image

// const ReviewItem = ({
//   review,
//   currentUserId,
//   onUpdateReview,
//   onDeleteReview,
//   isAdmin = false
// }) => {
//   const [isEditing, setIsEditing] = useState(false);
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0);
//   const [isHelpful, setIsHelpful] = useState(false);
//   const [isCheckingHelpful, setIsCheckingHelpful] = useState(true);
//   const { markAsHelpful, checkIfMarkedAsHelpful } = useReviews(review.course_id);

//   const isOwner = currentUserId && review.user_id === currentUserId;
//   const canModify = isOwner || isAdmin;

//   const handleUpdateReview = async (reviewData) => {
//     const result = await onUpdateReview(review.id, reviewData);
//     if (result.success) {
//       setIsEditing(false);
//     }
//     return result;
//   };

//   const handleDeleteClick = () => {
//     setShowDeleteModal(true);
//   };

//   const handleDeleteConfirm = async () => {
//     setIsDeleting(true);
//     try {
//       const result = await onDeleteReview(review.id);
//       setShowDeleteModal(false);
//       return result;
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   const handleDeleteCancel = () => {
//     setShowDeleteModal(false);
//   };

//   // Check if the user has already marked this review as helpful
//   useEffect(() => {
//     const checkHelpfulStatus = async () => {
//       if (!currentUserId || isOwner) {
//         setIsCheckingHelpful(false);
//         return;
//       }

//       try {
//         setIsCheckingHelpful(true);
//         const response = await checkIfMarkedAsHelpful(review.id);
//         setIsHelpful(response.hasMarked);
//       } catch (error) {
//         console.error('Error checking helpful status:', error);
//       } finally {
//         setIsCheckingHelpful(false);
//       }
//     };

//     checkHelpfulStatus();
//   }, [currentUserId, isOwner, review.id, checkIfMarkedAsHelpful]);

//   const handleMarkHelpful = async () => {
//     if (isHelpful || isCheckingHelpful) return;

//     try {
//       const result = await markAsHelpful(review.id);
//       if (result.success) {
//         setHelpfulCount(result.helpfulCount);
//         setIsHelpful(true);
//         toast.success('Review marked as helpful');
//       } else {
//         toast.error(result.error || 'Failed to mark review as helpful');
//       }
//     } catch (error) {
//       console.error('Error marking review as helpful:', error);
//       toast.error('Failed to mark review as helpful');
//     }
//   };

//   // Format date
//   const formattedDate = review.createdAt
//     ? formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })
//     : '';

//   // Get user avatar
//   const userAvatar = review.user?.profilePicture || defaultAvatar;

//   // Get user name with better fallbacks
//   const userName = review.userName || review.user?.fullName || review.user?.name || 'Anonymous User';
//   console.log('Review user data:', { reviewUserId: review.user_id, userName: review.userName, userObj: review.user });

//   if (isEditing) {
//     return (
//       <div className="mb-4">
//         <ReviewForm
//           courseId={review.course_id}
//           onReviewSubmitted={handleUpdateReview}
//           existingReview={review}
//         />
//         <Button
//           variant="outline-secondary"
//           size="sm"
//           onClick={() => setIsEditing(false)}
//           className="mt-2"
//         >
//           Cancel
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <Card className="mb-4 border-0 shadow-sm">
//       <Card.Body>
//         <div className="d-flex">
//           <div className="flex-shrink-0 me-3">
//             <Image
//               src={userAvatar}
//               width={50}
//               height={50}
//               className="rounded-circle"
//               alt={userName}
//             />
//           </div>
//           <div className="flex-grow-1">
//             <div className="d-flex justify-content-between align-items-center mb-2">
//               <h6 className="mb-0">{userName}</h6>
//               <small className="text-muted">{formattedDate}</small>
//             </div>

//             <div className="mb-2">
//               {[...Array(5)].map((_, index) => {
//                 const starValue = index + 1;
//                 return (
//                   <span key={index}>
//                     {starValue <= review.rating ? (
//                       <FaStar className="text-warning" />
//                     ) : (
//                       <FaRegStar className="text-muted" />
//                     )}
//                   </span>
//                 );
//               })}
//             </div>

//             <p className="mb-3">{review.content}</p>

//             <div className="d-flex justify-content-between align-items-center">
//               {canModify && (
//                 <div className="d-flex">
//                   <Button
//                     variant="outline-primary"
//                     size="sm"
//                     className="me-2"
//                     onClick={() => setIsEditing(true)}
//                     disabled={isDeleting}
//                   >
//                     <FaEdit className="me-1" /> Edit
//                   </Button>
//                   <Button
//                     variant="outline-danger"
//                     size="sm"
//                     onClick={handleDeleteClick}
//                     disabled={isDeleting}
//                   >
//                     {isDeleting ? 'Deleting...' : (
//                       <>
//                         <FaTrash className="me-1" /> Delete
//                       </>
//                     )}
//                   </Button>
//                 </div>
//               )}

//               {!isOwner && currentUserId && (
//                 <Button
//                   variant="outline-success"
//                   size="sm"
//                   onClick={handleMarkHelpful}
//                   disabled={isHelpful || isCheckingHelpful}
//                 >
//                   {isCheckingHelpful ? (
//                     <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
//                   ) : (
//                     <FaThumbsUp className={`me-1 ${isHelpful ? 'text-success' : ''}`} />
//                   )}
//                   Helpful {helpfulCount > 0 && `(${helpfulCount})`}
//                 </Button>
//               )}
//             </div>
//           </div>
//         </div>
//       </Card.Body>

//       {/* Delete Confirmation Modal */}
//       <Modal show={showDeleteModal} onHide={handleDeleteCancel} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>Confirm Deletion</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           Are you sure you want to delete this review? This action cannot be undone.
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleDeleteCancel}>
//             Cancel
//           </Button>
//           <Button variant="danger" onClick={handleDeleteConfirm} disabled={isDeleting}>
//             {isDeleting ? 'Deleting...' : 'Delete Review'}
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </Card>
//   );
// };

// export default ReviewItem;
