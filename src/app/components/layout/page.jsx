// src/app/components/layout/page.jsx
'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import TopNavigationBar from '../navbar/TopNavigationBar';
import Footer from '../footer/Footer';

// Paths where header/footer should NOT be shown (without locale prefix)
const excludedHeaderFooter = [
  '/auth/sign-up',
  '/auth/sign-in',
  '/auth/forgot-password',
  '/auth/confirm-email',
  '/auth/confirm-change-password',
  '/auth/reset-password',
  '/auth/callback',
];

const Layout = ({ children }) => {
  const pathname = usePathname();
  
  // Remove locale prefix from pathname for comparison
  // pathname will be like /en/auth/sign-in, we need /auth/sign-in
  const pathWithoutLocale = pathname.replace(/^\/(en|de|hu)/, '') || '/';
  
  const shouldShowHeaderFooter = !excludedHeaderFooter.includes(pathWithoutLocale);

  return (
    <>
      {shouldShowHeaderFooter && <TopNavigationBar />}
      <main>{children}</main>
      {shouldShowHeaderFooter && <Footer />}
    </>
  );
};

export default Layout;