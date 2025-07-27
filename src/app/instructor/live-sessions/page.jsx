// src/app/instructor/live-sessions/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table, Alert, Spinner, Modal } from 'react-bootstrap';
import { FaVideo, FaPlay, FaStop, FaEye, FaCalendarAlt, FaUsers, FaClock, FaCheckCircle, FaBan } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { getInstructorCourses, manageLiveSession, getLiveSessionData } from '@/services/courseService';

const InstructorLiveSessionsDashboard = () => {
  const router = useRouter();
  const [liveCourses, setLiveCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isManaging, setIsManaging] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Load instructor's live courses
  useEffect(() => {
    loadLiveCourses();
  }, []);

  const loadLiveCourses = async () => {
    try {
      setIsLoading(true);
      
      // Get instructor courses
      const result = await getInstructorCourses(1, 50); // Get all courses
      
      if (result.success) {
        // Filter only live courses
        const liveCoursesList = result.data.courses.filter(course => course.type === 'live');
        
        // Get session data for each live course
        const coursesWithSessions = await Promise.all(
          liveCoursesList.map(async (course) => {
            try {
              const sessionData = await getLiveSessionData(course.id);
              return {
                ...course,
                sessionData: sessionData.success ? sessionData.data : null
              };
            } catch (err) {
              console.error(`Error loading session data for course ${course.id}:`, err);
              return {
                ...course,
                sessionData: null
              };
            }
          })
        );
        
        setLiveCourses(coursesWithSessions);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error loading live courses:', err);
      setError('Failed to load live courses');
    } finally {
      setIsLoading(false);
    }
  };

  // Create new session
  const handleCreateSession = async (courseId) => {
    try {
      setIsManaging(true);
      
      const result = await manageLiveSession(courseId, {
        action: 'create-session',
        sessionDate: new Date().toISOString(),
        sessionTitle: 'Live Session'
      });
      
      if (result.success) {
        toast.success('Live session created successfully!');
        await loadLiveCourses(); // Reload data
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

  // Start session
  const handleStartSession = async (courseId, slotIndex = 0) => {
    try {
      setIsManaging(true);
      
      console.log('Starting session with:', { courseId, slotIndex }); // Debug log
      
      const result = await manageLiveSession(courseId, {
        action: 'start',
        slotIndex: parseInt(slotIndex) // Ensure it's a number
      });
      
      if (result.success) {
        toast.success('Live session started!');
        
        // Navigate to instructor live session page
        router.push(`/instructor/live-session/${courseId}/${slotIndex}`);
      } else {
        console.error('Start session error:', result.error); // Debug log
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
        recordingUrl: '' // Will be populated later with actual recording
      });
      
      if (result.success) {
        toast.success('Live session ended successfully!');
        await loadLiveCourses(); // Reload data
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

  // Get session status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'live':
        return <Badge bg="success" className="d-flex align-items-center gap-1">
          <div className="rounded-circle bg-white" style={{ width: '6px', height: '6px' }}></div>
          LIVE
        </Badge>;
      case 'scheduled':
        return <Badge bg="primary">Scheduled</Badge>;
      case 'completed':
        return <Badge bg="secondary">Completed</Badge>;
      case 'cancelled':
        return <Badge bg="danger">Cancelled</Badge>;
      default:
        return <Badge bg="light" text="dark">No Session</Badge>;
    }
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
          <Button variant="outline-danger" onClick={loadLiveCourses}>
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
            <Button variant="primary" onClick={loadLiveCourses} disabled={isManaging}>
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
          {liveCourses.map((course) => (
            <Col key={course.id} lg={6} xl={4}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-light border-0">
                  <div className="d-flex align-items-center justify-content-between">
                    <h6 className="mb-0 fw-bold">{course.title}</h6>
                    {course.sessionData?.timeSlots?.[0] && getStatusBadge(course.sessionData.timeSlots[0].sessionStatus)}
                  </div>
                </Card.Header>
                
                <Card.Body>
                  <div className="mb-3">
                    <div className="d-flex align-items-center gap-2 text-muted small mb-2">
                      <FaUsers />
                      <span>Max: {course.sessionData?.maxEnrollment || 0} students</span>
                    </div>
                    <div className="d-flex align-items-center gap-2 text-muted small mb-2">
                      <FaCalendarAlt />
                      <span>Lessons: {course.sessionData?.plannedLessons || 0}</span>
                    </div>
                    {course.sessionData?.timeSlots?.[0] && (
                      <div className="d-flex align-items-center gap-2 text-muted small">
                        <FaClock />
                        <span>{formatDate(course.sessionData.timeSlots[0].sessionDate)}</span>
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
                        Create Session
                      </Button>
                    ) : (
                      <>
                        {course.sessionData.timeSlots[0].sessionStatus === 'scheduled' && (
                          <Button 
                            variant="success" 
                            size="sm"
                            onClick={() => handleStartSession(course.id, 0)}
                            disabled={isManaging}
                          >
                            <FaPlay className="me-1" />
                            Start Session
                          </Button>
                        )}
                        
                        {course.sessionData.timeSlots[0].sessionStatus === 'live' && (
                          <>
                            <Button 
                              variant="primary" 
                              size="sm"
                              onClick={() => router.push(`/instructor/live-session/${course.id}/0`)}
                            >
                              <FaEye className="me-1" />
                              View Session
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
                        )}
                        
                        {course.sessionData.timeSlots[0].sessionStatus === 'completed' && (
                          <Button 
                            variant="outline-success" 
                            size="sm"
                            disabled
                          >
                            <FaCheckCircle className="me-1" />
                            Completed
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
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
                      {liveCourses.filter(c => c.sessionData?.timeSlots?.[0]?.sessionStatus === 'scheduled').length}
                    </h4>
                    <p className="text-muted mb-0 small">Scheduled</p>
                  </Col>
                  <Col md={3}>
                    <h4 className="text-secondary mb-1">
                      {liveCourses.filter(c => c.sessionData?.timeSlots?.[0]?.sessionStatus === 'completed').length}
                    </h4>
                    <p className="text-muted mb-0 small">Completed</p>
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