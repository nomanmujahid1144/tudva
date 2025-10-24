import ActionBox from "./components/ActionBox";
import Faqs from "./components/Faqs";
import Features from "./components/Features";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Instructors from "./components/Instructors";
import TopCourses from "./components/TopCourses";
import TopNavigationBar from "./components/TopNavigationBar";
export const metadata = {
  title: 'Workshop'
};
const WorkshopHome = () => {
  return <>
      <TopNavigationBar />
      <main>
        <Hero />
        <Features />
        <Instructors />
        <ActionBox />
        <TopCourses />
        <Faqs />
      </main>
      <Footer />
    </>;
};
export default WorkshopHome;
