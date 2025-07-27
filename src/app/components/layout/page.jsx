// src/app/components/layout/page.jsx
'use client'; // IMPORTANT: Client Component

import React from 'react';
import { usePathname } from 'next/navigation';
import TopNavigationBar from '../navbar/TopNavigationBar'; // Adjust path if needed
import Footer from '../footer/Footer';

const excludedHeaderFooter = [
    '/auth/sign-up',
    '/auth/sign-in',
    '/auth/forgot-password',
    '/auth/confirm-email',
    '/auth/confirm-change-password',
    '/auth/reset-password',
    '/auth/callback',
];

const Layout = ({ children }) => { // Receive children as a prop
    const pathname = usePathname();
    const shouldShowHeaderFooter = !excludedHeaderFooter.includes(pathname);

    return (
        <>
            {shouldShowHeaderFooter && <TopNavigationBar />}
            <main>
                {children}
            </main>
            {shouldShowHeaderFooter && <Footer />}
        </>
    );
};

export default Layout;