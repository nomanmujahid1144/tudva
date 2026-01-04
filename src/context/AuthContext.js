'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import authService from '@/services/authService';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

// Create the Auth Context
const AuthContext = createContext();

// Auth Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || 'en';
  
  // Translation hooks
  const tMessages = useTranslations('auth.messages');
  const tSignup = useTranslations('auth.signup');
  const tSignin = useTranslations('auth.signin');
  const tForgotPassword = useTranslations('auth.forgotPassword');
  const tConfirmEmail = useTranslations('auth.confirmEmail');
  const tResetPassword = useTranslations('auth.resetPassword');
  const tConfirmChangePassword = useTranslations('auth.confirmChangePassword');

  // Check for existing auth and fetch user profile on component mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);

        // Check if we have a token
        if (authService.isAuthenticated()) {

          // Fetch user profile from server
          const profileResult = await authService.getUserProfile();

          if (profileResult.success && profileResult.data?.user) {
            setUser(profileResult.data.user);
          } else {
            console.warn('Failed to load user profile:', profileResult.error);
            // Clear auth if token is invalid
            authService.removeAuthToken();
            setUser(null);
          }
        } else {
          console.log('No auth token found');
          setUser(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        authService.removeAuthToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Refresh user profile data
   * @returns {Promise<Object>} Result of the refresh operation
   */
  const refreshUser = async () => {
    try {
      if (!authService.isAuthenticated()) {
        console.warn('Cannot refresh user - not authenticated');
        return { success: false, error: 'Not authenticated' };
      }
      
      // Fetch updated user profile from server
      const profileResult = await authService.getUserProfile();

      if (profileResult.success && profileResult.data?.user) {
        setUser(profileResult.data.user);
        return { success: true, data: profileResult.data.user };
      } else {
        console.warn('Failed to refresh user profile:', profileResult.error);
        return { success: false, error: profileResult.error || 'Failed to refresh profile' };
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
      return { success: false, error: 'Failed to refresh profile' };
    }
  };

  /**
   * Wrapper for authService methods that handles loading state and toast notifications
   * @param {Function} serviceMethod - The authService method to call
   * @param {Object} params - Parameters to pass to the service method
   * @param {Object} options - Options for handling the result
   * @returns {Promise<Object>} Result of the service call
   */
  const withAuthLoading = async (serviceMethod, params, options = {}) => {
    const {
      successMessage,
      errorMessage,
      successRedirect,
      updateUser = false
    } = options;

    setAuthLoading(true);

    try {
      const result = await serviceMethod(params);

      if (result.success) {
        // Show success message if provided
        if (successMessage) {
          toast.success(successMessage);
        }

        // Update user state if specified (e.g. after login)
        if (updateUser && result.data?.user) {
          setUser(result.data.user);
        }

        // Redirect if path provided
        if (successRedirect) {
          router.push(successRedirect);
        }
      } else {
        // Show error message
        toast.error(errorMessage || tMessages('unexpectedError'));
      }

      return result;
    } catch (error) {
      console.error('Auth operation error:', error);
      toast.error(errorMessage || tMessages('unexpectedError'));
      return { success: false, error: errorMessage || tMessages('unexpectedError') };
    } finally {
      setAuthLoading(false);
    }
  };

  // Authentication functions
  const register = async (userData) => {
    return withAuthLoading(
      authService.register,
      userData,
      {
        successMessage: tSignup('signupSuccess'),
        errorMessage: tSignup('signupError'),
        successRedirect: `/${locale}/auth/sign-in`
      }
    );
  };

  const verifyEmailToken = async (token) => {
    return withAuthLoading(
      authService.verifyEmailToken,
      token,
      {
        successMessage: tConfirmEmail('verifySuccess'),
        errorMessage: tConfirmEmail('verifyError'),
        successRedirect: `/${locale}/auth/sign-in`
      }
    );
  };

  const login = async (credentials) => {
    return withAuthLoading(
      authService.login,
      credentials,
      {
        successMessage: tSignin('loginSuccess'),
        errorMessage: tSignin('loginError'),
        updateUser: true,
        successRedirect: `/${locale}/auth/callback`
      }
    );
  };

  const logout = async () => {
    const result = await withAuthLoading(
      authService.logout,
      null,
      {
        successMessage: tMessages('logoutSuccess'),
        errorMessage: tMessages('logoutError'),
        successRedirect: `/${locale}/auth/sign-in`
      }
    );

    // Always clear user state on logout attempt, regardless of API response
    setUser(null);

    return result;
  };

  const requestPasswordReset = async (email) => {
    return withAuthLoading(
      authService.requestPasswordReset,
      email,
      {
        successMessage: tForgotPassword('resetSuccess'),
        errorMessage: tForgotPassword('resetError')
      }
    );
  };

  const verifyResetToken = async (token) => {
    return withAuthLoading(
      authService.verifyResetToken,
      token,
      {
        errorMessage: tConfirmChangePassword('verifyError'),
        successRedirect: `/${locale}/auth/reset-password?token=${token}`,
      }
    );
  };

  const resetPassword = async (data) => {
    return withAuthLoading(
      authService.resetPassword,
      data,
      {
        successMessage: tResetPassword('resetSuccess'),
        errorMessage: tResetPassword('resetError'),
        successRedirect: `/${locale}/auth/sign-in`
      }
    );
  };

  // Context value
  const value = {
    user,
    loading,
    authLoading,
    register,
    login,
    logout,
    requestPasswordReset,
    verifyResetToken,
    verifyEmailToken,
    resetPassword,
    refreshUser,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;