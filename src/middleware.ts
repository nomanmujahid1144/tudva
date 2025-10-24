// import createMiddleware from 'next-intl/middleware';
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';
// import jwt from 'jsonwebtoken';

// const locales = ['en', 'de', 'hu'];
// const defaultLocale = 'en';

// // Create next-intl middleware with ALWAYS showing locale
// const intlMiddleware = createMiddleware({
//   locales,
//   defaultLocale,
//   localePrefix: 'always' // CHANGED: Always show locale in URL
// });

// export default function middleware(request: NextRequest) {
//     const { pathname } = request.nextUrl;

//     // Skip middleware for static files, API routes, and Next.js internals
//     if (
//         pathname.startsWith('/_next') ||
//         pathname.startsWith('/api') ||
//         pathname.startsWith('/static') ||
//         pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|woff|woff2|ttf|eot)$/)
//     ) {
//         return NextResponse.next();
//     }

//     // Check if pathname has locale
//     const pathnameHasLocale = locales.some(
//         (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
//     );

//     // If no locale, redirect to default locale version
//     if (!pathnameHasLocale && pathname !== '/') {
//         const url = new URL(`/${defaultLocale}${pathname}`, request.url);
//         return NextResponse.redirect(url);
//     }

//     // Extract current locale
//     const segments = pathname.split('/').filter(Boolean);
//     const currentLocale = pathnameHasLocale ? segments[0] : defaultLocale;

//     // Get path without locale
//     const pathWithoutLocale = pathnameHasLocale 
//         ? pathname.replace(`/${currentLocale}`, '') || '/'
//         : pathname;

//     // Define public paths
//     const publicPaths = [
//         '/auth/sign-in',
//         '/auth/sign-up',
//         '/auth/forgot-password',
//         '/auth/confirm-email',
//         '/auth/confirm-change-password',
//         '/auth/reset-password',
//         '/auth/callback'
//     ];

//     const isPublicPath = publicPaths.some(path => pathWithoutLocale.startsWith(path));
//     const isLearnerPath = pathWithoutLocale.startsWith('/student');
//     const isInstructorPath = pathWithoutLocale.startsWith('/instructor');

//     // Get auth token
//     const token = request.cookies.get('auth_token')?.value;

//     // Apply intl middleware first
//     const response = intlMiddleware(request);

//     // Auth checks
//     if (!token && !isPublicPath && pathWithoutLocale !== '/') {
//         const signInUrl = new URL(`/${currentLocale}/auth/sign-in`, request.url);
//         return NextResponse.redirect(signInUrl);
//     }

//     if (token && isPublicPath) {
//         const homeUrl = new URL(`/${currentLocale}`, request.url);
//         return NextResponse.redirect(homeUrl);
//     }

//     // Role-based access
//     if (token && (isLearnerPath || isInstructorPath)) {
//         const decoded = jwt.decode(token) as any;

//         if (!decoded || !decoded.role) {
//             const signInUrl = new URL(`/${currentLocale}/auth/sign-in`, request.url);
//             return NextResponse.redirect(signInUrl);
//         }

//         if (decoded.role === 'instructor' && isLearnerPath) {
//             const url = new URL(`/${currentLocale}/instructor/profile`, request.url);
//             return NextResponse.redirect(url);
//         }

//         if (decoded.role === 'learner' && isInstructorPath) {
//             const url = new URL(`/${currentLocale}/student/profile`, request.url);
//             return NextResponse.redirect(url);
//         }
//     }

//     return response;
// }

// export const config = {
//     matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
// };


// src/middleware.ts
import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const locales = ['en', 'de', 'hu'];
const defaultLocale = 'en';

// Create next-intl middleware with ALWAYS showing locale
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always' // ALWAYS show locale in URL
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files, API routes, and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next();
  }

  // Check if pathname has locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // If no locale and not root, redirect to default locale version
  if (!pathnameHasLocale && pathname !== '/') {
    const url = new URL(`/${defaultLocale}${pathname}`, request.url);
    return NextResponse.redirect(url);
  }

  // If root path, redirect to default locale
  if (pathname === '/') {
    const url = new URL(`/${defaultLocale}`, request.url);
    return NextResponse.redirect(url);
  }

  // Extract current locale
  const segments = pathname.split('/').filter(Boolean);
  const currentLocale = pathnameHasLocale ? segments[0] : defaultLocale;

  // Get path without locale
  const pathWithoutLocale = pathnameHasLocale
    ? pathname.replace(`/${currentLocale}`, '') || '/'
    : pathname;

  // Define public paths (without locale prefix)
  const publicPaths = [
    '/auth/sign-in',
    '/auth/sign-up',
    '/auth/forgot-password',
    '/auth/confirm-email',
    '/auth/confirm-change-password',
    '/auth/reset-password',
    '/auth/callback'
  ];

  const isPublicPath = publicPaths.some(path => pathWithoutLocale.startsWith(path));
  const isLearnerPath = pathWithoutLocale.startsWith('/student');
  const isInstructorPath = pathWithoutLocale.startsWith('/instructor');

  // Get auth token
  const token = request.cookies.get('auth_token')?.value;

  // Apply intl middleware first
  const response = intlMiddleware(request);

  // Auth checks
  if (!token && !isPublicPath && pathWithoutLocale !== '/') {
    const signInUrl = new URL(`/${currentLocale}/auth/sign-in`, request.url);
    return NextResponse.redirect(signInUrl);
  }

  if (token && isPublicPath) {
    const homeUrl = new URL(`/${currentLocale}`, request.url);
    return NextResponse.redirect(homeUrl);
  }

  // Role-based access
  if (token && (isLearnerPath || isInstructorPath)) {
    try {
      const decoded = jwt.decode(token) as any;

      if (!decoded || !decoded.role) {
        const signInUrl = new URL(`/${currentLocale}/auth/sign-in`, request.url);
        return NextResponse.redirect(signInUrl);
      }

      if (decoded.role === 'instructor' && isLearnerPath) {
        const url = new URL(`/${currentLocale}/instructor/profile`, request.url);
        return NextResponse.redirect(url);
      }

      if (decoded.role === 'learner' && isInstructorPath) {
        const url = new URL(`/${currentLocale}/student/profile`, request.url);
        return NextResponse.redirect(url);
      }
    } catch (error) {
      console.error('JWT decode error:', error);
      const signInUrl = new URL(`/${currentLocale}/auth/sign-in`, request.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};