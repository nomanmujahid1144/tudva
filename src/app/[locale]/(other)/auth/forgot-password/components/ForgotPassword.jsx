'use client';

import IconTextFormInput from '@/components/form/IconTextFormInput';
import { useAuth } from '@/context/AuthContext';
import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';
import { useForm } from 'react-hook-form';
import { FaEnvelope } from 'react-icons/fa';
import { forgetPasswordSchema } from '@/validations/userSchema';

const ForgotPassword = () => {

  const { requestPasswordReset, authLoading: loading } = useAuth();

  const { handleSubmit, formState: { errors }, control } = useForm({
    resolver: yupResolver(forgetPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      const email = {
        email: data.email
      };

      await requestPasswordReset(email.email);

    } catch (err) {
      console.error('Unexpected login error:', err);
    }
  };



  return <form onSubmit={handleSubmit(onSubmit)}>
    <div className="mb-4">
      <IconTextFormInput
        control={control}
        icon={FaEnvelope}
        placeholder='E-mail'
        label='Email address *'
        name='email'
        error={errors.email?.message}
      />
    </div>
    <div className="align-items-center">
      <div className="d-grid">
        <button className="btn btn-primary mb-0" type="submit" disabled={loading}>
          {loading ? 'Reset Password...' : 'Reset Password'}
        </button>
      </div>
    </div>
  </form>;
};
export default ForgotPassword;
