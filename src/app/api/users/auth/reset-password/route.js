import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { sendPasswordResetConfirmationEmail } from '@/lib/email';

export async function POST(request) {
  try {
    await connectDB();

    const { token, newPassword, locale = 'en' } = await request.json();

    // Validate input
    if (!token || !newPassword) {
      return NextResponse.json({
        success: false,
        error: "Token and new password are required."
      }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({
        success: false,
        error: "Password must be at least 8 characters long."
      }, { status: 400 });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: "Invalid or expired reset token."
      }, { status: 400 });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update user's password and clear reset token fields
    user.passwordHash = passwordHash;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    // Send password reset confirmation email
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const loginUrl = `${baseUrl}/${locale}/auth/sign-in`;

      await sendPasswordResetConfirmationEmail({
        to: user.email,
        username: user.fullName,
        loginUrl: loginUrl
      });
    } catch (emailError) {
      // We'll continue even if the confirmation email fails
      console.error("Error sending password reset confirmation email:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Password has been successfully reset. You can now log in with your new password."
    });

  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({
      success: false,
      error: "An unexpected error occurred during password reset."
    }, { status: 500 });
  }
}