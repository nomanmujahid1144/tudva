// src/app/[locale]/instructor/edit-profile/page.jsx
import React from 'react';
import EditProfilePage from './components/EditProfilePage';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({params}) {
  const { locale } = await params;
  const t = await getTranslations({locale, namespace: 'instructor.editProfile'});
  
  return {
    title: t('title')
  };
}

export default async function ProfileEditPage({params}) {
  const { locale } = await params;
  
  return <EditProfilePage />;
}