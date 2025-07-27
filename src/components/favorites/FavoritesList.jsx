'use client';

import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner, Alert, Button, Nav } from 'react-bootstrap';
import { getFavorites } from '@/services/favoriteService';
import CourseCard from '@/app/pages/course/grid/components/CourseCard'; // Adjust import path as needed
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

const FavoritesList = () => {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'recent'
  const { user } = useAuth();
  const router = useRouter();

  // Define what counts as "recent" - favorites added in the last 7 days
  const recentCutoff = new Date();
  recentCutoff.setDate(recentCutoff.getDate() - 7);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await getFavorites();

        if (response.success) {
          setFavorites(response.favorites || []);
        } else {
          setError(response.error || 'Failed to fetch favorites');
        }
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setError(err.message || 'Error fetching favorites');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  if (!user) {
    return (
      <Card className="border-0 shadow-sm">
        <Card.Body className="text-center p-5">
          <h4 className="mb-4">Please log in to view your favorites</h4>
          <Button
            variant="primary"
            onClick={() => router.push('/login')}
          >
            Log In
          </Button>
        </Card.Body>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="my-4">
        {error}
      </Alert>
    );
  }

  if (favorites.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <Card.Body className="text-center p-5">
          <h4 className="mb-4">You haven't added any favorites yet</h4>
          <Button
            variant="primary"
            onClick={() => router.push('/courses')}
          >
            Browse Courses
          </Button>
        </Card.Body>
      </Card>
    );
  }

  // Filter favorites based on the active tab
  const filteredFavorites = favorites.filter(favorite => {
    if (activeTab === 'all') return true;
    if (activeTab === 'recent') {
      const createdAt = new Date(favorite.createdAt);
      return createdAt >= recentCutoff;
    }
    return false;
  });

  // Sort favorites by date added (most recent first)
  const sortedFavorites = [...filteredFavorites].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className="favorites-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Your Favorite Courses</h4>
        <Nav variant="pills" className="flex-row" activeKey={activeTab} onSelect={setActiveTab}>
          <Nav.Item>
            <Nav.Link eventKey="all">All Favorites</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="recent">Recently Added</Nav.Link>
          </Nav.Item>
        </Nav>
      </div>

      {activeTab === 'recent' && sortedFavorites.length > 0 && (
        <div className="mb-4">
          <p className="text-muted">Showing favorites added in the last 7 days</p>
        </div>
      )}

      {sortedFavorites.length === 0 && (
        <Alert variant="info">
          {activeTab === 'all'
            ? 'You haven\'t added any favorites yet.'
            : 'You haven\'t added any favorites in the last 7 days.'}
        </Alert>
      )}

      <Row className="g-4">
        {sortedFavorites.map(favorite => (
          <Col key={favorite.id} sm={6} lg={4} xl={3}>
            <CourseCard
              course={favorite.course}
            />
            <div className="text-muted small mt-2">
              Added {formatDistanceToNow(new Date(favorite.createdAt), { addSuffix: true })}
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default FavoritesList;
