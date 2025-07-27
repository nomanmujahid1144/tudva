"use client";

import { Fragment, useState, useEffect } from "react";
import { Accordion, AccordionBody, AccordionHeader, AccordionItem, Button, Card, CardBody, Col, Nav, NavItem, NavLink, Row, TabContainer, TabContent, TabPane } from "react-bootstrap";
import { FaCheck, FaRegClock, FaStar } from "react-icons/fa";
import ReviewList from "@/components/reviews/ReviewList";
import ReviewForm from "@/components/reviews/ReviewForm";
import LectureScheduleDisplay from "./LectureScheduleDisplay";

// Helper function to split array into chunks
const splitArray = (array, chunkSize) => {
  const result = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
};

// Overview component
const Overview = ({ course }) => {
  return (
    <>
      <h5 className="mb-3">Course Description</h5>
      <div dangerouslySetInnerHTML={{ __html: course?.course?.description || course?.description || '' }} />
    </>
  );
};

// Schedule component
const Schedule = ({ course }) => {
  return (
    <>
      <h5 className="mb-3">Course Schedule</h5>
      <LectureScheduleDisplay
        courseId={course?.course?.id}
        courseType={course?.course?.courseType || course?.course?.format || 'recorded'}
      />
    </>
  );
};

// UserReviews component
const UserReviews = ({ course }) => {
  // Get course ID from course data
  const courseId = course?.course?.id;
  const [hasReviews, setHasReviews] = useState(false);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Check if the course has any reviews
  useEffect(() => {
    const checkReviews = async () => {
      if (!courseId) return;
      
      try {
        // Try to get reviews count from API
        const response = await fetch(`/api/file-reviews/course/${courseId}/count`);
        const data = await response.json();
        
        if (data.success && data.count > 0) {
          setHasReviews(true);
          setReviewsCount(data.count);
        } else {
          setHasReviews(false);
          setReviewsCount(0);
        }
      } catch (error) {
        console.error('Error checking reviews:', error);
        setHasReviews(false);
      }
    };
    
    checkReviews();
  }, [courseId]);

  if (!courseId) {
    return (
      <div className="text-center py-4">
        <p>Course information not available.</p>
        <p className="text-muted small">Please try refreshing the page or contact support if the issue persists.</p>
      </div>
    );
  }

  // If there are no reviews, show a message with a button to add a review
  if (!hasReviews) {
    return (
      <div className="text-center py-4">
        <h5 className="mb-3">No Reviews Yet</h5>
        <p>This course doesn't have any reviews yet. Be the first to review!</p>
        <Button 
          variant="primary" 
          onClick={() => setShowReviewForm(true)}
          className="mt-3"
        >
          Write a Review
        </Button>
        
        {showReviewForm && (
          <div className="mt-4 text-start">
            <ReviewForm
              courseId={courseId}
              onReviewSubmitted={async (data) => {
                try {
                  const response = await fetch('/api/file-reviews', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      course_id: courseId,
                      content: data.content,
                      rating: data.rating,
                    }),
                  });
                  
                  const result = await response.json();
                  
                  if (result.success) {
                    setShowReviewForm(false);
                    setHasReviews(true);
                    setReviewsCount(1);
                    return { success: true };
                  } else {
                    return { success: false, error: result.error || 'Failed to submit review' };
                  }
                } catch (error) {
                  console.error('Error submitting review:', error);
                  return { success: false, error: error.message || 'Failed to submit review' };
                }
              }}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowReviewForm(false)}
              className="mt-2"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <Row className="mb-4">
        <h5 className="mb-4">Our Student Reviews ({reviewsCount})</h5>
        <Col md={12}>
          <div className="mb-4">
            <ReviewList courseId={courseId} />
          </div>
          
          {!showReviewForm && (
            <Button 
              variant="primary" 
              onClick={() => setShowReviewForm(true)}
              className="mt-3"
            >
              Write a Review
            </Button>
          )}
          
          {showReviewForm && (
            <div className="mt-4 border p-4 rounded bg-light">
              <h5 className="mb-3">Write Your Review</h5>
              <ReviewForm
                courseId={courseId}
                onReviewSubmitted={async (data) => {
                  try {
                    const response = await fetch('/api/file-reviews', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        course_id: courseId,
                        content: data.content,
                        rating: data.rating,
                      }),
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                      setShowReviewForm(false);
                      // Refresh the page to show the new review
                      window.location.reload();
                      return { success: true };
                    } else {
                      return { success: false, error: result.error || 'Failed to submit review' };
                    }
                  } catch (error) {
                    console.error('Error submitting review:', error);
                    return { success: false, error: error.message || 'Failed to submit review' };
                  }
                }}
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowReviewForm(false)}
                className="mt-2"
              >
                Cancel
              </Button>
            </div>
          )}
        </Col>
      </Row>
    </>
  );
};

