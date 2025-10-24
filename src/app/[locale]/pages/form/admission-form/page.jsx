import React from 'react';
import TopNavigationBar from './components/TopNavigationBar';
import AdmissionFrom from './components/AdmissionFrom';
import Footer from './components/Footer';
export const metadata = {
  title: 'Admission From'
};
const AdmissionFromPage = () => {
  return <>
    <TopNavigationBar />
    <AdmissionFrom />
    <Footer />
    </>;
};
export default AdmissionFromPage;
