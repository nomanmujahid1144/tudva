import { getTranslations } from 'next-intl/server';
import FirstStepsPage from './components/FirstStepsPage';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'help.firstSteps' });
  return { title: t('metaTitle') };
}

export default function Page() {
  return <FirstStepsPage />;
}