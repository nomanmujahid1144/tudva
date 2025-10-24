// "use client";

// import { useState, Fragment, useRef, useEffect } from "react";
// import { Accordion, AccordionBody, AccordionHeader, AccordionItem, Button, Col, Modal, ModalBody, ModalFooter, ModalHeader, Row, Dropdown } from "react-bootstrap";
// import { FaHeadset, FaInstagram, FaLinkedinIn, FaLock, FaPlay, FaRegEnvelope, FaTwitter, FaPause, FaVolumeUp, FaVolumeMute, FaExpand, FaCompress, FaTachometerAlt } from "react-icons/fa";
// import Image from "next/image";
// import clsx from "clsx";
// import { BsPatchCheckFill } from "react-icons/bs";
// import useToggle from "@/hooks/useToggle";
// import { currency } from "@/context/constants";
// import element1 from '@/assets/images/element/01.svg';
// import { format } from 'date-fns';
// import liveIcon from '@/assets/images/live-course.png';
// import { formatDuration, formatVideoTime, calculateCourseDuration, calculateModuleDuration } from '@/utils/durationUtils';

// // Video Player Component
// const VideoPlayer = ({ videoUrl, videoTitle, onClose }) => {
//   const videoRef = useRef(null);
//   const [isPlaying, setIsPlaying] = useState(true);
//   const [isMuted, setIsMuted] = useState(false);
//   const [isFullScreen, setIsFullScreen] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [currentTime, setCurrentTime] = useState('0:00');
//   const [duration, setDuration] = useState('0:00');
//   const [playbackRate, setPlaybackRate] = useState(1);
//   const playerRef = useRef(null);
//   const controlsRef = useRef(null);
//   const [controlsVisible, setControlsVisible] = useState(true);
//   const controlsTimeoutRef = useRef(null);

//   // Available playback speeds
//   const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

//   // Handle video metadata loaded
//   const handleMetadataLoaded = () => {
//     const videoDuration = videoRef.current.duration;
//     setDuration(formatVideoTime(videoDuration));
    
//     // Set initial playback rate after metadata is loaded
//     if (videoRef.current) {
//       videoRef.current.playbackRate = playbackRate;
//     }
//   };

//   // Handle time update
//   const handleTimeUpdate = () => {
//     const video = videoRef.current;
//     if (video) {
//       const currentProgress = (video.currentTime / video.duration) * 100;
//       setProgress(currentProgress);
//       setCurrentTime(formatVideoTime(video.currentTime));
//     }
//   };

//   // Handle play/pause
//   const togglePlay = () => {
//     const video = videoRef.current;
//     if (video.paused) {
//       video.play();
//       setIsPlaying(true);
//     } else {
//       video.pause();
//       setIsPlaying(false);
//     }
//     showControls();
//   };

//   // Handle mute/unmute
//   const toggleMute = () => {
//     const video = videoRef.current;
//     video.muted = !video.muted;
//     setIsMuted(video.muted);
//     showControls();
//   };

//   // Handle fullscreen
//   const toggleFullScreen = () => {
//     if (!document.fullscreenElement) {
//       if (playerRef.current.requestFullscreen) {
//         playerRef.current.requestFullscreen();
//       } else if (playerRef.current.webkitRequestFullscreen) {
//         playerRef.current.webkitRequestFullscreen();
//       } else if (playerRef.current.msRequestFullscreen) {
//         playerRef.current.msRequestFullscreen();
//       }
//       setIsFullScreen(true);
//     } else {
//       if (document.exitFullscreen) {
//         document.exitFullscreen();
//       } else if (document.webkitExitFullscreen) {
//         document.webkitExitFullscreen();
//       } else if (document.msExitFullscreen) {
//         document.msExitFullscreen();
//       }
//       setIsFullScreen(false);
//     }
//     showControls();
//   };

//   // Handle progress bar click
//   const handleProgressClick = (e) => {
//     const video = videoRef.current;
//     const progressBar = e.currentTarget;
//     const rect = progressBar.getBoundingClientRect();
//     const pos = (e.clientX - rect.left) / progressBar.offsetWidth;
//     video.currentTime = pos * video.duration;
//     showControls();
//   };

//   // Handle video end
//   const handleVideoEnd = () => {
//     setIsPlaying(false);
//     showControls(true); // Keep controls visible at the end
//   };

//   // Handle playback rate change
//   const changePlaybackRate = (rate) => {
//     if (videoRef.current) {
//       try {
//         const wasPlaying = !videoRef.current.paused;
//         setPlaybackRate(rate);
//         videoRef.current.playbackRate = rate;
        
