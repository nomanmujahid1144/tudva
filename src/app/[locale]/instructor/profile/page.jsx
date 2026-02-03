// src/app/[locale]/instructor/profile/page.jsx
import React from 'react';
import InstructorProfilePage from './components/InstructorProfilePage';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({params}) {
  const { locale } = await params;
  const t = await getTranslations({locale, namespace: 'instructor.profile'});
  
  return {
    title: t('title')
  };
}

export default async function ProfilePage({params}) {
  const { locale } = await params;
  
  return <InstructorProfilePage />;
}