import Footer from "@/components/Footer";
import ContactCards from "./components/ContactCards";
import ContactFormAndMap from "./components/ContactFormAndMap";
import TopNavigationBar from "./components/TopNavigationBar";
export const metadata = {
  title: "Contact Us"
};
const ContactUs = () => {
  return <>
      <TopNavigationBar />
      <main>
        <ContactCards />
        <ContactFormAndMap />
      </main>
      <Footer className="bg-light" />
    </>;
};
export default ContactUs;
