'use client';

import { Card, CardBody, Col, Row } from "react-bootstrap";

const CourseCardSkeleton = ({ variant = 'horizontal' }) => {
  // Horizontal card skeleton (default)
  if (variant === 'horizontal') {
    return (
      <Card className="rounded overflow-hidden shadow h-100 course-card-skeleton">
        <Row className="g-0 h-100">
          <Col md={4} className="position-relative">
            {/* Course image/icon area */}
            <div className="skeleton-box" style={{ height: '100%', minHeight: '200px' }}></div>
            
            {/* Category badge skeleton */}
            <div className="position-absolute top-0 start-0 m-2">
              <div className="skeleton-box" style={{ height: '24px', width: '80px', borderRadius: '4px' }}></div>
            </div>
            
            {/* Level badge skeleton */}
            <div className="position-absolute bottom-0 start-0 m-2">
              <div className="skeleton-box" style={{ height: '24px', width: '70px', borderRadius: '4px' }}></div>
            </div>
          </Col>
          
          <Col md={8}>
            <CardBody className="d-flex flex-column h-100">
              {/* Title and favorite button */}
              <div className="d-flex justify-content-between mb-3">
                <div className="skeleton-box" style={{ height: '24px', width: '80%', borderRadius: '4px' }}></div>
                <div className="skeleton-box" style={{ height: '24px', width: '24px', borderRadius: '50%' }}></div>
              </div>
              
              {/* Short description */}
              <div className="mb-3">
                <div className="skeleton-box mb-1" style={{ height: '16px', width: '100%', borderRadius: '4px' }}></div>
                <div className="skeleton-box" style={{ height: '16px', width: '80%', borderRadius: '4px' }}></div>
              </div>
              
              {/* Course details */}
              <div className="d-flex flex-wrap gap-3 mb-auto">
                {/* Duration */}
                <div className="d-flex align-items-center">
                  <div className="skeleton-box me-2" style={{ height: '16px', width: '16px', borderRadius: '50%' }}></div>
                  <div className="skeleton-box" style={{ height: '16px', width: '80px', borderRadius: '4px' }}></div>
                </div>
                
                {/* Lectures */}
                <div className="d-flex align-items-center">
                  <div className="skeleton-box me-2" style={{ height: '16px', width: '16px', borderRadius: '50%' }}></div>
                  <div className="skeleton-box" style={{ height: '16px', width: '90px', borderRadius: '4px' }}></div>
                </div>
                
                {/* Level */}
                <div className="d-flex align-items-center">
                  <div className="skeleton-box me-2" style={{ height: '16px', width: '16px', borderRadius: '50%' }}></div>
                  <div className="skeleton-box" style={{ height: '16px', width: '70px', borderRadius: '4px' }}></div>
                </div>
                
                {/* Instructor */}
                <div className="d-flex align-items-center w-100 mt-1">
                  <div className="skeleton-box me-2" style={{ height: '16px', width: '16px', borderRadius: '50%' }}></div>
                  <div className="skeleton-box" style={{ height: '16px', width: '120px', borderRadius: '4px' }}></div>
                </div>
              </div>
              
              {/* Rating section with Live/Recorded badge */}
              <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                {/* Stars */}
                <div className="d-flex align-items-center">
                  <div className="d-flex">
                    {[1, 2, 3, 4, 5].map((_, index) => (
                      <div key={index} className="skeleton-box me-1" style={{ height: '16px', width: '16px', borderRadius: '2px' }}></div>
                    ))}
                  </div>
                  <div className="skeleton-box ms-2" style={{ height: '16px', width: '45px', borderRadius: '4px' }}></div>
                </div>
                
                {/* Live/Recorded badge */}
                <div className="skeleton-box" style={{ height: '28px', width: '90px', borderRadius: '4px' }}></div>
              </div>
            </CardBody>
          </Col>
        </Row>

        <style jsx>{`
          .course-card-skeleton {
            transition: transform 0.3s ease;
          }

          .skeleton-box {
            position: relative;
            overflow: hidden;
            background-color: #e9ecef;
            border-radius: 4px;
          }

          .skeleton-box::after {
            content: "";
            display: block;
            position: absolute;
            top: 0;
            width: 100%;
            height: 100%;
            transform: translateX(-100%);
            background: linear-gradient(90deg, 
              rgba(255, 255, 255, 0),
              rgba(255, 255, 255, 0.2),
              rgba(255, 255, 255, 0)
            );
            animation: shimmer 1.5s infinite;
          }

          @keyframes shimmer {
            100% {
              transform: translateX(100%);
            }
          }
        `}</style>
      </Card>
    );
  }

  // Vertical card skeleton
  return (
    <Card className="rounded overflow-hidden shadow h-100 course-card-skeleton">
      <div className="position-relative">
        <div className="skeleton-box" style={{ height: '200px' }}></div>
        
        {/* Category badge skeleton */}
        <div className="position-absolute top-0 start-0 m-2">
          <div className="skeleton-box" style={{ height: '24px', width: '80px', borderRadius: '4px' }}></div>
        </div>
        
        {/* Level badge skeleton */}
        <div className="position-absolute bottom-0 start-0 m-2">
          <div className="skeleton-box" style={{ height: '24px', width: '70px', borderRadius: '4px' }}></div>
        </div>
      </div>
      
      <CardBody className="d-flex flex-column">
        {/* Title and favorite button */}
        <div className="d-flex justify-content-between mb-3">
          <div className="skeleton-box" style={{ height: '24px', width: '80%', borderRadius: '4px' }}></div>
          <div className="skeleton-box" style={{ height: '24px', width: '24px', borderRadius: '50%' }}></div>
        </div>
        
        {/* Short description */}
        <div className="mb-3">
          <div className="skeleton-box mb-1" style={{ height: '16px', width: '100%', borderRadius: '4px' }}></div>
          <div className="skeleton-box" style={{ height: '16px', width: '80%', borderRadius: '4px' }}></div>
        </div>
        
        {/* Course details */}
        <div className="mb-3">
          {/* Duration */}
          <div className="d-flex align-items-center mb-2">
            <div className="skeleton-box me-2" style={{ height: '16px', width: '16px', borderRadius: '50%' }}></div>
            <div className="skeleton-box" style={{ height: '16px', width: '80px', borderRadius: '4px' }}></div>
          </div>
          
          {/* Lectures */}
          <div className="d-flex align-items-center mb-2">
            <div className="skeleton-box me-2" style={{ height: '16px', width: '16px', borderRadius: '50%' }}></div>
            <div className="skeleton-box" style={{ height: '16px', width: '90px', borderRadius: '4px' }}></div>
          </div>
          
          {/* Level */}
          <div className="d-flex align-items-center mb-2">
            <div className="skeleton-box me-2" style={{ height: '16px', width: '16px', borderRadius: '50%' }}></div>
            <div className="skeleton-box" style={{ height: '16px', width: '70px', borderRadius: '4px' }}></div>
          </div>
          
          {/* Instructor */}
          <div className="d-flex align-items-center mb-2">
            <div className="skeleton-box me-2" style={{ height: '16px', width: '16px', borderRadius: '50%' }}></div>
            <div className="skeleton-box" style={{ height: '16px', width: '120px', borderRadius: '4px' }}></div>
          </div>
        </div>
        
        {/* Rating section with Live/Recorded badge */}
        <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top">
          {/* Stars */}
          <div className="d-flex align-items-center">
            <div className="d-flex">
              {[1, 2, 3, 4, 5].map((_, index) => (
                <div key={index} className="skeleton-box me-1" style={{ height: '16px', width: '16px', borderRadius: '2px' }}></div>
              ))}
            </div>
            <div className="skeleton-box ms-2" style={{ height: '16px', width: '45px', borderRadius: '4px' }}></div>
          </div>
          
          {/* Live/Recorded badge */}
          <div className="skeleton-box" style={{ height: '28px', width: '90px', borderRadius: '4px' }}></div>
        </div>
      </CardBody>

      <style jsx>{`
        .course-card-skeleton {
          transition: transform 0.3s ease;
        }

        .skeleton-box {
          position: relative;
          overflow: hidden;
          background-color: #e9ecef;
          border-radius: 4px;
        }

        .skeleton-box::after {
          content: "";
          display: block;
          position: absolute;
          top: 0;
          width: 100%;
          height: 100%;
          transform: translateX(-100%);
          background: linear-gradient(90deg, 
            rgba(255, 255, 255, 0),
            rgba(255, 255, 255, 0.2),
            rgba(255, 255, 255, 0)
          );
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </Card>
  );
};

export default CourseCardSkeleton;