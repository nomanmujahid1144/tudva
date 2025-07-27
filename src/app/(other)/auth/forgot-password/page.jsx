import React from 'react';
import ForgotPassword from './components/ForgotPassword';
import { Col, Row } from 'react-bootstrap';
export const metadata = {
  title: 'Forgot-Password'
};
const ForgotPasswordPage = () => {
  return <Col xs={12} lg={6} className="d-flex justify-content-center">
    <Row className="my-5">
      <Col sm={10} xl={12} className="m-auto">
        <h1 className="fs-2">Forgot Password?</h1>
        <h5 className="fw-light mb-4">To receive a new password, enter your email address below.</h5>
        <ForgotPassword />
      </Col>
    </Row>
  </Col>;
};
export default ForgotPasswordPage;
