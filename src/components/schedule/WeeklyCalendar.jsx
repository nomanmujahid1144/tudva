'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import DraggableCourseCard from './DraggableCourseCard';
import {
  getCurrentWeekDates,
  formatTimeRemaining
} from '@/services/enrollmentService';
import { enrollmentService } from '@/services/enrollmentService';
import '@/styles/calendar.css';

// Time slots from 9:00 AM to 5:00 PM (45-minute slots)
const timeSlots = [
  { id: 'slot-1', startTime: '09:00', endTime: '09:45', label: '9:00 AM - 9:45 AM' },
  { id: 'slot-2', startTime: '09:45', endTime: '10:30', label: '9:45 AM - 10:30 AM' },
  { id: 'slot-3', startTime: '10:30', endTime: '11:15', label: '10:30 AM - 11:15 AM' },
  { id: 'slot-4', startTime: '11:15', endTime: '12:00', label: '11:15 AM - 12:00 PM' },
  { id: 'slot-5', startTime: '12:00', endTime: '12:45', label: '12:00 PM - 12:45 PM' },
  { id: 'slot-6', startTime: '12:45', endTime: '13:30', label: '12:45 PM - 1:30 PM' },
  { id: 'slot-7', startTime: '13:30', endTime: '14:15', label: '1:30 PM - 2:15 PM' },
  { id: 'slot-8', startTime: '14:15', endTime: '15:00', label: '2:15 PM - 3:00 PM' },
  { id: 'slot-9', startTime: '15:00', endTime: '15:45', label: '3:00 PM - 3:45 PM' },
  { id: 'slot-10', startTime: '15:45', endTime: '16:30', label: '3:45 PM - 4:30 PM' },
  { id: 'slot-11', startTime: '16:30', endTime: '17:15', label: '4:30 PM - 5:15 PM' },
];

// Helper function to group courses by day and time
const groupCoursesByDayAndTime = (enrolledCourses, weekDates) => {
  const coursesByDayAndTime = {};

  // Initialize the structure
  weekDates.forEach(day => {
    coursesByDayAndTime[day.date] = {};
    timeSlots.forEach(slot => {
      coursesByDayAndTime[day.date][slot.id] = [];
    });
  });

  // Populate with courses
  enrolledCourses.forEach(enrollment => {
    const course = enrollment.course;

    if (!course) return;

    // Find the day of the week for this course
    const courseDay = course.seminarDay?.id;
    if (!courseDay) return;

    // Find the matching date in the current week
    const matchingDay = weekDates.find(day => day.dayOfWeek === courseDay);

    if (matchingDay) {
      // Get the slots for this course
      const courseSlots = enrollment.bookingSlots || [];

      // Calculate progress if available
      const completedLectures = enrollment.completedLectures || 0;
      const totalLectures = course.totalLectures || (course.lectures?.length || 0);
      const progressDisplay = totalLectures > 0 ? `${completedLectures}/${totalLectures}` : null;

      // Add the course to each of its slots
      courseSlots.forEach(bookingSlot => {
        const slotId = bookingSlot.slot_id;
        if (coursesByDayAndTime[matchingDay.date][slotId]) {
          coursesByDayAndTime[matchingDay.date][slotId].push({
            id: enrollment.id,
            courseId: course.id,
            title: course.title,
            progress: progressDisplay || enrollment.progress || null,
            completedLectures: completedLectures,
            totalLectures: totalLectures,
            courseType: course.format,
            format: course.format,
            color: course.color || '#8bc34a',
            icon: course.icon,
          });
        }
      });
    }
  });

  return coursesByDayAndTime;
};

