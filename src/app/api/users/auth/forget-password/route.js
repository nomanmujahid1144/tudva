import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request) {
  try {
    await connectDB();

    const { email, locale = 'en' } = await request.json();


    if (!email) {
      return NextResponse.json({
        success: false,
        error: "Email is required."
      }, { status: 400 });
    }

    // Find user by email
    const user = await User.findOne({
      email,
      isActive: true,
      isDeleted: { $ne: true }
    });

    // Even if user is not found, we return success for security reasons
    // This prevents email enumeration attacks
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "If a user with that email exists, we've sent password reset instructions."
      });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Save token and expiration to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // Send password reset email
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const verifyResetUrl = `${baseUrl}/${locale}/auth/confirm-change-password?token=${resetToken}`;

      await sendPasswordResetEmail({
        to: user.email,
        username: user.fullName,
        resetUrl: verifyResetUrl
      });
    } catch (emailError) {
      console.error("Error sending password reset email:", emailError);

      // Remove reset tokens from user if email fails
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();

      return NextResponse.json({
        success: false,
        error: "Failed to send password reset email. Please try again later."
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "If a user with that email exists, we've sent password reset instructions."
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({
      success: false,
      error: "An unexpected error occurred. Please try again later."
    }, { status: 500 });
  }
}