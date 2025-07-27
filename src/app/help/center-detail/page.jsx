import React from 'react';
import HelpCenterDetails from './components/HelpCenterDetails';
import HelpCenterBanner from './components/HelpCenterBanner';
import PageBanner from '@/app/components/banner/PageBanner';
export const metadata = {
  title: 'Help Center Details'
};
const CenterDetailPage = () => {
  return (<>
    <PageBanner
      bannerHeadline="help center details"
    />
    <HelpCenterBanner />
    <HelpCenterDetails />
  </>)
};
export default CenterDetailPage;
