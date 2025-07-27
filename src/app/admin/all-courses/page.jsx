import React from 'react';
import CoursesStat from './components/CoursesStat';
import Courses from './components/Courses';
export const metadata = {
  title: 'All Course'
};
const AllCourses = () => {
  return <>
      <CoursesStat />
      <Courses />
    </>;
};
export default AllCourses;
