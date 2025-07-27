// src/app/live-session/[courseId]/[sessionId]/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Badge, Button } from 'react-bootstrap';
import { FaVideo, FaComments, FaSignOutAlt, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { joinLiveSession, getSessionJoinInfo } from '@/services/learningService';

const LiveSessionPage = ({ params }) => {
  const router = useRouter();
  const { courseId, sessionId } = params;
  
  const [sessionData, setSessionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [currentUser, setCurrentUser] = useState({ name: 'Student', id: 'student_123' });

  // Join session on page load
  useEffect(() => {
    joinSession();
  }, [courseId, sessionId]);

  const joinSession = async () => {
    try {
      setIsLoading(true);
      
      // Join the session
      const result = await joinLiveSession(courseId, sessionId);
      
      if (result.success) {
        setSessionData(result.data);
        setIsJoined(true);
        toast.success('Joined live session successfully!');
        
        // Add welcome message
        setMessages([{
          id: 'welcome',
          sender: 'System',
          content: `Welcome to ${result.data.sessionTitle}! You can ask questions in the chat.`,
          timestamp: new Date().toISOString(),
          type: 'system'
        }]);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error joining session:', err);
      setError('Failed to join the live session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      setIsSending(true);
      
      const message = {
        id: `msg_${Date.now()}`,
        sender: currentUser.name,
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
        type: 'student'
      };
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Simulate instructor response (in real app, this comes from Matrix)
      setTimeout(() => {
        const responses = [
          "Thank you for your question! Let me address that now.",
          "Great question! I'll explain this in detail.",
          "That's exactly what we'll cover next.",
          "Excellent point! Let me clarify that.",
          "I'm glad you asked about that topic."
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        setMessages(prev => [...prev, {
          id: `instructor_${Date.now()}`,
          sender: 'Instructor',
          content: randomResponse,
          timestamp: new Date().toISOString(),
          type: 'instructor'
        }]);
      }, Math.random() * 2000 + 1000);
      
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  // Leave session
  const handleLeaveSession = () => {
    toast.success('Left the session');
    router.push('/my-learning');
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast.info(isMuted ? 'Audio unmuted' : 'Audio muted');
  };

  if (isLoading) {
    return (
      <Container fluid className="vh-100 d-flex align-items-center justify-content-center bg-dark">
        <Card className="border-0 shadow-lg text-center p-4">
          <Card.Body>
            <Spinner animation="border" variant="primary" className="mb-3" />
            <h5>Joining Live Session...</h5>
            <p className="text-muted mb-0">Please wait while we connect you to the session.</p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="vh-100 d-flex align-items-center justify-content-center bg-light">
        <Card className="border-0 shadow-lg text-center p-4" style={{ maxWidth: '500px' }}>
          <Card.Body>
            <Alert variant="danger" className="mb-3">
              <h5>Unable to Join Session</h5>
              <p className="mb-0">{error}</p>
            </Alert>
            <Button variant="primary" onClick={() => router.push('/my-learning')}>
              Back to My Learning
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <div className="vh-100 bg-dark text-white">
      {/* Header */}
      <div className="bg-primary py-3">
        <Container fluid>
          <Row className="align-items-center">
            <Col>
              <div className="d-flex align-items-center">
                <FaVideo className="me-2" />
                <div>
                  <h5 className="mb-0">{sessionData?.sessionTitle || 'Live Session'}</h5>
                  <small className="opacity-75">{sessionData?.courseTitle}</small>
                </div>
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
                <Button variant="outline-light" size="sm" onClick={toggleMute}>
                  {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                </Button>
                <Button variant="danger" size="sm" onClick={handleLeaveSession}>
                  <FaSignOutAlt className="me-1" />
                  Leave
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Main Content */}
      <Container fluid className="flex-grow-1 p-3" style={{ height: 'calc(100vh - 80px)' }}>
        <Row className="h-100 g-3">
          {/* Video Section */}
          <Col lg={8} className="h-100">
            <Card className="border-0 shadow-lg h-100 bg-dark text-white">
              <Card.Body className="p-0 position-relative h-100">
                {/* Video Player Placeholder */}
                <div className="w-100 h-100 bg-black rounded d-flex align-items-center justify-content-center position-relative">
                  {/* Instructor Video Feed (Placeholder) */}
                  <div className="text-center">
                    <div className="bg-primary rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" 
                         style={{ width: '80px', height: '80px' }}>
                      <FaVideo size={30} />
                    </div>
                    <h4>Instructor Video</h4>
                    <p className="text-muted">WebRTC video stream will appear here</p>
                  </div>
                  
                  {/* Video Controls Overlay */}
                  <div className="position-absolute bottom-0 start-0 end-0 p-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-2">
                        <Badge bg="dark" className="bg-opacity-75 px-2 py-1">
                          <FaVideo className="me-1" />
                          HD Quality
                        </Badge>
                      </div>
                      <div className="d-flex gap-2">
                        <Button 
                          variant={isMuted ? "danger" : "dark"} 
                          size="sm" 
                          className="bg-opacity-75"
                          onClick={toggleMute}
                        >
                          {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Chat Section */}
          <Col lg={4} className="h-100">
            <Card className="border-0 shadow-lg h-100">
              <Card.Header className="bg-light border-0 py-3">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <FaComments className="me-2 text-primary" />
                    <span className="fw-bold text-dark">Live Chat</span>
                  </div>
                  <Badge bg="secondary">{messages.length}</Badge>
                </div>
              </Card.Header>
              
              <Card.Body className="p-0 d-flex flex-column h-100">
                {/* Messages */}
                <div className="flex-grow-1 p-3 overflow-auto" style={{ maxHeight: 'calc(100% - 80px)' }}>
                  {messages.length === 0 ? (
                    <div className="text-center text-muted py-4">
                      <FaComments className="display-4 mb-3 opacity-25" />
                      <p>No messages yet. Ask your first question!</p>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {messages.map((message) => (
                        <div key={message.id} className={`d-flex ${message.type === 'student' ? 'justify-content-end' : 'justify-content-start'}`}>
                          <div 
                            className={`rounded-3 px-3 py-2 max-width-75 ${
                              message.type === 'system' ? 'bg-light text-muted fst-italic' :
                              message.type === 'instructor' ? 'bg-primary text-white' :
                              'bg-secondary text-white'
                            }`}
                            style={{ maxWidth: '85%' }}
                          >
                            {message.type !== 'system' && (
                              <div className="small fw-bold mb-1 opacity-75">
                                {message.sender}
                              </div>
                            )}
                            <div>{message.content}</div>
                            <div className="small opacity-50 mt-1">
                              {new Date(message.timestamp).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="border-top p-3">
                  <form onSubmit={handleSendMessage}>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control border-0 bg-light"
                        placeholder="Ask a question..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={isSending}
                        maxLength={500}
                      />
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={isSending || !newMessage.trim()}
                      >
                        {isSending ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          'Send'
                        )}
                      </button>
                    </div>
                    <small className="text-muted">
                      Your questions will be visible to everyone
                    </small>
                  </form>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LiveSessionPage;