//         if (wasPlaying && videoRef.current.paused) {
//           videoRef.current.play()
//             .catch(err => {
//               console.error("Error resuming playback after speed change:", err);
//               setTimeout(() => {
//                 if (videoRef.current && videoRef.current.paused) {
//                   videoRef.current.play()
//                     .catch(e => console.error("Failed second play attempt:", e));
//                 }
//               }, 100);
//             });
//         }
//       } catch (error) {
//         console.error("Error changing playback rate:", error);
//       }
//     }
//     showControls();
//   };

//   // Show/hide controls
//   const showControls = (persist = false) => {
//     setControlsVisible(true);
    
//     if (controlsTimeoutRef.current) {
//       clearTimeout(controlsTimeoutRef.current);
//     }
    
//     if (!persist) {
//       controlsTimeoutRef.current = setTimeout(() => {
//         if (isPlaying) {
//           setControlsVisible(false);
//         }
//       }, 3000);
//     }
//   };

//   // Handle mouse move to show controls
//   const handleMouseMove = () => {
//     showControls();
//   };

//   // Clean up on unmount
//   useEffect(() => {
//     return () => {
//       if (controlsTimeoutRef.current) {
//         clearTimeout(controlsTimeoutRef.current);
//       }
//     };
//   }, []);

//   // Listen for fullscreen change
//   useEffect(() => {
//     const handleFullscreenChange = () => {
//       setIsFullScreen(!!document.fullscreenElement);
//     };

//     document.addEventListener('fullscreenchange', handleFullscreenChange);
//     document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
//     document.addEventListener('mozfullscreenchange', handleFullscreenChange);
//     document.addEventListener('MSFullscreenChange', handleFullscreenChange);

//     return () => {
//       document.removeEventListener('fullscreenchange', handleFullscreenChange);
//       document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
//       document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
//       document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
//     };
//   }, []);

//   return (
//     <div className="video-player-wrapper">
//       <div ref={playerRef} 
//            className="video-player-container"
//            onMouseMove={handleMouseMove}>
//         {/* Video title bar */}
//         <div className="video-title-bar">
//           <h5 className="mb-0">{videoTitle}</h5>
//           <button className="btn-close" onClick={onClose}></button>
//         </div>
        
//         {/* Video element */}
//         <div className="video-container">
//           <video
//             ref={videoRef}
//             src={videoUrl}
//             className="video-element"
//             autoPlay
//             onClick={togglePlay}
//             onLoadedMetadata={handleMetadataLoaded}
//             onTimeUpdate={handleTimeUpdate}
//             onEnded={handleVideoEnd}
//           />
          
//           {/* Video overlay */}
//           <div className="video-overlay" onClick={togglePlay}>
//             {!isPlaying && (
//               <div className="play-overlay">
//                 <FaPlay size={40} />
//               </div>
//             )}
//           </div>
          
//           {/* Video controls */}
//           <div 
//             ref={controlsRef}
//             className={`video-controls ${controlsVisible ? 'visible' : ''}`}
//           >
//             {/* Progress bar */}
//             <div className="progress-container" onClick={handleProgressClick}>
//               <div className="progress-bar" style={{ width: `${progress}%` }}></div>
//             </div>
            
//             <div className="controls-row">
//               {/* Left controls */}
//               <div className="left-controls">
//                 <button className="control-button" onClick={togglePlay}>
//                   {isPlaying ? <FaPause /> : <FaPlay />}
//                 </button>
//                 <span className="time-display">
//                   {currentTime} / {duration}
//                 </span>
//               </div>
              
//               {/* Center controls */}
//               <div className="center-controls">
//                 <Dropdown className="playback-speed-dropdown">
//                   <Dropdown.Toggle variant="link" className="playback-speed-button">
//                     <FaTachometerAlt className="me-1" />
//                     {playbackRate}x
//                   </Dropdown.Toggle>
//                   <Dropdown.Menu>
//                     {playbackSpeeds.map(speed => (
//                       <Dropdown.Item 
//                         key={speed} 
//                         active={playbackRate === speed}
//                         onClick={() => changePlaybackRate(speed)}
//                       >
//                         {speed}x
//                       </Dropdown.Item>
//                     ))}
//                   </Dropdown.Menu>
//                 </Dropdown>
//               </div>
              
