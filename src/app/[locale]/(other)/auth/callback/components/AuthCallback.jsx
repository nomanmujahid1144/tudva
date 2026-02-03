'use client';

import { useRouter, useParams } from "next/navigation";
import { LoadingRotating } from "@/components/loader/LoadingRotating";
import { useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useTranslations } from 'next-intl';

export default function AuthCallback() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || 'en';
  const { isAuthenticated } = useAuth();
  
  // Translations
  const t = useTranslations('auth.callback');

  useEffect(() => {
    // Check if user is authenticated using AuthContext
    if (isAuthenticated) {
      setTimeout(() => {
        router.push(`/${locale}`);
      }, 1000);
    } else {
      // If not authenticated, redirect to login
      toast.error(t('loginFailed'));
      setTimeout(() => {
        router.push(`/${locale}/auth/sign-in`);
      }, 1000);
    }

    // Set a maximum timeout for the callback page
    const timeoutId = setTimeout(() => {
      console.log('Auth callback timed out, redirecting to home');
      router.push(`/${locale}`);
    }, 5000); // 5 seconds max

    return () => clearTimeout(timeoutId);
  }, [router, isAuthenticated, locale, t]);

  return (
    <div className="my-5 vh-100 w-100 d-flex justify-content-center text-center">
      <div className="flex flex-col align-items-center gap-2">
        <LoadingRotating />
        <h3 className="text-xl font-semibold">{t('redirecting')}</h3>
        <p>{t('pleaseWait')}</p>
      </div>
    </div>
  );
}