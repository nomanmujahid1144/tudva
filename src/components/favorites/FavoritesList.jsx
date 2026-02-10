'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardBody, Row, Col, Spinner, Alert, Button, Nav } from 'react-bootstrap';
import { FaHeart, FaBookOpen, FaSearch, FaTimes, FaEye, FaTable } from 'react-icons/fa';
import favoritesService from '@/services/favoritesService';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import liveIcon from '@/assets/images/live-course.png';
import recordedIcon from '@/assets/images/recorded-course.png';
import FavoriteButton from '@/components/common/FavoriteButton';
import { useTranslations } from 'next-intl';

const TableLoadingSpinner = () => {
  const t = useTranslations('favorites.list');
  
  return (
    <tr>
      <td colSpan="3" className="text-center py-5">
        <div className="d-flex justify-content-center align-items-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{t('loading')}</span>
          </div>
          <span className="ms-2 text-muted">{t('loadingMessage')}</span>
        </div>
      </td>
    </tr>
  );
};

const EmptyFavoritesMessage = () => {
  const t = useTranslations('favorites.list');
  const params = useParams();
  const locale = params?.locale || 'en';
  
  return (
    <tr>
      <td colSpan="3" className="text-center py-5">
        <div className="d-flex flex-column align-items-center">
          <div className="mb-3">
            <FaHeart className="text-muted" style={{ fontSize: '3rem' }} />
          </div>
          <h5 className="mb-3 text-muted">{t('empty.title')}</h5>
          <p className="text-muted mb-3">{t('empty.message')}</p>
          <Link href={`/${locale}/courses`}>
            <Button variant="primary" size="sm" className="mb-0">
              <FaBookOpen className="me-2" /> {t('empty.browseButton')}
            </Button>
          </Link>
        </div>
      </td>
    </tr>
  );
};

