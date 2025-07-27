import React from 'react';
import { Col, Row } from 'react-bootstrap';
import AllStudents from './components/AllStudents';
export const metadata = {
  title: 'Student'
};
const StudentPage = () => {
  return <>
      <Row>
        <Col xs={12}>
          <h1 className="h3 mb-2 mb-sm-0">Students</h1>
        </Col>
      </Row>
      <AllStudents />
    </>;
};
export default StudentPage;
