'use client';

import { Suspense, useEffect } from 'react';
import FallbackLoading from '../FallbackLoading';
import dynamic from 'next/dynamic';
import Aos from 'aos';
import { AuthProvider } from '@/context/AuthContext';
const LayoutProvider = dynamic(() => import('@/context/useLayoutContext').then(mod => mod.LayoutProvider), {
  ssr: false
});
const AppProvidersWrapper = ({
  children
}) => {
  useEffect(() => {
    Aos.init();

    // Force remove splash screen after a short delay
    const timer = setTimeout(() => {
      const splashScreen = document.querySelector('#splash-screen');
      if (splashScreen) {
        splashScreen.classList.add('remove');

        // As a fallback, completely hide it after animation
        setTimeout(() => {
          if (splashScreen) {
            splashScreen.style.display = 'none';
          }
        }, 1000);
      }
    }, 500);

    // Original logic
    if (document) {
      const e = document.querySelector('#__next_splash');
      if (e?.hasChildNodes()) {
        document.querySelector('#splash-screen')?.classList.add('remove');
      }
      e?.addEventListener('DOMNodeInserted', () => {
        document.querySelector('#splash-screen')?.classList.add('remove');
      });
    }

    return () => clearTimeout(timer);
  }, []);
  return (
    <LayoutProvider>
      <AuthProvider>
          <Suspense fallback={<FallbackLoading />}>{children}</Suspense>
      </AuthProvider>
    </LayoutProvider>
  );
};
export default AppProvidersWrapper;
