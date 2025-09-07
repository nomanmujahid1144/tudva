// CLEAN VERSION: src/app/instructor/live-session/[courseId]/[slotIndex]/page.jsx
// Real-time data, proper auth, no mock data

'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash, FaUsers, FaPlay, FaStop, FaRecordVinyl, FaSignOutAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getLiveSessionData, manageLiveSession } from '@/services/courseService';
import ChatPanel from '@/components/LiveSession/ChatPanel';

const InstructorLiveSessionPage = ({ params }) => {
  const router = useRouter();
  const { courseId, sessionId } = params;
  const slotIndex = sessionId;
  const { user, loading: authLoading } = useAuth();

  // Session data state
  const [sessionData, setSessionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isManaging, setIsManaging] = useState(false);

  // Session controls state
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);

  // Matrix credentials for instructor
  const matrixCredentials = user ? {
    userId: `@instructor_${user.id}:chat.151.hu`,
    accessToken: process.env.NEXT_PUBLIC_MATRIX_ACCESS_TOKEN || 'syt_bm9t_KyFOAOqQXtogCcGbRktX_0UliGS'
  } : null;

  // Load session data when component mounts or user changes
  useEffect(() => {
    if (!authLoading && user) {
      loadSessionData();
    }
  }, [courseId, slotIndex, user, authLoading]);

  // Load real session data from API
  const loadSessionData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔄 Loading session data for course:', courseId);

      const result = await getLiveSessionData(courseId);

      if (result.success) {
        const data = result.data;
        const currentSlot = data.timeSlots?.[slotIndex];

        if (!currentSlot) {
          setError(`Session slot ${slotIndex} not found. Please create the session first.`);
          return;
        }

        console.log('✅ Session data loaded:', {
          courseTitle: data.courseTitle,
          sessionStatus: currentSlot.sessionStatus,
          hasMatrixRoom: !!currentSlot.matrixRoomId
        });

        // Set real session data
        setSessionData({
          sessionTitle: `Session ${parseInt(slotIndex) + 1}`,
          courseTitle: data.courseTitle,
          roomId: currentSlot.matrixRoomId,
          sessionStatus: currentSlot.sessionStatus,
          sessionDate: currentSlot.sessionDate,
          matrixRoomId: currentSlot.matrixRoomId,
          slotData: currentSlot
        });

        // Update UI state based on real session status
        if (currentSlot.sessionStatus === 'live') {
          setIsCameraOn(true);
          setIsMicOn(true);
          console.log('✅ Session is LIVE - updating UI state');
        } else {
          setIsCameraOn(false);
          setIsMicOn(false);
          console.log('ℹ️ Session not live - status:', currentSlot.sessionStatus);
        }

      } else {
        setError(result.error || 'Failed to load session data');
      }
    } catch (err) {
      console.error('❌ Error loading session data:', err);
      setError('Failed to load session data');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if session is currently live
  const isSessionLive = () => {
    return sessionData?.sessionStatus === 'live';
  };

  // Start live session
  const handleStartSession = async () => {
    try {
      if (isSessionLive()) {
        toast.info('Session is already live!');
        return;
      }

      setIsManaging(true);

      console.log('🚀 Starting live session:', {
        courseId,
        slotIndex: parseInt(slotIndex)
      });

      const result = await manageLiveSession(courseId, {
        action: 'start',
        slotIndex: parseInt(slotIndex),
        sessionDate: new Date().toISOString(),
        sessionTitle: `Session ${parseInt(slotIndex) + 1}`
      });

      if (result.success) {
        toast.success('Live session started! 🔴');

        // Update local state
        setIsCameraOn(true);
        setIsMicOn(true);

        // Reload session data to get updated status
        await loadSessionData();
      } else {
        console.error('❌ Failed to start session:', result.error);
        toast.error(result.error || 'Failed to start live session');
      }
    } catch (err) {
      console.error('❌ Error starting session:', err);
      toast.error('Failed to start live session');
    } finally {
      setIsManaging(false);
    }
  };

  // End live session
  const handleEndSession = async () => {
    try {
      setIsManaging(true);

      console.log('🔴 Ending live session:', {
        courseId,
        slotIndex: parseInt(slotIndex)
      });

      const result = await manageLiveSession(courseId, {
        action: 'end',
        slotIndex: parseInt(slotIndex),
        recordingUrl: ''
      });

      if (result.success) {
        toast.success('Live session ended ✅');

        // Update local state
        setIsCameraOn(false);
        setIsMicOn(false);

        // Reload session data to get updated status
        await loadSessionData();
      } else {
        console.error('❌ Failed to end session:', result.error);
        toast.error(result.error || 'Failed to end session');
      }
    } catch (err) {
      console.error('❌ Error ending session:', err);
      toast.error('Failed to end session');
    } finally {
      setIsManaging(false);
    }
  };

  // Navigate back to dashboard
  const handleBackToDashboard = () => {
    router.push('/instructor/live-sessions');
  };

  // Toggle camera
  const toggleCamera = () => {
    if (!isSessionLive()) {
      toast.warning('Start the session first to control camera');
      return;
    }
    setIsCameraOn(!isCameraOn);
    toast.info(isCameraOn ? 'Camera turned off' : 'Camera turned on');
  };

  // Toggle microphone
  const toggleMicrophone = () => {
    if (!isSessionLive()) {
      toast.warning('Start the session first to control microphone');
      return;
    }
    setIsMicOn(!isMicOn);
    toast.info(isMicOn ? 'Microphone muted' : 'Microphone unmuted');
  };

  // Get session status badge
  const getSessionStatusBadge = () => {
    if (!sessionData) return <Badge bg="secondary">Loading...</Badge>;

    switch (sessionData.sessionStatus) {
      case 'live':
        return (
          <Badge bg="success" className="d-flex align-items-center gap-1">
            <div className="rounded-circle bg-white" style={{ width: '8px', height: '8px' }}></div>
            LIVE
          </Badge>
        );
      case 'scheduled':
        return <Badge bg="primary">Ready to Start</Badge>;
      case 'completed':
        return <Badge bg="info">Completed</Badge>;
      case 'cancelled':
        return <Badge bg="danger">Cancelled</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  // Show loading while auth is loading or session data is loading
  if (authLoading || isLoading) {
    return (
      <Container fluid className="vh-100 d-flex align-items-center justify-content-center">
        <Card className="border-0 shadow-lg text-center p-4">
          <Card.Body>
            <Spinner animation="border" variant="primary" className="mb-3" />
            <h5>{authLoading ? 'Authenticating...' : 'Loading Session...'}</h5>
            <p className="text-muted mb-0">Please wait</p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  // Show error if auth failed or no user
  if (!user) {
    return (
      <Container fluid className="vh-100 d-flex align-items-center justify-content-center">
        <Alert variant="warning" className="text-center p-4">
          <h5>Authentication Required</h5>
          <p>Please log in to access the instructor session.</p>
          <Button variant="primary" onClick={() => router.push('/login')}>
            Go to Login
          </Button>
        </Alert>
      </Container>
    );
  }

  // Show error if session data failed to load
  if (error) {
    return (
      <Container fluid className="vh-100 d-flex align-items-center justify-content-center">
        <Alert variant="danger" className="text-center p-4">
          <h5>Session Error</h5>
          <p>{error}</p>
          <div className="mt-3">
            <Button variant="primary" onClick={loadSessionData} className="me-2">
              Try Again
            </Button>
            <Button variant="outline-secondary" onClick={handleBackToDashboard}>
              Back to Dashboard
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <div className="vh-100 bg-light">
      {/* Header */}
      <div className="bg-dark text-white py-3">
        <Container fluid>
          <Row className="align-items-center">
            <Col>
              <div className="d-flex align-items-center gap-3">
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={handleBackToDashboard}
                >
                  <FaSignOutAlt className="me-1" />
                  Back to Dashboard
                </Button>
                <div>
                  <h5 className="mb-0">{sessionData?.sessionTitle}</h5>
                  <small className="opacity-75">{sessionData?.courseTitle}</small>
                </div>
              </div>
            </Col>
            <Col xs="auto">
              <div className="d-flex align-items-center gap-2">
                {getSessionStatusBadge()}
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={loadSessionData}
                  disabled={isLoading}
                >
                  Refresh
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Main Content */}
      <Container fluid className="p-3" style={{ height: 'calc(100vh - 80px)' }}>
        <Row className="h-100 g-3">
          {/* Video and Controls Section */}
          <Col lg={8} className="h-100">
            <Card className="border-0 shadow h-100">
              <Card.Body className="p-0 d-flex flex-column h-100">
                {/* Video Preview */}
                <div className="flex-grow-1 bg-dark text-white rounded-top d-flex align-items-center justify-content-center position-relative">
                  {isCameraOn ? (
                    <div className="text-center">
                      <div className="bg-primary rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                        style={{ width: '100px', height: '100px' }}>
                        <FaVideo size={40} />
                      </div>
                      <h4>Your Video Feed</h4>
                      <p className="text-muted">Students can see you</p>
                      {isSessionLive() && (
                        <Badge bg="success" className="mt-2">
                          🔴 Broadcasting Live
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="bg-secondary rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                        style={{ width: '100px', height: '100px' }}>
                        <FaVideoSlash size={40} />
                      </div>
                      <h4>Camera Off</h4>
                      <p className="text-muted">
                        {isSessionLive() ? 'Turn on camera to start streaming' : 'Start the session first'}
                      </p>
                    </div>
                  )}

                  {/* Recording indicator */}
                  {isSessionLive() && (
                    <div className="position-absolute top-0 start-0 m-3">
                      <Badge bg="danger" className="d-flex align-items-center">
                        <FaRecordVinyl className="me-1" />
                        Live
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="p-4 bg-white border-top">
                  <Row className="align-items-center">
                    <Col>
                      <div className="d-flex gap-2">
                        <Button
                          variant={isCameraOn ? "success" : "outline-secondary"}
                          onClick={toggleCamera}
                          disabled={!isSessionLive()}
                          title={isCameraOn ? "Turn off camera" : "Turn on camera"}
                        >
                          {isCameraOn ? <FaVideo /> : <FaVideoSlash />}
                        </Button>
                        <Button
                          variant={isMicOn ? "success" : "outline-secondary"}
                          onClick={toggleMicrophone}
                          disabled={!isSessionLive()}
                          title={isMicOn ? "Mute microphone" : "Unmute microphone"}
                        >
                          {isMicOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
                        </Button>
                      </div>
                    </Col>
                    <Col xs="auto">
                      {!isSessionLive() ? (
                        <Button
                          variant="success"
                          size="lg"
                          onClick={handleStartSession}
                          disabled={isManaging}
                        >
                          <FaPlay className="me-2" />
                          {isManaging ? 'Starting...' : 'Start Live Session'}
                        </Button>
                      ) : (
                        <Button
                          variant="danger"
                          size="lg"
                          onClick={handleEndSession}
                          disabled={isManaging}
                        >
                          <FaStop className="me-2" />
                          {isManaging ? 'Ending...' : 'End Session'}
                        </Button>
                      )}
                    </Col>
                  </Row>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Chat Section */}
          <Col lg={4} className="h-100">
            <div className="d-flex flex-column h-100 gap-3">
              {/* Session Info Panel */}
              <Card className="border-0 shadow">
                <Card.Header className="bg-light border-0">
                  <div className="d-flex align-items-center">
                    <FaUsers className="me-2 text-primary" />
                    <span className="fw-bold">Session Information</span>
                  </div>
                </Card.Header>
                <Card.Body className="p-3">
                  <div className="small">
                    <div className="mb-2">
                      <strong>Course:</strong> {sessionData?.courseTitle}
                    </div>
                    <div className="mb-2">
                      <strong>Session:</strong> {sessionData?.sessionTitle}
                    </div>
                    <div className="mb-2">
                      <strong>Status:</strong> {sessionData?.sessionStatus}
                    </div>
                    {sessionData?.sessionDate && (
                      <div className="mb-2">
                        <strong>Created:</strong> {new Date(sessionData.sessionDate).toLocaleString()}
                      </div>
                    )}
                    {sessionData?.matrixRoomId && (
                      <div className="mb-2">
                        <strong>Room:</strong> {sessionData.matrixRoomId.slice(-10)}...
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>

              {/* Real-time Matrix Chat Panel */}
              <div className="flex-grow-1">
                {matrixCredentials && sessionData?.matrixRoomId ? (
                  <ChatPanel
                    roomId={sessionData.matrixRoomId}
                    userCredentials={matrixCredentials}
                    height="calc(100vh - 400px)"
                    className="shadow border-0"
                    showHeader={true}
                    allowFileUpload={false}
                  />
                ) : (
                  <Card className="h-100 border-0 shadow">
                    <Card.Body className="d-flex align-items-center justify-content-center">
                      <div className="text-center text-muted">
                        {!sessionData?.matrixRoomId ? (
                          <>
                            <h6>Chat Not Available</h6>
                            <p className="mb-0">Matrix room not created yet</p>
                          </>
                        ) : (
                          <>
                            <Spinner className="mb-3" />
                            <p>Setting up chat...</p>
                          </>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default InstructorLiveSessionPage;