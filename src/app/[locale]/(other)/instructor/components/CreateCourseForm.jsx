'use client'
import React, { useEffect, useRef, useState } from 'react'
import { Card, CardBody, CardHeader, Col, Container, Row } from 'react-bootstrap'
import { useParams, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import 'bs-stepper/dist/css/bs-stepper.min.css'
import Step1 from './Step1'
import Step2 from './Step2'
import Step3 from './Step3'
import Step4 from './Step4'
import useBSStepper from '@/hooks/useBSStepper'
import { CourseProvider } from '@/context/CourseContext'

const CreateCourseForm = () => {
  const stepperRef = useRef(null);
  const stepperInstance = useBSStepper(stepperRef);
  const params = useParams();
  const pathname = usePathname();
  const t = useTranslations('instructor.course.form');

  // Determine mode and courseId from URL
  const isEditMode = pathname.includes('/edit-course');
  const courseId = isEditMode ? params.courseId : null;
  const mode = isEditMode ? 'edit' : 'create';

  // Dynamic localStorage key based on mode
  const ACTIVE_STEP_KEY = `${mode}_course_active_step`;

  // Initialize step from localStorage or default to 1 (first step)
  const [activeStep, setActiveStep] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedStep = localStorage.getItem(ACTIVE_STEP_KEY);
      return savedStep ? parseInt(savedStep, 10) : 1;
    }
    return 1; // Default to step 1 instead of 0 to match BS-Stepper's 1-based indexing
  });

  // Initialize stepper and restore saved step
  useEffect(() => {
    if (stepperInstance && activeStep) {
      // For BS-Stepper, steps are 1-indexed, not 0-indexed
      stepperInstance.to(activeStep);
    }
  }, [stepperInstance, activeStep]);

  // Update localStorage when step changes via stepper events
  useEffect(() => {
    const handleStepChange = (event) => {
      const newStep = event.detail.indexStep + 1; // Convert from 0-based to 1-based
      setActiveStep(newStep);
      localStorage.setItem(ACTIVE_STEP_KEY, newStep.toString());
    };

    // We need to listen for stepper events to update our state
    if (stepperRef.current) {
      stepperRef.current.addEventListener('show.bs-stepper', handleStepChange);
      return () => {
        if (stepperRef.current) {
          stepperRef.current.removeEventListener('show.bs-stepper', handleStepChange);
        }
      };
    }
  }, [stepperRef, ACTIVE_STEP_KEY]);

  // Wrapper function to navigate to a specific step
  const goToStep = (step) => {
    if (stepperInstance) {
      stepperInstance.to(step);
      setActiveStep(step);
      localStorage.setItem(ACTIVE_STEP_KEY, step.toString());
    }
  };

  // Dynamic localStorage keys for steps based on mode
  const getStepStorageKey = (stepNumber) => `${mode}_course_step${stepNumber}_data`;

  return (
    <CourseProvider mode={mode} courseId={courseId}>
      <section>
        <Container>
          <Row>
            <Col md={8} className="mx-auto text-center">
              <p>
                {t(`${mode}.subtitle`)}
              </p>
            </Col>
          </Row>
          
          {/* Show recovery notification if there's saved data - with dynamic keys */}
          {typeof window !== 'undefined' && (
            localStorage.getItem(getStepStorageKey(1)) || 
            localStorage.getItem(getStepStorageKey(2))
          ) && (
            <Row className="mb-3">
              <Col>
                <div className="alert alert-info">
                  <p className="mb-0">
                    {t(`${mode}.recoveryAlert`)}
                  </p>
                </div>
              </Col>
            </Row>
          )}

          <Card className="bg-transparent border rounded-3 mb-5">
            <div id="stepper" ref={stepperRef} className="bs-stepper stepper-outline">
              <CardHeader className="bg-light border-bottom px-lg-5">
                <div className="bs-stepper-header" role="tablist">
                  <div className="step" data-target="#step-1">
                    <div className="d-grid text-center align-items-center">
                      <button
                        type="button"
                        className="btn btn-link step-trigger mb-0"
                        role="tab"
                        id="steppertrigger1"
                        aria-controls="step-1"
                        onClick={() => goToStep(1)}
                      >
                        <span className="bs-stepper-circle">1</span>
                      </button>
                      <h6 className="bs-stepper-label d-none d-md-block">
                        {t('stepper.step1')}
                      </h6>
                    </div>
                  </div>
                  <div className="line" />
                  <div className="step" data-target="#step-2">
                    <div className="d-grid text-center align-items-center">
                      <button
                        type="button"
                        className="btn btn-link step-trigger mb-0"
                        role="tab"
                        id="steppertrigger2"
                        aria-controls="step-2"
                        onClick={() => localStorage.getItem(getStepStorageKey(1)) && goToStep(2)}
                        disabled={!localStorage.getItem(getStepStorageKey(1))}
                      >
                        <span className="bs-stepper-circle">2</span>
                      </button>
                      <h6 className="bs-stepper-label d-none d-md-block">
                        {t('stepper.step2')}
                      </h6>
                    </div>
                  </div>
                  <div className="line" />
                  <div className="step" data-target="#step-3">
                    <div className="d-grid text-center align-items-center">
                      <button
                        type="button"
                        className="btn btn-link step-trigger mb-0"
                        role="tab"
                        id="steppertrigger3"
                        aria-controls="step-3"
                        onClick={() => localStorage.getItem(getStepStorageKey(2)) && goToStep(3)}
                        disabled={!localStorage.getItem(getStepStorageKey(2))}
                      >
                        <span className="bs-stepper-circle">3</span>
                      </button>
                      <h6 className="bs-stepper-label d-none d-md-block">
                        {t('stepper.step3')}
                      </h6>
                    </div>
                  </div>
                  <div className="line" />
                  <div className="step" data-target="#step-4">
                    <div className="d-grid text-center align-items-center">
                      <button
                        type="button"
                        className="btn btn-link step-trigger mb-0"
                        role="tab"
                        id="steppertrigger4"
                        aria-controls="step-4"
                        onClick={() => localStorage.getItem(getStepStorageKey(3)) && goToStep(4)}
                        disabled={!localStorage.getItem(getStepStorageKey(3))}
                      >
                        <span className="bs-stepper-circle">4</span>
                      </button>
                      <h6 className="bs-stepper-label d-none d-md-block">
                        {t('stepper.step4')}
                      </h6>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <div className="bs-stepper-content">
                  <Step1 
                    stepperInstance={{ ...stepperInstance, next: () => goToStep(2) }} 
                    mode={mode}
                  />
                  <Step2 
                    stepperInstance={{ ...stepperInstance, next: () => goToStep(3), previous: () => goToStep(1) }} 
                    mode={mode}
                  />
                  <Step3 
                    stepperInstance={{ ...stepperInstance, next: () => goToStep(4), previous: () => goToStep(2) }} 
                    mode={mode}
                  />
                  <Step4 
                    stepperInstance={{ ...stepperInstance, previous: () => goToStep(3) }} 
                    mode={mode}
                  />
                </div>
              </CardBody>
            </div>
          </Card>
        </Container>
      </section>
    </CourseProvider>
  )
}

export default CreateCourseForm