// src/app/instructor/live-session/[courseId]/[sessionId]/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, Form } from 'react-bootstrap';
import { FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash, FaComments, FaUsers, FaPlay, FaStop, FaRecordVinyl } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const InstructorLiveSessionPage = ({ params }) => {
  const router = useRouter();
  const { courseId, sessionId } = params;
  
  const [sessionData, setSessionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Session controls
  const [isLive, setIsLive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  
  // Chat and students
  const [messages, setMessages] = useState([]);
  const [connectedStudents, setConnectedStudents] = useState([]);
  const [newResponse, setNewResponse] = useState('');

  // Initialize session
  useEffect(() => {
    initializeSession();
    
    // Mock connected students
    setConnectedStudents([
      { id: '1', name: 'Alice Johnson', joinedAt: new Date() },
      { id: '2', name: 'Bob Smith', joinedAt: new Date() },
      { id: '3', name: 'Carol Davis', joinedAt: new Date() }
    ]);

    // Mock initial messages
    setMessages([
      {
        id: 'system_1',
        sender: 'System',
        content: 'Live session room created. Students can now join.',
        timestamp: new Date().toISOString(),
        type: 'system'
      }
    ]);
  }, [courseId, sessionId]);

  const initializeSession = async () => {
    try {
      setIsLoading(true);
      
      // Mock session data (in real app, fetch from API)
      setSessionData({
        sessionTitle: 'Introduction to React Hooks',
        courseTitle: 'Advanced React Development',
        roomId: `room_${courseId}_${sessionId}`,
        maxStudents: 25,
        sessionStatus: 'scheduled'
      });
      
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
      setIsLive(true);
      setIsCameraOn(true);
      setIsMicOn(true);
      setIsRecording(true);
      
      toast.success('Live session started!');
      
      // Add system message
      setMessages(prev => [...prev, {
        id: `system_${Date.now()}`,
        sender: 'System',
        content: '🔴 Live session has started! Students can now see and hear you.',
        timestamp: new Date().toISOString(),
        type: 'system'
      }]);
      
      // Simulate student questions
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: `student_${Date.now()}`,
          sender: 'Alice Johnson',
          content: 'Can you explain the difference between useState and useEffect?',
          timestamp: new Date().toISOString(),
          type: 'student'
        }]);
      }, 5000);
      
    } catch (err) {
      console.error('Error starting session:', err);
      toast.error('Failed to start session');
    }
  };

  // End live session
  const handleEndSession = async () => {
    try {
      setIsLive(false);
      setIsCameraOn(false);
      setIsMicOn(false);
      setIsRecording(false);
      
      toast.success('Live session ended');
      
      // Add system message
      setMessages(prev => [...prev, {
        id: `system_${Date.now()}`,
        sender: 'System',
        content: '✅ Live session ended. Recording has been saved.',
        timestamp: new Date().toISOString(),
        type: 'system'
      }]);
      
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

  // Send text response (optional - instructor can type responses too)
  const handleSendResponse = (e) => {
    e.preventDefault();
    
    if (!newResponse.trim()) return;
    
    const message = {
      id: `instructor_${Date.now()}`,
      sender: 'Instructor',
      content: newResponse.trim(),
      timestamp: new Date().toISOString(),
      type: 'instructor'
    };
    
    setMessages(prev => [...prev, message]);
    setNewResponse('');
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
                        >
                          {isCameraOn ? <FaVideo /> : <FaVideoSlash />}
                        </Button>
                        <Button 
                          variant={isMicOn ? "success" : "outline-secondary"}
                          onClick={toggleMicrophone}
                          disabled={!isLive}
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

          {/* Chat and Students Section */}
          <Col lg={4} className="h-100">
            <div className="d-flex flex-column h-100 gap-3">
              {/* Connected Students */}
              <Card className="border-0 shadow">
                <Card.Header className="bg-light border-0">
                  <div className="d-flex align-items-center">
                    <FaUsers className="me-2 text-primary" />
                    <span className="fw-bold">Connected Students ({connectedStudents.length})</span>
                  </div>
                </Card.Header>
                <Card.Body className="p-2" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                  {connectedStudents.map(student => (
                    <div key={student.id} className="d-flex align-items-center justify-content-between py-1 px-2 small">
                      <span>{student.name}</span>
                      <Badge bg="success" className="rounded-circle" style={{ width: '8px', height: '8px' }}></Badge>
                    </div>
                  ))}
                </Card.Body>
              </Card>

              {/* Chat Messages */}
              <Card className="border-0 shadow flex-grow-1">
                <Card.Header className="bg-light border-0">
                  <div className="d-flex align-items-center">
                    <FaComments className="me-2 text-primary" />
                    <span className="fw-bold">Student Questions</span>
                  </div>
                </Card.Header>
                <Card.Body className="p-0 d-flex flex-column h-100">
                  {/* Messages */}
                  <div className="flex-grow-1 p-3 overflow-auto">
                    {messages.map(message => (
                      <div key={message.id} className="mb-3">
                        <div className={`rounded-3 p-2 ${
                          message.type === 'system' ? 'bg-light text-muted fst-italic' :
                          message.type === 'student' ? 'bg-primary bg-opacity-10 border border-primary border-opacity-25' :
                          'bg-success bg-opacity-10 border border-success border-opacity-25'
                        }`}>
                          {message.type !== 'system' && (
                            <div className="small fw-bold text-primary mb-1">
                              {message.sender}
                            </div>
                          )}
                          <div>{message.content}</div>
                          <div className="small text-muted mt-1">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick Response (Optional) */}
                  <div className="border-top p-2">
                    <Form onSubmit={handleSendResponse}>
                      <div className="input-group input-group-sm">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Quick text response..."
                          value={newResponse}
                          onChange={(e) => setNewResponse(e.target.value)}
                        />
                        <button type="submit" className="btn btn-outline-primary">
                          Send
                        </button>
                      </div>
                    </Form>
                    <small className="text-muted">
                      You can respond by speaking or typing
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default InstructorLiveSessionPage;