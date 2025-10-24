import { useState, useEffect } from "react";
import { Button, Col, FormControl, ProgressBar, Row, Modal, Form, Alert, Spinner } from "react-bootstrap";
import { FaRegStar, FaRegThumbsDown, FaRegThumbsUp, FaStar, FaStarHalfAlt, FaEdit, FaTrash, FaReply } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import reviewService from "@/services/reviewService";

const StarRating = ({ rating, onRatingChange, readonly = false, size = 16 }) => {
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleStarClick = (starRating) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const handleStarHover = (starRating) => {
    if (!readonly) {
      setHoveredRating(starRating);
    }
  };

  const handleStarLeave = () => {
    if (!readonly) {
      setHoveredRating(0);
    }
  };

  const displayRating = readonly ? rating : (hoveredRating || rating);

  return (
    <div className="d-inline-flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`me-1 ${!readonly ? 'cursor-pointer' : ''}`}
          onClick={() => handleStarClick(star)}
          onMouseEnter={() => handleStarHover(star)}
          onMouseLeave={handleStarLeave}
        >
          {star <= Math.floor(displayRating) ? (
            <FaStar size={size} className="text-warning" />
          ) : star <= Math.ceil(displayRating) && displayRating % 1 !== 0 ? (
            <FaStarHalfAlt size={size} className="text-warning" />
          ) : (
            <FaRegStar size={size} className="text-warning" />
          )}
        </span>
      ))}
    </div>
  );
};

