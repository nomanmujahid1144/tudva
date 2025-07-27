'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/services/authService';
import { toast } from 'sonner';

// Create the Auth Context
const AuthContext = createContext();

// Auth Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const router = useRouter();

  // Check for existing auth and fetch user profile on component mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);

        // Check if we have a token
        if (authService.isAuthenticated()) {
          console.log('Token found, fetching user profile...');

          // Fetch user profile from server
          const profileResult = await authService.getUserProfile();

          if (profileResult.success && profileResult.data?.user) {
            console.log('User profile loaded successfully');
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

      console.log('Refreshing user profile...');
      
      // Fetch updated user profile from server
      const profileResult = await authService.getUserProfile();

      if (profileResult.success && profileResult.data?.user) {
        console.log('User profile refreshed successfully');
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
        toast.error(result.error || errorMessage || 'An error occurred');
      }

      return result;
    } catch (error) {
      console.error('Auth operation error:', error);
      toast.error(errorMessage || 'An unexpected error occurred');
      return { success: false, error: errorMessage || 'An unexpected error occurred' };
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
        successMessage: 'Registration successful! Please check your email to confirm your account.',
        errorMessage: 'Registration failed. Please try again.',
        successRedirect: '/auth/sign-in'
      }
    );
  };

  const verifyEmailToken = async (token) => {
    return withAuthLoading(
      authService.verifyEmailToken,
      token,
      {
        successMessage: 'Email verified successfully! You can now log in.',
        errorMessage: 'Email verification failed. Please try again.',
        successRedirect: '/auth/sign-in'
      }
    );
  };

  const login = async (credentials) => {
    return withAuthLoading(
      authService.login,
      credentials,
      {
        successMessage: 'Login successful!',
        errorMessage: 'Login failed. Please check your credentials and try again.',
        updateUser: true,
        successRedirect: '/auth/callback'
      }
    );
  };

  const logout = async () => {
    const result = await withAuthLoading(
      authService.logout,
      null,
      {
        successMessage: 'Logged out successfully',
        errorMessage: 'Logout failed. Please try again.',
        successRedirect: '/auth/sign-in'
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
        successMessage: 'Password reset instructions sent to your email.',
        errorMessage: 'Please check your email and try again!'
      }
    );
  };

  const verifyResetToken = async (token) => {
    return withAuthLoading(
      authService.verifyResetToken,
      token,
      {
        errorMessage: 'Invalid or expired reset token. Please request a new one.',
        successRedirect: `/auth/reset-password?token=${token}`,
      }
    );
  };

  const resetPassword = async (data) => {
    console.log(data, 'data')
    return withAuthLoading(
      authService.resetPassword,
      data,
      {
        successMessage: 'Password reset successful! You can now log in with your new password.',
        errorMessage: 'Password reset failed. Please try again.',
        successRedirect: '/auth/sign-in'
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
