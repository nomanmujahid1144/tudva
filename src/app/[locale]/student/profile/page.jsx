'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useAuth } from '@/context/AuthContext';
import authService from '@/services/authService';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FaGraduationCap, FaCalendarAlt, FaCertificate, FaChalkboardTeacher } from 'react-icons/fa';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

const StudentProfilePage = () => {
  return (
    <ProtectedRoute allowedRoles={['learner']}>
      <StudentProfileContent />
    </ProtectedRoute>
  );
};

// ─── Skeleton for canTeach toggle ─────────────────────────────
const ToggleSkeleton = () => (
  <div className="d-flex align-items-start gap-3 p-3 border rounded-3 bg-light">
    <div
      className="rounded mt-1 flex-shrink-0"
      style={{
        width: '22px', height: '22px',
        background: 'linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }}
    />
    <div className="flex-grow-1">
      <div className="d-flex align-items-center gap-3 mb-2">
        <div className="rounded" style={{ width: '44px', height: '22px', background: 'linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
        <div className="rounded" style={{ width: '200px', height: '16px', background: 'linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      </div>
      <div className="rounded" style={{ width: '100%', height: '12px', background: 'linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
    </div>
    <style>{`
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  </div>
);

const StudentProfileContent = () => {
  const { user, loading, refreshUser } = useAuth();
  const { locale } = useParams();
  const t = useTranslations('student.profile');
  const tSettings = useTranslations('student.settings');

  const [canTeach, setCanTeach] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setCanTeach(user.canTeach || false);
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await authService.updateProfile({ canTeach });
      if (response.success) {
        toast.success(tSettings('saveSuccess'), { duration: 8000 });
        await refreshUser();
      } else {
        toast.error(response.error || tSettings('saveError'), { duration: 8000 });
      }
    } catch (error) {
      console.error('Settings save error:', error);
      toast.error(tSettings('saveError'), { duration: 8000 });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setCanTeach(user?.canTeach || false);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const formatDate = (dateString) => {
    if (!dateString) return t('notSpecified');
    const date = new Date(dateString);
    return date.toLocaleDateString(
      locale === 'de' ? 'de-DE' : locale === 'hu' ? 'hu-HU' : 'en-US',
      { year: 'numeric', month: 'long', day: 'numeric' }
    );
  };

  return (
    <Container className="">
      <Row className="g-4">
        {/* Left Column - Profile Summary */}
        <Col lg={4}>
          <Card className="bg-transparent border rounded-3 h-100">
            <Card.Body className="text-center p-4">
              <div className="position-relative mb-4 mx-auto">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.fullName || user.name}
                    className="rounded-circle img-fluid"
                    style={{ width: '180px', height: '180px', objectFit: 'cover', border: '4px solid #f8f9fa' }}
                  />
                ) : (
                  <div
                    className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto"
                    style={{ width: '180px', height: '180px', fontSize: '4rem', border: '4px solid #f8f9fa' }}
                  >
                    {(user?.fullName || user?.name || 'User').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <h3 className="mb-1">{user?.fullName || user?.name || 'Student'}</h3>
              <p className="text-muted mb-3">{user?.email}</p>

              <Badge className="mb-3 px-3 py-2">
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'Learner'}
              </Badge>

              <div className="d-grid gap-2 mt-4">
                <Link href={`/${locale}/student/my-courses`} className="btn btn-outline-primary">
                  {t('myCourses')}
                </Link>
                <Link href={`/${locale}/student/edit-profile`} className="btn btn-outline-secondary">
                  {t('editProfile')}
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column */}
        <Col lg={8}>
          {/* About Me */}
          <Card className="bg-transparent border rounded-3 mb-4">
            <Card.Header className="bg-white py-3 border-0">
              <h5 className="mb-0">{t('aboutMe')}</h5>
            </Card.Header>
            <Card.Body className="p-4">
              <p className="mb-0">{user?.aboutMe || t('aboutMePlaceholder')}</p>
            </Card.Body>
          </Card>

          {/* Education & Interests */}
          <Card className="bg-transparent border rounded-3 mb-4">
            <Card.Header className="bg-white py-3 border-0">
              <h5 className="mb-0">{t('educationInterests')}</h5>
            </Card.Header>
            <Card.Body className="p-4">
              <Row className="g-4">
                <Col md={6}>
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-light rounded-circle p-2 me-3">
                      <FaGraduationCap className="text-primary" size={18} />
                    </div>
                    <div>
                      <h6 className="mb-1">{t('education')}</h6>
                      {user?.education && user.education.length > 0 ? (
                        user.education.map((edu, index) => (
                          <p key={index} className="text-muted mb-0">
                            {edu.degree} - {edu.institution}
                          </p>
                        ))
                      ) : (
                        <p className="text-muted mb-0">{t('notSpecified')}</p>
                      )}
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="d-flex align-items-center">
                    <div className="bg-light rounded-circle p-2 me-3">
                      <FaCalendarAlt className="text-primary" size={18} />
                    </div>
                    <div>
                      <h6 className="mb-1">{t('memberSince')}</h6>
                      <p className="text-muted mb-0">{formatDate(user?.createdAt)}</p>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Learning Stats */}
          <Card className="bg-transparent border rounded-3 mb-4">
            <Card.Header className="bg-white py-3 border-0">
              <h5 className="mb-0">{t('learningStats')}</h5>
            </Card.Header>
            <Card.Body className="p-4">
              <Row className="text-center g-3">
                <Col md={4}>
                  <div className="border rounded p-3">
                    <h2 className="mb-1 text-primary">{user?.enrolledCourses?.length || 0}</h2>
                    <p className="text-muted mb-0">{t('enrolledCourses')}</p>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="border rounded p-3">
                    <h2 className="mb-1 text-primary">{user?.completedCourses?.length || 0}</h2>
                    <p className="text-muted mb-0">{t('completedCourses')}</p>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="border rounded p-3">
                    <h2 className="mb-1 text-primary">{user?.certificatesEarned?.length || 0}</h2>
                    <p className="text-muted mb-0">{t('certificatesEarned')}</p>
                  </div>
                </Col>
              </Row>

              {user?.achievements && user.achievements.length > 0 && (
                <div className="mt-4">
                  <h6 className="mb-3">{t('achievements')}</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {user.achievements.map((achievement, index) => (
                      <Badge key={index} bg="light" text="dark" className="py-2 px-3 d-flex align-items-center">
                        <FaCertificate className="text-warning me-2" />
                        {achievement.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* ─── Teaching Settings ─────────────────────────────── */}
          <Card className="bg-transparent border rounded-3">
            <Card.Header className="bg-white py-3 border-0">
              <h5 className="mb-0">{tSettings('teachingTitle')}</h5>
            </Card.Header>
            <Card.Body className="p-4">
              {loading || !user ? (
                <ToggleSkeleton />
              ) : (
                <div className="d-flex align-items-start gap-3 p-3 border rounded-3 bg-light">
                  <FaChalkboardTeacher size={22} className="text-success mt-1 flex-shrink-0" />
                  <div className="flex-grow-1">
                    <div className="form-check form-switch form-check-md mb-1">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="canTeachProfile"
                        checked={canTeach}
                        onChange={(e) => setCanTeach(e.target.checked)}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="canTeachProfile">
                        {tSettings('canTeachLabel')}
                      </label>
                    </div>
                    <p className="text-muted small mb-0">
                      {tSettings('canTeachDesc')}
                    </p>
                  </div>
                </div>
              )}

              <div className="d-sm-flex justify-content-end gap-2 mt-3">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="mb-0"
                  onClick={handleCancel}
                  disabled={saving || loading}
                >
                  {tSettings('cancel')}
                </Button>
                <button
                  type="button"
                  className="btn btn-sm btn-success mb-0"
                  onClick={handleSave}
                  disabled={saving || loading}
                >
                  {saving ? tSettings('saving') : tSettings('saveChanges')}
                </button>
              </div>
            </Card.Body>
          </Card>

        </Col>
      </Row>
    </Container>
  );
};

export default StudentProfilePage;