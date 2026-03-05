import { getTranslations } from 'next-intl/server';
import CommunityPage from './components/CommunityPage';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'help.community' });
  return { title: t('metaTitle') };
}

export default function Page() {
  return <CommunityPage />;
}