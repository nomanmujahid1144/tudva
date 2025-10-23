import React from 'react';
import SignIn from './components/SignIn';
import { Col, Row } from 'react-bootstrap';
import Link from 'next/link';
import {useTranslations} from 'next-intl';
import {getTranslations} from 'next-intl/server';

export async function generateMetadata({params: {locale}}) {
  const t = await getTranslations({locale, namespace: 'auth.signin'});
  
  return {
    title: t('title')
  };
}

export default function SignInPage({params: {locale}}) {
  return <SignInPageContent locale={locale} />;
}

function SignInPageContent({locale}) {
  const t = useTranslations('auth.signin');

  console.log(t, 'Translation')
  
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