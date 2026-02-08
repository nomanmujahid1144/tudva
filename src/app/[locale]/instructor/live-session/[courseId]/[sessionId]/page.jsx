// src/app/instructor/live-session/[courseId]/[slotIndex]/page.jsx
// ✅ COMPLETE WITH WEBRTC BROADCASTING

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash, FaUsers, FaPlay, FaStop, FaSignOutAlt, FaClock, FaCircle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getLiveSessionData, manageLiveSession } from '@/services/courseService';
import ChatPanel from '@/components/LiveSession/ChatPanel';
import webrtcService from '@/services/webrtcService';
import webrtcBroadcastService from '@/services/webrtcBroadcastService'; // ✅ NEW IMPORT

const InstructorLiveSessionPage = ({ params }) => {
  const router = useRouter();
  const { courseId, sessionId } = params;
  const slotIndex = sessionId;
  const { user, loading: authLoading } = useAuth();

  const videoRef = useRef(null);
  const [sessionData, setSessionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isManaging, setIsManaging] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false); // ✅ NEW STATE
  const [roomMembers, setRoomMembers] = useState({ students: [], instructors: [], totalCount: 0 });
  const [streamLoading, setStreamLoading] = useState(false);

  const matrixCredentials = user ? {
    userId: `@instructor_${user.id}:151.hu`,
    accessToken: process.env.NEXT_PUBLIC_MATRIX_ACCESS_TOKEN
  } : null;

  useEffect(() => {
    if (!authLoading && user) {
      loadSessionData();
    }

    return () => {
      handleCleanup();
    };
  }, [courseId, slotIndex, user, authLoading]);

  useEffect(() => {
    if (sessionData?.matrixRoomId && isSessionLive()) {
      fetchRoomMembers();
      const interval = setInterval(fetchRoomMembers, 5000);
      return () => clearInterval(interval);
    }
  }, [sessionData?.matrixRoomId, sessionData?.sessionStatus]);

  const fetchRoomMembers = async () => {
    if (!sessionData?.matrixRoomId) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/matrix/room-members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ roomId: sessionData.matrixRoomId })
      });

      const result = await response.json();
      if (result.success) {
        setRoomMembers(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch room members:', error);
    }
  };

  const handleCleanup = () => {
    // ✅ NEW: Stop broadcasting on cleanup
    if (isBroadcasting) {
      console.log('🧹 Cleaning up: Stopping broadcast');
      webrtcBroadcastService.stopBroadcast();
    }

    webrtcService.cleanup();
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  const loadSessionData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await getLiveSessionData(courseId);

      if (result.success) {
        const data = result.data;
        const currentSlot = data.timeSlots?.[slotIndex];

        if (!currentSlot) {
          setError(`Session slot ${slotIndex} not found`);
          return;
        }

        console.log('📊 DEBUG - Session slot data:', {
          slotIndex,
          slotId: currentSlot._id,
          matrixRoomId: currentSlot.matrixRoomId,
          currentSlot
        });

        setSessionData({
          sessionId: currentSlot._id || slotIndex, // ✅ Store actual session ID
          sessionTitle: `Session ${parseInt(slotIndex) + 1}`,
          courseTitle: data.courseTitle,
          roomId: currentSlot.matrixRoomId,
          sessionStatus: currentSlot.sessionStatus,
          sessionDate: currentSlot.sessionDate,
          matrixRoomId: currentSlot.matrixRoomId,
          slotData: currentSlot
        });

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

  const isSessionLive = () => {
    return sessionData?.sessionStatus === 'live';
  };

  const setupWebRTC = async () => {
    try {
      console.log('🔄 Step 1: Getting media stream...');
      const stream = await webrtcService.getMediaStream();
      console.log('✅ Step 2: Got stream with', stream.getVideoTracks().length, 'video tracks');

      console.log('🔄 Step 3: Checking videoRef.current...');
      if (videoRef.current) {
        console.log('✅ Step 4: Video element EXISTS, attaching stream');
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;

        console.log('🔄 Step 5: Playing video...');
        await videoRef.current.play();
        console.log('✅ Step 6: Video PLAYING!');
      } else {
        console.error('❌ Step 4: Video element is NULL!');
      }

      console.log('🔄 Step 7: Starting recording...');
      webrtcService.startRecording();
      setIsRecording(true);

      console.log('✅ WebRTC setup complete - YOU SHOULD SEE YOUR VIDEO NOW!');

      return stream; // ✅ Return stream for broadcasting
    } catch (error) {
      console.error('❌ WebRTC setup failed:', error);
      toast.error('Failed to access camera/microphone');
      throw error;
    }
  };

  const handleStartSession = async () => {
    try {
      console.log('🚀🚀🚀 START BUTTON CLICKED! 🚀🚀🚀'); // ADD THIS LINE
      setIsManaging(true);
      console.log('🚀 START: Step 1 - Starting live session');

      if (isStreaming) {
        console.log('✅ Already streaming');
        setIsManaging(false);
        return;
      }

      if (!isSessionLive()) {
        const result = await manageLiveSession(courseId, {
          action: 'start',
          slotIndex: parseInt(slotIndex),
          sessionDate: new Date().toISOString(),
          sessionTitle: `Session ${parseInt(slotIndex) + 1}`
        });

        console.log('🚀 START: Step 2 - Backend response:', result);

        if (!result.success) {
          console.error('❌ Failed to start session:', result.error);
          toast.error(result.error || 'Failed to start live session');
          setIsManaging(false);
          return;
        }

        toast.success('Live session started! 🔴');

        setSessionData(prev => ({
          ...prev,
          sessionStatus: 'live'
        }));
      }

      console.log('🚀 START: Step 3 - Setting streaming states');
      setIsStreaming(true);
      setIsCameraOn(true);
      setIsMicOn(true);

      await new Promise(resolve => setTimeout(resolve, 100));

      console.log('🚀 START: Step 4 - Setting up WebRTC');
      const stream = await setupWebRTC();

      // ✅ NEW: Initialize and start broadcasting
      console.log('📡 START: Step 5 - Initializing broadcast service');
      // Use Matrix Room ID as session key (guaranteed to be the same)
      const sessionKey = sessionData?.matrixRoomId || sessionData?.roomId;
      console.log('📡 Session key (matrixRoomId):', sessionKey);

      const initResult = await webrtcBroadcastService.initialize(sessionKey, true);
      if (!initResult.success) {
        console.error('❌ Broadcast init failed:', initResult.error);
        toast.error('Failed to initialize broadcasting');
        return;
      }

      console.log('📡 START: Step 6 - Starting broadcast with stream');
      const broadcastResult = await webrtcBroadcastService.startBroadcast(stream);
      if (!broadcastResult.success) {
        console.error('❌ Broadcast start failed:', broadcastResult.error);
        toast.error('Failed to start broadcasting');
        return;
      }

      setIsBroadcasting(true);
      console.log('✅ START: Broadcasting to students successfully!');
      toast.success('🎥 Broadcasting to students!');

    } catch (err) {
      console.error('❌ Error starting session:', err);
      toast.error('Failed to start live session');
    } finally {
      setIsManaging(false);
    }
  };

  const handleEndSession = async () => {
    try {
      setIsManaging(true);
      console.log('🔴 END: Step 1 - Ending live session');

      // ✅ NEW: Stop broadcasting first
      if (isBroadcasting) {
        console.log('📡 END: Step 1.5 - Stopping broadcast');
        webrtcBroadcastService.stopBroadcast();
        setIsBroadcasting(false);
        toast.info('Stopped broadcasting');
      }

      console.log('🔴 END: Step 2 - Stopping recording');
      const recordingBlob = await webrtcService.stopRecording();
      setIsRecording(false);

      let recordingUrl = '';
      if (recordingBlob) {
        console.log('📤 END: Step 3 - Uploading recording');
        toast.success('Uploading recording...');

        try {
          const uploadResult = await webrtcService.uploadRecording(
            recordingBlob,
            courseId,
            slotIndex
          );

          if (uploadResult.success) {
            recordingUrl = uploadResult.data.url;
            toast.success('Recording uploaded!');
          }
        } catch (uploadError) {
          console.error('❌ Upload failed:', uploadError);
          toast.error('Failed to upload recording');
        }
      }

      console.log('🔴 END: Step 4 - Calling backend to end session');
      const result = await manageLiveSession(courseId, {
        action: 'end',
        slotIndex: parseInt(slotIndex),
        recordingUrl
      });

      if (result.success) {
        toast.success('Live session ended ✅');

        setIsCameraOn(false);
        setIsMicOn(false);
        setIsStreaming(false);
        setStreamLoading(false);

        webrtcService.stopLocalStream();

        setSessionData(prev => ({
          ...prev,
          sessionStatus: 'completed'
        }));
      } else {
        toast.error(result.error || 'Failed to end session');
      }
    } catch (err) {
      console.error('❌ Error ending session:', err);
      toast.error('Failed to end session');
    } finally {
      setIsManaging(false);
    }
  };

  const handleBackToDashboard = () => {
    router.push('/instructor/live-sessions');
  };

  const toggleCamera = () => {
    if (!isSessionLive() || !isStreaming) {
      toast.error('Start the session first');
      return;
    }

    const videoTrack = webrtcService.localStream?.getVideoTracks()[0];
    if (videoTrack) {
      const newState = !isCameraOn;
      videoTrack.enabled = newState;
      setIsCameraOn(newState);
      toast.success(newState ? 'Camera on' : 'Camera off');
    }
  };

  const toggleMicrophone = () => {
    if (!isSessionLive() || !isStreaming) {
      toast.error('Start the session first');
      return;
    }

    const audioTrack = webrtcService.localStream?.getAudioTracks()[0];
    if (audioTrack) {
      const newState = !isMicOn;
      audioTrack.enabled = newState;
      setIsMicOn(newState);
      toast.success(newState ? 'Microphone unmuted' : 'Microphone muted');
    }
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
      case 'cancelled':
        return <Badge bg="secondary" className="px-3 py-2">Cancelled</Badge>;
      default:
        return <Badge bg="secondary" className="px-3 py-2">Unknown</Badge>;
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="vh-100 d-flex align-items-center justify-content-center bg-dark">
        <div className="text-center text-white">
          <Spinner animation="border" variant="light" className="mb-3" style={{ width: '3rem', height: '3rem' }} />
          <h4>{authLoading ? 'Authenticating...' : 'Loading Session...'}</h4>
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
          <p>Please log in to access the instructor session.</p>
          <Button variant="primary" onClick={() => router.push('/login')}>
            Go to Login
          </Button>
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vh-100 d-flex align-items-center justify-content-center bg-dark">
        <Alert variant="danger" className="text-center p-4 border-0 shadow-lg" style={{ maxWidth: '500px' }}>
          <h5>Session Error</h5>
          <p>{error}</p>
          <div className="mt-3">
            <Button variant="primary" onClick={loadSessionData} className="me-2">
              Try Again
            </Button>
            <Button variant="outline-light" onClick={handleBackToDashboard}>
              Back to Dashboard
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="vh-100 d-flex flex-column bg-dark">
      <div className="bg-gradient" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <Container fluid className="px-4">
          <div className="d-flex align-items-center justify-content-between py-3">
            <div className="d-flex align-items-center gap-3">
              <Button variant="light" size="sm" onClick={handleBackToDashboard} className="d-flex align-items-center gap-2 px-3">
                <FaSignOutAlt />
                <span className="d-none d-md-inline">Exit</span>
              </Button>
              <div className="text-white">
                <h5 className="mb-0 fw-bold">{sessionData?.sessionTitle}</h5>
                <small className="opacity-75">{sessionData?.courseTitle}</small>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3">
              {getSessionStatusBadge()}
              {/* ✅ NEW: Broadcasting indicator */}
              {isBroadcasting && (
                <Badge bg="success" className="px-3 py-2">
                  📡 Broadcasting
                </Badge>
              )}
              <div className="text-white d-none d-md-flex align-items-center gap-2">
                <FaUsers />
                <span className="fw-bold">{roomMembers.studentCount || 0}</span>
                <span className="opacity-75 small">viewers</span>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <div className="flex-grow-1 overflow-hidden">
        <Container fluid className="h-100 p-3">
          <Row className="h-100 g-3">
            <Col lg={8} xxl={9} className="h-100">
              <div className="h-100 d-flex flex-column">
                <div className="flex-grow-1 position-relative rounded-3 overflow-hidden shadow-lg" style={{
                  background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                  minHeight: '400px'
                }}>
                  {isStreaming ? (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-100 h-100 position-absolute top-0 start-0"
                        style={{ objectFit: 'cover' }}
                      />
                      {isRecording && (
                        <div className="position-absolute top-0 start-0 m-3">
                          <Badge bg="danger" className="px-3 py-2 d-flex align-items-center gap-2 shadow">
                            <FaCircle size={8} className="animate-pulse" />
                            <span className="fw-bold">REC</span>
                          </Badge>
                        </div>
                      )}
                      <div className="position-absolute top-0 end-0 m-3">
                        <div className="bg-dark bg-opacity-75 rounded-3 px-3 py-2 text-white">
                          <div className="d-flex align-items-center gap-2">
                            <FaUsers />
                            <span className="fw-bold">{roomMembers.studentCount || 0}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-100 h-100 position-absolute top-0 start-0 d-flex align-items-center justify-content-center text-white">
                      <div className="text-center">
                        <div className="mb-4">
                          <div className="rounded-circle bg-white bg-opacity-10 mx-auto d-flex align-items-center justify-content-center"
                            style={{ width: '120px', height: '120px' }}>
                            <FaVideoSlash size={50} className="opacity-50" />
                          </div>
                        </div>
                        <h3 className="mb-2">Camera Off</h3>
                        <p className="text-white-50 mb-0">
                          {isSessionLive() ? 'Click "Start Streaming" to begin' : 'Click "Go Live" to start the session'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-3">
                  <Card className="border-0 shadow-sm" style={{ background: 'rgba(255,255,255,0.95)' }}>
                    <Card.Body className="p-3">
                      <Row className="align-items-center">
                        <Col>
                          <div className="d-flex gap-2">
                            <Button variant={isCameraOn ? "primary" : "outline-secondary"} onClick={toggleCamera} disabled={!isStreaming} className="d-flex align-items-center gap-2 px-3">
                              {isCameraOn ? <FaVideo /> : <FaVideoSlash />}
                              <span className="d-none d-md-inline">Camera</span>
                            </Button>
                            <Button variant={isMicOn ? "primary" : "outline-secondary"} onClick={toggleMicrophone} disabled={!isStreaming} className="d-flex align-items-center gap-2 px-3">
                              {isMicOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
                              <span className="d-none d-md-inline">Mic</span>
                            </Button>
                          </div>
                        </Col>
                        <Col xs="auto">
                          {!isStreaming ? (
                            <Button variant="success" size="lg" onClick={handleStartSession} disabled={isManaging} className="px-4 d-flex align-items-center gap-2 shadow">
                              <FaPlay />
                              <span>{isManaging ? 'Starting...' : isSessionLive() ? 'Start Streaming' : 'Go Live'}</span>
                            </Button>
                          ) : (
                            <Button variant="danger" size="lg" onClick={handleEndSession} disabled={isManaging} className="px-4 d-flex align-items-center gap-2 shadow">
                              <FaStop />
                              <span>{isManaging ? 'Ending...' : 'End Session'}</span>
                            </Button>
                          )}
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </div>
              </div>
            </Col>

            <Col lg={4} xxl={3} className="h-100">
              <div className="h-100 d-flex flex-column gap-3">
                <Card className="border-0 shadow-sm flex-shrink-0">
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
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Students:</span>
                        <Badge bg="primary" className="px-2">{roomMembers.studentCount || 0}</Badge>
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                {/* ✅ FIXED: Chat panel with proper height constraint */}
                <div className="flex-grow-1 overflow-hidden" style={{ minHeight: 0 }}>
                  {matrixCredentials && sessionData?.matrixRoomId ? (
                    <div className="h-100">
                      <ChatPanel
                        roomId={sessionData.matrixRoomId}
                        userCredentials={matrixCredentials}
                        height="100%"
                        className="shadow-sm border-0 h-100"
                        showHeader={true}
                        allowFileUpload={false}
                        showMemberCount={true}
                        actualMemberCount={roomMembers.studentCount || 0}
                      />
                    </div>
                  ) : (
                    <Card className="h-100 border-0 shadow-sm">
                      <Card.Body className="d-flex align-items-center justify-content-center">
                        <div className="text-center text-muted">
                          {!sessionData?.matrixRoomId ? (
                            <>
                              <h6>Chat Not Available</h6>
                              <p className="mb-0 small">Matrix room not created yet</p>
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

export default InstructorLiveSessionPage;