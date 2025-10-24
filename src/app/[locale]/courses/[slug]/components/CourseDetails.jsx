"use client";

import { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContainer,
  TabContent,
  TabPane,
  Button
} from "react-bootstrap";
import {
  FaBookOpen,
  FaClock,
  FaCopy,
  FaGlobe,
  FaShareAlt,
  FaSignal,
  FaUser
} from "react-icons/fa";
import Overview from "./Overview";
import Curriculum from "./Curriculum";
import Instructor from "./Instructor";
import Faqs from "./Faqs";
import Reviews from "./Reviews"; // Import the enhanced Reviews component
import { capitalizeFirstLetter, formatCourseLevel } from "@/utils/textFormatting";
import { formatDuration, calculateCourseDuration } from "@/utils/durationUtils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const PricingCard = ({ course }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [copySuccess, setCopySuccess] = useState(false);

  if (!course) return null;

  // Handle participate button click
  const handleParticipate = () => {
    if (isAuthenticated && user) {
      // User is logged in, redirect to student schedule
      router.push('/student/schedule');
    } else {
      // User is not logged in, show toast and redirect to login
      toast.error("Please login first to participate in this course");

      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push('/auth/sign-in');
      }, 1000);
    }
  };

  // Handle copy link functionality
  const handleCopyLink = async () => {
    try {
      const courseUrl = `${window.location.origin}/courses/${course.slug}`;

      // Try to use the modern clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(courseUrl);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = courseUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }

      setCopySuccess(true);

      // Show success toast
      toast.success("Course URL copied to clipboard!");

      // Reset copy success state after 2 seconds
      setTimeout(() => setCopySuccess(false), 2000);

    } catch (error) {
      console.error('Failed to copy link:', error);

      // Show error toast
      toast.error("Failed to copy course URL. Please try again.");
    }
  };

  return (
    <Card className="shadow p-2 mb-4 z-index-9">
      <div className="overflow-hidden rounded-3 position-relative">
        <div
          className="d-flex justify-content-center align-items-center h-75"
          style={{
            backgroundColor: course?.backgroundColorHex || '#630000',
            color: 'white',
            minHeight: '250px'
          }}
        >
          <img
            src={course?.iconUrl}
            alt="Course Icon"
            style={{
              width: '60%',
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain'
            }}
          />
        </div>
      </div>

      <CardBody className="px-3">
        <div className="d-flex justify-content-between align-items-center">
          <Dropdown>
            <DropdownToggle
              as='a'
              className="btn btn-md position-relative btn-light rounded small arrow-none"
              role="button"
            >
              <FaShareAlt className="fa-fw" />
            </DropdownToggle>
            <DropdownMenu className="dropdown-w-sm position-absolute top-0 start-3 dropdown-menu-end min-w-auto shadow rounded">
              <li>
                <DropdownItem onClick={handleCopyLink}>
                  <FaCopy className={`me-2 ${copySuccess ? 'text-success' : ''}`} />
                  {copySuccess ? 'Copied!' : 'Copy link'}
                </DropdownItem>
              </li>
            </DropdownMenu>
          </Dropdown>
          {isAuthenticated && user.role === 'learner' ? (
            <Button
              className="mb-0"
              onClick={handleParticipate}
              variant="primary"
            >
              Participate
            </Button>
          ) : null}
        </div>
      </CardBody>
    </Card>
  );
};

const CourseIncludesCard = ({ course }) => {
  if (!course) return null;

  // Calculate lecture count and duration based on course type
  let lectureCount = 0;
  let courseDuration = 'N/A';

  if (course.type === 'recorded') {
    // For recorded courses, calculate from modules
    lectureCount = course.modules?.reduce((total, module) =>
      total + (module.videos?.length || 0), 0) || 0;

    // Calculate total duration using utility function
    if (course.modules && course.modules.length > 0) {
      const courseDurationData = calculateCourseDuration(course.modules);
      courseDuration = courseDurationData.formattedDuration;
    }
  } else if (course.type === 'live') {
    // For live courses, get from live course metadata
    lectureCount = course.liveCourseMeta?.plannedLessons || 0;

    // Calculate duration for live courses
    // Assuming each lesson is 40 minutes (2400 seconds) based on your slot times
    const lessonDurationInSeconds = 40 * 60; // 40 minutes per lesson
    const totalDurationInSeconds = lectureCount * lessonDurationInSeconds;
    courseDuration = formatDuration(totalDurationInSeconds);
  }

  return (
    <Card className="card-body shadow p-4 mb-4">
      <h4 className="mb-3">Course Overview</h4>
      <ul className="list-group list-group-borderless">
        <li className="list-group-item d-flex justify-content-between align-items-center">
          <span className="h5 fw-light mb-0">
            <FaBookOpen className="fa-fw text-primary me-1" />Lectures
          </span>
          <span>{lectureCount}</span>
        </li>
        <li className="list-group-item d-flex justify-content-between align-items-center">
          <span className="h5 fw-light mb-0">
            <FaClock className="fa-fw text-primary me-1" />Duration
          </span>
          <span>{courseDuration}</span>
        </li>
        <li className="list-group-item d-flex justify-content-between align-items-center">
          <span className="h5 fw-light mb-0">
            <FaSignal className="fa-fw text-primary me-1" />Level
          </span>
          <span>{formatCourseLevel(course?.level)}</span>
        </li>
        <li className="list-group-item d-flex justify-content-between align-items-center">
          <span className="h5 fw-light mb-0">
            <FaGlobe className="fa-fw text-primary me-1" />Language
          </span>
          <span>{capitalizeFirstLetter(course?.language)}</span>
        </li>
      </ul>
    </Card>
  );
};

