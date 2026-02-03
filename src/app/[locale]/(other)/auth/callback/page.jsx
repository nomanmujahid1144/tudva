import React from 'react';
import AuthCallback from './components/AuthCallback';
import { getTranslations } from 'next-intl/server';

// Server Component - use getTranslations
export async function generateMetadata({params}) {
  const { locale } = await params;
  const t = await getTranslations({locale, namespace: 'auth.callback'});
  
  return {
    title: t('redirecting')
  };
}

export default async function AuthCallbackPage({params}) {
  const { locale } = await params;
  
  return <AuthCallback />;
}