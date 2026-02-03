"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button, Col, Container, FormControl, Row, Form } from "react-bootstrap";
import { FaSearch, FaFilter, FaSortAmountDown, FaTimes } from "react-icons/fa";
import { useLocale, useTranslations } from "next-intl";
import Pagination from "./Pagination";
import CourseCard from "./CourseCard";
import CourseCardSkeleton from "./CourseCardSkeleton";
import liveIcon from '@/assets/images/live-course.png';
import recordedIcon from '@/assets/images/recorded-course.png';

const CourseList = () => {
  const t = useTranslations('courses.list');
  const tCat = useTranslations('categories');
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname(); // ADD THIS
  const locale = useLocale();

  // Course Categories - using translation keys
  const courseCategories = [
    { value: 'All', label: tCat('all') },
    { value: 'Languages & Communication', label: tCat('languagesCommunication.title') },
    { value: 'Cooking & Household', label: tCat('cookingHousehold.title') },
    { value: 'Creativity & Craftsmanship', label: tCat('creativityCraftsmanship.title') },
    { value: 'Digital & IT', label: tCat('digitalIT.title') },
    { value: 'Health & Exercise', label: tCat('healthExercise.title') },
    { value: 'Nature & Gardening', label: tCat('natureGardening.title') },
    { value: 'Career & Education', label: tCat('careerEducation.title') }
  ];

  // Subcategories mapping - using translation keys
  const subcategoriesMap = {
    'Languages & Communication': [
      { value: 'Foreign Languages', label: tCat('languagesCommunication.foreignLanguages') },
      { value: 'Learning the National Language', label: tCat('languagesCommunication.nationalLanguage') },
      { value: 'Rhetoric & International Communication', label: tCat('languagesCommunication.rhetoric') }
    ],
    'Cooking & Household': [
      { value: 'Cooking & Baking (including International Cuisine)', label: tCat('cookingHousehold.cooking') },
      { value: 'Nutrition & Sustainability', label: tCat('cookingHousehold.nutrition') },
      { value: 'Home Economics', label: tCat('cookingHousehold.homeEconomics') }
    ],
    'Creativity & Craftsmanship': [
      { value: 'Painting, Drawing, Photography', label: tCat('creativityCraftsmanship.painting') },
      { value: 'Sewing, Crafting, DIY', label: tCat('creativityCraftsmanship.sewing') },
      { value: 'Arts & More', label: tCat('creativityCraftsmanship.arts') }
    ],
    'Digital & IT': [
      { value: 'Computers & Internet', label: tCat('digitalIT.computers') },
      { value: 'Social Media & Data Protection', label: tCat('digitalIT.socialMedia') },
      { value: 'Software & Tools', label: tCat('digitalIT.software') }
    ],
    'Health & Exercise': [
      { value: 'Fitness, Yoga & More', label: tCat('healthExercise.fitness') },
      { value: 'Relaxation & Stress Management', label: tCat('healthExercise.relaxation') },
      { value: 'Prevention & Well-being', label: tCat('healthExercise.prevention') }
    ],
    'Nature & Gardening': [
      { value: 'Gardening & Urban Gardening', label: tCat('natureGardening.gardening') },
      { value: 'Environment & Sustainability', label: tCat('natureGardening.environment') },
      { value: 'Eco Projects', label: tCat('natureGardening.ecoProjects') }
    ],
    'Career & Education': [
      { value: 'Soft Skills & Time Management', label: tCat('careerEducation.softSkills') },
      { value: 'Career Orientation & Qualification', label: tCat('careerEducation.careerOrientation') },
      { value: 'Basic Education & Literacy', label: tCat('careerEducation.basicEducation') }
    ]
  };

  // Course Types
  const courseTypes = [
    { value: 'All', label: t('filters.courseType.all'), icon: null },
    { value: 'live', label: t('filters.courseType.live'), icon: liveIcon },
    { value: 'recorded', label: t('filters.courseType.recorded'), icon: recordedIcon }
  ];

  // Sort Options
  const sortOptions = [
    { value: '', label: t('filters.sortBy.mostRelevant') },
    { value: 'popular', label: t('filters.sortBy.popular') },
    { value: 'most-viewed', label: t('filters.sortBy.mostViewed') },
    { value: 'newest', label: t('filters.sortBy.newest') },
    { value: 'oldest', label: t('filters.sortBy.oldest') }
  ];

  // Level Options
  const levelOptions = [
    { value: 'All', label: t('filters.level.all') },
    { value: 'beginner', label: t('filters.level.beginner') },
    { value: 'intermediate', label: t('filters.level.intermediate') },
    { value: 'advanced', label: t('filters.level.advanced') },
    { value: 'all_levels', label: t('filters.level.allLevels') }
  ];

  // Get URL params or set defaults
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [subcategory, setSubcategory] = useState(searchParams.get("subcategory") || "All");
  const [type, setType] = useState(searchParams.get("type") || "All");
  const [level, setLevel] = useState(searchParams.get("level") || "All");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "");
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1", 10));

  // State for courses data
  const [courses, setCourses] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [categoriesWithCount, setCategoriesWithCount] = useState([]);

  // Debounced search
  const [searchQuery, setSearchQuery] = useState(search);
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Get available subcategories based on selected category
  const availableSubcategories = category !== 'All' ? subcategoriesMap[category] || [] : [];

  // Helper function to get translated category label
  const getCategoryLabel = (categoryValue) => {
    const category = courseCategories.find(cat => cat.value === categoryValue);
    return category ? category.label : categoryValue;
  };

  // Helper function to get translated subcategory label
  const getSubcategoryLabel = (categoryValue, subcategoryValue) => {
    const subcats = subcategoriesMap[categoryValue];
    if (!subcats) return subcategoryValue;
    const subcat = subcats.find(sc => sc.value === subcategoryValue);
    return subcat ? subcat.label : subcategoryValue;
  };

  // Reset subcategory when category changes
  useEffect(() => {
    if (category === 'All' || !subcategoriesMap[category]?.some(sc => sc.value === subcategory)) {
      setSubcategory('All');
    }
  }, [category]);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/courses/categories');
        const data = await response.json();
        if (data.success) {
          setCategoriesWithCount(data.data.categories || []);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Function to fetch courses with current filters
  const fetchCourses = useCallback(async () => {
    setIsLoading(true);

    try {
      const sortMap = {
        "free": "price",
        "most-viewed": "-enrollmentCount",
        "popular": "-rating",
        "newest": "-createdAt",
        "oldest": "createdAt"
      };

      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', '6');
      queryParams.append('sort', sortMap[sortBy] || '-createdAt');

      if (category && category !== "All") queryParams.append('category', category);
      if (subcategory && subcategory !== "All") queryParams.append('subcategory', subcategory);
      if (type && type !== "All") queryParams.append('type', type);
      if (level && level !== "All") queryParams.append('level', level);
      if (searchQuery.trim()) queryParams.append('search', searchQuery.trim());

      const response = await fetch(`/api/courses?${queryParams.toString()}`);
      const data = await response.json();

      if (data.success) {
        setCourses(data.data.courses || []);
        setTotalPages(data.data.pagination?.totalPages || 1);
        setTotalCourses(data.data.pagination?.totalDocuments || 0);
      } else {
        setCourses([]);
        setTotalPages(1);
        setTotalCourses(0);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourses([]);
      setTotalPages(1);
      setTotalCourses(0);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, category, subcategory, type, level, sortBy, page]);

  // Update URL when filters change
  const updateURL = useCallback(() => {
    const queryParams = new URLSearchParams();

    if (searchQuery.trim()) queryParams.append("search", searchQuery.trim());
    if (category !== "All") queryParams.append("category", category);
    if (subcategory !== "All") queryParams.append("subcategory", subcategory);
    if (type !== "All") queryParams.append("type", type);
    if (level !== "All") queryParams.append("level", level);
    if (sortBy) queryParams.append("sortBy", sortBy);
    if (page > 1) queryParams.append("page", page.toString());

    const queryString = queryParams.toString();
    
    const url = queryString 
      ? `${pathname}?${queryString}` 
      : pathname;

    router.push(url, { scroll: false });
  }, [searchQuery, category, subcategory, type, level, sortBy, page, router, pathname]);

  // Fetch courses when filters change
  useEffect(() => {
    fetchCourses();
    updateURL();
  }, [fetchCourses, updateURL]);

  // Handle search with debouncing
  const handleSearchChange = (value) => {
    setSearch(value);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const newTimeout = setTimeout(() => {
      setSearchQuery(value);
      setPage(1);
    }, 500);

    setSearchTimeout(newTimeout);
  };

  // Handle instant filter changes
  const handleFilterChange = (filterType, value) => {
    setPage(1);

    switch (filterType) {
      case 'category':
        setCategory(value);
        break;
      case 'subcategory':
        setSubcategory(value);
        break;
      case 'type':
        setType(value);
        break;
      case 'level':
        setLevel(value);
        break;
      case 'sort':
        setSortBy(value);
        break;
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearch("");
    setSearchQuery("");
    setCategory("All");
    setSubcategory("All");
    setType("All");
    setLevel("All");
    setSortBy("");
    setPage(1);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
  };

  // Clear individual filter
  const clearFilter = (filterType) => {
    switch (filterType) {
      case 'search':
        setSearch("");
        setSearchQuery("");
        if (searchTimeout) clearTimeout(searchTimeout);
        break;
      case 'category':
        setCategory("All");
        setSubcategory("All");
        break;
      case 'subcategory':
        setSubcategory("All");
        break;
      case 'type':
        setType("All");
        break;
      case 'level':
        setLevel("All");
        break;
      case 'sort':
        setSortBy("");
        break;
    }
    setPage(1);
  };

  // Handle course type selection
  const handleCourseTypeSelect = (selectedType) => {
    handleFilterChange('type', selectedType);
  };

  return (
    <section className="pt-5">
      <Container>
        {/* Filters Section */}
        <div className="card shadow-sm mb-4 position-relative">
          <div className="card-body">
            <h5 className="mb-3">
              <FaFilter className="me-2" />
              {t('filters.title')}
              {totalCourses > 0 && (
                <span className="badge bg-primary ms-2">
                  {t('filters.resultsCount', { count: totalCourses })}
                </span>
              )}
            </h5>

            {/* Search Row */}
            <Row className="g-3 mb-3">
              <Col md={12} lg={6}>
                <Form.Group>
                  <Form.Label className="mb-1 small">{t('filters.search.label')}</Form.Label>
                  <div className="input-group">
                    <FormControl
                      type="search"
                      placeholder={t('filters.search.placeholder')}
                      value={search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="form-control rounded-start"
                    />
                    <Button variant="primary" type="submit" className="mb-0">
                      <FaSearch className="me-md-2" />
                    </Button>
                  </div>
                </Form.Group>
              </Col>

              <Col md={6} lg={3}>
                <Form.Group>
                  <Form.Label className="mb-1 small">{t('filters.courseType.label')}</Form.Label>
                  <div className="d-flex gap-2" style={{ height: '50px' }}>
                    {courseTypes.map((courseType) => (
                      <div
                        key={courseType.value}
                        className={`course-type-filter ${courseType.value === 'All' ? 'type-all' : ''} ${courseType.value === type ? 'active' : ''}`}
                        onClick={() => handleCourseTypeSelect(courseType.value)}
                      >
                        {courseType.icon ? (
                          <Image
                            src={courseType.icon}
                            alt={courseType.label}
                            width={50}
                            height={50}
                            className="me-1"
                          />
                        ) : (
                          <span className="fs-5">{courseType.label}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </Form.Group>
              </Col>

              <Col md={6} lg={3}>
                <Form.Group>
                  <Form.Label className="mb-1 small">{t('filters.level.label')}</Form.Label>
                  <Form.Select
                    value={level}
                    onChange={(e) => handleFilterChange('level', e.target.value)}
                    className="form-select"
                  >
                    {levelOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* Category and Sort Row */}
            <Row className="g-3">
              <Col md={6} lg={3}>
                <Form.Group>
                  <Form.Label className="mb-1 small">{t('filters.category.label')}</Form.Label>
                  <Form.Select
                    value={category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="form-select"
                  >
                    {courseCategories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6} lg={3}>
                <Form.Group>
                  <Form.Label className="mb-1 small">{t('filters.subcategory.label')}</Form.Label>
                  <Form.Select
                    value={subcategory}
                    onChange={(e) => handleFilterChange('subcategory', e.target.value)}
                    className="form-select"
                    disabled={category === 'All'}
                  >
                    <option value="All">{t('filters.subcategory.all')}</option>
                    {availableSubcategories.map((subcat) => (
                      <option key={subcat.value} value={subcat.value}>
                        {subcat.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6} lg={3}>
                <Form.Group>
                  <Form.Label className="mb-1 small">{t('filters.sortBy.label')}</Form.Label>
                  <Form.Select
                    value={sortBy}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                    className="form-select"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6} lg={3} className="d-flex align-items-end">
                <div className="clear-button w-100">
                  <Button
                    variant="outline-secondary"
                    className="mb-0 w-100 h-100"
                    onClick={clearAllFilters}
                    disabled={search === "" && category === "All" && subcategory === "All" && type === "All" && level === "All" && sortBy === ""}
                  >
                    <FaTimes className="me-2" /> {t('filters.clearAll')}
                  </Button>
                </div>
              </Col>
            </Row>
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchQuery || category !== 'All' || subcategory !== 'All' || type !== 'All' || level !== 'All' || sortBy) && (
          <div className="card mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0 text-muted">{t('activeFilters.title')}</h6>
                <small className="text-muted">
                  {t('activeFilters.resultsFound', { count: totalCourses })}
                </small>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {searchQuery && (
                  <span className="badge bg-primary d-flex align-items-center p-2">
                    <FaSearch size={10} className="me-1" />
                    <span className="me-2">"{searchQuery}"</span>
                    <button
                      className="btn-close btn-close-white ms-1"
                      style={{ fontSize: '0.5rem', opacity: 0.7 }}
                      onClick={() => clearFilter('search')}
                      aria-label="Remove search filter"
                    ></button>
                  </span>
                )}
                {category !== 'All' && (
                  <span className="badge bg-success d-flex align-items-center p-2">
                    <FaFilter size={10} className="me-1" />
                    <span className="me-2">{getCategoryLabel(category)}</span>
                    <button
                      className="btn-close btn-close-white ms-1"
                      style={{ fontSize: '0.5rem', opacity: 0.7 }}
                      onClick={() => clearFilter('category')}
                      aria-label="Remove category filter"
                    ></button>
                  </span>
                )}
                {subcategory !== 'All' && (
                  <span className="badge bg-info d-flex align-items-center p-2">
                    <span className="me-2">{getSubcategoryLabel(category, subcategory)}</span>
                    <button
                      className="btn-close btn-close-white ms-1"
                      style={{ fontSize: '0.5rem', opacity: 0.7 }}
                      onClick={() => clearFilter('subcategory')}
                      aria-label="Remove subcategory filter"
                    ></button>
                  </span>
                )}
                {type !== 'All' && (
                  <span className="badge bg-warning text-dark d-flex align-items-center p-2">
                    <Image
                      src={type === 'live' ? liveIcon : recordedIcon}
                      alt={type === 'live' ? t('card.liveCourse') : t('card.recordedCourse')}
                      width={20}
                      height={20}
                      className="me-1"
                    />
                    <span className="me-2">
                      {type === 'live' ? t('filters.courseType.live') : t('filters.courseType.recorded')}
                    </span>
                    <button
                      className="btn-close ms-1"
                      style={{ fontSize: '0.5rem', opacity: 0.7 }}
                      onClick={() => clearFilter('type')}
                      aria-label="Remove type filter"
                    ></button>
                  </span>
                )}
                {level !== 'All' && (
                  <span className="badge bg-secondary d-flex align-items-center p-2">
                    <span className="me-2">{level}</span>
                    <button
                      className="btn-close btn-close-white ms-1"
                      style={{ fontSize: '0.5rem', opacity: 0.7 }}
                      onClick={() => clearFilter('level')}
                      aria-label="Remove level filter"
                    ></button>
                  </span>
                )}
                {sortBy && (
                  <span className="badge bg-dark d-flex align-items-center p-2">
                    <FaSortAmountDown size={10} className="me-1" />
                    <span className="me-2">
                      {sortOptions.find(opt => opt.value === sortBy)?.label || 'Custom'}
                    </span>
                    <button
                      className="btn-close btn-close-white ms-1"
                      style={{ fontSize: '0.5rem', opacity: 0.7 }}
                      onClick={() => clearFilter('sort')}
                      aria-label="Remove sort filter"
                    ></button>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">
            {isLoading ? (
              <div className="d-flex align-items-center">
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                {t('results.loading')}
              </div>
            ) : courses.length > 0 ? (
              t('results.showing', { count: courses.length, total: totalCourses })
            ) : (
              t('results.noCoursesFound')
            )}
          </h4>
          {!isLoading && courses.length > 0 && totalPages > 1 && (
            <div className="text-muted small">
              {t('results.page', { current: page, total: totalPages })}
            </div>
          )}
        </div>

        {/* Course list */}
        <Row className="g-4">
          {isLoading ? (
            Array(6).fill(0).map((_, idx) => (
              <Col lg={6} key={`skeleton-${idx}`}>
                <CourseCardSkeleton />
              </Col>
            ))
          ) : courses.length > 0 ? (
            courses.map((course, idx) => (
              <Col lg={6} key={course.id || idx}>
                <CourseCard
                  course={{
                    id: course.id,
                    title: course.title || "Untitled Course",
                    short_description: course.shortDescription || "No description available",
                    description: course.description || "",
                    category: course.category || "Uncategorized",
                    subcategory: course.subcategory || "",
                    level: course.level || "all_levels",
                    language: course.language || "Unknown",
                    slug: course.slug || '',
                    modules_count: course.modules?.length || 0,
                    totalLectures: course.modules?.reduce((total, module) => total + (module.videos?.length || 0), 0) || 0,
                    iconUrl: course.iconUrl || null,
                    icon: !course.iconUrl ? "FaBook" : null,
                    status: "published",
                    instructor: course.instructor || null,
                    instructor_id: course.instructor?.id || "",
                    duration: course.type === 'live' ? "Live" : "Recorded",
                    rating: {
                      stars: course.stats.rating,
                      reviewCount: course.stats.reviewCount
                    },
                    badge: {
                      text: course.level === 'all_levels' ? 'All Levels' : course.level
                    },
                    color: course.backgroundColorHex || "#630000",
                    format: course.type
                  }}
                />
              </Col>
            ))
          ) : (
            <Col>
              <div className="text-center py-5 card shadow-sm">
                <div className="card-body">
                  <div className="mb-3">
                    <FaSearch size={48} className="text-muted" />
                  </div>
                  <h4>{t('noResults.title')}</h4>
                  <p className="text-muted mb-3">
                    {t('noResults.message')}
                  </p>
                  <Button variant="primary" onClick={clearAllFilters}>
                    {t('noResults.clearFilters')}
                  </Button>
                </div>
              </div>
            </Col>
          )}
        </Row>

        {/* Pagination */}
        {courses.length > 0 && totalPages > 1 && (
          <div className="mt-5">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </Container>

      {/* Enhanced CSS */}
      <style jsx>{`
        .clear-button {
          height: 68% !important;
        }
        .course-type-filter {
          display: flex;
          justify-content: center;
          align-items: center;
          border: 2px solid #dee2e6;
          border-radius: 8px;
          width: 100%;
          cursor: pointer;
          transition: all 0.3s ease;
          background-color: #fff;
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        .course-type-filter:hover {
          border-color: rgb(100.8, 136, 100.8);
          background-color: rgba(100.8, 136, 100.8, 0.1);
          transform: translateY(-1px);
        }
        
        .course-type-filter.active {
          border-color: rgb(100.8, 136, 100.8);
          background-color: rgb(100.8, 136, 100.8);
          color: white;
          transform: translateY(-1px);
        }
        
        .course-type-filter.active img {
          filter: brightness(0) invert(1);
        }
        
        .type-all {
          background-color: #f8f9fa;
          font-weight: 600;
        }
        
        .badge {
          font-weight: 500;
          font-size: 0.8rem;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }
        
        .badge:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        
        .badge .btn-close {
          transition: all 0.2s ease;
          transform: scale(0.8);
        }
        
        .badge:hover .btn-close {
          opacity: 1 !important;
          transform: scale(1);
        }
        
        .input-group-text {
          border-left: 0;
          background-color: white;
        }
        
        .form-control:focus + .input-group-append .input-group-text {
          border-color: rgba(100.8, 136, 100.8, 0.5);
        }
        
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        
        .spinner-border-sm {
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        @media (max-width: 768px) {
          .course-type-filter {
            min-height: 50px;
            font-size: 0.75rem;
          }
          
          .badge {
            font-size: 0.7rem;
            padding: 0.5rem !important;
          }
        }
        
        .form-select:focus {
          border-color: rgba(100.8, 136, 100.8, 0.7);
          box-shadow: 0 0 0 0.25rem rgba(100.8, 136, 100.8, 0.25);
        }
        
        .form-select:disabled {
          background-color: #f8f9fa;
          opacity: 0.6;
        }
      `}</style>
    </section>
  );
};

export default CourseList;