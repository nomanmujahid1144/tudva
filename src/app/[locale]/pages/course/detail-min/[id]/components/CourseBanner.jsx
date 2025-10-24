"use client";

import React from 'react';
import { Container, Row, Col, Badge } from 'react-bootstrap';
import { FaBook, FaGraduationCap, FaUsers, FaClock, FaStar } from 'react-icons/fa';
import * as FaIcons from 'react-icons/fa';

// Create a local DynamicIcon component
const DynamicIcon = ({ iconName, size = 60, color = 'white', fallback }) => {
  // Handle null or undefined iconName
  if (!iconName) {
    console.warn('No icon name provided, using default');
    return fallback || <FaIcons.FaBook size={size} color={color} />;
  }

  // Check if iconName is a file name (ends with .png, .jpg, etc.)
  if (typeof iconName === 'string' && iconName.match(/\.(png|jpg|jpeg|gif|svg)$/i)) {
    // It's an image file, render an img tag
    return (
      <img
        src={`/assets/all icons 96px/${iconName}`}
        alt={iconName.replace(/\.(png|jpg|jpeg|gif|svg)$/i, '')}
        style={{ width: `${size}px`, height: `${size}px`, objectFit: 'contain' }}
        onError={(e) => {
          console.error(`Failed to load icon: ${iconName}`);
          e.target.style.display = 'none';
          // Replace with fallback
          e.target.parentNode.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}"><path d="M12 5.9c1.16 0 2.1.94 2.1 2.1s-.94 2.1-2.1 2.1S9.9 9.16 9.9 8s.94-2.1 2.1-2.1m0 9c2.97 0 6.1 1.46 6.1 2.1v1.1H5.9V17c0-.64 3.13-2.1 6.1-2.1M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 9c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z"/></svg>`;
        }}
      />
    );
  }

  // Try to use Font Awesome icons
  try {
    // Check if iconName is a valid Font Awesome icon name
    const IconComponent = FaIcons[iconName]; // Dynamically get the icon

    if (IconComponent) {
      return <IconComponent size={size} color={color} />;
    }
  } catch (error) {
    console.error('Error rendering Font Awesome icon:', error);
  }

  // If all else fails, use a default icon
  return fallback || <FaIcons.FaBook size={size} color={color} />;
};

const CourseBanner = ({ course }) => {
  // Use course color if available, otherwise use default gradient
  const courseColor = course?.course?.color || '#630000';
  const courseIcon = course?.course?.icon || 'FaBook';

  // Helper function to adjust color brightness
  function adjustColor(color, amount) {
    // If color is null or undefined, return a default
    if (!color) return '#C30010';

    // If color doesn't start with #, assume it's a valid color name and return it
    if (!color.startsWith('#')) return color;

    // Remove # if present
    color = color.replace('#', '');

    // Convert to RGB
    let r = parseInt(color.substring(0, 2), 16);
    let g = parseInt(color.substring(2, 4), 16);
    let b = parseInt(color.substring(4, 6), 16);

    // Adjust each channel
    r = Math.min(255, Math.max(0, r + amount));
    g = Math.min(255, Math.max(0, g + amount));
    b = Math.min(255, Math.max(0, b + amount));

    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  const bgStyle = {
    backgroundImage: `linear-gradient(to right, ${courseColor}, ${adjustColor(courseColor, 30)})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    padding: '60px 0',
    color: 'white',
  };

  return (
    <div style={bgStyle}>
      <Container>
        <Row className="align-items-center">
          <Col lg={2} md={3} className="text-center mb-4 mb-md-0">
            <div className="course-icon-container bg-white bg-opacity-25 rounded-circle p-4 mx-auto" style={{ width: '120px', height: '120px' }}>
              <DynamicIcon
                iconName={courseIcon}
                size={60}
                color="white"
                fallback={<FaBook size={60} color="white" />}
              />
            </div>
          </Col>
          <Col lg={10} md={9}>
            <h1 className="display-5 fw-bold mb-3">{course?.course?.title}</h1>
            <p className="lead mb-4">{course?.course?.short_description}</p>

            <div className="d-flex flex-wrap gap-3 mb-3">
              <Badge bg="light" text="dark" className="fs-6 px-3 py-2">
                <FaGraduationCap className="me-2" />
                {course?.course?.level || 'All Levels'}
              </Badge>

              <Badge bg="light" text="dark" className="fs-6 px-3 py-2">
                <FaUsers className="me-2" />
                {course?.course?.enrolled || 0} Students
              </Badge>

              <Badge bg="light" text="dark" className="fs-6 px-3 py-2">
                <FaClock className="me-2" />
                {course?.course?.estimatedDuration || '10 hours'}
              </Badge>

              {course?.course?.reviewCount > 0 ? (
                <Badge bg="light" text="dark" className="fs-6 px-3 py-2">
                  <FaStar className="me-2" />
                  {course?.course?.averageRating || 0} ({course?.course?.reviewCount || 0} reviews)
                </Badge>
              ) : null}
            </div>

            <div className="mt-3">
              <div className="d-flex align-items-center">
                <div className="avatar avatar-lg me-3">
                  <img
                    className="avatar-img rounded-circle"
                      // Default placeholder image for profile
                    src={course?.course?.instructor?.profilePicture || '/assets/images/avatar/placeholder.svg'}
                    alt="instructor avatar"
                    width={60}
                    height={60}
                  />
                </div>
                <div>
                  <h6 className="mb-0 text-white">Instructor: {course?.course?.instructor?.fullName || 'Instructor Name'}</h6>
                  <p className="mb-0 small text-white-50">{course?.course?.instructor?.aboutMe || 'Course Instructor'}</p>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CourseBanner;
