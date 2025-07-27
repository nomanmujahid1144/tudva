import Footer from "@/components/Footer";
import ActionBox from "./components/ActionBox";
import Counter from "./components/Counter";
import Hero from "./components/Hero";
import PopularCourse from "./components/PopularCourse";
import Reviews from "./components/Reviews";
import TopNavbar1 from "./components/TopNavbar1";
import TrendingCourses from "./components/TrendingCourses";
export const metadata = {
  title: 'Home'
};
const HomePage = () => {
  return <>
      <TopNavbar1 />
      <main>
        <Hero />
        <Counter />
        <PopularCourse />
        <ActionBox />
        <TrendingCourses />
        <Reviews />
      </main>
      <Footer />
    </>;
};
export default HomePage;
