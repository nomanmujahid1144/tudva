"use client";

import React from 'react';
import { Col, Container, Row, Badge } from 'react-bootstrap';
import { FaStar, FaUserGraduate, FaSignal } from 'react-icons/fa';
import Image from 'next/image';
import { formatCourseLevel } from '@/utils/textFormatting';
import DynamicIcon from '../../../components/courses/DynamicIcons';
import liveIcon from '@/assets/images/live-course.png';
import recordedIcon from '@/assets/images/recorded-course.png';

const PageIntro = ({ course }) => {
  if (!course) return null;

  const {
    title,
    shortDescription,
    category,
    level,
    type,
    thumbnailUrl,
    iconUrl,
    icon,
    backgroundColorHex,
    stats
  } = course;

  // Format level using the utility function
  const capitalizedLevel = formatCourseLevel(level);

  // Determine icon to display
  const displayIcon = iconUrl || icon || "FaBook";

  return (
    <section className="bg-light py-5">
      <Container>
        <Row className="g-4 align-items-center">
          {/* Course Image or Icon */}
          <Col lg={3} className="position-relative">
            <div className="position-relative h-16 rounded-4 overflow-hidden shadow">
              {thumbnailUrl ? (
                <div className='h-100'>
                  <Image
                    src={thumbnailUrl}
                    alt={title}
                    className="object-fit-cover"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                </div>
              ) : (
                <div
                  className='h-100'
                  style={{ backgroundColor: backgroundColorHex }}
                >
                  <div className='d-flex h-100 justify-content-center align-items-center'>
                    {/* <DynamicIcon iconName={displayIcon} /> */}
                    <img
                      src={displayIcon}
                      alt="Course Icon"
                      style={{ width: '50%', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  </div>
                </div>
              )}
            </div>
          </Col>

          {/* Course details */}
          <Col lg={9}>
            <h1 className="display-5 fw-bold mb-3">{title}</h1>

            <div className="d-flex align-items-start gap-3">
              <Image
                src={type === 'live' ? liveIcon : recordedIcon}
                alt={type === 'live' ? "Live Course" : "Recorded Course"}
                className='me-2'
                width={80}
                height={80}
              />
              <p className="lead mb-4">
                {shortDescription?.substring(0, 150) + (shortDescription?.length > 150 ? '...' : '') || 'No description available'}
              </p>
            </div>

            {/* Course Stats */}
            <div className="d-flex justify-content-between align-items-center">
              <Badge
                bg="primary"
                className="fs-6 px-3 py-2 rounded-pill fw-normal"
              >
                {category}
              </Badge>

              <div className='d-flex flex-wrap gap-3'>
                {stats?.rating !== 0 && (
                  <div className="d-flex align-items-center px-3 py-2 bg-white rounded-3 shadow-sm">
                    <FaStar className="text-warning fs-5 me-2" />
                    <span className="fw-bold">{(stats?.rating || 0).toFixed(1)}/5.0</span>
                  </div>
                )}
                <div className="d-flex align-items-center px-3 py-2 bg-white rounded-3 shadow-sm">
                  <FaUserGraduate className="text-orange fs-5 me-2" />
                  <span className="fw-bold">{stats?.enrollmentCount || 0} Enrolled</span>
                </div>
                <div className="d-flex align-items-center px-3 py-2 bg-white rounded-3 shadow-sm">
                  <FaSignal className="text-success fs-5 me-2" />
                  <span className="fw-bold">{capitalizedLevel}</span>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      <style jsx>{`
        .text-orange {
          color: #fd7e14;
        }
        
        .object-fit-cover {
          object-fit: cover;
        }
      `}</style>
    </section>
  );
};

export default PageIntro;