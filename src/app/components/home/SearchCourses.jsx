"use client";

import { Col, Container, Row, Spinner, ListGroup, Card, Badge } from "react-bootstrap";
import { FaSearch, FaTimes, FaBook } from "react-icons/fa";
import { useTranslations } from "next-intl";
import { useCourseSearch } from "@/hooks/useCourseSearch";
import { useParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import liveIcon from '@/assets/images/live-course.png';
import recordedIcon from '@/assets/images/recorded-course.png';
import { formatCourseLevel } from "@/utils/textFormatting";

const SearchCourses = () => {
  const t = useTranslations('home.searchCourses');
  const params = useParams();
  const router = useRouter();
  const locale = params?.locale || 'en';

  const { query, setQuery, results, isLoading, error, total, clearSearch } = useCourseSearch('', 10);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowResults(value.length >= 2);
  };

  const handleClearSearch = () => {
    clearSearch();
    setShowResults(false);
  };

  const handleCourseClick = (slug) => {
    router.push(`/${locale}/courses/${slug}`);
    setShowResults(false);
    clearSearch();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (results.length > 0) {
      handleCourseClick(results[0].slug);
    }
  };

  return (
    <section className="pt-0 pt-lg-5">
      <Container>
        <Row className="mb-4 align-items-center text-center justify-content-center">
          <Col sm={12}>
            <p className="my-md-0 my-3 merienda-text xxx-large">{t('heading')}</p>
            <p className="mb-3 xx-large text-center text-md-end">{t('subheading')}</p>
            <div className="d-flex justify-content-center w-100">
              <div className="position-relative w-100 w-md-50" ref={searchRef}>
                <form className="border rounded p-2 mb-4" onSubmit={handleSubmit}>
                  <div className="input-group">
                    <input
                      className="form-control border-0 me-1"
                      type="search"
                      placeholder={t('placeholder')}
                      value={query}
                      onChange={handleInputChange}
                      onFocus={() => query.length >= 2 && setShowResults(true)}
                    />
                    {query && (
                      <button
                        type="button"
                        className="btn btn-light border-0 me-1"
                        onClick={handleClearSearch}
                        aria-label={t('clear')}
                      >
                        <FaTimes />
                      </button>
                    )}
                    <button type="submit" className="btn btn-danger mb-0 rounded">
                      {isLoading ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <FaSearch />
                      )}
                    </button>
                  </div>
                </form>

                {/* Search Results Dropdown */}
                {showResults && query.length >= 2 && (
                  <Card
                    className="position-absolute w-100 shadow-lg border rounded-3"
                    style={{
                      zIndex: 100,
                      maxHeight: '500px',
                      overflowY: 'auto'
                    }}
                  >
                    <Card.Body className="p-0">
                      {isLoading ? (
                        <div className="text-center py-5">
                          <Spinner animation="border" variant="primary" />
                          <p className="mt-3 text-muted small">{t('searching')}</p>
                        </div>
                      ) : error ? (
                        <div className="text-center py-4 text-danger">
                          <p className="mb-0">{error}</p>
                        </div>
                      ) : results.length === 0 ? (
                        <div className="text-center py-5">
                          <FaBook className="text-muted mb-3" size={48} />
                          <p className="text-muted mb-0">{t('noResults')}</p>
                        </div>
                      ) : (
                        <>
                          <div className="px-4 py-3 bg-light border-bottom">
                            <small className="text-muted fw-semibold">
                              {t('resultsCount', { count: results.length, total })}
                            </small>
                          </div>
                          <ListGroup variant="flush">
                            {results.map((course) => (
                              <ListGroup.Item
                                key={course.id}
                                action
                                onClick={() => handleCourseClick(course.slug)}
                                className="border-0 py-3 px-4"
                                style={{
                                  cursor: 'pointer',
                                  transition: 'background-color 0.2s ease'
                                }}
                              >
                                <div className="d-flex align-items-start">
                                  {/* Course Icon - SAME AS MANAGE COURSE */}
                                  <div
                                    className="rounded-3 d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                                    style={{
                                      width: '60px',
                                      height: '60px',
                                      backgroundColor: course.backgroundColorHex || '#f5f5f5',
                                    }}
                                  >
                                    {course.iconUrl ? (
                                      <img
                                        src={course.iconUrl}
                                        alt={course.title}
                                        style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                                      />
                                    ) : (
                                      <FaBook className="fs-3 text-primary" />
                                    )}
                                  </div>

                                  {/* Course Info */}
                                  <div className="flex-grow-1 min-w-0 text-start">
                                    <h6 className="mb-2 fs-4 fw-semibold">
                                      {course.title}
                                    </h6>
                                    <div className="d-flex align-items-left gap-3">
                                      <div className="d-flex align-items-start gap-3">
                                        <Image
                                          src={course.type === 'live' ? liveIcon : recordedIcon}
                                          alt={course.type === 'live' ? t('liveCourse') : t('recordedCourse')}
                                          className='me-2'
                                          width={60}
                                          height={60}
                                        />
                                        <p className="fs-5 mb-2">
                                          {course.shortDescription?.substring(0, 150) + (course.shortDescription?.length > 150 ? '...' : '') || t('noDescription')}
                                        </p>
                                      </div>
                                    </div>
                                    {/* Badges below description */}
                                    <div className="d-flex align-items-center gap-2 flex-wrap mt-2">
                                      <Badge
                                        bg="primary"
                                        className="fs-6 px-3 rounded-pill fw-normal"
                                      >
                                        {course.category}
                                      </Badge>
                                      <Badge
                                        bg="primary"
                                        className="fs-6 px-3 rounded-pill fw-normal"
                                      >
                                        {course.subcategory}
                                      </Badge>
                                      <Badge
                                        bg="primary"
                                        className="fs-6 px-3 rounded-pill fw-normal"
                                      >
                                        {formatCourseLevel(course.level)}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                          {total > results.length && (
                            <div className="px-4 py-3 bg-light border-top text-center">
                              <small className="text-muted">
                                {t('showingFirst', { count: results.length, total })}
                              </small>
                            </div>
                          )}
                        </>
                      )}
                    </Card.Body>
                  </Card>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default SearchCourses;