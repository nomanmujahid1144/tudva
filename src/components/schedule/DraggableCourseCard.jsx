'use client';

import React from 'react';
import { Badge } from 'react-bootstrap';
import { FaGraduationCap, FaLock, FaWifi } from 'react-icons/fa';

const DraggableCourseCard = ({ course, onDragStart, index = 0 }) => {
  // Determine if the course is draggable (only recorded courses are draggable)
  const isDraggable = course.courseType === 'recorded' || course.format === 'recorded';

  // Handle drag start
  const handleDragStart = (e) => {
    if (!isDraggable) {
      e.preventDefault();
      return;
    }

    // Set drag data
    e.dataTransfer.setData('text/plain', JSON.stringify(course));

    // Call the onDragStart callback
    if (onDragStart) {
      onDragStart(course);
    }
  };

  // Calculate progress display
  const progressDisplay = course.progress ||
    (course.completedLectures && course.totalLectures ?
      `${course.completedLectures}/${course.totalLectures}` : null);

  // Determine course type for styling
  const courseType = course.courseType || course.format || 'recorded';

  // Get course color with fallback
  const courseColor = course.color || '#8bc34a';

  return (
    <div
      className={`draggable-course-card ${isDraggable ? 'draggable' : ''}`}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      style={{
        backgroundColor: courseColor,
        marginTop: `${index * 10}px`,
        marginLeft: `${index * 5}px`,
        zIndex: 10 - index,
      }}
    >
      <div className="course-title">
        {course.title}
      </div>

      {progressDisplay && (
        <div className="course-progress">
          {progressDisplay}
        </div>
      )}

      <div className="course-type">
        {courseType === 'live' ? (
          <Badge bg="dark" className="course-badge">
            <FaWifi className="me-1" size={10} />
            LIVE
          </Badge>
        ) : (
          <Badge bg="light" text="dark" className="course-badge">
            <FaGraduationCap className="me-1" size={10} />
            REC
          </Badge>
        )}
      </div>

      {/* Styles moved to external CSS file: /styles/calendar.css */}
    </div>
  );
};

export default DraggableCourseCard;
