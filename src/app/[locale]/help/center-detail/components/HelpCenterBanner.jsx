'use client';

import React from 'react';
import Link from 'next/link';
import { Col, Container, Row } from 'react-bootstrap';
import { useTranslations } from 'next-intl';

const HelpCenterBanner = ({ locale }) => {
  const t = useTranslations('help.centerDetail.banner');

  return (
    <section className="bg-primary bg-opacity-10">
      <Container>
        <Row>
          <Col lg={8} className="mx-auto text-center">
            <h1 className="display-6">{t('title')}</h1>
            <p className="mb-0">{t('subtitle')}</p>
            <form className="bg-body rounded p-2 mt-4">
              <div className="input-group">
                <input
                  className="form-control border-0 me-1"
                  type="text"
                  placeholder={t('searchPlaceholder')}
                />
                <button type="button" className="btn btn-dark mb-0 rounded">
                  {t('searchButton')}
                </button>
              </div>
            </form>
            <Row className="mt-4 align-items-center">
              <Col xs={12}>
                <h5 className="mb-3">{t('popularQuestions')}</h5>
                <div className="list-group list-group-horizontal gap-2 justify-content-center flex-wrap mb-0 border-0">
                  <Link className="btn btn-white btn-sm fw-light" href={`/${locale}/help/center-detail`}>{t('q1')}</Link>
                  <Link className="btn btn-white btn-sm fw-light" href={`/${locale}/help/center-detail`}>{t('q2')}</Link>
                  <Link className="btn btn-white btn-sm fw-light" href={`/${locale}/help/center-detail`}>{t('q3')}</Link>
                  <Link className="btn btn-white btn-sm fw-light" href={`/${locale}/help/center-detail`}>{t('q4')}</Link>
                  <Link className="btn btn-primary-soft btn-sm fw-light" href={`/${locale}/help/center`}>{t('viewAll')}</Link>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default HelpCenterBanner;