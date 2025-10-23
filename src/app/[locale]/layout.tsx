import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import '@/app/globals.css';

// Import any providers or components you need
import { AuthProvider } from '@/context/AuthContext';
import { LayoutProvider } from '@/context/useLayoutContext';
import { Toaster } from 'react-hot-toast';

export function generateStaticParams() {
  return [{locale: 'en'}, {locale: 'de'}, {locale: 'hu'}];
}

export default async function LocaleLayout({
  children,
  params: {locale}
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  // Validate locale
  const locales = ['en', 'de', 'hu'];
  if (!locales.includes(locale)) {
    notFound();
  }

  // Fetch messages for the locale
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <LayoutProvider>
              <Toaster position="top-right" />
              {children}
            </LayoutProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}