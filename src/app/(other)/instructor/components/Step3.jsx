// 'use client';
// import React, { useState, useEffect } from 'react';
// import { Button, Row, Form, ProgressBar, Accordion, Spinner, Card, Badge, Col, Alert, Modal } from 'react-bootstrap';
// import { FaPlay, FaEdit, FaTimes, FaPlus, FaExclamationTriangle, FaInfoCircle, FaVideo, FaEye, FaFileAlt, FaUpload, FaClock, FaCheck, FaDownload, FaEllipsisV, FaTrash } from 'react-icons/fa';
// import { toast } from 'sonner';
// import { useCourseContext } from '@/context/CourseContext';
// import SlidePanel from '../../../components/side-panel/SlidePanel';
// import ConfirmDialog from '../../../components/dialog/ConfirmDialog';
// import Image from 'next/image';
// import liveIcon from '../../../../assets/images/live-course.png';

// // Enhanced Circle Progress Component (from original)
// const CircleProgress = ({ progress, size = 40, strokeWidth = 4, color = 'primary' }) => {
//   const radius = (size - strokeWidth) / 2;
//   const circumference = radius * 2 * Math.PI;
//   const offset = circumference - (progress / 100) * circumference;

//   const getStrokeColor = () => {
//     const colors = {
//       danger: '#dc3545',
//       warning: '#ffc107',
//       info: '#0dcaf0',
//       primary: '#0d6efd',
//       success: '#198754'
//     };
//     return colors[color] || colors.primary;
//   };

//   return (
//     <div className="position-relative" style={{ width: size, height: size }}>
//       <svg width={size} height={size} className="position-absolute top-0 start-0">
//         <circle
//           stroke="#f0f0f0"
//           fill="transparent"
//           strokeWidth={strokeWidth}
//           r={radius}
//           cx={size / 2}
//           cy={size / 2}
//         />
//         <circle
//           stroke={getStrokeColor()}
//           fill="transparent"
//           strokeWidth={strokeWidth}
//           strokeDasharray={circumference}
//           strokeDashoffset={offset}
//           r={radius}
//           cx={size / 2}
//           cy={size / 2}
//           strokeLinecap="round"
//           style={{
//             transition: 'stroke-dashoffset 0.3s ease, stroke 0.3s ease',
//             transform: 'rotate(-90deg)',
//             transformOrigin: '50% 50%'
//           }}
//         />
//       </svg>
//       <div
//         className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
//         style={{ fontSize: size / 3.5, fontWeight: 'bold', color: getStrokeColor() }}
//       >
//         {progress}%
//       </div>
//     </div>
//   );
// };

// // Format seconds to MM:SS (from original)
// const formatDuration = (seconds) => {
//   if (!seconds) return '0:00';
//   const mins = Math.floor(seconds / 60);
//   const secs = Math.floor(seconds % 60);
//   return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
// };

// // ENHANCED: File Preview Card Component
// const FilePreviewCard = ({ fileInfo, onRemove, onView, onDownload }) => {
//   const [showActions, setShowActions] = useState(false);

//   const formatFileSize = (bytes) => {
//     if (bytes === 0) return '0 Bytes';
//     const k = 1024;
//     const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
//   };

//   return (
//     <div className="file-preview-card position-relative border rounded p-2 mb-2 bg-light">
//       <div className="d-flex align-items-center">
//         {/* File Preview/Icon */}
//         <div className="file-preview-thumbnail me-3 flex-shrink-0">
//           {fileInfo.preview ? (
//             <img
//               src={fileInfo.preview}
//               alt={fileInfo.name}
//               className="rounded"
//               style={{ width: '48px', height: '48px', objectFit: 'cover' }}
//             />
//           ) : (
//             <div
//               className="d-flex align-items-center justify-content-center rounded bg-secondary bg-opacity-25"
//               style={{ width: '48px', height: '48px', fontSize: '24px' }}
//             >
//               {fileInfo.icon || '📁'}
//             </div>
//           )}
//         </div>

//         {/* File Info */}
//         <div className="flex-grow-1 min-width-0">
//           <div className="fw-bold text-truncate" title={fileInfo.name}>
//             {fileInfo.name}
//           </div>
//           <div className="small text-muted">
//             {formatFileSize(fileInfo.size)}
//             {fileInfo.uploadProgress !== undefined && (
//               <span className="ms-2 text-primary">
//                 {fileInfo.uploadProgress}% uploaded
//               </span>
//             )}
//           </div>
//           {fileInfo.url && (
//             <div className="small text-success">
//               <FaCheck className="me-1" size={10} />
//               Uploaded successfully
//             </div>
//           )}
//         </div>

//         {/* Actions Dropdown */}
//         <div className="file-actions position-relative">
//           <Button
//             variant="outline-secondary"
//             size="sm"
//             className="p-1"
//             onClick={() => setShowActions(!showActions)}
//           >
//             <FaEllipsisV size={12} />
//           </Button>

//           {showActions && (
//             <div className="dropdown-menu show position-absolute end-0 shadow">
//               {fileInfo.url && (
//                 <>
//                   <button
//                     className="dropdown-item d-flex align-items-center"
//                     onClick={() => {
//                       onView && onView(fileInfo);
//                       setShowActions(false);
//                     }}
//                   >
//                     <FaEye className="me-2" size={12} />
//                     View File
//                   </button>
//                   <button
//                     className="dropdown-item d-flex align-items-center"
//                     onClick={() => {
//                       onDownload && onDownload(fileInfo);
//                       setShowActions(false);
//                     }}
//                   >
//                     <FaDownload className="me-2" size={12} />
//                     Download
//                   </button>
//                   <div className="dropdown-divider"></div>
//                 </>
//               )}
//               <button
//                 className="dropdown-item d-flex align-items-center text-danger"
//                 onClick={() => {
//                   onRemove && onRemove(fileInfo);
//                   setShowActions(false);
//                 }}
//               >
//                 <FaTrash className="me-2" size={12} />
//                 Remove
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Upload Progress Bar */}
//       {fileInfo.uploadProgress !== undefined && fileInfo.uploadProgress < 100 && (
//         <div className="mt-2">
//           <ProgressBar
//             now={fileInfo.uploadProgress}
//             style={{ height: '4px' }}
//             variant="primary"
//             animated
//           />
//         </div>
//       )}

//       {/* Click overlay to close actions */}
//       {showActions && (
//         <div
//           className="position-fixed top-0 start-0 w-100 h-100"
//           style={{ zIndex: 999 }}
//           onClick={() => setShowActions(false)}
//         />
//       )}
//     </div>
//   );
// };

// // Video Player Modal Component (from original)
// const VideoPlayerModal = ({ show, onHide, videoUrl, videoTitle }) => {
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(false);

//   useEffect(() => {
//     if (show) {
//       setLoading(true);
//       setError(false);
//     }
//   }, [show, videoUrl]);

//   const handleVideoLoad = () => {
//     setLoading(false);
//   };

//   const handleVideoError = () => {
//     setLoading(false);
//     setError(true);
//   };

//   return (
//     <Modal show={show} onHide={onHide} size="lg" centered className="video-player-modal">
//       <Modal.Header closeButton>
//         <Modal.Title>
//           <FaPlay className="me-2" />
//           {videoTitle}
//         </Modal.Title>
//       </Modal.Header>
//       <Modal.Body className="p-0">
//         <div className="video-container position-relative" style={{ aspectRatio: '16/9', backgroundColor: '#000' }}>
//           {loading && (
//             <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
//               <div className="text-center text-white">
//                 <Spinner animation="border" variant="light" className="mb-2" />
//                 <div>Loading video...</div>
//               </div>
//             </div>
//           )}

//           {error && (
//             <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
//               <div className="text-center text-white">
//                 <FaExclamationTriangle size={40} className="mb-2" />
//                 <div>Failed to load video</div>
//                 <small className="text-muted">Please try again later</small>
//               </div>
//             </div>
//           )}

//           {videoUrl && !error && (
//             <video
//               controls
//               autoPlay
//               className="w-100 h-100"
//               style={{ objectFit: 'contain' }}
//               onLoadedData={handleVideoLoad}
//               onError={handleVideoError}
//             >
//               <source src={videoUrl} type="video/mp4" />
//               Your browser does not support the video tag.
//             </video>
//           )}
//         </div>
//       </Modal.Body>
//     </Modal>
//   );
// };

// // Enhanced Video Preview Card Component with all original logic
// const VideoPreviewCard = ({ video, onEdit, onDelete, moduleIndex, videoIndex }) => {
//   const [showPlayer, setShowPlayer] = useState(false);

//   // Keep original status logic
//   const isProcessing = video.status === 'processing' || video.isProcessing;
//   const isUploading = video.status === 'uploading' && video.progress < 90;
//   const isFailed = video.status === 'failed';
//   const isCompleted = video.status === 'completed' ||
//     (!video.status && video.url && !video.url.includes('temp-')) ||
//     (video.progress === 100 && video.url && !video.url.includes('temp-'));

//   const progress = video.progress || 0;

//   const isPlayable = isCompleted && video.url &&
//     !video.url.includes('temp-') &&
//     !video.url.includes('/api/course/upload/finalize/');

//   // ENHANCED: Get all materials (matches your Course model structure)
//   const getAllMaterials = () => {
//     const materials = [];

//     // New multiple materials format (matches videoMaterialSchema)
//     if (video.materials && Array.isArray(video.materials)) {
//       materials.push(...video.materials.map(material => ({
//         name: material.name,
//         url: material.url,
//         size: material.size,
//         type: material.type,
//         uploadedAt: material.uploadedAt
//       })));
//     }

//     // Legacy single material support (for backward compatibility)
//     if (video.materialUrl && !materials.some(m => m.url === video.materialUrl)) {
//       materials.push({
//         name: video.materialName || 'Course Material',
//         url: video.materialUrl,
//         size: video.materialSize || 0,
//         type: video.materialType || 'application/octet-stream'
//       });
//     }

//     return materials;
//   };

//   const materials = getAllMaterials();

//   // Format file size helper
//   const formatFileSize = (bytes) => {
//     if (!bytes || bytes === 0) return '0 Bytes';
//     const k = 1024;
//     const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
//   };

//   // Get material file icon (matches your schema)
//   const getMaterialIcon = (materialName) => {
//     if (!materialName) return '📁';
//     const extension = materialName.split('.').pop()?.toLowerCase();
//     const iconMap = {
//       'pdf': '📄',
//       'doc': '📝', 'docx': '📝',
//       'ppt': '📊', 'pptx': '📊',
//       'txt': '📃',
//       'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️'
//     };
//     return iconMap[extension] || '📁';
//   };

//   // Download material file (matches your schema structure)
//   const downloadMaterial = (material) => {
//     if (material.url) {
//       const link = document.createElement('a');
//       link.href = material.url;
//       link.download = material.name || 'download';
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     }
//   };

//   // Preview material file
//   const previewMaterial = (material) => {
//     if (material.url) {
//       window.open(material.url, '_blank');
//     }
//   };

//   const getStatusColor = () => {
//     if (isFailed) return 'danger';
//     if (isProcessing) return 'info';
//     if (isUploading) return 'warning';
//     if (isCompleted) return 'success';
//     return 'secondary';
//   };

//   const getDetailedStatusText = () => {
//     if (isFailed) return 'Upload Failed - Please try again';

//     if (isProcessing) {
//       const phase = video.phase || 'Processing video...';
//       const processingStep = video.processingStep || 'processing';

//       const phaseDescriptions = {
//         'combining': `Combining video chunks... ${progress}%`,
//         'uploading': `Uploading to cloud storage... ${progress}%`,
//         'transferring': `Transferring to cloud storage... ${progress}%`,
//         'finalizing': `Finalizing upload... ${progress}%`,
//         'completed': 'Processing completed successfully!'
//       };

//       return phaseDescriptions[processingStep] || `${phase} ${progress}%`;
//     }

//     if (isUploading) {
//       return `Uploading chunk ${video.currentChunk || 1}/${video.totalChunks || 1}... ${progress}%`;
//     }

//     if (isCompleted) return '';
//     return 'Waiting to start upload';
//   };

//   const handlePlayClick = () => {
//     if (isPlayable) {
//       setShowPlayer(true);
//     }
//   };

//   const getProgressIndicator = () => {
//     if (isCompleted) {
//       return (
//         <div className="position-absolute bottom-0 end-0 m-1">
//           <Badge bg="success" className="rounded-circle p-1">
//             <FaCheck size={12} />
//           </Badge>
//         </div>
//       );
//     }

//     if (isProcessing || isUploading) {
//       const displayProgress = isProcessing ? Math.min(Math.max(progress, 90), 99) : progress;

//       return (
//         <div className="position-absolute bottom-0 end-0 m-1">
//           <CircleProgress
//             progress={displayProgress}
//             size={24}
//             strokeWidth={3}
//             color={isProcessing ? 'info' : 'warning'}
//           />
//         </div>
//       );
//     }

//     if (isFailed) {
//       return (
//         <div className="position-absolute bottom-0 end-0 m-1">
//           <Badge bg="danger" className="rounded-circle p-1">
//             <FaExclamationTriangle size={12} />
//           </Badge>
//         </div>
//       );
//     }

//     return null;
//   };

//   const getProcessingOverlay = () => {
//     if (isUploading || isProcessing) {
//       return (
//         <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center">
//           <div className="text-center text-white">
//             {isProcessing ? (
//               <div className="d-flex flex-column align-items-center">
//                 <Spinner animation="border" size="sm" variant="light" className="mb-1" />
//                 <div className="small">{Math.min(Math.max(progress, 90), 99)}%</div>
//                 <div className="x-small">
//                   {video.processingStep === 'combining' ? 'Combining...' :
//                     video.processingStep === 'uploading' ? 'Uploading...' :
//                       video.processingStep === 'transferring' ? 'Transferring...' :
//                         video.processingStep === 'finalizing' ? 'Finalizing...' :
//                           'Processing...'}
//                 </div>
//               </div>
//             ) : (
//               <div className="d-flex flex-column align-items-center">
//                 <CircleProgress progress={progress} size={30} color="warning" />
//                 <div className="x-small mt-1">Uploading...</div>
//               </div>
//             )}
//           </div>
//         </div>
//       );
//     }
//     return null;
//   };

//   return (
//     <>
//       <Card className={`mb-3 shadow-sm border-0 video-card ${isUploading ? 'uploading border-warning' :
//         isProcessing ? 'processing border-info' :
//           isFailed ? 'failed border-danger' :
//             isCompleted ? 'completed border-success' : ''
//         }`}>
//         <div className="d-flex align-items-start p-3">
//           {/* Video Thumbnail with Play Button */}
//           <div
//             className={`video-thumbnail-container me-3 flex-shrink-0 rounded overflow-hidden position-relative ${isPlayable ? 'playable' : ''}`}
//             style={{
//               width: '120px',
//               height: '68px',
//               backgroundColor: '#f0f0f0',
//               cursor: isPlayable ? 'pointer' : 'default'
//             }}
//             onClick={handlePlayClick}
//           >
//             {video.thumbnailUrl ? (
//               <img
//                 src={video.thumbnailUrl}
//                 alt={video.title}
//                 className="w-100 h-100 object-fit-cover"
//               />
//             ) : (
//               <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-light">
//                 <FaVideo size={24} className="text-secondary" />
//               </div>
//             )}

//             {/* Play Button Overlay for Completed Videos */}
//             {isPlayable && (
//               <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-25 opacity-0 hover-opacity-100 transition-opacity">
//                 <div className="bg-primary rounded-circle p-2 text-white d-flex">
//                   <FaPlay size={20} />
//                 </div>
//               </div>
//             )}

//             {/* Processing/Upload Overlay */}
//             {getProcessingOverlay()}

//             {/* Failed Upload Overlay */}
//             {isFailed && (
//               <div className="position-absolute top-0 start-0 w-100 h-100 bg-danger bg-opacity-75 d-flex align-items-center justify-content-center">
//                 <div className="text-center text-white">
//                   <FaExclamationTriangle size={20} />
//                   <div className="small">Failed</div>
//                 </div>
//               </div>
//             )}

//             {/* Duration Badge */}
//             {video.duration > 0 && (
//               <div className="position-absolute bottom-0 start-0 m-1">
//                 <Badge bg="dark" className="rounded-pill opacity-75">
//                   <FaClock className="me-1" size={10} />
//                   {formatDuration(video.duration)}
//                 </Badge>
//               </div>
//             )}

//             {/* Progress Indicator */}
//             {getProgressIndicator()}
//           </div>

//           {/* Video Details */}
//           <div className="flex-grow-1">
//             <div className="d-flex justify-content-between">
//               <div className="flex-grow-1">
//                 <h6 className="mb-1 d-flex align-items-center">
//                   {video.title}
//                 </h6>

//                 {video.description && (
//                   <p className="text-muted small mb-1">{video.description}</p>
//                 )}

//                 {/* Enhanced Progress Information */}
//                 <div className="small mb-2">
//                   <span className={`fw-bold ${isCompleted ? 'text-success' :
//                     isProcessing ? 'text-info' :
//                       isUploading ? 'text-warning' :
//                         isFailed ? 'text-danger' : 'text-muted'
//                     }`}>
//                     {getDetailedStatusText()}
//                   </span>
//                 </div>

//                 {/* Progress Bar for processing/uploading videos */}
//                 {(isUploading || isProcessing) && (
//                   <div className="mb-2">
//                     <ProgressBar
//                       now={isProcessing ? Math.min(Math.max(progress, 90), 99) : Math.min(progress, 89)}
//                       style={{ height: '4px' }}
//                       variant={isProcessing ? 'info' : 'warning'}
//                       className="mb-1 progress-bar-animated"
//                       striped={isUploading}
//                       animated={isUploading || isProcessing}
//                     />
//                     <small className={isProcessing ? 'text-info' : 'text-warning'}>
//                       {video.phase || (isProcessing ?
//                         'Processing video on cloud storage...' :
//                         `Uploading chunk ${video.currentChunk || 1}/${video.totalChunks || 1}...`
//                       )}
//                     </small>
//                   </div>
//                 )}

//                 {/* ENHANCED: Multiple materials display with proper file information (like SlidePanel) */}
//                 {materials.length > 0 && (
//                   <div className="mt-2">
//                     <div className="materials-grid d-flex flex-wrap gap-2">
//                       {materials.map((material, materialIndex) => (
//                         <MaterialFileCard
//                           key={materialIndex}
//                           material={material}
//                           onPreview={previewMaterial}
//                           onDownload={downloadMaterial}
//                         />
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Action Buttons */}
//               <div className="ms-3 d-flex flex-column">
//                 {isPlayable && (
//                   <Button
//                     variant="outline-primary"
//                     size="sm"
//                     className="p-1 mb-1"
//                     onClick={handlePlayClick}
//                     title="Play video"
//                   >
//                     <FaPlay size={14} />
//                   </Button>
//                 )}
//                 <Button
//                   variant="outline-secondary"
//                   size="sm"
//                   className="p-1 mb-1"
//                   onClick={() => onEdit(moduleIndex, videoIndex)}
//                   disabled={isUploading || isProcessing}
//                   title="Edit video"
//                 >
//                   <FaEdit size={14} />
//                 </Button>
//                 <Button
//                   variant="outline-danger"
//                   size="sm"
//                   className="p-1"
//                   onClick={() => onDelete(moduleIndex, videoIndex)}
//                   disabled={isUploading || isProcessing}
//                   title="Delete video"
//                 >
//                   <FaTimes size={14} />
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </Card>

//       {/* Video Player Modal */}
//       <VideoPlayerModal
//         show={showPlayer}
//         onHide={() => setShowPlayer(false)}
//         videoUrl={video.url}
//         videoTitle={video.title}
//       />
//     </>
//   );
// };

// // ENHANCED: Compact Material File Card Component (Fixed Dropdown Positioning)
// const MaterialFileCard = ({ material, onPreview, onDownload }) => {
//   const [showActions, setShowActions] = useState(false);

//   const getMaterialIcon = (materialName) => {
//     if (!materialName) return '📁';
//     const extension = materialName.split('.').pop()?.toLowerCase();
//     const iconMap = {
//       'pdf': '📄',
//       'doc': '📝', 'docx': '📝',
//       'ppt': '📊', 'pptx': '📊',
//       'txt': '📃',
//       'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️'
//     };
//     return iconMap[extension] || '📁';
//   };

