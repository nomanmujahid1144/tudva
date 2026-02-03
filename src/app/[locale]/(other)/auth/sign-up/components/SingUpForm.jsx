'use client';

import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import IconTextFormInput from '@/components/form/IconTextFormInput';
import ChoicesFormInput from '@/components/form/ChoicesFormInput';
import { registerSchema, UserRole } from '@/validations/userSchema';
import { useAuth } from '@/context/AuthContext';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

const SignUpForm = () => {
  // Translations
  const t = useTranslations('auth.signup');
  const tValidation = useTranslations('auth.validation');
  const params = useParams();
  const locale = params.locale || 'en'; // ✅ Get locale


  // Use the register function and loading state from AuthContext
  const { register: registerUser, authLoading: loading } = useAuth();

  const { register, handleSubmit, formState: { errors }, control } = useForm({
    resolver: yupResolver(registerSchema(tValidation)),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: UserRole.Learner,
      agreement: false
    },
  });

  const onSubmit = async (data) => {
    try {
      const userData = {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        role: data.role,
        locale: locale
      };

      await registerUser(userData);
    } catch (err) {
      console.error('Unexpected registration error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-3">
        <IconTextFormInput
          control={control}
          icon={FaUser}
          placeholder={t('fullNamePlaceholder')}
          label={t('fullNameLabel')}
          name='fullName'
          error={errors.fullName?.message}
        />
      </div>
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
      <div className="mb-3">
        <label htmlFor="role" className="form-label">{t('roleLabel')}</label>
        <Controller
          name="role"
          control={control}
          defaultValue={UserRole.Learner}
          render={({ field, fieldState }) => (
            <ChoicesFormInput
              {...field}
              className={`form-control ${fieldState.error ? 'is-invalid' : ''}`}
              allowInput={false}
              options={{
                removeItemButton: false,
              }}
            >
              <option value="" disabled>{t('selectRole')}</option>
              <option value={UserRole.Learner}>{t('learner')}</option>
              <option value={UserRole.Instructor}>{t('instructor')}</option>
            </ChoicesFormInput>
          )}
        />
        {errors.role && <div className="invalid-feedback d-block">{errors.role.message}</div>}
      </div>
      <div className="mb-3">
        <div className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id="agreement"
            {...register('agreement')}
          />
          <label className="form-check-label" htmlFor="agreement">
            {t('agreement')} <a href="#">{t('termsOfService')}</a>
          </label>
          {errors.agreement && <div className='invalid-feedback d-block'>{errors.agreement.message}</div>}
        </div>
      </div>
      <div className="d-grid">
        <button
          className="btn btn-primary mb-0"
          type="submit"
          disabled={loading}
        >
          {loading ? t('signingUp') : t('signupButton')}
        </button>
      </div>
    </form>
  );
};

export default SignUpForm;