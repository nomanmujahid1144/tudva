'use client';

import { Button, Card, CardBody, CardTitle, Col, Container, Row, Spinner, Alert } from "react-bootstrap";
import Image from "next/image";
import CoursePreview from './course-preview/CoursePreview';
import course1 from '@/assets/images/courses/4by3/01.jpg';
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useNextLesson } from '@/hooks/useNextLesson';
import { useWeekPreview } from '@/hooks/useWeekPreview';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const CoursesOverview = () => {
  const t = useTranslations('home.coursesOverview');
  const params = useParams();
  const locale = params?.locale || 'en';
  
  const [openItemId, setOpenItemId] = useState('headingOne');
  
  // Fetch data using hooks
  const { nextLesson, isLoading: nextLessonLoading, error: nextLessonError } = useNextLesson();
  const { weekPreview, isLoading: weekPreviewLoading, error: weekPreviewError } = useWeekPreview();

  const toggleAccordion = (id) => {
    setOpenItemId(openItemId === id ? null : id);
  };

  // Find the next slot with a course
  const getNextScheduledSlot = () => {
    if (!nextLesson?.slots) return null;
    return nextLesson.slots.find(slot => slot.isReserved);
  };

  const nextSlot = getNextScheduledSlot();

  return (
    <section className="pt-0 pt-lg-5">
      <Container>
        <Row className="mb-4">
          <Col xs={12}>
            <h2 className="mb-0">{t('title')}</h2>
          </Col>
        </Row>
        <Row className="g-4 d-flex justify-content-center">
          <Col xl={11}>
            <div className="accordion" id="accordionExample">
              
              {/* NEXT LESSONS ACCORDION */}
              <div className="accordion-item">
                <h2 className="accordion-header" id="headingOne">
                  <button
                    className={`accordion-button ${openItemId === 'headingOne' ? '' : 'collapsed'}`}
                    type="button"
                    onClick={() => toggleAccordion('headingOne')}
                    aria-expanded={openItemId === 'headingOne'}
                    aria-controls="collapseOne"
                  >
                    {t('nextLessons.title')}
                  </button>
                </h2>
                <div
                  id="collapseOne"
                  className={`accordion-collapse collapse ${openItemId === 'headingOne' ? 'show' : ''}`}
                  aria-labelledby="headingOne"
                  data-bs-parent="#accordionExample"
                >
                  <div className="accordion-body">
                    <hr className="h-2 w-100" />
                    
                    {nextLessonLoading ? (
                      <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-3 text-muted">{t('nextLessons.loading')}</p>
                      </div>
                    ) : nextLessonError ? (
                      <Alert variant="danger">
                        {nextLessonError}
                      </Alert>
                    ) : !nextSlot ? (
                      <div className="text-center py-5">
                        <p className="text-muted">{t('nextLessons.noScheduled')}</p>
                        <Link href={`/${locale}/scheduler`}>
                          <Button variant="primary">{t('nextLessons.scheduleNow')}</Button>
                        </Link>
                      </div>
                    ) : (
                      <>
                        <h5>
                          {t('nextLessons.learningDay')} {nextLesson.nextWednesday.formattedDate}
                        </h5>
                        <div className="d-flex justify-content-between fw-light fw-md-semibold flex-wrap">
                          <p className="ms-md-3 mb-2 mb-md-0">
                            <span>{nextSlot.name}</span> |{" "}
                            <span className="d-xs-block">{nextSlot.time}</span>
                          </p>
                          <span className="text-danger text-nowrap">
                            {t('nextLessons.startsIn')} {formatDistanceToNow(new Date(nextLesson.nextWednesday.date), { addSuffix: false })}
                          </span>
                        </div>
                        <div className="w-100 d-flex justify-content-center">
                          <div className="w-100 w-md-75">
                            <CoursePreview
                              title={nextSlot.course.title}
                              module={nextSlot.course.moduleTitle || `${nextSlot.course.type === 'live' ? 'Live Session' : 'Module'}`}
                              imageUrl={nextSlot.course.courseInfo.iconUrl || course1}
                              backgroundColor={nextSlot.course.courseInfo.backgroundColorHex}
                              lessonNumber={nextSlot.course.lessonNumber}
                              totalLessons={nextSlot.course.totalLessons}
                              joinUrl={nextSlot.course.joinUrl}
                            />
                          </div>
                        </div>
                        <Link href={`/${locale}/scheduler`}>
                          <p className="text-decoration-underline text-end">
                            {t('nextLessons.manageLink')}
                          </p>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* WEEK PLAN ACCORDION */}
              <div className="accordion-item">
                <h2 className="accordion-header" id="headingTwo">
                  <button
                    className={`accordion-button ${openItemId === 'headingTwo' ? '' : 'collapsed'}`}
                    type="button"
                    onClick={() => toggleAccordion('headingTwo')}
                    aria-expanded={openItemId === 'headingTwo'}
                    aria-controls="collapseTwo"
                  >
                    {t('weekPlan.title')}
                  </button>
                </h2>
                <div
                  id="collapseTwo"
                  className={`accordion-collapse collapse ${openItemId === 'headingTwo' ? 'show' : ''}`}
                  aria-labelledby="headingTwo"
                  data-bs-parent="#accordionExample"
                >
                  <div className="accordion-body">
                    <hr className="h-2 w-100" />
                    
                    {weekPreviewLoading ? (
                      <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-3 text-muted">{t('weekPlan.loading')}</p>
                      </div>
                    ) : weekPreviewError ? (
                      <Alert variant="danger">
                        {weekPreviewError}
                      </Alert>
                    ) : !weekPreview?.courses || weekPreview.courses.length === 0 ? (
                      <div className="text-center py-5">
                        <p className="text-muted">{t('weekPlan.noCourses')}</p>
                        <Link href={`/${locale}/scheduler`}>
                          <Button variant="primary">{t('weekPlan.scheduleNow')}</Button>
                        </Link>
                      </div>
                    ) : (
                      <>
                        <h5 className="text-center">
                          {t('weekPlan.learningDay', { 
                            date: weekPreview.weekDate.formattedDate, 
                            week: weekPreview.weekDate.weekNumber 
                          })}
                        </h5>
                        <div className="w-100 d-flex justify-content-center">
                          <Row className='w-100 w-md-75'>
                            {weekPreview.courses.map((course, index) => (
                              <Col xs={12} sm={6} md={12} key={course._id} className="mb-3">
                                <CoursePreview
                                  title={course.title}
                                  module={course.moduleTitle || `${course.type === 'live' ? 'Live Session' : 'Lesson'}`}
                                  imageUrl={course.courseInfo.iconUrl || course1}
                                  backgroundColor={course.courseInfo.backgroundColorHex}
                                  number={index + 1}
                                  lessonNumber={course.lessonNumber}
                                  totalLessons={course.totalLessons}
                                />
                              </Col>
                            ))}
                          </Row>
                        </div>
                        <Link href={`/${locale}/scheduler`}>
                          <p className="text-decoration-underline text-end">
                            {t('weekPlan.manageLink')}
                          </p>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* MORE ABOUT ACCORDION */}
              <div className="accordion-item">
                <h2 className="accordion-header" id="headingThree">
                  <button
                    className={`accordion-button ${openItemId === 'headingThree' ? '' : 'collapsed'}`}
                    type="button"
                    onClick={() => toggleAccordion('headingThree')}
                    aria-expanded={openItemId === 'headingThree'}
                    aria-controls="collapseThree"
                  >
                    {t('moreAbout.title')}
                  </button>
                </h2>
                <div
                  id="collapseThree"
                  className={`accordion-collapse collapse ${openItemId === 'headingThree' ? 'show' : ''}`}
                  aria-labelledby="headingThree"
                  data-bs-parent="#accordionExample"
                >
                  <div className="accordion-body">
                    {/* Content will be added later */}
                    <p className="text-muted text-center py-4">{t('moreAbout.comingSoon')}</p>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default CoursesOverview;