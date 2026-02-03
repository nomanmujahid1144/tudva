'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from 'react-hot-toast';

export default function ProtectedRoute({
  children,
  allowedRoles = [], // Empty array means any authenticated user
  redirectTo = '/auth/sign-in'
}) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const { locale } = useParams();

  useEffect(() => {
    // Only take action when loading is complete
    if (loading) return;

    // If not authenticated, redirect to login
    if (!isAuthenticated || !user) {
      console.log('Not authenticated, redirecting to login');
      toast.error('Please log in to access this page');
      router.push(`/${locale}${redirectTo}`);
      return;
    }

    // If authenticated but role check fails, redirect
    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role?.toLowerCase())) {
      console.log(`User role ${user?.role} not allowed for ${allowedRoles.join(', ')}, redirecting`);
      toast.error(`You don't have permission to access this page`);
      // Redirect based on role
      if (user?.role?.toLowerCase() === 'instructor') {
        router.push(`/${locale}/instructor/profile`);
      } else if (user?.role?.toLowerCase() === 'learner') {
        router.push(`/${locale}/student/profile`);
      } else {
        router.push(`/${locale}/`);
      }
    }
  }, [loading, isAuthenticated, user, router, redirectTo, allowedRoles, locale]);

  // Show loading state while authentication is being checked
  if (loading) {
    return <LoadingSpinner />;
  }

  // If not authenticated, show loading spinner while redirect happens
  if (!isAuthenticated || !user) {
    return <LoadingSpinner />;
  }

  // If role check fails, show loading spinner while redirect happens
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role?.toLowerCase())) {
    return <LoadingSpinner />;
  }

  // Render children if authenticated and role check passes
  return children;
}