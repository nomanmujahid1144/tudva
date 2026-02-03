"use client";

import Image from "next/image";
import { Card, CardBody, Col, Row, Badge } from "react-bootstrap";
import {
  FaCommentDots,
  FaEnvelope,
  FaFacebookSquare,
  FaGlobe,
  FaGraduationCap,
  FaInstagramSquare,
  FaLinkedin,
  FaPlay,
  FaStar,
  FaTwitterSquare,
  FaUserGraduate,
  FaYoutubeSquare
} from "react-icons/fa";
import { useTranslations } from "next-intl";

// Default instructor image as fallback
import defaultInstructorImage from '@/assets/images/instructor/01.jpg';

const Instructor = ({ instructor }) => {
  const t = useTranslations('courses.detail.instructor');
  
  if (!instructor) {
    return (
      <div className="alert alert-info">
        <p className="mb-0">{t('noInfo')}</p>
      </div>
    );
  }

  // Extract instructor details
  const {
    id,
    fullName = instructor.name || "Instructor Name",
    aboutMe = instructor.bio || "No information available about this instructor.",
    profilePicture,
    email,
    website,
    title = instructor.title || "Course Instructor",
    social = {} // Social media links
  } = instructor;

  // Use default image if no profile picture is provided
  const instructorImage = profilePicture || defaultInstructorImage;

  // Mock statistics for display (these would come from the backend in a real app)
  const stats = {
    students: instructor.totalStudents || 9100,
    rating: instructor.rating || 4.5,
    courses: instructor.totalCourses || 29,
    reviews: instructor.totalReviews || 205
  };

  return (
    <div className="instructor-profile">
      {/* Instructor Card */}
      <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
        <Row className="g-0">
          {/* Instructor Image */}
          <Col md={4} lg={3} className="d-flex justify-content-center align-items-center ps-3">
            <div className="h-75 border">
              <Image
                src={instructorImage}
                alt={`Instructor ${fullName}`}
                className="rounded-start h-100 w-100 rounded"
                width={250}
                height={250}
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center top',
                  border: '2px solid black',
                  padding: '3px'
                }}
              />
            </div>
          </Col>

          {/* Instructor Info */}
          <Col md={8} lg={9}>
            <CardBody className="p-4">
              <div className="d-md-flex justify-content-between align-items-start mb-3">
                <div className="d-flex justify-content-between w-100">
                  <div>
                    <h2 className="card-title h3 mb-1">{fullName}</h2>
                    <p className="mb-0">{title}</p>
                  </div>
                  {/* Experience Badge */}
                  <div className="m-3">
                    <Badge bg="primary" className="px-3 py-2">
                      <FaGraduationCap className="me-1" />
                      {stats.courses}+ {t('courses')}
                    </Badge>
                  </div>
                </div>

                {/* Social Media Icons */}
                <div className="mt-3 mt-md-0">
                  <ul className="list-inline mb-0">
                    {social.twitter && (
                      <li className="list-inline-item">
                        <a href={social.twitter} className="btn btn-sm btn-twitter rounded-circle" target="_blank" rel="noopener noreferrer">
                          <FaTwitterSquare />
                        </a>
                      </li>
                    )}
                    {social.instagram && (
                      <li className="list-inline-item">
                        <a href={social.instagram} className="btn btn-sm btn-instagram rounded-circle" target="_blank" rel="noopener noreferrer">
                          <FaInstagramSquare />
                        </a>
                      </li>
                    )}
                    {social.facebook && (
                      <li className="list-inline-item">
                        <a href={social.facebook} className="btn btn-sm btn-facebook rounded-circle" target="_blank" rel="noopener noreferrer">
                          <FaFacebookSquare />
                        </a>
                      </li>
                    )}
                    {social.linkedin && (
                      <li className="list-inline-item">
                        <a href={social.linkedin} className="btn btn-sm btn-linkedin rounded-circle" target="_blank" rel="noopener noreferrer">
                          <FaLinkedin />
                        </a>
                      </li>
                    )}
                    {social.youtube && (
                      <li className="list-inline-item">
                        <a href={social.youtube} className="btn btn-sm btn-youtube rounded-circle" target="_blank" rel="noopener noreferrer">
                          <FaYoutubeSquare />
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="d-flex flex-wrap gap-3 mb-3">
                <div className="px-3 py-2 bg-light rounded-3 d-flex align-items-center">
                  <FaUserGraduate className="text-orange me-2 fs-5" />
                  <div>
                    <h6 className="mb-0 fw-bold">{stats.students.toLocaleString()}</h6>
                    <small className="text-muted">{t('students')}</small>
                  </div>
                </div>
                <div className="px-3 py-2 bg-light rounded-3 d-flex align-items-center">
                  <FaStar className="text-warning me-2 fs-5" />
                  <div>
                    <h6 className="mb-0 fw-bold">{stats.rating}</h6>
                    <small className="text-muted">{t('rating')}</small>
                  </div>
                </div>
                <div className="px-3 py-2 bg-light rounded-3 d-flex align-items-center">
                  <FaPlay className="text-danger me-2 fs-5" />
                  <div>
                    <h6 className="mb-0 fw-bold">{stats.courses}</h6>
                    <small className="text-muted">{t('courses')}</small>
                  </div>
                </div>
                <div className="px-3 py-2 bg-light rounded-3 d-flex align-items-center">
                  <FaCommentDots className="text-info me-2 fs-5" />
                  <div>
                    <h6 className="mb-0 fw-bold">{stats.reviews}</h6>
                    <small className="text-muted">{t('reviews')}</small>
                  </div>
                </div>
              </div>

              {/* Contact info */}
              <div className="mt-3 d-flex flex-wrap gap-4">
                {email && (
                  <div className="d-flex align-items-center">
                    <FaEnvelope className="text-primary me-2" />
                    <a href={`mailto:${email}`} className="text-decoration-none">{email}</a>
                  </div>
                )}
                {website && (
                  <div className="d-flex align-items-center">
                    <FaGlobe className="text-success me-2" />
                    <a href={website} className="text-decoration-none" target="_blank" rel="noopener noreferrer">{website}</a>
                  </div>
                )}
              </div>
            </CardBody>
          </Col>
        </Row>
      </Card>

      {/* About the instructor */}
      <div className="bg-light p-4 rounded-4 mb-4">
        <h4 className="mb-3">{t('title')}</h4>
        <div className="instructor-bio">
          {typeof aboutMe === 'string' && aboutMe.includes('<') ? (
            <div dangerouslySetInnerHTML={{ __html: aboutMe }} />
          ) : (
            <p>{aboutMe}</p>
          )}
        </div>
      </div>

      {/* View all courses button */}
      {id && (
        <div className="text-center mt-4">
          <a href={`/instructor/${id}`} className="btn btn-outline-primary">
            <FaGraduationCap className="me-2" />
            {t('viewAllCourses')} {fullName}
          </a>
        </div>
      )}

      <style jsx>{`
        .text-orange {
          color: #fd7e14;
        }
        .btn-twitter {
          background-color: #1da1f2;
          color: white;
        }
        .btn-instagram {
          background-color: #e1306c;
          color: white;
        }
        .btn-facebook {
          background-color: #3b5998;
          color: white;
        }
        .btn-linkedin {
          background-color: #0077b5;
          color: white;
        }
        .btn-youtube {
          background-color: #ff0000;
          color: white;
        }
        .instructor-bio {
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
};

export default Instructor;