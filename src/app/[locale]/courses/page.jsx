import PageBanner from "../components/banner/PageBanner";
import CourseList from "../components/courses/CourseList";

export const metadata = {
  title: 'All Courses - Tudva',
  description: 'Explore our comprehensive collection of courses across various categories including Languages, Cooking, Creativity, Digital Skills, Health, Nature, and Career Development.',
  keywords: 'online courses, live courses, recorded courses, learning, education, skills development',
};

const CourseHome = () => {
  return (
    <>
      <PageBanner 
        bannerHeadline="Discover Your Next Learning Adventure"
        bannerSubtext="Explore our comprehensive collection of courses designed to help you grow personally and professionally"
        showBreadcrumb={true}
        breadcrumbItems={[
          { name: "Home", link: "/" },
          { name: "Courses", link: "/courses" }
        ]}
      />
      <CourseList />
    </>
  );
};

export default CourseHome;