//               {/* Right controls */}
//               <div className="right-controls">
//                 <button className="control-button" onClick={toggleMute}>
//                   {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
//                 </button>
//                 <button className="control-button" onClick={toggleFullScreen}>
//                   {isFullScreen ? <FaCompress /> : <FaExpand />}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
      
//       <style jsx>{`
//         .video-player-wrapper {
//           width: 100%;
//           height: 100%;
//           display: flex;
//           flex-direction: column;
//           overflow: hidden;
//         }
        
//         .video-player-container {
//           position: relative;
//           width: 100%;
//           background-color: #000;
//           border-radius: 8px;
//           overflow: hidden;
//           box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
//         }
        
//         .video-title-bar {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           padding: 12px 16px;
//           background-color: #222;
//           color: #fff;
//           border-bottom: 1px solid rgba(255, 255, 255, 0.1);
//         }
        
//         .video-title-bar h5 {
//           color: white;
//           font-size: 1.1rem;
//           font-weight: 600;
//           text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
//         }
        
//         .video-container {
//           position: relative;
//           width: 100%;
//           aspect-ratio: 16/9;
//         }
        
//         .video-element {
//           width: 100%;
//           height: 100%;
//           object-fit: contain;
//           background-color: #000;
//         }
        
//         .video-overlay {
//           position: absolute;
//           top: 0;
//           left: 0;
//           width: 100%;
//           height: 100%;
//           display: flex;
//           justify-content: center;
//           align-items: center;
//           cursor: pointer;
//         }
        
//         .play-overlay {
//           width: 80px;
//           height: 80px;
//           border-radius: 50%;
//           background-color: rgba(0, 0, 0, 0.6);
//           display: flex;
//           justify-content: center;
//           align-items: center;
//           color: white;
//         }
        
//         .video-controls {
//           position: absolute;
//           bottom: 0;
//           left: 0;
//           width: 100%;
//           padding: 10px;
//           background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
//           opacity: 0;
//           transition: opacity 0.3s ease;
//         }
        
//         .video-controls.visible {
//           opacity: 1;
//         }
        
//         .progress-container {
//           width: 100%;
//           height: 5px;
//           background-color: rgba(255, 255, 255, 0.3);
//           border-radius: 5px;
//           margin-bottom: 10px;
//           cursor: pointer;
//           position: relative;
//         }
        
//         .progress-bar {
//           height: 100%;
//           background-color: #ff0000;
//           border-radius: 5px;
//         }
        
//         .controls-row {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//         }
        
//         .left-controls, .right-controls, .center-controls {
//           display: flex;
//           align-items: center;
//           gap: 15px;
//         }
        
//         .time-display {
//           color: #fff;
//           font-size: 14px;
//         }
        
//         .control-button {
//           background: none;
//           border: none;
//           color: white;
//           cursor: pointer;
//           width: 30px;
//           height: 30px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           transition: all 0.2s ease;
//           border-radius: 50%;
//         }
        
//         .control-button:hover {
//           background-color: rgba(255, 255, 255, 0.2);
//         }
        
//         :global(.playback-speed-button) {
//           color: white !important;
//           background: none !important;
//           border: none !important;
//           padding: 0 !important;
//           font-size: 14px;
//           display: flex;
//           align-items: center;
//         }
        
//         :global(.playback-speed-button:focus) {
//           box-shadow: none !important;
//         }
        
//         :global(.playback-speed-button::after) {
//           display: none !important;
//         }
        
//         :global(.playback-speed-dropdown .dropdown-menu) {
//           min-width: 5rem;
//           background-color: rgba(0, 0, 0, 0.8);
//           border: 1px solid rgba(255, 255, 255, 0.1);
//         }
        
//         :global(.playback-speed-dropdown .dropdown-item) {
//           color: white;
//           text-align: center;
//           padding: 0.25rem 0.5rem;
//         }
        
//         :global(.playback-speed-dropdown .dropdown-item:hover) {
//           background-color: rgba(255, 255, 255, 0.1);
//         }
        
//         :global(.playback-speed-dropdown .dropdown-item.active) {
//           background-color: #ff0000;
//         }
//       `}</style>
//     </div>
//   );
// };

// // Component for displaying time slots in a live course
// const LiveCourseSchedule = ({ liveCourseMeta }) => {
//   if (!liveCourseMeta) return null;

//   // Format dates
//   const startDate = liveCourseMeta.startDate ? format(new Date(liveCourseMeta.startDate), 'MMM dd, yyyy') : 'TBD';
//   const endDate = liveCourseMeta.endDate ? format(new Date(liveCourseMeta.endDate), 'MMM dd, yyyy') : 'TBD';
  
