// src/app/instructor/live-session/[courseId]/[sessionId]/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash, FaUsers, FaPlay, FaStop, FaRecordVinyl } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import ChatPanel from '@/components/LiveSession/ChatPanel';

const InstructorLiveSessionPage = ({ params }) => {
  const router = useRouter();
  const { courseId, sessionId } = params;
  
  const [sessionData, setSessionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  
  // Session controls
  const [isLive, setIsLive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  
  // Students data
  const [connectedStudents, setConnectedStudents] = useState([]);

  // Matrix credentials for instructor
  const matrixCredentials = user ? {
    userId: `@instructor_${user.id}:chat.151.hu`,
    accessToken: process.env.NEXT_PUBLIC_MATRIX_ACCESS_TOKEN || 'syt_bm9t_KyFOAOqQXtogCcGbRktX_0UliGS'
  } : null;

  // Initialize session
  useEffect(() => {
    initializeSession();
  }, [courseId, sessionId]);

  const initializeSession = async () => {
    try {
      setIsLoading(true);
      
      // Get user info from localStorage or API
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
      
      // Fetch session data from API
      const response = await fetch(`/api/course/${courseId}/live-session`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSessionData({
          sessionTitle: data.sessionTitle || 'Live Session',
          courseTitle: data.courseTitle || 'Course',
          roomId: data.roomId,
          sessionStatus: data.sessionStatus,
          maxStudents: 25
        });
        
        // If session is already live, update UI state
        if (data.sessionStatus === 'live') {
          setIsLive(true);
          setIsCameraOn(true);
          setIsMicOn(true);
          setIsRecording(true);
        }
      } else {
        // Mock data for testing
        setSessionData({
          sessionTitle: 'Introduction to React Hooks',
          courseTitle: 'Advanced React Development',
          roomId: `!test_room_${courseId}:chat.151.hu`,
          maxStudents: 25,
          sessionStatus: 'scheduled'
        });
      }
      
      // Mock connected students (in real app, this would come from Matrix room members)
      setConnectedStudents([
        { id: '1', name: 'Alice Johnson', joinedAt: new Date() },
        { id: '2', name: 'Bob Smith', joinedAt: new Date() },
        { id: '3', name: 'Carol Davis', joinedAt: new Date() }
      ]);
      
    } catch (err) {
      console.error('Error initializing session:', err);
      setError('Failed to initialize the session');
    } finally {
      setIsLoading(false);
    }
  };

  // Start live session
  const handleStartSession = async () => {
    try {
      // Call API to start session
      const response = await fetch(`/api/course/${courseId}/live-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'start',
          slotIndex: 0
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        setIsLive(true);
        setIsCameraOn(true);
        setIsMicOn(true);
        setIsRecording(true);
        
        // Update session data with room ID from API
        setSessionData(prev => ({
          ...prev,
          roomId: data.data?.roomId || prev.roomId,
          sessionStatus: 'live'
        }));
        
        toast.success('Live session started! 🔴');
      } else {
        throw new Error('Failed to start session');
      }
      
    } catch (err) {
      console.error('Error starting session:', err);
      toast.error('Failed to start session');
    }
  };

  // End live session
  const handleEndSession = async () => {
    try {
      // Call API to end session
      const response = await fetch(`/api/course/${courseId}/live-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          action: 'end',
          slotIndex: 0
        })
      });

      if (response.ok) {
        setIsLive(false);
        setIsCameraOn(false);
        setIsMicOn(false);
        setIsRecording(false);
        
        setSessionData(prev => ({
          ...prev,
          sessionStatus: 'completed'
        }));
        
        toast.success('Live session ended ✅');
      } else {
        throw new Error('Failed to end session');
      }
      
    } catch (err) {
      console.error('Error ending session:', err);
      toast.error('Failed to end session');
    }
  };

  // Toggle camera
  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
    toast.info(isCameraOn ? 'Camera turned off' : 'Camera turned on');
  };

  // Toggle microphone
  const toggleMicrophone = () => {
    setIsMicOn(!isMicOn);
    toast.info(isMicOn ? 'Microphone muted' : 'Microphone unmuted');
  };

  if (isLoading) {
    return (
      <Container fluid className="vh-100 d-flex align-items-center justify-content-center">
        <Card className="border-0 shadow-lg text-center p-4">
          <Card.Body>
            <Spinner animation="border" variant="primary" className="mb-3" />
            <h5>Setting up Live Session...</h5>
            <p className="text-muted mb-0">Preparing your session room</p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="vh-100 d-flex align-items-center justify-content-center">
        <Alert variant="danger" className="text-center p-4">
          <h5>Session Setup Error</h5>
          <p>{error}</p>
          <Button variant="primary" onClick={() => router.push('/instructor/dashboard')}>
            Back to Dashboard
          </Button>
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
                <h5 className="mb-0">{sessionData?.sessionTitle}</h5>
                <small className="opacity-75">{sessionData?.courseTitle}</small>
              </div>
            </Col>
            <Col xs="auto">
              <div className="d-flex align-items-center gap-2">
                <Badge bg={isLive ? "success" : "secondary"} className="px-3 py-2">
                  {isLive ? (
                    <>
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle bg-white me-2" style={{ width: '8px', height: '8px' }}></div>
                        LIVE
                      </div>
                    </>
                  ) : 'OFFLINE'}
                </Badge>
                <Badge bg="info" className="px-2 py-1">
                  <FaUsers className="me-1" />
                  {connectedStudents.length} students
                </Badge>
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
                      {isLive && (
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
                      <p className="text-muted">Turn on camera to start streaming</p>
                    </div>
                  )}
                  
                  {/* Recording indicator */}
                  {isRecording && (
                    <div className="position-absolute top-0 start-0 m-3">
                      <Badge bg="danger" className="d-flex align-items-center">
                        <FaRecordVinyl className="me-1" />
                        Recording
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
                          disabled={!isLive}
                          title={isCameraOn ? "Turn off camera" : "Turn on camera"}
                        >
                          {isCameraOn ? <FaVideo /> : <FaVideoSlash />}
                        </Button>
                        <Button 
                          variant={isMicOn ? "success" : "outline-secondary"}
                          onClick={toggleMicrophone}
                          disabled={!isLive}
                          title={isMicOn ? "Mute microphone" : "Unmute microphone"}
                        >
                          {isMicOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
                        </Button>
                      </div>
                    </Col>
                    <Col xs="auto">
                      {!isLive ? (
                        <Button variant="success" size="lg" onClick={handleStartSession}>
                          <FaPlay className="me-2" />
                          Start Live Session
                        </Button>
                      ) : (
                        <Button variant="danger" size="lg" onClick={handleEndSession}>
                          <FaStop className="me-2" />
                          End Session
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
              {/* Connected Students Panel */}
              <Card className="border-0 shadow">
                <Card.Header className="bg-light border-0">
                  <div className="d-flex align-items-center">
                    <FaUsers className="me-2 text-primary" />
                    <span className="fw-bold">Connected Students ({connectedStudents.length})</span>
                  </div>
                </Card.Header>
                <Card.Body className="p-2" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                  {connectedStudents.length === 0 ? (
                    <div className="text-center text-muted py-2">
                      <small>No students connected yet</small>
                    </div>
                  ) : (
                    connectedStudents.map(student => (
                      <div key={student.id} className="d-flex align-items-center justify-content-between py-1 px-2 small">
                        <span>{student.name}</span>
                        <Badge bg="success" className="rounded-circle" style={{ width: '8px', height: '8px' }}></Badge>
                      </div>
                    ))
                  )}
                </Card.Body>
              </Card>

              {/* Real-time Matrix Chat Panel */}
              <div className="flex-grow-1">
                {matrixCredentials && sessionData?.roomId ? (
                  <ChatPanel
                    roomId={sessionData.roomId}
                    userCredentials={matrixCredentials}
                    height="calc(100vh - 400px)"
                    className="shadow"
                    showHeader={true}
                    allowFileUpload={false}
                  />
                ) : (
                  <Card className="h-100 border-0 shadow">
                    <Card.Body className="d-flex align-items-center justify-content-center">
                      <div className="text-center text-muted">
                        <Spinner className="mb-3" />
                        <p>Setting up chat...</p>
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