'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageBanner from '../components/banner/PageBanner';
import { Col, Container, Row, Button, Card, Nav, Image, Spinner, Modal } from 'react-bootstrap';
import { FaCalendarAlt, FaClock, FaLock, FaUser, FaCheckCircle, FaPlay, FaUsers, FaCalendarTimes } from 'react-icons/fa';
import liveIcon from '@/assets/images/live-course.png';
import recordedIcon from '@/assets/images/recorded-course.png';
import learningService from '@/services/learningService';
import CountdownTimer from './components/CountdownTimer';
import CourseMaterials from './components/CourseMaterials';
import CourseScheduler from '../student/schedule/components/CourseScheduler';
import DynamicIcon from '../../app/components/courses/DynamicIcons';

const MyLearning = () => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('lessons');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [learningData, setLearningData] = useState({
        nextWednesday: {
            date: '',
            formattedDate: '',
            daysFromNow: 0
        },
        slots: [],
        hasScheduledCourses: false
    });

    // Ready to join state
    const [readyToJoin, setReadyToJoin] = useState({});

    // Video modal state
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);

    // Load next learning day data
    const loadNextLearningDay = async () => {
        try {
            setLoading(true);
            const result = await learningService.getNextLearningDay();

            if (result.success) {
                setLearningData(result.data);

                // Initialize which courses are already ready to join
                const now = new Date();
                const courseDate = new Date(result.data.nextWednesday.date);
                const initialReadyState = {};

                result.data.slots.forEach(slot => {
                    if (slot.isReserved) {
                        // Parse the slot time
                        const [startTime] = slot.time.split(' - ');
                        const [hours, minutes] = startTime.split(':').map(num => parseInt(num, 10));

                        // Set time for this slot on the next Wednesday
                        const slotDateTime = new Date(courseDate);
                        slotDateTime.setHours(hours, minutes, 0, 0);

                        // Check if already past the time
                        initialReadyState[slot.id] = now >= slotDateTime;
                    }
                });

                setReadyToJoin(initialReadyState);
            } else {
                setError(result.error || 'Failed to load learning data');
            }
        } catch (error) {
            console.error('Error loading next learning day:', error);
            setError('Failed to load learning data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle course becoming ready to join
    const handleCountdownComplete = (slotId) => {
        setReadyToJoin(prev => ({
            ...prev,
            [slotId]: true
        }));
    };

    // Handle joining a course
    const handleJoinCourse = (course) => {
        if (course?.type === 'recorded' && course?.videoUrl) {
            // For recorded courses, open video modal
            setSelectedVideo({
                title: course.title,
                moduleTitle: course.moduleTitle,
                url: course.videoUrl,
                videoData: course.videoData,
                courseInfo: course.courseInfo
            });
            setShowVideoModal(true);
        } else if (course?.type === 'live' && course?.joinUrl) {
            // For live courses, navigate to live session
            router.push(course.joinUrl);
        } else if (course?.joinUrl) {
            // Fallback to joinUrl navigation
            router.push(course.joinUrl);
        }
    };

    // Close video modal
    const handleCloseVideoModal = () => {
        setShowVideoModal(false);
        setSelectedVideo(null);
    };

    // Load data on component mount
    useEffect(() => {
        if (activeTab === 'lessons') {
            loadNextLearningDay();
        }
    }, [activeTab]);

    // Handle marking a course as completed
    const handleMarkCompleted = async (itemId) => {
        try {
            const result = await learningService.markItemCompleted(itemId);
            if (result.success) {
                // Reload data to reflect changes
                loadNextLearningDay();
            }
        } catch (error) {
            console.error('Error marking item as completed:', error);
        }
    };

    // Render the active tab content
    const renderTabContent = () => {
        switch (activeTab) {
            case 'scheduler':
                return <CourseScheduler />;
            case 'materials':
                return (
                    <CourseMaterials />
                );
            case 'lessons':
            default:
                return renderNextLessonsContent();
        }
    };

    // Render the Next Lessons tab content
    const renderNextLessonsContent = () => {
        if (loading) {
            return (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3">Loading your next learning day...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            );
        }

        return (
            <div className='border border-primary'>
                {/* Next Learning Day Banner */}
                <Row>
                    <Col xs={12}>
                        <Card className="border-primary mb-4">
                            <Card.Body className="py-3">
                                <h3 className="text-primary mb-0 d-flex align-items-center fs-5">
                                    <FaCalendarAlt className="me-2" />
                                    Wednesday, {learningData.nextWednesday.formattedDate}
                                    {learningData.nextWednesday.daysFromNow > 0 &&
                                        ` (${learningData.nextWednesday.daysFromNow} days from now)`}
                                </h3>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Course Slots Container */}
                <Row>
                    <Col xs={12}>
                        <Card className="border-primary">
                            <Card.Body className="p-3 p-md-4">
                                <Row>
                                    {learningData.slots && learningData.slots.map((slot) => {
                                        const course = slot.course;
                                        const isReserved = slot.isReserved;
                                        const canJoin = isReserved && readyToJoin[slot.id];
                                        const courseType = course?.type || '';
                                        const bgColor = course?.courseInfo?.backgroundColorHex || '#7EAA7E';

                                        return (
                                            <Col xs={12} md={6} lg={4} key={slot.id} className="mb-4">
                                                <Card className={`h-100`}>
                                                    <Card.Header
                                                        className="text-white d-flex justify-content-between align-items-center py-2"
                                                        style={{ backgroundColor: bgColor }}
                                                    >
                                                        <div className='d-flex align-items-center justify-content-center gap-2'>
                                                            <div
                                                                className="text-white lead rounded d-flex align-items-center justify-content-center"
                                                                style={{
                                                                    width: '35px',
                                                                    height: '35px',
                                                                    fontWeight: 'lighter',
                                                                    padding: '2px',
                                                                    backgroundColor: '#4c4c4c',
                                                                    fontSize: '1.6rem'
                                                                }}
                                                            >
                                                                <span
                                                                    className='rounded'
                                                                    style={{
                                                                        border: '2px solid white',
                                                                        width: '100%',
                                                                        height: '100%',
                                                                        display: 'flex',
                                                                        justifyContent: 'center',
                                                                        alignItems: 'center',
                                                                    }}
                                                                >
                                                                    {slot.name.split(' ')[1]}
                                                                </span>
                                                            </div>
                                                            <div className="d-flex align-items-center">
                                                                <FaClock className="me-1" size={14} />
                                                                <small>{slot.time}</small>
                                                            </div>
                                                        </div>
                                                        {slot.course?.courseInfo?.iconUrl && (
                                                            <div className="d-flex align-items-center justify-content-center">
                                                                {/* Check if it's a custom image/URL */}
                                                                {(slot.course.courseInfo.iconUrl.startsWith('/') ||
                                                                    slot.course.courseInfo.iconUrl.startsWith('http') ||
                                                                    slot.course.courseInfo.iconUrl.includes('.png') ||
                                                                    slot.course.courseInfo.iconUrl.includes('.jpg') ||
                                                                    slot.course.courseInfo.iconUrl.includes('.svg')) ? (
                                                                    <img
                                                                        src={slot.course.courseInfo.iconUrl.startsWith('/') ?
                                                                            slot.course.courseInfo.iconUrl :
                                                                            `/assets/custom-icons/${slot.course.courseInfo.iconUrl}`}
                                                                        alt="Course Icon"
                                                                        style={{
                                                                            width: '35px',        // Direct size control
                                                                            height: '35px',       // Direct size control
                                                                            objectFit: 'contain'
                                                                        }}
                                                                        onError={(e) => {
                                                                            // Fallback to default icon if image fails
                                                                            e.target.style.display = 'none';
                                                                            const parent = e.target.parentNode;
                                                                            if (!parent.querySelector('.fallback-icon')) {
                                                                                const fallbackIcon = document.createElement('i');
                                                                                fallbackIcon.className = 'fas fa-book fallback-icon';
                                                                                fallbackIcon.style.fontSize = '35px';
                                                                                parent.appendChild(fallbackIcon);
                                                                            }
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    /* Handle FontAwesome icons */
                                                                    (() => {
                                                                        const iconKey = slot.course.courseInfo.iconUrl.startsWith('icon:') ?
                                                                            slot.course.courseInfo.iconUrl.substring(5) :
                                                                            slot.course.courseInfo.iconUrl;

                                                                        // You'll need to import the specific icons you use
                                                                        const iconMap = {
                                                                            'FaBook': 'fas fa-book',
                                                                            'FaVideo': 'fas fa-video',
                                                                            'FaGraduationCap': 'fas fa-graduation-cap',
                                                                            // Add other icons you use
                                                                        };

                                                                        return (
                                                                            <i
                                                                                className={iconMap[iconKey] || 'fas fa-book'}
                                                                                style={{ fontSize: '35px' }}  // Direct size control
                                                                            />
                                                                        );
                                                                    })()
                                                                )}
                                                            </div>
                                                        )}

                                                    </Card.Header>

                                                    <Card.Body className="d-flex flex-column border border-primary">
                                                        {course ? (
                                                            <>
                                                                <div className="mb-3 flex-grow-1">
                                                                    <h5 className="fs-6 fw-bold mb-2">{course.courseInfo.title}</h5>
                                                                    {course.moduleTitle && (
                                                                        <div className="small mb-2">
                                                                            {course.moduleTitle}
                                                                        </div>
                                                                    )}
                                                                    {course.lessonNumber && course.totalLessons && (
                                                                        <div className="d-flex align-items-center mb-2">
                                                                            <div className="progress flex-grow-1 me-2" style={{ height: '5px' }}>
                                                                                <div
                                                                                    className="progress-bar bg-primary"
                                                                                    role="progressbar"
                                                                                    style={{ width: `${(course.lessonNumber / course.totalLessons) * 100}%` }}
                                                                                    aria-valuenow={course.lessonNumber}
                                                                                    aria-valuemin="0"
                                                                                    aria-valuemax={course.totalLessons}
                                                                                ></div>
                                                                            </div>
                                                                            <small className="text-muted">
                                                                                {course.lessonNumber}/{course.totalLessons}
                                                                            </small>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="d-flex justify-content-between align-items-center mt-auto">
                                                                    {/* Course type icon */}
                                                                    <div className="course-type-icon">
                                                                        <Image
                                                                            src={courseType === 'live' ? liveIcon.src : recordedIcon.src}
                                                                            alt={courseType === 'live' ? "Live Course" : "Recorded Course"}
                                                                            width={45}
                                                                            height={45}
                                                                        />
                                                                    </div>

                                                                    {!course.isCompleted ? (
                                                                        canJoin ? (
                                                                            <Button
                                                                                variant="primary"
                                                                                size="sm"
                                                                                onClick={() => handleJoinCourse(course)}
                                                                                className="d-flex align-items-center"
                                                                            >
                                                                                {courseType === 'live' ? (
                                                                                    <>
                                                                                        <FaUsers className="me-1" size={12} />
                                                                                        Join
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <FaPlay className="me-1" size={12} />
                                                                                        Watch Video
                                                                                    </>
                                                                                )}
                                                                            </Button>
                                                                        ) : (
                                                                            <CountdownTimer
                                                                                targetDate={learningData.nextWednesday.date}
                                                                                slotTime={slot.time}
                                                                                onComplete={() => handleCountdownComplete(slot.id)}
                                                                            />
                                                                        )
                                                                    ) : (
                                                                        <div className="d-flex align-items-center text-primary">
                                                                            <FaCheckCircle className="me-1" />
                                                                            <small>Completed</small>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="text-center py-4 text-muted">
                                                                <p className="mb-2">No course scheduled</p>
                                                                <FaCalendarTimes size={24} />
                                                            </div>
                                                        )}
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        );
                                    })}
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div >
        );
    };

    return (
        <>
            <PageBanner bannerHeadline="my Learning" />

            <Container className="my-4">
                <Row>
                    <Col xs={12}>
                        <p className="text-primary fs-5 mb-4">
                            Via this page you have access to all your courses and learning materials
                        </p>
                    </Col>
                </Row>

                {/* Navigation Tabs - Using Bootstrap Nav */}
                <Row className="mb-4">
                    <Col xs={12}>
                        <Nav className="nav-pills nav-tabs-custom">
                            <Nav.Item>
                                <Button
                                    variant={activeTab === 'lessons' ? 'primary' : 'light'}
                                    className="me-2 px-4 py-2 rounded"
                                    onClick={() => setActiveTab('lessons')}
                                >
                                    my next Lessons
                                </Button>
                            </Nav.Item>
                            <Nav.Item>
                                <Button
                                    variant={activeTab === 'scheduler' ? 'primary' : 'light'}
                                    className="me-2 px-4 py-2 rounded"
                                    onClick={() => setActiveTab('scheduler')}
                                >
                                    my Scheduler
                                </Button>
                            </Nav.Item>
                            <Nav.Item>
                                <Button
                                    variant={activeTab === 'materials' ? 'primary' : 'light'}
                                    className="px-4 py-2 rounded"
                                    onClick={() => setActiveTab('materials')}
                                >
                                    my Materials
                                </Button>
                            </Nav.Item>
                        </Nav>
                    </Col>
                </Row>

                {/* Tab Content */}
                {renderTabContent()}
            </Container>

            {/* Video Modal */}
            <Modal
                show={showVideoModal}
                onHide={handleCloseVideoModal}
                size="xl"
                centered
                backdrop="static"
            >
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="w-100">
                        <div className="d-flex align-items-center">
                            <div
                                className="rounded-circle me-3 d-flex align-items-center justify-content-center"
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    backgroundColor: selectedVideo?.courseInfo?.backgroundColorHex || '#5a975a',
                                    color: 'white'
                                }}
                            >
                                <FaPlay size={16} />
                            </div>
                            <div>
                                <h5 className="mb-0">{selectedVideo?.title}</h5>
                                <small className="text-muted">
                                    {selectedVideo?.moduleTitle} • {selectedVideo?.courseInfo?.title}
                                </small>
                            </div>
                        </div>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0">
                    {selectedVideo?.url && (
                        <div className="ratio ratio-16x9">
                            <video
                                controls
                                className="w-100 h-100"
                                style={{ objectFit: 'contain' }}
                            >
                                <source src={selectedVideo.url} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0 pt-2">
                    <div className="d-flex justify-content-between w-100 align-items-center">
                        <div className="text-muted small">
                            {selectedVideo?.videoData?.duration && (
                                <>Duration: {Math.floor(selectedVideo.videoData.duration / 60)} minutes</>
                            )}
                        </div>
                        <div>
                            <Button
                                variant="success"
                                size="sm"
                                className="me-2"
                                onClick={() => {
                                    handleMarkCompleted(selectedVideo?.itemId);
                                    handleCloseVideoModal();
                                }}
                            >
                                <FaCheckCircle className="me-1" />
                                Mark as Completed
                            </Button>
                            <Button variant="secondary" size="sm" onClick={handleCloseVideoModal}>
                                Close
                            </Button>
                        </div>
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default MyLearning;