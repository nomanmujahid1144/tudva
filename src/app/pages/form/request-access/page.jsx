import React from 'react';
import TopNavigationBar from './componets/TopNavigationBar';
import Hero from './componets/Hero';
import Client from './componets/Client';
import Testimonials from './componets/Testimonials';
import Newsletter from './componets/Newsletter';
import Footer from './componets/Footer';
export const metadata = {
  title: 'Request Access'
};
const RequestAccessPage = () => {
  return <>
      <TopNavigationBar />
      <main>
        <Hero />
        <Client />
        <Testimonials />
        <Newsletter />
      </main>
      <Footer />
    </>;
};
export default RequestAccessPage;
