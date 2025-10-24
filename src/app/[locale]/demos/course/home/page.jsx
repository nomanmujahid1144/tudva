import Footer from "@/components/Footer";
import ActionBox from "./Components/ActionBox";
import ActionBox2 from "./Components/ActionBox2";
import CourseCategories from "./Components/CourseCategories";
import FeaturedCourses from "./Components/FeaturedCourses";
import Hero from "./Components/Hero";
import LiveCourses from "./Components/LiveCourses";
import TopCourses from "./Components/TopCourses";
import TopNavigationBar from "./Components/TopNavigationBar";
export const metadata = {
  title: 'Course'
};
const CourseHome = () => {
  return <>
      <TopNavigationBar />
      <main>
        <Hero />
        <CourseCategories />
        <FeaturedCourses />
        <ActionBox />
        <TopCourses />
        <LiveCourses />
        <ActionBox2 />
      </main>
      <Footer className="bg-light" />
    </>;
};
export default CourseHome;
