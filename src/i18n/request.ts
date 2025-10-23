import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

const locales = ['en', 'de', 'hu'];

export default getRequestConfig(async ({locale}) => {
  // Validate locale
  if (!locale || !locales.includes(locale)) {
    notFound();
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});