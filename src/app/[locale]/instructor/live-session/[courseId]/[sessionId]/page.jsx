// src/app/instructor/live-session/[courseId]/[slotIndex]/page.jsx
// ✅ COMPLETE: End Session with confirmation modal + recording upload + redirects

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, Modal } from 'react-bootstrap';
import { FaVideo, FaVideoSlash, FaMicrophone, FaMicrophoneSlash, FaUsers, FaPlay, FaStop, FaSignOutAlt, FaClock, FaCircle, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getLiveSessionData, manageLiveSession } from '@/services/courseService';
import ChatPanel from '@/components/LiveSession/ChatPanel';
import webrtcService from '@/services/webrtcService';
import webrtcBroadcastService from '@/services/webrtcBroadcastService';
import chatSocketService from '@/services/chatSocketService';

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
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [studentCount, setStudentCount] = useState(0);
  const [streamLoading, setStreamLoading] = useState(false);

  // ✅ NEW: End session modal state
  const [showEndModal, setShowEndModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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
      setupMemberTracking();
    }

    return () => {
      if (chatSocketService.socket) {
        chatSocketService.socket.off('user-joined-chat');
        chatSocketService.socket.off('user-left-chat');
      }
    };
  }, [sessionData?.matrixRoomId, sessionData?.sessionStatus]);

  const setupMemberTracking = () => {
    chatSocketService.onUserJoined(({ userRole }) => {
      if (userRole === 'student') {
        setStudentCount(prev => prev + 1);
        console.log('👥 Student joined, count:', studentCount + 1);
      }
    });

    chatSocketService.onUserLeft(({ userId }) => {
      if (userId && userId.includes('student_')) {
        setStudentCount(prev => Math.max(0, prev - 1));
        console.log('👥 Student left, count:', studentCount - 1);
      }
    });
  };

  const handleCleanup = () => {
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
          sessionId: currentSlot._id || slotIndex,
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

      return stream;
    } catch (error) {
      console.error('❌ WebRTC setup failed:', error);
      toast.error('Failed to access camera/microphone');
      throw error;
    }
  };

  const handleStartSession = async () => {
    try {
      console.log('🚀🚀🚀 START BUTTON CLICKED! 🚀🚀🚀');
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

      console.log('📡 START: Step 5 - Initializing broadcast service');
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

  /**
   * ✅ NEW: Show confirmation modal before ending session
   */
  const handleEndSessionClick = () => {
    setShowEndModal(true);
  };

  /**
   * ✅ COMPLETE: End session flow - recording → upload → backend → redirect
   */
  const handleConfirmEndSession = async () => {
    try {
      setShowEndModal(false);
      setIsManaging(true);
      setIsUploading(true);

      console.log('🔴 END SESSION: Starting complete end flow');

      // ==========================================
      // STEP 1: Stop recording (BEFORE stopping broadcast!)
      // ==========================================
      console.log('📹 STEP 1: Stopping recording...');
      let recordingBlob = null;

      if (isRecording) {
        recordingBlob = await webrtcService.stopRecording();
        setIsRecording(false);
        console.log('✅ Recording stopped, blob size:', recordingBlob?.size || 0);
      }

      // ==========================================
      // STEP 2: Upload recording to GCS
      // ==========================================
      let recordingUrl = '';

      if (recordingBlob) {
        console.log('📤 STEP 2: Uploading recording to GCS...');
        toast.loading('Uploading recording... Please wait', { id: 'upload-toast' });

        try {
          const uploadResult = await webrtcService.uploadRecording(
            recordingBlob,
            courseId,
            slotIndex
          );

          if (uploadResult.success && uploadResult.data?.url) {
            recordingUrl = uploadResult.data.url;
            console.log('✅ Recording uploaded successfully:', recordingUrl);
            toast.success('Recording uploaded!', { id: 'upload-toast' });
          } else {
            console.error('❌ Upload failed:', uploadResult.error);
            toast.error('Warning: Recording upload failed', { id: 'upload-toast' });
          }
        } catch (uploadError) {
          console.error('❌ Upload error:', uploadError);
          toast.error('Warning: Recording upload failed', { id: 'upload-toast' });
        }
      } else {
        console.warn('⚠️ No recording blob to upload');
      }

      // ==========================================
      // STEP 3: Stop broadcasting & notify students
      // ==========================================
      console.log('📡 STEP 3: Stopping broadcast...');
      if (isBroadcasting) {
        webrtcBroadcastService.stopBroadcast(); // This emits session-ended
        setIsBroadcasting(false);
        console.log('✅ Broadcast stopped, students notified');
      }

      // ==========================================
      // STEP 4: Call backend to mark session as completed
      // ==========================================
      console.log('🔴 STEP 4: Calling backend to end session...');
      console.log('📝 Sending data:', {
        action: 'end',
        slotIndex: parseInt(slotIndex),
        recordingUrl: recordingUrl || 'no-recording'
      });

      const result = await manageLiveSession(courseId, {
        action: 'end',
        slotIndex: parseInt(slotIndex),
        recordingUrl: recordingUrl || '' // Send URL or empty string
      });

      console.log('📡 Backend response:', result);

      if (result.success) {
        console.log('✅ Session ended successfully in backend');
        toast.success('Live session ended successfully! ✅');

        // Clean up UI states
        setIsCameraOn(false);
        setIsMicOn(false);
        setIsStreaming(false);
        setStreamLoading(false);

        // Stop local stream
        webrtcService.stopLocalStream();

        // Update session status
        setSessionData(prev => ({
          ...prev,
          sessionStatus: 'completed'
        }));

        // ==========================================
        // STEP 5: Redirect instructor to dashboard
        // ==========================================
        console.log('🏠 STEP 5: Redirecting to dashboard...');
        toast.success('Redirecting to dashboard...', { duration: 2000 });

        setTimeout(() => {
          router.push('/live-sessions');
        }, 2000);

      } else {
        console.error('❌ Backend failed to end session:', result.error);
        toast.error(result.error || 'Failed to end session in database');
      }

    } catch (err) {
      console.error('❌ ERROR in end session flow:', err);
      toast.error('Failed to end session: ' + err.message);
    } finally {
      setIsManaging(false);
      setIsUploading(false);
    }
  };

  const handleBackToDashboard = () => {
    router.push('/live-sessions');
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
    <>
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
                {isBroadcasting && (
                  <Badge bg="success" className="px-3 py-2">
                    📡 Broadcasting
                  </Badge>
                )}
                <div className="text-white d-none d-md-flex align-items-center gap-2">
                  <FaUsers />
                  <span className="fw-bold">{studentCount}</span>
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
                              <span className="fw-bold">{studentCount}</span>
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
                              <Button variant="danger" size="lg" onClick={handleEndSessionClick} disabled={isManaging} className="px-4 d-flex align-items-center gap-2 shadow">
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
                          <Badge bg="primary" className="px-2">{studentCount}</Badge>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>

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
                          showMemberCount={false}
                          actualMemberCount={studentCount}
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

      {/* ✅ NEW: End Session Confirmation Modal */}
      <Modal show={showEndModal} onHide={() => !isManaging && setShowEndModal(false)} centered>
        <Modal.Header closeButton={!isManaging}>
          <Modal.Title className="d-flex align-items-center gap-2">
            <FaExclamationTriangle className="text-warning" />
            End Live Session?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-3">
            Are you sure you want to end this live session? This will:
          </p>
          <ul className="mb-3">
            <li>Stop broadcasting to all students</li>
            <li>Stop and upload the recording</li>
            <li>Disconnect all participants</li>
            <li>Mark the session as completed</li>
          </ul>
          <Alert variant="info" className="mb-0">
            <small>
              <strong>Note:</strong> The recording will be uploaded and students will be redirected to their learning dashboard.
            </small>
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEndModal(false)} disabled={isManaging}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmEndSession}
            disabled={isManaging}
            className="d-flex align-items-center gap-2"
          >
            {isManaging ? (
              <>
                <Spinner size="sm" />
                {isUploading ? 'Uploading Recording...' : 'Ending Session...'}
              </>
            ) : (
              <>
                <FaStop />
                End Session
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default InstructorLiveSessionPage;