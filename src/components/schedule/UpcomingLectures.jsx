'use client';

import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Badge, Spinner, Alert } from 'react-bootstrap';
import { FaCalendarAlt, FaClock, FaLock, FaUnlock, FaExclamationTriangle } from 'react-icons/fa';
import LectureAccessIndicator from './LectureAccessIndicator';
import { enrollmentService } from '@/services/enrollmentService';

const UpcomingLectures = ({ initialEnrolledCourses = [] }) => {
  const [enrolledCourses, setEnrolledCourses] = useState(initialEnrolledCourses);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [upcomingLectures, setUpcomingLectures] = useState([]);

  // Fetch enrolled courses
  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  // Extract upcoming lectures when enrolled courses change
  useEffect(() => {
    if (enrolledCourses.length > 0) {
      extractUpcomingLectures();
    }
  }, [enrolledCourses]);

  // Fetch enrolled courses
  const fetchEnrolledCourses = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await enrollmentService.getEnrolledCourses();
      if (response.success) {
        setEnrolledCourses(response.bookings);
      } else {
        setError('Failed to fetch enrolled courses');
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      setError('Failed to load your upcoming lectures. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Extract upcoming lectures from enrolled courses
  const extractUpcomingLectures = () => {
    const now = new Date();
    const lectures = [];

    // Extract lectures from enrolled courses
    enrolledCourses.forEach(enrollment => {
      if (enrollment.course?.lectures) {
        enrollment.course.lectures.forEach(lecture => {
          const lectureDate = new Date(lecture.scheduledDate);

          // Only include future lectures or lectures from today
          if (lectureDate >= now ||
            (lectureDate.getDate() === now.getDate() &&
              lectureDate.getMonth() === now.getMonth() &&
              lectureDate.getFullYear() === now.getFullYear())) {

            lectures.push({
              ...lecture,
              courseId: enrollment.course.id,
              courseTitle: enrollment.course.title,
              courseType: enrollment.course.format,
              courseColor: enrollment.course.color,
            });
          }
        });
      }
    });

    // Sort lectures by scheduled date
    lectures.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

    // Take only the next 5 lectures
    setUpcomingLectures(lectures.slice(0, 5));
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if it's today or tomorrow
    if (date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()) {
      return 'Today';
    } else if (date.getDate() === tomorrow.getDate() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getFullYear() === tomorrow.getFullYear()) {
      return 'Tomorrow';
    } else {
      // Otherwise, return the day of the week
      const options = { weekday: 'long' };
      return date.toLocaleDateString('en-US', options);
    }
  };

  // Format time for display
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <Card className="shadow-sm h-100">
      <Card.Header className="bg-transparent">
        <h5 className="mb-0">
          <FaCalendarAlt className="me-2" />
          Upcoming Lectures
        </h5>
      </Card.Header>

      <Card.Body className="p-0">
        {isLoading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
            <p className="mt-3">Loading your upcoming lectures...</p>
          </div>
        ) : error ? (
          <Alert variant="danger" className="m-3">
            <FaExclamationTriangle className="me-2" />
            {error}
          </Alert>
        ) : upcomingLectures.length > 0 ? (
          <ListGroup variant="flush">
            {upcomingLectures.map(lecture => (
              <ListGroup.Item key={lecture.id} className="px-3 py-3">
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <div className="lecture-title">
                    {lecture.title}
                  </div>

                  <Badge
                    bg={lecture.courseType === 'live' ? 'danger' : 'success'}
                    className="ms-2"
                  >
                    {lecture.courseType === 'live' ? (
                      <>
                        <FaLock className="me-1" size={10} />
                        LIVE
                      </>
                    ) : (
                      <>
                        <FaUnlock className="me-1" size={10} />
                        RECORDED
                      </>
                    )}
                  </Badge>
                </div>

                <div className="course-title text-muted mb-2">
                  {lecture.courseTitle}
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  <div className="lecture-schedule">
                    <div className="d-flex align-items-center text-muted">
                      <FaCalendarAlt className="me-2" size={12} />
                      <span className="small">{formatDate(lecture.scheduledDate)}</span>
                    </div>

                    <div className="d-flex align-items-center text-muted mt-1">
                      <FaClock className="me-2" size={12} />
                      <span className="small">{formatTime(lecture.scheduledDate)}</span>
                    </div>
                  </div>

                  <LectureAccessIndicator lecture={lecture} />
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <div className="text-center py-4">
            <p className="mb-0">No upcoming lectures found.</p>
          </div>
        )}
      </Card.Body>

      <style jsx global>{`
        .lecture-title {
          font-weight: 500;
        }

        .course-title {
          font-size: 0.85rem;
        }
      `}</style>
    </Card>
  );
};

export default UpcomingLectures;