//   // Truncate filename to show max 12 characters with ...
//   const truncateFileName = (name) => {
//     if (!name) return 'Unknown';
//     if (name.length <= 12) return name;
//     return name.substring(0, 12) + '...';
//   };

//   return (
//     <div className="material-file-square position-relative">
//       <div
//         className="d-flex flex-column border rounded bg-light"
//         style={{ width: '100px', height: '100px', cursor: 'pointer' }}
//       >
//         {/* File Icon Area (80% - Top) */}
//         <div
//           className="d-flex align-items-center justify-content-center flex-grow-1"
//           style={{ height: '80%' }}
//         >
//           <div style={{ fontSize: '40px' }}>
//             {getMaterialIcon(material.name)}
//           </div>
//         </div>

//         {/* File Name Area (20% - Bottom) */}
//         <div
//           className="d-flex align-items-center justify-content-center border-top bg-white"
//           style={{ height: '20%', fontSize: '9px' }}
//         >
//           <span
//             className="text-truncate fw-bold text-dark px-1"
//             title={material.name}
//           >
//             {truncateFileName(material.name)}
//           </span>
//         </div>

//         {/* FIXED: Dots Menu Icon with proper positioning wrapper */}
//         <div
//           className="position-absolute"
//           style={{
//             top: '8px',
//             right: '8px'
//           }}
//         >
//           <div
//             className="d-flex w-100 align-items-center justify-content-center"
//             style={{
//               fontSize: '14px',
//               color: '#666',
//               cursor: 'pointer'
//             }}
//             onClick={(e) => {
//               e.stopPropagation();
//               setShowActions(!showActions);
//             }}
//           >
//             ⋮
//           </div>

//           {/* FIXED: Dropdown positioned relative to the dots */}
//           {showActions && (
//             <div
//               className="dropdown-menu bg-white show position-absolute shadow-lg border"
//               style={{
//                 top: '100%',
//                 right: '0',
//                 zIndex: 9999,
//                 minWidth: '130px',
//                 marginTop: '4px',
//                 padding: '0px'
//               }}
//             >
//               {material.url && (
//                 <>
//                   <button
//                     className="dropdown-item d-flex align-items-center py-1 px-1"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onPreview && onPreview(material);
//                       setShowActions(false);
//                     }}
//                   >
//                     <FaEye className="me-2" size={12} />
//                     <small>Preview</small>
//                   </button>
//                   <button
//                     className="dropdown-item d-flex align-items-center py-2 px-3"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onDownload && onDownload(material);
//                       setShowActions(false);
//                     }}
//                   >
//                     <FaDownload className="me-2" size={12} />
//                     <small>Download</small>
//                   </button>
//                 </>
//               )}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Click overlay to close actions */}
//       {showActions && (
//         <div
//           className="position-fixed top-0 start-0 w-100 h-100"
//           onClick={(e) => {
//             e.stopPropagation();
//             setShowActions(false);
//           }}
//         />
//       )}
//     </div>
//   );
// };

// // ENHANCED: Upload preview component with real-time progress (keeping original structure)
// const ChunkedUploadPreview = ({
//   file,
//   progress,
//   thumbnail,
//   uploadPhase,
//   chunkInfo,
//   uploadSpeed,
//   timeRemaining,
//   processingStep,
//   materialFiles = []
// }) => {
//   const getPhaseText = () => {
//     switch (uploadPhase) {
//       case 'preparing':
//         return "Preparing video for upload...";
//       case 'materials':
//         return `Uploading ${materialFiles.length} course material(s)...`;
//       case 'chunking':
//         return `Uploading ${chunkInfo || 'chunks'}...`;
//       case 'combining':
//         return "Combining video chunks...";
//       case 'gcs_upload':
//         return "Uploading to cloud storage...";
//       case 'finalizing':
//         return "Finalizing upload...";
//       case 'completed':
//         return "Upload completed!";
//       default:
//         return "Processing video...";
//     }
//   };

//   const getProgressColor = () => {
//     if (progress < 15) return "danger";
//     if (progress < 40) return "warning";
//     if (progress < 70) return "info";
//     if (progress < 95) return "primary";
//     return "success";
//   };

//   return (
//     <div className="mt-3 bg-light rounded p-3">
//       <div className="d-flex align-items-center">
//         <div
//           className="me-3 rounded overflow-hidden flex-shrink-0"
//           style={{ width: '120px', height: '68px', position: 'relative' }}
//         >
//           {thumbnail ? (
//             <img
//               src={thumbnail}
//               alt="Video thumbnail"
//               className="w-100 h-100 object-fit-cover"
//             />
//           ) : (
//             <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-secondary bg-opacity-10">
//               <FaVideo size={24} className="text-secondary" />
//             </div>
//           )}

//           {/* Progress overlay with proper phase indication */}
//           <div className="position-absolute bottom-0 start-0 w-100 bg-dark bg-opacity-50 text-white text-center py-1">
//             <small>
//               {progress}%
//               {uploadPhase === 'gcs_upload' && (
//                 <span className="ms-1">☁️</span>
//               )}
//               {uploadPhase === 'combining' && (
//                 <span className="ms-1">🔧</span>
//               )}
//             </small>
//           </div>
//         </div>

//         <div className="flex-grow-1">
//           <div className="d-flex justify-content-between align-items-center mb-2">
//             <div>
//               <h6 className="mb-0 text-truncate" style={{ maxWidth: '200px' }}>{file.name}</h6>
//               <small className="text-muted">
//                 {(file.size / (1024 * 1024)).toFixed(2)} MB
//               </small>
//               <div className="small mt-1" style={{ color: getProgressColor() === 'success' ? '#198754' : '#0d6efd' }}>
//                 {getPhaseText()}
//               </div>
//               {uploadSpeed && (
//                 <div className="small text-muted">
//                   Speed: {uploadSpeed} MB/s
//                   {timeRemaining && ` • ETA: ${timeRemaining}`}
//                 </div>
//               )}
//             </div>
//             <div className="text-center">
//               <CircleProgress
//                 progress={progress}
//                 size={40}
//                 color={getProgressColor()}
//               />
//             </div>
//           </div>

//           {/* Overall Progress Bar with proper phase colors */}
//           <ProgressBar
//             now={progress}
//             style={{ height: '8px' }}
//             variant={getProgressColor()}
//             className="mb-1 progress-bar-animated"
//             striped={uploadPhase !== 'completed'}
//             animated={uploadPhase !== 'completed'}
//           />

//           {/* Enhanced chunk/processing info */}
//           {chunkInfo && uploadPhase === 'chunking' && (
//             <div className="small text-muted">
//               {chunkInfo}
//             </div>
//           )}

//           {(uploadPhase === 'combining' || uploadPhase === 'gcs_upload' || uploadPhase === 'finalizing') && (
//             <div className="small text-info">
//               {uploadPhase === 'combining' && 'Combining video chunks...'}
//               {uploadPhase === 'gcs_upload' && 'Real-time upload to cloud storage...'}
//               {uploadPhase === 'finalizing' && 'Finalizing upload...'}
//             </div>
//           )}

//           {/* Show material upload progress */}
//           {materialFiles.length > 0 && uploadPhase === 'materials' && (
//             <div className="small text-primary mt-1">
//               Uploading {materialFiles.length} material file(s)...
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // Course Materials Panel Component for Live Courses (from original with enhancements)
// const CourseMaterialsPanel = ({ isOpen, onClose, onSave, onAutoSave, plannedLessons, existingMaterials = [], courseId }) => {
//   const [materials, setMaterials] = useState([]);
//   const [isUploading, setIsUploading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState({});

//   // Use enhanced courseContext for uploads
//   const { uploadCourseMaterial } = useCourseContext();

//   // Initialize materials array based on planned lessons (keeping original logic)
//   useEffect(() => {
//     if (isOpen && plannedLessons > 0) {
//       const newMaterials = Array.from({ length: plannedLessons }, (_, index) => {
//         const lessonNumber = index + 1;
//         const existingMaterial = existingMaterials.find(m => m.lessonNumber === lessonNumber);

//         if (existingMaterial) {
//           return {
//             lessonNumber,
//             materialName: existingMaterial.materialName || '',
//             materialFile: null,
//             materialUrl: existingMaterial.materialUrl || '',
//             materialSize: existingMaterial.materialSize || null,
//             materialType: existingMaterial.materialType || null
//           };
//         } else {
//           return {
//             lessonNumber,
//             materialName: '',
//             materialFile: null,
//             materialUrl: '',
//             materialSize: null,
//             materialType: null
//           };
//         }
//       });

//       setMaterials(newMaterials);

//       const higherLessonData = existingMaterials.filter(m => m.lessonNumber > plannedLessons && (m.materialName || m.materialUrl));
//       if (higherLessonData.length > 0) {
//         toast.warning(`Materials for lessons ${higherLessonData.map(m => m.lessonNumber).join(', ')} will be hidden but preserved.`);
//       }
//     }
//   }, [isOpen, plannedLessons, existingMaterials]);

//   const handleMaterialNameChange = (index, value) => {
//     const updatedMaterials = [...materials];
//     updatedMaterials[index].materialName = value;
//     setMaterials(updatedMaterials);
//   };

//   const handleFileChange = (index, file) => {
//     const updatedMaterials = [...materials];
//     updatedMaterials[index].materialFile = file;
//     setMaterials(updatedMaterials);

//     if (file) {
//       uploadMaterialImmediately(index, file);
//     }
//   };

//   // ENHANCED: Use courseContext upload method instead of direct API
//   const uploadMaterialImmediately = async (index, file) => {
//     setUploadProgress(prev => ({ ...prev, [index]: 10 }));

//     try {
//       setUploadProgress(prev => ({ ...prev, [index]: 30 }));

//       // Use enhanced courseContext method
//       const result = await uploadCourseMaterial(file, (progress) => {
//         setUploadProgress(prev => ({ ...prev, [index]: progress }));
//       });

//       if (result.success) {
//         const updatedMaterials = [...materials];
//         updatedMaterials[index].materialUrl = result.data.fileUrl;
//         updatedMaterials[index].materialSize = result.data.fileSize;
//         updatedMaterials[index].materialType = result.data.mimeType;

//         if (!updatedMaterials[index].materialName) {
//           updatedMaterials[index].materialName = result.data.fileName;
//         }

//         updatedMaterials[index].materialFile = null;
//         setMaterials(updatedMaterials);
//         toast.success(`Material uploaded for Lesson ${index + 1}`);

//         const materialsToSave = createCompleteMaterialsList(updatedMaterials);
//         onAutoSave(materialsToSave);
//       } else {
//         throw new Error(result.error || 'Upload failed');
//       }
//     } catch (error) {
//       console.error(`Error uploading material for lesson ${index + 1}:`, error);
//       toast.error(`Failed to upload material for lesson ${index + 1}`);
//     } finally {
//       setUploadProgress(prev => {
//         const updated = { ...prev };
//         delete updated[index];
//         return updated;
//       });
//     }
//   };

//   const createCompleteMaterialsList = (currentMaterials) => {
//     const completeList = [];
//     for (let i = 1; i <= plannedLessons; i++) {
//       const existingMaterial = currentMaterials.find(m => m.lessonNumber === i);
//       if (existingMaterial) {
//         completeList.push({
//           lessonNumber: i,
//           materialName: existingMaterial.materialName || '',
//           materialUrl: existingMaterial.materialUrl || '',
//           materialSize: existingMaterial.materialSize || null,
//           materialType: existingMaterial.materialType || null,
//           hasContent: !!(existingMaterial.materialName || existingMaterial.materialUrl)
//         });
//       } else {
//         completeList.push({
//           lessonNumber: i,
//           materialName: '',
//           materialUrl: '',
//           materialSize: null,
//           materialType: null,
//           hasContent: false
//         });
//       }
//     }
//     return completeList;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const materialsToSave = createCompleteMaterialsList(materials);
//     onSave(materialsToSave);
//     toast.success(`Course materials saved for all ${plannedLessons} lessons`);
//     onClose();
//   };

//   return (
//     <SlidePanel
//       isOpen={isOpen}
//       onClose={() => !isUploading && onClose()}
//       title={`Add Course Materials (${plannedLessons} Lessons)`}
//       size="lg"
//     >
//       <Form onSubmit={handleSubmit}>
//         <Alert variant="info" className="mb-4">
//           <FaInfoCircle className="me-2" />
//           Add materials for each lesson. Both fields are optional.
//           <br />
//           <strong>All {plannedLessons} lessons will be saved</strong> (including empty ones).
//         </Alert>

//         <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
//           {materials.map((material, index) => (
//             <Card key={index} className="mb-3 border">
//               <Card.Header className={`py-2 ${material.materialUrl || material.materialName ? 'bg-success bg-opacity-10' : 'bg-light'}`}>
//                 <div className="d-flex justify-content-between align-items-center">
//                   <h6 className="mb-0">Lesson {material.lessonNumber}</h6>
//                   {(material.materialUrl || material.materialName) && (
//                     <Badge bg="success" size="sm">
//                       <FaFileAlt className="me-1" size={10} />
//                       Has Content
//                     </Badge>
//                   )}
//                 </div>
//               </Card.Header>
//               <Card.Body className="py-3">
//                 <Row>
//                   <Col md={6}>
//                     <Form.Group className="mb-3">
//                       <Form.Label>Material Name</Form.Label>
//                       <Form.Control
//                         type="text"
//                         placeholder={`e.g. Lesson ${material.lessonNumber} Handout`}
//                         value={material.materialName}
//                         onChange={(e) => handleMaterialNameChange(index, e.target.value)}
//                         disabled={isUploading}
//                       />
//                     </Form.Group>
//                   </Col>
//                   <Col md={6}>
//                     <Form.Group className="mb-3">
//                       <Form.Label>Upload File</Form.Label>
//                       <Form.Control
//                         type="file"
//                         accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
//                         onChange={(e) => handleFileChange(index, e.target.files[0])}
//                         disabled={isUploading}
//                       />
//                       <Form.Text className="text-muted">
//                         Supported: PDF, DOC, DOCX, PPT, PPTX, TXT, JPG, PNG (Max 50MB)
//                       </Form.Text>
//                       {material.materialUrl && !material.materialFile && (
//                         <div className="mt-1">
//                           <small className="text-success">
//                             📎 Currently uploaded: {material.materialName || 'File attached'}
//                           </small>
//                         </div>
//                       )}
//                     </Form.Group>
//                   </Col>
//                 </Row>

//                 {material.materialFile && (
//                   <div className="mt-2 p-2 bg-warning bg-opacity-10 rounded">
//                     <div className="d-flex align-items-center justify-content-between">
//                       <div className="d-flex align-items-center">
//                         <FaFileAlt className="me-2 text-warning" />
//                         <span className="text-warning">Uploading: {material.materialFile.name}</span>
//                         <small className="text-muted ms-2">
//                           ({(material.materialFile.size / (1024 * 1024)).toFixed(2)} MB)
//                         </small>
//                       </div>
//                       {uploadProgress[index] && (
//                         <CircleProgress progress={uploadProgress[index]} size={30} />
//                       )}
//                     </div>
//                   </div>
//                 )}

//                 {material.materialUrl && !material.materialFile && (
//                   <div className="mt-2 p-2 bg-success bg-opacity-10 rounded">
//                     <div className="d-flex align-items-center">
//                       <FaFileAlt className="me-2 text-success" />
//                       <span className="text-success">Material uploaded successfully</span>
//                     </div>
//                   </div>
//                 )}

//                 {!material.materialUrl && !material.materialFile && !material.materialName && (
//                   <div className="mt-2 p-2 bg-light rounded">
//                     <div className="d-flex align-items-center">
//                       <FaFileAlt className="me-2 text-muted" />
//                       <span className="text-muted">No material added yet</span>
//                     </div>
//                   </div>
//                 )}
//               </Card.Body>
//             </Card>
//           ))}
//         </div>

//         <div className="d-grid mt-4">
//           <Button variant="primary" type="submit" disabled={isUploading}>
//             {isUploading ? (
//               <>
//                 <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
//                 Uploading Materials...
//               </>
//             ) : `Save Course Materials (All ${plannedLessons} Lessons)`}
//           </Button>
//         </div>
//       </Form>
//     </SlidePanel>
//   );
// };

// const Step3 = ({ stepperInstance, mode = 'create' }) => {
//   const {
//     courseData,
//     setCourseData,
//     isLoading,
//     saveCurriculum,
//     saveAdditionalInfo,
//     courseLoading,
//     courseLoadError,
//     // ENHANCED: Use new context methods
//     uploadVideoWithMaterials,
//     validateFile,
//     generateFilePreview
//   } = useCourseContext();

//   const [modules, setModules] = useState([]);
//   const [plannedLessons, setPlannedLessons] = useState('');
//   const [courseMaterials, setCourseMaterials] = useState([]);
//   const [dataLoaded, setDataLoaded] = useState(false);

//   // Dynamic localStorage key based on mode
//   const STEP3_STORAGE_KEY = `${mode}_course_step3_data`;

//   // Panel state (keeping original)
//   const [showModulePanel, setShowModulePanel] = useState(false);
//   const [showVideoPanel, setShowVideoPanel] = useState(false);
//   const [showMaterialsPanel, setShowMaterialsPanel] = useState(false);
//   const [currentModuleIndex, setCurrentModuleIndex] = useState(null);
//   const [editMode, setEditMode] = useState(false);

//   // Form state (keeping original + enhanced multiple materials)
//   const [moduleTitle, setModuleTitle] = useState('');
//   const [moduleDescription, setModuleDescription] = useState('');

//   const [videoTitle, setVideoTitle] = useState('');
//   const [videoDescription, setVideoDescription] = useState('');
//   const [videoFile, setVideoFile] = useState(null);
//   const [videoThumbnail, setVideoThumbnail] = useState('');
//   const [isPreview, setIsPreview] = useState(false);
//   const [isUploading, setIsUploading] = useState(false);
//   const [currentVideoIndex, setCurrentVideoIndex] = useState(null);

//   // ENHANCED: Multiple material files support
//   const [materialFiles, setMaterialFiles] = useState([]);

//   // Chunked upload progress state (keeping original)
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [uploadPhase, setUploadPhase] = useState('idle');
//   const [chunkInfo, setChunkInfo] = useState('');
//   const [uploadSpeed, setUploadSpeed] = useState('');
//   const [timeRemaining, setTimeRemaining] = useState('');

//   // Confirmation dialog state (keeping original)
//   const [showConfirmDelete, setShowConfirmDelete] = useState(false);
//   const [deleteType, setDeleteType] = useState('');
//   const [deleteIndexes, setDeleteIndexes] = useState({ moduleIndex: null, videoIndex: null });
//   const [confirmMessage, setConfirmMessage] = useState('');
//   const [confirmTitle, setConfirmTitle] = useState('');

//   // Accordion state (keeping original)
//   const [activeKey, setActiveKey] = useState('0');
//   const [isMounted, setIsMounted] = useState(false);

//   // Load data based on mode and priority - FOLLOWING STEP1/STEP2 PATTERN
//   useEffect(() => {
//     const loadData = () => {
//       if (mode === 'edit') {
//         // In edit mode, prioritize course data from API
//         if (courseData && courseData._id && !dataLoaded) {
//           console.log('Edit mode: Loading course curriculum data into form', courseData);
//           populateFormWithCourseData();
//           setDataLoaded(true);
//         } else if (!courseData._id && !courseLoading && !dataLoaded) {
//           // If no course data and not loading, try localStorage
//           loadFromLocalStorage();
//           setDataLoaded(true);
//         }
//       } else {
//         // Create mode - always try localStorage first
//         if (!dataLoaded) {
//           loadFromLocalStorage();
//           setDataLoaded(true);
//         }
//       }
//     };

//     loadData();

//     // REMOVED: The problematic reset logic that was causing infinite re-renders
//     // This was the main cause: if (mode === 'edit' && courseData._id && dataLoaded) { setDataLoaded(false); }

//   }, [courseData._id, mode, courseLoading, dataLoaded]);

