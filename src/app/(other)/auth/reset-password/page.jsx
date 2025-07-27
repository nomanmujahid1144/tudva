import React from 'react';
import ResetPassword from './components/ResetPassword';
import { Col, Row } from 'react-bootstrap';
import Link from 'next/link';
export const metadata = {
  title: 'Sign-In'
};
const ResetPasswordComponent = () => {
  return <Col xs={12} lg={6} className="m-auto">
      <Row className="my-5">
        <Col sm={10} xl={8} className="m-auto">
          <h1 className="fs-2">Change Your Password</h1>
          <p className="lead mb-4">Please enter your new password and confirm it below.</p>
          <ResetPassword />
          <div className="mt-4 text-center">
            <span>Don&apos;t have an account? <Link href="/auth/sign-up">Signup here</Link></span>
          </div>
        </Col>
      </Row>
    </Col>;
};
export default ResetPasswordComponent;
