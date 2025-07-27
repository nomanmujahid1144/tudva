'use client';

import React, { useState, useEffect } from 'react';
import { Button, Modal, Spinner, Alert } from 'react-bootstrap';
import { FaGraduationCap, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import CourseScheduleSelector from './CourseScheduleSelector';
import EnrollmentConfirmation from './EnrollmentConfirmation';
import { enrollmentService } from '@/services/enrollmentService';
import { useAuth } from '@/context/AuthContext';

const EnrollButton = ({ course, variant = 'primary', size = 'md', className = '' }) => {
  // Get authentication context
  const { user, isAuthenticated } = useAuth();

  // State variables
  const [showModal, setShowModal] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [conflicts, setConflicts] = useState({ day: false, slot: [] });
  const [step, setStep] = useState(1); // 1 = slot selection, 2 = confirmation
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [useDefaultSchedule, setUseDefaultSchedule] = useState(true);

  // Don't render the button for instructors or if the user is the course instructor
  if (!isAuthenticated ||
    user?.role === 'instructor' ||
    user?.id === course?.instructor_id) {
    return null;
  }

  // Check for conflicts when modal opens and set default slots
  useEffect(() => {
    if (showModal && course) {
      fetchEnrolledCourses();

      // Set default slots from course scheduling if available
      if (useDefaultSchedule && course.scheduling && course.scheduling.selectedSlots) {
        // Ensure selectedSlots is an array and contains valid slot IDs
        const validSlots = Array.isArray(course.scheduling.selectedSlots)
          ? course.scheduling.selectedSlots.filter(slot => slot !== null && slot !== undefined)
          : [];

        console.log('Setting default slots from course scheduling:', validSlots);
        setSelectedSlots(validSlots);
      } else {
        setSelectedSlots([]);
      }
    }
  }, [showModal, course, useDefaultSchedule]);

  // Fetch enrolled courses to check for conflicts
  const fetchEnrolledCourses = async () => {
    try {
      setIsLoading(true);
      const response = await enrollmentService.getEnrolledCourses();
      if (response.success) {
        setEnrolledCourses(response.bookings || []);

        // Check for day-level conflicts
        checkForDayConflicts(response.bookings || []);

        // Clear any previous errors
        setError(null);
      } else {
        // Don't show error for authentication issues
        console.warn('Failed to fetch enrolled courses:', response.message);
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      // Don't show error for authentication issues
      // setError('Failed to check for scheduling conflicts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Day-level conflict detection
  const checkForDayConflicts = (courses) => {
    if (!course?.seminarDay) return;

    // Check if user is already enrolled in any course on this day
    const dayConflict = courses.some(enrollment =>
      enrollment.course?.seminarDay?.id === course.seminarDay.id &&
      enrollment.status !== 'cancelled'
    );

    // Also check for specific slot conflicts
    const slotConflicts = [];
    if (course.slots && course.slots.length > 0) {
      course.slots.forEach(slot => {
        const hasConflict = courses.some(enrollment =>
          enrollment.course?.modules?.some(module =>
            module.slot?.id === slot.id
          )
        );
        if (hasConflict) slotConflicts.push(slot.id);
      });
    }

    setConflicts({ day: dayConflict, slot: slotConflicts });
  };

  // Handle slot selection
  const handleSlotSelection = (slotId) => {
    if (selectedSlots.includes(slotId)) {
      setSelectedSlots(selectedSlots.filter(id => id !== slotId));
    } else {
      setSelectedSlots([...selectedSlots, slotId]);
    }
  };

  // Handle enrollment
  const handleEnroll = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Always use default schedule from course
      // This simplifies the enrollment process
      let slotsToUse = null;

      // For recorded courses, use the course's default schedule
      if (course.format === 'recorded' && course.scheduling && course.scheduling.selectedSlots) {
        // Ensure selectedSlots is an array and contains valid slot IDs
        const validSlots = Array.isArray(course.scheduling.selectedSlots)
          ? course.scheduling.selectedSlots.filter(slot => slot !== null && slot !== undefined)
          : [];

        if (validSlots.length > 0) {
          console.log('Using default slots from course scheduling:', validSlots);
          slotsToUse = validSlots;
        }
      }

      console.log('Enrolling with slots:', slotsToUse);

      if (!course.id) {
        setError('Invalid course ID. Please try again with a valid course.');
        setIsLoading(false);
        return;
      }

      // Call the enrollment API
      const result = await enrollmentService.enrollInCourse(course.id, slotsToUse);

      if (result.success) {
        // Close the modal and reset state
        setShowModal(false);
        setStep(1);
        setSelectedSlots([]);

        // Show success message using toast notification
        toast.success(
          <div className="d-flex align-items-center">
            <FaCheckCircle className="me-2" />
            <span>Enrollment successful! You are now enrolled in this course.</span>
          </div>,
          { duration: 5000 }
        );
      } else {
        setError(result.error || 'Failed to enroll in course. Please try again.');
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to enroll in course. Please try again.';
      setError(errorMessage);

      // Also show a toast for critical errors
      toast.error(
        <div className="d-flex align-items-center">
          <FaExclamationTriangle className="me-2" />
          <span>{errorMessage}</span>
        </div>,
        { duration: 5000 }
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    setShowModal(false);
    setStep(1);
    setSelectedSlots([]);
    setError(null);
  };

  // We're simplifying the enrollment process to use default schedule
  // No need for next/back steps anymore
  useEffect(() => {
    // When modal opens, set the default slots from course scheduling
    if (showModal && course && course.scheduling && course.scheduling.selectedSlots) {
      const validSlots = Array.isArray(course.scheduling.selectedSlots)
        ? course.scheduling.selectedSlots.filter(slot => slot !== null && slot !== undefined)
        : [];

      if (validSlots.length > 0) {
        setSelectedSlots(validSlots);
      }
    }
  }, [showModal, course]);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setShowModal(true)}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Spinner animation="border" size="sm" className="me-2" />
            Loading...
          </>
        ) : (
          <>
            <FaGraduationCap className="me-2" />
            Enroll Now
          </>
        )}
      </Button>

      <Modal show={showModal} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Enrollment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p className="mt-3">Processing enrollment...</p>
            </div>
          ) : (
            <>
              {error && (
                <Alert variant="danger" className="mb-4">
                  <FaExclamationTriangle className="me-2" />
                  {error}
                </Alert>
              )}

              {conflicts.day && (
                <Alert variant="warning" className="mb-4">
                  <FaExclamationTriangle className="me-2" />
                  You already have a course scheduled on {course?.seminarDay?.name}.
                  Enrolling in this course will replace your existing schedule for this day.
                </Alert>
              )}

              <div className="mb-4 p-3 border rounded bg-light">
                <p className="mb-2"><strong>Enrollment Information</strong></p>
                <p className="mb-0 small">You will be enrolled in this course using the default schedule. You can adjust your schedule later from your dashboard if needed.</p>
              </div>

              <EnrollmentConfirmation
                course={course}
                selectedSlots={course.scheduling?.selectedSlots || []}
              />
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleEnroll}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Enrolling...
              </>
            ) : (
              'Confirm Enrollment'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default EnrollButton;
