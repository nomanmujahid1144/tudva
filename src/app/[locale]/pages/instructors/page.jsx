import Banner from "./components/Banner";
import InstructorLists from "./components/InstructorLists";
import TopNavigationBar from "./components/TopNavigationBar";
import ActionBox from "./components/ActionBox";
import Footer from "@/components/Footer";
export const metadata = {
  title: "Instructor List"
};
const Instructors = () => {
  return <>
      <TopNavigationBar />
      <main>
        <Banner />
        <InstructorLists />
        <ActionBox />
      </main>
      <Footer className="bg-light" />
    </>;
};
export default Instructors;