//   // Calculate lessons per day
//   const slotsPerDay = liveCourseMeta.timeSlots?.length || 1;
//   const totalLessons = liveCourseMeta.plannedLessons || 0;
  
//   // Get day of week
//   const weekDay = liveCourseMeta.timeSlots && liveCourseMeta.timeSlots[0]?.weekDay 
//     ? liveCourseMeta.timeSlots[0].weekDay.charAt(0).toUpperCase() + liveCourseMeta.timeSlots[0].weekDay.slice(1) 
//     : 'TBD';

//   // Get time slots
//   const timeSlots = liveCourseMeta.timeSlots || [];

//   // Map slot IDs to displayable times
//   const slotTimes = {
//     'slot_1': '9:00 - 9:40',
//     'slot_2': '9:45 - 10:25',
//     'slot_3': '10:45 - 11:25',
//     'slot_4': '11:30 - 12:10',
//     'slot_5': '13:35 - 14:15',
//     'slot_6': '14:20 - 15:00'
//   };

//   return (
//     <div className="live-course-schedule mb-5">
//       <div className="d-flex align-items-center mb-4">
//         <div style={{ width: '48px', height: '48px' }}>
//           <Image 
//             src={liveIcon}
//             alt="Live Course"
//             width={48}
//             height={48}
//           />
//         </div>
//         <h3 className="ms-3 mb-0">Course Schedule</h3>
//       </div>

//       <div className="row mb-4">
//         <div className="col-md-6">
//           <table className="table table-borderless">
//             <tbody>
//               <tr>
//                 <td className="font-weight-normal ps-0" style={{ width: '40%' }}>School day</td>
//                 <td>{weekDay}</td>
//               </tr>
//               <tr>
//                 <td className="font-weight-normal ps-0">Start date</td>
//                 <td>{startDate}</td>
//               </tr>
//               <tr>
//                 <td className="font-weight-normal ps-0">End date</td>
//                 <td>{endDate}</td>
//               </tr>
//               <tr>
//                 <td className="font-weight-normal ps-0">Lessons (daily|total)</td>
//                 <td>
//                   <span className="p-2">{slotsPerDay}</span>|<span className="p-2">{totalLessons}</span>
//                 </td>
//               </tr>
//               <tr>
//                 <td className="font-weight-normal ps-0 align-top">Slots</td>
//                 <td>
//                   {timeSlots.map((slot, index) => (
//                     <div key={slot.slot || index} className="mb-2">
//                       <span className="badge bg-primary me-2">{index + 2}</span>
//                       <span>{slotTimes[slot.slot] || 'Unknown time'}</span>
//                     </div>
//                   ))}
//                 </td>
//               </tr>
//             </tbody>
//           </table>
//         </div>
//       </div>
      
//       <div className="alert alert-warning">
//         <h6 className="mb-1">Important Note:</h6>
//         <p className="mb-0">
//           All live sessions are conducted via our virtual classroom. You will receive access details after enrollment. 
//           Make sure to join 5 minutes before the scheduled time.
//         </p>
//       </div>
//     </div>
//   );
// };

// const Curriculum = ({ course }) => {
//   const { isTrue: isPremiumModalOpen, toggle: togglePremiumModal } = useToggle();
//   const [activeVideo, setActiveVideo] = useState(null);
//   const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  
//   if (!course) return null;

//   // Check if this is a live course
//   const isLiveCourse = course.type === 'live';
  
//   // For live courses, show the live course schedule
//   if (isLiveCourse && course.liveCourseMeta) {
//     return <LiveCourseSchedule liveCourseMeta={course.liveCourseMeta} />;
//   }
  
//   // For recorded courses, show modules and videos
//   const modules = course.modules || [];
  
//   // If no modules are available
//   if (modules.length === 0) {
//     return (
//       <div className="alert alert-info">
//         <h6 className="mb-0">Curriculum is being developed. Please check back later.</h6>
//       </div>
//     );
//   }

//   // Calculate course duration using utility function
//   const courseDurationData = calculateCourseDuration(modules);
//   const { modulesWithDuration, totalDuration, moduleCount, videoCount } = courseDurationData;

//   // Handle video click
//   const handleVideoClick = (video) => {
//     if (video.isPreview) {
//       setActiveVideo(video);
//       setIsVideoModalOpen(true);
//     } else {
//       togglePremiumModal();
//     }
//   };

//   // Close video modal
//   const closeVideoModal = () => {
//     setIsVideoModalOpen(false);
//     setActiveVideo(null);
//   };