//   useEffect(() => {
//     // Only reset and reload when courseData._id actually changes (not on every courseData update)
//     if (mode === 'edit' && courseData._id && dataLoaded) {
//       console.log('Course ID changed, reloading data...');
//       setDataLoaded(false);
//     }
//   }, [courseData._id, mode]);

//   // Function to populate form with course data (edit mode)
//   const populateFormWithCourseData = () => {
//     console.log('Populating Step 3 form with course data:', {
//       modules: courseData.modules,
//       liveCourseMeta: courseData.liveCourseMeta
//     });

//     // Fix modules loading with better error handling
//     if (courseData.modules && Array.isArray(courseData.modules) && courseData.modules.length > 0) {
//       console.log('Loading modules from courseData:', courseData.modules);

//       // Clean up any persisting upload states on load for edit mode
//       const cleanModules = courseData.modules.map(module => ({
//         ...module,
//         videos: (module.videos || []).map(video => ({
//           ...video,
//           // Reset upload states that shouldn't persist
//           status: video.url && !video.url.includes('/api/course/upload/finalize/') ? 'completed' : video.status,
//           progress: video.url && !video.url.includes('/api/course/upload/finalize/') ? 100 : 0,
//           uploadPhase: video.url && !video.url.includes('/api/course/upload/finalize/') ? 'completed' : 'idle',
//           currentChunk: undefined,
//           totalChunks: undefined,
//           timeRemaining: undefined
//         }))
//       }));

//       setModules(cleanModules);
//       console.log('Modules set:', cleanModules);
//     } else {
//       console.log('No modules found in courseData, setting empty array');
//       setModules([]);
//     }

//     // Fix live course data loading
//     if (courseData.type === 'live') {
//       if (courseData.liveCourseMeta?.plannedLessons) {
//         console.log('Setting plannedLessons:', courseData.liveCourseMeta.plannedLessons);
//         setPlannedLessons(courseData.liveCourseMeta.plannedLessons.toString());
//       }

//       if (courseData.liveCourseMeta?.courseMaterials) {
//         console.log('Setting courseMaterials:', courseData.liveCourseMeta.courseMaterials);
//         setCourseMaterials(courseData.liveCourseMeta.courseMaterials);
//       }
//     }

//     console.log('Populated Step 3 form with course data');
//   };

//   useEffect(() => {
//     console.log('Step3 State Debug:', {
//       mode,
//       courseDataId: courseData?._id,
//       modulesLength: modules.length,
//       plannedLessons,
//       courseMaterialsLength: courseMaterials.length,
//       dataLoaded,
//       courseLoading
//     });
//   }, [mode, courseData?._id, modules.length, plannedLessons, courseMaterials.length, dataLoaded, courseLoading]);

//   // Function to load from localStorage
//   const loadFromLocalStorage = () => {
//     const savedData = localStorage.getItem(STEP3_STORAGE_KEY);
//     if (savedData) {
//       try {
//         const parsedData = JSON.parse(savedData);
//         console.log(`${mode} mode: Loading Step 3 data from localStorage`);

//         if (parsedData?.modules?.length > 0) {
//           // Clean up any persisting upload states on load
//           const cleanModules = parsedData.modules.map(module => ({
//             ...module,
//             videos: module.videos.map(video => ({
//               ...video,
//               // Reset upload states that shouldn't persist
//               status: video.url && !video.url.includes('/api/course/upload/finalize/') ? 'completed' : video.status,
//               progress: video.url && !video.url.includes('/api/course/upload/finalize/') ? 100 : 0,
//               uploadPhase: video.url && !video.url.includes('/api/course/upload/finalize/') ? 'completed' : 'idle',
//               currentChunk: undefined,
//               totalChunks: undefined,
//               timeRemaining: undefined
//             }))
//           }));
//           setModules(cleanModules);
//         }

//         if (parsedData?.liveCourseMeta?.plannedLessons) {
//           setPlannedLessons(parsedData.liveCourseMeta.plannedLessons.toString());
//         }

//         if (parsedData?.plannedLessons) {
//           setPlannedLessons(parsedData.plannedLessons.toString());
//         }

//         if (parsedData?.courseMaterials) {
//           setCourseMaterials(parsedData.courseMaterials);
//         }

//         if (parsedData?.liveCourseMeta?.courseMaterials) {
//           setCourseMaterials(parsedData.liveCourseMeta.courseMaterials);
//         }
//       } catch (error) {
//         console.error('Error parsing saved form data:', error);
//       }
//     }
//   };

//   // Save form data to localStorage when submitting
//   const saveFormToLocalStorage = (data) => {
//     localStorage.setItem(STEP3_STORAGE_KEY, JSON.stringify(data));
//   };

//   useEffect(() => {
//     setIsMounted(true);
//     return () => {
//       setIsMounted(false);
//     };
//   }, []);

//   // Save curriculum to database (keeping original)
//   const saveCurriculumToDatabase = async (modulesData) => {
//     try {
//       const token = document.cookie.split('; ').find(row => row.startsWith('authToken='))?.split('=')[1];

//       const response = await fetch(`/api/course/${courseData._id}/curriculum`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           ...(token && { 'Authorization': `Bearer ${token}` })
//         },
//         body: JSON.stringify({
//           modules: modulesData
//         })
//       });

//       const result = await response.json();

//       if (!response.ok) {
//         throw new Error(result.error || 'Failed to save curriculum');
//       }

//       return result.success;
//     } catch (error) {
//       console.error('Error saving curriculum:', error);
//       throw error;
//     }
//   };

//   // Handle module operations (keeping original)
//   const handleModuleSubmit = (e) => {
//     if (e) e.preventDefault();

//     if (!moduleTitle.trim()) {
//       toast.error('Module title is required');
//       return;
//     }

//     console.log('handleModuleSubmit:', { editMode, currentModuleIndex, moduleTitle });

//     if (editMode && currentModuleIndex !== null) {
//       // Edit existing module
//       const updatedModules = [...modules];
//       updatedModules[currentModuleIndex] = {
//         ...updatedModules[currentModuleIndex],
//         title: moduleTitle,
//         description: moduleDescription,
//       };
//       console.log('Updated modules (edit):', updatedModules);
//       setModules(updatedModules);
//       toast.success('Module updated successfully');

//       // Save to localStorage
//       saveFormToLocalStorage({
//         modules: updatedModules,
//         plannedLessons: parseInt(plannedLessons) || 0,
//         courseMaterials,
//         liveCourseMeta: {
//           plannedLessons: parseInt(plannedLessons) || 0,
//           courseMaterials
//         }
//       });

//       // FIXED: Auto-save to database in edit mode
//       if (mode === 'edit' && courseData._id) {
//         saveCurriculumToDatabase(updatedModules).catch(error => {
//           console.error('Failed to auto-save curriculum:', error);
//           toast.warning('Changes saved locally. Please save manually to sync with server.');
//         });
//       }
//     } else {
//       // Add new module
//       const newModule = {
//         title: moduleTitle,
//         description: moduleDescription,
//         order: modules.length + 1,
//         videos: []
//       };
//       const updatedModules = [...modules, newModule];
//       console.log('Updated modules (add):', updatedModules);
//       setModules(updatedModules);
//       toast.success('Module added successfully');
//       setActiveKey((modules.length).toString());

//       // Save to localStorage
//       saveFormToLocalStorage({
//         modules: updatedModules,
//         plannedLessons: parseInt(plannedLessons) || 0,
//         courseMaterials,
//         liveCourseMeta: {
//           plannedLessons: parseInt(plannedLessons) || 0,
//           courseMaterials
//         }
//       });

//       // FIXED: Auto-save to database in edit mode
//       if (mode === 'edit' && courseData._id) {
//         saveCurriculumToDatabase(updatedModules).catch(error => {
//           console.error('Failed to auto-save curriculum:', error);
//           toast.warning('Module added locally. Please save manually to sync with server.');
//         });
//       }
//     }

//     // Reset form state
//     setModuleTitle('');
//     setModuleDescription('');
//     setEditMode(false);
//     setCurrentModuleIndex(null);
//     setShowModulePanel(false);
//   };


//   // ENHANCED: Video submit with multiple materials using context
//   const handleVideoSubmit = async (e) => {
//     if (e) e.preventDefault();

//     if (!videoTitle.trim()) {
//       toast.error('Video title is required');
//       return;
//     }

//     if (!videoFile && !editMode) {
//       toast.error('Video file is required');
//       return;
//     }

//     setIsUploading(true);
//     setUploadProgress(0);
//     setUploadPhase('preparing');

//     try {
//       let videoResult = null;

//       // ENHANCED: Upload video with materials using context
//       if (videoFile) {
//         // Prepare material files array
//         const materialFilesToUpload = materialFiles.map(fileInfo => fileInfo.file || fileInfo);

//         videoResult = await uploadVideoWithMaterials(
//           videoFile,
//           materialFilesToUpload,
//           (progressData) => {
//             setUploadProgress(progressData.overallProgress || 0);
//             setUploadPhase(progressData.phase || 'uploading');
//             setChunkInfo(progressData.chunksComplete ? `${progressData.chunksComplete}/${progressData.totalChunks}` : '');
//             setUploadSpeed(progressData.uploadSpeed || '');
//             setTimeRemaining(progressData.timeRemaining || '');
//           }
//         );
//       }

//       // Create video object with enhanced materials support
//       const videoData = {
//         title: videoTitle,
//         description: videoDescription,
//         isPreview: isPreview,
//         ...(videoResult && {
//           url: videoResult.video.url,
//           duration: videoResult.video.duration || 0,
//           thumbnailUrl: videoResult.video.thumbnail,
//           materials: videoResult.materials || []
//         })
//       };

//       // Handle editing or adding video (keeping original logic)
//       let updatedModules = [...modules];

//       if (editMode && currentVideoIndex !== null) {
//         updatedModules[currentModuleIndex].videos[currentVideoIndex] = {
//           ...updatedModules[currentModuleIndex].videos[currentVideoIndex],
//           ...videoData
//         };
//       } else {
//         updatedModules[currentModuleIndex].videos.push(videoData);
//       }

//       setModules(updatedModules);

//       // FIXED: Save to database and context in both modes
//       if (mode === 'edit' && courseData._id) {
//         await saveCurriculumToDatabase(updatedModules);
//       }

//       setCourseData(prev => ({ ...prev, modules: [...updatedModules] }));

//       // Save to localStorage
//       saveFormToLocalStorage({
//         modules: updatedModules,
//         plannedLessons: parseInt(plannedLessons) || 0,
//         courseMaterials,
//         liveCourseMeta: {
//           plannedLessons: parseInt(plannedLessons) || 0,
//           courseMaterials
//         }
//       });

//       toast.success(editMode ? 'Video updated successfully' : 'Video added successfully');

//       // Reset form
//       setVideoTitle('');
//       setVideoDescription('');
//       setVideoFile(null);
//       setMaterialFiles([]);
//       setVideoThumbnail('');
//       setIsPreview(false);
//       setEditMode(false);
//       setCurrentVideoIndex(null);
//       setShowVideoPanel(false);

//     } catch (error) {
//       console.error('Upload error:', error);
//       toast.error('Upload failed: ' + error.message);

//       // Update video status to failed if in modules
//       if (currentModuleIndex !== null) {
//         setModules(prevModules => {
//           const updatedModules = [...prevModules];
//           const targetModule = updatedModules[currentModuleIndex];
//           const targetVideoIndex = editMode ? currentVideoIndex : targetModule.videos.length - 1;

//           if (targetModule && targetModule.videos[targetVideoIndex]) {
//             targetModule.videos[targetVideoIndex] = {
//               ...targetModule.videos[targetVideoIndex],
//               status: 'failed',
//               uploadPhase: 'failed'
//             };
//           }

//           return updatedModules;
//         });
//       }
//     } finally {
//       setIsUploading(false);
//       setUploadProgress(0);
//       setUploadPhase('idle');
//       setChunkInfo('');
//       setUploadSpeed('');
//       setTimeRemaining('');
//     }
//   };

//   // ENHANCED: Handle video file changes with validation
//   const handleFileChange = async (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       try {
//         const isValid = await validateFile(file, 'video');
//         if (isValid) {
//           setVideoFile(file);

//           // Generate thumbnail using context
//           try {
//             const preview = await generateFilePreview(file);
//             setVideoThumbnail(preview.preview);
//           } catch (error) {
//             console.error('Error generating thumbnail:', error);
//           }
//         }
//       } catch (error) {
//         toast.error(error.message);
//         e.target.value = '';
//       }
//     }
//   };

//   // ENHANCED: Handle multiple material files
//   const handleMaterialFilesChange = async (e) => {
//     const files = Array.from(e.target.files);

//     try {
//       // Validate all files
//       for (const file of files) {
//         const isValid = await validateFile(file, 'material');
//         if (!isValid) {
//           e.target.value = '';
//           return;
//         }
//       }

//       // Generate previews for new files
//       const newMaterialFiles = [...materialFiles];

//       for (const file of files) {
//         const preview = await generateFilePreview(file);
//         newMaterialFiles.push({ ...preview, file });
//       }

//       setMaterialFiles(newMaterialFiles);
//       e.target.value = ''; // Reset input

//     } catch (error) {
//       toast.error(error.message);
//       e.target.value = '';
//     }
//   };

//   // ENHANCED: Handle material file actions
//   const handleMaterialFileAction = (action, fileInfo) => {
//     switch (action) {
//       case 'remove':
//         setMaterialFiles(prev => prev.filter(f => f !== fileInfo));
//         break;
//       case 'view':
//         if (fileInfo.url || fileInfo.preview) {
//           window.open(fileInfo.url || fileInfo.preview, '_blank');
//         }
//         break;
//       case 'download':
//         if (fileInfo.url) {
//           const link = document.createElement('a');
//           link.href = fileInfo.url;
//           link.download = fileInfo.name;
//           link.click();
//         }
//         break;
//     }
//   };

//   // Edit and delete handlers (keeping original logic)
//   const handleModuleEdit = (index) => {
//     setModuleTitle(modules[index].title);
//     setModuleDescription(modules[index].description || '');
//     setCurrentModuleIndex(index);
//     setEditMode(true);
//     setShowModulePanel(true);
//   };

//   const handleVideoEdit = (moduleIndex, videoIndex) => {
//     const video = modules[moduleIndex].videos[videoIndex];
//     setVideoTitle(video.title);
//     setVideoDescription(video.description || '');
//     setIsPreview(video.isPreview || false);

//     // ENHANCED: Handle multiple materials in edit mode
//     if (video.materials && video.materials.length > 0) {
//       setMaterialFiles(video.materials.map(material => ({
//         name: material.name || material.fileName,
//         size: material.size || material.fileSize,
//         type: material.type || material.mimeType,
//         url: material.url,
//         preview: null,
//         icon: '📁'
//       })));
//     } else if (video.materialUrl) {
//       // Legacy single material support
//       setMaterialFiles([{
//         name: video.materialName || 'Course Material',
//         size: video.materialSize || 0,
//         type: video.materialType || 'application/octet-stream',
//         url: video.materialUrl,
//         preview: null,
//         icon: '📁'
//       }]);
//     } else {
//       setMaterialFiles([]);
//     }

//     setCurrentModuleIndex(moduleIndex);
//     setCurrentVideoIndex(videoIndex);
//     setEditMode(true);
//     setShowVideoPanel(true);
//   };

//   const showDeleteModuleConfirm = (index) => {
//     const moduleName = modules[index].title;
//     const videoCount = modules[index].videos.length;

//     setDeleteType('module');
//     setDeleteIndexes({ moduleIndex: index, videoIndex: null });
//     setConfirmTitle('Delete Module');
//     setConfirmMessage(
//       `Are you sure you want to delete the module "${moduleName}"? ${videoCount > 0
//         ? `This will also delete ${videoCount} video${videoCount !== 1 ? 's' : ''}.`
//         : ''
//       } This action cannot be undone.`
//     );
//     setShowConfirmDelete(true);
//   };

//   const showDeleteVideoConfirm = (moduleIndex, videoIndex) => {
//     const videoName = modules[moduleIndex].videos[videoIndex].title;

//     setDeleteType('video');
//     setDeleteIndexes({ moduleIndex, videoIndex });
//     setConfirmTitle('Delete Video');
//     setConfirmMessage(
//       `Are you sure you want to delete the video "${videoName}"? This action cannot be undone.`
//     );
//     setShowConfirmDelete(true);
//   };

//   const handleConfirmDelete = () => {
//     if (deleteType === 'module') {
//       const index = deleteIndexes.moduleIndex;
//       const updatedModules = [...modules];
//       updatedModules.splice(index, 1);

//       updatedModules.forEach((module, i) => {
//         module.order = i + 1;
//       });

//       setModules(updatedModules);
//       toast.success('Module deleted successfully');

//       // Save to localStorage
//       saveFormToLocalStorage({
//         modules: updatedModules,
//         plannedLessons: parseInt(plannedLessons) || 0,
//         courseMaterials,
//         liveCourseMeta: {
//           plannedLessons: parseInt(plannedLessons) || 0,
//           courseMaterials
//         }
//       });
//     } else if (deleteType === 'video') {
//       const { moduleIndex, videoIndex } = deleteIndexes;
//       const updatedModules = [...modules];
//       updatedModules[moduleIndex].videos.splice(videoIndex, 1);
//       setModules(updatedModules);
//       toast.success('Video deleted successfully');

//       // Save to localStorage
//       saveFormToLocalStorage({
//         modules: updatedModules,
//         plannedLessons: parseInt(plannedLessons) || 0,
//         courseMaterials,
//         liveCourseMeta: {
//           plannedLessons: parseInt(plannedLessons) || 0,
//           courseMaterials
//         }
//       });
//     }

//     setDeleteType('');
//     setDeleteIndexes({ moduleIndex: null, videoIndex: null });
//     setShowConfirmDelete(false);
//   };

//   // FIXED: Auto-save function for live course materials
//   const handleAutoSaveCourseMaterials = async (materials) => {
//     try {
//       console.log('Auto-saving live course materials:', materials);

//       // Update local state immediately
//       setCourseMaterials(materials);

//       // Save to localStorage for persistence
//       saveFormToLocalStorage({
//         modules,
//         courseMaterials: materials,
//         plannedLessons: parseInt(plannedLessons) || 0,
//         liveCourseMeta: {
//           plannedLessons: parseInt(plannedLessons) || 0,
//           courseMaterials: materials
//         }
//       });

//       // Auto-save to database if courseId exists
//       if (courseData?._id) {
//         try {
//           const saveData = {
//             liveCourseMeta: {
//               plannedLessons: parseInt(plannedLessons) || 0,
//               courseMaterials: materials
//             }
//           };

//           const success = await saveAdditionalInfo(saveData);

//           if (success) {
//             console.log('✅ Live course materials auto-saved to database');

//             // Update course context
//             setCourseData(prev => ({
//               ...prev,
//               liveCourseMeta: {
//                 ...(prev.liveCourseMeta || {}),
//                 plannedLessons: parseInt(plannedLessons) || 0,
//                 courseMaterials: materials
//               }
//             }));
//           } else {
//             console.warn('⚠️ Auto-save to database failed, but localStorage updated');
//           }
//         } catch (error) {
//           console.error('❌ Auto-save to database error:', error);
//           // Don't show error to user for auto-save, just log it
//         }
//       }
//     } catch (error) {
//       console.error('❌ Auto-save materials error:', error);
//     }
//   };

//   // Course materials handlers (keeping original logic)
//   const handleSaveCourseMaterials = async (materials) => {
//     try {
//       console.log('Saving live course materials:', materials);

//       // Update local state
//       setCourseMaterials(materials);
//       setShowMaterialsPanel(false);

//       // Save to localStorage
//       saveFormToLocalStorage({
//         modules,
//         courseMaterials: materials,
//         plannedLessons: parseInt(plannedLessons) || 0,
//         liveCourseMeta: {
//           plannedLessons: parseInt(plannedLessons) || 0,
//           courseMaterials: materials
//         }
//       });

//       // Save to database
//       if (courseData?._id) {
//         try {
//           const saveData = {
//             liveCourseMeta: {
//               plannedLessons: parseInt(plannedLessons) || 0,
//               courseMaterials: materials
//             }
//           };

//           const success = await saveAdditionalInfo(saveData);

