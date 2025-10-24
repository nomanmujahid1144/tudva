import React from 'react';
import PersonalInformation from './components/PersonalInformation';
import InstructorCharts from './components/InstructorCharts';
import CoursesList from './components/CoursesList';
import AllReviews from './components/AllReviews';
import { Col, Row } from 'react-bootstrap';
export const metadata = {
  title: 'Instructor Details'
};
const InstructorDetailPage = () => {
  return <>
      <Row>
        <Col xs={12} className="mb-3">
          <h1 className="h3 mb-2 mb-sm-0">Instructor detail</h1>
        </Col>
      </Row>
      <Row className="g-4">
        <PersonalInformation />
        <InstructorCharts />
        <CoursesList />
        <AllReviews />
      </Row>
    </>;
};
export default InstructorDetailPage;
