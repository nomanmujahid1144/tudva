'use client';

import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { FaCalendarAlt, FaClock, FaVideo, FaChalkboardTeacher, FaLock, FaUnlock, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { isLectureAccessible } from '@/utils/lectureAccess';

const UpcomingLectures = ({ enrolledCourses = [] }) => {
  const [upcomingLectures, setUpcomingLectures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Time slots reference
  const timeSlots = [
    { id: 1, time: '9:00 AM - 9:45 AM' },
    { id: 2, time: '9:45 AM - 10:30 AM' },
    { id: 3, time: '10:30 AM - 11:15 AM' },
    { id: 4, time: '11:15 AM - 12:00 PM' },
    { id: 5, time: '12:00 PM - 12:45 PM' },
    { id: 6, time: '12:45 PM - 1:30 PM' },
    { id: 7, time: '1:30 PM - 2:15 PM' },
    { id: 8, time: '2:15 PM - 3:00 PM' },
    { id: 9, time: '3:00 PM - 3:45 PM' },
    { id: 10, time: '3:45 PM - 4:30 PM' },
    { id: 11, time: '4:30 PM - 5:15 PM' },
  ];

  // Fetch lecture schedules for enrolled courses
  useEffect(() => {
    const fetchLectureSchedules = async () => {
      if (enrolledCourses.length === 0) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const allSchedules = [];

        // Fetch schedules for each enrolled course
        for (const course of enrolledCourses) {
          try {
            // Try file-based API first
            const response = await fetch(`/api/file-lecture-schedules/course/${course.id}`);

            if (!response.ok) {
              // If file-based API fails, try the database API
              const dbResponse = await fetch(`/api/lecture-schedules/course/${course.id}`);

              if (!dbResponse.ok) {
                console.error(`Failed to fetch lecture schedules for course ${course.id}`);
                continue;
              }

              const data = await dbResponse.json();
              if (data.success && data.schedules) {
                // Add course info to each schedule
                const courseSchedules = data.schedules.map(schedule => ({
                  ...schedule,
                  course: {
                    id: course.id,
                    title: course.title,
                    format: course.format || 'recorded',
                    image: course.image
                  }
                }));

                allSchedules.push(...courseSchedules);
              }
            } else {
              const data = await response.json();
              if (data.success && data.schedules) {
                // Add course info to each schedule
                const courseSchedules = data.schedules.map(schedule => ({
                  ...schedule,
                  course: {
                    id: course.id,
                    title: course.title,
                    format: course.format || 'recorded',
                    image: course.image
                  }
                }));

                allSchedules.push(...courseSchedules);
              }
            }
          } catch (err) {
            console.error(`Error fetching schedules for course ${course.id}:`, err);
          }
        }

        // Filter for upcoming lectures (today and future)
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const upcoming = allSchedules.filter(schedule => {
          const scheduleDate = new Date(schedule.scheduledDate);
          scheduleDate.setHours(0, 0, 0, 0);
          return scheduleDate >= now;
        });

        // Sort by date (ascending)
        upcoming.sort((a, b) => {
          return new Date(a.scheduledDate) - new Date(b.scheduledDate);
        });

        // Take only the next 5 lectures
        setUpcomingLectures(upcoming.slice(0, 5));
      } catch (err) {
        console.error('Error fetching lecture schedules:', err);
        setError('Failed to load your upcoming lectures');

        // Generate mock schedules for demo purposes
        generateMockSchedules();
      } finally {
        setIsLoading(false);
      }
    };

    fetchLectureSchedules();
  }, [enrolledCourses]);

  // Generate mock schedules for demo purposes
  const generateMockSchedules = () => {
    if (enrolledCourses.length === 0) return;

    const mockSchedules = [];
    const today = new Date();

    for (let i = 0; i < Math.min(5, enrolledCourses.length); i++) {
      const course = enrolledCourses[i];

      const lectureDate = new Date(today);
      lectureDate.setDate(today.getDate() + i); // One lecture per day

      mockSchedules.push({
        id: `mock-${i}`,
        lecture_id: `lecture-${i}`,
        slot_id: (i % 5) + 1,
        scheduledDate: lectureDate.toISOString(),
        isRescheduled: i % 3 === 0, // Some are rescheduled
        lecture: {
          title: `Lecture ${i + 1}`,
          moduleName: `Module ${Math.floor(i / 2) + 1}`,
          durationMinutes: 45,
          isDemoLecture: i === 0
        },
        course: {
          id: course.id,
          title: course.title,
          format: i % 2 === 0 ? 'live' : 'recorded', // Alternate between live and recorded
          image: course.image
        }
      });
    }

    setUpcomingLectures(mockSchedules);
  };

  // Handle lecture click
  const handleLectureClick = (schedule) => {
    const accessible = isLectureAccessible(schedule, schedule.course?.format);

    if (accessible) {
      // Navigate to lecture or play video
      toast.success(`Opening lecture: ${schedule.lecture?.title || 'Untitled Lecture'}`);
      // TODO: Implement navigation to lecture
    } else {
      toast.error('This lecture is not yet available');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-primary bg-opacity-10 border-0">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <FaCalendarAlt className="me-2" />
              Upcoming Lectures
            </h5>
          </div>
        </Card.Header>
        <Card.Body className="text-center py-4">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading your upcoming lectures...</p>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="warning">
        <div className="d-flex align-items-center">
          <FaExclamationTriangle className="me-2" />
          <span>Unable to load your upcoming lectures: {error}</span>
        </div>
      </Alert>
    );
  }

  if (upcomingLectures.length === 0) {
    return (
      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-primary bg-opacity-10 border-0">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <FaCalendarAlt className="me-2" />
              Upcoming Lectures
            </h5>
          </div>
        </Card.Header>
        <Card.Body className="text-center py-4">
          <FaCalendarAlt className="display-4 text-muted mb-3" />
          <h5>No Upcoming Lectures</h5>
          <p className="text-muted">
            You don't have any upcoming lectures scheduled. Enroll in courses to see your upcoming lectures.
          </p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm mb-4">
      <Card.Header className="bg-primary bg-opacity-10 border-0">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <FaCalendarAlt className="me-2" />
            Upcoming Lectures
          </h5>
          <Button variant="outline-primary" size="sm" href="/student/schedule">
            View All
          </Button>
        </div>
      </Card.Header>
      <ListGroup variant="flush">
        {upcomingLectures.map((schedule) => {
          const accessible = isLectureAccessible(schedule, schedule.course?.format);
          const slotInfo = timeSlots.find(slot => slot.id.toString() === schedule.slot_id?.toString());

          return (
            <ListGroup.Item
              key={schedule.id}
              action
              onClick={() => handleLectureClick(schedule)}
              className={`d-flex align-items-center ${accessible ? '' : 'text-muted'}`}
            >
              <div className="lecture-date text-center me-3">
                <div className="date-badge">
                  {formatDate(schedule.scheduledDate)}
                </div>
                <div className="time-badge">
                  <FaClock className="me-1" />
                  {slotInfo?.time || 'Unknown time'}
                </div>
              </div>

              <div className="lecture-info flex-grow-1">
                <h6 className="mb-1">{schedule.lecture?.title || 'Untitled Lecture'}</h6>
                <div className="small text-muted mb-1">
                  {schedule.course?.title || 'Unknown Course'} • {schedule.lecture?.moduleName || 'Unknown Module'}
                </div>
                <div className="lecture-badges">
                  {schedule.lecture?.isDemoLecture && (
                    <Badge bg="warning" className="me-1">Demo</Badge>
                  )}
                  <Badge
                    bg={schedule.course?.format === 'live' ? 'danger' : 'success'}
                    className="me-1"
                  >
                    {schedule.course?.format === 'live' ? (
                      <><FaChalkboardTeacher className="me-1" /> Live</>
                    ) : (
                      <><FaVideo className="me-1" /> Recorded</>
                    )}
                  </Badge>
                  {schedule.isRescheduled && (
                    <Badge bg="info" className="me-1">Rescheduled</Badge>
                  )}
                  <Badge
                    bg={accessible ? 'primary' : 'secondary'}
                  >
                    {accessible ? (
                      <><FaUnlock className="me-1" /> Available</>
                    ) : (
                      <><FaLock className="me-1" /> Locked</>
                    )}
                  </Badge>
                </div>
              </div>
            </ListGroup.Item>
          );
        })}
      </ListGroup>
      <Card.Footer className="bg-light border-0 text-center">
        <small className="text-muted">
          Click on a lecture to view it. Live lectures are only available on their scheduled date.
        </small>
      </Card.Footer>

      {/* CSS Styles */}
      <style jsx global>{`
        .lecture-date {
          min-width: 120px;
        }

        .date-badge {
          font-weight: 500;
          color: #0d6efd;
        }

        .time-badge {
          font-size: 0.8rem;
          color: #6c757d;
        }

        .lecture-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }
      `}</style>
    </Card>
  );
};

export default UpcomingLectures;
