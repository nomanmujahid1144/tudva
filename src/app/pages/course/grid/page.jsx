import Footer from "@/components/Footer";
import Courses from "./components/Courses";
import NewsLetter from "./components/NewsLetter";
import PageBanner from "./components/PageBanner";
import TopNavigationBar from "./components/TopNavigationBar";
export const metadata = {
  title: 'Course Grid'
};
const CourseGrid = () => {
  return <>
      <TopNavigationBar />
      <main>
        <PageBanner />
        <Courses />
        <NewsLetter />
        <Footer className="bg-light" />
      </main>
    </>;
};
export default CourseGrid;
