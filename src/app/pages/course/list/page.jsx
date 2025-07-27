import Footer from "@/components/Footer";
import CourseList from "./components/CourseList";
import Newsletter from "./components/Newsletter";
import PageBanner from "./components/PageBanner";
import TopNavigationBar from "./components/TopNavigationBar";
export const metadata = {
  title: 'Course List'
};
const List = () => {
  return <>
      <TopNavigationBar />
      <main>
        <PageBanner />
        <CourseList />
        <Newsletter />
      </main>
      <Footer className="bg-light" />
    </>;
};
export default List;
