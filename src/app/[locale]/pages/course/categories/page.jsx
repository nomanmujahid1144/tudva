import React from 'react';
import TopNavigationBar from './components/TopNavigationBar';
import Hero from './components/Hero';
import CourseCategories from './components/CourseCategories';
import Languages from './components/Languages';
import ActionBox from './components/ActionBox';
import Footer from '@/components/Footer';
export const metadata = {
  title: 'Categories'
};
const Categories = () => {
  return <>
      <TopNavigationBar />
      <Hero />
      <CourseCategories />
      <Languages />
      <ActionBox />
      <Footer className='bg-light' />
    </>;
};
export default Categories;
