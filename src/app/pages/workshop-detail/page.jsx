import React from 'react';
import TopNavigationBar from './components/TopNavigationBar';
import Footer from './components/Footer';
import Banner from './components/Banner';
import About from './components/About';
import ActionBox from './components/ActionBox';
import Curriculum from './components/Curriculum';
import Testimonials from './components/Testimonials';
export const metadata = {
  title: 'Workshop Detail'
};
const WorkshopDetailPage = () => {
  return <>
    <TopNavigationBar />
    <main>
      <Banner />
      <About />
      <ActionBox />
      <Curriculum />
      <Testimonials />
    </main>
    <Footer />
    </>;
};
export default WorkshopDetailPage;
