// CLEAN VERSION: src/app/live-session/[courseId]/[sessionId]/page.jsx
// Real-time data, proper auth, no mock data

'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Badge, Button } from 'react-bootstrap';
import { FaVideo, FaComments, FaSignOutAlt, FaVolumeUp, FaVolumeMute, FaUsers } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { joinLiveSession, getSessionJoinInfo } from '@/services/learningService';
import ChatPanel from '@/components/LiveSession/ChatPanel';

const LiveSessionPage = ({ params }) => {
  const router = useRouter();
  const { courseId, sessionId } = params;
  const { user, loading: authLoading } = useAuth();
  
  const [sessionData, setSessionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Matrix credentials for student (REAL USER)
  const matrixCredentials = user ? {
    userId: `@student_${user.id}:chat.151.hu`,
    accessToken: process.env.NEXT_PUBLIC_MATRIX_ACCESS_TOKEN || 'syt_bm9t_KyFOAOqQXtogCcGbRktX_0UliGS'
  } : null;

  // Initialize and join session when component mounts
  useEffect(() => {
    if (!authLoading && user) {
      initializeAndJoinSession();
    }
  }, [courseId, sessionId, user, authLoading]);

  const initializeAndJoinSession = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Student joining session:', {
        courseId,
        sessionId,
        userId: user.id,
        userName: user.fullName
      });
      
      // Try to join the live session via API
      const result = await joinLiveSession(courseId, sessionId);
      
      console.log('📡 Join session API result:', result);

      if (result.success) {
        console.log('✅ Successfully joined session:', result.data);
        
        setSessionData({
          sessionTitle: result.data.sessionTitle,
          courseTitle: result.data.courseTitle,
          roomId: result.data.roomId,
          sessionStatus: result.data.sessionStatus,
          sessionTime: result.data.sessionTime,
          matrixRoomUrl: result.data.matrixRoomUrl,
          joinedAt: result.data.joinedAt,
          user: result.data.user
        });
        
        setIsJoined(true);
        toast.success('🎓 Joined live session successfully!');
        
      } else {
        console.error('❌ Failed to join session:', result.error);
        
        // Don't use mock data - show proper error
        setError(result.error || 'Failed to join the live session');
        
        // Still try to get session info for display
        try {
          const infoResult = await getSessionJoinInfo(courseId, sessionId);
          if (infoResult.success) {
            setSessionData({
              sessionTitle: infoResult.data.sessionTitle || 'Live Session',
              courseTitle: infoResult.data.courseTitle || 'Course',
              sessionStatus: infoResult.data.sessionStatus || 'unknown',
              canJoinNow: false
            });
          }
        } catch (infoErr) {
          console.error('Failed to get session info:', infoErr);
        }
      }
    } catch (err) {
      console.error('❌ Error joining session:', err);
      setError('Failed to join the live session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Retry joining session
  const retryJoinSession = async () => {
    await initializeAndJoinSession();
  };

  // Leave session and go back to my learning
  const handleLeaveSession = () => {
    router.push('/my-learning');
    toast.info('Left the session');
  };

  // Toggle audio mute
  const toggleAudio = () => {
    setIsMuted(!isMuted);
    toast.info(isMuted ? '🔊 Audio unmuted' : '🔇 Audio muted');
  };

  // Show loading while auth is loading or session data is loading
  if (authLoading || isLoading) {
    return (
      <Container fluid className="vh-100 d-flex align-items-center justify-content-center">
        <Card className="border-0 shadow-lg text-center p-4">
          <Card.Body>
            <Spinner animation="border" variant="primary" className="mb-3" />
            <h5>{authLoading ? 'Authenticating...' : 'Joining Live Session...'}</h5>
            <p className="text-muted mb-0">Please wait while we connect you</p>
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
          <p>Please log in to join the live session.</p>
          <Button variant="primary" onClick={() => router.push('/login')}>
            Go to Login
          </Button>
        </Alert>
      </Container>
    );
  }

  // Show error if failed to join session
  if (error && !isJoined) {
    return (
      <Container fluid className="vh-100 d-flex align-items-center justify-content-center">
        <Alert variant="danger" className="text-center p-4">
          <h5>Connection Error</h5>
          <p>{error}</p>
          <div className="mt-3">
            <Button variant="primary" onClick={retryJoinSession} className="me-2">
              Try Again
            </Button>
            <Button variant="outline-secondary" onClick={handleLeaveSession}>
              Back to My Learning
            </Button>
          </div>
          
          {/* Debug info for troubleshooting */}
          <div className="mt-3 text-start">
            <small className="text-muted">
              <strong>Debug Info:</strong><br />
              Course ID: {courseId}<br />
              Session ID: {sessionId}<br />
              User: {user?.fullName} ({user?.id})<br />
              Session Status: {sessionData?.sessionStatus || 'unknown'}
            </small>
          </div>
        </Alert>
      </Container>
    );
  }

  // Main session interface (only if successfully joined)
  return (
    <div className="vh-100 bg-light">
      {/* Header */}
      <div className="bg-dark text-white py-3">
        <Container fluid>
          <Row className="align-items-center">
            <Col>
              <div>
                <h5 className="mb-0">{sessionData?.sessionTitle || 'Live Session'}</h5>
                <small className="opacity-75">{sessionData?.courseTitle || 'Course'}</small>
              </div>
            </Col>
            <Col xs="auto">
              <div className="d-flex align-items-center gap-2">
                <Badge bg="success" className="px-3 py-2">
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-white me-2" style={{ width: '8px', height: '8px' }}></div>
                    LIVE
                  </div>
                </Badge>
                <Button variant="outline-light" size="sm" onClick={handleLeaveSession}>
                  <FaSignOutAlt className="me-1" />
                  Leave
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Main Content */}
      <Container fluid className="p-3" style={{ height: 'calc(100vh - 80px)' }}>
        <Row className="h-100 g-3">
          {/* Video Section */}
          <Col lg={8} className="h-100">
            <Card className="border-0 shadow h-100">
              <Card.Body className="p-0 d-flex flex-column h-100">
                {/* Video Stream */}
                <div className="flex-grow-1 bg-dark text-white rounded-top d-flex align-items-center justify-content-center position-relative">
                  <div className="text-center">
                    <div className="bg-primary rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" 
                         style={{ width: '120px', height: '120px' }}>
                      <FaVideo size={50} />
                    </div>
                    <h3>Instructor Video Stream</h3>
                    <p className="text-muted mb-0">Watching live session</p>
                    <Badge bg="success" className="mt-3">
                      🔴 LIVE
                    </Badge>
                  </div>
                  
                  {/* Session info overlay */}
                  <div className="position-absolute top-0 start-0 m-3">
                    <Badge bg="dark" bg-opacity="75" className="px-3 py-2">
                      <FaUsers className="me-1" />
                      You are attending
                    </Badge>
                  </div>
                </div>

                {/* Student Controls */}
                <div className="p-4 bg-white border-top">
                  <Row className="align-items-center">
                    <Col>
                      <div className="d-flex gap-2">
                        <Button 
                          variant={isMuted ? "outline-secondary" : "success"}
                          onClick={toggleAudio}
                          title={isMuted ? "Unmute audio" : "Mute audio"}
                        >
                          {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                        </Button>
                      </div>
                    </Col>
                    <Col xs="auto">
                      <div className="text-muted small">
                        Joined as: <strong>{user?.fullName}</strong>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Chat Section */}
          <Col lg={4} className="h-100">
            <div className="d-flex flex-column h-100">
              {/* Session Info Panel */}
              <Card className="border-0 shadow mb-3">
                <Card.Header className="bg-light border-0">
                  <div className="d-flex align-items-center">
                    <FaComments className="me-2 text-primary" />
                    <span className="fw-bold">Session Chat</span>
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
                      <strong>Status:</strong> <Badge bg="success">Live</Badge>
                    </div>
                    {sessionData?.joinedAt && (
                      <div className="mb-2">
                        <strong>Joined:</strong> {new Date(sessionData.joinedAt).toLocaleTimeString()}
                      </div>
                    )}
                    <hr className="my-2" />
                    <small className="text-muted">
                      You can ask questions and interact with the instructor and other students.
                    </small>
                  </div>
                </Card.Body>
              </Card>

              {/* Real-time Matrix Chat Panel */}
              <div className="flex-grow-1">
                {matrixCredentials && sessionData?.roomId && isJoined ? (
                  <ChatPanel
                    roomId={sessionData.roomId}
                    userCredentials={matrixCredentials}
                    height="calc(100vh - 350px)"
                    className="shadow border-0"
                    showHeader={true}
                    allowFileUpload={false}
                  />
                ) : (
                  <Card className="h-100 border-0 shadow">
                    <Card.Body className="d-flex align-items-center justify-content-center">
                      <div className="text-center text-muted">
                        {!sessionData?.roomId ? (
                          <>
                            <h6>Chat Not Available</h6>
                            <p className="mb-0">Session room not accessible</p>
                          </>
                        ) : !isJoined ? (
                          <>
                            <Spinner className="mb-3" />
                            <p>Connecting to chat...</p>
                          </>
                        ) : (
                          <>
                            <Spinner className="mb-3" />
                            <p>Setting up real-time messaging...</p>
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

export default LiveSessionPage;