import Footer from "@/components/Footer";
import About from "./components/About";
import Clients from "./components/Clients";
import Hero from "./components/Hero";
import Team from "./components/Team";
import TopNavigationBar from "./components/TopNavigationBar";
export const metadata = {
  title: "About Us"
};
const AboutUs = () => {
  return <>
      <TopNavigationBar />
      <main>
        <Hero />
        <About />
        <Clients />
        <Team />
      </main>
      <Footer className="bg-light" />
    </>;
};
export default AboutUs;
