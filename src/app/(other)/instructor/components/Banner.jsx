'use client'
import React from 'react';
import { usePathname } from 'next/navigation';
import { Col, Container, Row } from 'react-bootstrap';

const Banner = () => {
  const pathname = usePathname();
  
  // Determine if we're in edit mode
  const isEditMode = pathname.includes('/edit-course');
  
  return (
    <section 
      className="py-0 bg-blue h-100px align-items-center d-flex h-200px rounded-0" 
      style={{
        background: 'url(assets/images/pattern/04.png) no-repeat center center',
        backgroundSize: 'cover'
      }}
    >
      <Container>
        <Row>
          <Col xs={12} className="text-center">
            <h1 className="text-white">
              {isEditMode ? 'Edit Your Course' : 'Create New Course'}
            </h1>
            <p className="text-white mb-0">
              {isEditMode ? (
                <>
                  Update your course details and content. Make sure all information is accurate before saving changes.
                </>
              ) : (
                <>
                  Read our <a href="#" className="text-white"><u>&quot;Before you create a course&quot;</u></a> article before submitting!
                </>
              )}
            </p>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Banner;