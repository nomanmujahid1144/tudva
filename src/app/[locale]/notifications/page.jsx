'use client';

import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Pagination, Form } from 'react-bootstrap';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { BsCheck2All, BsTrash } from 'react-icons/bs';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

const NotificationsPage = () => {
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const { 
    notifications, 
    isLoading, 
    error,
    pagination,
    markAsRead,
    markAllAsRead,
    removeNotification,
    fetchNotifications,
    changePage
  } = useNotifications();

  const handleFilterChange = (e) => {
    const newFilter = e.target.value;
    setFilter(newFilter);
    fetchNotifications(1, 10, newFilter === 'unread');
  };

  const handleMarkAsRead = async (id) => {
    const success = await markAsRead(id);
    if (!success) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    const success = await markAllAsRead();
    if (success) {
      toast.success('All notifications marked as read');
    } else {
      toast.error('Failed to mark all notifications as read');
    }
  };

  const handleDelete = async (id) => {
    const success = await removeNotification(id);
    if (success) {
      toast.success('Notification deleted');
    } else {
      toast.error('Failed to delete notification');
    }
  };

  // Generate pagination items
  const renderPaginationItems = () => {
    const items = [];
    
    // Previous button
    items.push(
      <Pagination.Prev 
        key="prev" 
        onClick={() => changePage(pagination.page - 1)}
        disabled={pagination.page === 1 || isLoading}
      />
    );
    
    // First page
    if (pagination.page > 2) {
      items.push(
        <Pagination.Item 
          key={1} 
          onClick={() => changePage(1)}
          active={pagination.page === 1}
        >
          1
        </Pagination.Item>
      );
    }
    
    // Ellipsis if needed
    if (pagination.page > 3) {
      items.push(<Pagination.Ellipsis key="ellipsis1" disabled />);
    }
    
    // Pages around current page
    for (let i = Math.max(1, pagination.page - 1); i <= Math.min(pagination.totalPages, pagination.page + 1); i++) {
      items.push(
        <Pagination.Item 
          key={i} 
          onClick={() => changePage(i)}
          active={pagination.page === i}
          disabled={isLoading}
        >
          {i}
        </Pagination.Item>
      );
    }
    
    // Ellipsis if needed
    if (pagination.page < pagination.totalPages - 2) {
      items.push(<Pagination.Ellipsis key="ellipsis2" disabled />);
    }
    
    // Last page
    if (pagination.page < pagination.totalPages - 1 && pagination.totalPages > 1) {
      items.push(
        <Pagination.Item 
          key={pagination.totalPages} 
          onClick={() => changePage(pagination.totalPages)}
          active={pagination.page === pagination.totalPages}
          disabled={isLoading}
        >
          {pagination.totalPages}
        </Pagination.Item>
      );
    }
    
    // Next button
    items.push(
      <Pagination.Next 
        key="next" 
        onClick={() => changePage(pagination.page + 1)}
        disabled={pagination.page === pagination.totalPages || pagination.totalPages === 0 || isLoading}
      />
    );
    
    return items;
  };

  return (
    <main>
      <section className="pt-0">
        <Container>
          <Row className="mb-4">
            <Col md={8}>
              <h1 className="fs-2 mb-2">Notifications</h1>
              <p className="mb-0">Stay updated with your course activities and announcements</p>
            </Col>
            <Col md={4} className="d-flex justify-content-md-end align-items-center">
              <Form.Select 
                value={filter} 
                onChange={handleFilterChange}
                className="me-2"
                style={{ maxWidth: '150px' }}
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </Form.Select>
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={isLoading || notifications.every(n => n.isRead)}
              >
                <BsCheck2All className="me-1" />
                Mark all as read
              </Button>
            </Col>
          </Row>
          
          <Card className="border-0 shadow-sm">
            <Card.Body>
              {isLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-5">
                  <p className="text-danger mb-0">{error}</p>
                  <Button 
                    variant="primary" 
                    className="mt-3"
                    onClick={() => fetchNotifications(1, 10, filter === 'unread')}
                  >
                    Try Again
                  </Button>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-5">
                  <h5>No notifications found</h5>
                  <p className="text-muted">You don't have any notifications at the moment</p>
                </div>
              ) : (
                <div className="notification-list">
                  {notifications.map((notification) => {
                    // Format date
                    const formattedDate = notification.createdAt 
                      ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
                      : '';
                    
                    return (
                      <div 
                        key={notification.id} 
                        className={`notification-item p-3 border-bottom ${!notification.isRead ? 'bg-light' : ''}`}
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h5 className="mb-1">{notification.title}</h5>
                            <p className="mb-1">{notification.message}</p>
                            <small className="text-muted">{formattedDate}</small>
                          </div>
                          <div className="d-flex">
                            {!notification.isRead && (
                              <Button 
                                variant="link" 
                                className="text-primary p-0 me-3"
                                onClick={() => handleMarkAsRead(notification.id)}
                              >
                                <BsCheck2All size={18} />
                              </Button>
                            )}
                            <Button 
                              variant="link" 
                              className="text-danger p-0"
                              onClick={() => handleDelete(notification.id)}
                            >
                              <BsTrash size={18} />
                            </Button>
                          </div>
                        </div>
                        
                        {notification.course_id && (
                          <div className="mt-2">
                            <Link 
                              href={`/pages/course/detail/${notification.course_id}`}
                              className="btn btn-sm btn-primary-soft"
                            >
                              View Course
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card.Body>
            
            {pagination.totalPages > 1 && (
              <Card.Footer className="bg-transparent">
                <div className="d-flex justify-content-center">
                  <Pagination>{renderPaginationItems()}</Pagination>
                </div>
              </Card.Footer>
            )}
          </Card>
        </Container>
      </section>
    </main>
  );
};

export default NotificationsPage;
