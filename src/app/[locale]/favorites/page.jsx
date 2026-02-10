// src/app/[locale]/favorites/page.js
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import PageBanner from "../../components/banner/PageBanner";
import FavoriteCourses from './components/FavoriteCourses';

export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'favorites.page' });
  
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    keywords: t('metaKeywords')
  };
}

const FavoritesPage = () => {
  const t = useTranslations('favorites.page');

  return (
    <>
      <PageBanner 
        bannerHeadline={t('bannerHeadline')}
        bannerSubtext={t('bannerSubtext')}
        showBreadcrumb={true}
        breadcrumbItems={[
          { name: "Home", link: "/" },
          { name: t('bannerHeadline'), link: "/favorites" }
        ]}
      />
      <FavoriteCourses />
    </>
  );
};

export default FavoritesPage;