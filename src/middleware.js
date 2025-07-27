import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Helper function to decode JWT without verification
// (for middleware which can't access environment variables easily)
function decodeJWT(token) {
    try {
        // This only decodes without verification - for middleware purposes
        return jwt.decode(token);
    } catch (error) {
        console.error('JWT decode error:', error);
        return null;
    }
}

export async function middleware(request) {
    const path = request.nextUrl.pathname;

    // Define public paths that don't require authentication
    const isPublicPath =
        path === '/auth/sign-in' ||
        path === '/auth/sign-up' ||
        path === '/auth/forgot-password' ||
        path === '/auth/confirm-email' ||
        path === '/auth/confirm-change-password' ||
        path === '/auth/reset-password' ||
        path === '/auth/callback';

    // Define role-specific paths
    const isLearnerPath = path.startsWith('/student');
    const isInstructorPath = path.startsWith('/instructor');

    // Get auth token from cookies
    const token = request.cookies.get('auth_token')?.value;

    // If no token and trying to access protected route, redirect to login
    if (!token && !isPublicPath) {
        return NextResponse.redirect(new URL('/auth/sign-in', request.url));
    }

    // If has token and trying to access auth pages, redirect to home
    // (already logged in users shouldn't see login/register pages)
    if (token && isPublicPath) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // For protected routes, check role-based access
    if (token && (isLearnerPath || isInstructorPath)) {
        const decoded = decodeJWT(token);

        if (!decoded || !decoded.role) {
            // Invalid token structure, redirect to login
            return NextResponse.redirect(new URL('/auth/sign-in', request.url));
        }

        // Instructor trying to access learner routes
        if (decoded.role === 'instructor' && isLearnerPath) {
            return NextResponse.redirect(new URL('/instructor/profile', request.url));
        }

        // Learner trying to access instructor routes
        if (decoded.role === 'learner' && isInstructorPath) {
            return NextResponse.redirect(new URL('/student/profile', request.url));
        }
    }

    // Allow the request to proceed
    return NextResponse.next();
}

// Define which paths the middleware should run on
export const config = {
    matcher: [
        '/',
        '/auth/:path*',
        '/student/:path*',
        '/instructor/:path*',
        '/dashboard/:path*'
    ]
};