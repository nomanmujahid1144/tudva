// src/utils/errorMapping.js

/**
 * Maps API error messages to translation keys for each auth method
 */
export const ERROR_MAPPINGS = {
  // SIGNUP ERRORS
  signup: {
    'Email already registered.': 'emailAlreadyExists',
    'Invalid email format.': 'invalidEmail',
    'Password must be at least 8 characters long.': 'weakPassword',
    'Email, password, and full name are required.': 'missingFields',
    'Failed to send confirmation email. Registration incomplete.': 'emailSendFailed',
    'An unexpected error occurred during registration.': 'signupError',
  },

  // LOGIN ERRORS
  signin: {
    'Invalid email or password': 'invalidCredentials',
    'Invalid email or password.': 'invalidCredentials',
    'Please verify your email before logging in': 'accountNotVerified',
    'Your account is inactive. Please contact support.': 'accountInactive',
    'Login failed': 'loginError',
    'An unexpected error occurred. Please try again.': 'loginError',
  },

  // FORGOT PASSWORD ERRORS
  forgotPassword: {
    'Email is required.': 'resetError',
    'Failed to send password reset email. Please try again later.': 'resetEmailFailed',
    'An unexpected error occurred. Please try again later.': 'resetError',
  },

  // EMAIL VERIFICATION ERRORS
  confirmEmail: {
    'Confirmation token is required.': 'verifyError',
    'Invalid token format.': 'invalidToken',
    'Token expired.': 'invalidToken',
    'Invalid or expired confirmation token.': 'invalidToken',
    'User not found or token doesn\'t match.': 'invalidToken',
    'Token has expired.': 'invalidToken',
    'An unexpected error occurred during email confirmation.': 'verifyError',
  },

  // RESET PASSWORD ERRORS
  resetPassword: {
    'Token and new password are required.': 'resetError',
    'Password must be at least 8 characters long.': 'resetError',
    'Invalid or expired reset token.': 'invalidToken',
    'An unexpected error occurred during password reset.': 'resetError',
  },

  // CONFIRM CHANGE PASSWORD ERRORS
  confirmChangePassword: {
    'Invalid or expired reset token. Please request a new one.': 'verifyError',
    'Token verification failed. Please try again.': 'verifyError',
  },
};

export const METHOD_FALLBACKS = {
  signup: 'signupError',
  signin: 'loginError',
  forgotPassword: 'resetError',
  confirmEmail: 'verifyError',
  resetPassword: 'resetError',
  confirmChangePassword: 'verifyError',
};

/**
 * Get translated error message
 * @param {string} apiError - Error message from API
 * @param {Function} tFunction - Translation function
 * @param {string} method - Method name (signup, signin, etc.)
 * @returns {string} Translated error message
 */
export const getTranslatedError = (apiError, tFunction, method) => {
  // If no API error, use method-specific fallback
  if (!apiError) {
    const fallbackKey = METHOD_FALLBACKS[method] || 'error';
    return tFunction(fallbackKey);
  }

  // Get error mappings for this method
  const methodMappings = ERROR_MAPPINGS[method];

  if (methodMappings) {
    // Try to find exact match
    const translationKey = methodMappings[apiError];
    if (translationKey) {
      return tFunction(translationKey);
    }
  }

  // If no mapping found, try method-specific fallback
  const fallbackKey = METHOD_FALLBACKS[method];
  if (fallbackKey) {
    const fallbackTranslation = tFunction(fallbackKey);
    // Only use fallback if translation exists (not same as key)
    if (fallbackTranslation !== fallbackKey) {
      return fallbackTranslation;
    }
  }

  // Last resort: return original API error message
  return apiError;
};