import Banner from "./components/Banner";
import Blogs from "./components/Blogs";
import TopNavigationBar from "./components/TopNavigationBar";
export const metadata = {
  title: "Blog Masonry"
};
const BlogMasonry = () => {
  return <>
      <TopNavigationBar />
      <main>
        <Banner />
        <Blogs />
      </main>
    </>;
};
export default BlogMasonry;
