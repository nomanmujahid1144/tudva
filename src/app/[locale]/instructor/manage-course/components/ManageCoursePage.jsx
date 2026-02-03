// src/app/[locale]/instructor/manage-course/components/ManageCoursePage.jsx
'use client'

import React, { useEffect, useState } from 'react';
import { FaAngleRight, FaAngleLeft, FaSearch, FaTable, FaTimes, FaRegEdit, FaPlus, FaEye } from 'react-icons/fa';
import { Button, Card, CardBody, CardHeader, Col, Row } from 'react-bootstrap';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import courseService from '@/services/courseService';
import { toast } from 'sonner';
import ConfirmDialog from '../../../../components/dialog/ConfirmDialog';
import Image from 'next/image';
import liveIcon from '@/assets/images/live-course.png';
import recordedIcon from '@/assets/images/recorded-course.png';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

const TableLoadingSpinner = () => {
  const t = useTranslations('instructor.manageCourse');
  
  return (
    <tr>
      <td colSpan="3" className="text-center py-5">
        <div className="d-flex justify-content-center align-items-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{t('loading')}</span>
          </div>
          <span className="ms-2 text-muted">{t('loadingCourses')}</span>
        </div>
      </td>
    </tr>
  );
};

const EmptyCoursesMessage = () => {
  const t = useTranslations('instructor.manageCourse');
  const params = useParams();
  const locale = params.locale || 'en';
  
  return (
    <tr>
      <td colSpan="3" className="text-center py-5">
        <div className="d-flex flex-column align-items-center">
          <div className="mb-3">
            <FaTable className="text-muted" style={{ fontSize: '3rem' }} />
          </div>
          <p className="mb-3 text-muted">{t('noCourses')}</p>
          <Link href={`/${locale}/instructor/create-course`}>
            <Button variant="primary" size="sm" className="mb-0">
              <FaPlus className="me-2" /> {t('createFirstCourse')}
            </Button>
          </Link>
        </div>
      </td>
    </tr>
  );
};

