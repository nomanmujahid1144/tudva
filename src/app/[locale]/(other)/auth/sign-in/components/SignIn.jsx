'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import IconTextFormInput from '@/components/form/IconTextFormInput';
import { useAuth } from '@/context/AuthContext';
import { loginSchema } from '@/validations/userSchema';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const LoginForm = () => {
  const t = useTranslations('auth.signin');
  const tValidation = useTranslations('auth.validation');
  const { login, authLoading: loading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale || 'en';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    control
  } = useForm({
    resolver: yupResolver(loginSchema(tValidation)),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    },
  });

  const onSubmit = async (data) => {
    try {
      await login({ email: data.email, password: data.password });
    } catch (err) {
      console.error('Unexpected login error:', err);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    const currentEmail = watch('email');
    const query = currentEmail ? `?email=${encodeURIComponent(currentEmail)}` : '';
    router.push(`/${locale}/auth/forgot-password${query}`);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <IconTextFormInput
            control={control}
            icon={FaEnvelope}
            placeholder={t('emailPlaceholder')}
            label={t('emailLabel')}
            name='email'
            error={errors.email?.message}
          />
        </div>
        <div className="mb-3">
          <IconTextFormInput
            control={control}
            icon={FaLock}
            placeholder={t('passwordPlaceholder')}
            label={t('passwordLabel')}
            name='password'
            type="password"
            error={errors.password?.message}
          />
        </div>
        <div className="mb-4 d-flex justify-content-between align-items-center">
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="rememberMe"
              {...register('rememberMe')}
            />
            <label className="form-check-label" htmlFor="rememberMe">
              {t('rememberMe')}
            </label>
          </div>
          <a
            href="#"
            onClick={handleForgotPassword}
            className="text-primary text-decoration-underline"
          >
            {t('forgotPassword')}
          </a>
        </div>
        <div className="d-grid">
          <button
            className="btn btn-primary mb-0"
            type="submit"
            disabled={loading}
          >
            {loading ? t('loggingIn') : t('loginButton')}
          </button>
        </div>
      </form >
    </>
  );
};

export default LoginForm;