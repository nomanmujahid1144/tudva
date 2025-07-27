import React from 'react';
import Banner from './components/Banner';
import EmptyCart from './components/EmptyCart';
export const metadata = {
  title: 'Empty Cart'
};
const EmptyCartPage = () => {
  return <>
      <main>
        <Banner />
        <EmptyCart />
      </main>
    </>;
};
export default EmptyCartPage;
