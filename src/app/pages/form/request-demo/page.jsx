import Footer from "./components/Footer";
import HeroFrom from "./components/HeroFrom";
import TopNavigationBar from "./components/TopNavigationBar";
export const metadata = {
  title: 'Request Demo'
};
const RequestDemo = () => {
  return <>
      <TopNavigationBar />
      <HeroFrom />
      <Footer />
    </>;
};
export default RequestDemo;
