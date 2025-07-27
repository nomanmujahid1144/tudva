"use client";

import Image from "next/image";
import { Button, Card, CardBody, Col, Container, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row } from "react-bootstrap";
import { FaBookOpen, FaClock, FaCopy, FaFacebookSquare, FaGlobe, FaGraduationCap, FaLinkedin, FaMedal, FaPlay, FaShareAlt, FaSignal, FaStar, FaStopwatch, FaTwitterSquare, FaUserClock, FaUserGraduate } from "react-icons/fa";
import { useState } from "react";
import GlightBox from "@/components/GlightBox";
import { currency } from "@/context/constants";
import CourseTab from "./CourseTab";
import AllPlayList from "./AllPlayList";

const CourseDetails = ({ course, onVideoSelect, selectedVideo }) => {
  console.log('Course data in CourseDetails:', course);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleVideoSelect = (video) => {
    console.log('Video selected in CourseDetails:', video);
    if (onVideoSelect && video && video.videoUrl) {
      onVideoSelect(video);
    }
  };

  // Create a pricing card component
  const PricingCard = () => {
    return (
      <Card className="shadow p-0 mb-4 z-index-9">
        {/* <div className="d-flex justify-content-between align-items-center p-3 bg-primary bg-opacity-10 border-bottom">
          <h4 className="mb-0 text-primary">Course Price</h4>
          <h3 className="mb-0 fw-bold">{currency}{course?.course?.price || 0}</h3>
        </div> */}
        <CardBody className="px-3 pt-3">

          <ul className="list-group list-group-borderless mb-3">
            <li className="list-group-item d-flex justify-content-between align-items-center">
              <span className="h6 fw-light mb-0">
                <FaUserClock className="text-primary me-2" />
                Duration
              </span>
              <span>{course?.course?.estimatedDuration || '10 hours'}</span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              <span className="h6 fw-light mb-0">
                <FaSignal className="text-primary me-2" />
                Level
              </span>
              <span>{course?.course?.level || 'Beginner'}</span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              <span className="h6 fw-light mb-0">
                <FaUserGraduate className="text-primary me-2" />
                Instructor
              </span>
              <span>{course?.course?.instructor?.fullName || 'Instructor'}</span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              <span className="h6 fw-light mb-0">
                <FaGlobe className="text-primary me-2" />
                Language
              </span>
              <span>{course?.course?.language || 'English'}</span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              <span className="h6 fw-light mb-0">
                <FaBookOpen className="text-primary me-2" />
                Lectures
              </span>
              <span>{course?.lectures?.length || 0} lectures</span>
            </li>
          </ul>
        </CardBody>
        <CardBody className="pt-0">
          <div className="d-grid gap-2">
            <Button
              variant="primary"
              size="lg"
              className="mb-0"
              onClick={() => {
                // Check if user is logged in
                const isLoggedIn = localStorage.getItem('token');
                if (!isLoggedIn) {
                  // Redirect to login page
                  window.location.href = '/auth/sign-in';
                  return;
                }

                // Show enrollment confirmation
                if (window.confirm('Are you sure you want to enroll in this course?')) {
                  // Call enrollment API
                  fetch('/api/file-booking', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      course_id: course?.course?.id,
                    }),
                  })
                    .then(response => response.json())
                    .then(data => {
                      if (data.success) {
                        alert('You have successfully enrolled in this course!');
                      } else {
                        alert(data.error || 'Failed to enroll in course. Please try again.');
                      }
                    })
                    .catch(error => {
                      console.error('Error enrolling in course:', error);
                      alert('Failed to enroll in course. Please try again.');
                    });
                }
              }}
            >
              <FaGraduationCap className="me-2" />
              Enroll Now
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  };

  return (
    <section className="pb-0 py-lg-5">
      <Container>
        <Row className="g-4">
          <Col lg={8}>
            <CourseTab course={course} />
          </Col>
          <Col lg={4}>
            <div className="position-sticky" style={{ top: '100px' }}>
              <Row className="g-4">
                <Col xs={12}>
                  <PricingCard />
                </Col>
                <Col xs={12}>
                  <Card className="shadow p-0 mb-4">
                    <div className="d-flex align-items-center p-3 bg-primary bg-opacity-10 border-bottom">
                      <h4 className="mb-0 text-primary">Tags</h4>
                    </div>
                    <CardBody className="p-3">
                      <ul className="list-inline mb-0">
                        {course?.tags?.map((tag, id) => (
                          <li className="list-inline-item" key={id}>
                            <Button variant="outline-primary" size="sm" className="mb-2">{tag.tag_name}</Button>
                          </li>
                        ))}
                        {(!course?.tags || course?.tags?.length === 0) && (
                          <p className="text-muted mb-0">No tags available for this course</p>
                        )}
                      </ul>
                    </CardBody>
                  </Card>
                </Col>
                <Col xs={12}>
                  <AllPlayList course={course} onVideoSelect={handleVideoSelect} selectedVideo={selectedVideo} />
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default CourseDetails;
