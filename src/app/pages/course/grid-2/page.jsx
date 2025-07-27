import Footer from "@/components/Footer";
import Courses from "./components/Courses";
import PageBanner from "./components/PageBanner";
import TopNavigationBar from "./components/TopNavigationBar";
import ActionBox from "./components/ActionBox";
export const metadata = {
  title: 'Course Grid2'
};
const CourseGrid2 = () => {
  return <>
      <TopNavigationBar />
      <main>
        <PageBanner />
        <Courses />
        <ActionBox />
      </main>
      <Footer className="bg-light" />
    </>;
};
export default CourseGrid2;
