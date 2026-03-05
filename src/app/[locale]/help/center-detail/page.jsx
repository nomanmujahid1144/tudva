import { getTranslations } from 'next-intl/server';
import HelpCenterBanner from './components/HelpCenterBanner';
import HelpCenterDetails from './components/HelpCenterDetails';
import PageBanner from '@/app/components/banner/PageBanner';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'help.centerDetail' });
  return { title: t('metaTitle') };
}

const CenterDetailPage = async ({ params }) => {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'help.centerDetail' });

  return (
    <>
      <PageBanner bannerHeadline={t('pageTitle')} />
      <HelpCenterBanner locale={locale} />
      <HelpCenterDetails />
    </>
  );
};

export default CenterDetailPage;