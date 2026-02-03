// src/app/[locale]/instructor/manage-course/page.jsx
import React from 'react';
import ManageCoursePage from './components/ManageCoursePage';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({params}) {
  const { locale } = await params;
  const t = await getTranslations({locale, namespace: 'instructor.manageCourse'});
  
  return {
    title: t('title')
  };
}

export default async function ManageCoursePageWrapper({params}) {
  const { locale } = await params;
  
  return <ManageCoursePage />;
}