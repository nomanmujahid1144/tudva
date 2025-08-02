// UPDATED: src/app/instructor/live-sessions/page.jsx
// Use real scheduled session data from CourseSchedulerEnrollment

'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table, Alert, Spinner, Modal } from 'react-bootstrap';
import { FaVideo, FaPlay, FaStop, FaEye, FaCalendarAlt, FaUsers, FaClock, FaCheckCircle, FaBan } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { getInstructorCourses, manageLiveSession, getLiveSessionData, getInstructorScheduledSessions } from '@/services/courseService';

const InstructorLiveSessionsDashboard = () => {
  const router = useRouter();
  const [liveCourses, setLiveCourses] = useState([]);
  const [scheduledSessions, setScheduledSessions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isManaging, setIsManaging] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Load instructor's live courses and scheduled sessions
  useEffect(() => {
    loadLiveCoursesWithSchedules();
  }, []);

  const loadLiveCoursesWithSchedules = async () => {
    try {
      setIsLoading(true);
      
      // Get instructor courses
      const coursesResult = await getInstructorCourses(1, 50);
      
      if (!coursesResult.success) {
        throw new Error(coursesResult.error);
      }

      // Filter only live courses
      const liveCoursesList = coursesResult.data.courses.filter(course => course.type === 'live');
      
      // Get scheduled sessions for all courses
      const scheduledResult = await getInstructorScheduledSessions();
      
      if (scheduledResult.success) {
        // Create lookup object for scheduled sessions by courseId
        const sessionsLookup = {};
        scheduledResult.data.courses.forEach(courseSession => {
          sessionsLookup[courseSession.courseId] = courseSession;
        });
        setScheduledSessions(sessionsLookup);
      }

      // Get basic session data for each live course
      const coursesWithSessions = await Promise.all(
        liveCoursesList.map(async (course) => {
          try {
            const sessionData = await getLiveSessionData(course.id);
            return {
              ...course,
              sessionData: sessionData.success ? sessionData.data : null,
              scheduledSessions: sessionsLookup[course.id] || null
            };
          } catch (err) {
            console.error(`Error loading session data for course ${course.id}:`, err);
            return {
              ...course,
              sessionData: null,
              scheduledSessions: sessionsLookup[course.id] || null
            };
          }
        })
      );
      
      setLiveCourses(coursesWithSessions);
      
    } catch (err) {
      console.error('Error loading live courses:', err);
      setError('Failed to load live courses');
    } finally {
      setIsLoading(false);
    }
  };

  // FIXED: Check if session can be started using real scheduled data
  const canStartSession = (course) => {
    const scheduledData = course.scheduledSessions;
    
    if (!scheduledData || !scheduledData.sessions?.length) {
      return { canStart: false, reason: 'No students have scheduled this course yet' };
    }

    // Find the next session that should be started
    const nextSession = scheduledData.nextSession;
    
    if (!nextSession) {
      return { canStart: false, reason: 'All sessions completed' };
    }

    // Check if session time has arrived (allow 5 minutes early)
    const sessionTime = new Date(nextSession.sessionDate);
    const allowEarlyStart = 5 * 60 * 1000; // 5 minutes in milliseconds
    const earliestStartTime = new Date(sessionTime.getTime() - allowEarlyStart);
    
    if (currentTime < earliestStartTime) {
      const timeUntilStart = sessionTime - currentTime;
      return { 
        canStart: false, 
        reason: 'Too early to start', 
        countdown: timeUntilStart,
        sessionTime: sessionTime,
        nextSession: nextSession
      };
    }

    return { 
      canStart: true, 
      nextSession: nextSession 
    };
  };

  // Get time until session starts
  const getCountdownDisplay = (timeUntilStart) => {
    const hours = Math.floor(timeUntilStart / (1000 * 60 * 60));
    const minutes = Math.floor((timeUntilStart % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeUntilStart % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  // Create new session (this creates the Matrix room setup)
  const handleCreateSession = async (courseId) => {
    try {
      setIsManaging(true);
      
      const result = await manageLiveSession(courseId, {
        action: 'create-session',
        sessionDate: new Date().toISOString(), // This just creates the Matrix room
        sessionTitle: 'Live Session'
      });
      
      if (result.success) {
        toast.success('Session room created! Students can now schedule sessions.');
        await loadLiveCoursesWithSchedules(); // Reload data
      } else {
        toast.error(result.error || 'Failed to create session');
      }
    } catch (err) {
      console.error('Error creating session:', err);
      toast.error('Failed to create session');
    } finally {
      setIsManaging(false);
    }
  };

  // UPDATED: Start session using real scheduled data
  const handleStartSession = async (courseId, slotIndex = 0) => {
    try {
      const course = liveCourses.find(c => c.id === courseId);
      const startCheck = canStartSession(course);
      
      if (!startCheck.canStart) {
        if (startCheck.countdown) {
          toast.error(`Next session (${startCheck.nextSession.sessionTitle}) starts in ${getCountdownDisplay(startCheck.countdown)}`);
        } else {
          toast.error(startCheck.reason);
        }
        return;
      }

      setIsManaging(true);
      
      console.log('Starting session with:', { 
        courseId, 
        slotIndex, 
        nextSession: startCheck.nextSession 
      });
      
      const result = await manageLiveSession(courseId, {
        action: 'start',
        slotIndex: parseInt(slotIndex),
        sessionDate: startCheck.nextSession.sessionDate, // Use real scheduled time
        sessionTitle: startCheck.nextSession.sessionTitle
      });
      
      if (result.success) {
        toast.success(`${startCheck.nextSession.sessionTitle} started!`);
        
        // Navigate to instructor live session page
        router.push(`/instructor/live-session/${courseId}/${slotIndex}`);
      } else {
        console.error('Start session error:', result.error);
        toast.error(result.error || 'Failed to start session');
      }
    } catch (err) {
      console.error('Error starting session:', err);
      toast.error('Failed to start session');
    } finally {
      setIsManaging(false);
    }
  };

  // End session
  const handleEndSession = async (courseId, slotIndex) => {
    try {
      setIsManaging(true);
      
      const result = await manageLiveSession(courseId, {
        action: 'end',
        slotIndex,
        recordingUrl: ''
      });
      
      if (result.success) {
        toast.success('Live session ended successfully!');
        await loadLiveCoursesWithSchedules(); // Reload data
      } else {
        toast.error(result.error || 'Failed to end session');
      }
    } catch (err) {
      console.error('Error ending session:', err);
      toast.error('Failed to end session');
    } finally {
      setIsManaging(false);
    }
  };

  // UPDATED: Get session status badge using real scheduled data
  const getStatusBadge = (course) => {
    if (!course) return <Badge bg="light" text="dark">No Session</Badge>;
    
    const startCheck = canStartSession(course);
    const scheduledData = course.scheduledSessions;
    
    // Check if session is currently live
    if (course.sessionData?.timeSlots?.[0]?.sessionStatus === 'live') {
      return <Badge bg="success" className="d-flex align-items-center gap-1">
        <div className="rounded-circle bg-white" style={{ width: '6px', height: '6px' }}></div>
        LIVE
      </Badge>;
    }
    
    if (!scheduledData || !scheduledData.sessions?.length) {
      return <Badge bg="light" text="dark">No Students Scheduled</Badge>;
    }

    if (startCheck.countdown && startCheck.nextSession) {
      return <Badge bg="warning" className="d-flex align-items-center gap-1">
        <FaClock className="me-1" />
        {startCheck.nextSession.sessionTitle}: {getCountdownDisplay(startCheck.countdown)}
      </Badge>;
    }

    if (startCheck.canStart && startCheck.nextSession) {
      return <Badge bg="primary">Ready: {startCheck.nextSession.sessionTitle}</Badge>;
    }

    return <Badge bg="secondary">All Sessions Completed</Badge>;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Container className="py-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <h5 className="mt-3">Loading Live Sessions...</h5>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <h5>Error Loading Live Sessions</h5>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={loadLiveCoursesWithSchedules}>
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">Live Session Management</h2>
              <p className="text-muted mb-0">Manage your live courses and sessions</p>
            </div>
            <Button variant="primary" onClick={loadLiveCoursesWithSchedules} disabled={isManaging}>
              <FaVideo className="me-2" />
              Refresh Sessions
            </Button>
          </div>
        </Col>
      </Row>

      {/* Live Courses List */}
      {liveCourses.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <FaVideo className="display-4 text-muted mb-3" />
            <h4>No Live Courses Found</h4>
            <p className="text-muted">You don't have any live courses yet. Create a live course to start managing sessions.</p>
            <Button variant="primary" onClick={() => router.push('/instructor/create-course')}>
              Create Live Course
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          {liveCourses.map((course) => {
            const startCheck = canStartSession(course);
            const scheduledData = course.scheduledSessions;
            
            return (
              <Col key={course.id} lg={6} xl={4}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Header className="bg-light border-0">
                    <div className="d-flex align-items-center justify-content-between">
                      <h6 className="mb-0 fw-bold">{course.title}</h6>
                      {getStatusBadge(course)}
                    </div>
                  </Card.Header>
                  
                  <Card.Body>
                    <div className="mb-3">
                      <div className="d-flex align-items-center gap-2 text-muted small mb-2">
                        <FaUsers />
                        <span>Students: {scheduledData?.totalStudents || 0}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2 text-muted small mb-2">
                        <FaCalendarAlt />
                        <span>Sessions: {scheduledData?.sessions?.length || 0}</span>
                      </div>
                      {startCheck.nextSession && (
                        <div className="d-flex align-items-center gap-2 text-muted small">
                          <FaClock />
                          <span>Next: {formatDate(startCheck.nextSession.sessionDate)}</span>
                        </div>
                      )}
                    </div>

                    {/* Session Actions */}
                    <div className="d-flex flex-column gap-2">
                      {!course.sessionData?.timeSlots || course.sessionData.timeSlots.length === 0 ? (
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={() => handleCreateSession(course.id)}
                          disabled={isManaging}
                        >
                          <FaPlay className="me-1" />
                          Setup Session Room
                        </Button>
                      ) : (
                        <>
                          {course.sessionData.timeSlots[0].sessionStatus === 'live' ? (
                            <>
                              <Button 
                                variant="primary" 
                                size="sm"
                                onClick={() => router.push(`/instructor/live-session/${course.id}/0`)}
                              >
                                <FaEye className="me-1" />
                                View Live Session
                              </Button>
                              <Button 
                                variant="danger" 
                                size="sm"
                                onClick={() => handleEndSession(course.id, 0)}
                                disabled={isManaging}
                              >
                                <FaStop className="me-1" />
                                End Session
                              </Button>
                            </>
                          ) : !scheduledData || !scheduledData.sessions?.length ? (
                            <Button variant="outline-secondary" size="sm" disabled>
                              <FaCalendarAlt className="me-1" />
                              Waiting for Student Schedules
                            </Button>
                          ) : startCheck.canStart ? (
                            <Button 
                              variant="success" 
                              size="sm"
                              onClick={() => handleStartSession(course.id, 0)}
                              disabled={isManaging}
                            >
                              <FaPlay className="me-1" />
                              Start {startCheck.nextSession.sessionTitle}
                            </Button>
                          ) : (
                            <Button 
                              variant="outline-warning" 
                              size="sm"
                              disabled
                              title={`${startCheck.nextSession?.sessionTitle} starts at ${formatDate(startCheck.nextSession?.sessionDate)}`}
                            >
                              <FaClock className="me-1" />
                              {startCheck.countdown ? 
                                `${startCheck.nextSession.sessionTitle} in ${getCountdownDisplay(startCheck.countdown)}` : 
                                'All Sessions Complete'
                              }
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Quick Stats */}
      {liveCourses.length > 0 && (
        <Row className="mt-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <Row className="text-center">
                  <Col md={3}>
                    <h4 className="text-primary mb-1">{liveCourses.length}</h4>
                    <p className="text-muted mb-0 small">Live Courses</p>
                  </Col>
                  <Col md={3}>
                    <h4 className="text-success mb-1">
                      {liveCourses.filter(c => c.sessionData?.timeSlots?.[0]?.sessionStatus === 'live').length}
                    </h4>
                    <p className="text-muted mb-0 small">Active Sessions</p>
                  </Col>
                  <Col md={3}>
                    <h4 className="text-info mb-1">
                      {liveCourses.filter(c => c.scheduledSessions?.nextSession).length}
                    </h4>
                    <p className="text-muted mb-0 small">Ready to Start</p>
                  </Col>
                  <Col md={3}>
                    <h4 className="text-secondary mb-1">
                      {liveCourses.reduce((total, c) => total + (c.scheduledSessions?.totalStudents || 0), 0)}
                    </h4>
                    <p className="text-muted mb-0 small">Total Students</p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default InstructorLiveSessionsDashboard;