import PageBanner from "../components/banner/PageBanner";
import ContactCards from "../components/contact-us/ContactCards";
import ContactFormAndMap from "../components/contact-us/ContactFormAndMap";
export const metadata = {
  title: "Contact Us"
};
const ContactUs = () => {
  return <>
    <PageBanner
      bannerHeadline="contact us"
    />
    <ContactCards />
    <ContactFormAndMap />
  </>;
};
export default ContactUs;
