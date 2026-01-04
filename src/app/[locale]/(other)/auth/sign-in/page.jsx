import React from 'react';
import SignIn from './components/SignIn';
import { Col, Row } from 'react-bootstrap';
import Link from 'next/link';
import {getTranslations} from 'next-intl/server';

// Server Component - use getTranslations with await
export async function generateMetadata({params}) {
  const { locale } = await params;
  const t = await getTranslations({locale, namespace: 'auth.signin'});
  
  return {
    title: t('title')
  };
}

// Server Component - use getTranslations with await
export default async function SignInPage({params}) {
  const { locale } = await params;
  const t = await getTranslations({locale, namespace: 'auth.signin'});
  
  return (
    <Col xs={12} lg={6} className="m-auto">
      <Row className="my-5">
        <Col sm={10} xl={8} className="m-auto">
          <h1 className="fs-2">{t('title')}</h1>
          <p className="lead mb-4">{t('subtitle')}</p>
          <SignIn />
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