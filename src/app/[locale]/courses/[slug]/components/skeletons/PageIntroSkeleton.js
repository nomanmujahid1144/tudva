// src/components/skeletons/PageIntroSkeleton.js
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const PageIntroSkeleton = () => {
  return (
    <section className="bg-light py-5">
      <Container>
        <Row className="g-4 align-items-center">
          {/* Course Image/Icon Skeleton */}
          <Col lg={3} className="position-relative">
            <div 
              className="skeleton-shimmer rounded-4 shadow"
              style={{
                height: '250px',
                backgroundColor: '#e9ecef'
              }}
            />
          </Col>

          {/* Course Details Skeleton */}
          <Col lg={9}>
            {/* Title Skeleton */}
            <div 
              className="skeleton-shimmer rounded mb-3"
              style={{
                width: '70%',
                height: '48px',
                backgroundColor: '#e9ecef'
              }}
            />

            {/* Icon and Description Container */}
            <div className="d-flex align-items-start gap-3 mb-4">
              {/* Live/Recorded Icon Skeleton */}
              <div 
                className="skeleton-shimmer rounded"
                style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#e9ecef'
                }}
              />
              
              {/* Description Skeleton */}
              <div className="flex-grow-1">
                <div 
                  className="skeleton-shimmer rounded mb-2"
                  style={{
                    width: '100%',
                    height: '20px',
                    backgroundColor: '#e9ecef'
                  }}
                />
                <div 
                  className="skeleton-shimmer rounded mb-2"
                  style={{
                    width: '90%',
                    height: '20px',
                    backgroundColor: '#e9ecef'
                  }}
                />
                <div 
                  className="skeleton-shimmer rounded"
                  style={{
                    width: '60%',
                    height: '20px',
                    backgroundColor: '#e9ecef'
                  }}
                />
              </div>
            </div>

            {/* Stats Section Skeleton */}
            <div className="d-flex justify-content-between align-items-center">
              {/* Category Badge Skeleton */}
              <div 
                className="skeleton-shimmer rounded-pill"
                style={{
                  width: '120px',
                  height: '36px',
                  backgroundColor: '#e9ecef'
                }}
              />

              {/* Stats Cards Skeleton */}
              <div className="d-flex flex-wrap gap-3">
                {[...Array(3)].map((_, idx) => (
                  <div 
                    key={idx}
                    className="skeleton-shimmer rounded-3 shadow-sm"
                    style={{
                      width: '120px',
                      height: '44px',
                      backgroundColor: '#e9ecef'
                    }}
                  />
                ))}
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      <style jsx>{`
        .skeleton-shimmer {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </section>
  );
};

export default PageIntroSkeleton;