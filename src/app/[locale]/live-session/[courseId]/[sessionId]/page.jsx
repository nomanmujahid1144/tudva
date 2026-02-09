'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { FaSignOutAlt, FaClock, FaCircle, FaVideo } from 'react-icons/fa';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/context/AuthContext';
import { joinLiveSession, getSessionJoinInfo } from '@/services/learningService';
import ChatPanel from '@/components/LiveSession/ChatPanel';
import webrtcReceiveService from '@/services/webrtcReceiveService';

const StudentLiveSessionPage = ({ params }) => {
  const router = useRouter();
  const { courseId, sessionId } = params;
  const { user, loading: authLoading } = useAuth();
  const t = useTranslations('student.liveSession');

  const videoRef = useRef(null);
  const [sessionData, setSessionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

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

  useEffect(() => {
    if (isJoined && sessionData && user && !remoteStream) {
      setupStreamReception();
    }
  }, [isJoined, sessionData, user]);

  useEffect(() => {
    if (remoteStream && videoRef.current) {
      videoRef.current.srcObject = remoteStream;
      videoRef.current.play().catch(err => console.error('Error playing video:', err));
    }
  }, [remoteStream]);

  const handleCleanup = () => {
    if (remoteStream) {
      webrtcReceiveService.disconnect();
    }
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  const setupStreamReception = async () => {
    try {
      setIsConnecting(true);
      const sessionKey = sessionData?.matrixRoomId || sessionData?.roomId;

      await webrtcReceiveService.initialize(
        sessionKey,
        user.id,
        (stream) => {
          setRemoteStream(stream);
          setIsConnecting(false);
          toast.success(t('toast.connectedToInstructor'));
        },
        () => {
          setRemoteStream(null);
          setIsConnecting(true);
          toast.info(t('toast.instructorStopped'));
        },
        () => {
          toast.info(t('toast.sessionEnded'), { duration: 3000 });
          handleCleanup();
          setTimeout(() => router.push('/my-learning'), 2000);
        }
      );
    } catch (error) {
      setIsConnecting(false);
      toast.error(t('toast.connectionFailed'));
    }
  };

  const initializeAndJoinSession = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await joinLiveSession(courseId, sessionId);

      if (result.success) {
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
        toast.success(t('toast.joined'));
      } else {
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
        } catch (infoErr) {}
      }
    } catch (err) {
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
    toast.info(t('toast.leftSession'));
    router.push('/my-learning');
  };

  const getSessionStatusBadge = () => {
    if (!sessionData) return <Badge bg="secondary">{t('status.loading')}</Badge>;

    switch (sessionData.sessionStatus) {
      case 'live':
        return (
          <Badge bg="danger" className="d-flex align-items-center gap-1 px-3 py-2">
            <FaCircle size={8} className="animate-pulse" />
            <span className="fw-bold">{t('status.live')}</span>
          </Badge>
        );
      case 'scheduled':
        return <Badge bg="primary" className="px-3 py-2">{t('status.scheduled')}</Badge>;
      case 'completed':
        return <Badge bg="success" className="px-3 py-2">{t('status.completed')}</Badge>;
      default:
        return <Badge bg="secondary" className="px-3 py-2">{t('status.unknown')}</Badge>;
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="vh-100 d-flex align-items-center justify-content-center bg-dark">
        <div className="text-center text-white">
          <Spinner animation="border" variant="light" className="mb-3" style={{ width: '3rem', height: '3rem' }} />
          <h4>{authLoading ? t('loading.authenticating') : t('loading.joining')}</h4>
          <p className="text-muted">{t('loading.pleaseWait')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="vh-100 d-flex align-items-center justify-content-center bg-dark">
        <Alert variant="warning" className="text-center p-4 border-0 shadow-lg" style={{ maxWidth: '500px' }}>
          <h5>{t('auth.required')}</h5>
          <p>{t('auth.loginPrompt')}</p>
          <Button variant="primary" onClick={() => router.push('/login')}>
            {t('auth.goToLogin')}
          </Button>
        </Alert>
      </div>
    );
  }

  if (error && !isJoined) {
    return (
      <div className="vh-100 d-flex align-items-center justify-content-center bg-dark">
        <Alert variant="danger" className="text-center p-4 border-0 shadow-lg" style={{ maxWidth: '500px' }}>
          <h5>{t('error.title')}</h5>
          <p>{error}</p>
          <div className="mt-3">
            <Button variant="primary" onClick={retryJoinSession} className="me-2">
              {t('error.tryAgain')}
            </Button>
            <Button variant="outline-light" onClick={handleLeaveSession}>
              {t('error.backToLearning')}
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
              <Button
                variant="light"
                size="sm"
                onClick={handleLeaveSession}
                className="d-flex align-items-center gap-2 px-3"
              >
                <FaSignOutAlt />
                <span className="d-none d-md-inline">{t('header.leave')}</span>
              </Button>
              <div className="text-white">
                <h5 className="mb-0 fw-bold">{sessionData?.sessionTitle}</h5>
                <small className="opacity-75">{sessionData?.courseTitle}</small>
              </div>
            </div>
            <div className="d-flex align-items-center gap-3">
              {getSessionStatusBadge()}
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
                  {isJoined ? (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-100 h-100 position-absolute top-0 start-0"
                        style={{
                          objectFit: 'cover',
                          display: remoteStream ? 'block' : 'none'
                        }}
                      />

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
                              {isConnecting ? t('video.connecting') : t('video.watching')}
                            </h3>
                            <p className="text-white-50 mb-0">
                              {isConnecting
                                ? t('video.establishingConnection')
                                : t('video.waitingForStream')}
                            </p>
                            <Badge bg="danger" className="mt-3 px-3 py-2">
                              <FaCircle size={8} className="animate-pulse me-2" />
                              {t('status.live')}
                            </Badge>
                          </div>
                        </div>
                      )}

                      {remoteStream && (
                        <div className="position-absolute top-0 start-0 m-3">
                          <Badge bg="danger" className="px-3 py-2 d-flex align-items-center gap-2 shadow">
                            <FaCircle size={8} className="animate-pulse" />
                            <span className="fw-bold">{t('status.live')}</span>
                          </Badge>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white">
                      <div className="text-center">
                        <Spinner animation="border" variant="light" style={{ width: '60px', height: '60px' }} className="mb-3" />
                        <h3 className="mb-2">{t('video.joiningSession')}</h3>
                        <p className="text-white-50 mb-0">{t('loading.pleaseWait')}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-3">
                  <Card className="border-0 shadow-sm" style={{ background: 'rgba(255,255,255,0.95)' }}>
                    <Card.Body className="p-3">
                      <Row className="align-items-center">
                        <Col>
                          <div className="d-flex align-items-center gap-2">
                            <Badge bg="success" className="px-2 py-1">
                              <FaCircle size={6} className="me-1" />
                              {t('studentBar.live')}
                            </Badge>
                            {remoteStream && (
                              <Badge bg="primary" className="px-2 py-1">
                                {t('studentBar.connected')}
                              </Badge>
                            )}
                          </div>
                        </Col>
                        <Col xs="auto">
                          <div className="text-muted small">
                            {t('studentBar.attendingAs')} <strong>{user?.fullName}</strong>
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </div>
              </div>
            </Col>

            <Col lg={4} xxl={3} className="h-100">
              <div className="h-100 d-flex flex-column gap-3">
                <Card className="border-0 shadow-sm">
                  <Card.Body className="p-3">
                    <div className="d-flex align-items-center mb-3">
                      <FaClock className="text-primary me-2" />
                      <h6 className="mb-0 fw-bold">{t('sessionInfo.title')}</h6>
                    </div>
                    <div className="small">
                      <div className="d-flex justify-content-between mb-2 pb-2 border-bottom">
                        <span className="text-muted">{t('sessionInfo.course')}</span>
                        <span className="fw-semibold text-end">{sessionData?.courseTitle}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2 pb-2 border-bottom">
                        <span className="text-muted">{t('sessionInfo.session')}</span>
                        <span className="fw-semibold">{sessionData?.sessionTitle}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2 pb-2 border-bottom">
                        <span className="text-muted">{t('sessionInfo.status')}</span>
                        {getSessionStatusBadge()}
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">{t('sessionInfo.connection')}</span>
                        <Badge bg={remoteStream ? 'success' : 'warning'} className="px-2">
                          {remoteStream ? t('studentBar.connected') : isConnecting ? t('video.connecting') : t('sessionInfo.waiting')}
                        </Badge>
                      </div>
                    </div>
                  </Card.Body>
                </Card>

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
                        showMemberCount={false}
                      />
                    </div>
                  ) : (
                    <Card className="h-100 border-0 shadow-sm">
                      <Card.Body className="d-flex align-items-center justify-content-center">
                        <div className="text-center text-muted">
                          {!sessionData?.matrixRoomId ? (
                            <>
                              <h6>{t('chat.notAvailable')}</h6>
                              <p className="mb-0 small">{t('chat.roomNotAccessible')}</p>
                            </>
                          ) : (
                            <>
                              <Spinner className="mb-3" />
                              <p className="mb-0">{t('chat.connecting')}</p>
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