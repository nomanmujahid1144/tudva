import React from 'react';
import ResetPassword from './components/ResetPassword';
import { Col, Row } from 'react-bootstrap';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

// Server Component - use getTranslations
export async function generateMetadata({params}) {
  const { locale } = await params;
  const t = await getTranslations({locale, namespace: 'auth.resetPassword'});
  
  return {
    title: t('title')
  };
}

export default async function ResetPasswordPage({params}) {
  const { locale } = await params;
  const t = await getTranslations({locale, namespace: 'auth.resetPassword'});
  
  return (
    <Col xs={12} lg={6} className="m-auto">
      <Row className="my-5">
        <Col sm={10} xl={8} className="m-auto">
          <h1 className="fs-2">{t('title')}</h1>
          <p className="lead mb-4">{t('subtitle')}</p>
          <ResetPassword />
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