// src/components/skeletons/CourseDetailsSkeleton.js
import React from 'react';
import { Container, Row, Col, Card, CardBody, CardHeader } from 'react-bootstrap';

const CourseDetailsSkeleton = () => {
  return (
    <section className="pb-0 py-lg-5">
      <Container>
        <Row>
          {/* Main Course Content Skeleton */}
          <Col lg={8}>
            <Card className="shadow rounded-2 p-0">
              {/* Tab Header Skeleton */}
              <CardHeader className="border-bottom px-4 py-3">
                <div className="d-flex gap-4">
                  {[...Array(5)].map((_, idx) => (
                    <div 
                      key={idx}
                      className="skeleton-shimmer rounded"
                      style={{
                        width: '80px',
                        height: '24px',
                        backgroundColor: '#e9ecef'
                      }}
                    />
                  ))}
                </div>
              </CardHeader>

              {/* Tab Content Skeleton */}
              <CardBody className="p-4">
                {/* Content Lines */}
                {[...Array(8)].map((_, idx) => (
                  <div 
                    key={idx}
                    className="skeleton-shimmer rounded mb-3"
                    style={{
                      width: idx % 3 === 0 ? '90%' : idx % 2 === 0 ? '100%' : '75%',
                      height: '16px',
                      backgroundColor: '#e9ecef'
                    }}
                  />
                ))}

                {/* Additional Content Blocks */}
                <div className="mt-4">
                  <div 
                    className="skeleton-shimmer rounded mb-3"
                    style={{
                      width: '200px',
                      height: '32px',
                      backgroundColor: '#e9ecef'
                    }}
                  />
                  {[...Array(4)].map((_, idx) => (
                    <div 
                      key={idx}
                      className="skeleton-shimmer rounded mb-2"
                      style={{
                        width: '100%',
                        height: '20px',
                        backgroundColor: '#e9ecef'
                      }}
                    />
                  ))}
                </div>
              </CardBody>
            </Card>
          </Col>

          {/* Sidebar Skeleton */}
          <Col lg={4} className="pt-5 pt-lg-0">
            <Row className="mb-5 mb-lg-0">
              <Col md={6} lg={12}>
                {/* Pricing Card Skeleton */}
                <Card className="shadow p-2 mb-4">
                  {/* Image Area */}
                  <div 
                    className="skeleton-shimmer rounded-3"
                    style={{
                      height: '250px',
                      backgroundColor: '#e9ecef'
                    }}
                  />
                  
                  {/* Card Body */}
                  <CardBody className="px-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div 
                        className="skeleton-shimmer rounded"
                        style={{
                          width: '60px',
                          height: '40px',
                          backgroundColor: '#e9ecef'
                        }}
                      />
                      <div 
                        className="skeleton-shimmer rounded"
                        style={{
                          width: '100px',
                          height: '40px',
                          backgroundColor: '#e9ecef'
                        }}
                      />
                    </div>
                  </CardBody>
                </Card>

                {/* Course Overview Card Skeleton */}
                <Card className="shadow p-4 mb-4">
                  <div 
                    className="skeleton-shimmer rounded mb-3"
                    style={{
                      width: '150px',
                      height: '24px',
                      backgroundColor: '#e9ecef'
                    }}
                  />
                  
                  {/* List Items */}
                  {[...Array(4)].map((_, idx) => (
                    <div key={idx} className="d-flex justify-content-between align-items-center mb-3">
                      <div 
                        className="skeleton-shimmer rounded"
                        style={{
                          width: '120px',
                          height: '20px',
                          backgroundColor: '#e9ecef'
                        }}
                      />
                      <div 
                        className="skeleton-shimmer rounded"
                        style={{
                          width: '60px',
                          height: '20px',
                          backgroundColor: '#e9ecef'
                        }}
                      />
                    </div>
                  ))}
                </Card>
              </Col>
              
              <Col md={6} lg={12}>
                {/* Tags Card Skeleton */}
                <Card className="shadow p-4">
                  <div 
                    className="skeleton-shimmer rounded mb-3"
                    style={{
                      width: '80px',
                      height: '24px',
                      backgroundColor: '#e9ecef'
                    }}
                  />
                  
                  {/* Tag Items */}
                  <div className="d-flex flex-wrap gap-2">
                    {[...Array(6)].map((_, idx) => (
                      <div 
                        key={idx}
                        className="skeleton-shimmer rounded"
                        style={{
                          width: `${60 + (idx * 10)}px`,
                          height: '32px',
                          backgroundColor: '#e9ecef'
                        }}
                      />
                    ))}
                  </div>
                </Card>
              </Col>
            </Row>
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

export default CourseDetailsSkeleton;