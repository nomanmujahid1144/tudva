import Footer from "@/components/Footer";
import ClientSlider from "./components/ClientSlider";
import Faqs from "./components/Faqs";
import Features from "./components/Features";
import PricingPlans from "./components/PricingPlans";
import TopNavigationBar from "./components/TopNavigationBar";
export const metadata = {
  title: "Contact Us"
};
const Pricing = () => {
  return <>
      <TopNavigationBar />
      <main>
        <PricingPlans />
        <ClientSlider />
        <Features />
        <Faqs />
      </main>
      <Footer className="bg-light" />
    </>;
};
export default Pricing;
