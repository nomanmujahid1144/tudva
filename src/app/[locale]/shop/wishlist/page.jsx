import React from 'react';
import Banner from './components/Banner';
import WishlistCart from './components/WishlistCart';
export const metadata = {
  title: 'Wishlist'
};
const WishlistPage = () => {
  return <main>
      {/* <Banner /> */}
      <WishlistCart />
    </main>;
};
export default WishlistPage;