//           if (success) {
//             // Update course context
//             setCourseData(prev => ({
//               ...prev,
//               liveCourseMeta: {
//                 ...(prev.liveCourseMeta || {}),
//                 plannedLessons: parseInt(plannedLessons) || 0,
//                 courseMaterials: materials
//               }
//             }));

//             toast.success(`Course materials saved for all ${parseInt(plannedLessons) || 0} lessons`);
//           } else {
//             throw new Error('Failed to save to database');
//           }
//         } catch (error) {
//           console.error('❌ Save to database error:', error);
//           toast.error('Failed to save materials to database. Please try again.');
//         }
//       } else {
//         toast.success('Materials saved locally. Complete course creation to save to database.');
//       }
//     } catch (error) {
//       console.error('❌ Save materials error:', error);
//       toast.error('Failed to save course materials');
//     }
//   };

//   // Save and navigation handlers (keeping original logic)
//   const handleSaveLiveCourseInfo = async () => {
//     if (!plannedLessons || plannedLessons === '' || parseInt(plannedLessons, 10) <= 0) {
//       toast.error('Please enter a valid number of lessons');
//       return;
//     }

//     try {
//       const numericPlannedLessons = parseInt(plannedLessons, 10);

//       let completeCourseMaterials = [];
//       for (let i = 1; i <= numericPlannedLessons; i++) {
//         const existingMaterial = courseMaterials.find(m => m.lessonNumber === i);

//         if (existingMaterial) {
//           completeCourseMaterials.push({
//             lessonNumber: i,
//             materialName: existingMaterial.materialName || '',
//             materialUrl: existingMaterial.materialUrl || '',
//             materialSize: existingMaterial.materialSize || null,
//             materialType: existingMaterial.materialType || null,
//             hasContent: !!(existingMaterial.materialName || existingMaterial.materialUrl)
//           });
//         } else {
//           completeCourseMaterials.push({
//             lessonNumber: i,
//             materialName: '',
//             materialUrl: '',
//             materialSize: null,
//             materialType: null,
//             hasContent: false
//           });
//         }
//       }

//       const data = {
//         liveCourseMeta: {
//           plannedLessons: numericPlannedLessons,
//           courseMaterials: completeCourseMaterials
//         }
//       };

//       const success = await saveAdditionalInfo(data);

//       if (success) {
//         setCourseData(prev => ({
//           ...prev,
//           liveCourseMeta: {
//             ...(prev.liveCourseMeta || {}),
//             plannedLessons: numericPlannedLessons,
//             courseMaterials: completeCourseMaterials
//           }
//         }));

//         // Update localStorage with complete data
//         saveFormToLocalStorage({
//           modules,
//           plannedLessons: numericPlannedLessons,
//           courseMaterials: completeCourseMaterials,
//           liveCourseMeta: {
//             plannedLessons: numericPlannedLessons,
//             courseMaterials: completeCourseMaterials
//           }
//         });

//         stepperInstance?.next();
//       }
//     } catch (error) {
//       console.error('Error saving planned lessons:', error);
//       toast.error('Failed to save course information');
//     }
//   };

//   const saveAndContinue = async (e) => {
//     if (e) e.preventDefault();

//     if (courseData && courseData.type === 'live') {
//       await handleSaveLiveCourseInfo();
//       return;
//     }

//     if (modules.length === 0) {
//       toast.error('Please add at least one module to continue');
//       return;
//     }

//     const result = await saveCurriculum({ modules });

//     if (result) {
//       setCourseData(prev => ({
//         ...prev,
//         modules: [...modules]
//       }));

//       saveFormToLocalStorage({ modules });

//       if (stepperInstance) {
//         stepperInstance?.next();
//       }
//     }
//   };

//   const handlePrevious = () => {
//     stepperInstance?.previous();
//   };

//   const openAddVideoPanel = (moduleIndex) => {
//     setCurrentModuleIndex(moduleIndex);
//     setEditMode(false);
//     setVideoTitle('');
//     setVideoDescription('');
//     setVideoFile(null);
//     setMaterialFiles([]);
//     setVideoThumbnail('');
//     setIsPreview(false);
//     setShowVideoPanel(true);
//   };

//   // Show loading spinner if course is still loading in edit mode
//   if (mode === 'edit' && courseLoading) {
//     return (
//       <div id="step-3" role="tabpanel" className="content fade" aria-labelledby="steppertrigger3">
//         <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
//           <div className="text-center">
//             <Spinner animation="border" variant="primary" className="mb-3" />
//             <h5>Loading course curriculum...</h5>
//             <p className="text-muted">Please wait while we fetch your course information.</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Show error if in edit mode but failed to load course data
//   if (mode === 'edit' && !courseLoading && !courseData._id && courseLoadError) {
//     return (
//       <div id="step-3" role="tabpanel" className="content fade" aria-labelledby="steppertrigger3">
//         <Alert variant="danger">
//           <h5>Error Loading Course Curriculum</h5>
//           <p>Unable to load course curriculum data: {courseLoadError}</p>
//           <Button variant="outline-danger" onClick={() => window.location.href = '/instructor/manage-course'}>
//             Back to Course Management
//           </Button>
//         </Alert>
//       </div>
//     );
//   }



//   // Special UI for live courses (keeping original)
//   if (courseData && courseData.type === 'live') {
//     return (
//       <div id="step-3" role="tabpanel" className="content fade" aria-labelledby="steppertrigger3">
//         <div className="d-flex justify-content-between align-items-center mb-3">
//           <h4>
//             {mode === 'edit' ? 'Edit Course Curriculum' : 'Course Curriculum'}
//           </h4>
//           {mode === 'edit' && courseData._id && (
//             <div className="text-muted small">
//               Editing: {courseData.title}
//             </div>
//           )}
//         </div>
//         <div className="mb-4">
//           <Row>
//             <Col lg={12}>
//               <Card className="p-4 mb-4">
//                 <div className="d-flex align-items-start">
//                   <div className="me-4">
//                     <Image
//                       src={liveIcon}
//                       alt="Live Course"
//                       width={70}
//                       height={70}
//                     />
//                   </div>
//                   <div>
//                     <h5 className="mb-2">Define the count of lessons in your course</h5>
//                     <p className="text-muted font-normal fs-5 fw-normal mb-4">
//                       Keep in mind that live-courses need to have a count which has always same amount of lessons per day
//                       (e.g. 3 days with 2 lessons = 6 lessons)
//                     </p>

//                     <div className="d-flex align-items-center">
//                       <Form.Control
//                         type="number"
//                         value={plannedLessons}
//                         onChange={(e) => setPlannedLessons(e.target.value)}
//                         style={{ width: '15%' }}
//                         className="me-2"
//                         min="1"
//                         placeholder="0"
//                       />
//                       <span className='font-normal fs-5 fw-normal'>lessons</span>
//                     </div>
//                   </div>
//                 </div>
//               </Card>
//             </Col>
//           </Row>

//           {/* Course Materials Section for Live Courses */}
//           {plannedLessons && parseInt(plannedLessons) > 0 && (
//             <Row className="mb-4">
//               <Col lg={12}>
//                 <Card className="shadow-sm border">
//                   <Card.Header className="bg-light">
//                     <div className="d-flex justify-content-between align-items-center">
//                       <h5 className="mb-0">
//                         <FaFileAlt className="me-2" />
//                         Course Materials ({parseInt(plannedLessons)} Lessons)
//                       </h5>
//                       <Button
//                         variant="primary"
//                         size="sm"
//                         onClick={() => setShowMaterialsPanel(true)}
//                       >
//                         <FaPlus className="me-1" />
//                         {courseMaterials && courseMaterials.length > 0 ? 'Edit Materials' : 'Add Course Files'}
//                       </Button>
//                     </div>
//                   </Card.Header>
//                   <Card.Body>
//                     <div>
//                       <p className="mb-3">
//                         <FaFileAlt className="me-2 text-info" />
//                         Course materials setup: {courseMaterials.filter(m => m.materialName || m.materialUrl).length} of {parseInt(plannedLessons)} lessons have content.
//                       </p>

//                       {/* Show ALL lessons in a grid format */}
//                       <div className="row">
//                         {Array.from({ length: parseInt(plannedLessons) }, (_, index) => {
//                           const lessonNumber = index + 1;
//                           const material = courseMaterials.find(m => m.lessonNumber === lessonNumber);
//                           const hasContent = material && (material.materialName || material.materialUrl);

//                           return (
//                             <div key={lessonNumber} className="col-md-6 col-lg-4 mb-2">
//                               <div className={`d-flex align-items-center p-2 rounded border ${hasContent ? 'bg-success bg-opacity-10 border-success' : 'bg-light border-light'}`}>
//                                 <FaFileAlt
//                                   size={35}
//                                   className={`me-2 ${hasContent ? 'text-success' : 'text-muted'}`}
//                                 />
//                                 <div className="flex-grow-1">
//                                   <small className="text-muted">Lesson {lessonNumber}</small>
//                                   <div className="fw-bold small">
//                                     {hasContent ? (
//                                       material.materialName || 'Material uploaded'
//                                     ) : (
//                                       <span className="text-muted">No material</span>
//                                     )}
//                                   </div>
//                                   {hasContent && material.materialUrl && (
//                                     <small className="text-success d-block">
//                                       <FaFileAlt className="me-1" size={10} />
//                                       File attached
//                                     </small>
//                                   )}
//                                 </div>
//                                 {hasContent ? (
//                                   <Badge bg="success" size="sm">
//                                     ✓
//                                   </Badge>
//                                 ) : (
//                                   <Badge bg="light" text="dark" size="sm">
//                                     Empty
//                                   </Badge>
//                                 )}
//                               </div>
//                             </div>
//                           );
//                         })}
//                       </div>
//                     </div>
//                   </Card.Body>
//                 </Card>
//               </Col>
//             </Row>
//           )}

//           <div className="d-flex justify-content-between align-items-center mb-3">
//             <h4>Uploading your lessons</h4>
//           </div>
//           <hr />

//           <div className="text-center py-5">
//             <div className="bg-light p-5 rounded-3 mb-4">
//               <FaInfoCircle className="text-primary mb-3" style={{ fontSize: '2.5rem' }} />
//               <h4>No pre-defined curriculum in live courses</h4>
//               <p className="text-muted mb-4">
//                 Live-Courses have no prerecorded courses. You'll set up your sessions schedule in last step.
//               </p>
//             </div>
//           </div>

//           <div className="d-flex justify-content-between">
//             <Button
//               variant="secondary"
//               onClick={handlePrevious}
//               disabled={isLoading}
//               className="mb-0"
//             >
//               Previous
//             </Button>
//             <Button
//               variant="primary"
//               onClick={saveAndContinue}
//               disabled={isLoading}
//               className="mb-0"
//             >
//               {isLoading ? (
//                 <>
//                   <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
//                   {mode === 'edit' ? 'Updating...' : 'Saving...'}
//                 </>
//               ) : 'Continue to Next Step'}
//             </Button>
//           </div>
//         </div>

//         {/* Course Materials Panel for Live Courses */}
//         <CourseMaterialsPanel
//           isOpen={showMaterialsPanel}
//           onClose={() => setShowMaterialsPanel(false)}
//           onSave={handleSaveCourseMaterials}
//           onAutoSave={handleAutoSaveCourseMaterials}
//           plannedLessons={parseInt(plannedLessons) || 0}
//           existingMaterials={courseMaterials}
//           courseId={courseData._id}
//         />
//       </div>
//     );
//   }

//   // Regular UI for recorded courses (keeping original structure + enhancements)
//   return (
//     <div id="step-3" role="tabpanel" className="content fade" aria-labelledby="steppertrigger3">
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <h4>
//           {mode === 'edit' ? 'Edit Course Curriculum' : 'Course Curriculum'}
//         </h4>
//         {mode === 'edit' && courseData._id && (
//           <div className="text-muted small">
//             Editing: {courseData.title}
//           </div>
//         )}
//       </div>
//       <div className="d-sm-flex justify-content-sm-between align-items-center mb-3">
//         <div></div>
//         <Button variant="primary" onClick={() => {
//           setEditMode(false);
//           setModuleTitle('');
//           setModuleDescription('');
//           setShowModulePanel(true);
//         }}>
//           <FaPlus className="me-2" /> Add Module
//         </Button>
//       </div>
//       <hr />

//       <div className="alert alert-info d-flex align-items-center mb-4">
//         <FaInfoCircle className="me-2 flex-shrink-0" size={18} />
//         <div>
//           <strong>Build Your Curriculum:</strong> Add modules and upload videos to create your course content.
//           Each module can contain multiple videos. Mark videos as "Preview" to allow non-enrolled users to watch them.
//           You can also attach multiple course materials (PDFs, documents) to each video.
//         </div>
//       </div>

//       {modules.length === 0 ? (
//         <div className="text-center py-5 bg-light rounded">
//           <FaExclamationTriangle className="text-warning mb-3" style={{ fontSize: '3rem' }} />
//           <h5>No modules added yet</h5>
//           <p className="text-muted">Start building your course by adding a module</p>
//           <Button
//             variant="primary"
//             onClick={() => {
//               setEditMode(false);
//               setModuleTitle('');
//               setModuleDescription('');
//               setShowModulePanel(true);
//             }}
//           >
//             <FaPlus className="me-2" /> Add First Module
//           </Button>
//         </div>
//       ) : (
//         <Row>
//           <Accordion
//             className="py-3 bg-light border rounded-3"
//             activeKey={activeKey}
//             onSelect={(key) => setActiveKey(key)}
//           >
//             {modules.map((module, moduleIndex) => (
//               <Accordion.Item
//                 eventKey={moduleIndex.toString()}
//                 className="rounded shadow-sm overflow-hidden mb-3"
//                 key={moduleIndex}
//               >
//                 <Accordion.Header>
//                   <div className='d-flex justify-content-between align-items-center w-100 pe-4'>
//                     <div className="fw-bold">
//                       {module.title}
//                     </div>
//                     <Badge bg="info" pill className="ms-2">
//                       {module.videos.length} video{module.videos.length !== 1 ? 's' : ''}
//                     </Badge>
//                   </div>
//                 </Accordion.Header>
//                 <Accordion.Body className="bg-light">
//                   <div className="d-flex justify-content-between align-items-center mb-3">
//                     <div>
//                       <h6 className="mb-1">Module Description</h6>
//                       <p className="text-muted mb-0">
//                         {module.description || 'No description provided'}
//                       </p>
//                     </div>
//                     <div className='d-flex pl-3'>
//                       <Button
//                         variant="outline-success"
//                         size="sm"
//                         className="me-1"
//                         onClick={() => handleModuleEdit(moduleIndex)}
//                       >
//                         <FaEdit /> Edit
//                       </Button>
//                       <Button
//                         variant="outline-danger"
//                         size="sm"
//                         onClick={() => showDeleteModuleConfirm(moduleIndex)}
//                       >
//                         <FaTimes /> Delete
//                       </Button>
//                     </div>
//                   </div>

//                   <hr />

//                   <div className="videos-container mb-3">
//                     {module.videos.length > 0 ? (
//                       module.videos.map((video, videoIndex) => (
//                         <VideoPreviewCard
//                           key={videoIndex}
//                           video={video}
//                           onEdit={handleVideoEdit}
//                           onDelete={() => showDeleteVideoConfirm(moduleIndex, videoIndex)}
//                           moduleIndex={moduleIndex}
//                           videoIndex={videoIndex}
//                         />
//                       ))
//                     ) : (
//                       <div className="text-center py-4 bg-white rounded shadow-sm">
//                         <p className="text-muted mb-0">No videos added to this module yet</p>
//                       </div>
//                     )}
//                   </div>

//                   <div className="text-center">
//                     <Button
//                       variant="primary"
//                       size="sm"
//                       onClick={() => openAddVideoPanel(moduleIndex)}
//                     >
//                       <FaPlus className="me-2" /> Add Video
//                     </Button>
//                   </div>
//                 </Accordion.Body>
//               </Accordion.Item>
//             ))}
//           </Accordion>

//           <div className="d-flex justify-content-between mt-3">
//             <Button variant="light" onClick={handlePrevious} disabled={isLoading} className="px-4">
//               Previous
//             </Button>
//             <Button variant="primary" onClick={saveAndContinue} disabled={isLoading} className="px-4">
//               {isLoading ? (
//                 <>
//                   <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
//                   {mode === 'edit' ? 'Updating...' : 'Saving...'}
//                 </>
//               ) : 'Save & Continue'}
//             </Button>
//           </div>
//         </Row>
//       )}

//       {/* Add/Edit Module Panel (keeping original) */}
//       <SlidePanel
//         isOpen={showModulePanel}
//         onClose={() => setShowModulePanel(false)}
//         title={editMode ? 'Edit Module' : 'Add New Module'}
//         size="md"
//       >
//         <Form onSubmit={handleModuleSubmit}>
//           <Form.Group className="mb-3">
//             <Form.Label>Module Title <span className="text-danger">*</span></Form.Label>
//             <Form.Control
//               type="text"
//               placeholder="e.g. Introduction to JavaScript"
//               value={moduleTitle}
//               onChange={(e) => setModuleTitle(e.target.value)}
//               required
//             />
//           </Form.Group>

//           <Form.Group className="mb-3">
//             <Form.Label>Module Description</Form.Label>
//             <Form.Control
//               as="textarea"
//               rows={3}
//               placeholder="Brief description of this module"
//               value={moduleDescription}
//               onChange={(e) => setModuleDescription(e.target.value)}
//             />
//             <Form.Text className="text-muted">
//               A good description helps students understand what they'll learn in this module.
//             </Form.Text>
//           </Form.Group>

//           <div className="d-grid mt-4">
//             <Button variant="primary" type="submit">
//               {editMode ? 'Update Module' : 'Add Module'}
//             </Button>
//           </div>
//         </Form>
//       </SlidePanel>

//       {/* ENHANCED: Add/Edit Video Panel with Multiple Materials Support */}
//       <SlidePanel
//         isOpen={showVideoPanel}
//         onClose={() => !isUploading && setShowVideoPanel(false)}
//         title={editMode ? 'Edit Video' : 'Add New Video'}
//         size="lg"
//       >
//         <Form onSubmit={handleVideoSubmit}>
//           <Form.Group className="mb-3">
//             <Form.Label>Video Title <span className="text-danger">*</span></Form.Label>
//             <Form.Control
//               type="text"
//               placeholder="e.g. Introduction to Variables"
//               value={videoTitle}
//               onChange={(e) => setVideoTitle(e.target.value)}
//               required
//               disabled={isUploading}
//             />
//           </Form.Group>

//           <Form.Group className="mb-3">
//             <Form.Label>Video Description</Form.Label>
//             <Form.Control
//               as="textarea"
//               rows={2}
//               placeholder="Brief description of this video"
//               value={videoDescription}
//               onChange={(e) => setVideoDescription(e.target.value)}
//               disabled={isUploading}
//             />
//           </Form.Group>

//           <Form.Group className="mb-3">
//             <Form.Label>{editMode ? 'Replace Video File (optional)' : 'Video File'} <span className={editMode ? '' : 'text-danger'}>*</span></Form.Label>
//             <Form.Control
//               type="file"
//               accept="video/*"
//               onChange={handleFileChange}
//               required={!editMode}
//               disabled={isUploading}
//             />
//             <Form.Text className="text-muted">
//               Maximum file size: 500MB. Supported formats: MP4, WebM, MOV, AVI, QuickTime
//             </Form.Text>
//           </Form.Group>

//           {/* ENHANCED: Multiple Course Materials Upload Field */}
//           <Form.Group className="mb-3">
//             <Form.Label>Course Materials (Optional)</Form.Label>
//             <Form.Control
//               type="file"
//               accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
//               onChange={handleMaterialFilesChange}
//               disabled={isUploading}
//               multiple
//             />
//             <Form.Text className="text-muted">
//               Upload multiple materials (PDF, DOC, PPT, Images, etc.) - Max 50MB per file
//             </Form.Text>
//           </Form.Group>

