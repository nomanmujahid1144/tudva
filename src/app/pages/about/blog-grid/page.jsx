import Footer from "@/components/Footer";
import Banner from "./components/Banner";
import Blogs from "./components/Blogs";
import TopNavigationBar from "./components/TopNavigationBar";
export const metadata = {
  title: "Blog Grid"
};
const BlogGrid = () => {
  return <>
      <TopNavigationBar />
      <main>
        <Banner />
        <Blogs />
      </main>
      <Footer className="bg-light" />
    </>;
};
export default BlogGrid;
