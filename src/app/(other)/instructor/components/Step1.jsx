'use client';
import React, { useEffect, useState } from 'react';
import { Col, Row, Button, Form, Spinner } from 'react-bootstrap';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useCourseContext } from '@/context/CourseContext';
import { homePageItems } from '@/data/menuItems';
import { basicDetailsSchema } from '@/validations/courseSchema';
import Image from 'next/image';
import liveIcon from '../../../../assets/images/live-course.png';
import recordedIcon from '../../../../assets/images/recorded-course.png';

const levels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'all_levels', label: 'All Levels' }
];

const courseTypes = [
  { value: 'recorded', label: 'Recorded Course', icon: recordedIcon },
  { value: 'live', label: 'Live Course', icon: liveIcon }
];

const Step1 = ({ stepperInstance, mode = 'create' }) => {
  const { courseData, setCourseData, saveBasicDetails, isLoading } = useCourseContext();
  const [subcategories, setSubcategories] = useState([]);
  const [isEditLoading, setIsEditLoading] = useState(false);

  // Dynamic localStorage key based on mode
  const STEP1_STORAGE_KEY = `${mode}_course_step1_data`;

  // Check if we're creating a new course and clear localStorage if needed
  useEffect(() => {
    // Only reset context for create mode when there's no ID but has data
    if (mode === 'create' && !courseData._id && (courseData.title || courseData.description)) {
      // Reset the context to default values for create mode
      setCourseData({
        title: '',
        description: '',
        shortDescription: '',
        category: '',
        subcategory: '',
        level: 'beginner',
        language: 'english',
        type: 'recorded',
        promoVideoUrl: '',
        backgroundColorHex: '#ffffff',
        iconUrl: '',
        thumbnailUrl: '',
        modules: [],
        faqs: [],
        tags: [],
        liveCourseMeta: {
          startDate: '',
          plannedLessons: 0,
          maxEnrollment: 30,
          timeSlots: [],
          courseMaterials: []
        },
        publish: false
      });
    }
  }, [courseData, setCourseData, mode]);

  const { register, handleSubmit, control, watch, formState: { errors }, setValue } = useForm({
    resolver: yupResolver(basicDetailsSchema),
    defaultValues: {
      title: courseData.title || '',
      shortDescription: courseData.shortDescription || '',
      description: courseData.description || '',
      category: courseData.category || '',
      subcategory: courseData.subcategory || '',
      level: courseData.level || 'beginner',
      type: courseData.type || 'recorded',
      promoVideoUrl: courseData.promoVideoUrl || '',
      language: 'english' // Default to English
    }
  });

  // Load data based on mode and priority
  useEffect(() => {
    // Priority 1: If in edit mode and courseData exists, populate form with course data
    if (mode === 'edit') {
      if (courseData._id) {
        console.log('Edit mode: Loading course data into form');
        setIsEditLoading(false); // Data is loaded, hide loading
        
        setValue('title', courseData.title || '');
        setValue('shortDescription', courseData.shortDescription || '');
        setValue('description', courseData.description || '');
        setValue('category', courseData.category || '');
        setValue('level', courseData.level || 'beginner');
        setValue('type', courseData.type || 'recorded');
        setValue('promoVideoUrl', courseData.promoVideoUrl || '');

        // Update subcategories if category exists
        if (courseData.category) {
          const category = homePageItems.find(item => item.menuItem === courseData.category);
          if (category) {
            setSubcategories(category.submenuItems || []);
            // Set subcategory after subcategories are updated
            setTimeout(() => {
              setValue('subcategory', courseData.subcategory || '');
            }, 0);
          }
        } else {
          setValue('subcategory', courseData.subcategory || '');
        }
      } else {
        // In edit mode but no course data yet, show loading
        setIsEditLoading(true);
      }
      return;
    }

    // Priority 2: Load from localStorage (for draft data)
    const savedData = localStorage.getItem(STEP1_STORAGE_KEY);
    if (savedData) {
      try {
        console.log(`${mode} mode: Loading from localStorage`);
        const parsedData = JSON.parse(savedData);
        
        // Set each field value
        Object.keys(parsedData).forEach(key => {
          setValue(key, parsedData[key]);
        });

        // If there's a category, we need to update subcategories
        if (parsedData.category) {
          const category = homePageItems.find(item => item.menuItem === parsedData.category);
          if (category) {
            setSubcategories(category.submenuItems || []);
          }
        }
      } catch (error) {
        console.error('Error parsing saved form data:', error);
      }
    }
  }, [setValue, courseData, mode, STEP1_STORAGE_KEY]);

  // Watch category to update subcategories
  const selectedCategory = watch('category');
  const selectedType = watch('type');

  // Update subcategories when category changes
  useEffect(() => {
    if (selectedCategory) {
      const category = homePageItems.find(item => item.menuItem === selectedCategory);
      if (category) {
        setSubcategories(category.submenuItems || []);
      } else {
        setSubcategories([]);
      }
    } else {
      setSubcategories([]);
    }
  }, [selectedCategory]);

  // Save form data to localStorage only when submitting, not on every change
  const saveFormToLocalStorage = (data) => {
    localStorage.setItem(STEP1_STORAGE_KEY, JSON.stringify(data));
  };

  const onSubmit = async (data) => {
    try {
      // Add default language if not present
      const formData = {
        ...data,
        language: data.language || 'english'
      };

      // Save to localStorage before submitting to API
      saveFormToLocalStorage(formData);

      const result = await saveBasicDetails(formData);
      if (result) {
        // Ensure we're navigating to step 2 specifically
        if (stepperInstance) {
          stepperInstance.next(); // Force navigation to step 2
        }
      }
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const goToNextStep = () => {
    handleSubmit(onSubmit)();
  };

  // Handle course type selection
  const handleCourseTypeSelect = (type) => {
    setValue('type', type);
  };

  return (
    <div id="step-1" role="tabpanel" className="content fade" aria-labelledby="steppertrigger1">
      {/* Loading overlay for edit mode */}
      {isEditLoading && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            minHeight: '400px'
          }}
        >
          <div className="text-center">
            <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
            <div className="mt-3 text-muted">
              <h5>Loading course details...</h5>
              <p>Please wait while we fetch your course information.</p>
            </div>
          </div>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center">
        <h4>
          {mode === 'edit' ? 'Edit Course Details' : 'Course Details'}
        </h4>
        {mode === 'edit' && courseData._id && (
          <div className="text-muted small">
            Editing: {courseData.title}
          </div>
        )}
      </div>
      <hr />
      <Form>
        <Row className="g-4">
          {/* Course Title */}
          <Col xs={12}>
            <Form.Group>
              <Form.Label>Course title <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter course title"
                {...register('title')}
                isInvalid={!!errors.title}
                maxLength={35} // Add maxLength attribute
                onChange={(e) => {
                  if (e.target.value.length <= 35) {
                    setValue('title', e.target.value);
                  }
                }}
              />
              <Form.Control.Feedback type="invalid">
                {errors.title?.message}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                {watch('title')?.length || 0}/35 characters
              </Form.Text>
            </Form.Group>
          </Col>

          {/* Short Description */}
          <Col xs={12}>
            <Form.Group>
              <Form.Label>Short description <span className="text-danger">*</span></Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Brief overview of your course (150 characters max)"
                {...register('shortDescription')}
                isInvalid={!!errors.shortDescription}
              />
              <Form.Control.Feedback type="invalid">
                {errors.shortDescription?.message}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                {watch('shortDescription')?.length || 0}/150 characters
              </Form.Text>
            </Form.Group>
          </Col>

          {/* Category */}
          <Col md={6}>
            <Form.Group>
              <Form.Label>Course category <span className="text-danger">*</span></Form.Label>
              <Form.Select
                {...register('category')}
                isInvalid={!!errors.category}
                onChange={(e) => {
                  setValue('category', e.target.value);
                  setValue('subcategory', ''); // Reset subcategory when category changes
                }}
              >
                <option value="">Select category</option>
                {homePageItems.map(cat => (
                  <option key={cat.menuItem} value={cat.menuItem}>{cat.menuItem}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.category?.message}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          {/* Subcategory */}
          <Col md={6}>
            <Form.Group>
              <Form.Label>Course subcategory <span className="text-danger">*</span></Form.Label>
              <Form.Select
                {...register('subcategory')}
                isInvalid={!!errors.subcategory}
                disabled={!selectedCategory || subcategories.length === 0}
              >
                <option value="">Select subcategory</option>
                {subcategories.map(subcat => (
                  <option key={subcat.menuItem} value={subcat.menuItem}>{subcat.menuItem}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.subcategory?.message}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          {/* Level */}
          <Col md={6}>
            <Form.Group>
              <Form.Label>Course level <span className="text-danger">*</span></Form.Label>
              <Form.Select
                {...register('level')}
                isInvalid={!!errors.level}
              >
                {levels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.level?.message}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          {/* Course Type */}
          <Col md={6}>
            <Form.Group>
              <Form.Label>Course type <span className="text-danger">*</span></Form.Label>
              <div className="d-flex gap-3">
                {courseTypes.map(type => (
                  <div
                    key={type.value}
                    className={`course-type-icon ${selectedType === type.value ? 'active bg-primary border-primary' : ''}`}
                    onClick={() => handleCourseTypeSelect(type.value)}
                    title={type.label}
                  >
                    <Image
                      src={type.icon}
                      alt={type.label}
                      width={48}
                      height={48}
                    />
                    <input
                      type="radio"
                      id={`type-${type.value}`}
                      value={type.value}
                      {...register('type')}
                      checked={selectedType === type.value}
                      className="visually-hidden"
                    />
                  </div>
                ))}
              </div>
              {errors.type && (
                <div className="text-danger small mt-1">{errors.type.message}</div>
              )}
            </Form.Group>
          </Col>

          {/* Promo Video URL */}
          <Col xs={12}>
            <Form.Group>
              <Form.Label>Promotional video URL</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter URL of your promotional video (YouTube, Vimeo, etc.)"
                {...register('promoVideoUrl')}
                isInvalid={!!errors.promoVideoUrl}
              />
              <Form.Control.Feedback type="invalid">
                {errors.promoVideoUrl?.message}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                A short video introducing your course can significantly increase enrollments
              </Form.Text>
            </Form.Group>
          </Col>

          {/* Hidden language field with default value */}
          <input type="hidden" {...register('language')} value="english" />

          {/* Description */}
          <Col xs={12}>
            <Form.Group>
              <Form.Label>Course description <span className="text-danger">*</span></Form.Label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <ReactQuill
                    theme="snow"
                    value={field.value || ''}
                    onChange={field.onChange}
                    style={{ height: 300, marginBottom: 50 }}
                    placeholder="Write a detailed description of your course..."
                    modules={{
                      toolbar: [
                        ['bold', 'italic', 'underline']
                      ],
                    }}
                  />
                )}
              />
              {errors.description && (
                <div className="text-danger small mt-2">{errors.description.message}</div>
              )}
            </Form.Group>
          </Col>

          {/* Navigation */}
          <Col xs={12}>
            <div className="d-flex justify-content-end mt-3">
              <Button
                variant="primary"
                onClick={goToNextStep}
                disabled={isLoading}
                className="mb-0"
              >
                {isLoading ? 
                  (mode === 'edit' ? 'Updating...' : 'Saving...') : 
                  'Next'
                }
              </Button>
            </div>
          </Col>
        </Row>
      </Form>

      {/* CSS styles for larger placeholders and course type cards */}
      <style jsx global>{`
        .course-type-icon {
          border: 1px solid #dee2e6;
          border-radius: 8px;
          cursor: pointer;
          text-align: center;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 53px;
        }
        
        .course-type-icon:hover {
          border-color: #6c757d;
        }
        
        .course-type-icon.active {
          border-color: #0d6efd;
          background-color: var(--bs-primary);
        }
        
        .course-type-icon.active img {
          filter: brightness(0) invert(1);
        }
      `}</style>
    </div>
  );
};

export default Step1;