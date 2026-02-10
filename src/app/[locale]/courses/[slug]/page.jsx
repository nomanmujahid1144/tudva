"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Container, Button } from "react-bootstrap";
import { useTranslations } from "next-intl";
import CourseDetails from "./components/CourseDetails";
import ListedCourses from "./components/ListedCourses";
import PageIntro from "./components/PageIntro";
import PageIntroSkeleton from "./components/skeletons/PageIntroSkeleton";
import CourseDetailsSkeleton from "./components/skeletons/CourseDetailsSkeleton";
import courseService from "@/services/courseService";

// Component to show error state
const ErrorState = ({ error, onRetry }) => {
  const t = useTranslations('courses.detail.error');
  
  return (
    <Container className="py-5 text-center">
      <div className="alert alert-danger">
        <h4 className="alert-heading">{t('title')}</h4>
        <p className="mb-3">{error}</p>
        <Button variant="primary" onClick={onRetry}>
          {t('tryAgain')}
        </Button>
      </div>
    </Container>
  );
};

const CourseDetailPage = () => {
  const params = useParams();
  const t = useTranslations('courses.detail.error');
  const [course, setCourse] = useState(null);
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourseData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const slug = params.slug;

      if (!slug) {
        throw new Error(t('notFound'));
      }

      // Fetch course details
      const courseResponse = await courseService.getCourseBySlug(slug);

      if (!courseResponse.success || !courseResponse.data) {
        throw new Error(courseResponse.error || t('title'));
      }

      const courseData = courseResponse.data;
      setCourse(courseData);

      // Fetch related courses if we have a course ID
      if (courseData.id) {
        try {
          const relatedResponse = await courseService.getRelatedCourses(courseData.id, 4);
          console.log(relatedResponse, 'relatedResponse')
          if (relatedResponse.success) {
            setRelatedCourses(relatedResponse.data || []);
          }
        } catch (relatedError) {
          console.error("Error fetching related courses:", relatedError);
          setRelatedCourses([]);
        }
      }

    } catch (err) {
      console.error("Error fetching course:", err);
      setError(err.message || t('title'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [params.slug]);

  // Show loading skeleton
  if (isLoading) {
    return (
      <main>
        <PageIntroSkeleton />
        <CourseDetailsSkeleton />
      </main>
    );
  }

  // Show error state
  if (error) {
    return (
      <main>
        <ErrorState error={error} onRetry={fetchCourseData} />
      </main>
    );
  }

  // Show course details when data is loaded
  if (!course) {
    return (
      <main>
        <ErrorState error={t('notFound')} onRetry={fetchCourseData} />
      </main>
    );
  }

  return (
    <main>
      <PageIntro course={course} />
      <CourseDetails course={course} />
      {relatedCourses.length > 0 && (
        <ListedCourses relatedCourses={relatedCourses} />
      )}
    </main>
  );
};

export default CourseDetailPage;