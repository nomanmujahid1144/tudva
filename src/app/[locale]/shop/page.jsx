import React from 'react';
import Banner from './components/Banner';
import AllListedBooks from './components/AllListedBooks';
import ActionBox from './components/ActionBox';
export const metadata = {
  title: 'Shop'
};
const ShopPage = () => {
  return <main>
      <Banner />
      <AllListedBooks />
      <ActionBox />
    </main>;
};
export default ShopPage;
