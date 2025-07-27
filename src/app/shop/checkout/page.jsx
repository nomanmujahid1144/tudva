import React from 'react';
import Banner from './components/Banner';
import CheckoutFrom from './components/CheckoutFrom';
export const metadata = {
  title: 'Checkout'
};
const CheckoutPage = () => {
  return <>
      <Banner />
      <CheckoutFrom />
    </>;
};
export default CheckoutPage;