const FavoritesList = () => {
  const t = useTranslations('favorites.list');
  const [favorites, setFavorites] = useState([]);
  const [filteredFavorites, setFilteredFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || 'en';

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

        const response = await favoritesService.getFavoriteCourses({ limit: 1000 });
        console.log('Favorites API Response:', response);

        if (response.success) {
          setFavorites(response.data.courses || []);
          setFilteredFavorites(response.data.courses || []);
        } else {
          setError(response.error || t('error.fetchFailed'));
        }
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setError(err.message || t('error.fetchFailed'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [user, t]);

  // Handle search filtering
  useEffect(() => {
    let filtered = favorites;

    // Apply tab filter
    if (activeTab === 'recent') {
      filtered = filtered.filter(fav => {
        const createdAt = new Date(fav.createdAt);
        return createdAt >= recentCutoff;
      });
    }

    // Apply search filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(fav =>
        fav.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fav.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredFavorites(filtered);
  }, [searchTerm, favorites, activeTab, recentCutoff]);

  // Handle favorite removal
  const handleFavoriteRemoved = (courseId) => {
    setFavorites(prevFavorites => 
      prevFavorites.filter(fav => fav.id !== courseId)
    );
  };

  // Not logged in state
  if (!user) {
    return (
      <Card className="border-0 shadow-sm">
        <CardBody className="text-center py-5 px-4">
          <div className="mb-4">
            <FaHeart size={64} className="text-muted opacity-50" />
          </div>
          <h4 className="mb-3">{t('notLoggedIn.title')}</h4>
          <p className="text-muted mb-4">{t('notLoggedIn.message')}</p>
          <div className="d-flex gap-3 justify-content-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push('/auth/sign-in')}
            >
              {t('notLoggedIn.signInButton')}
            </Button>
            <Button
              variant="outline-primary"
              size="lg"
              onClick={() => router.push(`/${locale}/courses`)}
            >
              <FaBookOpen className="me-2" />
              {t('notLoggedIn.browseButton')}
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="danger" className="my-4 d-flex align-items-center justify-content-between">
        <div>
          <strong>{t('error.title')}:</strong> {error}
        </div>
        <Button 
          variant="outline-danger" 
          size="sm"
          onClick={() => window.location.reload()}
        >
          {t('error.retryButton')}
        </Button>
      </Alert>
    );
  }

  const recentCount = favorites.filter(f => new Date(f.createdAt) >= recentCutoff).length;

  return (
    <Card className="border rounded-3">
      <CardBody className="p-4">
        {/* Search bar */}
        <Row className="g-3 align-items-center mb-4">
          <Col md={12}>
            <div className="input-group">
              <span className="input-group-text bg-transparent">
                <FaSearch className="text-muted" />
              </span>
              <input
                className="form-control border-start-0"
                type="search"
                placeholder={t('search.placeholder')}
                aria-label="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="btn btn-outline-secondary border-start-0"
                  type="button"
                  onClick={() => setSearchTerm('')}
                  aria-label={t('search.clearButton')}
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </Col>
        </Row>

        {/* Recent filter info */}
        {activeTab === 'recent' && filteredFavorites.length > 0 && (
          <Alert variant="info" className="mb-4">
            <small>{t('filter.recentMessage')}</small>
          </Alert>
        )}

        {/* Favorites table */}
        <div className="table-responsive border-0 mb-4">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th scope="col" className="rounded-start-2 ps-4">{t('table.course')}</th>
                <th scope="col" className="text-center">{t('table.added')}</th>
                <th scope="col" className="text-end rounded-end-2 pe-4">{t('table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <TableLoadingSpinner />
              ) : filteredFavorites.length > 0 ? (
                filteredFavorites.map((favorite) => (
                  <tr key={favorite.id} id={`favorite-row-${favorite.id}`} className="transition-all">
                    <td className="ps-4">
                      <div className="d-flex align-items-center">
                        {/* Course Icon */}
                        <div
                          className="rounded-3 d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                          style={{
                            width: '60px',
                            height: '60px',
                            backgroundColor: favorite.backgroundColorHex || '#f5f5f5',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                          }}
                        >
                          {favorite.iconUrl ? (
                            <img
                              src={favorite.iconUrl}
                              alt={favorite.title}
                              style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                                e.target.parentNode.innerHTML = '<i class="fas fa-book fs-3 text-primary"></i>';
                              }}
                            />
                          ) : (
                            <FaTable className="fs-3 text-primary" />
                          )}
                        </div>

                        {/* Course Info */}
                        <div>
                          <h6 className="mb-1 fw-semibold">
                            <Link
                              href={`/${locale}/courses/${favorite.slug}`}
                              className="text-decoration-none text-dark"
                            >
                              {favorite.title}
                            </Link>
                          </h6>
                          <div className="d-flex align-items-center gap-3" style={{ maxWidth: '400px' }}>
                            <Image
                              src={favorite.type === 'live' ? liveIcon : recordedIcon}
                              alt={favorite.type === 'live' ? t('courseType.live') : t('courseType.recorded')}
                              width={36}
                              height={36}
                              className="me-1"
                            />
                            {favorite.shortDescription && (
                              <p className="mb-0 small text-muted">
                                {favorite.shortDescription.length > 100
                                  ? `${favorite.shortDescription.substring(0, 100)}...`
                                  : favorite.shortDescription}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="text-center">
                      <small className="text-muted">
                        {formatDistanceToNow(new Date(favorite.createdAt), { addSuffix: true })}
                      </small>
                    </td>

                    <td className="text-end pe-4">
                      <div className="d-flex gap-2 justify-content-end">
                        <Link
                          href={`/${locale}/courses/${favorite.slug}`}
                          className="btn btn-sm btn-light rounded-circle"
                          title={t('actions.viewCourse')}
                          style={{ width: '32px', height: '32px', padding: '0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <FaEye />
                        </Link>
                        <FavoriteButton
                          courseId={favorite.id}
                          variant="light"
                          size="sm"
                          className="rounded-circle"
                          iconOnly={true}
                          asButton={true}
                          onFavoriteChange={(isFav) => {
                            if (!isFav) handleFavoriteRemoved(favorite.id);
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <EmptyFavoritesMessage />
              )}
            </tbody>
          </table>
        </div>

        {/* Results count */}
        {!isLoading && filteredFavorites.length > 0 && (
          <div className="d-flex justify-content-between align-items-center">
            <p className="mb-0 text-muted">
              {t('results.showing', { 
                count: filteredFavorites.length, 
                total: favorites.length 
              })}
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default FavoritesList;