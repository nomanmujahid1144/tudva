'use client';

import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FaEdit, FaGraduationCap, FaCalendarAlt, FaUser, FaBook, FaCertificate, FaMapMarkerAlt } from 'react-icons/fa';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

const StudentProfilePage = () => {
  return (
    <ProtectedRoute allowedRoles={['learner']}>
      <StudentProfileContent />
    </ProtectedRoute>
  );
};

const StudentProfileContent = () => {
  const { user, loading } = useAuth();
  const { locale } = useParams();
  const t = useTranslations('student.profile');

  if (loading) {
    return <LoadingSpinner />;
  }

  // Format date for better display
  const formatDate = (dateString) => {
    if (!dateString) return t('notSpecified');
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'de' ? 'de-DE' : locale === 'hu' ? 'hu-HU' : 'en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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
        
        {/* Right Column - Detailed Information */}
        <Col lg={8}>
          <Card className="bg-transparent border rounded-3 mb-4">
            <Card.Header className="bg-white py-3 border-0">
              <h5 className="mb-0">{t('aboutMe')}</h5>
            </Card.Header>
            <Card.Body className="p-4">
              <p className="mb-0">{user?.aboutMe || t('aboutMePlaceholder')}</p>
            </Card.Body>
          </Card>
          
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
          
          <Card className="bg-transparent border rounded-3">
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
              
              {/* Achievement Badges - Optional Section */}
              {user?.achievements && user.achievements.length > 0 && (
                <div className="mt-4">
                  <h6 className="mb-3">{t('achievements')}</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {user.achievements.map((achievement, index) => (
                      <Badge 
                        key={index}
                        bg="light" 
                        text="dark"
                        className="py-2 px-3 d-flex align-items-center"
                      >
                        <FaCertificate className="text-warning me-2" />
                        {achievement.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default StudentProfilePage;