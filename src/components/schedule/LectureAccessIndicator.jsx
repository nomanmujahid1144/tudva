'use client';

import React, { useState, useEffect } from 'react';
import { Badge, Spinner } from 'react-bootstrap';
import { FaLock, FaUnlock, FaClock } from 'react-icons/fa';
import { lectureAccessService, formatTimeRemaining } from '@/services/enrollmentService';

const LectureAccessIndicator = ({ lecture, onCountdownComplete }) => {
  const [status, setStatus] = useState('loading');
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check lecture access status on mount and when lecture changes
  useEffect(() => {
    if (lecture) {
      checkLectureAccess();
    }
  }, [lecture]);

  // Update countdown timer every second
  useEffect(() => {
    if (status === 'locked' && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1000;

          // If countdown reaches zero, update status and call onCountdownComplete
          if (newTime <= 0) {
            setStatus('unlocked');
            clearInterval(timer);

            if (onCountdownComplete) {
              onCountdownComplete();
            }

            return 0;
          }

          return newTime;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status, timeRemaining, onCountdownComplete]);

  // Check if lecture is accessible
  const checkLectureAccess = async () => {
    try {
      setIsLoading(true);

      const result = await lectureAccessService.checkLectureAccess(lecture.id);

      if (result.success) {
        setStatus(result.accessible ? 'unlocked' : 'locked');

        if (!result.accessible && result.timeRemaining) {
          setTimeRemaining(result.timeRemaining);
        }
      } else {
        console.error('Error checking lecture access:', result.error);
        setStatus('error');
      }
    } catch (error) {
      console.error('Error checking lecture access:', error);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Render based on status
  if (isLoading) {
    return (
      <div className="lecture-access-indicator loading">
        <Spinner animation="border" size="sm" />
      </div>
    );
  }

  if (status === 'unlocked') {
    return (
      <div className="lecture-access-indicator unlocked">
        <Badge bg="success" className="d-flex align-items-center">
          <FaUnlock className="me-1" size={10} />
          Available
        </Badge>
      </div>
    );
  }

  if (status === 'locked') {
    return (
      <div className="lecture-access-indicator locked">
        <Badge bg="secondary" className="d-flex align-items-center">
          <FaLock className="me-1" size={10} />
          Locked
        </Badge>

        {timeRemaining > 0 && (
          <div className="countdown mt-1">
            <div className="d-flex align-items-center">
              <FaClock className="me-1" size={10} />
              <small>{formatTimeRemaining(timeRemaining)}</small>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Error state
  return (
    <div className="lecture-access-indicator error">
      <Badge bg="danger">Error</Badge>
    </div>
  );
};

export default LectureAccessIndicator;
