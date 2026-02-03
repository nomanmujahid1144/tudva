import { getTranslations } from 'next-intl/server';
import HowItWorksContent from './HowItWorksContent';

// Generate metadata dynamically based on locale
export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'pages.howItWorks.metadata' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

const HowItWorksPage = () => {
  return <HowItWorksContent />;
};

export default HowItWorksPage;