'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaClock, FaVideo, FaChalkboardTeacher, FaLock, FaUnlock, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { isLectureAccessible } from '@/utils/lectureAccess';

const WeeklyCalendar = ({ enrolledCourses = [] }) => {
  const [currentWeek, setCurrentWeek] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);
  const [error, setError] = useState(null);
  const [draggedSchedule, setDraggedSchedule] = useState(null);
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Time slots reference
  const timeSlots = [
    { id: 1, time: '9:00 AM - 9:45 AM' },
    { id: 2, time: '9:45 AM - 10:30 AM' },
    { id: 3, time: '10:30 AM - 11:15 AM' },
    { id: 4, time: '11:15 AM - 12:00 PM' },
    { id: 5, time: '12:00 PM - 12:45 PM' },
    { id: 6, time: '12:45 PM - 1:30 PM' },
    { id: 7, time: '1:30 PM - 2:15 PM' },
    { id: 8, time: '2:15 PM - 3:00 PM' },
    { id: 9, time: '3:00 PM - 3:45 PM' },
    { id: 10, time: '3:45 PM - 4:30 PM' },
    { id: 11, time: '4:30 PM - 5:15 PM' },
  ];

  // Generate current week dates
  useEffect(() => {
    const generateWeekDates = () => {
      const today = new Date();
      const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const weekDates = [];

      // Start from Sunday
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - currentDay);

      // Generate 7 days
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        weekDates.push({
          date,
          dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
          dayShort: date.toLocaleDateString('en-US', { weekday: 'short' }),
          dateFormatted: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          isToday: date.toDateString() === today.toDateString()
        });
      }

      setCurrentWeek(weekDates);
    };

    generateWeekDates();
  }, []);

  // Fetch lecture schedules for enrolled courses
  useEffect(() => {
    const fetchLectureSchedules = async () => {
      if (enrolledCourses.length === 0) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const allSchedules = [];

        // Fetch schedules for each enrolled course
        for (const course of enrolledCourses) {
          try {
            // Try file-based API first
            const response = await fetch(`/api/file-lecture-schedules/course/${course.id}`);

            if (!response.ok) {
              // If file-based API fails, try the database API
              const dbResponse = await fetch(`/api/lecture-schedules/course/${course.id}`);

              if (!dbResponse.ok) {
                console.error(`Failed to fetch lecture schedules for course ${course.id}`);
                continue;
              }

              const data = await dbResponse.json();
              if (data.success && data.schedules) {
                // Add course info to each schedule
                const courseSchedules = data.schedules.map(schedule => ({
                  ...schedule,
                  course: {
                    id: course.id,
                    title: course.title,
                    format: course.format || 'recorded',
                    image: course.image
                  }
                }));

                allSchedules.push(...courseSchedules);
              }
            } else {
              const data = await response.json();
              if (data.success && data.schedules) {
                // Add course info to each schedule
                const courseSchedules = data.schedules.map(schedule => ({
                  ...schedule,
                  course: {
                    id: course.id,
                    title: course.title,
                    format: course.format || 'recorded',
                    image: course.image
                  }
                }));

                allSchedules.push(...courseSchedules);
              }
            }
          } catch (err) {
            console.error(`Error fetching schedules for course ${course.id}:`, err);
          }
        }

        setSchedules(allSchedules);
      } catch (err) {
        console.error('Error fetching lecture schedules:', err);
        setError('Failed to load your lecture schedules');

        // Generate mock schedules for demo purposes
        generateMockSchedules();
      } finally {
        setIsLoading(false);
      }
    };

    fetchLectureSchedules();
  }, [enrolledCourses]);

  // Generate mock schedules for demo purposes
  const generateMockSchedules = () => {
    if (enrolledCourses.length === 0) return;

    const mockSchedules = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); // Start a week ago

    for (let i = 0; i < enrolledCourses.length; i++) {
      const course = enrolledCourses[i];

      for (let j = 0; j < 5; j++) {
        const lectureDate = new Date(startDate);
        lectureDate.setDate(startDate.getDate() + (j * 2)); // Spread out over the week

        mockSchedules.push({
          id: `mock-${i}-${j}`,
          lecture_id: `lecture-${i}-${j}`,
          slot_id: ((i + j) % 5) + 1,
          scheduledDate: lectureDate.toISOString(),
          isRescheduled: false,
          lecture: {
            title: `Lecture ${j + 1}`,
            moduleName: `Module ${Math.floor(j / 2) + 1}`,
            durationMinutes: 45,
            isDemoLecture: j === 0
          },
          course: {
            id: course.id,
            title: course.title,
            format: j % 2 === 0 ? 'live' : 'recorded', // Alternate between live and recorded
            image: course.image
          }
        });
      }
    }

    setSchedules(mockSchedules);
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
        date,
        dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
        dayShort: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dateFormatted: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        isToday: date.toDateString() === new Date().toDateString()
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
        date,
        dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
        dayShort: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dateFormatted: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        isToday: date.toDateString() === new Date().toDateString()
      });
    }

    setCurrentWeek(newWeek);
  };

  // Handle drag start
  const handleDragStart = (e, schedule) => {
    // Only allow dragging recorded courses
    if (schedule.course?.format === 'recorded' && !schedule.lecture?.isDemoLecture) {
      setDraggedSchedule(schedule);
      e.dataTransfer.setData('text/plain', schedule.id);
      e.dataTransfer.effectAllowed = 'move';
    } else {
      e.preventDefault();
      if (schedule.lecture?.isDemoLecture) {
        toast.error('Demo lectures cannot be rescheduled');
      } else {
        toast.error('Live courses cannot be rescheduled');
      }
    }
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle drop
  const handleDrop = async (e, day, timeSlot) => {
    e.preventDefault();

    if (!draggedSchedule) return;

    // Check if the course is recorded (only recorded courses can be rescheduled)
    if (draggedSchedule.course?.format !== 'recorded') {
      toast.error('Live courses cannot be rescheduled');
      return;
    }

    // Check if the lecture is a demo lecture (demo lectures cannot be rescheduled)
    if (draggedSchedule.lecture?.isDemoLecture) {
      toast.error('Demo lectures cannot be rescheduled');
      return;
    }

    // Set new date based on the day
    const newDate = new Date(day.date);
    newDate.setHours(0, 0, 0, 0);

    // Check if we're trying to reschedule to the same day and time
    const currentDate = new Date(draggedSchedule.scheduledDate);
    currentDate.setHours(0, 0, 0, 0);

    if (newDate.getTime() === currentDate.getTime() &&
      parseInt(draggedSchedule.slot_id) === timeSlot.id) {
      toast.info('Lecture is already scheduled for this time slot');
      return;
    }

    // Check for conflicts
    const conflictingSchedule = schedules.find(schedule => {
      const scheduleDate = new Date(schedule.scheduledDate);
      scheduleDate.setHours(0, 0, 0, 0);

      return scheduleDate.getTime() === newDate.getTime() &&
        parseInt(schedule.slot_id) === timeSlot.id &&
        schedule.id !== draggedSchedule.id;
    });

    if (conflictingSchedule) {
      toast.error('There is already a lecture scheduled for this time slot');
      return;
    }

    // Show loading state
    setIsRescheduling(true);

    try {
      // Try file-based API first
      let response = await fetch(`/api/file-lecture-schedules/update/${draggedSchedule.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newDate: newDate.toISOString(),
          newSlotId: timeSlot.id.toString()
        })
      });

      // If file-based API fails, try the database API
      if (!response.ok) {
        response = await fetch(`/api/lecture-schedules/update/${draggedSchedule.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            newDate: newDate.toISOString(),
            newSlotId: timeSlot.id.toString()
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to reschedule lecture');
        }
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to reschedule lecture');
      }

      // Update the schedule in the local state
      setSchedules(prevSchedules => {
        return prevSchedules.map(schedule => {
          if (schedule.id === draggedSchedule.id) {
            return {
              ...schedule,
              scheduledDate: newDate.toISOString(),
              slot_id: timeSlot.id.toString(),
              isRescheduled: true
            };
          }
          return schedule;
        });
      });

      toast.success('Lecture rescheduled successfully');
    } catch (error) {
      console.error('Error rescheduling lecture:', error);
      toast.error(error.message || 'Failed to reschedule lecture');

      // For demo purposes, update the schedule in the local state anyway
      setSchedules(prevSchedules => {
        return prevSchedules.map(schedule => {
          if (schedule.id === draggedSchedule.id) {
            return {
              ...schedule,
              scheduledDate: newDate.toISOString(),
              slot_id: timeSlot.id.toString(),
              isRescheduled: true
            };
          }
          return schedule;
        });
      });
    } finally {
      setIsRescheduling(false);
      setDraggedSchedule(null);
    }
  };

  // Handle lecture click
  const handleLectureClick = (schedule) => {
    const accessible = isLectureAccessible(schedule, schedule.course?.format);

    if (accessible) {
      // Navigate to lecture or play video
      toast.success(`Opening lecture: ${schedule.lecture?.title || 'Untitled Lecture'}`);
      // TODO: Implement navigation to lecture
    } else {
      toast.error('This lecture is not yet available');
    }
  };

  // Get schedules for a specific day and time slot
  const getSchedulesForDayAndSlot = (day, slotId) => {
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.scheduledDate);
      scheduleDate.setHours(0, 0, 0, 0);

      const dayDate = new Date(day.date);
      dayDate.setHours(0, 0, 0, 0);

      return scheduleDate.getTime() === dayDate.getTime() &&
        parseInt(schedule.slot_id) === slotId;
    });
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-primary bg-opacity-10 border-0">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <FaCalendarAlt className="me-2" />
              Weekly Schedule
            </h5>
          </div>
        </Card.Header>
        <Card.Body className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading your schedule...</p>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="warning">
        <div className="d-flex align-items-center">
          <FaExclamationTriangle className="me-2" />
          <span>Unable to load your schedule: {error}</span>
        </div>
      </Alert>
    );
  }

  if (schedules.length === 0) {
    return (
      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-primary bg-opacity-10 border-0">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <FaCalendarAlt className="me-2" />
              Weekly Schedule
            </h5>
          </div>
        </Card.Header>
        <Card.Body className="text-center py-5">
          <FaCalendarAlt className="display-4 text-muted mb-3" />
          <h5>No Scheduled Lectures</h5>
          <p className="text-muted">
            You don't have any scheduled lectures for this week. Enroll in courses to see your schedule.
          </p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm mb-4">
      <Card.Header className="bg-primary bg-opacity-10 border-0">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <FaCalendarAlt className="me-2" />
            Weekly Schedule
          </h5>
          <div>
            <Button variant="outline-primary" size="sm" className="me-2" onClick={goToPreviousWeek}>
              <FaChevronLeft />
            </Button>
            <Button variant="outline-primary" size="sm" onClick={goToNextWeek}>
              <FaChevronRight />
            </Button>
          </div>
        </div>
      </Card.Header>
      <Card.Body className="p-0">
        <div className="calendar-container">
          {/* Calendar Header */}
          <div className="calendar-header">
            <div className="time-column">
              <div className="time-header">Time</div>
            </div>
            {currentWeek.map((day) => (
              <div
                key={day.dayName}
                className={`day-column ${day.isToday ? 'today' : ''}`}
              >
                <div className="day-header">
                  <div className="day-name">{day.dayShort}</div>
                  <div className="day-date">{day.dateFormatted}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Calendar Body */}
          <div className="calendar-body">
            {timeSlots.map((timeSlot) => (
              <div key={timeSlot.id} className="time-row">
                <div className="time-cell">
                  <div className="time-label">
                    <FaClock className="me-1" />
                    {timeSlot.time}
                  </div>
                </div>

                {currentWeek.map((day) => {
                  const daySchedules = getSchedulesForDayAndSlot(day, timeSlot.id);

                  return (
                    <div
                      key={`${day.dayName}-${timeSlot.id}`}
                      className={`day-cell ${day.isToday ? 'today' : ''}`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, day, timeSlot)}
                    >
                      {daySchedules.map((schedule) => {
                        const accessible = isLectureAccessible(schedule, schedule.course?.format);

                        return (
                          <div
                            key={schedule.id}
                            className={`lecture-card ${schedule.course?.format} ${accessible ? 'accessible' : 'locked'} ${schedule.isRescheduled ? 'rescheduled' : ''}`}
                            draggable={schedule.course?.format === 'recorded' && !schedule.lecture?.isDemoLecture}
                            onDragStart={(e) => handleDragStart(e, schedule)}
                            onClick={() => handleLectureClick(schedule)}
                          >
                            <div className="lecture-title">
                              {schedule.lecture?.title || 'Untitled Lecture'}
                            </div>
                            <div className="lecture-course">
                              {schedule.course?.title || 'Unknown Course'}
                            </div>
                            <div className="lecture-badges">
                              {schedule.lecture?.isDemoLecture && (
                                <Badge bg="warning" className="me-1">Demo</Badge>
                              )}
                              <Badge
                                bg={schedule.course?.format === 'live' ? 'danger' : 'success'}
                                className="me-1"
                              >
                                {schedule.course?.format === 'live' ? (
                                  <><FaChalkboardTeacher className="me-1" /> Live</>
                                ) : (
                                  <><FaVideo className="me-1" /> Recorded</>
                                )}
                              </Badge>
                              <Badge
                                bg={accessible ? 'info' : 'secondary'}
                              >
                                {accessible ? (
                                  <><FaUnlock className="me-1" /> Available</>
                                ) : (
                                  <><FaLock className="me-1" /> Locked</>
                                )}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </Card.Body>
      <Card.Footer className="bg-light border-0">
        <div className="d-flex flex-wrap justify-content-between align-items-center">
          <div className="legend mb-2 mb-md-0">
            <span className="legend-item">
              <span className="legend-color live"></span> Live Course
            </span>
            <span className="legend-item">
              <span className="legend-color recorded"></span> Recorded Course
            </span>
            <span className="legend-item">
              <span className="legend-color accessible"></span> Available
            </span>
            <span className="legend-item">
              <span className="legend-color locked"></span> Locked
            </span>
          </div>
          <div className="instructions">
            <small className="text-muted">
              Drag and drop recorded lectures to reschedule them. Live lectures cannot be rescheduled.
            </small>
          </div>
        </div>
      </Card.Footer>

      {/* CSS Styles */}
      <style jsx global>{`
        .calendar-container {
          overflow-x: auto;
        }

        .calendar-header {
          display: flex;
          border-bottom: 1px solid #e9ecef;
        }

        .time-column {
          width: 150px;
          min-width: 150px;
          border-right: 1px solid #e9ecef;
        }

        .day-column {
          flex: 1;
          min-width: 120px;
          border-right: 1px solid #e9ecef;
        }

        .day-column.today {
          background-color: rgba(13, 110, 253, 0.05);
        }

        .time-header, .day-header {
          padding: 10px;
          text-align: center;
          font-weight: 500;
        }

        .day-name {
          font-weight: bold;
        }

        .day-date {
          font-size: 0.8rem;
          color: #6c757d;
        }

        .calendar-body {
          display: flex;
          flex-direction: column;
        }

        .time-row {
          display: flex;
          border-bottom: 1px solid #e9ecef;
        }

        .time-cell {
          width: 150px;
          min-width: 150px;
          border-right: 1px solid #e9ecef;
          padding: 10px;
        }

        .time-label {
          font-size: 0.8rem;
          color: #6c757d;
        }

        .day-cell {
          flex: 1;
          min-width: 120px;
          border-right: 1px solid #e9ecef;
          padding: 5px;
          min-height: 80px;
        }

        .day-cell.today {
          background-color: rgba(13, 110, 253, 0.05);
        }

        .lecture-card {
          padding: 8px;
          border-radius: 4px;
          margin-bottom: 5px;
          cursor: pointer;
          font-size: 0.85rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .lecture-card.live {
          background-color: #f8d7da;
          border-left: 3px solid #dc3545;
        }

        .lecture-card.recorded {
          background-color: #d1e7dd;
          border-left: 3px solid #198754;
        }

        .lecture-card.accessible {
          opacity: 1;
        }

        .lecture-card.locked {
          opacity: 0.7;
        }

        .lecture-card.rescheduled {
          border-style: dashed;
        }

        .lecture-title {
          font-weight: 500;
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .lecture-course {
          font-size: 0.75rem;
          margin-bottom: 5px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .lecture-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 2px;
        }

        .lecture-badges .badge {
          font-size: 0.65rem;
        }

        .legend {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          font-size: 0.8rem;
          color: #6c757d;
        }

        .legend-color {
          display: inline-block;
          width: 15px;
          height: 15px;
          margin-right: 5px;
          border-radius: 3px;
        }

        .legend-color.live {
          background-color: #f8d7da;
          border-left: 3px solid #dc3545;
        }

        .legend-color.recorded {
          background-color: #d1e7dd;
          border-left: 3px solid #198754;
        }

        .legend-color.accessible {
          background-color: #cfe2ff;
          border-left: 3px solid #0d6efd;
        }

        .legend-color.locked {
          background-color: #e2e3e5;
          border-left: 3px solid #6c757d;
        }
      `}</style>
    </Card>
  );
};

export default WeeklyCalendar;
