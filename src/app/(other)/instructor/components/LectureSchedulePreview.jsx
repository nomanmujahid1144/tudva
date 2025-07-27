'use client';

import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Spinner } from 'react-bootstrap';
import { FaCalendarAlt, FaClock, FaVideo, FaChalkboardTeacher } from 'react-icons/fa';
import { useFormContext } from 'react-hook-form';

const LectureSchedulePreview = ({
  selectedDay,
  selectedSlots,
  startDate,
  courseType
}) => {
  const { watch } = useFormContext();
  const [scheduleData, setScheduleData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Watch lecture groups to calculate total lectures
  const lectureGroups = watch('lectureGroups') || [];

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

  // Days of the week for date calculation
  const daysOfWeek = {
    'sunday': 0,
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6
  };

  // Generate schedule data
  useEffect(() => {
    if (!startDate || !selectedDay || selectedSlots.length === 0 || lectureGroups.length === 0) {
      setScheduleData([]);
      return;
    }

    setIsLoading(true);

    try {
      // Flatten lectures from all groups
      const allLectures = [];
      lectureGroups.forEach(group => {
        if (group.lectures) {
          group.lectures.forEach(lecture => {
            allLectures.push({
              ...lecture,
              moduleName: group.lectureHeading || 'Unnamed Module'
            });
          });
        }
      });

      // Sort lectures by module and then by sort order
      allLectures.sort((a, b) => {
        if (a.moduleName !== b.moduleName) {
          return a.moduleName.localeCompare(b.moduleName);
        }
        return (a.sortOrder || 0) - (b.sortOrder || 0);
      });

      // Calculate schedule
      const schedule = [];
      const startDateObj = new Date(startDate);
      const targetDayOfWeek = daysOfWeek[selectedDay];

      // Adjust start date to the selected day of week
      while (startDateObj.getDay() !== targetDayOfWeek) {
        startDateObj.setDate(startDateObj.getDate() + 1);
      }

      // Generate schedule for each lecture
      let currentDate = new Date(startDateObj);
      let slotIndex = 0;

      for (let i = 0; i < allLectures.length; i++) {
        const lecture = allLectures[i];
        const slotId = selectedSlots[slotIndex];
        const slot = timeSlots.find(s => s.id === slotId);

        schedule.push({
          id: i + 1,
          date: new Date(currentDate),
          lecture: lecture,
          slotId: slotId,
          slotTime: slot ? slot.time : 'Unknown time'
        });

        // Move to next slot
        slotIndex = (slotIndex + 1) % selectedSlots.length;

        // If we've used all slots for this day, move to next week
        if (slotIndex === 0) {
          currentDate = new Date(currentDate);
          currentDate.setDate(currentDate.getDate() + 7);
        }
      }

      setScheduleData(schedule);
    } catch (error) {
      console.error('Error generating schedule preview:', error);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, selectedDay, selectedSlots, lectureGroups]);

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Generating schedule preview...</p>
      </div>
    );
  }

  if (scheduleData.length === 0) {
    return (
      <Card className="bg-light border-0 mb-4">
        <Card.Body className="text-center py-4">
          <FaCalendarAlt className="display-4 text-muted mb-3" />
          <h5>Schedule Preview Not Available</h5>
          <p className="text-muted">
            Complete your course details, add lectures, and configure the schedule to see a preview.
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
            Lecture Schedule Preview
          </h5>
          <Badge bg={courseType === 'live' ? 'danger' : 'success'}>
            {courseType === 'live' ? 'Live Course' : 'Recorded Course'}
          </Badge>
        </div>
      </Card.Header>
      <Card.Body className="p-0">
        <div className="table-responsive">
          <Table hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Time</th>
                <th>Module</th>
                <th>Lecture</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {scheduleData.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.date.toLocaleDateString()}</td>
                  <td>{item.slotTime}</td>
                  <td>{item.lecture.moduleName}</td>
                  <td>{item.lecture.topicName || item.lecture.title || 'Unnamed Lecture'}</td>
                  <td>
                    {index === 0 ? (
                      <Badge bg="warning" className="me-1">Demo</Badge>
                    ) : null}
                    <Badge bg={courseType === 'live' ? 'danger' : 'success'}>
                      {courseType === 'live' ? (
                        <><FaChalkboardTeacher className="me-1" /> Live</>
                      ) : (
                        <><FaVideo className="me-1" /> Recorded</>
                      )}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card.Body>
      <Card.Footer className="bg-light border-0 text-center">
        <small className="text-muted">
          {courseType === 'live' ? (
            'This schedule is fixed and cannot be changed by learners.'
          ) : (
            'Learners can reschedule lectures based on their availability.'
          )}
        </small>
      </Card.Footer>
    </Card>
  );
};

export default LectureSchedulePreview;
