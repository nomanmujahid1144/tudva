'use client';

import React, { useState } from 'react';
import { Container, Row, Col, Card, Tabs, Tab, Alert } from 'react-bootstrap';
import EnrollButton from '@/components/enrollment/EnrollButton';
import WeeklyCalendar from '@/components/schedule/WeeklyCalendar';
import UpcomingLectures from '@/components/schedule/UpcomingLectures';
import EnhancedPlaylist from '@/app/pages/course/detail-min/[id]/components/EnhancedPlaylist';
import { sampleCourses, enrolledCourses } from '@/utils/dummyData/enrollmentData';
import { FaInfoCircle } from 'react-icons/fa';

const EnhancedEnrollmentDemo = () => {
  const [activeTab, setActiveTab] = useState('enrollment');
  
  // Sample course data for the playlist demo
  const sampleCourseForPlaylist = {
    modules: {
      'Module 1: Introduction': [
        {
          id: 'lecture-1',
          title: 'Introduction to the Course',
          duration: '10:00',
          watched: true,
          videoUrl: 'https://example.com/video1',
          scheduledDate: '2023-06-05T09:00:00Z', // Past date (accessible)
        },
        {
          id: 'lecture-2',
          title: 'Course Overview',
          duration: '15:00',
          watched: false,
          videoUrl: 'https://example.com/video2',
          scheduledDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow (locked)
        },
      ],
      'Module 2: Getting Started': [
        {
          id: 'lecture-3',
          title: 'Setting Up Your Environment',
          duration: '20:00',
          watched: false,
          videoUrl: 'https://example.com/video3',
          scheduledDate: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow (locked)
        },
        {
          id: 'lecture-4',
          title: 'Your First Project',
          duration: '25:00',
          watched: false,
          videoUrl: 'https://example.com/video4',
          scheduledDate: new Date(Date.now() + 259200000).toISOString(), // 3 days from now (locked)
        },
      ],
    },
  };

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1 className="mb-2">Enhanced Enrollment System Demo</h1>
          <p className="lead">
            This demo showcases the components for the enhanced enrollment system.
          </p>
          <Alert variant="info" className="d-flex">
            <FaInfoCircle className="me-2 mt-1" />
            <div>
              <strong>Demo Note:</strong> This is a frontend demo with dummy data. In a real implementation, these components would be connected to backend APIs.
            </div>
          </Alert>
        </Col>
      </Row>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="enrollment" title="Enrollment">
          <Row>
            <Col lg={12} className="mb-4">
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Enrollment Button Component</h5>
                </Card.Header>
                <Card.Body>
                  <p>
                    The EnrollButton component allows students to enroll in courses with different enrollment rules based on course type (live vs. recorded).
                  </p>
                  <div className="d-flex flex-wrap gap-3">
                    {sampleCourses.map(course => (
                      <div key={course.id} className="mb-3">
                        <Card className="shadow-sm">
                          <Card.Body>
                            <h5>{course.title}</h5>
                            <p className="text-muted">{course.description}</p>
                            <p>
                              <strong>Type:</strong> {course.format.toUpperCase()}
                            </p>
                            <p>
                              <strong>Day:</strong> {course.seminarDay.name}
                            </p>
                            <EnrollButton course={course} />
                          </Card.Body>
                        </Card>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="schedule" title="Schedule Management">
          <Row>
            <Col lg={8} className="mb-4">
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Weekly Calendar Component</h5>
                </Card.Header>
                <Card.Body className="p-0">
                  <WeeklyCalendar initialEnrolledCourses={enrolledCourses} />
                </Card.Body>
                <Card.Footer>
                  <p className="mb-0 small text-muted">
                    <strong>Note:</strong> Recorded courses can be dragged and dropped to reschedule them. Live courses are fixed and cannot be rescheduled.
                  </p>
                </Card.Footer>
              </Card>
            </Col>

            <Col lg={4} className="mb-4">
              <UpcomingLectures initialEnrolledCourses={enrolledCourses} />
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="lectures" title="Lecture Access">
          <Row>
            <Col lg={12} className="mb-4">
              <Card>
                <Card.Header>
                  <h5 className="mb-0">Enhanced Playlist Component</h5>
                </Card.Header>
                <Card.Body>
                  <p>
                    The EnhancedPlaylist component shows lecture access status and implements time-based access control.
                  </p>
                  <EnhancedPlaylist course={sampleCourseForPlaylist} />
                </Card.Body>
                <Card.Footer>
                  <p className="mb-0 small text-muted">
                    <strong>Note:</strong> Lectures become accessible based on their scheduled time. The first lecture is already accessible, while others are locked with countdown timers.
                  </p>
                </Card.Footer>
              </Card>
            </Col>
          </Row>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default EnhancedEnrollmentDemo;