//   return (
//     <>
//       <div className="curriculum-header mb-4">
//         <h5>Course Content</h5>
//         <div className="d-flex align-items-center text-muted">
//           <span>{moduleCount} sections</span>
//           <span className="mx-2">•</span>
//           <span>{videoCount} lectures</span>
//           <span className="mx-2">•</span>
//           <span>{formatDuration(totalDuration)} total length</span>
//         </div>
//       </div>

//       <Accordion defaultActiveKey='0' className="accordion-icon accordion-bg-light" id="accordionExample2">
//         {modulesWithDuration.map((module, idx) => {
//           const moduleDurationData = calculateModuleDuration(module);
          
//           return (
//             <AccordionItem 
//               key={idx} 
//               eventKey={`${idx}`} 
//               className={clsx({
//                 "mb-3": modules.length - 1 != idx
//               })}
//             >
//               <AccordionHeader as='h6' className="font-base" id={`heading-${idx}`}>
//                 <div className="d-flex justify-content-between w-100 align-items-center">
//                   <div className="fw-bold">
//                     <span className="me-2 text-secondary">Section {idx + 1}:</span>
//                     {module.title}
//                   </div>
//                   <div className="d-flex align-items-center module-meta">
//                     <span className="badge bg-light text-dark me-3">
//                       {moduleDurationData.formattedDuration}
//                     </span>
//                     <span className="me-3 small d-none d-sm-inline text-muted">
//                       {moduleDurationData.videoCount} {moduleDurationData.videoCount === 1 ? 'lecture' : 'lectures'}
//                     </span>
//                   </div>
//                 </div>
//               </AccordionHeader>
              
//               <AccordionBody className="mt-3">
//                 {module.videos && module.videos.map((video, videoIdx) => {
//                   // Use duration utility for consistent formatting
//                   const videoDuration = video.duration || 60; // Default to 60 seconds
                  
//                   return (
//                     <Fragment key={videoIdx}>
//                       <div className="d-flex justify-content-between align-items-center lecture-item">
//                         {!video.isPreview ? (
//                           <div className="position-relative d-flex align-items-center flex-grow-1">
//                             <div>
//                               <Button 
//                                 variant="danger-soft" 
//                                 size="sm" 
//                                 className="btn-round mb-0 stretched-link position-static flex-centered" 
//                                 onClick={() => handleVideoClick(video)}
//                               >
//                                 <FaPlay className="me-0" size={11} />
//                               </Button>
//                             </div>
//                             <div className="ms-2 d-flex align-items-center flex-grow-1 flex-wrap">
//                               <div className="d-flex align-items-center flex-grow-1">
//                                 <span className="h6 fw-light mb-0 lecture-title">
//                                   {video.title}
//                                 </span>
//                               </div>
//                               <div className="ms-md-auto">
//                                 <span className="badge text-bg-orange ms-2">
//                                   <FaLock className="fa-fw me-1" />Premium
//                                 </span>
//                               </div>
//                             </div>
//                           </div>
//                         ) : (
//                           <div className="position-relative d-flex align-items-center flex-grow-1">
//                             <Button 
//                               variant="success-soft" 
//                               size="sm" 
//                               className="btn-round mb-0 stretched-link position-static"
//                               onClick={() => handleVideoClick(video)}
//                             >
//                               <FaPlay className="me-0" size={11} />
//                             </Button>
//                             <span className="h6 fw-light mb-0 ms-2 lecture-title">
//                               {video.title}
//                             </span>
//                             <span className="badge bg-success ms-2">Preview</span>
//                           </div>
//                         )}
//                         <div className="lecture-duration ms-3">
//                           {formatDuration(videoDuration)}
//                         </div>
//                       </div>
//                       {module.videos.length - 1 != videoIdx && <hr />}
//                     </Fragment>
//                   );
//                 })}
//               </AccordionBody>
//             </AccordionItem>
//           );
//         })}
//       </Accordion>