const ReviewForm = ({ courseId, onReviewSubmitted, editingReview = null, onCancel }) => {
  const [rating, setRating] = useState(editingReview?.rating || 0);
  const [comment, setComment] = useState(editingReview?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const validation = reviewService.ReviewUtils.validateReviewData({ rating, comment });
    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData = { rating, comment: comment.trim() };
      let response;

      if (editingReview) {
        response = await reviewService.updateReview(courseId, editingReview.id, reviewData);
      } else {
        response = await reviewService.submitReview(courseId, reviewData);
      }

      if (response.success) {
        toast.success(editingReview ? 'Review updated successfully!' : 'Review submitted successfully!');
        setRating(0);
        setComment('');
        setErrors({});
        onReviewSubmitted(response.data);
        if (onCancel) onCancel();
      } else {
        toast.error(response.error || 'Failed to submit review');
        setErrors({ submit: response.error });
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
      setErrors({ submit: 'Failed to submit review. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {errors.submit && (
        <Alert variant="danger" className="mb-3">
          {errors.submit}
        </Alert>
      )}

      <div className="mb-3">
        <label className="form-label">Rating *</label>
        <div>
          <StarRating rating={rating} onRatingChange={setRating} size={20} />
          {rating > 0 && <span className="ms-2 text-muted">({rating}/5)</span>}
        </div>
        {errors.rating && <div className="text-danger small mt-1">{errors.rating}</div>}
      </div>

      <div className="mb-3">
        <label htmlFor="reviewComment" className="form-label">Your Review *</label>
        <textarea
          id="reviewComment"
          className={`form-control ${errors.comment ? 'is-invalid' : ''}`}
          rows={4}
          placeholder="Share your experience with this course..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={1000}
        />
        <div className="d-flex justify-content-between mt-1">
          <div>
            {errors.comment && <div className="text-danger small">{errors.comment}</div>}
          </div>
          <small className="text-muted">{comment.length}/1000</small>
        </div>
      </div>

      <div className="d-flex gap-2">
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting && <Spinner size="sm" className="me-2" />}
          {editingReview ? 'Update Review' : 'Submit Review'}
        </Button>

        {onCancel && (
          <Button
            type="button"
            variant="outline-secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
      </div>
    </Form>
  );
};

const ReviewItem = ({ review, courseId, currentUser, onReviewUpdated, onReviewDeleted }) => {
  const [userVote, setUserVote] = useState(null);
  const [helpfulVotes, setHelpfulVotes] = useState(review.helpfulVotes);
  const [unhelpfulVotes, setUnhelpfulVotes] = useState(review.unhelpfulVotes);
  const [isVoting, setIsVoting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isOwner = currentUser && review.user.id === currentUser.id;
  const canVote = currentUser && currentUser.role === 'learner' && !isOwner;

  useEffect(() => {
    if (canVote) {
      fetchUserVote();
    }
  }, [canVote, review.id]);

  const fetchUserVote = async () => {
    try {
      const response = await reviewService.getUserVote(courseId, review.id);

      if (response.success) {
        setUserVote(response.data.userVote);
        setHelpfulVotes(response.data.helpfulVotes);
        setUnhelpfulVotes(response.data.unhelpfulVotes);
      }
    } catch (error) {
      console.error('Error fetching vote:', error);
    }
  };

  const handleVote = async (voteType) => {
    if (!canVote || isVoting) return;

    setIsVoting(true);

    try {
      const response = await reviewService.voteOnReview(courseId, review.id, voteType);

      if (response.success) {
        setUserVote(response.data.userVote);
        setHelpfulVotes(response.data.helpfulVotes);
        setUnhelpfulVotes(response.data.unhelpfulVotes);
      } else {
        toast.error(response.error || 'Failed to record vote');
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to record vote');
    } finally {
      setIsVoting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await reviewService.deleteReview(courseId, review.id);

      if (response.success) {
        toast.success('Review deleted successfully');
        onReviewDeleted(review.id);
        setShowDeleteModal(false);
      } else {
        toast.error(response.error || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  return (
    <div className="mb-4">
      <div className="d-flex">
        <div className="avatar avatar-lg me-3 flex-shrink-0">
          {review.user.avatar ? (
            <img
              className="avatar-img rounded-circle"
              src={review.user.avatar || '/default-avatar.png'}
              alt={review.user.name}
              style={{ width: '48px', height: '48px', objectFit: 'cover' }}
            />
          ) : (
            <div
              className="avatar-img rounded-circle border border-white bg-light d-flex align-items-center justify-content-center mx-auto"
              style={{ width: '48px', height: '48px', objectFit: 'cover', fontSize: '1rem', border: '4px solid #f8f9fa' }}
            >
              {(review.user.name || 'User').charAt(0).toUpperCase()}
            </div>
          )}

        </div>

        <div className="flex-grow-1">
          <div className="d-sm-flex justify-content-between align-items-start mb-2">
            <div>
              <h6 className="mb-1">{review.user.name}</h6>
              <div className="d-flex align-items-center mb-1">
                <StarRating rating={review.rating} readonly size={14} />
                <span className="ms-2 small text-muted">
                  {reviewService.ReviewUtils.formatTimeSince(review.createdAt)}
                </span>
                {review.isVerifiedPurchase && (
                  <span className="badge bg-success ms-2 small">Verified Purchase</span>
                )}
              </div>
            </div>

            {isOwner && (
              <div className="d-flex gap-1">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => setShowEditModal(true)}
                >
                  <FaEdit size={12} />
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <FaTrash size={12} />
                </Button>
              </div>
            )}
          </div>

          <p className="mb-2">{review.comment}</p>

          {canVote && (
            <div className="d-flex align-items-center gap-2">
              <small className="text-muted me-2">Was this helpful?</small>
              <div className="btn-group" role="group">
                <button
                  type="button"
                  className={`btn btn-sm ${userVote === 'helpful' ? 'btn-success' : 'btn-outline-success'}`}
                  onClick={() => handleVote('helpful')}
                  disabled={isVoting}
                >
                  <FaRegThumbsUp className="me-1" size={12} />
                  {helpfulVotes}
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${userVote === 'unhelpful' ? 'btn-danger' : 'btn-outline-danger'}`}
                  onClick={() => handleVote('unhelpful')}
                  disabled={isVoting}
                >
                  <FaRegThumbsDown className="me-1" size={12} />
                  {unhelpfulVotes}
                </button>
              </div>
            </div>
          )}

          {review.instructorReply && (
            <div className="mt-3 ps-3 border-start border-primary">
              <div className="d-flex align-items-start">
                <div className="avatar avatar-sm me-2 flex-shrink-0">
                  <img
                    className="avatar-img rounded-circle"
                    src={review.instructorReply.instructor.avatar || '/default-avatar.png'}
                    alt={review.instructorReply.instructor.name}
                    style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                  />
                </div>
                <div>
                  <div className="d-flex align-items-center mb-1">
                    <h6 className="mb-0 me-2">{review.instructorReply.instructor.name}</h6>
                    <span className="badge bg-primary small">Instructor</span>
                    <span className="ms-2 small text-muted">
                      {reviewService.ReviewUtils.formatTimeSince(review.instructorReply.repliedAt)}
                    </span>
                  </div>
                  <p className="mb-0 small">{review.instructorReply.comment}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Review Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ReviewForm
            courseId={courseId}
            editingReview={review}
            onReviewSubmitted={(updatedReview) => {
              onReviewUpdated(updatedReview);
              setShowEditModal(false);
            }}
            onCancel={() => setShowEditModal(false)}
          />
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this review? This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete Review
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

const Reviews = ({ courseId }) => {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [ratingStats, setRatingStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('newest');
  const [hasUserReviewed, setHasUserReviewed] = useState(false);

  const isLearner = user?.role === 'learner';
  const canWriteReview = isAuthenticated && isLearner && !hasUserReviewed;

  useEffect(() => {
    fetchReviews();
  }, [courseId, currentPage, sortBy]);

  useEffect(() => {
    if (isAuthenticated && isLearner) {
      checkIfUserReviewed();
    }
  }, [isAuthenticated, isLearner, courseId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewService.getCourseReviews(courseId, {
        page: currentPage,
        limit: 10,
        sortBy
      });

      if (response.success) {
        setReviews(response.data.reviews);
        setRatingStats(response.data.ratingStats);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        toast.error('Failed to load reviews');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const checkIfUserReviewed = async () => {
    try {
      const response = await reviewService.checkUserReviewStatus(courseId);

      if (response.success) {
        setHasUserReviewed(response.data.hasReviewed);
      }
    } catch (error) {
      console.error('Error checking user review:', error);
    }
  };

  const handleReviewSubmitted = (newReview) => {
    setReviews(prev => [newReview, ...prev]);
    setHasUserReviewed(true);
    fetchReviews(); // Refresh to get updated stats
  };

  const handleReviewUpdated = (updatedReview) => {
    setReviews(prev => prev.map(review =>
      review.id === updatedReview.id ? updatedReview : review
    ));
    fetchReviews(); // Refresh to get updated stats
  };

  const handleReviewDeleted = (reviewId) => {
    setReviews(prev => prev.filter(review => review.id !== reviewId));
    const deletedReview = reviews.find(r => r.id === reviewId);
    if (deletedReview && deletedReview.user.id === user?.id) {
      setHasUserReviewed(false);
    }
    fetchReviews(); // Refresh to get updated stats
  };

  const renderRatingDistribution = () => {
    const total = ratingStats.totalReviews;
    if (total === 0) return null;

    const percentages = reviewService.ReviewUtils.getRatingPercentages(
      ratingStats.ratingDistribution,
      total
    );

    return (
      <div>
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = ratingStats.ratingDistribution[rating] || 0;
          const percentage = percentages[rating];

          return (
            <Row className="align-items-center mb-1" key={rating}>
              <Col xs={2}>
                <div className="d-flex align-items-center">
                  <span className="small me-1">{rating}</span>
                  <FaStar size={12} className="text-warning" />
                </div>
              </Col>
              <Col xs={8}>
                <ProgressBar
                  variant="warning"
                  className="progress-sm"
                  now={percentage}
                  style={{ height: '6px' }}
                />
              </Col>
              <Col xs={2}>
                <span className="small text-muted">{count}</span>
              </Col>
            </Row>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading reviews...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div>
      {/* Rating Overview */}
      <Row className="mb-4">
        <h5 className="mb-4">Student Reviews</h5>
        <Col md={4} className="mb-3 mb-md-0">
          <div className="text-center">
            <h2 className="mb-0">{ratingStats.averageRating}</h2>
            <div className="mb-2">
              <StarRating rating={ratingStats.averageRating} readonly size={16} />
            </div>
            <p className="mb-0 small text-muted">
              Based on {ratingStats.totalReviews} review{ratingStats.totalReviews !== 1 ? 's' : ''}
            </p>
          </div>
        </Col>
        <Col md={8}>
          {renderRatingDistribution()}
        </Col>
      </Row>

      {/* Write Review Section */}
      {canWriteReview && (
        <div className="mb-4 p-4 bg-light rounded">
          <h6 className="mb-3">Write a Review</h6>
          <ReviewForm
            courseId={courseId}
            onReviewSubmitted={handleReviewSubmitted}
          />
        </div>
      )}

      {hasUserReviewed && isLearner && (
        <Alert variant="info" className="mb-4">
          You have already reviewed this course. You can edit or delete your review below.
        </Alert>
      )}

      {!isAuthenticated && (
        <Alert variant="warning" className="mb-4">
          Please <strong>sign in</strong> to write a review for this course.
        </Alert>
      )}

      {/* Sort and Filter Controls */}
      {ratingStats.totalReviews > 0 && (
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h6 className="mb-0">
            {ratingStats.totalReviews} Review{ratingStats.totalReviews !== 1 ? 's' : ''}
          </h6>
          <div className="d-flex align-items-center">
            <label className="me-2 small">Sort by:</label>
            <select
              className="form-select form-select-sm"
              style={{ width: 'auto' }}
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="helpful">Most Helpful</option>
              <option value="rating_high">Highest Rating</option>
              <option value="rating_low">Lowest Rating</option>
            </select>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div>
          {reviews.map((review) => (
            <ReviewItem
              key={review.id}
              review={review}
              courseId={courseId}
              currentUser={user}
              onReviewUpdated={handleReviewUpdated}
              onReviewDeleted={handleReviewDeleted}
            />
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <nav>
                <ul className="pagination">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                  </li>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    </li>
                  ))}

                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-5">
          <p className="text-muted">No reviews yet. Be the first to review this course!</p>
        </div>
      )}
    </div>
  );
};

export default Reviews;