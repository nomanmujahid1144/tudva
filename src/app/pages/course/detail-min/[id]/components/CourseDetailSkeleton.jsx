'use client';

import { Col, Container, Row, Card } from "react-bootstrap";

const CourseDetailSkeleton = () => {
  return (
    <div className="course-detail-skeleton">
      {/* Banner Video Skeleton */}
      <section className="py-0 pb-lg-5">
        <Container>
          <Row className="g-3">
            <Col xs={12}>
              <div className="video-player rounded-3">
                <div className="skeleton-box" style={{ height: '500px', width: '100%', borderRadius: '0.5rem' }}></div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Course Details Skeleton */}
      <section className="pt-0">
        <Container>
          <Row className="g-lg-5">
            <Col lg={8}>
              <Row className="g-4">
                <Col xs={12}>
                  {/* Title Skeleton */}
                  <div className="skeleton-box" style={{ height: '40px', width: '80%', borderRadius: '0.25rem', marginBottom: '1rem' }}></div>

                  {/* Rating Skeleton */}
                  <div className="d-flex gap-3 mb-4">
                    <div className="skeleton-box" style={{ height: '20px', width: '100px', borderRadius: '0.25rem' }}></div>
                    <div className="skeleton-box" style={{ height: '20px', width: '120px', borderRadius: '0.25rem' }}></div>
                    <div className="skeleton-box" style={{ height: '20px', width: '80px', borderRadius: '0.25rem' }}></div>
                  </div>
                </Col>

                <Col xs={12}>
                  {/* Instructor Skeleton */}
                  <div className="d-flex align-items-center mb-4">
                    <div className="skeleton-box rounded-circle" style={{ height: '80px', width: '80px', marginRight: '1rem' }}></div>
                    <div>
                      <div className="skeleton-box" style={{ height: '20px', width: '150px', borderRadius: '0.25rem', marginBottom: '0.5rem' }}></div>
                      <div className="skeleton-box" style={{ height: '16px', width: '100px', borderRadius: '0.25rem' }}></div>
                    </div>
                  </div>
                </Col>

                {/* Tabs Skeleton */}
                <Col xs={12}>
                  <div className="d-flex gap-3 mb-4">
                    <div className="skeleton-box" style={{ height: '40px', width: '100px', borderRadius: '0.25rem' }}></div>
                    <div className="skeleton-box" style={{ height: '40px', width: '100px', borderRadius: '0.25rem' }}></div>
                    <div className="skeleton-box" style={{ height: '40px', width: '100px', borderRadius: '0.25rem' }}></div>
                  </div>

                  {/* Module Skeletons */}
                  {[1, 2, 3].map((_, index) => (
                    <Card key={index} className="mb-4 shadow-sm border-0">
                      <Card.Header className="border-bottom-0 bg-transparent">
                        <div className="skeleton-box" style={{ height: '24px', width: '70%', borderRadius: '0.25rem' }}></div>
                      </Card.Header>
                      <Card.Body>
                        {[1, 2, 3].map((_, lectureIndex) => (
                          <div key={lectureIndex} className="d-flex align-items-center mb-3">
                            <div className="skeleton-box rounded-circle me-3" style={{ height: '40px', width: '40px' }}></div>
                            <div className="flex-grow-1">
                              <div className="skeleton-box mb-2" style={{ height: '20px', width: '80%', borderRadius: '0.25rem' }}></div>
                              <div className="skeleton-box" style={{ height: '16px', width: '40%', borderRadius: '0.25rem' }}></div>
                            </div>
                            <div className="skeleton-box ms-2" style={{ height: '24px', width: '60px', borderRadius: '0.25rem' }}></div>
                          </div>
                        ))}
                      </Card.Body>
                    </Card>
                  ))}
                </Col>
              </Row>
            </Col>

            {/* Sidebar Skeleton */}
            <Col lg={4}>
              <Card className="shadow-sm border-0 mb-4">
                <Card.Body>
                  <div className="skeleton-box mb-3" style={{ height: '30px', width: '60%', borderRadius: '0.25rem' }}></div>
                  <div className="skeleton-box mb-4" style={{ height: '24px', width: '40%', borderRadius: '0.25rem' }}></div>

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="skeleton-box" style={{ height: '24px', width: '40%', borderRadius: '0.25rem' }}></div>
                    <div className="skeleton-box" style={{ height: '24px', width: '30%', borderRadius: '0.25rem' }}></div>
                  </div>

                  <div className="skeleton-box mb-4" style={{ height: '50px', width: '100%', borderRadius: '0.25rem' }}></div>

                  <div className="d-flex align-items-center mb-3">
                    <div className="skeleton-box rounded-circle me-2" style={{ height: '24px', width: '24px' }}></div>
                    <div className="skeleton-box" style={{ height: '20px', width: '90%', borderRadius: '0.25rem' }}></div>
                  </div>

                  <div className="d-flex align-items-center mb-3">
                    <div className="skeleton-box rounded-circle me-2" style={{ height: '24px', width: '24px' }}></div>
                    <div className="skeleton-box" style={{ height: '20px', width: '80%', borderRadius: '0.25rem' }}></div>
                  </div>

                  <div className="d-flex align-items-center mb-4">
                    <div className="skeleton-box rounded-circle me-2" style={{ height: '24px', width: '24px' }}></div>
                    <div className="skeleton-box" style={{ height: '20px', width: '85%', borderRadius: '0.25rem' }}></div>
                  </div>

                  <div className="skeleton-box" style={{ height: '50px', width: '100%', borderRadius: '0.25rem' }}></div>
                </Card.Body>
              </Card>

              <Card className="shadow-sm border-0">
                <Card.Header className="border-bottom-0 bg-transparent">
                  <div className="skeleton-box" style={{ height: '24px', width: '70%', borderRadius: '0.25rem' }}></div>
                </Card.Header>
                <Card.Body>
                  {[1, 2, 3].map((_, index) => (
                    <div key={index} className="mb-3">
                      <div className="skeleton-box mb-2" style={{ height: '20px', width: '90%', borderRadius: '0.25rem' }}></div>
                      <div className="skeleton-box" style={{ height: '16px', width: '70%', borderRadius: '0.25rem' }}></div>
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

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
    </div>
  );
};

export default CourseDetailSkeleton;
