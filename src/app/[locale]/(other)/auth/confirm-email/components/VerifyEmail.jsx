'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useAuth } from '@/context/AuthContext';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

const VerifyEmail = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = params.locale || 'en';

  // 'loading' | 'success' | 'already_verified' | 'error'
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const t = useTranslations('auth.confirmEmail');
  const { verifyEmailToken } = useAuth();

  useEffect(() => {
    const statusFromUrl = searchParams.get('status');
    const messageFromUrl = searchParams.get('message');
    const tokenFromUrl = searchParams.get('token');

    // Case 1 — came via GET redirect from API (new flow)
    if (statusFromUrl) {
      if (statusFromUrl === 'success') {
        setStatus('success');
      } else if (statusFromUrl === 'already_verified') {
        setStatus('already_verified');
      } else {
        setStatus('error');
        setErrorMessage(messageFromUrl || t('verifyError'));
      }
      return;
    }

    // Case 2 — came with just a token (old flow fallback)
    if (tokenFromUrl) {
      handleAutoVerify(tokenFromUrl);
      return;
    }

    // Case 3 — nothing in URL
    setStatus('error');
    setErrorMessage(t('noToken'));
  }, [searchParams]);

  const handleAutoVerify = async (token) => {
    try {
      const result = await verifyEmailToken(token);
      if (result?.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(result?.error || t('verifyError'));
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage(t('verifyError'));
    }
  };

  // ─── Loading ─────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success mb-4" role="status">
          <span className="visually-hidden">{t('verifying')}</span>
        </div>
        <h4 className="fw-light">{t('verifyingTitle')}</h4>
        <p className="text-muted">{t('verifyingSubtitle')}</p>
      </div>
    );
  }

  // ─── Error ───────────────────────────────────
  if (status === 'error') {
    return (
      <div className="text-center py-5">
        <div className="mb-4" style={{ fontSize: '56px' }}>❌</div>
        <h3 className="fw-semibold text-danger mb-3">{t('errorTitle')}</h3>
        <p className="text-muted mb-2">{errorMessage}</p>
        <p className="text-muted small mb-4">{t('errorHint')}</p>
        <div className="d-flex gap-3 justify-content-center flex-wrap">
          <Link href={`/${locale}/auth/sign-up`} className="btn btn-success px-4">
            {t('registerAgain')}
          </Link>
          <Link href={`/${locale}/auth/sign-in`} className="btn btn-outline-secondary px-4">
            {t('backToLogin')}
          </Link>
        </div>
      </div>
    );
  }

  // ─── Already Verified ─────────────────────────
  if (status === 'already_verified') {
    return (
      <div className="text-center py-5">
        <div className="mb-4" style={{ fontSize: '56px' }}>✅</div>
        <h3 className="fw-semibold mb-3">{t('alreadyVerifiedTitle')}</h3>
        <p className="text-muted mb-4">{t('alreadyVerifiedSubtitle')}</p>
        <Link href={`/${locale}/auth/sign-in`} className="btn btn-success px-4">
          {t('goToLogin')}
        </Link>
      </div>
    );
  }

  // ─── Success ─────────────────────────────────
  return (
    <div className="text-center py-5">
      <div className="mb-4" style={{ fontSize: '56px' }}>🎉</div>
      <h3 className="fw-semibold mb-3">{t('successTitle')}</h3>
      <p className="text-muted mb-4">{t('successSubtitle')}</p>

      {/* Getting Started Steps */}
      <div className="text-start mx-auto mb-4" style={{ maxWidth: '380px' }}>
        <div className="d-flex align-items-start mb-3">
          <span
            className="badge bg-success rounded-circle me-3 mt-1 d-flex align-items-center justify-content-center"
            style={{ minWidth: '28px', height: '28px', fontSize: '13px' }}
          >1</span>
          <div>
            <p className="mb-0 fw-semibold">{t('step1Title')}</p>
            <p className="mb-0 text-muted small">{t('step1Desc')}</p>
          </div>
        </div>
        <div className="d-flex align-items-start mb-3">
          <span
            className="badge bg-success rounded-circle me-3 mt-1 d-flex align-items-center justify-content-center"
            style={{ minWidth: '28px', height: '28px', fontSize: '13px' }}
          >2</span>
          <div>
            <p className="mb-0 fw-semibold">{t('step2Title')}</p>
            <p className="mb-0 text-muted small">{t('step2Desc')}</p>
          </div>
        </div>
        <div className="d-flex align-items-start mb-3">
          <span
            className="badge bg-success rounded-circle me-3 mt-1 d-flex align-items-center justify-content-center"
            style={{ minWidth: '28px', height: '28px', fontSize: '13px' }}
          >3</span>
          <div>
            <p className="mb-0 fw-semibold">{t('step3Title')}</p>
            <p className="mb-0 text-muted small">{t('step3Desc')}</p>
          </div>
        </div>
      </div>

      <Link href={`/${locale}/auth/sign-in`} className="btn btn-success px-5">
        {t('goToLogin')}
      </Link>
    </div>
  );
};

export default VerifyEmail;