import React from 'react';
import SingUpForm from './components/SingUpForm';
import { Col, Row } from 'react-bootstrap';
import Link from 'next/link';
import {getTranslations} from 'next-intl/server';

// Server Component - use getTranslations
export async function generateMetadata({params}) {
  const { locale } = await params;
  const t = await getTranslations({locale, namespace: 'auth.signup'});
  
  return {
    title: t('title')
  };
}

export default async function SignUpPage({params}) {
  const { locale } = await params;
  const t = await getTranslations({locale, namespace: 'auth.signup'});
  
  return (
    <Col xs={12} lg={6} className="m-auto">
      <Row className="my-5">
        <Col sm={10} xl={8} className="m-auto">
          <h2>{t('title')}</h2>
          <p className="lead mb-4">{t('subtitle')}</p>
          <SingUpForm />
          <div className="mt-4 text-center">
            <span>
              {t('haveAccount')} <Link href={`/${locale}/auth/sign-in`}>{t('signinLink')}</Link>
            </span>
          </div>
        </Col>
      </Row>
    </Col>
  );
}