// src/app/[locale]/live-session/[courseId]/[sessionId]/page.jsx
// ✅ COMPLETE WITH WEBRTC STREAM RECEPTION

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { FaVideo, FaVideoSlash, FaVolumeUp, FaVolumeMute, FaSignOutAlt, FaUsers, FaClock, FaCircle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { joinLiveSession, getSessionJoinInfo } from '@/services/learningService';
import ChatPanel from '@/components/LiveSession/ChatPanel';
import webrtcReceiveService from '@/services/webrtcReceiveService'; // ✅ NEW IMPORT

const StudentLiveSessionPage = ({ params }) => {
  const router = useRouter();
  const { courseId, sessionId } = params;
  const { user, loading: authLoading } = useAuth();

  const videoRef = useRef(null);
  const [sessionData, setSessionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [remoteStream, setRemoteStream] = useState(null); // ✅ NEW STATE
  const [isConnecting, setIsConnecting] = useState(false); // ✅ NEW STATE

  const matrixCredentials = user ? {
    userId: `@student_${user.id}:151.hu`,
    accessToken: process.env.NEXT_PUBLIC_MATRIX_ACCESS_TOKEN
  } : null;

  useEffect(() => {
    if (!authLoading && user) {
      initializeAndJoinSession();
    }

    return () => {
      handleCleanup();
    };
  }, [courseId, sessionId, user, authLoading]);

  // ✅ NEW: Setup stream reception when joined
  useEffect(() => {
    if (isJoined && sessionData && user) {
      setupStreamReception();
    }
  }, [isJoined, sessionData, user]);

  const handleCleanup = () => {
    // ✅ NEW: Disconnect WebRTC receive service
    if (remoteStream) {
      console.log('🧹 Cleaning up: Disconnecting WebRTC...');
      webrtcReceiveService.disconnect();
    }
    
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  // ✅ NEW: Setup WebRTC stream reception
  const setupStreamReception = async () => {
    try {
      setIsConnecting(true);
      console.log('📡 Setting up stream reception...');
      
      // Use Matrix Room ID as session key (same as instructor)
      const sessionKey = sessionData?.matrixRoomId || sessionData?.roomId;
      console.log('📡 Session key (matrixRoomId):', sessionKey);
      
      // Initialize WebRTC receive service
      await webrtcReceiveService.initialize(
        sessionKey,
        user.id,
        (stream) => {
          console.log('✅ Received instructor stream!');
          setRemoteStream(stream);
          setIsConnecting(false);
          
          // Attach to video element
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(err => {
              console.error('Error playing video:', err);
            });
            toast.success('Connected to instructor!');
          }
        }
      );
      
      console.log('📡 Waiting for instructor stream...');
      
    } catch (error) {
      console.error('❌ Failed to setup stream reception:', error);
      setIsConnecting(false);
      toast.error('Failed to connect to instructor stream');
    }
  };

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
          matrixRoomId: result.data.roomId,
          joinedAt: result.data.joinedAt,
          user: result.data.user
        });
        
        setIsJoined(true);
        toast.success('🎓 Joined live session!');
        
      } else {
        console.error('❌ Failed to join session:', result.error);
        setError(result.error || 'Failed to join the live session');
        
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

  const retryJoinSession = async () => {
    await initializeAndJoinSession();
  };

  const handleLeaveSession = () => {
    handleCleanup();
    router.push('/my-learning');
    toast.info('Left the session');
  };

  const toggleAudio = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    if (videoRef.current) {
      videoRef.current.muted = newMutedState;
    }
    
    toast.success(newMutedState ? '🔇 Audio muted' : '🔊 Audio unmuted');
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    toast.info(isVideoEnabled ? 'Video hidden' : 'Video shown');
  };

  const getSessionStatusBadge = () => {
    if (!sessionData) return <Badge bg="secondary">Loading...</Badge>;

    switch (sessionData.sessionStatus) {
      case 'live':
        return (
          <Badge bg="danger" className="d-flex align-items-center gap-1 px-3 py-2">
            <FaCircle size={8} className="animate-pulse" />
            <span className="fw-bold">LIVE</span>
          </Badge>
        );
      case 'scheduled':
        return <Badge bg="primary" className="px-3 py-2">Scheduled</Badge>;
      case 'completed':
        return <Badge bg="success" className="px-3 py-2">Completed</Badge>;
      default:
        return <Badge bg="secondary" className="px-3 py-2">Unknown</Badge>;
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="vh-100 d-flex align-items-center justify-content-center bg-dark">
        <div className="text-center text-white">
          <Spinner animation="border" variant="light" className="mb-3" style={{ width: '3rem', height: '3rem' }} />
          <h4>{authLoading ? 'Authenticating...' : 'Joining Session...'}</h4>
          <p className="text-muted">Please wait</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="vh-100 d-flex align-items-center justify-content-center bg-dark">
        <Alert variant="warning" className="text-center p-4 border-0 shadow-lg" style={{ maxWidth: '500px' }}>
          <h5>Authentication Required</h5>
          <p>Please log in to join the live session.</p>
          <Button variant="primary" onClick={() => router.push('/login')}>
            Go to Login
          </Button>
        </Alert>
      </div>
    );
  }

  if (error && !isJoined) {
    return (
      <div className="vh-100 d-flex align-items-center justify-content-center bg-dark">
        <Alert variant="danger" className="text-center p-4 border-0 shadow-lg" style={{ maxWidth: '500px' }}>
          <h5>Connection Error</h5>
          <p>{error}</p>
          <div className="mt-3">
            <Button variant="primary" onClick={retryJoinSession} className="me-2">
              Try Again
            </Button>
            <Button variant="outline-light" onClick={handleLeaveSession}>
              Back to My Learning
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="vh-100 d-flex flex-column bg-dark">
      {/* Professional Header */}
      <div className="bg-gradient" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <Container fluid className="px-4">
          <div className="d-flex align-items-center justify-content-between py-3">
            <div className="d-flex align-items-center gap-3">
              <Button
                variant="light"
                size="sm"
                onClick={handleLeaveSession}
                className="d-flex align-items-center gap-2 px-3"
              >
                <FaSignOutAlt />
                <span className="d-none d-md-inline">Leave</span>
              </Button>
              <div className="text-white">
                <h5 className="mb-0 fw-bold">{sessionData?.sessionTitle}</h5>
                <small className="opacity-75">{sessionData?.courseTitle}</small>
              </div>
            </div>
            
            <div className="d-flex align-items-center gap-3">
              {getSessionStatusBadge()}
              <div className="text-white d-none d-md-flex align-items-center gap-2">
                <FaUsers />
                <span className="fw-bold">Attending</span>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow-1 overflow-hidden">
        <Container fluid className="h-100 p-3">
          <Row className="h-100 g-3">
            {/* Video Section - 70% */}
            <Col lg={8} xxl={9} className="h-100">
              <div className="h-100 d-flex flex-column">
                {/* Video Display */}
                <div className="flex-grow-1 position-relative rounded-3 overflow-hidden shadow-lg" style={{
                  background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                  minHeight: '400px'
                }}>
                  {isVideoEnabled && isJoined ? (
                    <>
                      {/* ✅ Video element for remote stream */}
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted={isMuted}
                        className="w-100 h-100 position-absolute top-0 start-0"
                        style={{ 
                          objectFit: 'cover',
                          display: remoteStream ? 'block' : 'none' // Show only when stream exists
                        }}
                      />
                      
                      {/* ✅ Placeholder while waiting for stream */}
                      {!remoteStream && (
                        <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white">
                          <div className="text-center">
                            <div className="mb-4">
                              {isConnecting ? (
                                <Spinner animation="border" variant="light" style={{ width: '60px', height: '60px' }} />
                              ) : (
                                <div className="rounded-circle bg-white bg-opacity-10 mx-auto d-flex align-items-center justify-content-center"
                                  style={{ width: '120px', height: '120px' }}>
                                  <FaVideo size={50} className="opacity-50" />
                                </div>
                              )}
                            </div>
                            <h3 className="mb-2">
                              {isConnecting ? 'Connecting...' : 'Watching Instructor'}
                            </h3>
                            <p className="text-white-50 mb-0">
                              {isConnecting 
                                ? 'Establishing connection to instructor...' 
                                : 'Waiting for instructor to start streaming...'}
                            </p>
                            <Badge bg="danger" className="mt-3 px-3 py-2">
                              <FaCircle size={8} className="animate-pulse me-2" />
                              LIVE
                            </Badge>
                          </div>
                        </div>
                      )}
                      
                      {/* Live Indicator */}
                      {remoteStream && (
                        <div className="position-absolute top-0 start-0 m-3">
                          <Badge bg="danger" className="px-3 py-2 d-flex align-items-center gap-2 shadow">
                            <FaCircle size={8} className="animate-pulse" />
                            <span className="fw-bold">LIVE</span>
                          </Badge>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white">
                      <div className="text-center">
                        <div className="mb-4">
                          <div className="rounded-circle bg-white bg-opacity-10 mx-auto d-flex align-items-center justify-content-center"
                            style={{ width: '120px', height: '120px' }}>
                            <FaVideoSlash size={50} className="opacity-50" />
                          </div>
                        </div>
                        <h3 className="mb-2">Video Hidden</h3>
                        <p className="text-white-50 mb-0">Click the video button to show</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Student Controls */}
                <div className="mt-3">
                  <Card className="border-0 shadow-sm" style={{ background: 'rgba(255,255,255,0.95)' }}>
                    <Card.Body className="p-3">
                      <Row className="align-items-center">
                        <Col>
                          <div className="d-flex gap-2">
                            <Button
                              variant={isVideoEnabled ? "primary" : "outline-secondary"}
                              onClick={toggleVideo}
                              className="d-flex align-items-center gap-2 px-3"
                            >
                              {isVideoEnabled ? <FaVideo /> : <FaVideoSlash />}
                              <span className="d-none d-md-inline">Video</span>
                            </Button>
                            <Button
                              variant={!isMuted ? "primary" : "outline-secondary"}
                              onClick={toggleAudio}
                              className="d-flex align-items-center gap-2 px-3"
                            >
                              {!isMuted ? <FaVolumeUp /> : <FaVolumeMute />}
                              <span className="d-none d-md-inline">Audio</span>
                            </Button>
                          </div>
                        </Col>
                        <Col xs="auto">
                          <div className="text-muted small">
                            Attending as: <strong>{user?.fullName}</strong>
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </div>
              </div>
            </Col>

            {/* Sidebar - 30% */}
            <Col lg={4} xxl={3} className="h-100">
              <div className="h-100 d-flex flex-column gap-3">
                {/* Session Info */}
                <Card className="border-0 shadow-sm">
                  <Card.Body className="p-3">
                    <div className="d-flex align-items-center mb-3">
                      <FaClock className="text-primary me-2" />
                      <h6 className="mb-0 fw-bold">Session Info</h6>
                    </div>
                    <div className="small">
                      <div className="d-flex justify-content-between mb-2 pb-2 border-bottom">
                        <span className="text-muted">Course:</span>
                        <span className="fw-semibold text-end">{sessionData?.courseTitle}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2 pb-2 border-bottom">
                        <span className="text-muted">Session:</span>
                        <span className="fw-semibold">{sessionData?.sessionTitle}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2 pb-2 border-bottom">
                        <span className="text-muted">Status:</span>
                        {getSessionStatusBadge()}
                      </div>
                      {/* ✅ NEW: Show connection status */}
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Connection:</span>
                        <Badge bg={remoteStream ? 'success' : 'warning'} className="px-2">
                          {remoteStream ? 'Connected' : isConnecting ? 'Connecting...' : 'Waiting'}
                        </Badge>
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                {/* Chat Panel */}
                <div className="flex-grow-1 position-relative" style={{ minHeight: 0 }}>
                  {matrixCredentials && sessionData?.matrixRoomId && isJoined ? (
                    <div className="h-100">
                      <ChatPanel
                        roomId={sessionData.matrixRoomId}
                        userCredentials={matrixCredentials}
                        height="100%"
                        className="shadow-sm border-0 h-100"
                        showHeader={true}
                        allowFileUpload={false}
                      />
                    </div>
                  ) : (
                    <Card className="h-100 border-0 shadow-sm">
                      <Card.Body className="d-flex align-items-center justify-content-center">
                        <div className="text-center text-muted">
                          {!sessionData?.matrixRoomId ? (
                            <>
                              <h6>Chat Not Available</h6>
                              <p className="mb-0 small">Session room not accessible</p>
                            </>
                          ) : (
                            <>
                              <Spinner className="mb-3" />
                              <p className="mb-0">Connecting to chat...</p>
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

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default StudentLiveSessionPage;