import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { sendAccountActivatedEmail } from '@/lib/email';

export async function POST(request) {
  try {
    // Connect to MongoDB
    await connectDB();

    // Get token from request body
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({
        success: false,
        error: "Confirmation token is required."
      }, { status: 400 });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError instanceof jwt.JsonWebTokenError) {
        return NextResponse.json({
          success: false,
          error: "Invalid token format."
        }, { status: 400 });
      }
      if (jwtError instanceof jwt.TokenExpiredError) {
        return NextResponse.json({
          success: false,
          error: "Token expired."
        }, { status: 400 });
      }

      // For any other JWT errors
      return NextResponse.json({
        success: false,
        error: "Invalid or expired confirmation token."
      }, { status: 400 });
    }

    // Find user with this token
    const user = await User.findOne({
      _id: decoded.userId,
      confirmationToken: token
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: "User not found or token doesn't match."
      }, { status: 404 });
    }

    // Check if token has expired (using the tokenExpiration field in the database)
    if (user.tokenExpiration && new Date(user.tokenExpiration) < new Date()) {
      return NextResponse.json({
        success: false,
        error: "Token has expired."
      }, { status: 400 });
    }

    // Activate user account
    user.isActive = true;
    user.confirmationToken = null; // Clear the token
    user.tokenExpiration = null; // Clear expiration
    await user.save();

    // Send account activated confirmation email
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const loginUrl = `${baseUrl}/auth/sign-in`;

      await sendAccountActivatedEmail({
        to: user.email,
        username: user.fullName,
        loginUrl: loginUrl
      });
    } catch (emailError) {
      // We'll continue even if the confirmation email fails
      console.error("Error sending account activated email:", emailError);
      // The account is still activated, so we don't return an error response
    }

    return NextResponse.json({
      success: true,
      message: "Account confirmed successfully. You can now log in."
    });

  } catch (error) {
    console.error("Email confirmation error:", error);
    return NextResponse.json({
      success: false,
      error: "An unexpected error occurred during email confirmation."
    }, { status: 500 });
  }
}