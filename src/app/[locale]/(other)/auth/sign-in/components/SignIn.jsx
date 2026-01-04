'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import IconTextFormInput from '@/components/form/IconTextFormInput';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ButtonLoader from '@/components/ButtonLoader';
import { loginSchema } from '@/validations/userSchema';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

const LoginForm = () => {
  const t = useTranslations('auth.signin');
  const tValidation = useTranslations('auth.validation');
  const { login, authLoading: loading } = useAuth();
  const params = useParams();
  const locale = params.locale || 'en';

  const { register, handleSubmit, formState: { errors }, control } = useForm({
    resolver: yupResolver(loginSchema(tValidation)),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    },
  });

  const onSubmit = async (data) => {
    try {
      const credentials = {
        email: data.email,
        password: data.password
      };

      await login(credentials);

    } catch (err) {
      console.error('Unexpected login error:', err);
    }
  };

  return (
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
      <div className="mb-4 d-flex justify-content-between">
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
        <div className="text-primary-hover">
          <Link href={`/${locale}/auth/forgot-password`} className="text-primary">
            <u>{t('forgotPassword')}</u>
          </Link>
        </div>
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
    </form>
  );
};

export default LoginForm;