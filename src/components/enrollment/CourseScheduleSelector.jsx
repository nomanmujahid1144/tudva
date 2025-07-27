'use client';

import React from 'react';
import { Card, Row, Col, Badge, Alert } from 'react-bootstrap';
import { FaClock, FaCalendarAlt, FaInfoCircle, FaLock } from 'react-icons/fa';
import { timeSlots } from '@/utils/dummyData/enrollmentData';

const CourseScheduleSelector = ({ course, selectedSlots, onSlotSelect, conflicts, disabled = false }) => {
  // If it's a live course, slots are fixed
  const isLiveCourse = course?.format === 'live';

  // Get the slots for this course
  const courseSlots = course?.slots || [];

  // Filter time slots to only show those available for this course
  const availableTimeSlots = isLiveCourse
    ? courseSlots
    : timeSlots;

  return (
    <div className="course-schedule-selector">
      <div className="course-info mb-4">
        <h5>{course?.title}</h5>
        <p className="text-muted mb-2">{course?.description}</p>

        <div className="d-flex align-items-center mb-3">
          <Badge
            bg={isLiveCourse ? "danger" : "success"}
            className="me-2"
          >
            {isLiveCourse ? "LIVE" : "RECORDED"}
          </Badge>

          <div className="d-flex align-items-center ms-3">
            <FaCalendarAlt className="me-2 text-muted" />
            <span>{course?.seminarDay?.name}</span>
          </div>
        </div>

        {isLiveCourse ? (
          <Alert variant="info" className="d-flex align-items-center">
            <FaInfoCircle className="me-2" />
            <div>
              <strong>Live Course:</strong> This course has a fixed schedule. All lectures will be held on {course?.seminarDay?.name}s at the times shown below.
            </div>
          </Alert>
        ) : (
          <Alert variant="info" className="d-flex align-items-center">
            <FaInfoCircle className="me-2" />
            <div>
              <strong>Recorded Course:</strong> Please select your preferred time slots for this course. You can reschedule these later if needed.
            </div>
          </Alert>
        )}
      </div>

      <h6 className="mb-3">
        {isLiveCourse
          ? "Course Schedule (Fixed)"
          : "Select Your Preferred Time Slots"}
      </h6>

      <Row className="g-3">
        {availableTimeSlots.map(slot => {
          const isSelected = isLiveCourse || selectedSlots.includes(slot.id);
          const hasConflict = conflicts.slot.includes(slot.id);

          return (
            <Col key={slot.id} xs={12} sm={6} md={4}>
              <Card
                className={`
                  mb-2
                  ${isSelected ? 'border-primary border-2' : 'border'}
                  ${hasConflict ? 'border-warning' : ''}
                `}
                onClick={() => !isLiveCourse && !disabled && onSlotSelect(slot.id)}
                style={{
                  cursor: isLiveCourse || disabled ? 'default' : 'pointer',
                  opacity: hasConflict ? 0.7 : disabled ? 0.5 : 1
                }}
              >
                <Card.Body className={`
                  p-3
                  ${isSelected ? 'bg-primary bg-opacity-10' : ''}
                  ${hasConflict ? 'bg-warning bg-opacity-10' : ''}
                `}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <FaClock className={`me-2 ${isSelected ? 'text-primary' : ''}`} />
                      <span>{slot.label}</span>
                    </div>

                    {isLiveCourse && (
                      <Badge bg="danger" className="ms-2">
                        <FaLock className="me-1" /> Fixed
                      </Badge>
                    )}

                    {isSelected && !isLiveCourse && (
                      <Badge bg="primary" className="ms-2">Selected</Badge>
                    )}

                    {hasConflict && (
                      <Badge bg="warning" text="dark" className="ms-2">Conflict</Badge>
                    )}
                  </div>

                  {hasConflict && (
                    <div className="mt-2 small text-warning">
                      <FaInfoCircle className="me-1" />
                      You have another course scheduled at this time
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {!isLiveCourse && selectedSlots.length === 0 && !disabled && (
        <Alert variant="warning" className="mt-3">
          <FaInfoCircle className="me-2" />
          Please select at least one time slot to continue.
        </Alert>
      )}

      {!isLiveCourse && disabled && (
        <Alert variant="info" className="mt-3">
          <FaInfoCircle className="me-2" />
          Using default schedule from course. You can uncheck the option above to select custom time slots.
        </Alert>
      )}
    </div>
  );
};

export default CourseScheduleSelector;
