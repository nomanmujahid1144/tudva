'use client';

import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Card, Badge, Button } from 'react-bootstrap';
import { FaClock, FaCalendarAlt, FaInfoCircle } from 'react-icons/fa';
import { useFormContext } from 'react-hook-form';
import { toast } from 'react-hot-toast';

const EnhancedScheduling = ({
  selectedDay,
  setSelectedDay,
  slotsPerDay,
  setSlotsPerDay,
  selectedSlots,
  setSelectedSlots,
  startDate,
  setStartDate,
  estimatedEndDate,
  setEstimatedEndDate,
  courseType
}) => {
  const { setValue, getValues, watch } = useFormContext();

  // Watch lecture groups to calculate total lectures
  const lectureGroups = watch('lectureGroups') || [];

  // Days of the week
  const daysOfWeek = [
    { id: 'monday', name: 'Monday' },
    { id: 'tuesday', name: 'Tuesday' },
    { id: 'wednesday', name: 'Wednesday' },
    { id: 'thursday', name: 'Thursday' },
    { id: 'friday', name: 'Friday' },
    { id: 'saturday', name: 'Saturday' },
    { id: 'sunday', name: 'Sunday' },
  ];

  // Generate time slots (9:00 AM to 5:00 PM, 45-minute slots)
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

  // Calculate estimated end date
  const calculateEstimatedEndDate = () => {
    // Count total lectures
    const totalLectures = lectureGroups.reduce((total, group) => {
      return total + (group.lectures ? group.lectures.length : 0);
    }, 0);

    // If no lectures, use at least 1 to ensure proper scheduling
    const actualLectures = Math.max(totalLectures, 1);

    // Calculate weeks needed based on selected slots per day
    // Each lecture needs one slot, and we can only use slots on the selected day each week
    const lecturesPerWeek = selectedSlots.length || 1; // Use at least 1 slot if none selected
    const weeksNeeded = Math.ceil(actualLectures / lecturesPerWeek);

    // Calculate end date
    if (startDate) {
      const start = new Date(startDate);
      const end = new Date(start);

      // Add weeks needed (minimum 1 week)
      const weeksToAdd = Math.max(weeksNeeded, 1);

      // For a single lecture with one slot, we still need at least 1 week
      // For multiple lectures, calculate based on the selected day and slots
      if (selectedDay) {
        // Get the day index (0 = Sunday, 1 = Monday, etc.)
        const dayIndex = {
          'sunday': 0,
          'monday': 1,
          'tuesday': 2,
          'wednesday': 3,
          'thursday': 4,
          'friday': 5,
          'saturday': 6
        }[selectedDay];

        // Calculate days to add to reach the selected day of the week
        const currentDayIndex = start.getDay();
        let daysToAdd = (dayIndex - currentDayIndex + 7) % 7;

        // If we're already on the selected day, start from next week
        if (daysToAdd === 0) {
          daysToAdd = 7;
        }

        // Create a new date for the first session
        const firstSessionDate = new Date(start);
        firstSessionDate.setDate(start.getDate() + daysToAdd);

        // Calculate the end date based on the number of weeks needed
        end.setTime(firstSessionDate.getTime());
        end.setDate(end.getDate() + ((weeksToAdd - 1) * 7));
      } else {
        // Fallback to simple calculation if no day selected
        end.setDate(start.getDate() + (weeksToAdd * 7));
      }

      setEstimatedEndDate(end.toISOString().split('T')[0]);
      console.log(`Calculated end date: ${end.toISOString()}, Weeks needed: ${weeksNeeded}, Total lectures: ${totalLectures}`);

      return {
        totalLectures: actualLectures,
        weeksNeeded: weeksToAdd,
        endDate: end
      };
    }

    return {
      totalLectures: actualLectures,
      weeksNeeded: Math.max(weeksNeeded, 1),
      endDate: null
    };
  };

  // Handle slot selection
  const handleSlotSelection = (slotId) => {
    if (selectedSlots.includes(slotId)) {
      // Remove slot if already selected
      setSelectedSlots(selectedSlots.filter(id => id !== slotId));
    } else {
      // Add slot if not selected and we haven't reached the limit
      if (selectedSlots.length < slotsPerDay) {
        setSelectedSlots([...selectedSlots, slotId]);
      } else {
        toast.error(`You can only select ${slotsPerDay} slots per day`);
      }
    }
  };

  // Update slots per day
  const handleSlotsPerDayChange = (e) => {
    const value = parseInt(e.target.value);
    setSlotsPerDay(value);
    // Clear selected slots if we reduce the number of slots
    if (selectedSlots.length > value) {
      setSelectedSlots(selectedSlots.slice(0, value));
    }
  };

  // Update form values when scheduling changes
  useEffect(() => {
    // Only calculate if we have the minimum required data
    if (!startDate || selectedSlots.length === 0) {
      console.log('Missing required scheduling data, skipping calculation');
      return;
    }

    const { totalLectures, weeksNeeded, endDate } = calculateEstimatedEndDate();

    // Validate the calculated values
    if (!weeksNeeded || weeksNeeded < 1 || !totalLectures) {
      console.warn('Invalid schedule calculation results:', { totalLectures, weeksNeeded });
      return;
    }

    // Update form values with validated data
    setValue('scheduling', {
      day: selectedDay,
      slotsPerDay,
      selectedSlots,
      startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
      endDate: endDate ? endDate.toISOString() : new Date().toISOString(),
      totalWeeks: weeksNeeded,
      totalLectures,
      regenerateSchedules: true // Always regenerate schedules when updating
    });

    console.log('Updated scheduling data:', {
      day: selectedDay,
      slotsPerDay,
      selectedSlots,
      startDate: startDate,
      endDate: endDate ? endDate.toISOString().split('T')[0] : null,
      totalWeeks: weeksNeeded,
      totalLectures
    });
  }, [selectedDay, slotsPerDay, selectedSlots, lectureGroups, startDate, setValue]);

  return (
    <div className="enhanced-scheduling mb-4">
      <h5 className="mb-3">Course Schedule</h5>

      {/* Course Type Info */}
      <div className={`alert ${courseType === 'live' ? 'alert-info' : 'alert-warning'} d-flex align-items-center`}>
        <FaInfoCircle className="me-2" />
        <div>
          {courseType === 'live' ? (
            <span>This is a <strong>live course</strong>. The schedule you set will be fixed and cannot be changed by learners.</span>
          ) : (
            <span>This is a <strong>recorded course</strong>. The schedule you set will be the default, but learners can reschedule lectures.</span>
          )}
        </div>
      </div>

      <Row className="g-3 mb-4">
        {/* Start Date */}
        <Col md={6}>
          <Form.Group>
            <Form.Label>Start Date</Form.Label>
            <div className="input-group">
              <span className="input-group-text">
                <FaCalendarAlt />
              </span>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="form-control"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <Form.Text className="text-muted">
              Select the start date for this course
            </Form.Text>
          </Form.Group>
        </Col>

        {/* Day Selection */}
        <Col md={6}>
          <Form.Group>
            <Form.Label>Select Day</Form.Label>
            <Form.Select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="form-control"
            >
              {daysOfWeek.map(day => (
                <option key={day.id} value={day.id}>{day.name}</option>
              ))}
            </Form.Select>
            <Form.Text className="text-muted">
              Select the day of the week for this course
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>

      {/* Slots Per Day */}
      <Form.Group className="mb-4">
        <Form.Label>Slots Per Day</Form.Label>
        <Form.Select
          value={slotsPerDay}
          onChange={handleSlotsPerDayChange}
          className="form-control"
        >
          {[1, 2, 3, 4, 5].map(num => (
            <option key={num} value={num}>{num} slot{num !== 1 ? 's' : ''}</option>
          ))}
        </Form.Select>
        <Form.Text className="text-muted">
          Select how many time slots you want to use per day
        </Form.Text>
      </Form.Group>

      {/* Time Slots */}
      <Form.Group className="mb-4">
        <Form.Label>Select Time Slots (Choose {slotsPerDay})</Form.Label>
        <Row className="g-2">
          {timeSlots.map(slot => (
            <Col key={slot.id} xs={12} sm={6} md={4} lg={3}>
              <Card
                className={`mb-2 ${selectedSlots.includes(slot.id) ? 'border-primary border-2' : 'border'}`}
                onClick={() => handleSlotSelection(slot.id)}
                style={{ cursor: 'pointer' }}
              >
                <Card.Body className={`p-2 ${selectedSlots.includes(slot.id) ? 'bg-primary bg-opacity-10' : ''}`}>
                  <div className="d-flex align-items-center">
                    <FaClock className={`me-2 ${selectedSlots.includes(slot.id) ? 'text-primary' : ''}`} />
                    <span>{slot.time}</span>
                  </div>
                  {selectedSlots.includes(slot.id) && (
                    <div className="mt-1 text-center">
                      <Badge bg="primary">Selected</Badge>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        <Form.Text className="text-muted">
          Click on the time slots to select them
        </Form.Text>
      </Form.Group>

      {/* Schedule Summary */}
      <Card className="bg-light border-0 mb-3">
        <Card.Body>
          <h6 className="mb-3">Schedule Summary</h6>
          <Row>
            <Col md={6}>
              <p className="mb-2">
                <strong>Day:</strong> {daysOfWeek.find(day => day.id === selectedDay)?.name}
              </p>
              <p className="mb-2">
                <strong>Start Date:</strong> {startDate ? new Date(startDate).toLocaleDateString() : 'Not set'}
              </p>
              <p className="mb-2">
                <strong>Slots Per Day:</strong> {slotsPerDay}
              </p>
            </Col>
            <Col md={6}>
              <p className="mb-2">
                <strong>Selected Slots:</strong> {selectedSlots.length > 0 ?
                  selectedSlots.map(id => timeSlots.find(slot => slot.id === id)?.time).join(', ') :
                  'None'}
              </p>
              <p className="mb-2">
                <strong>Total Lectures:</strong> {lectureGroups.reduce((total, group) => {
                  return total + (group.lectures ? group.lectures.length : 0);
                }, 0)}
              </p>
              <p className="mb-2">
                <strong>Estimated End Date:</strong> {estimatedEndDate ? new Date(estimatedEndDate).toLocaleDateString() : 'Not calculated'}
              </p>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default EnhancedScheduling;
