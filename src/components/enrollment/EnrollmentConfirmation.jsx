'use client';

import React from 'react';
import { Card, Row, Col, Badge, Alert, Form } from 'react-bootstrap';
import { FaCalendarAlt, FaClock, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';
import Image from 'next/image';
import { timeSlots } from '@/utils/dummyData/enrollmentData';

const EnrollmentConfirmation = ({ course, selectedSlots }) => {
  // If it's a live course, slots are fixed
  const isLiveCourse = course?.format === 'live';

  // Get the slots for this course
  const courseSlots = course?.slots || [];
  
  // Get the selected time slots
  const displaySlots = isLiveCourse 
    ? courseSlots 
    : timeSlots.filter(slot => selectedSlots.includes(slot.id));

  return (
    <div className="enrollment-confirmation">
      <div className="course-summary mb-4">
        <Row>
          <Col md={4} className="mb-3 mb-md-0">
            {course?.image && (
              <div className="position-relative" style={{ height: '150px' }}>
                <Image 
                  src={course.image} 
                  alt={course.title} 
                  className="rounded"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
            )}
          </Col>
          <Col md={8}>
            <h5>{course?.title}</h5>
            <p className="text-muted mb-2">{course?.description}</p>
            
            <div className="d-flex align-items-center mb-2">
              <Badge 
                bg={isLiveCourse ? "danger" : "success"} 
                className="me-2"
              >
                {isLiveCourse ? "LIVE" : "RECORDED"}
              </Badge>
              
              <div className="d-flex align-items-center ms-3">
                <FaCalendarAlt className="me-2 text-muted" />
                <span>{course?.seminarDay?.name}s</span>
              </div>
            </div>
            
            {course?.instructor && (
              <div className="d-flex align-items-center mt-2">
                {course.instructor.avatar && (
                  <div className="me-2">
                    <Image 
                      src={course.instructor.avatar} 
                      alt={course.instructor.name} 
                      width={24} 
                      height={24} 
                      className="rounded-circle"
                    />
                  </div>
                )}
                <span>Instructor: {course.instructor.name}</span>
              </div>
            )}
          </Col>
        </Row>
      </div>

      <div className="schedule-summary mb-4">
        <h6 className="mb-3">Schedule Summary</h6>
        
        <Card className="mb-3">
          <Card.Body>
            <div className="d-flex align-items-center mb-3">
              <FaCalendarAlt className="me-2 text-primary" />
              <h6 className="mb-0">Day: {course?.seminarDay?.name}s</h6>
            </div>
            
            <h6 className="mb-2">Time Slots:</h6>
            <Row className="g-2">
              {displaySlots.map(slot => (
                <Col key={slot.id} xs={12} sm={6}>
                  <div className="d-flex align-items-center p-2 bg-light rounded">
                    <FaClock className="me-2 text-primary" />
                    <span>{slot.label}</span>
                  </div>
                </Col>
              ))}
            </Row>
            
            {course?.startDate && (
              <div className="mt-3">
                <h6 className="mb-2">Course Duration:</h6>
                <div className="d-flex align-items-center p-2 bg-light rounded">
                  <FaCalendarAlt className="me-2 text-primary" />
                  <span>
                    {new Date(course.startDate).toLocaleDateString()} to {' '}
                    {course.endDate ? new Date(course.endDate).toLocaleDateString() : 'TBD'}
                    {course.totalWeeks && ` (${course.totalWeeks} weeks)`}
                  </span>
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
        
        <Alert variant="info" className="d-flex">
          <FaInfoCircle className="me-2 mt-1" />
          <div>
            <strong>Access to Lectures:</strong> For each lecture, you will gain access after the scheduled time has passed. 
            {isLiveCourse 
              ? ' Live lectures must be attended at the scheduled time.'
              : ' Recorded lectures can be accessed anytime after they become available.'}
          </div>
        </Alert>
      </div>

      <div className="terms-agreement mb-3">
        <Form.Check 
          type="checkbox"
          id="terms-agreement"
          label={
            <span>
              I agree to the <a href="#" className="text-decoration-underline">Terms of Service</a> and <a href="#" className="text-decoration-underline">Privacy Policy</a>
            </span>
          }
          defaultChecked
        />
      </div>

      <Alert variant="success" className="d-flex">
        <FaCheckCircle className="me-2 mt-1" />
        <div>
          <strong>Ready to Enroll:</strong> Click "Confirm Enrollment" to secure your spot in this course.
        </div>
      </Alert>
    </div>
  );
};

export default EnrollmentConfirmation;
