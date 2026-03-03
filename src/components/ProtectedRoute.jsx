'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { toast } from 'sonner';

export default function ProtectedRoute({
  children,
  allowedRoles = [],
  redirectTo = '/auth/sign-in'
}) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const { locale } = useParams();

  // Check if user has access — role match OR learner with canTeach accessing instructor routes
  const hasAccess = () => {
    if (!allowedRoles.length) return true;

    const role = user?.role?.toLowerCase();

    // Direct role match
    if (allowedRoles.includes(role)) return true;

    // Special case: learner with canTeach can access instructor routes
    if (role === 'learner' && user?.canTeach && allowedRoles.includes('instructor')) return true;

    return false;
  };

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated || !user) {
      toast.error('Please log in to access this page');
      router.push(`/${locale}${redirectTo}`);
      return;
    }

    if (!hasAccess()) {
      toast.error("You don't have permission to access this page");
      if (user?.role?.toLowerCase() === 'instructor') {
        router.push(`/${locale}/instructor/profile`);
      } else if (user?.role?.toLowerCase() === 'learner') {
        router.push(`/${locale}/student/profile`);
      } else {
        router.push(`/${locale}/`);
      }
    }
  }, [loading, isAuthenticated, user, router, redirectTo, allowedRoles, locale]);

  if (loading) return <LoadingSpinner />;
  if (!isAuthenticated || !user) return <LoadingSpinner />;
  if (!hasAccess()) return <LoadingSpinner />;

  return children;
}