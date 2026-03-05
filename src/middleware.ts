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

  // ─────────────────────────────────────────────────────────────
  // ROUTE CONFIGURATION — edit these to protect/unprotect routes
  // ─────────────────────────────────────────────────────────────

  // Auth pages — logged-in users get redirected AWAY from these
  const authPaths = [
    '/auth/sign-in',
    '/auth/sign-up',
    '/auth/forgot-password',
    '/auth/confirm-email',
    '/auth/confirm-change-password',
    '/auth/reset-password',
    '/auth/callback',
  ];

  // Publicly accessible — no login required
  const publicPaths = [
    ...authPaths,
    '/courses',
    '/help',
    '/pages',
    '/why-tudva',
    '/how-it-works',
    '/our-mission',
    '/become-teacher',
    '/learning-room',
    '/get-started',
    '/faq',
    '/contact-us',
  ];

  // Learner-only routes
  const learnerPaths = [
    '/student',
    '/my-learning',
    '/favorites',
  ];

  // Instructor-only routes
  const instructorPaths = [
    '/instructor',
  ];

  // Any logged-in user (no role restriction)
  const authenticatedPaths = [
    '/live-sessions',
    '/my-profile',
    '/notifications',
    '/settings',
  ];

  // ─────────────────────────────────────────────────────────────

  const isAuthPath = authPaths.some(p => pathWithoutLocale.startsWith(p));
  const isPublicPath = publicPaths.some(p => pathWithoutLocale.startsWith(p));
  const isLearnerPath = learnerPaths.some(p => pathWithoutLocale.startsWith(p));
  const isInstructorPath = instructorPaths.some(p => pathWithoutLocale.startsWith(p));
  const isAuthenticatedPath = authenticatedPaths.some(p => pathWithoutLocale.startsWith(p));

  const token = request.cookies.get('auth_token')?.value;

  // Not logged in + protected route → sign in
  if (!token && !isPublicPath && pathWithoutLocale !== '/') {
    return NextResponse.redirect(new URL(`/${currentLocale}/auth/sign-in`, request.url));
  }

  // Logged in + auth page → home
  if (token && isAuthPath) {
    return NextResponse.redirect(new URL(`/${currentLocale}`, request.url));
  }

  // Role-based access — only decode JWT when needed
  if (token && (isLearnerPath || isInstructorPath || isAuthenticatedPath)) {
    try {
      const decoded = jwt.decode(token) as any;

      if (!decoded || !decoded.role) {
        return NextResponse.redirect(new URL(`/${currentLocale}/auth/sign-in`, request.url));
      }

      const role = decoded.role as string;
      const canTeach = decoded.canTeach === true;

      // Instructor trying to access student/learner routes → instructor dashboard
      if (role === 'instructor' && isLearnerPath) {
        return NextResponse.redirect(new URL(`/${currentLocale}/instructor/profile`, request.url));
      }

      // Learner trying to access instructor routes → block unless canTeach
      if (role === 'learner' && isInstructorPath && !canTeach) {
        return NextResponse.redirect(new URL(`/${currentLocale}/student/profile`, request.url));
      }

      // authenticatedPaths — any valid logged-in user passes through, no extra check needed

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