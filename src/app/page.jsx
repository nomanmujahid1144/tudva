import Hero from "./components/home/Hero";
import TrendingCourses from "./components/home/TrendingCourses";
import CoursesOverview from "./components/home/CoursesOverview";
import SearchCourses from "./components/home/SearchCourses";
export const metadata = {
  title: 'home'
};
const AcademicHome = () => {
  return <>
        <Hero />
        <SearchCourses />
        <CoursesOverview />
        <TrendingCourses />
    </>;
};
export default AcademicHome;
