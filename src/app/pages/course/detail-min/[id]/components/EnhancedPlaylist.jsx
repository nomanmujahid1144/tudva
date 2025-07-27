"use client";

import { useState, useEffect } from "react";
import { Accordion, AccordionBody, AccordionHeader, AccordionItem, Button, ProgressBar, Spinner } from "react-bootstrap";
import { FaPlay, FaLock } from "react-icons/fa";
import clsx from "clsx";
import { Fragment } from "react";
import LectureAccessIndicator from "@/components/schedule/LectureAccessIndicator";
import { lectureAccessService } from "@/services/enrollmentService";

const EnhancedPlaylist = ({ course, onVideoSelect }) => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [lectureAccessStatus, setLectureAccessStatus] = useState({});
  const [isLoadingAccess, setIsLoadingAccess] = useState(true);

  // Handle video selection
  const handleVideoClick = async (video) => {
    // Only allow selecting accessible videos
    if (lectureAccessStatus[video.id]?.accessible) {
      try {
        // Record lecture access
        await lectureAccessService.recordLectureAccess(video.id);

        // Update selected video
        setSelectedVideo(video);
        if (onVideoSelect) {
          onVideoSelect(video);
        }
      } catch (error) {
        console.error('Error recording lecture access:', error);
        alert('There was an error accessing this lecture. Please try again.');
      }
    } else {
      // Show a message that the lecture is not yet accessible
      alert('This lecture is not yet accessible. It will be available according to the schedule.');
    }
  };

  // Fetch access status for all lectures when course changes
  useEffect(() => {
    if (course && course.modules) {
      fetchLectureAccessStatus();
    }
  }, [course]);

  // Fetch access status for all lectures
  const fetchLectureAccessStatus = async () => {
    setIsLoadingAccess(true);

    const accessStatus = {};
    const lectures = [];

    // Extract all lectures from modules
    Object.entries(course.modules).forEach(([moduleName, videos]) => {
      // Check if videos is an array
      if (Array.isArray(videos)) {
        videos.forEach(video => {
          lectures.push(video);
        });
      }
    });

    // Fetch access status for each lecture
    for (const lecture of lectures) {
      // If it's a demo lecture or already marked as accessible, set it as accessible
      if (lecture.isDemoLecture || lecture.isAccessible) {
        accessStatus[lecture.id] = {
          success: true,
          accessible: true,
          reason: lecture.isDemoLecture ? 'demo_lecture' : 'already_accessible',
          message: lecture.isDemoLecture ? 'This is a demo lecture' : 'This lecture is accessible'
        };
        continue;
      }

      // Skip lectures with demo IDs (they're not real lectures)
      if (typeof lecture.id === 'string' && lecture.id.startsWith('demo-')) {
        accessStatus[lecture.id] = {
          success: true,
          accessible: true,
          reason: 'demo_id',
          message: 'This is a demo lecture'
        };
        continue;
      }

      try {
        // Try to check access status from the API
        const status = await lectureAccessService.checkLectureAccess(lecture.id);
        if (status.success) {
          accessStatus[lecture.id] = status;
        } else {
          console.error(`Error fetching access status for lecture ${lecture.id}:`, status.error);
          // For real lectures with errors, default to inaccessible
          accessStatus[lecture.id] = {
            success: false,
            accessible: false,
            error: true,
            reason: 'api_error',
            message: status.error || 'Error checking lecture access'
          };
        }
      } catch (error) {
        console.error(`Error fetching access status for lecture ${lecture.id}:`, error);
        // For real lectures with errors, default to inaccessible
        accessStatus[lecture.id] = {
          success: false,
          accessible: false,
          error: true,
          reason: 'exception',
          message: error.message || 'Error checking lecture access'
        };
      }
    }

    setLectureAccessStatus(accessStatus);
    setIsLoadingAccess(false);
  };

  // Handle countdown complete
  const handleCountdownComplete = (lectureId) => {
    // Update the access status for this lecture
    setLectureAccessStatus(prev => ({
      ...prev,
      [lectureId]: { ...prev[lectureId], accessible: true }
    }));
  };

  // Early return if no course data
  if (!course || !course.modules) {
    return <div>Loading course content...</div>;
  }

  // Ensure all modules have valid video arrays
  const validModules = {};
  Object.entries(course.modules).forEach(([moduleName, videos]) => {
    // Check if videos is an array
    if (Array.isArray(videos) && videos.length > 0) {
      validModules[moduleName] = videos;
    }
  });

  return (
    <Accordion defaultActiveKey='0' className="accordion-icon accordion-bg-light" id="accordionExample2">
      {Object.entries(validModules).map(([moduleName, videos], moduleIdx) => (
        <AccordionItem
          eventKey={`${moduleIdx}`}
          className={clsx(Object.keys(validModules).length - 1 !== moduleIdx ? "mb-3" : "mb-0")}
          key={moduleIdx}
        >
          <AccordionHeader as='h6' className="font-base" id={`heading-${moduleIdx}`}>
            <div className="fw-bold rounded collapsed d-block">
              <span className="mb-0">{moduleName}</span>
              <span className="small d-block mt-1">({videos.length} Lectures)</span>
            </div>
          </AccordionHeader>
          <AccordionBody className="mt-3">
            <div className="vstack gap-3">
              <div className="overflow-hidden">
                <div className="d-flex justify-content-between">
                  <p className="mb-1 h6">
                    {Array.isArray(videos) ? videos.filter(video => video.watched).length : 0}/{videos.length} Completed
                  </p>
                  <h6 className="mb-1 text-end">
                    {videos.length > 0
                      ? Math.round(((Array.isArray(videos) ? videos.filter(video => video.watched).length : 0) / videos.length) * 100)
                      : 0}%
                  </h6>
                </div>
                <ProgressBar
                  variant="primary"
                  now={videos.length > 0
                    ? Math.round(((Array.isArray(videos) ? videos.filter(video => video.watched).length : 0) / videos.length) * 100)
                    : 0}
                  className="progress-sm bg-opacity-10"
                />
              </div>

              {videos.map((video, idx) => {
                const isAccessible = lectureAccessStatus[video.id]?.accessible;
                const isLoading = isLoadingAccess || !lectureAccessStatus[video.id];

                // Currently selected video
                if (video.id === selectedVideo?.id) {
                  return (
                    <Fragment key={video.id}>
                      <div className="p-2 bg-success bg-opacity-10 rounded-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="position-relative d-flex align-items-center">
                            <Button
                              variant="success"
                              size="sm"
                              className="btn btn-round btn-sm mb-0 stretched-link position-static"
                            >
                              <FaPlay className="me-0" size={11} />
                            </Button>
                            <span className="d-inline-block text-truncate ms-2 mb-0 h6 fw-light w-200px">
                              {video.title}
                            </span>
                          </div>
                          <p className="mb-0 text-truncate">Playing</p>
                        </div>
                      </div>
                    </Fragment>
                  );
                }

                // Accessible video (not selected)
                if (isAccessible) {
                  return (
                    <Fragment key={video.id}>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="position-relative d-flex align-items-center">
                          <Button
                            variant="danger-soft"
                            size="sm"
                            className="btn btn-round mb-0 stretched-link position-static"
                            onClick={() => handleVideoClick(video)}
                            disabled={!video.videoUrl}
                          >
                            <FaPlay className="me-0" size={11} />
                          </Button>
                          <span className="d-inline-block text-truncate ms-2 mb-0 h6 fw-light w-200px">
                            {video.title}
                          </span>
                        </div>
                        <div className="d-flex align-items-center">
                          <p className="mb-0 text-truncate me-2">
                            {video.duration || "10:00"}
                          </p>
                          <LectureAccessIndicator
                            lecture={video}
                            onCountdownComplete={() => handleCountdownComplete(video.id)}
                          />
                        </div>
                      </div>
                    </Fragment>
                  );
                }

                // Loading state
                if (isLoading) {
                  return (
                    <Fragment key={video.id}>
                      <div className="p-2 bg-light rounded-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="position-relative d-flex align-items-center">
                            <Button
                              variant="secondary-soft"
                              size="sm"
                              className="btn btn-round mb-0 position-static"
                              disabled={true}
                            >
                              <Spinner animation="border" size="sm" />
                            </Button>
                            <span className="d-inline-block text-truncate ms-2 mb-0 h6 fw-light w-200px text-muted">
                              {video.title}
                            </span>
                          </div>
                          <p className="mb-0 text-truncate text-muted">
                            {video.duration || "10:00"}
                          </p>
                        </div>
                      </div>
                    </Fragment>
                  );
                }

                // Locked lecture
                return (
                  <Fragment key={video.id}>
                    <div className="p-2 bg-light rounded-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="position-relative d-flex align-items-center">
                          <Button
                            variant="secondary-soft"
                            size="sm"
                            className="btn btn-round mb-0 position-static"
                            disabled={true}
                          >
                            <FaLock className="me-0" size={11} />
                          </Button>
                          <span className="d-inline-block text-truncate ms-2 mb-0 h6 fw-light w-200px text-muted">
                            {video.title}
                          </span>
                        </div>
                        <div className="d-flex align-items-center">
                          <p className="mb-0 text-truncate text-muted me-2">
                            {video.duration || "10:00"}
                          </p>
                          <LectureAccessIndicator
                            lecture={video}
                            onCountdownComplete={() => handleCountdownComplete(video.id)}
                          />
                        </div>
                      </div>
                    </div>
                  </Fragment>
                );
              })}
            </div>
          </AccordionBody>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default EnhancedPlaylist;
