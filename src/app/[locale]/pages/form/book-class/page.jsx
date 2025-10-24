import React from 'react';
import BookClass from './componets/BookClass';
import TopNavigationBar from './componets/TopNavigationBar';
import Footer from './componets/Footer';
export const metadata = {
  title: 'Book Class'
};
const BookClassPage = () => {
  return <div>
      <TopNavigationBar />
      <BookClass />
      <Footer />
    </div>;
};
export default BookClassPage;