const PopularTags = ({ course }) => {
  const courseTags = course?.tags || [];

  if (courseTags.length === 0) return null;

  return (
    <Card className="card-body shadow p-4">
      <h4 className="mb-3">Tags</h4>
      <ul className="list-inline mb-0">
        {courseTags.map((tag, idx) => (
          <li className="list-inline-item" key={idx}>
            <Button variant="outline-light" size="sm">
              {tag}
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
};

const CourseDetails = ({ course }) => {
  const { isAuthenticated, user } = useAuth();
  const isLearner = user?.role === 'learner';
  const showReviews = isAuthenticated && isLearner;

  const [activeTab, setActiveTab] = useState('overview');

  if (!course) return null;

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'curriculum', label: 'Curriculum' },
    { key: 'instructor', label: 'Instructor' },
    // ...(showReviews ? [{ key: 'reviews', label: 'Reviews' }] : []),
    { key: 'reviews', label: 'Reviews' },
    { key: 'faqs', label: 'FAQs' }
  ];

  return (
    <section className="pb-0 py-lg-5">
      <Container>
        <Row>
          {/* Main Course Content */}
          <Col lg={8}>
            <Card className="shadow rounded-2 p-0">
              <TabContainer activeKey={activeTab} onSelect={(key) => setActiveTab(key)}>
                <CardHeader className="border-bottom px-4 py-3">
                  <Nav className="nav-pills nav-tabs-line py-0">
                    {tabs.map((tab) => (
                      <NavItem className="me-2 me-sm-4" key={tab.key}>
                        <NavLink
                          as='button'
                          eventKey={tab.key}
                          className={`mb-2 mb-md-0 ${activeTab === tab.key ? 'active' : ''}`}
                          type="button"
                        >
                          {tab.label}
                        </NavLink>
                      </NavItem>
                    ))}
                  </Nav>
                </CardHeader>

                <CardBody className="p-4">
                  <TabContent className="pt-2">
                    <TabPane
                      eventKey="overview"
                      className={`fade ${activeTab === 'overview' ? 'show active' : ''}`}
                    >
                      <Overview course={course} />
                    </TabPane>
                    <TabPane
                      eventKey="curriculum"
                      className={`fade ${activeTab === 'curriculum' ? 'show active' : ''}`}
                    >
                      <Curriculum course={course} />
                    </TabPane>
                    <TabPane
                      eventKey="instructor"
                      className={`fade ${activeTab === 'instructor' ? 'show active' : ''}`}
                    >
                      <Instructor instructor={course.instructor} />
                    </TabPane>
                    <TabPane
                      eventKey="reviews"
                      className={`fade ${activeTab === 'reviews' ? 'show active' : ''}`}
                    >
                      <Reviews courseId={course._id || course.id} />
                    </TabPane>
                    <TabPane
                      eventKey="faqs"
                      className={`fade ${activeTab === 'faqs' ? 'show active' : ''}`}
                    >
                      <Faqs faqs={course.faqs} />
                    </TabPane>
                  </TabContent>
                </CardBody>
              </TabContainer>
            </Card>
          </Col>

          {/* Sidebar */}
          <Col lg={4} className="pt-5 pt-lg-0">
            <Row className="mb-5 mb-lg-0">
              <Col md={6} lg={12}>
                <PricingCard course={course} />
                <CourseIncludesCard course={course} />
              </Col>
              <Col md={6} lg={12}>
                <PopularTags course={course} />
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default CourseDetails;