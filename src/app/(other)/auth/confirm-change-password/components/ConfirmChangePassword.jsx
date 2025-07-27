'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const ConfirmChangePassword = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  const { verifyResetToken, authLoading: loading } = useAuth();

  useEffect(() => {
    // Get token from URL query parameter
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      toast.error("No verification token found in URL");
    }
  }, [searchParams]);


  const handleVerify = async (e) => {
    // Prevent default form submission
    e.preventDefault();

    if (!token) {
      toast.error("Verification token is missing");
      return;
    }

    try {
      // Using the verifyResetToken method from AuthContext
      const result = await verifyResetToken(token);

      // Note: Toast notifications and redirects are handled in AuthContext
      if (!result.success) {
        // If not redirected by AuthContext, we can handle specific errors here
        console.error('Verification failed:', result.error);
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('An unexpected error occurred. Please try again.');
      router.push('/auth/sign-in');
    }
  };

  return (
    <div className="text-center">
      <h2 className="mb-4">Verify Your Identity to Proceed</h2>
      <p className="mb-4">
        Click the button below to confirm your identity and continue with resetting your password.
      </p>
      <div className="d-grid gap-2 col-6 mx-auto">
        <button
          onClick={handleVerify}
          className="btn btn-primary"
          type="button"
          disabled={loading || !token}
        >
          {loading ? 'Verifying...' : 'Create New Password'}
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

export default ConfirmChangePassword;