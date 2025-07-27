import Footer from '@/components/Footer';
import React from 'react';
import TopNavigationBar from './components/TopNavigationBar';
import Banner from './components/Banner';
import Details from './components/Details';
import ActionBox from './components/ActionBox';
export const metadata = {
  title: 'Abroad Single'
};
const AbroadSinglePage = () => {
  return <>
      <TopNavigationBar />
      <main>
        <Banner />
        <Details />
        <ActionBox />
      </main>
      <Footer className="bg-light" />
    </>;
};
export default AbroadSinglePage;
