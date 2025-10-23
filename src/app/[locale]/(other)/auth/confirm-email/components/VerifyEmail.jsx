'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const VerifyEmail = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  const { verifyEmailToken, authLoading: loading } = useAuth();

  useEffect(() => {
    // Get token from URL query parameter
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      toast.error("No verification token found in URL");
    }
  }, [searchParams]);

  const handleVerify = async () => {

    if (!token) {
      toast.error("Verification token is missing");
      return;
    }

    try {

      const result = await verifyEmailToken(token);
      if (!result.success) {
        console.error('Verification failed:', result.error);
      }

    } catch (error) {
      console.error('Verification error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
    }
  };
  return (
    <div className="text-center">
      <h2 className="mb-4">Verify Your Email</h2>
      <p className="mb-4">
        Click the button below to verify your email address and activate your account.
      </p>
      <div className="d-grid gap-2 col-6 mx-auto">
        <button
          onClick={handleVerify}
          className="btn btn-primary"
          type="button"
          disabled={loading || !token}
        >
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>
        <button
          onClick={() => router.push('/auth/sign-in')}
          className="btn btn-outline-secondary"
          type="button"
        >
          Back to Sign In
        </button>
      </div>
    </div>
  );
};

export default VerifyEmail;