//           {/* ENHANCED: Material Files Preview */}
//           {materialFiles.length > 0 && (
//             <div className="mb-3">
//               <Form.Label>Selected Materials ({materialFiles.length})</Form.Label>
//               <div className="material-files-preview">
//                 {materialFiles.map((fileInfo, index) => (
//                   <FilePreviewCard
//                     key={index}
//                     fileInfo={fileInfo}
//                     onRemove={() => handleMaterialFileAction('remove', fileInfo)}
//                     onView={() => handleMaterialFileAction('view', fileInfo)}
//                     onDownload={() => handleMaterialFileAction('download', fileInfo)}
//                   />
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* ENHANCED: Chunked Upload Progress */}
//           {isUploading && videoFile && (
//             <ChunkedUploadPreview
//               file={videoFile}
//               progress={uploadProgress}
//               thumbnail={videoThumbnail}
//               uploadPhase={uploadPhase}
//               chunkInfo={chunkInfo}
//               uploadSpeed={uploadSpeed}
//               timeRemaining={timeRemaining}
//               materialFiles={materialFiles}
//             />
//           )}

//           <Form.Group className="mb-3">
//             <Form.Check
//               type="checkbox"
//               id="isPreview"
//               label="Make this video available as a free preview"
//               checked={isPreview}
//               onChange={(e) => setIsPreview(e.target.checked)}
//               disabled={isUploading}
//             />
//             <Form.Text className="text-muted">
//               Preview videos are visible to non-enrolled students and can help increase enrollment.
//             </Form.Text>
//           </Form.Group>

//           <div className="d-grid mt-4">
//             <Button variant="primary" type="submit" disabled={isUploading}>
//               {isUploading ? (
//                 <>
//                   <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
//                   {uploadPhase === 'preparing' ? 'Preparing...' :
//                     uploadPhase === 'materials' ? 'Uploading Materials...' :
//                       uploadPhase === 'chunking' ? 'Uploading Video...' :
//                         uploadPhase === 'gcs_upload' ? 'Uploading to Cloud...' :
//                           'Processing...'}
//                 </>
//               ) : editMode ? 'Update Video' : 'Add Video'}
//             </Button>
//           </div>
//         </Form>
//       </SlidePanel>

//       {/* Confirmation Dialog (keeping original) */}
//       <ConfirmDialog
//         show={showConfirmDelete}
//         onHide={() => setShowConfirmDelete(false)}
//         onConfirm={handleConfirmDelete}
//         title={confirmTitle}
//         message={confirmMessage}
//         confirmText="Delete"
//         cancelText="Cancel"
//         variant="danger"
//       />
//     </div>
//   );
// };

// export default Step3;


'use client';
import React, { useState, useEffect } from 'react';
import { Button, Row, Form, ProgressBar, Accordion, Spinner, Card, Badge, Col, Alert, Modal } from 'react-bootstrap';
import { FaPlay, FaEdit, FaTimes, FaPlus, FaExclamationTriangle, FaInfoCircle, FaVideo, FaEye, FaFileAlt, FaUpload, FaClock, FaCheck, FaDownload, FaEllipsisV, FaTrash } from 'react-icons/fa';
import { toast } from 'sonner';
import { useCourseContext } from '@/context/CourseContext';
import SlidePanel from '../../../components/side-panel/SlidePanel';
import ConfirmDialog from '../../../components/dialog/ConfirmDialog';
import Image from 'next/image';
import liveIcon from '../../../../assets/images/live-course.png';

// Enhanced Circle Progress Component (from original)
const CircleProgress = ({ progress, size = 40, strokeWidth = 4, color = 'primary' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  const getStrokeColor = () => {
    const colors = {
      danger: '#dc3545',
      warning: '#ffc107',
      info: '#0dcaf0',
      primary: '#0d6efd',
      success: '#198754'
    };
    return colors[color] || colors.primary;
  };

  return (
    <div className="position-relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="position-absolute top-0 start-0">
        <circle
          stroke="#f0f0f0"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke={getStrokeColor()}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.3s ease, stroke 0.3s ease',
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%'
          }}
        />
      </svg>
      <div
        className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
        style={{ fontSize: size / 3.5, fontWeight: 'bold', color: getStrokeColor() }}
      >
        {progress}%
      </div>
    </div>
  );
};


// Format seconds to MM:SS (from original)
const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

// ENHANCED: File Preview Card Component
const FilePreviewCard = ({ fileInfo, onRemove, onView, onDownload }) => {
  const [showActions, setShowActions] = useState(false);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="file-preview-card position-relative border rounded p-2 mb-2 bg-light">
      <div className="d-flex align-items-center">
        {/* File Preview/Icon */}
        <div className="file-preview-thumbnail me-3 flex-shrink-0">
          {fileInfo.preview ? (
            <img
              src={fileInfo.preview}
              alt={fileInfo.name}
              className="rounded"
              style={{ width: '48px', height: '48px', objectFit: 'cover' }}
            />
          ) : (
            <div
              className="d-flex align-items-center justify-content-center rounded bg-secondary bg-opacity-25"
              style={{ width: '48px', height: '48px', fontSize: '24px' }}
            >
              {fileInfo.icon || '📁'}
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="flex-grow-1 min-width-0">
          <div className="fw-bold text-truncate" title={fileInfo.name}>
            {fileInfo.name}
          </div>
          <div className="small text-muted">
            {formatFileSize(fileInfo.size)}
            {fileInfo.uploadProgress !== undefined && (
              <span className="ms-2 text-primary">
                {fileInfo.uploadProgress}% uploaded
              </span>
            )}
          </div>
          {fileInfo.url && (
            <div className="small text-success">
              <FaCheck className="me-1" size={10} />
              Uploaded successfully
            </div>
          )}
        </div>

        {/* Actions Dropdown */}
        <div className="file-actions position-relative">
          <Button
            variant="outline-secondary"
            size="sm"
            className="p-1"
            onClick={() => setShowActions(!showActions)}
          >
            <FaEllipsisV size={12} />
          </Button>

          {showActions && (
            <div className="dropdown-menu show position-absolute end-0 shadow">
              {fileInfo.url && (
                <>
                  <button
                    className="dropdown-item d-flex align-items-center"
                    onClick={() => {
                      onView && onView(fileInfo);
                      setShowActions(false);
                    }}
                  >
                    <FaEye className="me-2" size={12} />
                    View File
                  </button>
                  <button
                    className="dropdown-item d-flex align-items-center"
                    onClick={() => {
                      onDownload && onDownload(fileInfo);
                      setShowActions(false);
                    }}
                  >
                    <FaDownload className="me-2" size={12} />
                    Download
                  </button>
                  <div className="dropdown-divider"></div>
                </>
              )}
              <button
                className="dropdown-item d-flex align-items-center text-danger"
                onClick={() => {
                  onRemove && onRemove(fileInfo);
                  setShowActions(false);
                }}
              >
                <FaTrash className="me-2" size={12} />
                Remove
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Upload Progress Bar */}
      {fileInfo.uploadProgress !== undefined && fileInfo.uploadProgress < 100 && (
        <div className="mt-2">
          <ProgressBar
            now={fileInfo.uploadProgress}
            style={{ height: '4px' }}
            variant="primary"
            animated
          />
        </div>
      )}

      {/* Click overlay to close actions */}
      {showActions && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ zIndex: 999 }}
          onClick={() => setShowActions(false)}
        />
      )}
    </div>
  );
};

