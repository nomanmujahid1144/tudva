import React from 'react';
import Counter from './components/Counter';
import Chart from './components/Chart';
import CourseList from './components/CourseList';
export const metadata = {
  title: 'Instructor Dashboard'
};
const DashboardPage = () => {
  return <>
      <Counter />
      <Chart />
      <CourseList />
    </>;
};
export default DashboardPage;
