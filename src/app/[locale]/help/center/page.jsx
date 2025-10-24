import React from 'react';
import HelpCenterBanner from './components/HelpCenterBanner';
import RecommendedTopics from './components/RecommendedTopics';
import PopularArticles from './components/PopularArticles';
import ActionBox from './components/ActionBox';
import PageBanner from '@/app/components/banner/PageBanner';
export const metadata = {
  title: 'Help Center'
};
const HelpCenterPage = () => {
  return (
    <>
      <PageBanner
        bannerHeadline="help center"
      />
      <HelpCenterBanner />
      <RecommendedTopics />
      <PopularArticles />
      <ActionBox />
    </>
  )
};
export default HelpCenterPage;
