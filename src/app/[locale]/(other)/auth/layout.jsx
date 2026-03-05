'use client'

import React from 'react';
import authImage from '@/assets/images/auth/auth-image.png';
import { Col, Container, Row } from 'react-bootstrap';
import { usePathname } from 'next/navigation';
import AuthNavigationBar from '@/app/components/navbar/AuthNavigationBar';

const excludedHeaderFooter = [
  '/auth/callback',
];

const layout = ({ children }) => {
  const pathname = usePathname();
  const shouldShowImage = !excludedHeaderFooter.some(path => pathname.includes(path));

  return (
    <>
      <AuthNavigationBar />
      <section className="p-0 min-vh-100 d-flex align-items-center position-relative overflow-hidden">
        <Container fluid>
          <Row>
            {shouldShowImage && (
              <Col
                xs={12}
                lg={6}
                className="d-md-flex align-items-center justify-content-center bg-primary bg-opacity-10 vh-lg-100"
                style={{
                  backgroundImage: `url(${authImage.src})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
              >
                <div className="p-3 p-lg-5" />
              </Col>
            )}
            {children}
          </Row>
        </Container>
      </section>
    </>
  );
};

export default layout;