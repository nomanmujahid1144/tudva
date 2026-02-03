"use client";

import { Col, Container, Row } from "react-bootstrap";
import Image from "next/image";
import { useTranslations } from "next-intl";
import element6 from '@/assets/images/home-banner-characters/11.jpg';

const Hero = () => {
  const t = useTranslations('home.hero');

  return (
    <section className="position-relative pb-0 pb-sm-5 mt-lg-5">
      <figure className="ms-5 position-absolute top-0 start-0">
        <svg width="29px" height="29px">
          <path className="fill-orange opacity-4" d="M29.004,14.502 C29.004,22.512 22.511,29.004 14.502,29.004 C6.492,29.004 -0.001,22.512 -0.001,14.502 C-0.001,6.492 6.492,-0.001 14.502,-0.001 C22.511,-0.001 29.004,6.492 29.004,14.502 Z" />
        </svg>
      </figure>
      <Container>
        <Row className="align-items-center justify-content-xl-between g-4 g-md-5">
          <Col lg={6} xl={6} className="position-relative z-index-1 text-center text-lg-start mb-2 mb-xl-0">
            <h6 className="mb-3 font-base bg-primary bg-opacity-10 text-primary py-2 px-4 rounded-2 d-inline-block">
              {t('badge')}
            </h6>
            <h1 className="mb-4 display-5 text-right d-block text-center">
              <span className="me-5r">{t('title.line1')}</span>
              <span className="d-block text-center">{t('title.line2')}</span>
              <span className="d-block text-center">{t('title.line3')}</span>
            </h1>
            <p className="mb-3">
              {t('description')}
            </p>
          </Col>
          <Col lg={6} xl={6} className="text-center position-relative">
            <div className="position-relative d-flex justify-content-center">
              <Image src={element6} className="w-75 mb-1 bg-transparent shadow" alt="element" />
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Hero;