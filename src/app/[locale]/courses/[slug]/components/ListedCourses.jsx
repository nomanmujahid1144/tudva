"use client";

import TinySlider from "@/components/TinySlider";
import { currency } from "@/context/constants";
import Image from "next/image";
import { Card, CardBody, CardTitle, Container, Row } from "react-bootstrap";
import { renderToString } from "react-dom/server";
import { FaChevronLeft, FaChevronRight, FaCircle, FaShoppingCart, FaStar, FaUserGraduate } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

// Default placeholder image
import placeholderImg from '@/assets/images/courses/4by3/01.jpg';
import placeholderAvatar from '@/assets/images/avatar/01.jpg';

const CourseCard = ({ course }) => {
  const router = useRouter();
  
  if (!course) return null;
  
  // Format course data
  const {
    id,
    title,
    stats = {},
    instructor = {},
    thumbnailUrl,
    iconUrl,
    shortDescription,
    category,
    subcategory,
    level,
    type
  } = course;
  
  // Default or fallback values
  const studentCount = stats.enrollmentCount || 0;
  const rating = stats.rating || 5.0;
  const price = 149; // This would come from course.price
  const instructorAvatar = instructor?.profilePicture || placeholderAvatar;
  const courseImage = thumbnailUrl || placeholderImg;
  
  // Handle click to go to course detail page
  const handleCourseClick = () => {
    router.push(`/courses/${course.slug || id}`);
  };

  return (
    <Card className="p-2 border h-100" onClick={handleCourseClick} role="button" style={{ cursor: 'pointer' }}>
      <div className="rounded-top overflow-hidden">
        <div className="card-overlay-hover">
          <Image 
            src={courseImage} 
            className="card-img-top" 
            alt={title} 
            width={400}
            height={300}
            style={{ objectFit: 'cover', height: '200px' }}
          />
        </div>
        <div className="card-img-overlay">
          <div className="card-element-hover d-flex justify-content-end">
            <a href="#" className="icon-md bg-white rounded-circle text-center" onClick={(e) => {
              e.stopPropagation();
              // Add to cart logic here
            }}>
              <FaShoppingCart className="text-danger" />
            </a>
          </div>
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
              <span className="h6 fw-light ms-2 mb-0">{rating.toFixed(1)}</span>
            </li>
          </ul>
          
          {/* Instructor avatar */}
          {instructor && (
            <div className="avatar avatar-sm">
              <Image 
                className="avatar-img rounded-circle" 
                src={instructorAvatar} 
                alt={instructor.name || "Instructor"}
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
        
        <div className="d-flex justify-content-between align-items-center">
          <a href="#" className="badge bg-info bg-opacity-10 text-info" onClick={(e) => e.stopPropagation()}>
            <FaCircle className="small fw-bold me-2" />{category || subcategory || level || type || 'Course'}
          </a>
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
  const t = useTranslations('courses.detail.relatedCourses');
  
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