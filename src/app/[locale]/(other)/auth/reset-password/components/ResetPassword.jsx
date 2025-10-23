"use client";

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FaLock } from 'react-icons/fa';
import { useRouter, useSearchParams } from 'next/navigation';
import IconTextFormInput from '@/components/form/IconTextFormInput';
import { toast } from "sonner";
import { resetPasswordSchema } from '@/validations/userSchema';
import { useAuth } from '@/context/AuthContext';

const ResetPassword = () => {
  const router = useRouter();
  const [token, setToken] = useState('');
  const searchParams = useSearchParams();
  const { resetPassword, authLoading: loading } = useAuth();

  useEffect(() => {
    // Get token from URL query parameter
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      toast.error("No verification token found in URL");
      router.push('/auth/forgot-password');
    }
  }, [searchParams, router]);

  const { handleSubmit, formState: { errors }, control } = useForm({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data) => {
    if (!token) {
      toast.error("Verification token is missing");
      return;
    }

    try {
      const credentials = {
        token: token,
        newPassword: data.password
      }

      await resetPassword(credentials);
      // Success handling is done in AuthContext
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    }
  };

  if (!token) {
    return <div className="alert alert-danger">Error: Token is missing. Please use the link provided in the email.</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-3">
        <IconTextFormInput
          control={control}
          icon={FaLock}
          placeholder='*********'
          label='New Password *'
          name='password'
          type="password"
          error={errors.password?.message}
        />
      </div>
      <div className="mb-3">
        <IconTextFormInput
          control={control}
          icon={FaLock}
          placeholder='*********'
          label='Confirm New Password *'
          name='confirmPassword'
          type="password"
          error={errors.confirmPassword?.message}
        />
      </div>
      <div className="d-grid">
        <button className="btn btn-primary mb-0" type="submit" disabled={loading}>
          {loading ? 'Resetting Password...' : 'Reset Password'}
        </button>
      </div>
    </form>
  );
};

export default ResetPassword;