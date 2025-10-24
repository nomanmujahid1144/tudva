import Image from "next/image";
import { Button, Card, CardBody, Col, Container, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row } from "react-bootstrap";
import { FaBookOpen, FaClock, FaCopy, FaFacebookSquare, FaGlobe, FaGraduationCap, FaLinkedin, FaMedal, FaPlay, FaShareAlt, FaSignal, FaStar, FaStopwatch, FaTwitterSquare, FaUserClock, FaUserGraduate } from "react-icons/fa";
import CourseTab from "./CourseTab";
import avatar5 from '@/assets/images/avatar/05.jpg';
import AllPlayList from "./AllPlayList";
import { useState } from "react";

import EnrollButton from "@/components/enrollment/EnrollButton";
import GlightBox from "@/components/GlightBox";
import { currency } from "@/context/constants";

const CourseDetails = ({ course, onVideoSelect }) => {
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Function to pass to AllPlayList and Playlist to handle video selection
  const handleVideoSelect = (video) => {
    setSelectedVideo(video);
    onVideoSelect(video)

    // console.log(video,"video")
    // You might want to trigger the video player here
    // or pass this up to a parent component
    if (window && typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!course) {
    return <div>Loading course details...</div>;
  }
  // console.log("course in detail",course)
  // Create a pricing card component
  const PricingCard = () => {
    return (
      <Card className="shadow p-2 mb-4 z-index-9">
        <div className="overflow-hidden rounded-3">
          {course?.course?.promo_video_url && (
            <div className="card-img-overlay d-flex align-items-start flex-column p-3">
              <div className="m-auto">
                <GlightBox
                  href={course?.course?.promo_video_url}
                  className="btn btn-lg text-danger btn-round btn-white-shadow mb-0"
                  data-glightbox
                  data-gallery="course-video"
                >
                  <FaPlay />
                </GlightBox>
              </div>
            </div>
          )}
        </div>
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h3 className="fw-bold mb-0">{currency}{course?.course?.price || 0}</h3>
            </div>
          </div>
          <ul className="list-group list-group-borderless">
            <li className="list-group-item d-flex justify-content-between align-items-center">
              <span className="h6 fw-light mb-0"><FaUserClock className="text-primary me-2" />Duration</span>
              <span>{course?.course?.estimatedDuration || '10 hours'}</span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              <span className="h6 fw-light mb-0"><FaBookOpen className="text-primary me-2" />Lectures</span>
              <span>{course?.lectures?.length || 0} lectures</span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              <span className="h6 fw-light mb-0"><FaSignal className="text-primary me-2" />Level</span>
              <span>{course?.course?.level || 'Beginner'}</span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              <span className="h6 fw-light mb-0"><FaGlobe className="text-primary me-2" />Language</span>
              <span>{course?.course?.language || 'English'}</span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              <span className="h6 fw-light mb-0"><FaStopwatch className="text-primary me-2" />Deadline</span>
              <span>No limit</span>
            </li>
            <li className="list-group-item d-flex justify-content-between align-items-center">
              <span className="h6 fw-light mb-0"><FaMedal className="text-primary me-2" />Certificate</span>
              <span>{course?.course?.certificate ? 'Yes' : 'No'}</span>
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

  return <section className="pb-0 py-lg-5">
    <Container>
      <Row>
        <Col lg={8}>
          <CourseTab course={course} />
        </Col>
        <Col lg={4} className="pt-5 pt-lg-0">
          <Row className="mb-5 mb-lg-0">
            <Col md={6} lg={12}>
              <PricingCard />
              <Card className="card-body shadow p-4 mb-4">
                <h4 className="mb-3">Tags</h4>
                <ul className="list-inline mb-0">
                  {course?.tags?.map((tag, id) => (
                    <li className="list-inline-item" key={id}>
                      <Button variant="outline-light" size="sm">{tag.tag_name}</Button>
                    </li>
                  ))}
                </ul>
              </Card>
              <AllPlayList course={course} onVideoSelect={handleVideoSelect} />
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  </section>;
};
export default CourseDetails;
