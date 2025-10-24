// src/app/favorites/page.js
import PageBanner from "../../components/banner/PageBanner";
import FavoriteCourses from './components/FavoriteCourses';

export const metadata = {
  title: 'My Favorite Courses - Tudva',
  description: 'View and manage your favorite courses. Access all the courses you\'ve saved for later learning.',
  keywords: 'favorite courses, saved courses, learning, education, my courses, bookmarked',
};

const FavoritesPage = () => {
  return (
    <>
      <PageBanner 
        bannerHeadline="My Favorite Courses"
        bannerSubtext="All your saved courses in one place. Continue your learning journey with your handpicked selection."
        showBreadcrumb={true}
        breadcrumbItems={[
          { name: "Home", link: "/" },
          { name: "Favorites", link: "/favorites" }
        ]}
      />
      <FavoriteCourses />
    </>
  );
};

export default FavoritesPage;