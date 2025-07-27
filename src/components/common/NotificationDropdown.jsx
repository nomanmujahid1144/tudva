// 'use client';

// import React, { useState } from 'react';
// import { Card, CardBody, CardFooter, CardHeader, Dropdown, DropdownMenu, DropdownToggle } from 'react-bootstrap';
// import { BsBell, BsCheck2All, BsTrash } from 'react-icons/bs';
// import Image from 'next/image';
// import Link from 'next/link';
// import { useNotifications } from '@/hooks/useNotifications';
// import { formatDistanceToNow } from 'date-fns';
// import defaultAvatar from '@/assets/images/avatar/01.jpg';
// import { toast } from 'react-hot-toast';

// /**
//  * Notification item component
//  */
// const NotificationItem = ({ notification, onMarkAsRead, onDelete }) => {
//   const { id, title, message, type, isRead, createdAt } = notification;

//   // Format date
//   const formattedDate = createdAt
//     ? formatDistanceToNow(new Date(createdAt), { addSuffix: true })
//     : '';

//   // Get icon based on notification type
//   const getIcon = () => {
//     switch (type) {
//       case 'lecture_reminder':
//         return '/icons/calendar.svg';
//       case 'course_enrollment':
//         return '/icons/book.svg';
//       case 'course_update':
//         return '/icons/pencil.svg';
//       case 'review_received':
//         return '/icons/star.svg';
//       default:
//         return '/icons/bell.svg';
//     }
//   };

//   const handleClick = async () => {
//     if (!isRead) {
//       await onMarkAsRead(id);
//     }
//   };

//   const handleDelete = async (e) => {
//     e.stopPropagation();
//     await onDelete(id);
//   };

//   return (
//     <li className={`list-group-item border-0 ${!isRead ? 'bg-light' : ''}`} onClick={handleClick}>
//       <div className="d-flex align-items-center">
//         <div className="avatar avatar-md me-3">
//           <Image
//             src={getIcon()}
//             width={40}
//             height={40}
//             className="rounded-circle"
//             alt={type}
//           />
//         </div>
//         <div className="flex-grow-1">
//           <h6 className="mb-1">{title}</h6>
//           <p className="mb-0 small">{message}</p>
//           <span className="small text-muted">{formattedDate}</span>
//         </div>
//         <div className="d-flex">
//           {!isRead && (
//             <button
//               className="btn btn-sm btn-light-success me-1"
//               onClick={handleClick}
//               title="Mark as read"
//             >
//               <BsCheck2All />
//             </button>
//           )}
//           <button
//             className="btn btn-sm btn-light-danger"
//             onClick={handleDelete}
//             title="Delete notification"
//           >
//             <BsTrash />
//           </button>
//         </div>
//       </div>
//     </li>
//   );
// };

// /**
//  * Main NotificationDropdown component
//  */
// const NotificationDropdown = ({ className = '', dropDirection = 'start' }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const {
//     notifications,
//     unreadCount,
//     isLoading,
//     markAsRead,
//     markAllAsRead,
//     removeNotification,
//     fetchNotifications
//   } = useNotifications();

//   const handleToggle = () => {
//     setIsOpen(!isOpen);
//     if (!isOpen) {
//       // Refresh notifications when opening dropdown
//       fetchNotifications(1, 10);
//     }
//   };

//   const handleMarkAsRead = async (id) => {
//     const success = await markAsRead(id);
//     if (!success) {
//       toast.error('Failed to mark notification as read');
//     }
//   };

//   const handleMarkAllAsRead = async () => {
//     const success = await markAllAsRead();
//     if (success) {
//       toast.success('All notifications marked as read');
//     } else {
//       toast.error('Failed to mark all notifications as read');
//     }
//   };

//   const handleDeleteNotification = async (id) => {
//     const success = await removeNotification(id);
//     if (!success) {
//       toast.error('Failed to delete notification');
//     }
//   };

//   return (
//     <Dropdown
//       show={isOpen}
//       onToggle={handleToggle}
//       drop={dropDirection}
//       className={`nav-item notification-dropdown ${className}`}
//     >
//       <DropdownToggle
//         as="a"
//         className="btn btn-light btn-round mb-0 arrow-none position-relative"
//         role="button"
//       >
//         <BsBell className="fa-fw" />
//         {unreadCount > 0 && (
//           <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
//             {unreadCount}
//             <span className="visually-hidden">unread notifications</span>
//           </span>
//         )}
//       </DropdownToggle>

//       <DropdownMenu className="dropdown-menu-end dropdown-menu-size-md p-0 shadow-lg border-0">
//         <Card className="bg-transparent">
//           <CardHeader className="bg-transparent border-bottom py-4 d-flex justify-content-between align-items-center">
//             <h6 className="m-0">
//               Notifications
//               {unreadCount > 0 && (
//                 <span className="badge bg-danger bg-opacity-10 text-danger ms-2">
//                   {unreadCount} new
//                 </span>
//               )}
//             </h6>
//             {unreadCount > 0 && (
//               <button
//                 className="btn btn-sm btn-link p-0 text-decoration-none"
//                 onClick={handleMarkAllAsRead}
//               >
//                 Mark all as read
//               </button>
//             )}
//           </CardHeader>

//           <CardBody className="p-0" style={{ minHeight: '150px', maxHeight: '350px', overflowY: 'auto' }}>
//             {isLoading ? (
//               <div className="text-center py-4">
//                 <div className="spinner-border text-primary" role="status">
//                   <span className="visually-hidden">Loading...</span>
//                 </div>
//               </div>
//             ) : notifications.length === 0 ? (
//               <div className="text-center py-4">
//                 <p className="mb-0">No notifications</p>
//               </div>
//             ) : (
//               <ul className="list-group list-group-flush">
//                 {notifications.map(notification => (
//                   <NotificationItem
//                     key={notification.id}
//                     notification={notification}
//                     onMarkAsRead={handleMarkAsRead}
//                     onDelete={handleDeleteNotification}
//                   />
//                 ))}
//               </ul>
//             )}
//           </CardBody>

//           <CardFooter className="bg-transparent border-0 py-3 d-flex justify-content-between">
//             <Link href="/notifications" className="btn btn-sm btn-link text-decoration-none">
//               See all notifications
//             </Link>
//             <Link href="/notification-preferences" className="btn btn-sm btn-link text-decoration-none">
//               Preferences
//             </Link>
//           </CardFooter>
//         </Card>
//       </DropdownMenu>
//     </Dropdown>
//   );
// };

// export default NotificationDropdown;
