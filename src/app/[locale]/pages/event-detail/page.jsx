import React from 'react';
import TopNavigationBar from './components/TopNavigationBar';
import Footer from '@/components/Footer';
import Banner from './components/Banner';
import EventDetailsContent from './components/EventDetailsContent';
export const metadata = {
  title: 'Event Detail'
};
const EventDetailPage = () => {
  return <>
      <TopNavigationBar />
      <main>
        <Banner />
        <EventDetailsContent />
      </main>
      <Footer className='pt-5 bg-light' />
    </>;
};
export default EventDetailPage;
