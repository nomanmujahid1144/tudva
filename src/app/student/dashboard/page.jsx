'use client';

import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import Counter from './components/Counter';
import CoursesList from './components/CoursesList';
import WeeklyCalendar from './components/WeeklyCalendar';
import UpcomingLectures from './components/UpcomingLectures';

export const metadata = {
  title: 'Student Dashboard'
};

const DashboardPage = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  // Fetch enrolled courses
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        // Try file-based API first
        const response = await fetch('/api/file-enrollments/user');

        if (!response.ok) {
          // If file-based API fails, try the database API
          const dbResponse = await fetch('/api/enrollments/user');

          if (!dbResponse.ok) {
            throw new Error('Failed to fetch enrolled courses');
          }

          const data = await dbResponse.json();
          if (data.success && data.enrollments) {
            setEnrolledCourses(data.enrollments.map(enrollment => enrollment.course));
          }
        } else {
          const data = await response.json();
          if (data.success && data.enrollments) {
            setEnrolledCourses(data.enrollments.map(enrollment => enrollment.course));
          }
        }
      } catch (err) {
        console.error('Error fetching enrolled courses:', err);

        // Generate mock courses for demo purposes
        generateMockCourses();
      }
    };

    fetchEnrolledCourses();
  }, []);

  // Generate mock courses for demo purposes
  const generateMockCourses = () => {
    const mockCourses = [
      {
        id: 'mock-1',
        title: 'Introduction to Web Development',
        format: 'recorded',
        image: '/images/courses/course-1.jpg'
      },
      {
        id: 'mock-2',
        title: 'Advanced JavaScript Concepts',
        format: 'live',
        image: '/images/courses/course-2.jpg'
      },
      {
        id: 'mock-3',
        title: 'React.js Fundamentals',
        format: 'recorded',
        image: '/images/courses/course-3.jpg'
      },
      {
        id: 'mock-4',
        title: 'Node.js Backend Development',
        format: 'live',
        image: '/images/courses/course-4.jpg'
      },
      {
        id: 'mock-5',
        title: 'Database Design and SQL',
        format: 'recorded',
        image: '/images/courses/course-5.jpg'
      }
    ];

    setEnrolledCourses(mockCourses);
  };

  return (
    <>
      <Counter />
      <Row className="g-4 mb-4">
        <Col lg={12}>
          <WeeklyCalendar enrolledCourses={enrolledCourses} />
        </Col>
      </Row>
      <Row className="g-4 mb-4">
        <Col lg={8}>
          <CoursesList />
        </Col>
        <Col lg={4}>
          <UpcomingLectures enrolledCourses={enrolledCourses} />
        </Col>
      </Row>
    </>
  );
};

export default DashboardPage;
