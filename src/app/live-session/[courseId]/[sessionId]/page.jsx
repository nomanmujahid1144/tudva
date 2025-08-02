// src/app/live-session/[courseId]/[sessionId]/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Badge, Button } from 'react-bootstrap';
import { FaVideo, FaComments, FaSignOutAlt, FaVolumeUp, FaVolumeMute, FaUsers } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { joinLiveSession, getSessionJoinInfo } from '@/services/learningService';
import ChatPanel from '@/components/LiveSession/ChatPanel';
import { useAuth } from '@/context/AuthContext';

const LiveSessionPage = ({ params }) => {
  const router = useRouter();
  const { courseId, sessionId } = params;
  const { user, loading } = useAuth();
  
  const [sessionData, setSessionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  console.log(user, 'User')

  // Matrix credentials for student
  const matrixCredentials = user ? {
    userId: `@student_${user.id}:chat.151.hu`,
    accessToken: process.env.NEXT_PUBLIC_MATRIX_ACCESS_TOKEN || 'syt_bm9t_KyFOAOqQXtogCcGbRktX_0UliGS'
  } : null;

  // Initialize user and join session on page load
  useEffect(() => {
    initializeUserAndJoinSession();
  }, [courseId, sessionId, user]);

  const initializeUserAndJoinSession = async () => {
    try {
      setIsLoading(true);
      
      if(!user){
        return
      }
      
      // Join the session
      await joinSession();
      
    } catch (err) {
      console.error('Error initializing:', err);
      setError('Failed to initialize the session');
    } finally {
      setIsLoading(false);
    }
  };

  const joinSession = async () => {
    try {
      // Try to join via API
      const result = await joinLiveSession(courseId, sessionId);
      
      console.log(result, 'result')

      if (result.success) {
        setSessionData(result.data);
        setIsJoined(true);
        toast.success('Joined live session successfully!');
      } else {
        // Fallback to mock data for testing
        console.log('API join failed, using mock data');
        setSessionData({
          sessionTitle: 'Introduction to React Hooks',
          courseTitle: 'Advanced React Development',
          roomId: `!test_room_${courseId}:chat.151.hu`,
          sessionStatus: 'live',
          sessionTime: new Date().toISOString(),
          matrixRoomUrl: `https://chat.151.hu/#/room/!test_room_${courseId}:chat.151.hu`,
          user: {
            id: user?.id || 'student_123',
            name: user?.fullName || 'John Student',
            matrixUserId: `@student_${user?.id || 'student_123'}:chat.151.hu`
          }
        });
        setIsJoined(true);
        toast.success('Connected to demo session');
      }
    } catch (err) {
      console.error('Error joining session:', err);
      setError('Failed to join the live session. Please try again.');
    }
  };

  // Leave session
  const handleLeaveSession = () => {
    router.push('/my-learning');
    toast.info('Left the session');
  };

  // Toggle audio mute
  const toggleAudio = () => {
    setIsMuted(!isMuted);
    toast.info(isMuted ? 'Audio unmuted' : 'Audio muted');
  };

  if (isLoading) {
    return (
      <Container fluid className="vh-100 d-flex align-items-center justify-content-center">
        <Card className="border-0 shadow-lg text-center p-4">
          <Card.Body>
            <Spinner animation="border" variant="primary" className="mb-3" />
            <h5>Joining Live Session...</h5>
            <p className="text-muted mb-0">Please wait while we connect you</p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="vh-100 d-flex align-items-center justify-content-center">
        <Alert variant="danger" className="text-center p-4">
          <h5>Connection Error</h5>
          <p>{error}</p>
          <div className="mt-3">
            <Button variant="primary" onClick={() => window.location.reload()} className="me-2">
              Try Again
            </Button>
            <Button variant="outline-secondary" onClick={() => router.push('/my-learning')}>
              Back to My Learning
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
                        Session Status: <Badge bg="success">Live</Badge>
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
                  <div className="text-center">
                    <small className="text-muted">
                      You can ask questions and interact with the instructor and other students in the chat below.
                    </small>
                  </div>
                </Card.Body>
              </Card>

              {/* Real-time Matrix Chat Panel */}
              <div className="flex-grow-1">
                {matrixCredentials && sessionData?.roomId ? (
                  <ChatPanel
                    roomId={sessionData.roomId}
                    userCredentials={matrixCredentials}
                    height="calc(100vh - 300px)"
                    className="shadow"
                    showHeader={true}
                    allowFileUpload={false}
                  />
                ) : (
                  <Card className="h-100 border-0 shadow">
                    <Card.Body className="d-flex align-items-center justify-content-center">
                      <div className="text-center text-muted">
                        <Spinner className="mb-3" />
                        <p>Connecting to chat...</p>
                        <small>Setting up real-time messaging</small>
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