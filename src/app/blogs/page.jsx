import PageBanner from "../components/banner/PageBanner";
import Banner from "../components/blogs/Banner";
import Blogs from "../components/blogs/Blogs";
export const metadata = {
  title: "Blog Grid"
};
const BlogGrid = () => {
  return <>
  <PageBanner
      bannerHeadline="blogs"
  />
        <Banner />
        <Blogs />
    </>;
};
export default BlogGrid;
