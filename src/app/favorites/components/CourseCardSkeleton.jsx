// src/components/skeletons/CourseCardSkeleton.js
import React from 'react';
import { Card, CardBody, Col, Row } from 'react-bootstrap';

const CourseCardSkeleton = () => {
  return (
    <Card className="rounded overflow-hidden shadow h-100 course-card-skeleton">
      <Row className="g-0 h-100">
        {/* Icon/Image Column Skeleton */}
        <Col md={4} className="position-relative">
          <div 
            className="skeleton-shimmer"
            style={{
              backgroundColor: '#f8f9fa',
              minHeight: '200px',
              width: '100%'
            }}
          />
          
          {/* Category Badge Skeleton */}
          <div className="position-absolute top-0 start-0 m-2">
            <div 
              className="skeleton-shimmer rounded-pill"
              style={{
                width: '80px',
                height: '20px',
                backgroundColor: '#e9ecef'
              }}
            />
          </div>

          {/* Level Badge Skeleton */}
          <div className="position-absolute bottom-0 start-0 m-2">
            <div 
              className="skeleton-shimmer rounded"
              style={{
                width: '70px',
                height: '18px',
                backgroundColor: '#e9ecef'
              }}
            />
          </div>
        </Col>

        {/* Course Details Column Skeleton */}
        <Col md={8}>
          <CardBody className="d-flex flex-column h-100">
            {/* Title and Heart Skeleton */}
            <div className="d-flex justify-content-between mb-2">
              <div className="flex-grow-1 me-3">
                <div 
                  className="skeleton-shimmer rounded mb-1"
                  style={{
                    width: '90%',
                    height: '24px',
                    backgroundColor: '#e9ecef'
                  }}
                />
                <div 
                  className="skeleton-shimmer rounded"
                  style={{
                    width: '70%',
                    height: '20px',
                    backgroundColor: '#e9ecef'
                  }}
                />
              </div>
              <div 
                className="skeleton-shimmer rounded-circle"
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#e9ecef'
                }}
              />
            </div>

            {/* Description Skeleton */}
            <div className="mb-2">
              <div 
                className="skeleton-shimmer rounded mb-1"
                style={{
                  width: '100%',
                  height: '16px',
                  backgroundColor: '#e9ecef'
                }}
              />
              <div 
                className="skeleton-shimmer rounded"
                style={{
                  width: '80%',
                  height: '16px',
                  backgroundColor: '#e9ecef'
                }}
              />
            </div>

            {/* Instructor Skeleton */}
            <div className="mb-3">
              <div className="d-flex align-items-center">
                <div 
                  className="skeleton-shimmer rounded-circle me-2"
                  style={{
                    width: '16px',
                    height: '16px',
                    backgroundColor: '#e9ecef'
                  }}
                />
                <div 
                  className="skeleton-shimmer rounded"
                  style={{
                    width: '120px',
                    height: '16px',
                    backgroundColor: '#e9ecef'
                  }}
                />
              </div>
            </div>

            {/* Rating and Type Skeleton */}
            <div className="d-flex justify-content-between align-items-center mt-auto">
              <div className="d-flex align-items-center">
                {/* Stars skeleton */}
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i}
                    className="skeleton-shimmer rounded me-1"
                    style={{
                      width: '14px',
                      height: '14px',
                      backgroundColor: '#e9ecef'
                    }}
                  />
                ))}
                <div 
                  className="skeleton-shimmer rounded ms-1"
                  style={{
                    width: '40px',
                    height: '14px',
                    backgroundColor: '#e9ecef'
                  }}
                />
              </div>

              {/* Course type icon skeleton */}
              <div 
                className="skeleton-shimmer rounded"
                style={{
                  width: '46px',
                  height: '46px',
                  backgroundColor: '#e9ecef'
                }}
              />
            </div>
          </CardBody>
        </Col>
      </Row>

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

        .course-card-skeleton {
          border: 1px solid #e9ecef;
        }
      `}</style>
    </Card>
  );
};

export default CourseCardSkeleton;