//       {/* Premium content modal */}
//       <Modal 
//         show={isPremiumModalOpen} 
//         onHide={togglePremiumModal} 
//         className="fade" 
//         size="lg" 
//         centered 
//         id="premiumModal" 
//         tabIndex={-1} 
//         aria-hidden="true"
//       >
//         <ModalHeader className="border-0 bg-transparent" closeButton />
//         <ModalBody className="px-5 pb-5 position-relative overflow-hidden">
//           <figure className="position-absolute bottom-0 end-0 mb-n4 me-n4 d-none d-sm-block">
//             <Image src={element1} alt="element" />
//           </figure>
//           <figure className="position-absolute top-0 end-0 z-index-n1 opacity-2">
//             <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="818.6px" height="235.1px" viewBox="0 0 818.6 235.1">
//               <path className="fill-info" d="M735,226.3c-5.7,0.6-11.5,1.1-17.2,1.7c-66.2,6.8-134.7,13.7-192.6-16.6c-34.6-18.1-61.4-47.9-87.3-76.7 c-21.4-23.8-43.6-48.5-70.2-66.7c-53.2-36.4-121.6-44.8-175.1-48c-13.6-0.8-27.5-1.4-40.9-1.9c-46.9-1.9-95.4-3.9-141.2-16.5 C8.3,1.2,6.2,0.6,4.2,0H0c3.3,1,6.6,2,10,3c46,12.5,94.5,14.6,141.5,16.5c13.4,0.6,27.3,1.1,40.8,1.9 c53.4,3.2,121.5,11.5,174.5,47.7c26.5,18.1,48.6,42.7,70,66.5c26,28.9,52.9,58.8,87.7,76.9c58.3,30.5,127,23.5,193.3,16.7 c5.8-0.6,11.5-1.2,17.2-1.7c26.2-2.6,55-4.2,83.5-2.2v-1.2C790,222,761.2,223.7,735,226.3z" />
//             </svg>
//           </figure>
//           <h2>Get Premium Course in <span className="text-success">{currency}800</span></h2>
//           <p>Prosperous understood Middletons in conviction an uncommonly do. Supposing so be resolving breakfast am or perfectly.</p>
//           <Row className="mb-3 item-collapse">
//             <Col sm={6}>
//               <ul className="list-group list-group-borderless">
//                 <li className="list-group-item text-body"> <BsPatchCheckFill className="text-success" />High quality Curriculum</li>
//                 <li className="list-group-item text-body"> <BsPatchCheckFill className="text-success" />Tuition Assistance</li>
//                 <li className="list-group-item text-body"> <BsPatchCheckFill className="text-success" />Diploma course</li>
//               </ul>
//             </Col>
//             <Col sm={6}>
//               <ul className="list-group list-group-borderless">
//                 <li className="list-group-item text-body"> <BsPatchCheckFill className="text-success" />Intermediate courses</li>
//                 <li className="list-group-item text-body"> <BsPatchCheckFill className="text-success" />Over 200 online courses</li>
//               </ul>
//             </Col>
//           </Row>
//           <Button variant="orange-soft" size="lg">Purchase premium</Button>
//         </ModalBody>
//         <ModalFooter className="d-block bg-info">
//           <div className="d-sm-flex justify-content-sm-between align-items-center text-center text-sm-start">
//             <ul className="list-inline mb-0 social-media-btn mb-2 mb-sm-0">
//               <li className="list-inline-item"> <a className="btn btn-white btn-sm shadow px-2 text-instagram" href="#"><FaInstagram className="fa-fw" /></a> </li>
//               <li className="list-inline-item"> <a className="btn btn-white btn-sm shadow px-2 text-twitter" href="#"><FaTwitter className="fa-fw" /></a> </li>
//               <li className="list-inline-item"> <a className="btn btn-white btn-sm shadow px-2 text-linkedin" href="#"><FaLinkedinIn className="fa-fw" /></a> </li>
//             </ul>
//             <div>
//               <p className="mb-1 small"><a href="#" className="text-white"><FaRegEnvelope className="fa-fw me-2" />example@gmail.com</a></p>
//               <p className="mb-0 small"><a href="#" className="text-white"><FaHeadset className="fa-fw me-2" />123-456-789</a></p>
//             </div>
//           </div>
//         </ModalFooter>
//       </Modal>

//       {/* Video Player Modal */}
//       <Modal
//         show={isVideoModalOpen}
//         onHide={closeVideoModal}
//         size="lg"
//         centered
//         fullscreen="md-down"
//         className="video-modal"
//       >
//         <Modal.Body className="p-0">
//           {activeVideo && (
//             <VideoPlayer
//               videoUrl={activeVideo.url}
//               videoTitle={activeVideo.title}
//               onClose={closeVideoModal}
//             />
//           )}
//         </Modal.Body>
//       </Modal>
      
//       <style jsx>{`
//         .curriculum-header {
//           border-bottom: 1px solid #e5e5e5;
//           padding-bottom: 1rem;
//         }
        
//         .module-meta {
//           font-size: 0.875rem;
//         }
        
