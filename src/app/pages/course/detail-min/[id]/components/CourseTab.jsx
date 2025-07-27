"use client";

import { Accordion, AccordionBody, AccordionHeader, AccordionItem, Button, Col, Nav, NavItem, NavLink, ProgressBar, Row, TabContainer, TabContent, TabPane, Card, CardBody } from "react-bootstrap";
import Image from "next/image";
import Link from "next/link";
import { Fragment, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { FaCheckCircle, FaRegStar, FaReply, FaStar, FaStarHalfAlt, FaCalendarAlt, FaPlay, FaLock, FaHeadset, FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaRegEnvelope } from "react-icons/fa";
import { BsPatchCheckFill } from "react-icons/bs";
import * as yup from 'yup';
import { useFetchData } from "@/hooks/useFetchData";
import { splitArray } from "@/utils/array";
import { timeSince } from "@/utils/date";
import ChoicesFormInput from "@/components/form/ChoicesFormInput";
import TextAreaFormInput from "@/components/form/TextAreaFormInput";
import TextFormInput from "@/components/form/TextFormInput";
import { yupResolver } from "@hookform/resolvers/yup";
import clsx from "clsx";
import avatar9 from '@/assets/images/avatar/09.jpg';
import { commentData, faqsData } from "../data";
import { getAllUserReviews } from "@/helpers/data";
import ReviewList from "@/components/reviews/ReviewList";
import ReviewForm from "@/components/reviews/ReviewForm";
// Import the local copy of LectureScheduleDisplay
import LectureScheduleDisplay from "./LectureScheduleDisplay";
import useToggle from "@/hooks/useToggle";
const Overview = ({ course }) => {
  console.log('Overview component received course:', course);
  const features = ["Digital marketing course introduction", "Customer Life cycle", "What is Search engine optimization(SEO)", "Facebook ADS", "Facebook Messenger Chatbot", "Search engine optimization tools", "Why SEO", "URL Structure", "Featured Snippet", "SEO tips and tricks", "Google tag manager"];
  const featureChunks = splitArray(features, 2);
  return <>
    <h5 className="mb-3">Course Description</h5>
    <div dangerouslySetInnerHTML={{ __html: course?.course?.description || course?.description || '' }} />
    <h5 className="mt-4">What you’ll learn</h5>
    <Row className="mb-3">
      {featureChunks.map((chunk, idx) => <Col md={6} key={idx}>
        <ul className="list-group list-group-borderless">
          {chunk.map((feature, idx) => <li className="list-group-item h6 fw-light d-flex mb-0" key={idx}><FaCheckCircle className="text-success me-2" />{feature}</li>)}
        </ul>
      </Col>)}
    </Row>

    {course?.course?.level && (
      <div className="mt-4">
        <h5 className="mb-2">Course Level</h5>
        <p>{course.course.level}</p>
      </div>
    )}

    {course?.course?.language && (
      <div className="mt-4">
        <h5 className="mb-2">Language</h5>
        <p>{course.course.language}</p>
      </div>
    )}
  </>;
};
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
    console.warn('Course ID not available for reviews:', course);
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
const Faqs = ({ course }) => {
  return <>
    <h5 className="mb-3">Frequently Asked Questions</h5>
    {course?.faqs?.map((faq, id) => <div className="mt-4" key={id}>
      <h6>{faq.question}</h6>
      <p className="mb-0">{faq.answer}</p>
    </div>)}
  </>;
};
const Comment = () => {
  return <Row className="mb-4">
    <Col xs={12}>
      <h5 className="mb-4">Ask Your Question</h5>
      <div className="d-flex mb-4">
        <div className="avatar avatar-sm flex-shrink-0 me-2">
          <span role='button'> <Image className="avatar-img rounded-circle" src={avatar9} alt="avatar" /> </span>
        </div>
        <form className="w-100 d-flex">
          <textarea className="one form-control pe-4 bg-light" id="autoheighttextarea" rows={1} placeholder="Add a comment..." defaultValue={""} />
          <Button variant='primary' className="ms-2 mb-0" type="button">Post</Button>
        </form>
      </div>
      {commentData.map((comment, idx) => <div className={clsx("border p-2 p-sm-4 rounded-3", {
        "mb-4": commentData.length - 1 != idx
      })} key={idx}>
        <ul className="list-unstyled mb-0">
          <li className="comment-item">
            <div className={clsx("d-flex", {
              "mb-3": comment.reply
            })}>
              <div className="avatar avatar-sm flex-shrink-0">
                <span role='button'><Image className="avatar-img rounded-circle" src={comment.avatar} alt="avatar" /></span>
              </div>
              <div className="ms-2">
                <div className="bg-light p-3 rounded">
                  <div className="d-flex justify-content-center">
                    <div className="me-2">
                      <h6 className="mb-1 lead fw-bold"> <a href="#!"> {comment.name} </a></h6>
                      <p className="h6 mb-0">{comment.comment}</p>
                    </div>
                    <small className='text-nowrap'>{timeSince(comment.time)}</small>
                  </div>
                </div>
                <ul className="nav nav-divider py-2 small">
                  <li className="nav-item"> <a className="text-primary-hover" href="#"> Like {comment.like && comment.like}</a> </li>
                  <li className="nav-item"> <a className="text-primary-hover" href="#"> Reply</a> </li>
                  {comment.replies && <li className="nav-item"> <a className="text-primary-hover" href="#"> View {comment.replies} replies</a> </li>}
                </ul>
              </div>
            </div>
            {comment.reply && comment.reply.map((comment, idx) => <ul className="list-unstyled ms-4" key={idx}>
              <li className="comment-item">
                <div className="d-flex">
                  <div className="avatar avatar-xs flex-shrink-0">
                    <span role='button'><Image className="avatar-img rounded-circle" src={comment.avatar} alt="avatar" /></span>
                  </div>
                  <div className="ms-2">
                    <div className="bg-light p-3 rounded">
                      <div className="d-flex justify-content-center">
                        <div className="me-2">
                          <h6 className="mb-1  lead fw-bold"> <a href="#"> {comment.name} </a> </h6>
                          <p className=" mb-0">{comment.comment}</p>
                        </div>
                        <small className='text-nowrap'>{timeSince(comment.time)}</small>
                      </div>
                    </div>
                    <ul className="nav nav-divider py-2 small">
                      <li className="nav-item"><Link className="text-primary-hover" href=""> Like {comment.like && comment.like}</Link></li>
                      <li className="nav-item"><Link className="text-primary-hover" href=""> Reply</Link>	</li>
                    </ul>
                  </div>
                </div>
              </li>
            </ul>)}
          </li>
        </ul>
      </div>)}
    </Col>
  </Row>;
};
// Schedule component
const Schedule = ({ course }) => {
  console.log('Schedule component received course:', course);
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

const CourseTab = ({ course }) => {
  return <TabContainer defaultActiveKey='overview'>
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
            <NavItem className="me-2 me-sm-4" role="presentation">
              <NavLink as='button' className="mb-2 mb-md-0" type="button" eventKey="comment">Comment</NavLink>
            </NavItem>
          </Nav>
        </CardBody>
        <CardBody className="p-4">
          <TabContent className="" id="course-pills-tabContent">
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
                    src={course?.course?.instructor?.profilePicture || '/assets/images/avatar/01.jpg'}
                    alt={course?.course?.instructor?.fullName || 'Instructor'}
                  />
                </div>
                <div className="ms-sm-4 mt-3">
                  <h3>{course?.course?.instructor?.fullName || 'Instructor Name'}</h3>
                  <p className="mb-0">{course?.course?.instructor?.aboutMe || 'Course Instructor'}</p>
                </div>
              </div>

              <hr className="my-4" />

              <div className="row mb-3">
                <div className="col-md-6">
                  <ul className="list-group list-group-borderless">
                    <li className="list-group-item pb-0">
                      <span className="h6 fw-light"><FaCheckCircle className="text-success me-2" />Email:</span>
                      <span className="h6">{course?.course?.instructor?.email || 'instructor@example.com'}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="d-sm-flex justify-content-sm-between">
                <div>
                  <h4 className="mb-2">Follow on social media</h4>
                  <ul className="list-inline mb-0">
                    <li className="list-inline-item me-3 mb-2">
                      <a href="#" className="btn btn-sm bg-facebook px-2 mb-0"><FaFacebookF /></a>
                    </li>
                    <li className="list-inline-item me-3 mb-2">
                      <a href="#" className="btn btn-sm bg-twitter px-2 mb-0"><FaTwitter /></a>
                    </li>
                    <li className="list-inline-item me-3 mb-2">
                      <a href="#" className="btn btn-sm bg-linkedin px-2 mb-0"><FaLinkedinIn /></a>
                    </li>
                  </ul>
                </div>
                <div className="mt-3 mt-sm-0">
                  <a href={`mailto:${course?.course?.instructor?.email || 'instructor@example.com'}`} className="btn btn-sm btn-primary-soft mb-0">
                    <FaRegEnvelope className="me-2" />Contact me
                  </a>
                </div>
              </div>
            </TabPane>
            <TabPane eventKey='reviews' className="fade" role="tabpanel">
              <UserReviews course={course} />
            </TabPane>
            <TabPane eventKey='faqs' className="fade" role="tabpanel">
              <Faqs course={course} />
            </TabPane>
            <TabPane eventKey='comment' className="fade" role="tabpanel">
              <Comment />
            </TabPane>
          </TabContent>
        </CardBody>
      </CardBody>
    </Card>
  </TabContainer>;
};
export default CourseTab;
