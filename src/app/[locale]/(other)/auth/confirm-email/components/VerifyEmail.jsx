'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useTranslations } from 'next-intl';

const VerifyEmail = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = params.locale || 'en';
  const [token, setToken] = useState('');
  
  // Translations
  const t = useTranslations('auth.confirmEmail');
  
  const { verifyEmailToken, authLoading: loading } = useAuth();

  useEffect(() => {
    // Get token from URL query parameter
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      toast.error(t('noToken'));
    }
  }, [searchParams, t]);

  const handleVerify = async () => {
    if (!token) {
      toast.error(t('tokenMissing'));
      return;
    }

    try {
      const result = await verifyEmailToken(token);
      if (!result.success) {
        console.error('Verification failed:', result.error);
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error(t('verifyError'));
    }
  };

  return (
    <div className="text-center">
      <h2 className="mb-4">{t('title')}</h2>
      <p className="mb-4">{t('subtitle')}</p>
      <div className="d-grid gap-2 col-6 mx-auto">
        <button
          onClick={handleVerify}
          className="btn btn-primary"
          type="button"
          disabled={loading || !token}
        >
          {loading ? t('verifying') : t('verifyButton')}
        </button>
        <button
          onClick={() => router.push(`/${locale}/auth/sign-in`)}
          className="btn btn-outline-secondary"
          type="button"
        >
          {t('backToLogin')}
        </button>
      </div>
    </div>
  );
};

export default VerifyEmail;