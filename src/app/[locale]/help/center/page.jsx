import { getTranslations } from 'next-intl/server';
import HelpCenterBanner from './components/HelpCenterBanner';
import RecommendedTopics from './components/RecommendedTopics';
import PageBanner from '@/app/components/banner/PageBanner';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'help.center' });
  return { title: t('metaTitle') };
}

const HelpCenterPage = async ({ params }) => {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'help.center' });

  return (
    <>
      <PageBanner bannerHeadline={t('pageTitle')} />
      <HelpCenterBanner locale={locale} />
      <RecommendedTopics locale={locale} />
    </>
  );
};

export default HelpCenterPage;