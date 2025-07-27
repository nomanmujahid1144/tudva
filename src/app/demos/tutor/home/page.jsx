import ContactForm from "./components/ContactForm";
import Faqs from "./components/Faqs";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Services from "./components/Services";
import TopNavigationBar from "./components/TopNavigationBar";
export const metadata = {
  title: 'Tutor'
};
const TutorHome = () => {
  return <>
      <TopNavigationBar />
      <main>
        <Hero />
        <Services />
        <ContactForm />
        <Faqs />
      </main>
      <Footer />
    </>;
};
export default TutorHome;
