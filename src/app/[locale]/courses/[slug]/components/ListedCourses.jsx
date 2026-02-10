"use client";

import TinySlider from "@/components/TinySlider";
import Image from "next/image";
import { Badge, Card, CardBody, CardTitle, Container, Row } from "react-bootstrap";
import { renderToString } from "react-dom/server";
import { FaChevronLeft, FaChevronRight, FaStar, FaUserGraduate } from "react-icons/fa";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import liveIcon from '@/assets/images/live-course.png';
import recordedIcon from '@/assets/images/recorded-course.png';

// Default placeholder image
import placeholderImg from '@/assets/images/courses/4by3/01.jpg';
import placeholderAvatar from '@/assets/images/avatar/01.jpg';

const CourseCard = ({ course }) => {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || 'en';
  const t = useTranslations('courses.detail.related');

  if (!course) return null;

  // Format course data from API response
  const {
    id,
    title,
    slug,
    stats = {},
    instructor = {},
    thumbnailUrl,
    iconUrl,
    backgroundColorHex,
    shortDescription,
    category,
    subcategory,
    level,
    type
  } = course;

  // Use dynamic values from API
  const studentCount = stats.enrollmentCount || 0;
  const rating = stats.rating || 0;
  const instructorAvatar = instructor?.profilePicture || placeholderAvatar;
  const instructorName = instructor?.name || 'Unknown Instructor';

  // Use iconUrl with backgroundColorHex if available, otherwise use thumbnailUrl
  const courseImage = iconUrl || thumbnailUrl || placeholderImg;
  const useColoredBackground = !!iconUrl;

  // Handle click to go to course detail page
  const handleCourseClick = () => {
    router.push(`/${locale}/courses/${slug || id}`);
  };

  return (
    <Card className="p-2 border h-100" onClick={handleCourseClick} role="button" style={{ cursor: 'pointer' }}>
      <div className="rounded-top overflow-hidden">
        <div className="card-overlay-hover">
          {useColoredBackground ? (
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                height: '200px',
                backgroundColor: backgroundColorHex || '#f5f5f5'
              }}
            >
              <Image
                src={courseImage}
                alt={title}
                width={120}
                height={120}
                style={{ objectFit: 'contain' }}
              />
            </div>
          ) : (
            <Image
              src={courseImage}
              className="card-img-top"
              alt={title}
              width={400}
              height={300}
              style={{ objectFit: 'cover', height: '200px' }}
            />
          )}
        </div>
      </div>

      <CardBody>
        <div className="d-flex justify-content-between">
          <ul className="list-inline hstack gap-2 mb-0">
            <li className="list-inline-item d-flex justify-content-center align-items-center">
              <div className="icon-md bg-orange bg-opacity-10 text-orange rounded-circle">
                <FaUserGraduate />
              </div>
              <span className="h6 fw-light ms-2 mb-0">{studentCount.toLocaleString()}</span>
            </li>
            <li className="list-inline-item d-flex justify-content-center align-items-center">
              <div className="icon-md bg-warning bg-opacity-15 text-warning rounded-circle">
                <FaStar />
              </div>
              <span className="h6 fw-light ms-2 mb-0">{rating > 0 ? rating.toFixed(1) : '0.0'}</span>
            </li>
          </ul>

          {/* Instructor avatar */}
          {instructor && (
            <div className="avatar avatar-sm">
              <Image
                className="avatar-img rounded-circle"
                src={instructorAvatar}
                alt={instructorName}
                width={30}
                height={30}
              />
            </div>
          )}
        </div>

        <hr />

        <CardTitle>
          <div className="course-title text-truncate-2">{title}</div>
        </CardTitle>

        <div className="d-flex align-items-start gap-3">
          <Image
            src={type === 'live' ? liveIcon : recordedIcon}
            alt={type === 'live' ? t('liveCourseBadge') : t('recordedCourseBadge')}
            className='me-2'
            width={60}
            height={60}
          />
          <p className="fs-6 mb-2">
            {shortDescription?.substring(0, 50) + (shortDescription?.length > 50 ? '...' : '') || t('noDescription')}
          </p>
        </div>

        <div className="d-flex justify-content-between align-items-center">
          <Badge bg="primary" className="px-3 rounded-pill fw-normal" onClick={(e) => e.stopPropagation()}>
            {category || subcategory || level || type || 'Course'}
          </Badge>
        </div>
      </CardBody>

      <style jsx>{`
        .text-truncate-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </Card>
  );
};

const ListedCourses = ({ relatedCourses = [] }) => {
  const t = useTranslations('courses.detail.related');

  // If there are no related courses, don't show this section
  if (!relatedCourses || relatedCourses.length === 0) return null;

  const courseSliderSettings = {
    arrowKeys: true,
    gutter: 30,
    autoplayButton: false,
    autoplayButtonOutput: false,
    nested: 'inner',
    mouseDrag: true,
    controlsText: [renderToString(<FaChevronLeft size={16} />), renderToString(<FaChevronRight size={16} />)],
    autoplay: false,
    controls: true,
    edgePadding: 2,
    items: 3,
    nav: false,
    responsive: {
      1: {
        items: 1
      },
      576: {
        items: 1
      },
      768: {
        items: 2
      },
      992: {
        items: 2
      },
      1200: {
        items: 3
      }
    }
  };

  return (
    <section className="pt-0 pt-md-5">
      <Container>
        <Row className="mb-4">
          <h2 className="mb-0">{t('title')}</h2>
        </Row>
        <Row>
          <div className="tiny-slider arrow-round arrow-blur arrow-hover">
            <TinySlider settings={courseSliderSettings}>
              {relatedCourses.map((course, idx) => (
                <div className="pb-4" key={course.id || idx}>
                  <CourseCard course={course} />
                </div>
              ))}
            </TinySlider>
          </div>
        </Row>
      </Container>
    </section>
  );
};

export default ListedCourses;