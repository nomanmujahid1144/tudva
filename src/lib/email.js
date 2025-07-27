import { Resend } from 'resend';
import { renderAsync } from '@react-email/render';
import VerificationEmail from '../emails/VerificationEmail';
import AccountActivatedEmail from '../emails/AccountActivationEmail';
import PasswordResetEmail from '../emails/PasswordResetEmail';
import PasswordResetConfirmationEmail from '../emails/PasswordResetConfirmationEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Custom error class for email sending failures
 */
export class EmailError extends Error {
  statusCode;
  
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'EmailError';
    this.statusCode = statusCode;
  }
}

/**
 * Send an email verification using Resend and React Email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.username - User's name
 * @param {string} options.verificationUrl - URL for email verification
 */
export const sendVerificationEmail = async ({ to, username, verificationUrl }) => {
  if (!to || !username || !verificationUrl) {
    throw new EmailError('Missing required parameters for verification email', 400);
  }

  try {
    // Render the React email template to HTML
    const html = await renderAsync(
      VerificationEmail({
        username,
        url: verificationUrl,
      })
    );

    const { data, error } = await resend.emails.send({
      from: 'Tudva <onboarding@resend.dev>', // Update with your actual domain
      to: process.env.RESEND_SENDDER_EMAIL || to,
      subject: 'Verify Your Tudva Account',
      html: html,
    });

    if (error) {
      console.error('Error sending email via Resend:', error);
      throw new EmailError(`Failed to send email: ${error.message}`);
    }

    console.log('Verification email sent successfully:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Error in sendVerificationEmail:', error);
    throw new EmailError(
      `Failed to send verification email: ${error.message}`
    );
  }
};


/**
 * Send an account activated confirmation email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.username - User's name
 * @param {string} options.loginUrl - URL for logging in
 */
export const sendAccountActivatedEmail = async ({ to, username, loginUrl }) => {
  if (!to || !username) {
    throw new EmailError('Missing required parameters for account activated email', 400);
  }

  try {
    // Use default login URL if none provided
    const url = loginUrl || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/sign-in`;
    
    // Render the React email template to HTML
    const html = await renderAsync(
      AccountActivatedEmail({
        username,
        loginUrl: url,
      })
    );

    const { data, error } = await resend.emails.send({
      from: 'Tudva <onboarding@resend.dev>', // Using the same sender as verification email
      to: process.env.RESEND_SENDDER_EMAIL || to, // Using the same receiver logic
      subject: 'Your Tudva Account is Now Active',
      html: html,
    });

    if (error) {
      console.error('Error sending account activated email via Resend:', error);
      throw new EmailError(`Failed to send account activated email: ${error.message}`);
    }

    console.log('Account activated email sent successfully:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Error in sendAccountActivatedEmail:', error);
    throw new EmailError(
      `Failed to send account activated email: ${error.message}`
    );
  }
};


/**
 * Send a password reset email using Resend and React Email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.username - User's name
 * @param {string} options.resetUrl - URL for password reset
 */
export const sendPasswordResetEmail = async ({ to, username, resetUrl }) => {
  if (!to || !username || !resetUrl) {
    throw new EmailError('Missing required parameters for password reset email', 400);
  }

  try {
    // Render the React email template to HTML
    const html = await renderAsync(
      PasswordResetEmail({
        username,
        resetUrl,
      })
    );

    const { data, error } = await resend.emails.send({
      from: 'Tudva <onboarding@resend.dev>',
      to: process.env.RESEND_SENDDER_EMAIL || to,
      subject: 'Reset Your Tudva Password',
      html: html,
    });

    if (error) {
      console.error('Error sending password reset email via Resend:', error);
      throw new EmailError(`Failed to send password reset email: ${error.message}`);
    }

    console.log('Password reset email sent successfully:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Error in sendPasswordResetEmail:', error);
    throw new EmailError(
      `Failed to send password reset email: ${error.message}`
    );
  }
};


/**
 * Send a password reset confirmation email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.username - User's name
 * @param {string} options.loginUrl - URL for logging in
 */
export const sendPasswordResetConfirmationEmail = async ({ to, username, loginUrl }) => {
  if (!to || !username) {
    throw new EmailError('Missing required parameters for password reset confirmation email', 400);
  }

  try {
    // Use default login URL if none provided
    const url = loginUrl || `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/sign-in`;
    
    // Render the React email template to HTML
    const html = await renderAsync(
      PasswordResetConfirmationEmail({
        username,
        loginUrl: url,
      })
    );

    const { data, error } = await resend.emails.send({
      from: 'Tudva <onboarding@resend.dev>',
      to: process.env.RESEND_SENDDER_EMAIL || to,
      subject: 'Your Tudva Password Has Been Reset',
      html: html,
    });

    if (error) {
      console.error('Error sending password reset confirmation email via Resend:', error);
      throw new EmailError(`Failed to send password reset confirmation email: ${error.message}`);
    }

    console.log('Password reset confirmation email sent successfully:', data?.id);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Error in sendPasswordResetConfirmationEmail:', error);
    throw new EmailError(
      `Failed to send password reset confirmation email: ${error.message}`
    );
  }
};