import Footer from "@/components/Footer";
import ActionBox from "./components/ActionBox";
import CourseList from "./components/CourseList";
import PageBanner from "./components/PageBanner";
import TopNavigationBar from "./components/TopNavigationBar";
export const metadata = {
  title: 'Course List Minimal'
};
const List2 = () => {
  return <>
      <TopNavigationBar />
      <main>
        <PageBanner />
        <CourseList />
        <ActionBox />
      </main>
      <Footer className="bg-light" />
    </>;
};
export default List2;
