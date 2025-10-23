'use client'

import React from 'react';
import authImage from '@/assets/images/auth/auth-image.png';
import { Col, Container, Row } from 'react-bootstrap';
import { usePathname } from 'next/navigation';

const excludedHeaderFooter = [
  '/auth/callback',
];


const layout = ({ children }) => {

  const pathname = usePathname();
  const shouldShowImage = !excludedHeaderFooter.includes(pathname);



  return <main>
    <section className="p-0 d-flex align-items-center position-relative overflow-hidden">
      <Container fluid>
        <Row>
          {shouldShowImage && (
            <Col
              xs={12}
              lg={6}
              className="d-md-flex align-items-center justify-content-center bg-primary bg-opacity-10 vh-lg-100"
              style={{
                backgroundImage: `url(${authImage.src})`, // Use authImage.src
                backgroundSize: 'cover',         // Cover the entire area
                backgroundPosition: 'center',    // Center the image
                backgroundRepeat: 'no-repeat',    // Don't repeat the image
              }}
            >
              <div className="p-3 p-lg-5">
                {/* Content that will appear *over* the background image */}
              </div>
            </Col>
          )}
          {children}
        </Row>
      </Container>
    </section>
  </main>;
};
export default layout;
