// src/app/[locale]/layout.tsx
// This is the MAIN layout that contains ALL your app logic

import dynamic from 'next/dynamic';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Suspense } from 'react';
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from 'sonner';

// Import fonts from parent directory
import { saira, merienda } from '../fonts';
import logoDark from '@/assets/images/logo.svg';
import FallbackLoading from '@/components/FallbackLoading';
import Layout from '../components/layout/page';

// Dynamic imports
const AppProvidersWrapper = dynamic(() => import('@/components/wrappers/AppProvidersWrapper'));

// Import styles
import 'aos/dist/aos.css';
import '@/assets/scss/style.scss';
import '../globals.css';

export const metadata = {
  title: {
    template: '%s | Eduport - LMS, Education and Course Theme',
    default: 'Eduport - LMS, Education and Course Theme'
  }
};

const splashScreenStyles = `
#splash-screen {
  position: fixed;
  top: 50%;
  left: 50%;
  background: white;
  display: flex;
  height: 100%;
  width: 100%;
  transform: translate(-50%, -50%);
  align-items: center;
  justify-content: center;
  z-index: 9999;
  opacity: 1;
  transition: all 0.5s ease;
  overflow: hidden;
}

#splash-screen.remove {
  animation: fadeout 0.3s forwards;
  z-index: 0;
}

@keyframes fadeout {
  to {
    opacity: 0;
    visibility: hidden;
    display: none;
  }
}
`;

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'de' }, { locale: 'hu' }];
}

export default async function LocaleLayout({
  children,
  params
}) {
  // CRITICAL: Await params to get the locale
  const { locale } = await params;
  
  // Validate locale
  const locales = ['en', 'de', 'hu'];
  if (!locale || !locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    <html lang={locale} className={`${saira.className} ${merienda.variable}`}>
      <head>
        <style suppressHydrationWarning>{splashScreenStyles}</style>
      </head>
      <body>
        <div id="splash-screen">
          <Image
            alt="Logo"
            width={355}
            height={83}
            src={logoDark}
            style={{
              height: '10%',
              width: 'auto'
            }}
            priority
          />
        </div>

        <NextTopLoader color="#4697ce" showSpinner={false} />

        <div id="__next_splash">
          <NextIntlClientProvider locale={locale} messages={messages}>
            <AppProvidersWrapper>
              <Suspense fallback={<FallbackLoading />}>
                <Layout>
                  {children}
                  <Toaster position="top-right" richColors />
                </Layout>
              </Suspense>
            </AppProvidersWrapper>
          </NextIntlClientProvider>
        </div>
      </body>
    </html>
  );
}