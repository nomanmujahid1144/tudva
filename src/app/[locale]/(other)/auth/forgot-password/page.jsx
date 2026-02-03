import React from 'react';
import ForgotPassword from './components/ForgotPassword';
import { Col, Row } from 'react-bootstrap';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

// Server Component - use getTranslations
export async function generateMetadata({params}) {
  const { locale } = await params;
  const t = await getTranslations({locale, namespace: 'auth.forgotPassword'});
  
  return {
    title: t('title')
  };
}

export default async function ForgotPasswordPage({params}) {
  const { locale } = await params;
  const t = await getTranslations({locale, namespace: 'auth.forgotPassword'});
  
  return (
    <Col xs={12} lg={6} className="d-flex justify-content-center">
      <Row className="my-5">
        <Col sm={10} xl={12} className="m-auto">
          <h1 className="fs-2">{t('title')}</h1>
          <h5 className="fw-light mb-4">{t('subtitle')}</h5>
          <ForgotPassword />
          <div className="mt-4 text-center">
            <span>
              {t('noAccount')} <Link href={`/${locale}/auth/sign-up`}>{t('signupLink')}</Link>
            </span>
          </div>
        </Col>
      </Row>
    </Col>
  );
}