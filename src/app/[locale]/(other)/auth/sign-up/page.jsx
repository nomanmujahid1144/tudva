import React from 'react';
import element3Img from '@/assets/images/element/03.svg';
import SingUpForm from './components/SingUpForm';
import Image from 'next/image';
import { FaFacebookF, FaGoogle } from 'react-icons/fa';
import { Col, Row } from 'react-bootstrap';
import Link from 'next/link';
export const metadata = {
  title: 'Sign-Up'
};
const SignUpPage = () => {
  return <Col xs={12} lg={6} className="m-auto">
      <Row className="my-5">
        <Col sm={10} xl={8} className="m-auto">
          <h2>Registe at tudva</h2>
          <p className="lead mb-4">Start your journey with social free studying.</p>
          <SingUpForm />
          <div className="mt-4 text-center">
            <span>Already have an account?<Link href="/auth/sign-in"> Sign in here</Link></span>
          </div>
        </Col>
      </Row>
    </Col>;
};
export default SignUpPage;