const WeeklyCalendar = ({ initialEnrolledCourses = [] }) => {
  const [currentWeek, setCurrentWeek] = useState(getCurrentWeekDates());
  const [enrolledCourses, setEnrolledCourses] = useState(initialEnrolledCourses);
  const [isLoading, setIsLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);
  const [error, setError] = useState(null);
  const [draggedSchedule, setDraggedSchedule] = useState(null);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [coursesByDayAndTime, setCoursesByDayAndTime] = useState({});

  // Fetch enrolled courses
  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  // Update coursesByDayAndTime when enrolledCourses or currentWeek changes
  useEffect(() => {
    if (enrolledCourses.length > 0) {
      const grouped = groupCoursesByDayAndTime(enrolledCourses, currentWeek);
      setCoursesByDayAndTime(grouped);
    }
  }, [enrolledCourses, currentWeek]);

  // Fetch enrolled courses
  const fetchEnrolledCourses = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await enrollmentService.getEnrolledCourses();
      if (response.success) {
        setEnrolledCourses(response.bookings);

        const grouped = groupCoursesByDayAndTime(response.bookings, currentWeek);
        setCoursesByDayAndTime(grouped);
      } else {
        setError('Failed to fetch enrolled courses');
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      setError('Failed to load your schedule. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to previous week
  const goToPreviousWeek = () => {
    const firstDay = new Date(currentWeek[0].date);
    firstDay.setDate(firstDay.getDate() - 7);

    const newWeek = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(firstDay);
      date.setDate(firstDay.getDate() + i);

      newWeek.push({
        date: date.toISOString().split('T')[0],
        label: currentWeek[i].label,
        dayOfWeek: currentWeek[i].dayOfWeek,
      });
    }

    setCurrentWeek(newWeek);
  };

  // Navigate to next week
  const goToNextWeek = () => {
    const firstDay = new Date(currentWeek[0].date);
    firstDay.setDate(firstDay.getDate() + 7);

    const newWeek = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(firstDay);
      date.setDate(firstDay.getDate() + i);

      newWeek.push({
        date: date.toISOString().split('T')[0],
        label: currentWeek[i].label,
        dayOfWeek: currentWeek[i].dayOfWeek,
      });
    }

    setCurrentWeek(newWeek);
  };

  // Handle drag start
  const handleDragStart = (course) => {
    // Only allow dragging recorded courses
    if (course.courseType === 'recorded' || course.format === 'recorded') {
      setDraggedSchedule(course);
      console.log('Started dragging course:', course.title);

      // Show toast notification for dragging
      toast.success(
        <div className="d-flex align-items-center">
          <span>Drag to reschedule <strong>{course.title}</strong></span>
        </div>,
        { duration: 3000 }
      );
    } else {
      console.log('Cannot drag live course:', course.title);

      // Show toast notification for live courses
      toast.error(
        <div className="d-flex align-items-center">
          <span>Live courses cannot be rescheduled</span>
        </div>,
        { duration: 3000 }
      );
    }
  };

  // Handle drop
  const handleDrop = async (day, timeSlot) => {
    if (!draggedSchedule) return;

    try {
      setIsRescheduling(true);
      setError(null);

      // Call the reschedule API
      const result = await enrollmentService.rescheduleBooking(
        draggedSchedule.id,
        day.dayOfWeek,
        [timeSlot.id],
        day.date // Use the date as the scheduled date
      );

      if (result.success) {
        // Refresh the enrolled courses
        await fetchEnrolledCourses();

        // Reset dragged schedule
        setDraggedSchedule(null);

        // Show success toast
        toast.success(
          <div className="d-flex align-items-center">
            <FaCheckCircle className="me-2" />
            <span>Course rescheduled successfully!</span>
          </div>,
          { duration: 3000 }
        );
      } else {
        setError(`Failed to reschedule: ${result.error || 'Unknown error'}`);

        // Show error toast
        toast.error(
          <div className="d-flex align-items-center">
            <FaExclamationTriangle className="me-2" />
            <span>Failed to reschedule: {result.error || 'Unknown error'}</span>
          </div>,
          { duration: 5000 }
        );
      }
    } catch (error) {
      console.error('Error rescheduling course:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
      setError(`Failed to reschedule: ${errorMessage}`);

      // Show error toast
      toast.error(
        <div className="d-flex align-items-center">
          <FaExclamationTriangle className="me-2" />
          <span>Failed to reschedule: {errorMessage}</span>
        </div>,
        { duration: 5000 }
      );
    } finally {
      setIsRescheduling(false);
    }
  };

  // Check if a cell is a valid drop target
  const isValidDropTarget = (day, timeSlot) => {
    if (!draggedSchedule) return false;

    // Check if the day is in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dropDate = new Date(day.date);

    if (dropDate < today) {
      return false;
    }

    // Check if there's already a live course in this slot (can't stack with live courses)
    const coursesInSlot = coursesByDayAndTime[day.date]?.[timeSlot.id] || [];
    const hasLiveCourse = coursesInSlot.some(c =>
      (c.courseType === 'live' || c.format === 'live') && c.id !== draggedSchedule.id
    );

    if (hasLiveCourse) {
      return false;
    }

    // Allow stacking up to 3 recorded courses
    if (coursesInSlot.length >= 3 && !coursesInSlot.some(c => c.id === draggedSchedule.id)) {
      return false;
    }

    return true;
  };

  // Format date range for display
  const formatDateRange = () => {
    if (currentWeek.length === 0) return '';

    const startDate = new Date(currentWeek[0].date);
    const endDate = new Date(currentWeek[6].date);

    const options = { month: 'short', day: 'numeric' };
    return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
  };

  // Get today's date for highlighting
  const today = new Date().toISOString().split('T')[0];

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-transparent">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <FaCalendarAlt className="me-2" />
            Weekly Schedule
          </h5>

          <div className="d-flex align-items-center">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={goToPreviousWeek}
              className="me-2"
            >
              <FaChevronLeft />
            </Button>

            <span className="mx-2 fw-bold">{formatDateRange()}</span>

            <Button
              variant="outline-secondary"
              size="sm"
              onClick={goToNextWeek}
              className="ms-2"
            >
              <FaChevronRight />
            </Button>
          </div>
        </div>
      </Card.Header>

      <Card.Body className="p-0">
        {isLoading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
            <p className="mt-3">Loading your schedule...</p>
          </div>
        ) : error ? (
          <Alert variant="danger" className="m-3">
            <FaExclamationTriangle className="me-2" />
            {error}
          </Alert>
        ) : (
          <div className="weekly-calendar">
            <div className="calendar-header">
              <div className="time-column-header"></div>
              {currentWeek.map(day => (
                <div
                  key={day.date}
                  className={`day-column-header ${day.date === today ? 'today' : ''}`}
                >
                  <div className="day-name">{day.label}</div>
                  <div className="day-date">
                    {new Date(day.date).getDate()}
                  </div>
                </div>
              ))}
            </div>

            <div className="calendar-body">
              {timeSlots.map(timeSlot => (
                <div key={timeSlot.id} className="time-row">
                  <div className="time-label">
                    {timeSlot.startTime}
                  </div>

                  {currentWeek.map(day => {
                    const coursesInSlot = coursesByDayAndTime[day.date]?.[timeSlot.id] || [];
                    const isValid = isValidDropTarget(day, timeSlot);

                    return (
                      <div
                        key={`${day.date}-${timeSlot.id}`}
                        className={`
                          calendar-cell
                          ${day.date === today ? 'today' : ''}
                          ${draggedSchedule && isValid ? 'valid-drop-target' : ''}
                          ${draggedSchedule && !isValid ? 'invalid-drop-target' : ''}
                        `}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (isValid) {
                            handleDrop(day, timeSlot);
                          }
                        }}
                      >
                        {coursesInSlot.map((course, index) => (
                          <DraggableCourseCard
                            key={course.id}
                            course={course}
                            onDragStart={() => handleDragStart(course)}
                            index={index}
                          />
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card.Body>

      {!isLoading && !error && enrolledCourses.length === 0 && (
        <div className="text-center py-4">
          <p className="mb-0">You haven't enrolled in any courses yet.</p>
        </div>
      )}

      {isRescheduling && (
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75">
          <div className="text-center">
            <Spinner animation="border" />
            <p className="mt-3">Rescheduling your course...</p>
          </div>
        </div>
      )}

      {/* Styles moved to external CSS file: /styles/calendar.css */}
    </Card>
  );
};

export default WeeklyCalendar;
