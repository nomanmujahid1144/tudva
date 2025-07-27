import React from 'react';
import TopUserNotice from './components/TopUserNotice';
import TopNavigationBar from './components/TopNavigationBar';
import Hero from './components/Hero';
import Clients from './components/Clients';
import About from './components/About';
import TrendingCourses from './components/TrendingCourses';
import Video from './components/Video';
import EducationEvents from './components/EducationEvents';
import NewsLetter from './components/NewsLetter';
import Footer from './components/Footer';
import CookieAlertBox from './components/CookieAlertBox';
export const metadata = {
  title: 'Education'
};
const EducationHome = () => {
  return <>
      <TopUserNotice />
      <TopNavigationBar />
      <main>
        <Hero />
        <Clients />
        <About />
        <TrendingCourses />
        <Video />
        <EducationEvents />
        <NewsLetter />
      </main>
      <Footer />
      <CookieAlertBox />
    </>;
};
export default EducationHome;
