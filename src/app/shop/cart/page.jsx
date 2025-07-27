import React from 'react';
import CartDetails from './components/CartDetails';
import Banner from './components/Banner';
export const metadata = {
  title: 'Shop Cart'
};
const CartPage = () => {
  return <main>

      <Banner />
      <CartDetails />
    </main>;
};
export default CartPage;
