'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Container, Row, Col, Form, InputGroup, Button } from 'react-bootstrap';
import { FaSearch, FaHeart } from 'react-icons/fa';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/context/AuthContext';
import CourseCard from '../../../components/courses/CourseCard';
import CourseCardSkeleton from './CourseCardSkeleton';
import { useRouter } from 'next/navigation';

const FavoriteCourses = () => {
  const { user, authLoading, loading } = useAuth();
  const { courses, isLoading, error, refresh, removeCourseFromList } = useFavorites();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();


  if (!user && !loading) {
    router.push('/auth/sign-in');
  }

  // Client-side filtering
  const filteredCourses = useMemo(() => {
    if (!courses || courses.length === 0) return [];
    return courses.filter(course => {
      const matchesSearch = !searchQuery ||
        course.title?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [courses, searchQuery]);

  // Handle search input
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
  };

  // Handle favorite toggle
  const handleFavoriteToggle = useCallback(async (courseId, newStatus) => {
    if (!newStatus) {
      removeCourseFromList(courseId);
    }
  }, [removeCourseFromList]);

  return (
    <section className="pt-5 pb-5">
      <Container>
        {/* Header with Search */}
        <div className="d-sm-flex justify-content-sm-between align-items-center mb-4">
          <div className="mb-3 mb-sm-0">
            <h3 className="mb-1">
              <FaHeart className="text-danger me-2" />
              My Favorite Courses
            </h3>
            <p className="text-muted mb-0">
              {isLoading ? (
                'Loading your favorite courses...'
              ) : (
                <>
                  You have {filteredCourses.length}
                  {searchQuery ? ` of ${courses?.length || 0}` : ''}{" "}
                  favorite course{filteredCourses.length !== 1 ? 's' : ''}
                </>
              )}
            </p>
          </div>

          {/* Search Bar */}
          {!isLoading && courses && courses.length > 0 && (
            <div className="d-flex gap-2" style={{ minWidth: '300px' }}>
              <InputGroup>
                <Form.Control
                  type="search"
                  placeholder="Search favorite courses..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <Button
                  variant="outline-secondary"
                  onClick={clearSearch}
                  title="Clear search"
                >
                  <FaSearch />
                </Button>
              </InputGroup>
            </div>
          )}
        </div>

        {/* Loading State with Skeletons */}
        {isLoading && (
          <Row className="g-4">
            {[...Array(4)].map((_, idx) => (
              <Col lg={6} key={idx}>
                <CourseCardSkeleton />
              </Col>
            ))}
          </Row>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-5">
            <div className="alert alert-danger">
              <h5>Error Loading Favorites</h5>
              <p className="mb-0">{error}</p>
              <Button variant="outline-primary" onClick={refresh} className="mt-3">
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Empty State - No Favorites */}
        {!isLoading && !error && courses && courses.length === 0 && (
          <div className="text-center py-5">
            <FaHeart size={64} className="text-muted mb-3" />
            <h4>No Favorite Courses Yet</h4>
            <p className="text-muted mb-4">
              Start exploring courses and add them to your favorites by clicking the heart icon.
            </p>
            <Button variant="primary" href="/courses">
              Browse Courses
            </Button>
          </div>
        )}

        {/* {!isLoading && !error && courses && courses.length === 0 && (
          <Row className="g-4">
            {[...Array(4)].map((_, idx) => (
              <Col lg={6} key={idx}>
                <CourseCardSkeleton />
              </Col>
            ))}
          </Row>
        )} */}

        {/* Empty State - No Search Results */}
        {!isLoading && !error && courses && courses.length > 0 && filteredCourses.length === 0 && (
          <div className="text-center py-5">
            <FaSearch size={48} className="text-muted mb-3" />
            <h4>No Courses Found</h4>
            <p className="text-muted mb-3">
              No courses match your search criteria "{searchQuery}".
            </p>
            <Button variant="outline-primary" onClick={clearSearch}>
              Clear Search
            </Button>
          </div>
        )}

        {/* Courses Grid */}
        {!isLoading && !error && filteredCourses.length > 0 && (
          <>
            <Row className="g-4">
              {filteredCourses.map((course, idx) => (
                <Col lg={6} key={course.id || idx}>
                  {console.log(course, 'course')}
                  <CourseCard
                    course={{
                      id: course.id,
                      title: course.title,
                      short_description: course.shortDescription,
                      description: course.description,
                      category: course.category,
                      subcategory: course.subcategory,
                      level: course.level,
                      slug: course.slug,
                      color: course.backgroundColorHex || "#630000",
                      iconUrl: course.iconUrl,
                      format: course.type,
                      rating: {
                        stars: course.stats.rating,
                        reviewCount: course.stats.reviewCount
                      },
                      instructor: {
                        name: typeof course.instructor === 'object' && course.instructor?.name
                          ? course.instructor.name
                          : 'Unknown Instructor'
                      },
                      isFavorite: true
                    }}
                    isFavoritePage={true}
                    onFavoriteToggle={handleFavoriteToggle}
                  />
                </Col>
              ))}
            </Row>

            {/* Show results info */}
            {searchQuery && (
              <div className="text-center mt-4">
                <small className="text-muted">
                  Showing {filteredCourses.length} of {courses.length} favorite courses
                </small>
              </div>
            )}
          </>
        )}
      </Container>

      <style jsx>{`
        .alert {
          border-radius: 10px;
        }
        
        .form-control:focus {
          border-color: #dc3545;
          box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
        }

        .skeleton-shimmer {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </section>
  );
};

export default FavoriteCourses;