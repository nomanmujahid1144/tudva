import React from 'react';
import error404Img from '@/assets/images/element/404.jpg';
import Image from 'next/image';
import Link from 'next/link';
import { Col, Container, Row } from 'react-bootstrap';
import logo from '@/assets/images/logo.svg';
export const metadata = {
  title: 'Not Found'
};
const NotFound = () => {
  return <>
    <section className="pt-5">
      <Container>
        <Row>
          <Col xs={12} className="text-center">
            <Image
              src={error404Img}
              className="mb-4 h-60vh w-auto"
              alt='error404'
            />
            <div className='d-block justify-content-center mb-3'>
              <Image
                height={150}
                width={250}
                // className="light-mode-item navbar-brand-item w-auto"
                src={logo}
                alt="logo"
              />
            </div>
            <Link href="/" className="btn btn-primary mb-0">Take me to Homepage</Link>
          </Col>
        </Row>
      </Container>
    </section>
  </>;
};
export default NotFound;
