'use client';

import IconTextFormInput from '@/components/form/IconTextFormInput';
import { useAuth } from '@/context/AuthContext';
import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';
import { useForm } from 'react-hook-form';
import { FaEnvelope } from 'react-icons/fa';
import { forgetPasswordSchema } from '@/validations/userSchema';
import { useTranslations } from 'next-intl';
import { useParams, useSearchParams } from 'next/navigation';

const ForgotPassword = () => {
  const t = useTranslations('auth.forgotPassword');
  const tValidation = useTranslations('auth.validation');
  const params = useParams();
  const locale = params.locale || 'en';
  const searchParams = useSearchParams();

  // NEW: Read email from URL query param if passed from login page
  const emailFromUrl = searchParams.get('email') || '';

  const { requestPasswordReset, authLoading: loading } = useAuth();

  const { handleSubmit, formState: { errors }, control } = useForm({
    resolver: yupResolver(forgetPasswordSchema(tValidation)),
    defaultValues: {
      // Pre-fill with email from login page if available
      email: emailFromUrl,
    },
  });

  const onSubmit = async (data) => {
    try {
      await requestPasswordReset({ email: data.email, locale });
    } catch (err) {
      console.error('Unexpected password reset error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-4">
        <IconTextFormInput
          control={control}
          icon={FaEnvelope}
          placeholder={t('emailPlaceholder')}
          label={t('emailLabel')}
          name='email'
          error={errors.email?.message}
        />
        {/* NEW: Show hint if email was pre-filled from login page */}
        {emailFromUrl && (
          <div className="form-text text-muted mt-1">
            {t('emailPrefilled')}
          </div>
        )}
      </div>
      <div className="align-items-center">
        <div className="d-grid">
          <button
            className="btn btn-primary mb-0"
            type="submit"
            disabled={loading}
          >
            {loading ? t('resetting') : t('resetButton')}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ForgotPassword;