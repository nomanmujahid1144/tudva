"use client";

import { useState, useEffect } from 'react';
import { Card, Table, Badge, Alert, Spinner } from 'react-bootstrap';
import { FaCalendarAlt, FaLock, FaPlay, FaCheck } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const LectureScheduleDisplay = ({ courseId, courseType }) => {
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate] = useState(new Date());

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

  useEffect(() => {
    const fetchSchedules = async () => {
      if (!courseId) {
        setError('Course ID is required');
        setIsLoading(false);
        return;
      }

      try {
        // First try to get schedules from the API
        const response = await fetch(`/api/lecture-schedules/${courseId}`);
        const data = await response.json();

        if (data.success && data.schedules) {
          console.log('Fetched schedules from API:', data.schedules);
          setSchedules(data.schedules);
          setIsLoading(false);
        } else {
          // If API fails, try to generate schedules from course data
          console.log('No schedules from API, trying to generate from course data');
          
          // Fetch course data
          const courseResponse = await fetch(`/api/courses/${courseId}`);
          const courseData = await courseResponse.json();
          
          if (courseData.success && courseData.course) {
            generateSchedulesFromCourseData(courseData.course);
          } else {
            setError('No schedule data available');
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching lecture schedules:', error);
        setError('Failed to load schedule data');
        setIsLoading(false);
      }
    };

    fetchSchedules();
  }, [courseId]);

  // Generate schedules from course data
  const generateSchedulesFromCourseData = (courseData) => {
    const generatedSchedules = [];

    // Get scheduling data
    const scheduling = courseData.scheduling;
    if (!scheduling) {
      console.warn('No scheduling data found in course data');
      return setSchedules([]);
    }

    const { day, startDate: scheduleStartDate, selectedSlots, totalWeeks } = scheduling;
    if (!scheduleStartDate || !selectedSlots || !selectedSlots.length) {
      console.warn('Incomplete scheduling data:', scheduling);
      return setSchedules([]);
    }

    console.log('Generating schedules with data:', { day, scheduleStartDate, selectedSlots, totalWeeks });

    // First check if we have modulesList (new format)
    let allLectures = [];
    let moduleMap = {};

    // Get lectures from modules
    if (courseData.modules) {
      Object.entries(courseData.modules).forEach(([moduleName, lectures], moduleIndex) => {
        if (Array.isArray(lectures)) {
          lectures.forEach((lecture, lectureIndex) => {
            allLectures.push({
              ...lecture,
              moduleName,
              moduleIndex,
              lectureIndex
            });
          });
        }
      });
    } else if (courseData.lectures && Array.isArray(courseData.lectures)) {
      // If we have a flat lectures array
      allLectures = courseData.lectures.map((lecture, index) => ({
        ...lecture,
        moduleName: lecture.moduleName || `Module ${Math.floor(index / 4) + 1}`,
        moduleIndex: Math.floor(index / 4),
        lectureIndex: index % 4
      }));
    }

    // Sort lectures by module and lecture index
    allLectures.sort((a, b) => {
      if (a.moduleIndex !== b.moduleIndex) {
        return a.moduleIndex - b.moduleIndex;
      }
      return a.lectureIndex - b.lectureIndex;
    });

    // If we don't have enough lectures, create placeholders
    const totalLectures = totalWeeks * selectedSlots.length;
    while (allLectures.length < totalLectures) {
      const moduleIndex = Math.floor(allLectures.length / 4);
      const lectureIndex = allLectures.length % 4;
      allLectures.push({
        title: `Lecture ${allLectures.length + 1}`,
        moduleName: `Module ${moduleIndex + 1}`,
        moduleIndex,
        lectureIndex,
        placeholder: true
      });
    }

    // Create schedule entries
    const startDate = new Date(scheduleStartDate);
    let currentLectureIndex = 0;

    // For each week
    for (let week = 0; week < totalWeeks; week++) {
      // Calculate the date for this week
      const weekDate = new Date(startDate);
      weekDate.setDate(startDate.getDate() + (week * 7));
      
      // For each selected slot
      selectedSlots.forEach((slotId) => {
        if (currentLectureIndex < allLectures.length) {
          const lecture = allLectures[currentLectureIndex];
          
          generatedSchedules.push({
            id: `generated-${week}-${slotId}`,
            scheduledDate: weekDate.toISOString(),
            slot_id: slotId,
            lecture: lecture,
            course_id: courseId
          });
          
          currentLectureIndex++;
        }
      });
    }

    console.log('Generated schedules:', generatedSchedules);
    setSchedules(generatedSchedules);
  };

  // Check if a lecture is accessible (past date for live courses, or always for recorded)
  const isLectureAccessible = (schedule) => {
    if (courseType !== 'live') {
      return true; // Recorded courses are always accessible
    }
    
    const scheduleDate = new Date(schedule.scheduledDate);
    return scheduleDate <= currentDate;
  };

  // Handle lecture selection
  const handleLectureClick = (schedule) => {
    if (isLectureAccessible(schedule)) {
      // Navigate to lecture or play video
      toast.success(`Opening lecture: ${schedule.lecture?.title || 'Untitled Lecture'}`);
    } else {
      toast.error('This lecture is not yet available');
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading lecture schedule...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="warning">
        <div className="d-flex align-items-center">
          <FaCalendarAlt className="me-2" />
          <span>Unable to load lecture schedule: {error}</span>
        </div>
      </Alert>
    );
  }

  if (schedules.length === 0) {
    return (
      <Alert variant="info">
        <div className="d-flex align-items-center">
          <FaCalendarAlt className="me-2" />
          <span>No lecture schedule available for this course.</span>
        </div>
      </Alert>
    );
  }

  return (
    <Card className="border-0 shadow-sm mb-4">
      <Card.Header className="bg-primary bg-opacity-10 border-0">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <FaCalendarAlt className="me-2" />
            Lecture Schedule
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
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((schedule, index) => {
                const accessible = isLectureAccessible(schedule);
                const slotInfo = timeSlots.find(slot => slot.id.toString() === schedule.slot_id?.toString());

                return (
                  <tr
                    key={schedule.id || index}
                    onClick={() => handleLectureClick(schedule)}
                    style={{ cursor: 'pointer' }}
                    className={accessible ? 'table-hover' : 'text-muted'}
                  >
                    <td>{index + 1}</td>
                    <td>{new Date(schedule.scheduledDate).toLocaleDateString()}</td>
                    <td>{slotInfo?.time || 'Unknown time'}</td>
                    <td>{schedule.lecture?.moduleName || 'Unknown module'}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        {schedule.lecture?.isDemoLecture && (
                          <Badge bg="warning" className="me-2">Demo</Badge>
                        )}
                        {schedule.lecture?.title || 'Untitled Lecture'}
                      </div>
                    </td>
                    <td>
                      {accessible ? (
                        <Badge bg="success" pill>
                          <FaPlay className="me-1" /> Available
                        </Badge>
                      ) : (
                        <Badge bg="secondary" pill>
                          <FaLock className="me-1" /> Locked
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
};

export default LectureScheduleDisplay;
