import About from "../components/about-us/About";
import Clients from "../components/about-us/Clients";
import Hero from "../components/about-us/Hero";
import Team from "../components/about-us/Team";
import PageBanner from "../components/banner/PageBanner";
export const metadata = {
  title: "About Us"
};
const AboutUs = () => {
  return <>
    <PageBanner
      bannerHeadline="about us"
    />
    <Hero />
    <About />
    <Clients />
    <Team />
  </>;
};
export default AboutUs;