// Video Player Modal Component (from original)
const VideoPlayerModal = ({ show, onHide, videoUrl, videoTitle }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (show) {
      setLoading(true);
      setError(false);
    }
  }, [show, videoUrl]);

  const handleVideoLoad = () => {
    setLoading(false);
  };

  const handleVideoError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="video-player-modal">
      <Modal.Header closeButton>
        <Modal.Title>
          <FaPlay className="me-2" />
          {videoTitle}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        <div className="video-container position-relative" style={{ aspectRatio: '16/9', backgroundColor: '#000' }}>
          {loading && (
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
              <div className="text-center text-white">
                <Spinner animation="border" variant="light" className="mb-2" />
                <div>Loading video...</div>
              </div>
            </div>
          )}

          {error && (
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
              <div className="text-center text-white">
                <FaExclamationTriangle size={40} className="mb-2" />
                <div>Failed to load video</div>
                <small className="text-muted">Please try again later</small>
              </div>
            </div>
          )}

          {videoUrl && !error && (
            <video
              controls
              autoPlay
              className="w-100 h-100"
              style={{ objectFit: 'contain' }}
              onLoadedData={handleVideoLoad}
              onError={handleVideoError}
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};

// Enhanced Video Preview Card Component with all original logic
const VideoPreviewCard = ({ video, onEdit, onDelete, moduleIndex, videoIndex }) => {
  const [showPlayer, setShowPlayer] = useState(false);

  // Keep original status logic
  const isProcessing = video.status === 'processing' || video.isProcessing;
  const isUploading = video.status === 'uploading' && video.progress < 90;
  const isFailed = video.status === 'failed';
  const isCompleted = video.status === 'completed' ||
    (!video.status && video.url && !video.url.includes('temp-')) ||
    (video.progress === 100 && video.url && !video.url.includes('temp-'));

  const progress = video.progress || 0;

  const isPlayable = isCompleted && video.url &&
    !video.url.includes('temp-') &&
    !video.url.includes('/api/course/upload/finalize/');

  // ENHANCED: Get all materials (matches your Course model structure)
  const getAllMaterials = () => {
    const materials = [];

    // New multiple materials format (matches videoMaterialSchema)
    if (video.materials && Array.isArray(video.materials)) {
      materials.push(...video.materials.map(material => ({
        name: material.name,
        url: material.url,
        size: material.size,
        type: material.type,
        uploadedAt: material.uploadedAt
      })));
    }

    // Legacy single material support (for backward compatibility)
    if (video.materialUrl && !materials.some(m => m.url === video.materialUrl)) {
      materials.push({
        name: video.materialName || 'Course Material',
        url: video.materialUrl,
        size: video.materialSize || 0,
        type: video.materialType || 'application/octet-stream'
      });
    }

    return materials;
  };

  const materials = getAllMaterials();

  // Format file size helper
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get material file icon (matches your schema)
  const getMaterialIcon = (materialName) => {
    if (!materialName) return '📁';
    const extension = materialName.split('.').pop()?.toLowerCase();
    const iconMap = {
      'pdf': '📄',
      'doc': '📝', 'docx': '📝',
      'ppt': '📊', 'pptx': '📊',
      'txt': '📃',
      'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️'
    };
    return iconMap[extension] || '📁';
  };

  // Download material file (matches your schema structure)
  const downloadMaterial = (material) => {
    if (material.url) {
      const link = document.createElement('a');
      link.href = material.url;
      link.download = material.name || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Preview material file
  const previewMaterial = (material) => {
    if (material.url) {
      window.open(material.url, '_blank');
    }
  };

  const getStatusColor = () => {
    if (isFailed) return 'danger';
    if (isProcessing) return 'info';
    if (isUploading) return 'warning';
    if (isCompleted) return 'success';
    return 'secondary';
  };

  const getDetailedStatusText = () => {
    if (isFailed) return 'Upload Failed - Please try again';

    if (isProcessing) {
      const phase = video.phase || 'Processing video...';
      const processingStep = video.processingStep || 'processing';

      const phaseDescriptions = {
        'combining': `Combining video chunks... ${progress}%`,
        'uploading': `Uploading to cloud storage... ${progress}%`,
        'transferring': `Transferring to cloud storage... ${progress}%`,
        'finalizing': `Finalizing upload... ${progress}%`,
        'completed': 'Processing completed successfully!'
      };

      return phaseDescriptions[processingStep] || `${phase} ${progress}%`;
    }

    if (isUploading) {
      return `Uploading chunk ${video.currentChunk || 1}/${video.totalChunks || 1}... ${progress}%`;
    }

    if (isCompleted) return '';
    return 'Waiting to start upload';
  };

  const handlePlayClick = () => {
    if (isPlayable) {
      setShowPlayer(true);
    }
  };

  const getProgressIndicator = () => {
    if (isCompleted) {
      return (
        <div className="position-absolute bottom-0 end-0 m-1">
          <Badge bg="success" className="rounded-circle p-1">
            <FaCheck size={12} />
          </Badge>
        </div>
      );
    }

    if (isProcessing || isUploading) {
      const displayProgress = isProcessing ? Math.min(Math.max(progress, 90), 99) : progress;

      return (
        <div className="position-absolute bottom-0 end-0 m-1">
          <CircleProgress
            progress={displayProgress}
            size={24}
            strokeWidth={3}
            color={isProcessing ? 'info' : 'warning'}
          />
        </div>
      );
    }

    if (isFailed) {
      return (
        <div className="position-absolute bottom-0 end-0 m-1">
          <Badge bg="danger" className="rounded-circle p-1">
            <FaExclamationTriangle size={12} />
          </Badge>
        </div>
      );
    }

    return null;
  };

  const getProcessingOverlay = () => {
    if (isUploading || isProcessing) {
      return (
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center">
          <div className="text-center text-white">
            {isProcessing ? (
              <div className="d-flex flex-column align-items-center">
                <Spinner animation="border" size="sm" variant="light" className="mb-1" />
                <div className="small">{Math.min(Math.max(progress, 90), 99)}%</div>
                <div className="x-small">
                  {video.processingStep === 'combining' ? 'Combining...' :
                    video.processingStep === 'uploading' ? 'Uploading...' :
                      video.processingStep === 'transferring' ? 'Transferring...' :
                        video.processingStep === 'finalizing' ? 'Finalizing...' :
                          'Processing...'}
                </div>
              </div>
            ) : (
              <div className="d-flex flex-column align-items-center">
                <CircleProgress progress={progress} size={30} color="warning" />
                <div className="x-small mt-1">Uploading...</div>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Card className={`mb-3 shadow-sm border-0 video-card ${isUploading ? 'uploading border-warning' :
        isProcessing ? 'processing border-info' :
          isFailed ? 'failed border-danger' :
            isCompleted ? 'completed border-success' : ''
        }`}>
        <div className="d-flex align-items-start p-3">
          {/* Video Thumbnail with Play Button */}
          <div
            className={`video-thumbnail-container me-3 flex-shrink-0 rounded overflow-hidden position-relative ${isPlayable ? 'playable' : ''}`}
            style={{
              width: '120px',
              height: '68px',
              backgroundColor: '#f0f0f0',
              cursor: isPlayable ? 'pointer' : 'default'
            }}
            onClick={handlePlayClick}
          >
            {video.thumbnailUrl ? (
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-100 h-100 object-fit-cover"
              />
            ) : (
              <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-light">
                <FaVideo size={24} className="text-secondary" />
              </div>
            )}

            {/* Play Button Overlay for Completed Videos */}
            {isPlayable && (
              <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-25 opacity-0 hover-opacity-100 transition-opacity">
                <div className="bg-primary rounded-circle p-2 text-white d-flex">
                  <FaPlay size={20} />
                </div>
              </div>
            )}

            {/* Processing/Upload Overlay */}
            {getProcessingOverlay()}

            {/* Failed Upload Overlay */}
            {isFailed && (
              <div className="position-absolute top-0 start-0 w-100 h-100 bg-danger bg-opacity-75 d-flex align-items-center justify-content-center">
                <div className="text-center text-white">
                  <FaExclamationTriangle size={20} />
                  <div className="small">Failed</div>
                </div>
              </div>
            )}

            {/* Duration Badge */}
            {video.duration > 0 && (
              <div className="position-absolute bottom-0 start-0 m-1">
                <Badge bg="dark" className="rounded-pill opacity-75">
                  <FaClock className="me-1" size={10} />
                  {formatDuration(video.duration)}
                </Badge>
              </div>
            )}

            {/* Progress Indicator */}
            {getProgressIndicator()}
          </div>

          {/* Video Details */}
          <div className="flex-grow-1">
            <div className="d-flex justify-content-between">
              <div className="flex-grow-1">
                <h6 className="mb-1 d-flex align-items-center">
                  {video.title}
                </h6>

                {video.description && (
                  <p className="text-muted small mb-1">{video.description}</p>
                )}

                {/* Enhanced Progress Information */}
                <div className="small mb-2">
                  <span className={`fw-bold ${isCompleted ? 'text-success' :
                    isProcessing ? 'text-info' :
                      isUploading ? 'text-warning' :
                        isFailed ? 'text-danger' : 'text-muted'
                    }`}>
                    {getDetailedStatusText()}
                  </span>
                </div>

                {/* Progress Bar for processing/uploading videos */}
                {(isUploading || isProcessing) && (
                  <div className="mb-2">
                    <ProgressBar
                      now={isProcessing ? Math.min(Math.max(progress, 90), 99) : Math.min(progress, 89)}
                      style={{ height: '4px' }}
                      variant={isProcessing ? 'info' : 'warning'}
                      className="mb-1 progress-bar-animated"
                      striped={isUploading}
                      animated={isUploading || isProcessing}
                    />
                    <small className={isProcessing ? 'text-info' : 'text-warning'}>
                      {video.phase || (isProcessing ?
                        'Processing video on cloud storage...' :
                        `Uploading chunk ${video.currentChunk || 1}/${video.totalChunks || 1}...`
                      )}
                    </small>
                  </div>
                )}

                {/* ENHANCED: Multiple materials display with proper file information (like SlidePanel) */}
                {materials.length > 0 && (
                  <div className="mt-2">
                    <div className="materials-grid d-flex flex-wrap gap-2">
                      {materials.map((material, materialIndex) => (
                        <MaterialFileCard
                          key={materialIndex}
                          material={material}
                          onPreview={previewMaterial}
                          onDownload={downloadMaterial}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="ms-3 d-flex flex-column">
                {isPlayable && (
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="p-1 mb-1"
                    onClick={handlePlayClick}
                    title="Play video"
                  >
                    <FaPlay size={14} />
                  </Button>
                )}
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="p-1 mb-1"
                  onClick={() => onEdit(moduleIndex, videoIndex)}
                  disabled={isUploading || isProcessing}
                  title="Edit video"
                >
                  <FaEdit size={14} />
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  className="p-1"
                  onClick={() => onDelete(moduleIndex, videoIndex)}
                  disabled={isUploading || isProcessing}
                  title="Delete video"
                >
                  <FaTimes size={14} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Video Player Modal */}
      <VideoPlayerModal
        show={showPlayer}
        onHide={() => setShowPlayer(false)}
        videoUrl={video.url}
        videoTitle={video.title}
      />
    </>
  );
};

// ENHANCED: Compact Material File Card Component (Updated with Remove in Dropdown)
const MaterialFileCard = ({ material, onPreview, onDownload, onRemove, showRemove = false }) => {
  const [showActions, setShowActions] = useState(false);

  const getMaterialIcon = (materialName) => {
    if (!materialName) return '📁';
    const extension = materialName.split('.').pop()?.toLowerCase();
    const iconMap = {
      'pdf': '📄',
      'doc': '📝', 'docx': '📝',
      'ppt': '📊', 'pptx': '📊',
      'txt': '📃',
      'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️'
    };
    return iconMap[extension] || '📁';
  };

  // Truncate filename to show max 12 characters with ...
  const truncateFileName = (name) => {
    if (!name) return 'Unknown';
    if (name.length <= 12) return name;
    return name.substring(0, 12) + '...';
  };

  return (
    <div className="material-file-square position-relative">
      <div
        className="d-flex flex-column border rounded bg-light"
        style={{ width: '100px', height: '100px', cursor: 'pointer' }}
      >
        {/* File Icon Area (80% - Top) */}
        <div
          className="d-flex align-items-center justify-content-center flex-grow-1"
          style={{ height: '80%' }}
        >
          <div style={{ fontSize: '40px' }}>
            {getMaterialIcon(material.name)}
          </div>
        </div>

        {/* File Name Area (20% - Bottom) */}
        <div
          className="d-flex align-items-center justify-content-center border-top bg-white"
          style={{ height: '20%', fontSize: '9px' }}
        >
          <span
            className="text-truncate fw-bold text-dark px-1"
            title={material.name}
          >
            {truncateFileName(material.name)}
          </span>
        </div>

        {/* ENHANCED: Dots Menu Icon with Remove option */}
        <div
          className="position-absolute"
          style={{
            top: '8px',
            right: '8px'
          }}
        >
          <div
            className="d-flex w-100 align-items-center justify-content-center"
            style={{
              fontSize: '14px',
              color: '#666',
              cursor: 'pointer'
            }}
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
          >
            ⋮
          </div>

          {/* ENHANCED: Dropdown with Remove option */}
          {showActions && (
            <div
              className="dropdown-menu bg-white show position-absolute shadow-lg border"
              style={{
                top: '100%',
                right: '0',
                zIndex: 9999,
                minWidth: '130px',
                marginTop: '4px',
                padding: '0px'
              }}
            >
              {material.url && (
                <>
                  <button
                    className="dropdown-item d-flex align-items-center py-2 px-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreview && onPreview(material);
                      setShowActions(false);
                    }}
                  >
                    <FaEye className="me-2" size={12} />
                    <small>Preview</small>
                  </button>
                  <button
                    className="dropdown-item d-flex align-items-center py-2 px-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownload && onDownload(material);
                      setShowActions(false);
                    }}
                  >
                    <FaDownload className="me-2" size={12} />
                    <small>Download</small>
                  </button>
                </>
              )}
              {/* ENHANCED: Add Remove option in dropdown */}
              {showRemove && onRemove && (
                <>
                  {material.url && <div className="dropdown-divider"></div>}
                  <button
                    className="dropdown-item d-flex align-items-center py-2 px-3 text-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove && onRemove(material);
                      setShowActions(false);
                    }}
                  >
                    <FaTrash className="me-2" size={12} />
                    <small>Remove</small>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Click overlay to close actions */}
      {showActions && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          onClick={(e) => {
            e.stopPropagation();
            setShowActions(false);
          }}
        />
      )}
    </div>
  );
};

// ENHANCED: Upload preview component with real-time progress (keeping original structure)
const ChunkedUploadPreview = ({
  file,
  progress,
  thumbnail,
  uploadPhase,
  chunkInfo,
  uploadSpeed,
  timeRemaining,
  processingStep,
  materialFiles = []
}) => {
  const getPhaseText = () => {
    switch (uploadPhase) {
      case 'preparing':
        return "Preparing video for upload...";
      case 'materials':
        return `Uploading ${materialFiles.length} course material(s)...`;
      case 'chunking':
        return `Uploading ${chunkInfo || 'chunks'}...`;
      case 'combining':
        return "Combining video chunks...";
      case 'gcs_upload':
        return "Uploading to cloud storage...";
      case 'finalizing':
        return "Finalizing upload...";
      case 'completed':
        return "Upload completed!";
      default:
        return "Processing video...";
    }
  };

  const getProgressColor = () => {
    if (progress < 15) return "danger";
    if (progress < 40) return "warning";
    if (progress < 70) return "info";
    if (progress < 95) return "primary";
    return "success";
  };

  return (
    <div className="mt-3 bg-light rounded p-3">
      <div className="d-flex align-items-center">
        <div
          className="me-3 rounded overflow-hidden flex-shrink-0"
          style={{ width: '120px', height: '68px', position: 'relative' }}
        >
          {thumbnail ? (
            <img
              src={thumbnail}
              alt="Video thumbnail"
              className="w-100 h-100 object-fit-cover"
            />
          ) : (
            <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-secondary bg-opacity-10">
              <FaVideo size={24} className="text-secondary" />
            </div>
          )}

          {/* Progress overlay with proper phase indication */}
          <div className="position-absolute bottom-0 start-0 w-100 bg-dark bg-opacity-50 text-white text-center py-1">
            <small>
              {progress}%
              {uploadPhase === 'gcs_upload' && (
                <span className="ms-1">☁️</span>
              )}
              {uploadPhase === 'combining' && (
                <span className="ms-1">🔧</span>
              )}
            </small>
          </div>
        </div>

        <div className="flex-grow-1">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div>
              <h6 className="mb-0 text-truncate" style={{ maxWidth: '200px' }}>{file.name}</h6>
              <small className="text-muted">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </small>
              <div className="small mt-1" style={{ color: getProgressColor() === 'success' ? '#198754' : '#0d6efd' }}>
                {getPhaseText()}
              </div>
              {uploadSpeed && (
                <div className="small text-muted">
                  Speed: {uploadSpeed} MB/s
                  {timeRemaining && ` • ETA: ${timeRemaining}`}
                </div>
              )}
            </div>
            <div className="text-center">
              <CircleProgress
                progress={progress}
                size={40}
                color={getProgressColor()}
              />
            </div>
          </div>

          {/* Overall Progress Bar with proper phase colors */}
          <ProgressBar
            now={progress}
            style={{ height: '8px' }}
            variant={getProgressColor()}
            className="mb-1 progress-bar-animated"
            striped={uploadPhase !== 'completed'}
            animated={uploadPhase !== 'completed'}
          />

          {/* Enhanced chunk/processing info */}
          {chunkInfo && uploadPhase === 'chunking' && (
            <div className="small text-muted">
              {chunkInfo}
            </div>
          )}

          {(uploadPhase === 'combining' || uploadPhase === 'gcs_upload' || uploadPhase === 'finalizing') && (
            <div className="small text-info">
              {uploadPhase === 'combining' && 'Combining video chunks...'}
              {uploadPhase === 'gcs_upload' && 'Real-time upload to cloud storage...'}
              {uploadPhase === 'finalizing' && 'Finalizing upload...'}
            </div>
          )}

          {/* Show material upload progress */}
          {materialFiles.length > 0 && uploadPhase === 'materials' && (
            <div className="small text-primary mt-1">
              Uploading {materialFiles.length} material file(s)...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ENHANCED: Course Materials Panel Component for Live Courses with Multiple Materials Support
const CourseMaterialsPanel = ({ isOpen, onClose, onSave, onAutoSave, plannedLessons, existingMaterials = [], courseId }) => {
  const [materials, setMaterials] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  // Use enhanced courseContext for uploads
  const { uploadMultipleCourseMaterials } = useCourseContext();

  // Initialize materials array based on planned lessons with MULTIPLE MATERIALS SUPPORT
  useEffect(() => {
    if (isOpen && plannedLessons > 0) {
      const newMaterials = Array.from({ length: plannedLessons }, (_, index) => {
        const lessonNumber = index + 1;
        const existingMaterial = existingMaterials.find(m => m.lessonNumber === lessonNumber);

        if (existingMaterial) {
          return {
            lessonNumber,
            // ENHANCED: Support multiple materials array (matching your Course model)
            materials: existingMaterial.materials || [],
            
            // LEGACY: Keep single material fields for backward compatibility
            materialName: existingMaterial.materialName || '',
            materialFile: null,
            materialUrl: existingMaterial.materialUrl || '',
            materialSize: existingMaterial.materialSize || null,
            materialType: existingMaterial.materialType || null
          };
        } else {
          return {
            lessonNumber,
            materials: [], // ENHANCED: Multiple materials array
            materialName: '',
            materialFile: null,
            materialUrl: '',
            materialSize: null,
            materialType: null
          };
        }
      });

      setMaterials(newMaterials);

      const higherLessonData = existingMaterials.filter(m => m.lessonNumber > plannedLessons && (m.materialName || m.materialUrl || (m.materials && m.materials.length > 0)));
      if (higherLessonData.length > 0) {
        toast.warning(`Materials for lessons ${higherLessonData.map(m => m.lessonNumber).join(', ')} will be hidden but preserved.`);
      }
    }
  }, [isOpen, plannedLessons, existingMaterials]);

  // ENHANCED: Handle multiple files change for a lesson
  const handleMultipleFilesChange = async (lessonIndex, files) => {
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);
    setIsUploading(true);

    try {
      // Start upload progress tracking
      setUploadProgress(prev => ({ ...prev, [lessonIndex]: 10 }));

      console.log('Starting upload for', filesArray.length, 'files...');

      // Upload multiple files using the context method
      let results;
      try {
        results = await uploadMultipleCourseMaterials(
          filesArray,
          (fileIndex, progress, fileName) => {
            // Update progress for this lesson
            const overallProgress = Math.round(((fileIndex + (progress / 100)) / filesArray.length) * 100);
            setUploadProgress(prev => ({ ...prev, [lessonIndex]: Math.min(overallProgress, 90) }));
            console.log(`File ${fileIndex + 1}/${filesArray.length} (${fileName}): ${progress}%`);
          },
          (fileIndex, result, fileName) => {
            console.log(`File ${fileName} completed:`, result);
          }
        );
      } catch (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('Upload results:', results);

      // FIXED: Handle both array and non-array responses
      let resultsArray;
      if (Array.isArray(results)) {
        resultsArray = results;
      } else if (results && results.results && Array.isArray(results.results)) {
        resultsArray = results.results;
      } else if (results && results.success) {
        // Single successful result
        resultsArray = [{ success: true, data: results.data || results, file: filesArray[0] }];
      } else {
        // Fallback: create results array from files
        console.warn('Unexpected results format, creating fallback results');
        resultsArray = filesArray.map((file, index) => ({
          success: false,
          file: file,
          error: 'Unexpected response format'
        }));
      }

      console.log('Processed results array:', resultsArray);

      // Process successful uploads
      const successfulUploads = resultsArray.filter(r => r && r.success);
      
      if (successfulUploads.length > 0) {
        const updatedMaterials = [...materials];
        const lesson = updatedMaterials[lessonIndex];
        
        // Add new materials to the lesson's materials array
        const newMaterials = successfulUploads.map(upload => {
          const data = upload.data || {};
          const file = upload.file || {};
          
          return {
            name: data.originalName || data.filename || file.name || 'Unknown File',
            url: data.fileUrl || data.url || '',
            size: data.fileSize || file.size || 0,
            type: data.mimeType || data.fileType || file.type || 'application/octet-stream',
            uploadedAt: new Date()
          };
        });

        lesson.materials = [...(lesson.materials || []), ...newMaterials];
        setMaterials(updatedMaterials);

        toast.success(`${successfulUploads.length} file(s) uploaded successfully for Lesson ${lessonIndex + 1}`);

        // Auto-save after successful upload
        const materialsToSave = createCompleteMaterialsList(updatedMaterials);
        onAutoSave(materialsToSave);
      }

      const failedUploads = resultsArray.filter(r => r && !r.success);
      if (failedUploads.length > 0) {
        console.error('Failed uploads:', failedUploads);
        toast.error(`${failedUploads.length} file(s) failed to upload`);
      }

      // If no successful uploads but no explicit failures, treat as error
      if (successfulUploads.length === 0 && failedUploads.length === 0) {
        console.error('No results processed, treating as failure');
        toast.error('Upload completed but no files were processed successfully');
      }

    } catch (error) {
      console.error(`Error uploading materials for lesson ${lessonIndex + 1}:`, error);
      toast.error(`Failed to upload materials for lesson ${lessonIndex + 1}: ${error.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(prev => {
        const updated = { ...prev };
        delete updated[lessonIndex];
        return updated;
      });
    }
  };

  // ENHANCED: Remove material from lesson
  const removeMaterialFromLesson = (lessonIndex, materialIndex) => {
    const updatedMaterials = [...materials];
    updatedMaterials[lessonIndex].materials.splice(materialIndex, 1);
    setMaterials(updatedMaterials);

    // Auto-save after removal
    const materialsToSave = createCompleteMaterialsList(updatedMaterials);
    onAutoSave(materialsToSave);
    
    toast.success('Material removed successfully');
  };

  // ENHANCED: Create complete materials list with multiple materials support
  const createCompleteMaterialsList = (currentMaterials) => {
    const completeList = [];
    for (let i = 1; i <= plannedLessons; i++) {
      const existingMaterial = currentMaterials.find(m => m.lessonNumber === i);
      if (existingMaterial) {
        completeList.push({
          lessonNumber: i,
          // ENHANCED: Multiple materials array
          materials: existingMaterial.materials || [],
          
          // LEGACY: Single material fields for backward compatibility
          materialName: existingMaterial.materialName || '',
          materialUrl: existingMaterial.materialUrl || '',
          materialSize: existingMaterial.materialSize || null,
          materialType: existingMaterial.materialType || null,
          hasContent: !!(
            (existingMaterial.materials && existingMaterial.materials.length > 0) ||
            existingMaterial.materialName || 
            existingMaterial.materialUrl
          )
        });
      } else {
        completeList.push({
          lessonNumber: i,
          materials: [],
          materialName: '',
          materialUrl: '',
          materialSize: null,
          materialType: null,
          hasContent: false
        });
      }
    }
    return completeList;
  };

  // ENHANCED: Handle form submit with multiple materials
  const handleSubmit = async (e) => {
    e.preventDefault();
    const materialsToSave = createCompleteMaterialsList(materials);
    onSave(materialsToSave);
    
    const totalMaterials = materialsToSave.reduce((count, lesson) => 
      count + (lesson.materials ? lesson.materials.length : 0), 0
    );
    
    toast.success(`Course materials saved for all ${plannedLessons} lessons (${totalMaterials} total files)`);
    onClose();
  };

  // ENHANCED: Get total materials count for a lesson
  const getLessonMaterialsCount = (lesson) => {
    let count = 0;
    
    // Count multiple materials
    if (lesson.materials && lesson.materials.length > 0) {
      count += lesson.materials.length;
    }
    
    // Count legacy single material if not already counted
    if (lesson.materialUrl && !lesson.materials?.some(m => m.url === lesson.materialUrl)) {
      count += 1;
    }
    
    return count;
  };

  // ENHANCED: Download material file
  const downloadMaterial = (material) => {
    if (material.url) {
      const link = document.createElement('a');
      link.href = material.url;
      link.download = material.name || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // ENHANCED: Preview material file
  const previewMaterial = (material) => {
    if (material.url) {
      window.open(material.url, '_blank');
    }
  };

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={() => !isUploading && onClose()}
      title={`Add Course Materials (${plannedLessons} Lessons)`}
      size="lg"
    >
      <div style={{ height: '80vh', display: 'flex', flexDirection: 'column' }}>
        <Form onSubmit={handleSubmit} className="h-100 d-flex flex-column">
          <Alert variant="info" className="mb-3 flex-shrink-0">
            <FaInfoCircle className="me-2" />
            Add multiple materials for each lesson. You can upload multiple files per lesson.
            <br />
            <strong>All {plannedLessons} lessons will be saved</strong> (including empty ones).
          </Alert>

          {/* FIXED: Scrollable content area with fixed height */}
          <div className="flex-grow-1 overflow-auto" style={{ maxHeight: 'calc(80vh - 200px)' }}>
            {materials.map((material, index) => {
              const materialsCount = getLessonMaterialsCount(material);
              
              return (
                <Card key={index} className="mb-3 border flex-shrink-0">
                  <Card.Header className={`py-2 ${materialsCount > 0 ? 'bg-success bg-opacity-10' : 'bg-light'}`}>
                    <div className="d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">Lesson {material.lessonNumber}</h6>
                      {materialsCount > 0 && (
                        <Badge bg="success" size="sm">
                          <FaFileAlt className="me-1" size={10} />
                          {materialsCount} File{materialsCount !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </Card.Header>
                  <Card.Body className="py-3">
                    {/* ENHANCED: Multiple Files Upload */}
                    <Form.Group className="mb-3">
                      <Form.Label>Upload Multiple Files</Form.Label>
                      <Form.Control
                        type="file"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                        onChange={(e) => handleMultipleFilesChange(index, e.target.files)}
                        disabled={isUploading}
                        multiple
                      />
                      <Form.Text className="text-muted">
                        Select multiple files: PDF, DOC, DOCX, PPT, PPTX, TXT, JPG, PNG (Max 50MB each)
                      </Form.Text>
                    </Form.Group>

                    {/* ENHANCED: Display uploaded materials with scrollable grid */}
                    {material.materials && material.materials.length > 0 && (
                      <div className="mb-3">
                        <Form.Label>Uploaded Materials ({material.materials.length})</Form.Label>
                        <div 
                          className="materials-grid-container" 
                          style={{ 
                            maxHeight: '200px', 
                            overflowY: 'auto',
                            border: '1px solid #dee2e6',
                            borderRadius: '0.375rem',
                            padding: '10px',
                            backgroundColor: '#f8f9fa'
                          }}
                        >
                          <div className="d-flex flex-wrap gap-2">
                            {material.materials.map((materialFile, materialIndex) => (
                              <MaterialFileCard
                                key={materialIndex}
                                material={materialFile}
                                onPreview={() => previewMaterial(materialFile)}
                                onDownload={() => downloadMaterial(materialFile)}
                                onRemove={() => removeMaterialFromLesson(index, materialIndex)}
                                showRemove={true}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Upload Progress */}
                    {uploadProgress[index] && (
                      <div className="mt-2 p-2 bg-warning bg-opacity-10 rounded">
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center">
                            <FaFileAlt className="me-2 text-warning" />
                            <span className="text-warning">Uploading materials...</span>
                          </div>
                          <CircleProgress progress={uploadProgress[index]} size={30} />
                        </div>
                      </div>
                    )}

                    {/* Status Display */}
                    {materialsCount > 0 && !uploadProgress[index] && (
                      <div className="mt-2 p-2 bg-success bg-opacity-10 rounded">
                        <div className="d-flex align-items-center">
                          <FaFileAlt className="me-2 text-success" />
                          <span className="text-success">{materialsCount} material(s) uploaded successfully</span>
                        </div>
                      </div>
                    )}

                    {materialsCount === 0 && !uploadProgress[index] && (
                      <div className="mt-2 p-2 bg-light rounded">
                        <div className="d-flex align-items-center">
                          <FaFileAlt className="me-2 text-muted" />
                          <span className="text-muted">No materials added yet</span>
                        </div>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              );
            })}
          </div>

          {/* FIXED: Footer area with fixed position */}
          <div className="mt-3 pt-3 border-top flex-shrink-0">
            <div className="d-grid">
              <Button variant="primary" type="submit" disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                    Uploading Materials...
                  </>
                ) : `Save Course Materials (All ${plannedLessons} Lessons)`}
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </SlidePanel>
  );
};

const Step3 = ({ stepperInstance, mode = 'create' }) => {
  const {
    courseData,
    setCourseData,
    isLoading,
    saveCurriculum,
    saveAdditionalInfo,
    courseLoading,
    courseLoadError,
    // ENHANCED: Use new context methods
    uploadVideoWithMaterials,
    validateFile,
    generateFilePreview
  } = useCourseContext();

  const [modules, setModules] = useState([]);
  const [plannedLessons, setPlannedLessons] = useState('');
  const [courseMaterials, setCourseMaterials] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Dynamic localStorage key based on mode
  const STEP3_STORAGE_KEY = `${mode}_course_step3_data`;

  // Panel state (keeping original)
  const [showModulePanel, setShowModulePanel] = useState(false);
  const [showVideoPanel, setShowVideoPanel] = useState(false);
  const [showMaterialsPanel, setShowMaterialsPanel] = useState(false);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Form state (keeping original + enhanced multiple materials)
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDescription, setModuleDescription] = useState('');

  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [videoThumbnail, setVideoThumbnail] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(null);

  // ENHANCED: Multiple material files support
  const [materialFiles, setMaterialFiles] = useState([]);

  // Chunked upload progress state (keeping original)
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadPhase, setUploadPhase] = useState('idle');
  const [chunkInfo, setChunkInfo] = useState('');
  const [uploadSpeed, setUploadSpeed] = useState('');
  const [timeRemaining, setTimeRemaining] = useState('');

  // Confirmation dialog state (keeping original)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteType, setDeleteType] = useState('');
  const [deleteIndexes, setDeleteIndexes] = useState({ moduleIndex: null, videoIndex: null });
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmTitle, setConfirmTitle] = useState('');

  // Accordion state (keeping original)
  const [activeKey, setActiveKey] = useState('0');
  const [isMounted, setIsMounted] = useState(false);

  // Load data based on mode and priority - FOLLOWING STEP1/STEP2 PATTERN
  useEffect(() => {
    const loadData = () => {
      if (mode === 'edit') {
        // In edit mode, prioritize course data from API
        if (courseData && courseData._id && !dataLoaded) {
          console.log('Edit mode: Loading course curriculum data into form', courseData);
          populateFormWithCourseData();
          setDataLoaded(true);
        } else if (!courseData._id && !courseLoading && !dataLoaded) {
          // If no course data and not loading, try localStorage
          loadFromLocalStorage();
          setDataLoaded(true);
        }
      } else {
        // Create mode - always try localStorage first
        if (!dataLoaded) {
          loadFromLocalStorage();
          setDataLoaded(true);
        }
      }
    };

    loadData();

    // REMOVED: The problematic reset logic that was causing infinite re-renders
    // This was the main cause: if (mode === 'edit' && courseData._id && dataLoaded) { setDataLoaded(false); }

  }, [courseData._id, mode, courseLoading, dataLoaded]);

  useEffect(() => {
    // Only reset and reload when courseData._id actually changes (not on every courseData update)
    if (mode === 'edit' && courseData._id && dataLoaded) {
      console.log('Course ID changed, reloading data...');
      setDataLoaded(false);
    }
  }, [courseData._id, mode]);

  // Function to populate form with course data (edit mode)
  const populateFormWithCourseData = () => {
    console.log('Populating Step 3 form with course data:', {
      modules: courseData.modules,
      liveCourseMeta: courseData.liveCourseMeta
    });

    // Fix modules loading with better error handling
    if (courseData.modules && Array.isArray(courseData.modules) && courseData.modules.length > 0) {
      console.log('Loading modules from courseData:', courseData.modules);

      // Clean up any persisting upload states on load for edit mode
      const cleanModules = courseData.modules.map(module => ({
        ...module,
        videos: (module.videos || []).map(video => ({
          ...video,
          // Reset upload states that shouldn't persist
          status: video.url && !video.url.includes('/api/course/upload/finalize/') ? 'completed' : video.status,
          progress: video.url && !video.url.includes('/api/course/upload/finalize/') ? 100 : 0,
          uploadPhase: video.url && !video.url.includes('/api/course/upload/finalize/') ? 'completed' : 'idle',
          currentChunk: undefined,
          totalChunks: undefined,
          timeRemaining: undefined
        }))
      }));

      setModules(cleanModules);
      console.log('Modules set:', cleanModules);
    } else {
      console.log('No modules found in courseData, setting empty array');
      setModules([]);
    }

    // Fix live course data loading
    if (courseData.type === 'live') {
      if (courseData.liveCourseMeta?.plannedLessons) {
        console.log('Setting plannedLessons:', courseData.liveCourseMeta.plannedLessons);
        setPlannedLessons(courseData.liveCourseMeta.plannedLessons.toString());
      }

      if (courseData.liveCourseMeta?.courseMaterials) {
        console.log('Setting courseMaterials:', courseData.liveCourseMeta.courseMaterials);
        setCourseMaterials(courseData.liveCourseMeta.courseMaterials);
      }
    }

    console.log('Populated Step 3 form with course data');
  };

  useEffect(() => {
    console.log('Step3 State Debug:', {
      mode,
      courseDataId: courseData?._id,
      modulesLength: modules.length,
      plannedLessons,
      courseMaterialsLength: courseMaterials.length,
      dataLoaded,
      courseLoading
    });
  }, [mode, courseData?._id, modules.length, plannedLessons, courseMaterials.length, dataLoaded, courseLoading]);

  // Function to load from localStorage
  const loadFromLocalStorage = () => {
    const savedData = localStorage.getItem(STEP3_STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        console.log(`${mode} mode: Loading Step 3 data from localStorage`);

        if (parsedData?.modules?.length > 0) {
          // Clean up any persisting upload states on load
          const cleanModules = parsedData.modules.map(module => ({
            ...module,
            videos: module.videos.map(video => ({
              ...video,
              // Reset upload states that shouldn't persist
              status: video.url && !video.url.includes('/api/course/upload/finalize/') ? 'completed' : video.status,
              progress: video.url && !video.url.includes('/api/course/upload/finalize/') ? 100 : 0,
              uploadPhase: video.url && !video.url.includes('/api/course/upload/finalize/') ? 'completed' : 'idle',
              currentChunk: undefined,
              totalChunks: undefined,
              timeRemaining: undefined
            }))
          }));
          setModules(cleanModules);
        }

        if (parsedData?.liveCourseMeta?.plannedLessons) {
          setPlannedLessons(parsedData.liveCourseMeta.plannedLessons.toString());
        }

        if (parsedData?.plannedLessons) {
          setPlannedLessons(parsedData.plannedLessons.toString());
        }

        if (parsedData?.courseMaterials) {
          setCourseMaterials(parsedData.courseMaterials);
        }

        if (parsedData?.liveCourseMeta?.courseMaterials) {
          setCourseMaterials(parsedData.liveCourseMeta.courseMaterials);
        }
      } catch (error) {
        console.error('Error parsing saved form data:', error);
      }
    }
  };

  // Save form data to localStorage when submitting
  const saveFormToLocalStorage = (data) => {
    localStorage.setItem(STEP3_STORAGE_KEY, JSON.stringify(data));
  };

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  // Save curriculum to database (keeping original)
  const saveCurriculumToDatabase = async (modulesData) => {
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('authToken='))?.split('=')[1];

      const response = await fetch(`/api/course/${courseData._id}/curriculum`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          modules: modulesData
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save curriculum');
      }

      return result.success;
    } catch (error) {
      console.error('Error saving curriculum:', error);
      throw error;
    }
  };

  // Handle module operations (keeping original)
  const handleModuleSubmit = (e) => {
    if (e) e.preventDefault();

    if (!moduleTitle.trim()) {
      toast.error('Module title is required');
      return;
    }

    console.log('handleModuleSubmit:', { editMode, currentModuleIndex, moduleTitle });

    if (editMode && currentModuleIndex !== null) {
      // Edit existing module
      const updatedModules = [...modules];
      updatedModules[currentModuleIndex] = {
        ...updatedModules[currentModuleIndex],
        title: moduleTitle,
        description: moduleDescription,
      };
      console.log('Updated modules (edit):', updatedModules);
      setModules(updatedModules);
      toast.success('Module updated successfully');

      // Save to localStorage
      saveFormToLocalStorage({
        modules: updatedModules,
        plannedLessons: parseInt(plannedLessons) || 0,
        courseMaterials,
        liveCourseMeta: {
          plannedLessons: parseInt(plannedLessons) || 0,
          courseMaterials
        }
      });

      // FIXED: Auto-save to database in edit mode
      if (mode === 'edit' && courseData._id) {
        saveCurriculumToDatabase(updatedModules).catch(error => {
          console.error('Failed to auto-save curriculum:', error);
          toast.warning('Changes saved locally. Please save manually to sync with server.');
        });
      }
    } else {
      // Add new module
      const newModule = {
        title: moduleTitle,
        description: moduleDescription,
        order: modules.length + 1,
        videos: []
      };
      const updatedModules = [...modules, newModule];
      console.log('Updated modules (add):', updatedModules);
      setModules(updatedModules);
      toast.success('Module added successfully');
      setActiveKey((modules.length).toString());

      // Save to localStorage
      saveFormToLocalStorage({
        modules: updatedModules,
        plannedLessons: parseInt(plannedLessons) || 0,
        courseMaterials,
        liveCourseMeta: {
          plannedLessons: parseInt(plannedLessons) || 0,
          courseMaterials
        }
      });

      // FIXED: Auto-save to database in edit mode
      if (mode === 'edit' && courseData._id) {
        saveCurriculumToDatabase(updatedModules).catch(error => {
          console.error('Failed to auto-save curriculum:', error);
          toast.warning('Module added locally. Please save manually to sync with server.');
        });
      }
    }

    // Reset form state
    setModuleTitle('');
    setModuleDescription('');
    setEditMode(false);
    setCurrentModuleIndex(null);
    setShowModulePanel(false);
  };

  // ENHANCED: Video submit with multiple materials using context
  const handleVideoSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!videoTitle.trim()) {
      toast.error('Video title is required');
      return;
    }

    if (!videoFile && !editMode) {
      toast.error('Video file is required');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadPhase('preparing');

    try {
      let videoResult = null;

      // ENHANCED: Upload video with materials using context
      if (videoFile) {
        // Prepare material files array
        const materialFilesToUpload = materialFiles.map(fileInfo => fileInfo.file || fileInfo);

        videoResult = await uploadVideoWithMaterials(
          videoFile,
          materialFilesToUpload,
          (progressData) => {
            setUploadProgress(progressData.overallProgress || 0);
            setUploadPhase(progressData.phase || 'uploading');
            setChunkInfo(progressData.chunksComplete ? `${progressData.chunksComplete}/${progressData.totalChunks}` : '');
            setUploadSpeed(progressData.uploadSpeed || '');
            setTimeRemaining(progressData.timeRemaining || '');
          }
        );
      }

      // Create video object with enhanced materials support
      const videoData = {
        title: videoTitle,
        description: videoDescription,
        isPreview: isPreview,
        ...(videoResult && {
          url: videoResult.video.url,
          duration: videoResult.video.duration || 0,
          thumbnailUrl: videoResult.video.thumbnail,
          materials: videoResult.materials || []
        })
      };

      // Handle editing or adding video (keeping original logic)
      let updatedModules = [...modules];

      if (editMode && currentVideoIndex !== null) {
        updatedModules[currentModuleIndex].videos[currentVideoIndex] = {
          ...updatedModules[currentModuleIndex].videos[currentVideoIndex],
          ...videoData
        };
      } else {
        updatedModules[currentModuleIndex].videos.push(videoData);
      }

      setModules(updatedModules);

      // FIXED: Save to database and context in both modes
      if (mode === 'edit' && courseData._id) {
        await saveCurriculumToDatabase(updatedModules);
      }

      setCourseData(prev => ({ ...prev, modules: [...updatedModules] }));

      // Save to localStorage
      saveFormToLocalStorage({
        modules: updatedModules,
        plannedLessons: parseInt(plannedLessons) || 0,
        courseMaterials,
        liveCourseMeta: {
          plannedLessons: parseInt(plannedLessons) || 0,
          courseMaterials
        }
      });

      toast.success(editMode ? 'Video updated successfully' : 'Video added successfully');

      // Reset form
      setVideoTitle('');
      setVideoDescription('');
      setVideoFile(null);
      setMaterialFiles([]);
      setVideoThumbnail('');
      setIsPreview(false);
      setEditMode(false);
      setCurrentVideoIndex(null);
      setShowVideoPanel(false);

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed: ' + error.message);

      // Update video status to failed if in modules
      if (currentModuleIndex !== null) {
        setModules(prevModules => {
          const updatedModules = [...prevModules];
          const targetModule = updatedModules[currentModuleIndex];
          const targetVideoIndex = editMode ? currentVideoIndex : targetModule.videos.length - 1;

          if (targetModule && targetModule.videos[targetVideoIndex]) {
            targetModule.videos[targetVideoIndex] = {
              ...targetModule.videos[targetVideoIndex],
              status: 'failed',
              uploadPhase: 'failed'
            };
          }

          return updatedModules;
        });
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadPhase('idle');
      setChunkInfo('');
      setUploadSpeed('');
      setTimeRemaining('');
    }
  };

  // ENHANCED: Handle video file changes with validation
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const isValid = await validateFile(file, 'video');
        if (isValid) {
          setVideoFile(file);

          // Generate thumbnail using context
          try {
            const preview = await generateFilePreview(file);
            setVideoThumbnail(preview.preview);
          } catch (error) {
            console.error('Error generating thumbnail:', error);
          }
        }
      } catch (error) {
        toast.error(error.message);
        e.target.value = '';
      }
    }
  };

  // ENHANCED: Handle multiple material files
  const handleMaterialFilesChange = async (e) => {
    const files = Array.from(e.target.files);

    try {
      // Validate all files
      for (const file of files) {
        const isValid = await validateFile(file, 'material');
        if (!isValid) {
          e.target.value = '';
          return;
        }
      }

      // Generate previews for new files
      const newMaterialFiles = [...materialFiles];

      for (const file of files) {
        const preview = await generateFilePreview(file);
        newMaterialFiles.push({ ...preview, file });
      }

      setMaterialFiles(newMaterialFiles);
      e.target.value = ''; // Reset input

    } catch (error) {
      toast.error(error.message);
      e.target.value = '';
    }
  };

  // ENHANCED: Handle material file actions
  const handleMaterialFileAction = (action, fileInfo) => {
    switch (action) {
      case 'remove':
        setMaterialFiles(prev => prev.filter(f => f !== fileInfo));
        break;
      case 'view':
        if (fileInfo.url || fileInfo.preview) {
          window.open(fileInfo.url || fileInfo.preview, '_blank');
        }
        break;
      case 'download':
        if (fileInfo.url) {
          const link = document.createElement('a');
          link.href = fileInfo.url;
          link.download = fileInfo.name;
          link.click();
        }
        break;
    }
  };

  // Edit and delete handlers (keeping original logic)
  const handleModuleEdit = (index) => {
    setModuleTitle(modules[index].title);
    setModuleDescription(modules[index].description || '');
    setCurrentModuleIndex(index);
    setEditMode(true);
    setShowModulePanel(true);
  };

  const handleVideoEdit = (moduleIndex, videoIndex) => {
    const video = modules[moduleIndex].videos[videoIndex];
    setVideoTitle(video.title);
    setVideoDescription(video.description || '');
    setIsPreview(video.isPreview || false);

    // ENHANCED: Handle multiple materials in edit mode
    if (video.materials && video.materials.length > 0) {
      setMaterialFiles(video.materials.map(material => ({
        name: material.name || material.fileName,
        size: material.size || material.fileSize,
        type: material.type || material.mimeType,
        url: material.url,
        preview: null,
        icon: '📁'
      })));
    } else if (video.materialUrl) {
      // Legacy single material support
      setMaterialFiles([{
        name: video.materialName || 'Course Material',
        size: video.materialSize || 0,
        type: video.materialType || 'application/octet-stream',
        url: video.materialUrl,
        preview: null,
        icon: '📁'
      }]);
    } else {
      setMaterialFiles([]);
    }

    setCurrentModuleIndex(moduleIndex);
    setCurrentVideoIndex(videoIndex);
    setEditMode(true);
    setShowVideoPanel(true);
  };

  const showDeleteModuleConfirm = (index) => {
    const moduleName = modules[index].title;
    const videoCount = modules[index].videos.length;

    setDeleteType('module');
    setDeleteIndexes({ moduleIndex: index, videoIndex: null });
    setConfirmTitle('Delete Module');
    setConfirmMessage(
      `Are you sure you want to delete the module "${moduleName}"? ${videoCount > 0
        ? `This will also delete ${videoCount} video${videoCount !== 1 ? 's' : ''}.`
        : ''
      } This action cannot be undone.`
    );
    setShowConfirmDelete(true);
  };

  const showDeleteVideoConfirm = (moduleIndex, videoIndex) => {
    const videoName = modules[moduleIndex].videos[videoIndex].title;

    setDeleteType('video');
    setDeleteIndexes({ moduleIndex, videoIndex });
    setConfirmTitle('Delete Video');
    setConfirmMessage(
      `Are you sure you want to delete the video "${videoName}"? This action cannot be undone.`
    );
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    if (deleteType === 'module') {
      const index = deleteIndexes.moduleIndex;
      const updatedModules = [...modules];
      updatedModules.splice(index, 1);

      updatedModules.forEach((module, i) => {
        module.order = i + 1;
      });

      setModules(updatedModules);
      toast.success('Module deleted successfully');

      // Save to localStorage
      saveFormToLocalStorage({
        modules: updatedModules,
        plannedLessons: parseInt(plannedLessons) || 0,
        courseMaterials,
        liveCourseMeta: {
          plannedLessons: parseInt(plannedLessons) || 0,
          courseMaterials
        }
      });
    } else if (deleteType === 'video') {
      const { moduleIndex, videoIndex } = deleteIndexes;
      const updatedModules = [...modules];
      updatedModules[moduleIndex].videos.splice(videoIndex, 1);
      setModules(updatedModules);
      toast.success('Video deleted successfully');

      // Save to localStorage
      saveFormToLocalStorage({
        modules: updatedModules,
        plannedLessons: parseInt(plannedLessons) || 0,
        courseMaterials,
        liveCourseMeta: {
          plannedLessons: parseInt(plannedLessons) || 0,
          courseMaterials
        }
      });
    }

    setDeleteType('');
    setDeleteIndexes({ moduleIndex: null, videoIndex: null });
    setShowConfirmDelete(false);
  };

  // FIXED: Auto-save function for live course materials
  const handleAutoSaveCourseMaterials = async (materials) => {
    try {
      console.log('Auto-saving live course materials:', materials);

      // Update local state immediately
      setCourseMaterials(materials);

      // Save to localStorage for persistence
      saveFormToLocalStorage({
        modules,
        courseMaterials: materials,
        plannedLessons: parseInt(plannedLessons) || 0,
        liveCourseMeta: {
          plannedLessons: parseInt(plannedLessons) || 0,
          courseMaterials: materials
        }
      });

      // Auto-save to database if courseId exists
      if (courseData?._id) {
        try {
          const saveData = {
            liveCourseMeta: {
              plannedLessons: parseInt(plannedLessons) || 0,
              courseMaterials: materials
            }
          };

          const success = await saveAdditionalInfo(saveData);

          if (success) {
            console.log('✅ Live course materials auto-saved to database');

            // Update course context
            setCourseData(prev => ({
              ...prev,
              liveCourseMeta: {
                ...(prev.liveCourseMeta || {}),
                plannedLessons: parseInt(plannedLessons) || 0,
                courseMaterials: materials
              }
            }));
          } else {
            console.warn('⚠️ Auto-save to database failed, but localStorage updated');
          }
        } catch (error) {
          console.error('❌ Auto-save to database error:', error);
          // Don't show error to user for auto-save, just log it
        }
      }
    } catch (error) {
      console.error('❌ Auto-save materials error:', error);
    }
  };

  // Course materials handlers (keeping original logic)
  const handleSaveCourseMaterials = async (materials) => {
    try {
      console.log('Saving live course materials:', materials);

      // Update local state
      setCourseMaterials(materials);
      setShowMaterialsPanel(false);

      // Save to localStorage
      saveFormToLocalStorage({
        modules,
        courseMaterials: materials,
        plannedLessons: parseInt(plannedLessons) || 0,
        liveCourseMeta: {
          plannedLessons: parseInt(plannedLessons) || 0,
          courseMaterials: materials
        }
      });

      // Save to database
      if (courseData?._id) {
        try {
          const saveData = {
            liveCourseMeta: {
              plannedLessons: parseInt(plannedLessons) || 0,
              courseMaterials: materials
            }
          };

          const success = await saveAdditionalInfo(saveData);

          if (success) {
            // Update course context
            setCourseData(prev => ({
              ...prev,
              liveCourseMeta: {
                ...(prev.liveCourseMeta || {}),
                plannedLessons: parseInt(plannedLessons) || 0,
                courseMaterials: materials
              }
            }));

            // Calculate total materials for success message
            const totalMaterials = materials.reduce((count, lesson) => 
              count + (lesson.materials ? lesson.materials.length : 0), 0
            );

            toast.success(`Course materials saved for all ${parseInt(plannedLessons) || 0} lessons (${totalMaterials} total files)`);
          } else {
            throw new Error('Failed to save to database');
          }
        } catch (error) {
          console.error('❌ Save to database error:', error);
          toast.error('Failed to save materials to database. Please try again.');
        }
      } else {
        toast.success('Materials saved locally. Complete course creation to save to database.');
      }
    } catch (error) {
      console.error('❌ Save materials error:', error);
      toast.error('Failed to save course materials');
    }
  };

  // Save and navigation handlers (keeping original logic)
  const handleSaveLiveCourseInfo = async () => {
    if (!plannedLessons || plannedLessons === '' || parseInt(plannedLessons, 10) <= 0) {
      toast.error('Please enter a valid number of lessons');
      return;
    }

    try {
      const numericPlannedLessons = parseInt(plannedLessons, 10);

      let completeCourseMaterials = [];
      for (let i = 1; i <= numericPlannedLessons; i++) {
        const existingMaterial = courseMaterials.find(m => m.lessonNumber === i);

        if (existingMaterial) {
          completeCourseMaterials.push({
            lessonNumber: i,
            // ENHANCED: Multiple materials support
            materials: existingMaterial.materials || [],
            // LEGACY: Single material support
            materialName: existingMaterial.materialName || '',
            materialUrl: existingMaterial.materialUrl || '',
            materialSize: existingMaterial.materialSize || null,
            materialType: existingMaterial.materialType || null,
            hasContent: !!(
              (existingMaterial.materials && existingMaterial.materials.length > 0) ||
              existingMaterial.materialName || 
              existingMaterial.materialUrl
            )
          });
        } else {
          completeCourseMaterials.push({
            lessonNumber: i,
            materials: [],
            materialName: '',
            materialUrl: '',
            materialSize: null,
            materialType: null,
            hasContent: false
          });
        }
      }

      const data = {
        liveCourseMeta: {
          plannedLessons: numericPlannedLessons,
          courseMaterials: completeCourseMaterials
        }
      };

      const success = await saveAdditionalInfo(data);

      if (success) {
        setCourseData(prev => ({
          ...prev,
          liveCourseMeta: {
            ...(prev.liveCourseMeta || {}),
            plannedLessons: numericPlannedLessons,
            courseMaterials: completeCourseMaterials
          }
        }));

        // Update localStorage with complete data
        saveFormToLocalStorage({
          modules,
          plannedLessons: numericPlannedLessons,
          courseMaterials: completeCourseMaterials,
          liveCourseMeta: {
            plannedLessons: numericPlannedLessons,
            courseMaterials: completeCourseMaterials
          }
        });

        stepperInstance?.next();
      }
    } catch (error) {
      console.error('Error saving planned lessons:', error);
      toast.error('Failed to save course information');
    }
  };

  const saveAndContinue = async (e) => {
    if (e) e.preventDefault();

    if (courseData && courseData.type === 'live') {
      await handleSaveLiveCourseInfo();
      return;
    }

    if (modules.length === 0) {
      toast.error('Please add at least one module to continue');
      return;
    }

    const result = await saveCurriculum({ modules });

    if (result) {
      setCourseData(prev => ({
        ...prev,
        modules: [...modules]
      }));

      saveFormToLocalStorage({ modules });

      if (stepperInstance) {
        stepperInstance?.next();
      }
    }
  };

  const handlePrevious = () => {
    stepperInstance?.previous();
  };

  const openAddVideoPanel = (moduleIndex) => {
    setCurrentModuleIndex(moduleIndex);
    setEditMode(false);
    setVideoTitle('');
    setVideoDescription('');
    setVideoFile(null);
    setMaterialFiles([]);
    setVideoThumbnail('');
    setIsPreview(false);
    setShowVideoPanel(true);
  };

  // Show loading spinner if course is still loading in edit mode
  if (mode === 'edit' && courseLoading) {
    return (
      <div id="step-3" role="tabpanel" className="content fade" aria-labelledby="steppertrigger3">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <h5>Loading course curriculum...</h5>
            <p className="text-muted">Please wait while we fetch your course information.</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if in edit mode but failed to load course data
  if (mode === 'edit' && !courseLoading && !courseData._id && courseLoadError) {
    return (
      <div id="step-3" role="tabpanel" className="content fade" aria-labelledby="steppertrigger3">
        <Alert variant="danger">
          <h5>Error Loading Course Curriculum</h5>
          <p>Unable to load course curriculum data: {courseLoadError}</p>
          <Button variant="outline-danger" onClick={() => window.location.href = '/instructor/manage-course'}>
            Back to Course Management
          </Button>
        </Alert>
      </div>
    );
  }

  // ENHANCED: Special UI for live courses with multiple materials support
  if (courseData && courseData.type === 'live') {
    return (
      <div id="step-3" role="tabpanel" className="content fade" aria-labelledby="steppertrigger3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>
            {mode === 'edit' ? 'Edit Course Curriculum' : 'Course Curriculum'}
          </h4>
          {mode === 'edit' && courseData._id && (
            <div className="text-muted small">
              Editing: {courseData.title}
            </div>
          )}
        </div>
        <div className="mb-4">
          <Row>
            <Col lg={12}>
              <Card className="p-4 mb-4">
                <div className="d-flex align-items-start">
                  <div className="me-4">
                    <Image
                      src={liveIcon}
                      alt="Live Course"
                      width={70}
                      height={70}
                    />
                  </div>
                  <div>
                    <h5 className="mb-2">Define the count of lessons in your course</h5>
                    <p className="text-muted font-normal fs-5 fw-normal mb-4">
                      Keep in mind that live-courses need to have a count which has always same amount of lessons per day
                      (e.g. 3 days with 2 lessons = 6 lessons)
                    </p>

                    <div className="d-flex align-items-center">
                      <Form.Control
                        type="number"
                        value={plannedLessons}
                        onChange={(e) => setPlannedLessons(e.target.value)}
                        style={{ width: '15%' }}
                        className="me-2"
                        min="1"
                        placeholder="0"
                      />
                      <span className='font-normal fs-5 fw-normal'>lessons</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* ENHANCED: Course Materials Section for Live Courses with Multiple Materials */}
          {plannedLessons && parseInt(plannedLessons) > 0 && (
            <Row className="mb-4">
              <Col lg={12}>
                <Card className="shadow-sm border">
                  <Card.Header className="bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">
                        <FaFileAlt className="me-2" />
                        Course Materials ({parseInt(plannedLessons)} Lessons)
                      </h5>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setShowMaterialsPanel(true)}
                      >
                        <FaPlus className="me-1" />
                        {courseMaterials && courseMaterials.length > 0 ? 'Edit Materials' : 'Add Course Files'}
                      </Button>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <div>
                      {/* ENHANCED: Calculate total materials count including multiple materials */}
                      {(() => {
                        const lessonsWithContent = courseMaterials.filter(m => 
                          (m.materials && m.materials.length > 0) || m.materialName || m.materialUrl
                        ).length;
                        const totalMaterials = courseMaterials.reduce((count, lesson) => 
                          count + (lesson.materials ? lesson.materials.length : (lesson.materialUrl ? 1 : 0)), 0
                        );
                        
                        return (
                          <p className="mb-3">
                            <FaFileAlt className="me-2 text-info" />
                            Course materials setup: {lessonsWithContent} of {parseInt(plannedLessons)} lessons have content ({totalMaterials} total files).
                          </p>
                        );
                      })()}

                      {/* ENHANCED: Show ALL lessons with accordion for file display */}
                      <div className="row">
                        {Array.from({ length: parseInt(plannedLessons) }, (_, index) => {
                          const lessonNumber = index + 1;
                          const material = courseMaterials.find(m => m.lessonNumber === lessonNumber);
                          const materialsCount = material ? 
                            (material.materials ? material.materials.length : 0) + (material.materialUrl && !material.materials?.some(m => m.url === material.materialUrl) ? 1 : 0) 
                            : 0;
                          const hasContent = materialsCount > 0;

                          return (
                            <div key={lessonNumber} className="col-12 mb-3">
                              <Card>
                                <Accordion>
                                  <Accordion.Item className='bg-white' eventKey={lessonNumber.toString()}>
                                    <Accordion.Header>
                                      <div className="d-flex justify-content-between align-items-center w-100 pe-3">
                                        <div className="d-flex align-items-center">
                                          <FaFileAlt
                                            size={20}
                                            className={`me-3 ${hasContent ? 'text-success' : 'text-muted'}`}
                                          />
                                          <div>
                                            <div className="fw-bold">Lesson {lessonNumber}</div>
                                            <small >
                                              {hasContent ? (
                                                `${materialsCount} file${materialsCount !== 1 ? 's' : ''} attached`
                                              ) : (
                                                'No materials'
                                              )}
                                            </small>
                                          </div>
                                        </div>
                                        <Badge 
                                          bg={hasContent ? 'success' : 'light'} 
                                          text={hasContent ? 'white' : 'dark'}
                                          className="ms-2"
                                        >
                                          {materialsCount}
                                        </Badge>
                                      </div>
                                    </Accordion.Header>
                                    <Accordion.Body>
                                      {hasContent ? (
                                        <div>
                                          <div className="mb-3">
                                            <small className="text-muted">
                                              <FaFileAlt className="me-1" size={12} />
                                              Materials for Lesson {lessonNumber}
                                            </small>
                                          </div>
                                          
                                          {/* Display multiple materials */}
                                          {material.materials && material.materials.length > 0 && (
                                            <div className="materials-grid d-flex flex-wrap gap-2 mb-3">
                                              {material.materials.map((materialFile, materialIndex) => (
                                                <MaterialFileCard
                                                  key={materialIndex}
                                                  material={materialFile}
                                                  onPreview={() => previewMaterial(materialFile)}
                                                  onDownload={() => downloadMaterial(materialFile)}
                                                  showRemove={false} // Don't show remove in main view
                                                />
                                              ))}
                                            </div>
                                          )}

                                          {/* Display legacy single material if exists and not in materials array */}
                                          {material.materialUrl && !material.materials?.some(m => m.url === material.materialUrl) && (
                                            <div className="materials-grid d-flex flex-wrap gap-2 mb-3">
                                              <MaterialFileCard
                                                material={{
                                                  name: material.materialName || 'Course Material',
                                                  url: material.materialUrl,
                                                  size: material.materialSize || 0,
                                                  type: material.materialType || 'application/octet-stream'
                                                }}
                                                onPreview={() => previewMaterial({
                                                  name: material.materialName || 'Course Material',
                                                  url: material.materialUrl
                                                })}
                                                onDownload={() => downloadMaterial({
                                                  name: material.materialName || 'Course Material',
                                                  url: material.materialUrl
                                                })}
                                                showRemove={false}
                                              />
                                            </div>
                                          )}

                                          <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                                            <small className="text-success">
                                              <FaCheck className="me-1" size={10} />
                                              {materialsCount} file{materialsCount !== 1 ? 's' : ''} ready
                                            </small>
                                            <Button
                                              variant="outline-primary"
                                              size="sm"
                                              onClick={() => setShowMaterialsPanel(true)}
                                            >
                                              <FaEdit className="me-1" size={12} />
                                              Edit Materials
                                            </Button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="text-center py-4">
                                          <FaFileAlt className="text-muted mb-2" size={24} />
                                          <div className="text-muted">No materials added yet</div>
                                          <Button
                                            variant="primary"
                                            size="sm"
                                            className="mt-2"
                                            onClick={() => setShowMaterialsPanel(true)}
                                          >
                                            <FaPlus className="me-1" size={12} />
                                            Add Materials
                                          </Button>
                                        </div>
                                      )}
                                    </Accordion.Body>
                                  </Accordion.Item>
                                </Accordion>
                              </Card>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>Uploading your lessons</h4>
          </div>
          <hr />

          <div className="text-center py-5">
            <div className="bg-light p-5 rounded-3 mb-4">
              <FaInfoCircle className="text-primary mb-3" style={{ fontSize: '2.5rem' }} />
              <h4>No pre-defined curriculum in live courses</h4>
              <p className="text-muted mb-4">
                Live-Courses have no prerecorded courses. You'll set up your sessions schedule in last step.
              </p>
            </div>
          </div>

          <div className="d-flex justify-content-between">
            <Button
              variant="secondary"
              onClick={handlePrevious}
              disabled={isLoading}
              className="mb-0"
            >
              Previous
            </Button>
            <Button
              variant="primary"
              onClick={saveAndContinue}
              disabled={isLoading}
              className="mb-0"
            >
              {isLoading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                  {mode === 'edit' ? 'Updating...' : 'Saving...'}
                </>
              ) : 'Continue to Next Step'}
            </Button>
          </div>
        </div>

        {/* ENHANCED: Course Materials Panel with Multiple Materials Support */}
        <CourseMaterialsPanel
          isOpen={showMaterialsPanel}
          onClose={() => setShowMaterialsPanel(false)}
          onSave={handleSaveCourseMaterials}
          onAutoSave={handleAutoSaveCourseMaterials}
          plannedLessons={parseInt(plannedLessons) || 0}
          existingMaterials={courseMaterials}
          courseId={courseData._id}
        />
      </div>
    );
  }

  // Regular UI for recorded courses (keeping original structure + enhancements)
  return (
    <div id="step-3" role="tabpanel" className="content fade" aria-labelledby="steppertrigger3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>
          {mode === 'edit' ? 'Edit Course Curriculum' : 'Course Curriculum'}
        </h4>
        {mode === 'edit' && courseData._id && (
          <div className="text-muted small">
            Editing: {courseData.title}
          </div>
        )}
      </div>
      <div className="d-sm-flex justify-content-sm-between align-items-center mb-3">
        <div></div>
        <Button variant="primary" onClick={() => {
          setEditMode(false);
          setModuleTitle('');
          setModuleDescription('');
          setShowModulePanel(true);
        }}>
          <FaPlus className="me-2" /> Add Module
        </Button>
      </div>
      <hr />

      <div className="alert alert-info d-flex align-items-center mb-4">
        <FaInfoCircle className="me-2 flex-shrink-0" size={18} />
        <div>
          <strong>Build Your Curriculum:</strong> Add modules and upload videos to create your course content.
          Each module can contain multiple videos. Mark videos as "Preview" to allow non-enrolled users to watch them.
          You can also attach multiple course materials (PDFs, documents) to each video.
        </div>
      </div>

      {modules.length === 0 ? (
        <div className="text-center py-5 bg-light rounded">
          <FaExclamationTriangle className="text-warning mb-3" style={{ fontSize: '3rem' }} />
          <h5>No modules added yet</h5>
          <p className="text-muted">Start building your course by adding a module</p>
          <Button
            variant="primary"
            onClick={() => {
              setEditMode(false);
              setModuleTitle('');
              setModuleDescription('');
              setShowModulePanel(true);
            }}
          >
            <FaPlus className="me-2" /> Add First Module
          </Button>
        </div>
      ) : (
        <Row>
          <Accordion
            className="py-3 bg-light border rounded-3"
            activeKey={activeKey}
            onSelect={(key) => setActiveKey(key)}
          >
            {modules.map((module, moduleIndex) => (
              <Accordion.Item
                eventKey={moduleIndex.toString()}
                className="rounded shadow-sm overflow-hidden mb-3"
                key={moduleIndex}
              >
                <Accordion.Header>
                  <div className='d-flex justify-content-between align-items-center w-100 pe-4'>
                    <div className="fw-bold">
                      {module.title}
                    </div>
                    <Badge bg="info" pill className="ms-2">
                      {module.videos.length} video{module.videos.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </Accordion.Header>
                <Accordion.Body className="bg-light">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h6 className="mb-1">Module Description</h6>
                      <p className="text-muted mb-0">
                        {module.description || 'No description provided'}
                      </p>
                    </div>
                    <div className='d-flex pl-3'>
                      <Button
                        variant="outline-success"
                        size="sm"
                        className="me-1"
                        onClick={() => handleModuleEdit(moduleIndex)}
                      >
                        <FaEdit /> Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => showDeleteModuleConfirm(moduleIndex)}
                      >
                        <FaTimes /> Delete
                      </Button>
                    </div>
                  </div>

                  <hr />

                  <div className="videos-container mb-3">
                    {module.videos.length > 0 ? (
                      module.videos.map((video, videoIndex) => (
                        <VideoPreviewCard
                          key={videoIndex}
                          video={video}
                          onEdit={handleVideoEdit}
                          onDelete={() => showDeleteVideoConfirm(moduleIndex, videoIndex)}
                          moduleIndex={moduleIndex}
                          videoIndex={videoIndex}
                        />
                      ))
                    ) : (
                      <div className="text-center py-4 bg-white rounded shadow-sm">
                        <p className="text-muted mb-0">No videos added to this module yet</p>
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => openAddVideoPanel(moduleIndex)}
                    >
                      <FaPlus className="me-2" /> Add Video
                    </Button>
                  </div>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>

          <div className="d-flex justify-content-between mt-3">
            <Button variant="light" onClick={handlePrevious} disabled={isLoading} className="px-4">
              Previous
            </Button>
            <Button variant="primary" onClick={saveAndContinue} disabled={isLoading} className="px-4">
              {isLoading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                  {mode === 'edit' ? 'Updating...' : 'Saving...'}
                </>
              ) : 'Save & Continue'}
            </Button>
          </div>
        </Row>
      )}

      {/* Add/Edit Module Panel (keeping original) */}
      <SlidePanel
        isOpen={showModulePanel}
        onClose={() => setShowModulePanel(false)}
        title={editMode ? 'Edit Module' : 'Add New Module'}
        size="md"
      >
        <Form onSubmit={handleModuleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Module Title <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g. Introduction to JavaScript"
              value={moduleTitle}
              onChange={(e) => setModuleTitle(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Module Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Brief description of this module"
              value={moduleDescription}
              onChange={(e) => setModuleDescription(e.target.value)}
            />
            <Form.Text className="text-muted">
              A good description helps students understand what they'll learn in this module.
            </Form.Text>
          </Form.Group>

          <div className="d-grid mt-4">
            <Button variant="primary" type="submit">
              {editMode ? 'Update Module' : 'Add Module'}
            </Button>
          </div>
        </Form>
      </SlidePanel>

      {/* ENHANCED: Add/Edit Video Panel with Multiple Materials Support */}
      <SlidePanel
        isOpen={showVideoPanel}
        onClose={() => !isUploading && setShowVideoPanel(false)}
        title={editMode ? 'Edit Video' : 'Add New Video'}
        size="lg"
      >
        <Form onSubmit={handleVideoSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Video Title <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g. Introduction to Variables"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              required
              disabled={isUploading}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Video Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Brief description of this video"
              value={videoDescription}
              onChange={(e) => setVideoDescription(e.target.value)}
              disabled={isUploading}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{editMode ? 'Replace Video File (optional)' : 'Video File'} <span className={editMode ? '' : 'text-danger'}>*</span></Form.Label>
            <Form.Control
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              required={!editMode}
              disabled={isUploading}
            />
            <Form.Text className="text-muted">
              Maximum file size: 500MB. Supported formats: MP4, WebM, MOV, AVI, QuickTime
            </Form.Text>
          </Form.Group>

          {/* ENHANCED: Multiple Course Materials Upload Field */}
          <Form.Group className="mb-3">
            <Form.Label>Course Materials (Optional)</Form.Label>
            <Form.Control
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
              onChange={handleMaterialFilesChange}
              disabled={isUploading}
              multiple
            />
            <Form.Text className="text-muted">
              Upload multiple materials (PDF, DOC, PPT, Images, etc.) - Max 50MB per file
            </Form.Text>
          </Form.Group>

          {/* ENHANCED: Material Files Preview */}
          {materialFiles.length > 0 && (
            <div className="mb-3">
              <Form.Label>Selected Materials ({materialFiles.length})</Form.Label>
              <div className="material-files-preview">
                {materialFiles.map((fileInfo, index) => (
                  <FilePreviewCard
                    key={index}
                    fileInfo={fileInfo}
                    onRemove={() => handleMaterialFileAction('remove', fileInfo)}
                    onView={() => handleMaterialFileAction('view', fileInfo)}
                    onDownload={() => handleMaterialFileAction('download', fileInfo)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ENHANCED: Chunked Upload Progress */}
          {isUploading && videoFile && (
            <ChunkedUploadPreview
              file={videoFile}
              progress={uploadProgress}
              thumbnail={videoThumbnail}
              uploadPhase={uploadPhase}
              chunkInfo={chunkInfo}
              uploadSpeed={uploadSpeed}
              timeRemaining={timeRemaining}
              materialFiles={materialFiles}
            />
          )}

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              id="isPreview"
              label="Make this video available as a free preview"
              checked={isPreview}
              onChange={(e) => setIsPreview(e.target.checked)}
              disabled={isUploading}
            />
            <Form.Text className="text-muted">
              Preview videos are visible to non-enrolled students and can help increase enrollment.
            </Form.Text>
          </Form.Group>

          <div className="d-grid mt-4">
            <Button variant="primary" type="submit" disabled={isUploading}>
              {isUploading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                  {uploadPhase === 'preparing' ? 'Preparing...' :
                    uploadPhase === 'materials' ? 'Uploading Materials...' :
                      uploadPhase === 'chunking' ? 'Uploading Video...' :
                        uploadPhase === 'gcs_upload' ? 'Uploading to Cloud...' :
                          'Processing...'}
                </>
              ) : editMode ? 'Update Video' : 'Add Video'}
            </Button>
          </div>
        </Form>
      </SlidePanel>

      {/* Confirmation Dialog (keeping original) */}
      <ConfirmDialog
        show={showConfirmDelete}
        onHide={() => setShowConfirmDelete(false)}
        onConfirm={handleConfirmDelete}
        title={confirmTitle}
        message={confirmMessage}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default Step3;