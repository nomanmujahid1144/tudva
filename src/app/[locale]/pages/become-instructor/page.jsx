import React from 'react';
import TopNavigationBar from './components/TopNavigationBar';
import Footer from '@/components/Footer';
import Banner from './components/Banner';
import Steps from './components/Steps';
import Counter from './components/Counter';
import FormAndTabs from './components/FormAndTabs';
import ActionBox from './components/ActionBox';
export const metadata = {
  title: 'Become Instructor'
};
const BecomeInstructorPage = () => {
  return <>
      <TopNavigationBar />
      <main>
        <Banner />
        <Steps />
        <Counter />
        <FormAndTabs />
        <ActionBox />
      </main>
      <Footer className="bg-light" />
    </>;
};
export default BecomeInstructorPage;
