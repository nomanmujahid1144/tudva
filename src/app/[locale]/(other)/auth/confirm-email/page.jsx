import React from 'react';
import { Col, Row } from 'react-bootstrap';
import VerifyEmail from './components/VerifyEmail';

const ConfirmEmail = () => {
  return <Col xs={12} lg={6} className="d-flex justify-content-center">
    <Row className="my-5">
      <Col sm={10} xl={12} className="m-auto">
        <VerifyEmail />
      </Col>
    </Row>
  </Col>;
};
export default ConfirmEmail;
