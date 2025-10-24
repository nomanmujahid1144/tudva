'use client'

import React, { useEffect, useState } from 'react';
import { FaAngleRight, FaAngleLeft, FaSearch, FaTable, FaTimes, FaRegEdit, FaPlus, FaEye } from 'react-icons/fa';
import { Button, Card, CardBody, CardHeader, Col, Row } from 'react-bootstrap';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import courseService from '@/services/courseService';
import { toast } from 'sonner';
import ConfirmDialog from '../../components/dialog/ConfirmDialog';
import Image from 'next/image';
import liveIcon from '@/assets/images/live-course.png';
import recordedIcon from '@/assets/images/recorded-course.png';

const TableLoadingSpinner = () => (
  <tr>
    <td colSpan="3" className="text-center py-5">
      <div className="d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className="ms-2 text-muted">Loading courses...</span>
      </div>
    </td>
  </tr>
);

const EmptyCoursesMessage = () => (
  <tr>
    <td colSpan="3" className="text-center py-5">
      <div className="d-flex flex-column align-items-center">
        <div className="mb-3">
          <FaTable className="text-muted" style={{ fontSize: '3rem' }} />
        </div>
        <p className="mb-3 text-muted">No courses found.</p>
        <Link href="/instructor/create-course">
          <Button variant="primary" size="sm" className="mb-0">
            <FaPlus className="me-2" /> Create a new course
          </Button>
        </Link>
      </div>
    </td>
  </tr>
);

const ManageCoursePage = () => {
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

        // Use the courseService to fetch instructor courses
        const result = await courseService.getInstructorCourses(currentPage, itemsPerPage, getSortParam());

        if (result.success) {
          setCourses(result.data.courses);
          setFilteredCourses(result.data.courses);
          setPagination(result.data.pagination);
        } else {
          toast.error(result.error || 'Failed to load courses');
        }
      } catch (error) {
        console.error('Error loading courses:', error);
        toast.error('Failed to load courses');
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      loadCourses();
    }
  }, [user, currentPage, sortBy]);

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

      // Use courseService to delete the course
      const result = await courseService.deleteCourse(courseId);

      if (result.success) {
        // Remove the course from the state
        const updatedCourses = courses.filter(course => course.id !== courseId);
        setCourses(updatedCourses);

        // Update filtered courses
        const updatedFilteredCourses = updatedCourses.filter(course =>
          course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredCourses(updatedFilteredCourses);

        // Update pagination information
        setPagination(prev => ({
          ...prev,
          totalCourses: prev.totalCourses - 1,
          totalPages: Math.ceil((prev.totalCourses - 1) / itemsPerPage),
          hasNextPage: currentPage < Math.ceil((prev.totalCourses - 1) / itemsPerPage),
        }));

        // If we deleted the last item on the current page, go to previous page
        if (updatedFilteredCourses.length === 0 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }

        toast.success('Course deleted successfully');
      } else {
        // Remove highlight if deletion failed
        if (deleteRowEl) {
          deleteRowEl.classList.remove('bg-danger', 'bg-opacity-10');
        }
        toast.error(result.error || 'Failed to delete course');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('An error occurred while deleting the course');
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
          <h3 className="mb-0 fs-4">My Courses</h3>
          <Link href="/instructor/create-course">
            <Button variant="primary" size="sm" className="mb-0">
              <FaPlus className="me-2" /> Create new course
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
                placeholder="Search for course title or description"
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
              <option value="newest">Sort by: Newest First</option>
              <option value="oldest">Sort by: Oldest First</option>
              <option value="a-z">Sort by: A to Z</option>
              <option value="z-a">Sort by: Z to A</option>
            </select>
          </Col>
        </Row>

        {/* Courses table */}
        <div className="table-responsive border-0 mb-4">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th scope="col" className="rounded-start-2 ps-4">Course</th>
                <th scope="col" className="text-center">Status</th>
                <th scope="col" className="text-end rounded-end-2 pe-4">Actions</th>
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

                        {/* Course title and info */}
                        <div>
                          <h6 className="mb-1 fw-semibold">
                            <Link
                              href={`/courses/${course.slug}`}
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

                    {/* Course status */}
                    <td className="text-center">
                      <div className={`badge ${course.status === 'published' ? 'bg-success' : 'bg-warning'} rounded-pill px-3 py-2`}>
                        {course.status === 'published' ? 'Published' : 'Draft'}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="text-end pe-4">
                      <div className="d-flex gap-2 justify-content-end">
                        <Link
                          href={`/courses/${course.slug}`}
                          className="btn btn-sm btn-light rounded-circle"
                          title="View course"
                          style={{ width: '32px', height: '32px', padding: '0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <FaEye />
                        </Link>
                        <Link
                          href={`/instructor/edit-course/${course.id}`}
                          className="btn btn-sm btn-primary rounded-circle"
                          title="Edit course"
                          style={{ width: '32px', height: '32px', padding: '0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <FaRegEdit />
                        </Link>
                        <button
                          className="btn btn-sm btn-danger-soft text-danger rounded-circle"
                          onClick={() => openDeleteConfirmation(course)}
                          title="Delete course"
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
            {/* Pagination info */}
            <p className="mb-0 text-muted">
              Showing {pagination.totalCourses > 0 ? ((pagination.page - 1) * itemsPerPage) + 1 : 0} to {Math.min(pagination.page * itemsPerPage, pagination.totalCourses)} of {pagination.totalCourses} entries
            </p>

            {/* Pagination controls */}
            {pagination.totalPages > 1 && (
              <nav aria-label="Course pagination">
                <ul className="pagination pagination-sm mb-0">
                  {/* Previous page button */}
                  <li className={`page-item ${!pagination.hasPrevPage ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => paginate(currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                    >
                      <FaAngleLeft />
                    </button>
                  </li>

                  {/* Page number buttons */}
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

                  {/* Next page button */}
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
        title="Delete Course"
        message={courseToDelete ? `Are you sure you want to delete "${courseToDelete.title || 'this course'}"? This action cannot be undone.` : 'Are you sure you want to delete this course?'}
        confirmText="Delete Course"
        cancelText="Cancel"
        variant="danger"
      />
    </Card>
  );
};

export default ManageCoursePage;