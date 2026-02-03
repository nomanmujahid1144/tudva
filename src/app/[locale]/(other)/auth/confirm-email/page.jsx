import React from 'react';
import { Col, Row } from 'react-bootstrap';
import VerifyEmail from './components/VerifyEmail';
import { getTranslations } from 'next-intl/server';

// Server Component - use getTranslations
export async function generateMetadata({params}) {
  const { locale } = await params;
  const t = await getTranslations({locale, namespace: 'auth.confirmEmail'});
  
  return {
    title: t('title')
  };
}

export default async function ConfirmEmailPage({params}) {
  const { locale } = await params;
  const t = await getTranslations({locale, namespace: 'auth.confirmEmail'});
  
  return (
    <Col xs={12} lg={6} className="d-flex justify-content-center">
      <Row className="my-5">
        <Col sm={10} xl={12} className="m-auto">
          <VerifyEmail />
        </Col>
      </Row>
    </Col>
  );
}