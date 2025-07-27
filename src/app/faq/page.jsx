import React from 'react';
import FaqBanner from '../components/faqs/FaqBanner';
import FaqContent from '../components/faqs/FaqContent';
import PageBanner from '../components/banner/PageBanner';
export const metadata = {
  title: 'Faq'
};
const FaqPage = () => {
  return <>
    <PageBanner
      bannerHeadline="frequent ask questions"
    />
    <FaqBanner />
    <FaqContent />
  </>;
};
export default FaqPage;