//         .lecture-item {
//           padding: 0.5rem 0;
//         }
        
//         .lecture-title {
//           word-break: break-word;
//           font-size: 0.95rem;
//           font-weight: 400;
//         }
        
//         .lecture-duration {
//           font-size: 0.875rem;
//           color: #6c757d;
//           white-space: nowrap;
//         }
        
//         :global(.accordion-header) {
//           padding: 0.75rem 1rem;
//         }
        
//         :global(.accordion-button) {
//           font-weight: 500;
//         }
        
//         :global(.video-modal .modal-content) {
//           background-color: #000;
//           border: none;
//           border-radius: 8px;
//           overflow: hidden;
//         }
        
//         :global(.video-modal .modal-body) {
//           padding: 0;
//         }
//       `}</style>
//     </>
//   );
// };

// export default Curriculum;

"use client";

import { useState, Fragment } from "react";
import { Accordion, AccordionBody, AccordionHeader, AccordionItem, Button } from "react-bootstrap";
import { FaLock } from "react-icons/fa";
import Image from "next/image";
import clsx from "clsx";
import { format } from 'date-fns';
import liveIcon from '@/assets/images/live-course.png';
import { formatDuration, calculateCourseDuration, calculateModuleDuration } from '@/utils/durationUtils';

// Component for displaying time slots in a live course
const LiveCourseSchedule = ({ liveCourseMeta }) => {
  if (!liveCourseMeta) return null;

  // Format dates
  const startDate = liveCourseMeta.startDate ? format(new Date(liveCourseMeta.startDate), 'MMM dd, yyyy') : 'TBD';
  const endDate = liveCourseMeta.endDate ? format(new Date(liveCourseMeta.endDate), 'MMM dd, yyyy') : 'TBD';
  
  // Calculate lessons per day
  const slotsPerDay = liveCourseMeta.timeSlots?.length || 1;
  const totalLessons = liveCourseMeta.plannedLessons || 0;
  
  // Get day of week
  const weekDay = liveCourseMeta.timeSlots && liveCourseMeta.timeSlots[0]?.weekDay 
    ? liveCourseMeta.timeSlots[0].weekDay.charAt(0).toUpperCase() + liveCourseMeta.timeSlots[0].weekDay.slice(1) 
    : 'TBD';

  // Get time slots
  const timeSlots = liveCourseMeta.timeSlots || [];

  // Map slot IDs to displayable times
  const slotTimes = {
    'slot_1': '9:00 - 9:40',
    'slot_2': '9:45 - 10:25',
    'slot_3': '10:45 - 11:25',
    'slot_4': '11:30 - 12:10',
    'slot_5': '13:35 - 14:15',
    'slot_6': '14:20 - 15:00'
  };

  return (
    <div className="live-course-schedule mb-5">
      <div className="d-flex align-items-center mb-4">
        <div style={{ width: '48px', height: '48px' }}>
          <Image 
            src={liveIcon}
            alt="Live Course"
            width={48}
            height={48}
          />
        </div>
        <h3 className="ms-3 mb-0">Course Schedule</h3>
      </div>

      <div className="row mb-4">
        <div className="col-md-6">
          <table className="table table-borderless">
            <tbody>
              <tr>
                <td className="font-weight-normal ps-0" style={{ width: '40%' }}>School day</td>
                <td>{weekDay}</td>
              </tr>
              <tr>
                <td className="font-weight-normal ps-0">Start date</td>
                <td>{startDate}</td>
              </tr>
              <tr>
                <td className="font-weight-normal ps-0">End date</td>
                <td>{endDate}</td>
              </tr>
              <tr>
                <td className="font-weight-normal ps-0">Lessons (daily|total)</td>
                <td>
                  <span className="p-2">{slotsPerDay}</span>|<span className="p-2">{totalLessons}</span>
                </td>
              </tr>
              <tr>
                <td className="font-weight-normal ps-0 align-top">Slots</td>
                <td>
                  {timeSlots.map((slot, index) => (
                    <div key={slot.slot || index} className="mb-2">
                      <span className="badge bg-primary me-2">{index + 2}</span>
                      <span>{slotTimes[slot.slot] || 'Unknown time'}</span>
                    </div>
                  ))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="alert alert-warning">
        <h6 className="mb-1">Important Note:</h6>
        <p className="mb-0">
          All live sessions are conducted via our virtual classroom. You will receive access details after enrollment. 
          Make sure to join 5 minutes before the scheduled time.
        </p>
      </div>
    </div>
  );
};

const Curriculum = ({ course }) => {
  if (!course) return null;

  // Check if this is a live course
  const isLiveCourse = course.type === 'live';
  
  // For live courses, show the live course schedule
  if (isLiveCourse && course.liveCourseMeta) {
    return <LiveCourseSchedule liveCourseMeta={course.liveCourseMeta} />;
  }
  
  // For recorded courses, show modules and videos
  const modules = course.modules || [];
  
  // If no modules are available
  if (modules.length === 0) {
    return (
      <div className="alert alert-info">
        <h6 className="mb-0">Curriculum is being developed. Please check back later.</h6>
      </div>
    );
  }

  // Calculate course duration using utility function
  const courseDurationData = calculateCourseDuration(modules);
  const { modulesWithDuration, totalDuration, moduleCount, videoCount } = courseDurationData;

  // Handle video click - all videos are locked, no action needed
  const handleVideoClick = () => {
    // Videos are locked, no action required
  };

  return (
    <>
      <div className="curriculum-header mb-4">
        <h5>Course Content</h5>
        <div className="d-flex align-items-center text-muted">
          <span>{moduleCount} sections</span>
          <span className="mx-2">•</span>
          <span>{videoCount} lectures</span>
          <span className="mx-2">•</span>
          <span>{formatDuration(totalDuration)} total length</span>
        </div>
      </div>

      <Accordion defaultActiveKey='0' className="accordion-icon accordion-bg-light" id="accordionExample2">
        {modulesWithDuration.map((module, idx) => {
          const moduleDurationData = calculateModuleDuration(module);
          
          return (
            <AccordionItem 
              key={idx} 
              eventKey={`${idx}`} 
              className={clsx({
                "mb-3": modules.length - 1 != idx
              })}
            >
              <AccordionHeader as='h6' className="font-base" id={`heading-${idx}`}>
                <div className="d-flex justify-content-between w-100 align-items-center">
                  <div className="fw-bold">
                    <span className="me-2 text-secondary">Section {idx + 1}:</span>
                    {module.title}
                  </div>
                  <div className="d-flex align-items-center module-meta">
                    <span className="badge bg-light text-dark me-3">
                      {moduleDurationData.formattedDuration}
                    </span>
                    <span className="me-3 small d-none d-sm-inline text-muted">
                      {moduleDurationData.videoCount} {moduleDurationData.videoCount === 1 ? 'lecture' : 'lectures'}
                    </span>
                  </div>
                </div>
              </AccordionHeader>
              
              <AccordionBody className="mt-3">
                {module.videos && module.videos.map((video, videoIdx) => {
                  // Use duration utility for consistent formatting
                  const videoDuration = video.duration || 60; // Default to 60 seconds
                  
                  return (
                    <Fragment key={videoIdx}>
                      <div className="d-flex justify-content-between align-items-center lecture-item">
                        <div className="position-relative d-flex align-items-center flex-grow-1">
                          <div>
                            <Button 
                              variant="primary" 
                              size="sm" 
                              className="btn-round mb-0 flex-centered" 
                              disabled
                            >
                              <FaLock className="me-0" size={11} />
                            </Button>
                          </div>
                          <div className="ms-2 d-flex align-items-center flex-grow-1">
                            <span className="h6 fw-light mb-0 lecture-title">
                              {video.title}
                            </span>
                          </div>
                        </div>
                        <div className="lecture-duration ms-3">
                          {formatDuration(videoDuration)}
                        </div>
                      </div>
                      {module.videos.length - 1 != videoIdx && <hr />}
                    </Fragment>
                  );
                })}
              </AccordionBody>
            </AccordionItem>
          );
        })}
      </Accordion>
      
      <style jsx>{`
        .curriculum-header {
          border-bottom: 1px solid #e5e5e5;
          padding-bottom: 1rem;
        }
        
        .module-meta {
          font-size: 0.875rem;
        }
        
        .lecture-item {
          padding: 0.5rem 0;
        }
        
        .lecture-title {
          word-break: break-word;
          font-size: 0.95rem;
          font-weight: 400;
          color: #495057;
        }
        
        .lecture-duration {
          font-size: 0.875rem;
          color: #6c757d;
          white-space: nowrap;
        }
        
        :global(.accordion-header) {
          padding: 0.75rem 1rem;
        }
        
        :global(.accordion-button) {
          font-weight: 500;
        }
        
        .btn-round {
          border-radius: 50%;
          width: 35px;
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </>
  );
};

export default Curriculum;
