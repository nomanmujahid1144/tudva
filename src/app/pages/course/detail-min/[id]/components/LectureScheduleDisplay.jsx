'use client';

import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { FaCalendarAlt, FaClock, FaVideo, FaChalkboardTeacher, FaLock, FaUnlock, FaPlay } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axiosInstance from '@/utils/axiosInstance';

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

  // Fetch lecture schedules
  useEffect(() => {
    const fetchLectureSchedules = async () => {
      if (!courseId) {
        console.log('No course ID provided for lecture schedules');
        generateMockSchedules();
        setIsLoading(false);
        return;
      }

      console.log('Fetching lecture schedules for course ID:', courseId);
      setIsLoading(true);
      setError(null);

      try {
        // Try to fetch from the backend API
        try {
          console.log('Trying to fetch lecture schedules from backend API');
          const response = await axiosInstance.get(`/api/lecture-schedules/${courseId}`);

          if (response.data && response.data.success && response.data.schedules && response.data.schedules.length > 0) {
            console.log('Successfully fetched lecture schedules:', response.data.schedules);
            setSchedules(response.data.schedules);
            setIsLoading(false);
            return;
          } else {
            console.log('Backend API returned empty or invalid schedules:', response.data);
            console.log('Trying file API next...');
          }
        } catch (apiError) {
          console.warn('Error fetching from backend API:', apiError);
        }

        // Try file-based API as fallback
        try {
          console.log('Trying to fetch lecture schedules from file API');
          const fileResponse = await axiosInstance.get(`/api/file-lecture-schedules/${courseId}`);

          if (fileResponse.data && fileResponse.data.success && fileResponse.data.schedules && fileResponse.data.schedules.length > 0) {
            console.log('Successfully fetched lecture schedules from file API:', fileResponse.data.schedules);
            setSchedules(fileResponse.data.schedules);
            setIsLoading(false);
            return;
          } else {
            console.log('File API returned empty or invalid schedules:', fileResponse.data);
            console.log('Trying localStorage next...');
          }
        } catch (fileError) {
          console.warn('Error fetching from file API:', fileError);
        }

        // Try to get course from localStorage to generate schedules
        try {
          console.log('Trying to generate schedules from localStorage course data');
          const courseStr = localStorage.getItem(`course_${courseId}`);
          if (courseStr) {
            const course = JSON.parse(courseStr);

            // Check if course has scheduling data
            if (course.scheduling) {
              console.log('Using scheduling data from localStorage:', course.scheduling);
              generateSchedulesFromCourseData(course);
              return;
            }
          }
        } catch (localStorageError) {
          console.warn('Error accessing localStorage:', localStorageError);
        }

        // If all else fails, generate mock schedules
        console.log('Generating mock schedules as fallback');
        generateMockSchedules();
      } catch (err) {
        console.error('Error with lecture schedules:', err);
        setError(err.message || 'Failed to load lecture schedules');
        // Generate mock schedules as fallback
        generateMockSchedules();
      } finally {
        setIsLoading(false);
      }
    };

    fetchLectureSchedules();
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

    if (courseData.modulesList && Array.isArray(courseData.modulesList) && courseData.modulesList.length > 0) {
      console.log('Using modulesList for schedule generation:', courseData.modulesList);

      // Create a map of module titles for easy lookup
      courseData.modulesList.forEach(module => {
        moduleMap[module.id] = module.title;
      });

      // Get lectures with module names
      if (Array.isArray(courseData.lectures)) {
        allLectures = courseData.lectures.map(lecture => ({
          ...lecture,
          moduleName: lecture.moduleName || moduleMap[lecture.moduleId] || 'Unknown Module'
        }));
      }
    } else {
      // Get lectures from course
      const lectures = courseData.lectures || [];
      const modules = courseData.modules || {};

      // Collect all lectures from modules if available
      if (Object.keys(modules).length > 0) {
        Object.keys(modules).forEach((moduleName, moduleIndex) => {
          const moduleLectures = modules[moduleName];
          if (Array.isArray(moduleLectures)) {
            moduleLectures.forEach((lecture, lectureIndex) => {
              allLectures.push({
                ...lecture,
                moduleName,
                moduleIndex,
                lectureIndex
              });
            });
          }
        });
      } else if (lectures.length > 0) {
        allLectures = lectures;
      } else {
        // Create mock lectures based on modules_count
        const modulesCount = courseData.modules_count || courseData.modulesCount || 4;
        const lecturesPerModule = 3; // Assume 3 lectures per module

        for (let i = 0; i < modulesCount; i++) {
          for (let j = 0; j < lecturesPerModule; j++) {
            allLectures.push({
              id: `lecture-${i}-${j}`,
              title: `Lecture ${j + 1}`,
              moduleName: `Module ${i + 1}`,
              moduleIndex: i,
              lectureIndex: j,
              isDemoLecture: i === 0 && j === 0
            });
          }
        }
      }
    }

    console.log('All lectures for scheduling:', allLectures);

    // Sort lectures by module and then by lecture index
    allLectures.sort((a, b) => {
      // First by module name/number
      const moduleA = a.moduleIndex !== undefined ? a.moduleIndex : a.moduleName;
      const moduleB = b.moduleIndex !== undefined ? b.moduleIndex : b.moduleName;

      if (moduleA !== moduleB) {
        return moduleA < moduleB ? -1 : 1;
      }

      // Then by lecture index/order
      const indexA = a.lectureIndex !== undefined ? a.lectureIndex : a.sortOrder || 0;
      const indexB = b.lectureIndex !== undefined ? b.lectureIndex : b.sortOrder || 0;
      return indexA - indexB;
    });

    // Generate schedules
    const startDate = new Date(scheduleStartDate);
    let currentDate = new Date(startDate);
    let slotIndex = 0;

    for (let i = 0; i < allLectures.length; i++) {
      const lecture = allLectures[i];
      const slotId = selectedSlots[slotIndex];

      generatedSchedules.push({
        id: `schedule-${i}`,
        course_id: courseId,
        lecture_id: lecture.id || `lecture-${i}`,
        slot_id: slotId,
        scheduledDate: new Date(currentDate).toISOString(),
        isRescheduled: false,
        lecture: {
          id: lecture.id || `lecture-${i}`,
          title: lecture.title || lecture.topicName || `Lecture ${i + 1}`,
          moduleName: lecture.moduleName || `Module ${Math.floor(i / 3) + 1}`,
          description: lecture.description || '',
          isDemoLecture: lecture.isDemoLecture || i === 0,
          isAccessible: lecture.isAccessible || i === 0,
          duration: lecture.duration || '45:00'
        }
      });

      // Move to next slot
      slotIndex = (slotIndex + 1) % selectedSlots.length;

      // If we've used all slots for this day, move to next week
      if (slotIndex === 0) {
        currentDate = new Date(currentDate);
        currentDate.setDate(currentDate.getDate() + 7);
      }
    }

    console.log('Generated schedules from course data:', generatedSchedules);
    setSchedules(generatedSchedules);
  };

  // Generate schedules from course data in localStorage if API fails
  const generateMockSchedules = () => {
    try {
      // Try to get course data from localStorage
      const courseStr = localStorage.getItem(`course_${courseId}`);
      if (courseStr) {
        const courseData = JSON.parse(courseStr);
        console.log('Found course in localStorage for schedule generation:', courseData);

        // Check if course has scheduling data
        if (courseData.scheduling) {
          console.log('Using scheduling data from localStorage:', courseData.scheduling);
          return generateSchedulesFromCourseData(courseData);
        }
      }
    } catch (error) {
      console.error('Error accessing localStorage for schedule generation:', error);
    }

    // If we get here, we couldn't generate schedules from real data
    console.error('No schedule data available for this course');
    setError('No schedule data available for this course');
    setSchedules([]);
  };



  // Check if a lecture is accessible
  const isLectureAccessible = (schedule) => {
    if (!schedule) return false;

    // Demo lectures are always accessible
    if (schedule.lecture?.isDemoLecture) return true;

    // For recorded courses, lectures become accessible after their scheduled date
    if (courseType === 'recorded') {
      return new Date(schedule.scheduledDate) <= currentDate;
    }

    // For live courses, lectures are only accessible on their scheduled date
    if (courseType === 'live') {
      const scheduleDate = new Date(schedule.scheduledDate);
      const today = new Date(currentDate);

      return (
        scheduleDate.getDate() === today.getDate() &&
        scheduleDate.getMonth() === today.getMonth() &&
        scheduleDate.getFullYear() === today.getFullYear()
      );
    }

    return false;
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
                      <Badge
                        bg={accessible ? 'success' : 'secondary'}
                        className="d-flex align-items-center"
                      >
                        {accessible ? (
                          <>
                            <FaUnlock className="me-1" /> Available
                          </>
                        ) : (
                          <>
                            <FaLock className="me-1" /> Locked
                          </>
                        )}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </Card.Body>
      <Card.Footer className="bg-light border-0 text-center">
        <small className="text-muted">
          {courseType === 'live' ? (
            'Live lectures are only accessible on their scheduled date.'
          ) : (
            'Recorded lectures become accessible after their scheduled date.'
          )}
        </small>
      </Card.Footer>
    </Card>
  );
};

export default LectureScheduleDisplay;
