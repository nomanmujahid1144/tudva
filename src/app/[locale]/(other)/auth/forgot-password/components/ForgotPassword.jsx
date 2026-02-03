'use client';

import IconTextFormInput from '@/components/form/IconTextFormInput';
import { useAuth } from '@/context/AuthContext';
import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';
import { useForm } from 'react-hook-form';
import { FaEnvelope } from 'react-icons/fa';
import { forgetPasswordSchema } from '@/validations/userSchema';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

const ForgotPassword = () => {
  // Translations
  const t = useTranslations('auth.forgotPassword');
  const tValidation = useTranslations('auth.validation');
  const params = useParams();
  const locale = params.locale || 'en';

  const { requestPasswordReset, authLoading: loading } = useAuth();

  const { handleSubmit, formState: { errors }, control } = useForm({
    resolver: yupResolver(forgetPasswordSchema(tValidation)),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      await requestPasswordReset({email: data.email, locale});
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
      </div>
      <div className="align-items-center">
        <div className="d-grid">
          <button className="btn btn-primary mb-0" type="submit" disabled={loading}>
            {loading ? t('resetting') : t('resetButton')}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ForgotPassword;