// FAQs component
const FAQs = ({ course }) => {
  const faqs = course?.course?.faqs || [];
  
  if (!faqs || faqs.length === 0) {
    return (
      <div className="text-center py-4">
        <p>No FAQs available for this course.</p>
      </div>
    );
  }
  
  return (
    <>
      <h5 className="mb-4">Frequently Asked Questions</h5>
      <Accordion defaultActiveKey="0" className="accordion-icon accordion-bg-light">
        {faqs.map((faq, index) => (
          <AccordionItem eventKey={index.toString()} key={index}>
            <AccordionHeader>
              {faq.question}
            </AccordionHeader>
            <AccordionBody>
              <p>{faq.answer}</p>
            </AccordionBody>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  );
};

const CourseTab = ({ course }) => {
  return (
    <TabContainer defaultActiveKey='overview'>
      <Card className="shadow rounded-2 p-0">
        <CardBody className="p-0">
          <CardBody className="border-bottom px-4 py-3">
            <Nav className="nav-pills nav-tabs-line py-0" id="course-pills-tab" role="tablist">
              <NavItem className="me-2 me-sm-4" role="presentation">
                <NavLink as='button' className="mb-2 mb-md-0" type="button" eventKey="overview">Overview</NavLink>
              </NavItem>
              <NavItem className="me-2 me-sm-4" role="presentation">
                <NavLink as='button' className="mb-2 mb-md-0" type="button" eventKey="curriculum">Curriculum</NavLink>
              </NavItem>
              <NavItem className="me-2 me-sm-4" role="presentation">
                <NavLink as='button' className="mb-2 mb-md-0" type="button" eventKey="instructor">Instructor</NavLink>
              </NavItem>
              <NavItem className="me-2 me-sm-4" role="presentation">
                <NavLink as='button' className="mb-2 mb-md-0" type="button" eventKey="reviews">Reviews</NavLink>
              </NavItem>
              <NavItem className="me-2 me-sm-4" role="presentation">
                <NavLink as='button' className="mb-2 mb-md-0" type="button" eventKey="faqs">FAQs</NavLink>
              </NavItem>
            </Nav>
          </CardBody>
          <CardBody className="p-4">
            <TabContent id="course-pills-tabContent">
              <TabPane eventKey='overview' className="fade" role="tabpanel">
                <Overview course={course} />
              </TabPane>
              <TabPane eventKey='curriculum' className="fade" role="tabpanel">
                <Schedule course={course} />
              </TabPane>
              <TabPane eventKey='instructor' className="fade" role="tabpanel">
                <div className="d-sm-flex align-items-center">
                  <div className="avatar avatar-xxl">
                    <img
                      className="avatar-img rounded-circle"
                      src={course?.course?.instructor?.profilePicture || '/assets/images/avatar/placeholder.svg'}
                      alt={course?.course?.instructor?.fullName || 'Instructor'}
                    />
                  </div>
                  <div className="ms-sm-4 mt-3">
                    <h3>{course?.course?.instructor?.fullName || 'Instructor Name'}</h3>
                    <p className="mb-0">{course?.course?.instructor?.aboutMe || 'Course Instructor'}</p>
                  </div>
                </div>
              </TabPane>
              <TabPane eventKey='reviews' className="fade" role="tabpanel">
                <UserReviews course={course} />
              </TabPane>
              <TabPane eventKey='faqs' className="fade" role="tabpanel">
                <FAQs course={course} />
              </TabPane>
            </TabContent>
          </CardBody>
        </CardBody>
      </Card>
    </TabContainer>
  );
};

export default CourseTab;
