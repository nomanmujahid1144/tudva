import Footer from "@/components/Footer";
import CourseDetail from "./components/CourseDetail";
import Intro from "./components/Intro";
import TopNavigationBar from "./components/TopNavigationBar";
export const metadata = {
  title: 'Course Module'
};
const CourseDetailModule = () => {
  return <>
      
      <main>
        <Intro />
        <CourseDetail />
      </main>
      
    </>;
};
export default CourseDetailModule;
