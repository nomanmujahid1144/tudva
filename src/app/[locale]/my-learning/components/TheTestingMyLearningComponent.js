'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import PageBanner from '../components/banner/PageBanner';
import { Col, Container, Row, Button, Card, Nav, Image, Spinner, Modal } from 'react-bootstrap';
import { FaCalendarAlt, FaClock, FaLock, FaUser, FaCheckCircle, FaPlay, FaUsers } from 'react-icons/fa';
import liveIcon from '@/assets/images/live-course.png';
import recordedIcon from '@/assets/images/recorded-course.png';
import learningService from '@/services/learningService';
import CountdownTimer from './components/CountdownTimer';
import CourseScheduler from '../student/schedule/components/CourseScheduler';
import CourseMaterials from './components/CourseMaterials';

const MyLearning = () => {
    const router = useRouter();
    const t = useTranslations('student.learning');
    const [activeTab, setActiveTab] = useState('lessons');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // TEST MODE - Set this to true for testing
    const [testMode, setTestMode] = useState(true); // Change to false for production

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
    // Load next learning day data
    const loadNextLearningDay = async () => {
        try {
            setLoading(true);
            const result = await learningService.getNextLearningDay();

            if (result.success) {
                let finalData = result.data;

                // If in test mode, modify the data to have near-future times
                if (testMode) {
                    const testData = { ...result.data };

                    // Set the date to current time for testing
                    const now = new Date();
                    testData.nextWednesday.date = now.toISOString();
                    testData.nextWednesday.formattedDate = now.toLocaleDateString();
                    testData.nextWednesday.daysFromNow = 0;

                    // Modify slot times to be just seconds from now
                    testData.slots = testData.slots.map((slot, index) => {
                        if (slot.isReserved) {
                            const testTime = new Date();
                            testTime.setSeconds(testTime.getSeconds() + (index + 1) * 5); // 5, 10, 15 seconds from now

                            const hours = testTime.getHours().toString().padStart(2, '0');
                            const minutes = testTime.getMinutes().toString().padStart(2, '0');
                            const endTime = new Date(testTime);
                            endTime.setMinutes(endTime.getMinutes() + 40);
                            const endHours = endTime.getHours().toString().padStart(2, '0');
                            const endMinutes = endTime.getMinutes().toString().padStart(2, '0');

                            return {
                                ...slot,
                                time: `${hours}:${minutes} - ${endHours}:${endMinutes}`
                            };
                        }
                        return slot;
                    });

                    finalData = testData;
                }

                setLearningData(finalData);

                // Initialize ready state
                const now = new Date();
                const courseDate = new Date(finalData.nextWednesday.date);
                const initialReadyState = {};

                finalData.slots.forEach(slot => {
                    if (slot.isReserved) {
                        const [startTime] = slot.time.split(' - ');
                        const [hours, minutes] = startTime.split(':').map(num => parseInt(num, 10));

                        const slotDateTime = new Date(courseDate);
                        slotDateTime.setHours(hours, minutes, 0, 0);

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
                courseInfo: course.courseInfo,
                itemId: course._id  // ✅ Use _id instead of itemId
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
                return <CourseMaterials />;
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
                    <p className="mt-3">{t('nextLessons.loading')}</p>
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
                                    {testMode ? t('nextLessons.today') : `${t('nextLessons.wednesday')}, ${learningData.nextWednesday.formattedDate}`}
                                    {!testMode && learningData.nextWednesday.daysFromNow > 0 &&
                                        ` (${learningData.nextWednesday.daysFromNow} ${t('nextLessons.daysFromNow')})`}
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
                                        const bgColor = course?.courseInfo?.backgroundColorHex || '#5a975a';

                                        return (
                                            <Col xs={12} md={6} lg={4} key={slot.id} className="mb-4">
                                                <Card className={`h-100 ${!isReserved ? 'bg-light' : ''}`}
                                                    style={{ opacity: isReserved ? 1 : 0.7 }}>
                                                    <Card.Header
                                                        className="text-white d-flex justify-content-between align-items-center py-2"
                                                        style={{ backgroundColor: bgColor }}
                                                    >
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
                                                                            width: '35px',
                                                                            height: '35px',
                                                                            objectFit: 'contain'
                                                                        }}
                                                                        onError={(e) => {
                                                                            e.target.style.display = 'none';
                                                                            const parent = e.target.parentNode;
                                                                            if (!parent.querySelector('.fallback-icon')) {
                                                                                const fallbackIcon = document.createElement('i');
                                                                                fallbackIcon.className = 'fas fa-book fallback-icon';
                                                                                fallbackIcon.style.fontSize = '24px';
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

                                                                        const iconMap = {
                                                                            'FaBook': 'fas fa-book',
                                                                            'FaVideo': 'fas fa-video',
                                                                            'FaGraduationCap': 'fas fa-graduation-cap',
                                                                        };

                                                                        return (
                                                                            <i
                                                                                className={iconMap[iconKey] || 'fas fa-book'}
                                                                                style={{ fontSize: '24px' }}
                                                                            />
                                                                        );
                                                                    })()
                                                                )}
                                                            </div>
                                                        )}
                                                        <div
                                                            className="bg-white rounded-circle d-flex align-items-center justify-content-center"
                                                            style={{
                                                                width: '28px',
                                                                height: '28px',
                                                                fontWeight: 'bold',
                                                                color: bgColor
                                                            }}
                                                        >
                                                            {slot.name.split(' ')[1]}
                                                        </div>
                                                        <div className="d-flex align-items-center">
                                                            <FaClock className="me-1" size={14} />
                                                            <small>{slot.time}</small>
                                                        </div>
                                                    </Card.Header>

                                                    <Card.Body className="d-flex flex-column border border-primary">
                                                        {course ? (
                                                            <>
                                                                <div className="mb-3 flex-grow-1">
                                                                    <h5 className="fs-6 fw-bold mb-2">{course.title}</h5>
                                                                    {course.moduleTitle && (
                                                                        <div className="text-muted small mb-2">
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
                                                                                        {t('nextLessons.join')}
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <FaPlay className="me-1" size={12} />
                                                                                        {t('nextLessons.watchVideo')}
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
                                                                            <small>{t('nextLessons.completed')}</small>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="text-center py-4 text-muted">
                                                                <p className="mb-2">{t('nextLessons.noCourseScheduled')}</p>
                                                                <FaLock size={24} />
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
            </div>
        );
    };

    return (
        <>
            <PageBanner bannerHeadline={t('pageTitle')} />

            <Container className="my-4">
                {/* TEST MODE CONTROLS - Remove in production */}
                {testMode && (
                    <Row className="mb-3">
                        <Col xs={12}>
                            <div className="alert alert-warning d-flex justify-content-between align-items-center">
                                <span>🧪 <strong>{t('testMode.active')}</strong> - {t('testMode.description')}</span>
                                <Button
                                    size="sm"
                                    variant="outline-secondary"
                                    onClick={() => {
                                        setTestMode(false);
                                        loadNextLearningDay(); // Reload with real data
                                    }}
                                >
                                    {t('testMode.disable')}
                                </Button>
                            </div>
                        </Col>
                    </Row>
                )}

                <Row>
                    <Col xs={12}>
                        <p className="text-primary fs-5 mb-4">
                            {t('subtitle')}
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
                                    {t('tabs.nextLessons')}
                                </Button>
                            </Nav.Item>
                            <Nav.Item>
                                <Button
                                    variant={activeTab === 'scheduler' ? 'primary' : 'light'}
                                    className="me-2 px-4 py-2 rounded"
                                    onClick={() => setActiveTab('scheduler')}
                                >
                                    {t('tabs.scheduler')}
                                </Button>
                            </Nav.Item>
                            <Nav.Item>
                                <Button
                                    variant={activeTab === 'materials' ? 'primary' : 'light'}
                                    className="px-4 py-2 rounded"
                                    onClick={() => setActiveTab('materials')}
                                >
                                    {t('tabs.materials')}
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
                                <>{t('videoModal.duration')}: {Math.floor(selectedVideo.videoData.duration / 60)} {t('videoModal.minutes')}</>
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
                                {t('videoModal.markCompleted')}
                            </Button>
                            <Button variant="secondary" size="sm" onClick={handleCloseVideoModal}>
                                {t('videoModal.close')}
                            </Button>
                        </div>
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default MyLearning;