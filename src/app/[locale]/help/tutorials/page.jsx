import { getTranslations } from 'next-intl/server';
import TutorialsPage from './components/TutorialsPage';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'help.tutorials' });
  return { title: t('metaTitle') };
}

export default function Page() {
  return <TutorialsPage />;
}