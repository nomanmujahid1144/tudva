'use client';

import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

const StudentProfilePage = () => {
  return (
    <ProtectedRoute allowedRoles={['learner']}>
      <StudentProfileContent />
    </ProtectedRoute>
  );
};

const StudentProfileContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container className="py-5">
      <Row>
        <Col lg={8} className="mx-auto">
          <Card className="shadow">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">Student Profile</h4>
            </Card.Header>
            <Card.Body>
              <div className="text-center mb-4">
                {user?.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt={user.fullName || user.name} 
                    className="rounded-circle img-thumbnail" 
                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                  />
                ) : (
                  <div 
                    className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto" 
                    style={{ width: '150px', height: '150px', fontSize: '3rem' }}
                  >
                    {(user?.fullName || user?.name || 'User').charAt(0).toUpperCase()}
                  </div>
                )}
                <h3 className="mt-3">{user?.fullName || user?.name || 'Student'}</h3>
                <p className="text-muted">{user?.email}</p>
              </div>

              <Row className="mb-4">
                <Col md={6}>
                  <h5>Role</h5>
                  <p>{user?.role || 'learner'}</p>
                </Col>
                <Col md={6}>
                  <h5>Member Since</h5>
                  <p>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                </Col>
              </Row>

              <Row>
                <Col md={12}>
                  <h5>About Me</h5>
                  <p>{user?.aboutMe || 'No information provided.'}</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default StudentProfilePage;
