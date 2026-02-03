"use client";

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FaLock } from 'react-icons/fa';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import IconTextFormInput from '@/components/form/IconTextFormInput';
import { toast } from "sonner";
import { resetPasswordSchema } from '@/validations/userSchema';
import { useAuth } from '@/context/AuthContext';
import { useTranslations } from 'next-intl';

const ResetPassword = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = params.locale || 'en';
  const [token, setToken] = useState('');
  
  // Translations
  const t = useTranslations('auth.resetPassword');
  const tValidation = useTranslations('auth.validation');
  
  const { resetPassword, authLoading: loading } = useAuth();

  useEffect(() => {
    // Get token from URL query parameter
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      toast.error(t('tokenMissing'));
      router.push(`/${locale}/auth/forgot-password`);
    }
  }, [searchParams, router, locale, t]);

  const { handleSubmit, formState: { errors }, control } = useForm({
    resolver: yupResolver(resetPasswordSchema(tValidation)),
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data) => {
    if (!token) {
      toast.error(t('tokenMissing'));
      return;
    }

    try {
      const credentials = {
        token: token,
        newPassword: data.password,
        locale: locale
      };

      await resetPassword(credentials);
      // Success handling is done in AuthContext
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error(t('resetError'));
    }
  };

  if (!token) {
    return <div className="alert alert-danger">{t('tokenError')}</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-3">
        <IconTextFormInput
          control={control}
          icon={FaLock}
          placeholder={t('newPasswordPlaceholder')}
          label={t('newPasswordLabel')}
          name='password'
          type="password"
          error={errors.password?.message}
        />
      </div>
      <div className="mb-3">
        <IconTextFormInput
          control={control}
          icon={FaLock}
          placeholder={t('confirmPasswordPlaceholder')}
          label={t('confirmPasswordLabel')}
          name='confirmPassword'
          type="password"
          error={errors.confirmPassword?.message}
        />
      </div>
      <div className="d-grid">
        <button className="btn btn-primary mb-0" type="submit" disabled={loading}>
          {loading ? t('resetting') : t('resetButton')}
        </button>
      </div>
    </form>
  );
};

export default ResetPassword;