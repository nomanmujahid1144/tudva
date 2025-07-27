'use client';

import React from 'react';
import { Card, CardBody, CardHeader, Col, Row } from 'react-bootstrap';

const ProfileSkeleton = () => {
  return (
    <Card className="bg-transparent border rounded-3">
      <CardHeader className="bg-transparent border-bottom">
        <div className="skeleton-box" style={{ height: '28px', width: '150px', borderRadius: '0.25rem' }}></div>
      </CardHeader>
      <CardBody>
        <Row className="g-4">
          <Col xs={12} className="justify-content-center align-items-center">
            <div className="skeleton-box mb-2" style={{ height: '20px', width: '120px', borderRadius: '0.25rem' }}></div>
            <div className="d-flex align-items-center">
              <div className="skeleton-box rounded-circle me-4" style={{ height: '100px', width: '100px' }}></div>
              <div className="skeleton-box" style={{ height: '38px', width: '100px', borderRadius: '0.25rem' }}></div>
            </div>
          </Col>

          <Col md={6}>
            <div className="skeleton-box mb-2" style={{ height: '20px', width: '80px', borderRadius: '0.25rem' }}></div>
            <div className="skeleton-box" style={{ height: '40px', width: '100%', borderRadius: '0.25rem' }}></div>
          </Col>
          <Col md={6}>
            <div className="skeleton-box mb-2" style={{ height: '20px', width: '100px', borderRadius: '0.25rem' }}></div>
            <div className="skeleton-box" style={{ height: '40px', width: '100%', borderRadius: '0.25rem' }}></div>
          </Col>
          <Col md={6}>
            <div className="skeleton-box mb-2" style={{ height: '20px', width: '120px', borderRadius: '0.25rem' }}></div>
            <div className="skeleton-box" style={{ height: '40px', width: '100%', borderRadius: '0.25rem' }}></div>
          </Col>
          <Col xs={12}>
            <div className="skeleton-box mb-2" style={{ height: '20px', width: '80px', borderRadius: '0.25rem' }}></div>
            <div className="skeleton-box mb-2" style={{ height: '90px', width: '100%', borderRadius: '0.25rem' }}></div>
            <div className="skeleton-box" style={{ height: '16px', width: '200px', borderRadius: '0.25rem' }}></div>
          </Col>
          <Col xs={12} className="text-end">
            <div className="skeleton-box ms-auto" style={{ height: '38px', width: '120px', borderRadius: '0.25rem' }}></div>
          </Col>
        </Row>
      </CardBody>

      <style jsx>{`
        .skeleton-box {
          position: relative;
          overflow: hidden;
          background-color: #e9ecef;
        }

        .skeleton-box::after {
          content: "";
          display: block;
          position: absolute;
          top: 0;
          width: 100%;
          height: 100%;
          transform: translateX(-100%);
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          animation: loading 1.5s infinite;
        }

        @keyframes loading {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </Card>
  );
};

export default ProfileSkeleton;
