import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const locales = ['en', 'de', 'hu'];
const defaultLocale = 'en';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
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

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale && pathname !== '/') {
    return NextResponse.redirect(new URL(`/${defaultLocale}${pathname}`, request.url));
  }

  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url));
  }

  const segments = pathname.split('/').filter(Boolean);
  const currentLocale = segments[0];
  const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '') || '/';

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

  const token = request.cookies.get('auth_token')?.value;

  if (!token && !isPublicPath && pathWithoutLocale !== '/') {
    return NextResponse.redirect(new URL(`/${currentLocale}/auth/sign-in`, request.url));
  }

  if (token && isPublicPath) {
    return NextResponse.redirect(new URL(`/${currentLocale}`, request.url));
  }

  // Role-based access
  if (token && (isLearnerPath || isInstructorPath)) {
    try {
      const decoded = jwt.decode(token) as any;

      if (!decoded || !decoded.role) {
        return NextResponse.redirect(new URL(`/${currentLocale}/auth/sign-in`, request.url));
      }

      const role = decoded.role as string;
      // NEW: read canTeach from JWT — this is set during login/register
      const canTeach = decoded.canTeach === true;

      // Instructor trying to access student routes — redirect to instructor dashboard
      if (role === 'instructor' && isLearnerPath) {
        return NextResponse.redirect(new URL(`/${currentLocale}/instructor/profile`, request.url));
      }

      // Learner trying to access instructor routes:
      // ALLOW if canTeach is true, otherwise redirect to student profile
      if (role === 'learner' && isInstructorPath) {
        if (!canTeach) {
          return NextResponse.redirect(new URL(`/${currentLocale}/student/profile`, request.url));
        }
        // canTeach === true → fall through and allow access
      }

    } catch (error) {
      console.error('JWT decode error:', error);
      return NextResponse.redirect(new URL(`/${currentLocale}/auth/sign-in`, request.url));
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};