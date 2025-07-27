"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardBody, CardTitle, Col, Row, Badge } from "react-bootstrap";
import { FaRegClock, FaRegStar, FaSignal, FaStar, FaStarHalfAlt, FaTable, FaUser } from "react-icons/fa";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import { normalizeCourseData, formatDuration } from "@/utils/courseDataNormalizer";
import { formatCourseLevel } from '@/utils/textFormatting';
import DynamicIcon from '../../components/courses/DynamicIcons';
import liveIcon from '@/assets/images/live-course.png';
import recordedIcon from '@/assets/images/recorded-course.png';
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const CourseCard = ({
  course: rawCourse,
  isFavoritePage = false, // Flag to indicate if this is rendered on favorites page
  onFavoriteToggle = null // Callback for when favorite status changes
}) => {
  // Normalize course data to ensure consistent field names and values
  const course = normalizeCourseData(rawCourse);

  const {
    id,
    title,
    lectures,
    totalLectures,
    estimatedDuration,
    slug,
    duration,
    rating,
    icon,
    iconUrl,
    color,
    badge,
    format,
    level,
    instructor,
    short_description,
    isFavorite
  } = course;

  const router = useRouter();
  const { user } = useAuth();

  // Determine which icon to use (priority: iconUrl > icon)
  const displayIcon = iconUrl || icon || "FaBook";

  // Calculate star display
  const fullStars = Math.floor(rating?.stars || 5);
  const hasHalfStar = rating?.stars ? !Number.isInteger(rating.stars) : false;
  const emptyStars = 5 - (fullStars + (hasHalfStar ? 1 : 0));

  // Handle favorite toggle with callback
  const handleFavoriteToggle = async (courseId, newStatus) => {
    if (onFavoriteToggle) {
      await onFavoriteToggle(courseId, newStatus);
    }
  };

  return (
    <Card
      className="rounded overflow-hidden shadow h-100 course-card"
      role="button"
      style={{ cursor: 'pointer' }}
    >
      <Row className="g-0 h-100">
        {/* Course Icon/Image Column */}
        <Col md={4} className="course-card-icon position-relative">
          <Link href={`/courses/${slug}`}>
            <div
              className="d-flex justify-content-center align-items-center h-100"
              style={{
                backgroundColor: color || '#630000',
                color: 'white',
                minHeight: '200px'
              }}
            >
              <DynamicIcon iconName={displayIcon} />
            </div>

            {/* Category Badge */}
            {course.category && (
              <div className="position-absolute top-0 start-0 m-2">
                <Badge bg="primary" className="small">
                  {course.category}
                </Badge>
              </div>
            )}

            {/* Level Badge */}
            {level && (
              <div className="position-absolute bottom-0 start-0 m-2">
                <Badge bg="light" text="dark" className="border">
                  {formatCourseLevel(level || (badge && badge.text))}
                </Badge>
              </div>
            )}
          </Link>
        </Col>
        {/* Course Details Column */}
        <Col md={8}>
          <CardBody className="d-flex flex-column h-100">
            {/* Title and Favorite Button */}
            <div className="d-flex justify-content-between mb-2">
              <Link href={`/courses/${slug}`}>
                <CardTitle className="mb-0 h5 course-title" title={title}>
                  {title}
                </CardTitle>
              </Link>
              {user && user.role === 'learner' ? (
                <span onClick={(e) => e.stopPropagation()}>
                  <FavoriteButton
                    courseId={id}
                    initialFavoriteStatus={isFavorite}
                    skipInitialCheck={isFavoritePage} // Skip API check if we're on favorites page
                    onToggle={handleFavoriteToggle} // Pass callback to FavoriteButton
                  />
                </span>
              ) : null}
            </div>

            <div className="d-flex justify-content-between flex-column h-100 w-100 border-bottom mb-1">
              {short_description && (
                <p className="text-truncate-2 mb-2 text-black">
                  {short_description}
                </p>
              )}
              <p className="d-flex justify-content-start align-items-center">
                <FaUser className="text-primary me-2" />
                {instructor?.name || 'Unknown Instructor'}
              </p>
            </div>

            {/* Rating and Course Type */}
            <div className="d-flex justify-content-between align-items-center">
              {/* Rating Section (Left side or empty) */}
              <div className="d-flex align-items-center">
                {console.log(rating.stars, 'rating.stars')}
                {rating.stars !== 0 && (
                  <>
                    {Array(fullStars).fill(0).map((_, idx) => (
                      <FaStar key={`full-${idx}`} className="text-warning me-1" />
                    ))}
                    {hasHalfStar && <FaStarHalfAlt className="text-warning me-1" />}
                    {Array(emptyStars).fill(0).map((_, idx) => (
                      <FaRegStar key={`empty-${idx}`} className="text-warning me-1" />
                    ))}
                    {rating.stars && (
                      <span className="ms-1 text-secondary small fw-bold">
                        {rating.stars.toFixed(1)}/5.0
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Course Type Badge (Right side - always visible) */}
              {format && (
                <Image
                  src={format === 'live' ? liveIcon : recordedIcon}
                  alt={format === 'live' ? "Live Course" : "Recorded Course"}
                  width={46}
                  height={46}
                  className="me-1"
                />
              )}
            </div>
          </CardBody>
        </Col>
      </Row>

      <style jsx>{`
        .course-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .course-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }
        .course-title {
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .text-truncate-2 {
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .text-orange {
          color: #fd7e14;
        }
      `}</style>
    </Card>
  );
};

export default CourseCard;