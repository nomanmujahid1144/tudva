'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Check if user is logged in
  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get token from localStorage
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      // Fetch user profile
      const response = await axios.get('/api/user/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setUser(response.data.user);
      } else {
        // Clear invalid token
        localStorage.removeItem('auth_token');
        setUser(null);
      }
    } catch (err) {
      console.error('Auth check error:', err);
      // Clear invalid token
      localStorage.removeItem('auth_token');
      setUser(null);
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post('/api/user/login', {
        email,
        password
      });
      
      if (response.data.success) {
        // Save token to localStorage
        localStorage.setItem('auth_token', response.data.token);
        
        // Fetch user profile
        await checkAuthStatus();
        
        return { success: true };
      } else {
        setError(response.data.error || 'Login failed');
        return { success: false, error: response.data.error };
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post('/api/user/register', userData);
      
      if (response.data.success) {
        return { success: true, message: response.data.message };
      } else {
        setError(response.data.error || 'Registration failed');
        return { success: false, error: response.data.error };
      }
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    router.push('/login');
  };

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Context value
  const value = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    checkAuthStatus
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
