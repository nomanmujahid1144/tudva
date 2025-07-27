import Footer from "@/components/Footer";
import About from "./components/About";
import ActionBox from "./components/ActionBox";
import AdmissionAlert from "./components/AdmissionAlert";
import Blogs from "./components/Blogs";
import Gallery from "./components/Gallery";
import Hero from "./components/Hero";
import Subjects from "./components/Subjects";
import TopNavigationBar from "./components/TopNavigationBar";
export const metadata = {
  title: 'School'
};
const SchoolHome = () => {
  return <>
      <TopNavigationBar />
      <main>
        <Hero />
        <Subjects />
        <About />
        <ActionBox />
        <Gallery />
        <Blogs />
      </main>
      <Footer className="bg-light" />
      <AdmissionAlert />
    </>;
};
export default SchoolHome;
