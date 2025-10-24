import BlogInfo from "./components/BlogInfo";
import TopNavigationBar from "./components/TopNavigationBar";
import { notFound } from "next/navigation";
import { getBlogById } from "@/helpers/data";
import RelatedBlogs from "./components/RelatedBlogs";
import Footer from "@/components/Footer";
export const generateMetadata = async ({
  params
}) => {
  const blog = await getBlogById(params.blogId);
  return {
    title: blog?.id ?? 'Blog Details'
  };
};
const BlogDetails = async ({
  params
}) => {
  const blog = await getBlogById(params.blogId);
  if (!blog) notFound();
  return <>
      <TopNavigationBar />
      <main>
        <BlogInfo blog={blog} />
        <RelatedBlogs />
      </main>
      <Footer className="bg-light" />
    </>;
};
export default BlogDetails;
