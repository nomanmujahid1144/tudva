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
import liveIcon from '../../../../../assets/images/live-course.png';
import recordedIcon from '../../../../../assets/images/recorded-course.png';
import { useTranslations } from 'next-intl';

const Step1 = ({ stepperInstance, mode = 'create' }) => {
  const { courseData, setCourseData, saveBasicDetails, isLoading } = useCourseContext();
  const [subcategories, setSubcategories] = useState([]);
  const [isEditLoading, setIsEditLoading] = useState(false);
  
  // Translation hooks
  const t = useTranslations('instructor.course.step1');
  const tCategories = useTranslations('');
  const tSubcategories = useTranslations('');

  // Dynamic localStorage key based on mode
  const STEP1_STORAGE_KEY = `${mode}_course_step1_data`;

  // Levels array with translations
  const levels = [
    { value: 'beginner', label: t('level.beginner') },
    { value: 'intermediate', label: t('level.intermediate') },
    { value: 'advanced', label: t('level.advanced') },
    { value: 'all_levels', label: t('level.allLevels') }
  ];

  // Course types array with translations
  const courseTypes = [
    { value: 'recorded', label: t('type.recorded'), icon: recordedIcon },
    { value: 'live', label: t('type.live'), icon: liveIcon }
  ];

  // Check if we're creating a new course and clear localStorage if needed
  useEffect(() => {
    if (mode === 'create' && !courseData._id && (courseData.title || courseData.description)) {
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
      language: 'english'
    }
  });

  // Load data based on mode and priority
  useEffect(() => {
    if (mode === 'edit') {
      if (courseData._id) {
        setIsEditLoading(false);
        
        setValue('title', courseData.title || '');
        setValue('shortDescription', courseData.shortDescription || '');
        setValue('description', courseData.description || '');
        setValue('category', courseData.category || '');
        setValue('level', courseData.level || 'beginner');
        setValue('type', courseData.type || 'recorded');
        setValue('promoVideoUrl', courseData.promoVideoUrl || '');

        if (courseData.category) {
          const category = homePageItems.find(item => item.menuItem === courseData.category);
          if (category) {
            setSubcategories(category.submenuItems || []);
            setTimeout(() => {
              setValue('subcategory', courseData.subcategory || '');
            }, 0);
          }
        } else {
          setValue('subcategory', courseData.subcategory || '');
        }
      } else {
        setIsEditLoading(true);
      }
      return;
    }

    const savedData = localStorage.getItem(STEP1_STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        
        Object.keys(parsedData).forEach(key => {
          setValue(key, parsedData[key]);
        });

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

  const selectedCategory = watch('category');
  const selectedType = watch('type');

  useEffect(() => {
    if (selectedCategory) {
      const category = homePageItems.find(item => tCategories(item.menuItem) === selectedCategory);
      if (category) {
        setSubcategories(category.submenuItems || []);
      } else {
        setSubcategories([]);
      }
    } else {
      setSubcategories([]);
    }
  }, [selectedCategory]);

  const saveFormToLocalStorage = (data) => {
    localStorage.setItem(STEP1_STORAGE_KEY, JSON.stringify(data));
  };

  const onSubmit = async (data) => {
    try {
      const formData = {
        ...data,
        language: data.language || 'english'
      };

      saveFormToLocalStorage(formData);

      const result = await saveBasicDetails(formData);
      if (result) {
        if (stepperInstance) {
          stepperInstance.next();
        }
      }
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const goToNextStep = () => {
    handleSubmit(onSubmit)();
  };

  const handleCourseTypeSelect = (type) => {
    setValue('type', type);
  };

  return (
    <div id="step-1" role="tabpanel" className="content fade" aria-labelledby="steppertrigger1">
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
              <h5>{t('loadingMessage')}</h5>
              <p>{t('loadingSubtext')}</p>
            </div>
          </div>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center">
        <h4>
          {mode === 'edit' ? t('editTitle') : t('title')}
        </h4>
        {mode === 'edit' && courseData._id && (
          <div className="text-muted small">
            {t('editingLabel')} {courseData.title}
          </div>
        )}
      </div>
      <hr />
      <Form>
        <Row className="g-4">
          {/* Course Title */}
          <Col xs={12}>
            <Form.Group>
              <Form.Label>{t('courseTitle.label')} <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                placeholder={t('courseTitle.placeholder')}
                {...register('title')}
                isInvalid={!!errors.title}
                maxLength={35}
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
                {watch('title')?.length || 0}/35 {t('courseTitle.counter')}
              </Form.Text>
            </Form.Group>
          </Col>

          {/* Short Description */}
          <Col xs={12}>
            <Form.Group>
              <Form.Label>{t('shortDescription.label')} <span className="text-danger">*</span></Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder={t('shortDescription.placeholder')}
                {...register('shortDescription')}
                isInvalid={!!errors.shortDescription}
              />
              <Form.Control.Feedback type="invalid">
                {errors.shortDescription?.message}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                {watch('shortDescription')?.length || 0}/150 {t('shortDescription.counter')}
              </Form.Text>
            </Form.Group>
          </Col>

          {/* Category */}
          <Col md={6}>
            <Form.Group>
              <Form.Label>{t('category.label')} <span className="text-danger">*</span></Form.Label>
              <Form.Select
                {...register('category')}
                isInvalid={!!errors.category}
                onChange={(e) => {
                  setValue('category', e.target.value);
                  setValue('subcategory', '');
                }}
              >
                <option value="">{t('category.placeholder')}</option>
                {homePageItems.map(cat => (
                  <option key={cat.menuItem} value={tCategories(cat.menuItem)}>
                    {tCategories(cat.menuItem)}
                  </option>
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
              <Form.Label>{t('subcategory.label')} <span className="text-danger">*</span></Form.Label>
              <Form.Select
                {...register('subcategory')}
                isInvalid={!!errors.subcategory}
                disabled={!selectedCategory || subcategories.length === 0}
              >
                <option value="">{t('subcategory.placeholder')}</option>
                {subcategories.map(subcat => (
                  <option key={subcat.menuItem} value={tSubcategories(subcat.menuItem)}>
                    {tSubcategories(subcat.menuItem)}
                  </option>
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
              <Form.Label>{t('level.label')} <span className="text-danger">*</span></Form.Label>
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
              <Form.Label>{t('type.label')} <span className="text-danger">*</span></Form.Label>
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
              <Form.Label>{t('promoVideo.label')}</Form.Label>
              <Form.Control
                type="text"
                placeholder={t('promoVideo.placeholder')}
                {...register('promoVideoUrl')}
                isInvalid={!!errors.promoVideoUrl}
              />
              <Form.Control.Feedback type="invalid">
                {errors.promoVideoUrl?.message}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                {t('promoVideo.helperText')}
              </Form.Text>
            </Form.Group>
          </Col>

          <input type="hidden" {...register('language')} value="english" />

          {/* Description */}
          <Col xs={12}>
            <Form.Group>
              <Form.Label>{t('description.label')} <span className="text-danger">*</span></Form.Label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <ReactQuill
                    theme="snow"
                    value={field.value || ''}
                    onChange={field.onChange}
                    style={{ height: 300, marginBottom: 50 }}
                    placeholder={t('description.placeholder')}
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
                  (mode === 'edit' ? t('buttons.updating') : t('buttons.saving')) : 
                  t('buttons.next')
                }
              </Button>
            </div>
          </Col>
        </Row>
      </Form>

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