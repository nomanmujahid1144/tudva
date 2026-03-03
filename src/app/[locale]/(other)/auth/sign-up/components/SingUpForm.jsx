'use client';

import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FaEnvelope, FaLock, FaUser, FaGlobe } from 'react-icons/fa';
import IconTextFormInput from '@/components/form/IconTextFormInput';
import ChoicesFormInput from '@/components/form/ChoicesFormInput';
import { registerSchema, UserRole } from '@/validations/userSchema';
import { useAuth } from '@/context/AuthContext';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';

// Supported locales with labels
const LOCALES = [
  { value: 'en', label: '🇬🇧 English' },
  { value: 'de', label: '🇩🇪 Deutsch' },
  { value: 'hu', label: '🇭🇺 Magyar' },
];

const SignUpForm = () => {
  const t = useTranslations('auth.signup');
  const tValidation = useTranslations('auth.validation');
  const params = useParams();
  const router = useRouter();
  const locale = params.locale || 'en';

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
        // If learnerAndInstructor selected → role is learner + canTeach true
        // If instructor selected → role is instructor + canTeach false
        // If learner selected → role is learner + canTeach false
        role: data.role === 'learner_instructor' ? UserRole.Learner : data.role,
        canTeach: data.role === 'learner_instructor',
        locale,
      };

      await registerUser(userData);
    } catch (err) {
      console.error('Unexpected registration error:', err);
    }
  };

  const handleLocaleChange = (newLocale) => {
    if (newLocale !== locale) {
      router.push(`/${newLocale}/auth/sign-up`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>

      {/* Language Selector */}
      <div className="mb-3">
        <label className="form-label">
          <FaGlobe className="me-2" />
          {t('languageLabel')}
        </label>
        <div className="d-flex gap-2 flex-wrap">
          {LOCALES.map((loc) => (
            <button
              key={loc.value}
              type="button"
              onClick={() => handleLocaleChange(loc.value)}
              className={`btn btn-sm ${locale === loc.value ? 'btn-success' : 'btn-outline-secondary'}`}
            >
              {loc.label}
            </button>
          ))}
        </div>
      </div>

      {/* Full Name */}
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

      {/* Email */}
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

      {/* Password */}
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

      {/* Confirm Password */}
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

      {/* Role Selector — 3 options */}
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
              options={{ removeItemButton: false }}
            >
              <option value="" disabled>{t('selectRole')}</option>
              <option value={UserRole.Learner}>{t('learner')}</option>
              <option value="learner_instructor">{t('learnerAndInstructor')}</option>
              <option value={UserRole.Instructor}>{t('instructor')}</option>
            </ChoicesFormInput>
          )}
        />
        {errors.role && (
          <div className="invalid-feedback d-block">{errors.role.message}</div>
        )}

        {/* Helper text explaining the learner_instructor option */}
        <div className="form-text text-muted mt-1">
          {t('roleHint')}
        </div>
      </div>

      {/* Agreement */}
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
          {errors.agreement && (
            <div className='invalid-feedback d-block'>{errors.agreement.message}</div>
          )}
        </div>
      </div>

      {/* Submit */}
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