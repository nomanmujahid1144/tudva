// PRODUCTION-READY + TRANSLATED: src/app/[locale]/instructor/live-sessions/page.jsx
// Clean production version with i18n support

'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { FaVideo, FaPlay, FaStop, FaEye, FaCalendarAlt, FaUsers, FaClock, FaCheckCircle, FaBan } from 'react-icons/fa';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getInstructorCourses, manageLiveSession, getLiveSessionData, getInstructorScheduledSessions } from '@/services/courseService';

const InstructorLiveSessionsDashboard = () => {
  const router = useRouter();
  const t = useTranslations('instructor.liveSessions');
  
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

      // Initialize sessionsLookup outside conditional block
      let sessionsLookup = {};

      // Get scheduled sessions for all courses
      const scheduledResult = await getInstructorScheduledSessions();

      if (scheduledResult.success && scheduledResult.data.courses) {
        // Create lookup object for scheduled sessions by courseId
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
      setError(t('error.title'));
    } finally {
      setIsLoading(false);
    }
  };

  // Check if session can be started using real scheduled data
  const canStartSession = (course) => {
    const scheduledData = course.scheduledSessions;

    if (!scheduledData || !scheduledData.sessions?.length) {
      return { canStart: false, reason: t('messages.noStudents') };
    }

    // Find the next session that should be started
    const nextSession = scheduledData.nextSession;

    if (!nextSession) {
      return { canStart: false, reason: t('messages.allCompleted') };
    }

    // Check if session time has arrived (allow 5 minutes early)
    const sessionTime = new Date(nextSession.sessionDate);
    const allowEarlyStart = 5 * 60 * 1000; // 5 minutes in milliseconds
    const earliestStartTime = new Date(sessionTime.getTime() - allowEarlyStart);

    if (currentTime < earliestStartTime) {
      const timeUntilStart = sessionTime - currentTime;
      return {
        canStart: false,
        reason: t('messages.tooEarly'),
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

  // Get time until session starts with days, hours, minutes, seconds
  const getCountdownDisplay = (timeUntilStart) => {
    const days = Math.floor(timeUntilStart / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeUntilStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeUntilStart % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeUntilStart % (1000 * 60)) / 1000);

    const parts = [];

    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 && days === 0) parts.push(`${seconds}s`); // Only show seconds if less than a day

    return parts.join(' ') || '0s';
  };

  // Create new session (this creates the Matrix room setup)
  const handleCreateSession = async (courseId) => {
    try {
      setIsManaging(true);

      const result = await manageLiveSession(courseId, {
        action: 'create-session',
        sessionDate: new Date().toISOString(),
        sessionTitle: 'Live Session'
      });

      if (result.success) {
        toast.success(t('toast.roomCreated'));
        await loadLiveCoursesWithSchedules();
      } else {
        toast.error(result.error || t('toast.createFailed'));
      }
    } catch (err) {
      console.error('Error creating session:', err);
      toast.error(t('toast.createFailed'));
    } finally {
      setIsManaging(false);
    }
  };

  // Start session using real scheduled data
  const handleStartSession = async (courseId, slotIndex = 0) => {
    try {
      const course = liveCourses.find(c => c.id === courseId);
      const startCheck = canStartSession(course);

      // ✅ PRODUCTION: Time validation enabled
      if (!startCheck.canStart) {
        if (startCheck.countdown) {
          toast.error(t('toast.tooEarly', { 
            sessionTitle: startCheck.nextSession.sessionTitle,
            countdown: getCountdownDisplay(startCheck.countdown)
          }));
        } else {
          toast.error(startCheck.reason);
        }
        return;
      }

      setIsManaging(true);

      const result = await manageLiveSession(courseId, {
        action: 'start',
        slotIndex: parseInt(slotIndex),
        sessionDate: startCheck.nextSession.sessionDate,
        sessionTitle: startCheck.nextSession.sessionTitle
      });

      if (result.success) {
        toast.success(t('toast.sessionStarted', { sessionTitle: startCheck.nextSession.sessionTitle }));
        router.push(`/instructor/live-session/${courseId}/${slotIndex}`);
      } else {
        console.error('Start session error:', result.error);
        toast.error(result.error || t('toast.startFailed'));
      }
    } catch (err) {
      console.error('Error starting session:', err);
      toast.error(t('toast.startFailed'));
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
        toast.success(t('toast.sessionEnded'));
        await loadLiveCoursesWithSchedules();
      } else {
        toast.error(result.error || t('toast.endFailed'));
      }
    } catch (err) {
      console.error('Error ending session:', err);
      toast.error(t('toast.endFailed'));
    } finally {
      setIsManaging(false);
    }
  };

  // Get session status badge using real scheduled data
  const getStatusBadge = (course) => {
    if (!course) return <Badge bg="light" text="dark">{t('status.noSession')}</Badge>;

    const startCheck = canStartSession(course);
    const scheduledData = course.scheduledSessions;

    // Check if session is currently live
    if (course.sessionData?.timeSlots?.[0]?.sessionStatus === 'live') {
      return <Badge bg="success" className="d-flex align-items-center gap-1">
        <div className="rounded-circle bg-white" style={{ width: '6px', height: '6px' }}></div>
        {t('status.live')}
      </Badge>;
    }

    if (!scheduledData || !scheduledData.sessions?.length) {
      return <Badge bg="light" text="dark">{t('status.waitingForSchedules')}</Badge>;
    }

    if (startCheck.countdown && startCheck.nextSession) {
      return <Badge bg="warning" className="d-flex align-items-center gap-1">
        <FaClock className="me-1" />
        {startCheck.nextSession.sessionTitle}: {getCountdownDisplay(startCheck.countdown)}
      </Badge>;
    }

    if (startCheck.canStart && startCheck.nextSession) {
      return <Badge bg="primary">{t('status.ready')} {startCheck.nextSession.sessionTitle}</Badge>;
    }

    return <Badge bg="secondary">{t('status.allCompleted')}</Badge>;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return t('dateFormat.notSet');
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
          <h5 className="mt-3">{t('loading')}</h5>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <h5>{t('error.title')}</h5>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={loadLiveCoursesWithSchedules}>
            {t('error.retry')}
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
              <h2 className="mb-1">{t('pageTitle')}</h2>
              <p className="text-muted mb-0">{t('pageSubtitle')}</p>
            </div>
            <Button variant="primary" onClick={loadLiveCoursesWithSchedules} disabled={isManaging}>
              <FaVideo className="me-2" />
              {t('refreshButton')}
            </Button>
          </div>
        </Col>
      </Row>

      {/* Live Courses List */}
      {liveCourses.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <FaVideo className="display-4 text-muted mb-3" />
            <h4>{t('emptyState.title')}</h4>
            <p className="text-muted">{t('emptyState.description')}</p>
            <Button variant="primary" onClick={() => router.push('/instructor/create-course')}>
              {t('emptyState.createButton')}
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          {/* Quick Stats */}
          {liveCourses.length > 0 && (
            <Row className="mt-4">
              <Col>
                <Card className="border-0 shadow-sm">
                  <Card.Body>
                    <Row className="text-center">
                      <Col md={3}>
                        <h4 className="text-primary mb-1">{liveCourses.length}</h4>
                        <p className="text-muted mb-0 small">{t('stats.liveCourses')}</p>
                      </Col>
                      <Col md={3}>
                        <h4 className="text-success mb-1">
                          {liveCourses.filter(c => c.sessionData?.timeSlots?.[0]?.sessionStatus === 'live').length}
                        </h4>
                        <p className="text-muted mb-0 small">{t('stats.activeSessions')}</p>
                      </Col>
                      <Col md={3}>
                        <h4 className="text-info mb-1">
                          {liveCourses.filter(c => c.scheduledSessions?.nextSession).length}
                        </h4>
                        <p className="text-muted mb-0 small">{t('stats.readyToStart')}</p>
                      </Col>
                      <Col md={3}>
                        <h4 className="text-secondary mb-1">
                          {liveCourses.reduce((total, c) => total + (c.scheduledSessions?.totalStudents || 0), 0)}
                        </h4>
                        <p className="text-muted mb-0 small">{t('stats.totalStudents')}</p>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
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
                        <span>{t('courseCard.students')} {scheduledData?.totalStudents || 0}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2 text-muted small mb-2">
                        <FaCalendarAlt />
                        <span>{t('courseCard.sessions')} {scheduledData?.sessions?.length || 0}</span>
                      </div>
                      {startCheck.nextSession && (
                        <div className="d-flex align-items-center gap-2 text-muted small">
                          <FaClock />
                          <span>{t('courseCard.next')} {formatDate(startCheck.nextSession.sessionDate)}</span>
                        </div>
                      )}
                    </div>

                    {/* Session Actions */}
                    <div className="d-flex flex-column gap-2">
                      {!course.sessionData?.timeSlots?.[0]?.matrixRoomId ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleCreateSession(course.id)}
                          disabled={isManaging}
                        >
                          <FaPlay className="me-1" />
                          {t('actions.setupRoom')}
                        </Button>
                      ) : (
                        <>
                          {course.sessionData.timeSlots[0].sessionStatus === 'live' ? (
                            // Session is currently LIVE
                            <>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                  const liveSlotIndex = course.sessionData.timeSlots.findIndex(
                                    slot => slot.sessionStatus === 'live'
                                  );
                                  router.push(`/instructor/live-session/${course.id}/${liveSlotIndex}`);
                                }}
                                className="mb-2"
                              >
                                <FaEye className="me-1" />
                                {t('actions.viewLive')}
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                  const liveSlotIndex = course.sessionData.timeSlots.findIndex(
                                    slot => slot.sessionStatus === 'live'
                                  );
                                  handleEndSession(course.id, liveSlotIndex);
                                }}
                                disabled={isManaging}
                              >
                                <FaStop className="me-1" />
                                {t('actions.endSession')}
                              </Button>
                            </>
                          ) : course.sessionData.timeSlots[0].sessionStatus === 'completed' ? (
                            // Session is COMPLETED
                            <Button
                              variant="success"
                              size="sm"
                              disabled
                            >
                              <FaCheckCircle className="me-1" />
                              {t('actions.completed')}
                            </Button>
                          ) : course.sessionData.timeSlots[0].sessionStatus === 'cancelled' ? (
                            // Session is CANCELLED
                            <Button
                              variant="secondary"
                              size="sm"
                              disabled
                            >
                              <FaBan className="me-1" />
                              {t('actions.cancelled')}
                            </Button>
                          ) : (
                            // Session is SCHEDULED (ready to start)
                            <Button
                              variant={startCheck.canStart ? "success" : "secondary"}
                              size="sm"
                              onClick={() => handleStartSession(course.id, 0)}
                              disabled={isManaging || !startCheck.canStart}
                            >
                              <FaPlay className="me-1" />
                              {startCheck.canStart ?
                                t('actions.start', { sessionTitle: startCheck.nextSession?.sessionTitle || 'Session' }) :
                                startCheck.countdown ?
                                  t('actions.startsIn', { 
                                    sessionTitle: startCheck.nextSession.sessionTitle,
                                    countdown: getCountdownDisplay(startCheck.countdown)
                                  }) :
                                  t('actions.waiting')
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
    </Container>
  );
};

export default InstructorLiveSessionsDashboard;