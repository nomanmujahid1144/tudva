import React from 'react';
import MarketingCourse from './Components/MarketingCourse';
import CourseEarning from './Components/CourseEarning';
import StudentReview from './Components/StudentReview';
import { Button, Col, Row } from 'react-bootstrap';
const page = () => {
  return <>
      <Row className="mb-3">
        <Col xs={12} className="d-sm-flex justify-content-between align-items-center">
          <h1 className="h3 mb-2 mb-sm-0">Course Details</h1>
          <Button size='sm' variant='primary' href="/admin/edit-course" className="mb-0">Edit Course</Button>
        </Col>
      </Row>
      <Row className="g-4">
        <MarketingCourse />
        <CourseEarning />
        <StudentReview />
      </Row>
    </>;
};
export default page;