const ManageCoursePage = () => {
  const t = useTranslations('instructor.manageCourse');
  const params = useParams();
  const locale = params.locale || 'en';
  
  // State management
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalCourses: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Confirm dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  // Context hooks
  const { user } = useAuth();

  // Load courses
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setIsLoading(true);

        const result = await courseService.getInstructorCourses(currentPage, itemsPerPage, getSortParam());

        if (result.success) {
          setCourses(result.data.courses);
          setFilteredCourses(result.data.courses);
          setPagination(result.data.pagination);
        } else {
          toast.error(result.error || t('loadError'));
        }
      } catch (error) {
        console.error('Error loading courses:', error);
        toast.error(t('loadError'));
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      loadCourses();
    }
  }, [user, currentPage, sortBy, t]);

  // Handle search filtering
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter(course =>
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCourses(filtered);
    }
  }, [searchTerm, courses]);

  // Convert UI sort option to API sort parameter
  const getSortParam = () => {
    switch (sortBy) {
      case 'newest': return '-createdAt';
      case 'oldest': return 'createdAt';
      case 'a-z': return 'title';
      case 'z-a': return '-title';
      default: return '-createdAt';
    }
  };

  // Handle delete course confirmation
  const openDeleteConfirmation = (course) => {
    setCourseToDelete(course);
    setShowConfirmDialog(true);
  };

  // Handle actual course deletion
  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;

    try {
      const courseId = courseToDelete.id;
      const deleteRowEl = document.getElementById(`course-row-${courseId}`);
      if (deleteRowEl) {
        deleteRowEl.classList.add('bg-danger', 'bg-opacity-10');
      }

      const result = await courseService.deleteCourse(courseId);

      if (result.success) {
        const updatedCourses = courses.filter(course => course.id !== courseId);
        setCourses(updatedCourses);

        const updatedFilteredCourses = updatedCourses.filter(course =>
          course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredCourses(updatedFilteredCourses);

        setPagination(prev => ({
          ...prev,
          totalCourses: prev.totalCourses - 1,
          totalPages: Math.ceil((prev.totalCourses - 1) / itemsPerPage),
          hasNextPage: currentPage < Math.ceil((prev.totalCourses - 1) / itemsPerPage),
        }));

        if (updatedFilteredCourses.length === 0 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }

        toast.success(t('deleteSuccess'));
      } else {
        if (deleteRowEl) {
          deleteRowEl.classList.remove('bg-danger', 'bg-opacity-10');
        }
        toast.error(result.error || t('deleteError'));
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error(t('deleteError'));
    }
  };

  // Pagination
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <Card className="border rounded-3">
      <CardHeader className="bg-white border-bottom p-4">
        <div className="d-flex justify-content-between align-items-center">
          <h3 className="mb-0 fs-4">{t('title')}</h3>
          <Link href={`/${locale}/instructor/create-course`}>
            <Button variant="primary" size="sm" className="mb-0">
              <FaPlus className="me-2" /> {t('createNewCourse')}
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardBody className="p-4">
        {/* Search and sort controls */}
        <Row className="g-3 align-items-center justify-content-between mb-4">
          <Col md={8}>
            <div className="input-group">
              <span className="input-group-text bg-transparent">
                <FaSearch className="text-muted" />
              </span>
              <input
                className="form-control border-start-0"
                type="search"
                placeholder={t('searchPlaceholder')}
                aria-label="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="btn btn-outline-secondary border-start-0"
                  type="button"
                  onClick={() => setSearchTerm('')}
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </Col>
          <Col md={4}>
            <select
              className="form-select"
              aria-label="Sort courses"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">{t('sortNewest')}</option>
              <option value="oldest">{t('sortOldest')}</option>
              <option value="a-z">{t('sortAZ')}</option>
              <option value="z-a">{t('sortZA')}</option>
            </select>
          </Col>
        </Row>

        {/* Courses table */}
        <div className="table-responsive border-0 mb-4">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th scope="col" className="rounded-start-2 ps-4">{t('course')}</th>
                <th scope="col" className="text-center">{t('status')}</th>
                <th scope="col" className="text-end rounded-end-2 pe-4">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <TableLoadingSpinner />
              ) : filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <tr key={course.id} id={`course-row-${course.id}`} className="transition-all">
                    <td className="ps-4">
                      <div className="d-flex align-items-center">
                        <div
                          className="rounded-3 d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                          style={{
                            width: '60px',
                            height: '60px',
                            backgroundColor: course.backgroundColorHex || '#f5f5f5',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                          }}
                        >
                          {course.iconUrl ? (
                            <img
                              src={course.iconUrl}
                              alt={course.title}
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

                        <div>
                          <h6 className="mb-1 fw-semibold">
                            <Link
                              href={`/${locale}/courses/${course.slug}`}
                              className="text-decoration-none text-dark"
                            >
                              {course.title}
                            </Link>
                          </h6>
                          <div className="d-flex align-items-center gap-3" style={{ maxWidth: '400px' }}>
                            <Image
                              src={course.type === 'live' ? liveIcon : recordedIcon}
                              alt={course.type === 'live' ? "Live Course" : "Recorded Course"}
                              width={36}
                              height={36}
                              className="me-1"
                            />
                            {course.shortDescription && (
                              <p className="mb-0 small">
                                {course.shortDescription.length > 100
                                  ? `${course.shortDescription.substring(0, 100)}...`
                                  : course.shortDescription}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="text-center">
                      <div className={`badge ${course.status === 'published' ? 'bg-success' : 'bg-warning'} rounded-pill px-3 py-2`}>
                        {course.status === 'published' ? t('published') : t('draft')}
                      </div>
                    </td>

                    <td className="text-end pe-4">
                      <div className="d-flex gap-2 justify-content-end">
                        <Link
                          href={`/${locale}/courses/${course.slug}`}
                          className="btn btn-sm btn-light rounded-circle"
                          title={t('viewCourse')}
                          style={{ width: '32px', height: '32px', padding: '0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <FaEye />
                        </Link>
                        <Link
                          href={`/${locale}/instructor/edit-course/${course.id}`}
                          className="btn btn-sm btn-primary rounded-circle"
                          title={t('editCourse')}
                          style={{ width: '32px', height: '32px', padding: '0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <FaRegEdit />
                        </Link>
                        <button
                          className="btn btn-sm btn-danger-soft text-danger rounded-circle"
                          onClick={() => openDeleteConfirmation(course)}
                          title={t('deleteCourse')}
                          style={{ width: '32px', height: '32px', padding: '0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <EmptyCoursesMessage />
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {!isLoading && filteredCourses.length > 0 && (
          <div className="d-flex justify-content-between align-items-center">
            <p className="mb-0 text-muted">
              {t('showing')} {pagination.totalCourses > 0 ? ((pagination.page - 1) * itemsPerPage) + 1 : 0} {t('to')} {Math.min(pagination.page * itemsPerPage, pagination.totalCourses)} {t('of')} {pagination.totalCourses} {t('entries')}
            </p>

            {pagination.totalPages > 1 && (
              <nav aria-label="Course pagination">
                <ul className="pagination pagination-sm mb-0">
                  <li className={`page-item ${!pagination.hasPrevPage ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => paginate(currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                    >
                      <FaAngleLeft />
                    </button>
                  </li>

                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(number => (
                    <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => paginate(number)}
                      >
                        {number}
                      </button>
                    </li>
                  ))}

                  <li className={`page-item ${!pagination.hasNextPage ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => paginate(currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                    >
                      <FaAngleRight />
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        )}
      </CardBody>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        show={showConfirmDialog}
        onHide={() => setShowConfirmDialog(false)}
        onConfirm={handleDeleteCourse}
        title={t('deleteConfirmTitle')}
        message={courseToDelete ? t('deleteConfirmMessage', { title: courseToDelete.title || 'this course' }) : t('deleteConfirmMessage', { title: 'this course' })}
        confirmText={t('deleteConfirmButton')}
        cancelText={t('cancel')}
        variant="danger"
      />
    </Card>
  );
};

export default ManageCoursePage;