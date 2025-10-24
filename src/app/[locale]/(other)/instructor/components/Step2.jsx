'use client';
import React, { useState, useEffect } from 'react';
import { Button, Col, Row, Form, Spinner, Alert } from 'react-bootstrap';
import { HexColorPicker } from "react-colorful";
import { FaSearch } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { courseMediaSchema } from '@/validations/courseSchema';
import { useCourseContext } from '@/context/CourseContext';

const Step2 = ({ stepperInstance, mode = 'create' }) => {
  const { 
    courseData, 
    saveCourseMedia, 
    isLoading,
    courseLoading,
    courseLoadError 
  } = useCourseContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [availableIcons, setAvailableIcons] = useState([]);
  const [loadingIcons, setLoadingIcons] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Dynamic localStorage key based on mode
  const STEP2_STORAGE_KEY = `${mode}_course_step2_data`;

  // Form handling
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: yupResolver(courseMediaSchema),
    defaultValues: {
      backgroundColorHex: '#4a90e2',
      iconUrl: ''
    }
  });

  // Watch values for UI updates
  const selectedColor = watch('backgroundColorHex');
  const selectedIcon = watch('iconUrl');

  // FIXED: Load data based on mode and priority
  useEffect(() => {
    const loadData = () => {
      if (mode === 'edit') {
        // In edit mode, prioritize course data from API
        if (courseData && courseData._id && !dataLoaded) {
          console.log('Edit mode: Loading course media data into form', courseData);
          populateFormWithCourseData();
          setDataLoaded(true);
        } else if (!courseData._id && !courseLoading && !dataLoaded) {
          // If no course data and not loading, try localStorage
          loadFromLocalStorage();
          setDataLoaded(true);
        }
      } else {
        // Create mode - always try localStorage first
        if (!dataLoaded) {
          loadFromLocalStorage();
          setDataLoaded(true);
        }
      }
    };

    loadData();
  }, [courseData, mode, courseLoading, dataLoaded]);

  // FIXED: Add forced data loading when courseData changes in edit mode
  useEffect(() => {
    if (mode === 'edit' && courseData._id && courseData.backgroundColorHex !== undefined) {
      console.log('Force loading Step2 data due to courseData change');
      populateFormWithCourseData();
      setDataLoaded(true);
    }
  }, [courseData._id, courseData.backgroundColorHex, courseData.iconUrl, mode]);

  // FIXED: Function to populate form with course data (edit mode)
  const populateFormWithCourseData = () => {
    console.log('Populating Step 2 form with course data:', {
      backgroundColorHex: courseData.backgroundColorHex,
      iconUrl: courseData.iconUrl
    });
    
    // FIXED: Always set the values from courseData in edit mode
    if (courseData.backgroundColorHex) {
      console.log('Setting background color:', courseData.backgroundColorHex);
      setValue('backgroundColorHex', courseData.backgroundColorHex);
    }
    
    if (courseData.iconUrl) {
      console.log('Setting icon URL:', courseData.iconUrl);
      setValue('iconUrl', courseData.iconUrl);
    }
    
    console.log('Populated Step 2 form with course data');
  };

  // Function to load from localStorage
  const loadFromLocalStorage = () => {
    const savedData = localStorage.getItem(STEP2_STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        console.log(`${mode} mode: Loading Step 2 data from localStorage`, parsedData);

        // Set values from localStorage
        if (parsedData.backgroundColorHex) {
          setValue('backgroundColorHex', parsedData.backgroundColorHex);
        }
        if (parsedData.iconUrl) {
          setValue('iconUrl', parsedData.iconUrl);
        }
      } catch (error) {
        console.error('Error parsing saved form data:', error);
      }
    }
  };

  // Save form data to localStorage when submitting
  const saveFormToLocalStorage = (data) => {
    localStorage.setItem(STEP2_STORAGE_KEY, JSON.stringify(data));
  };

  // Load the available icons
  useEffect(() => {
    const fetchIcons = async () => {
      setLoadingIcons(true);
      try {
        // Fetch icons from the manifest file
        const response = await fetch('/assets/icons-manifest.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch icons: ${response.status}`);
        }

        const iconsList = await response.json();
        setAvailableIcons(iconsList);
      } catch (error) {
        console.error('Error fetching icons from manifest:', error);
        // Fall back to hardcoded list if the manifest fetch fails
        const fallbackIcons = [
          'AI.png', 'Analyse.png', 'analyzing.png', 'android.png', 'atom.png',
          'calculator.png', 'calender.png', 'callcenter.png', 'chemie.png', 'clock.png',
          'cloud.png', 'coding1.png', 'coding2.png', 'coding3.png', 'computer1.png',
          'computer2.png', 'css.png', 'dictionary.png', 'docs.png', 'download.png',
          'earth.png', 'excel.png', 'facebook.png', 'google.png', 'HTML.png',
          'illustrator.png', 'instagram.png', 'keyboard.png', 'lightbulb.png', 'math.png',
          'mobile-app.png', 'monitor.png', 'music.png', 'photoshop.png', 'powerpoint.png',
          'presentation.png', 'SEO.png', 'server.png', 'settings.png', 'structure.png',
          'system.png', 'target.png', 'technical-support.png', 'timemanagement.png', 'todolist.png',
          'tools.png', 'training.png', 'video-editing.png', 'wifi.png', 'word.png',
          'wordpress.png', 'workplace.png', 'www.png', 'x-twitter.png', 'xd.png'
        ];

        setAvailableIcons(fallbackIcons);
      } finally {
        setLoadingIcons(false);
      }
    };

    fetchIcons();
  }, []); // Empty dependency array - fetch icons only once

  // FIXED: Set a default icon only if we don't have one yet
  useEffect(() => {
    // Skip if icons are still loading
    if (loadingIcons || !availableIcons.length) return;

    // FIXED: In edit mode, only set default if no icon is set in courseData AND no form value
    if (mode === 'edit' && courseData._id) {
      // Don't set default if course already has an icon or if we're still loading course data
      if (courseData.iconUrl || selectedIcon || !dataLoaded) {
        return;
      }
      
      // Only set default if course doesn't have an icon
      console.log('Edit mode: Course has no icon, setting default');
      setDefaultIcon();
    } else if (mode === 'create') {
      // Create mode - set default only if no icon is selected
      if (!selectedIcon && dataLoaded) {
        console.log('Create mode: Setting default icon');
        setDefaultIcon();
      }
    }
  }, [loadingIcons, availableIcons, selectedIcon, dataLoaded, mode, courseData._id, courseData.iconUrl]);

  const setDefaultIcon = () => {
    // Set a default book icon if possible
    const bookIcon = availableIcons.find(icon =>
      icon.toLowerCase().includes('book') ||
      icon.toLowerCase().includes('dictionary') ||
      icon.toLowerCase().includes('docs')
    );

    if (bookIcon) {
      setValue('iconUrl', `/assets/custom-icons/${bookIcon}`);
    } else if (availableIcons.includes('dictionary.png')) {
      setValue('iconUrl', '/assets/custom-icons/dictionary.png');
    } else if (availableIcons.length > 0) {
      setValue('iconUrl', `/assets/custom-icons/${availableIcons[0]}`);
    }
  };

  // Filter icons based on search term
  const filteredIcons = availableIcons.filter(iconName =>
    iconName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle color picker change
  const handleColorChange = (newColor) => {
    setValue('backgroundColorHex', newColor);
  };

  // Handle icon selection
  const handleIconSelect = (iconName) => {
    setValue('iconUrl', `/assets/custom-icons/${iconName}`);
  };

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      // Save to localStorage before API call
      saveFormToLocalStorage(data);

      const result = await saveCourseMedia(data);
      if (result) {
        stepperInstance?.next();
      }
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const goToNextStep = () => {
    handleSubmit(onSubmit)();
  };

  const goToPreviousStep = () => {
    stepperInstance?.previous();
  };

  // Render icon for preview
  const renderSelectedIcon = () => {
    if (!selectedIcon) return null;

    return (
      <img
        src={selectedIcon}
        alt="Selected Icon"
        style={{ width: '150px', height: '150px', objectFit: 'contain' }}
      />
    );
  };


  // Show loading spinner if course is still loading in edit mode
  if (mode === 'edit' && courseLoading) {
    return (
      <div id="step-2" role="tabpanel" className="content fade" aria-labelledby="steppertrigger2">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <h5>Loading course media...</h5>
            <p className="text-muted">Please wait while we fetch your course information.</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if in edit mode but failed to load course data
  if (mode === 'edit' && !courseLoading && courseLoadError) {
    return (
      <div id="step-2" role="tabpanel" className="content fade" aria-labelledby="steppertrigger2">
        <Alert variant="danger">
          <h5>Error Loading Course Media</h5>
          <p>Unable to load course media data: {courseLoadError}</p>
          <Button variant="outline-danger" onClick={() => window.location.href = '/instructor/manage-course'}>
            Back to Course Management
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div id="step-2" role="tabpanel" className="content fade" aria-labelledby="steppertrigger2">
      <div className="d-flex justify-content-between align-items-center">
        <h4>Course Media</h4>
      </div>
      <hr />
      
      <Form>
        <Row>
          <Col xs={12} className="mb-3">
            <h5>Setup the combination of color and icon for your course</h5>
          </Col>

          <Col md={6} className="mb-4">
            {/* Color Picker */}
            <Form.Group>
              <Form.Label>Background Color <span className="text-danger">*</span></Form.Label>
              <div className='my-3 d-flex gap-3 align-items-start'>
                <HexColorPicker
                  color={selectedColor}
                  onChange={handleColorChange}
                />
                <div className="d-flex align-items-center mt-2">
                  <div
                    className="border"
                    style={{
                      width: '30px',
                      height: '30px',
                      backgroundColor: selectedColor
                    }}
                  />
                  <Form.Control
                    type="text"
                    value={selectedColor}
                    className="ms-2 form-control-sm"
                    style={{width: '35%'}}
                    onChange={(e) => setValue('backgroundColorHex', e.target.value)}
                    isInvalid={!!errors.backgroundColorHex}
                  />
                </div>
                {errors.backgroundColorHex && (
                  <div className="text-danger small mt-1">{errors.backgroundColorHex.message}</div>
                )}
              </div>
            </Form.Group>
          </Col>

          <Col md={6} className="mb-4 d-flex flex-column align-items-end justify-content-end">
            {/* Course Card Preview */}
            <div>
              <Form.Label>How it should Look like?</Form.Label>
              <div className='my-3'>
                <div
                  className="shadow-sm d-flex align-items-center justify-content-center"
                  style={{
                    backgroundColor: selectedColor || '#4a90e2',
                    borderRadius: '.5rem',
                    position: 'relative',
                    overflow: 'hidden',
                    width: '200px',
                    height: '200px'
                  }}
                >
                  {renderSelectedIcon() || (
                    <div className="text-white text-center" style={{ fontSize: '14px' }}>
                      Select an icon
                    </div>
                  )}

                  {/* Decorative elements for the preview */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '0',
                      left: '0',
                      right: '0',
                      height: '40px',
                      background: 'linear-gradient(to top, rgba(0,0,0,0.2), transparent)',
                    }}
                  />
                </div>
              </div>
            </div>
          </Col>

          <Col xs={12}>
            <hr />
            <h5>Select an Icon for Your Course</h5>

            {/* Icon Search */}
            <div className="d-flex align-items-center mb-3">
              <div className="position-relative flex-grow-1" style={{ maxWidth: '300px' }}>
                <Form.Control
                  type="search"
                  placeholder="Search icons..."
                  aria-label="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="position-absolute top-50 end-0 translate-middle-y pe-2">
                  <FaSearch className="text-muted" />
                </div>
              </div>
            </div>

            {/* Error message for icon */}
            {errors.iconUrl && (
              <div className="text-danger mb-2">{errors.iconUrl.message}</div>
            )}

            {/* Loading indicator */}
            {loadingIcons ? (
              <div className="text-center my-3">
                <Spinner animation="border" size="sm" role="status">
                  <span className="visually-hidden">Loading icons...</span>
                </Spinner>
              </div>
            ) : (
              /* Icon Grid */
              <div className="border rounded p-2" style={{ height: '300px', overflowY: 'auto' }}>
                <div className="d-flex flex-wrap">
                  {filteredIcons.map((iconName) => (
                    <div
                      key={iconName}
                      onClick={() => handleIconSelect(iconName)}
                      className={`p-2 m-1 rounded ${selectedIcon === `/assets/custom-icons/${iconName}` ? 'bg-primary bg-opacity-25' : ''}`}
                      style={{ cursor: 'pointer', width: '60px', height: '60px', textAlign: 'center' }}
                      title={iconName.replace('.png', '')}
                    >
                      <img
                        src={`/assets/custom-icons/${iconName}`}
                        alt={iconName.replace('.png', '')}
                        style={{ width: '48px', height: '48px', objectFit: 'contain' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.parentNode.innerHTML = '<i class="fas fa-image fs-3 text-primary"></i>';
                        }}
                      />
                    </div>
                  ))}

                  {filteredIcons.length === 0 && (
                    <div className="text-center w-100 py-4 text-muted">
                      No icons found matching "{searchTerm}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </Col>

          {/* Navigation Buttons */}
          <Col xs={12}>
            <div className="d-flex justify-content-between mt-4">
              <Button
                variant="secondary"
                onClick={goToPreviousStep}
                disabled={isLoading}
                className="mb-0"
              >
                Previous
              </Button>
              <Button
                variant="primary"
                type="submit"
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
    </div>
  );
};

export default Step2;