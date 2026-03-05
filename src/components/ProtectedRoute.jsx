'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

const hasAccess = (user, allowedRoles) => {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  if (allowedRoles.includes(user?.role?.toLowerCase())) return true;
  // Dual-role: learner with canTeach can access instructor routes
  if (user?.canTeach && allowedRoles.includes('instructor')) return true;
  return false;
};

export default function ProtectedRoute({
  children,
  allowedRoles = [],
  redirectTo = '/auth/sign-in'
}) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const { locale } = useParams();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated || !user) {
      router.replace(`/${locale}${redirectTo}`);
      return;
    }

    if (!hasAccess(user, allowedRoles)) {
      const role = user?.role?.toLowerCase();
      if (role === 'instructor') {
        router.replace(`/${locale}/instructor/profile`);
      } else if (role === 'learner') {
        router.replace(`/${locale}/student/profile`);
      } else {
        router.replace(`/${locale}/`);
      }
    }
  }, [loading, isAuthenticated, user, router, redirectTo, allowedRoles, locale]);

  // Still loading auth state
  if (loading) return <LoadingSpinner />;

  // Not authenticated — show spinner while redirect fires
  if (!isAuthenticated || !user) return <LoadingSpinner />;

  // Wrong role — show spinner while redirect fires
  if (!hasAccess(user, allowedRoles)) return <LoadingSpinner />;

  return children;
}