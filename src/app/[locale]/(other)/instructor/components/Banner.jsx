'use client'
import React from 'react';
import { usePathname } from 'next/navigation';
import { Col, Container, Row } from 'react-bootstrap';
import { useTranslations } from 'next-intl';

const Banner = () => {
  const pathname = usePathname();
  const t = useTranslations('instructor.course.banner');
  
  // Determine if we're in edit mode
  const isEditMode = pathname.includes('/edit-course');
  
  // Select appropriate translation keys based on mode
  const mode = isEditMode ? 'edit' : 'create';
  
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
              {t(`${mode}.title`)}
            </h1>
            <p className="text-white mb-0">
              {t(`${mode}.description`)}
            </p>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Banner;