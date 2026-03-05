import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { sendAccountActivatedEmail } from '@/lib/email';

// ─────────────────────────────────────────────
// Shared verification logic used by both GET and POST
// ─────────────────────────────────────────────
async function verifyEmailToken(token, locale = 'en') {
  if (!token) {
    return { 
      success: false, 
      error: "Confirmation token is required.", 
      status: 400 
    };
  }

  // Verify JWT
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (jwtError) {
    if (jwtError instanceof jwt.JsonWebTokenError) {
      return { success: false, error: "Invalid token format.", status: 400 };
    }
    if (jwtError instanceof jwt.TokenExpiredError) {
      return { success: false, error: "Token expired.", status: 400 };
    }
    return { success: false, error: "Invalid or expired confirmation token.", status: 400 };
  }

  // Find user with matching token
  const user = await User.findOne({
    _id: decoded.userId,
    confirmationToken: token
  });

  if (!user) {
    return { 
      success: false, 
      error: "User not found or token doesn't match.", 
      status: 404 
    };
  }

  // Check token expiration in DB
  if (user.tokenExpiration && new Date(user.tokenExpiration) < new Date()) {
    return { success: false, error: "Token has expired.", status: 400 };
  }

  // Check if already verified — don't error, just let them proceed
  if (user.isActive && !user.confirmationToken) {
    return { success: true, alreadyVerified: true, user };
  }

  // Activate the account
  user.isActive = true;
  user.confirmationToken = null;
  user.tokenExpiration = null;
  await user.save();

  // Send account activated email
  try {
    const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_BASE_URL || 'http://localhost:3000';
    const loginUrl = `${baseUrl}/${locale}/auth/sign-in`;

    await sendAccountActivatedEmail({
      to: user.email,
      username: user.fullName,
      loginUrl
    });
  } catch (emailError) {
    // Don't fail the verification if this email fails
    console.error("Error sending account activated email:", emailError);
  }

  return { success: true, alreadyVerified: false, user };
}


// ─────────────────────────────────────────────
// GET — triggered when user clicks link in email
// Automatically verifies without needing a button click
// ─────────────────────────────────────────────
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const token = searchParams.get('auth_token');
    const locale = searchParams.get('locale') || 'en';

    const result = await verifyEmailToken(token, locale);

    if (!result.success) {
      // Redirect to frontend error page
      const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_BASE_URL || 'http://localhost:3000';
      return NextResponse.redirect(
        `${baseUrl}/${locale}/auth/confirm-email?status=error&message=${encodeURIComponent(result.error)}`
      );
    }

    // Redirect to frontend success page
    const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_BASE_URL || 'http://localhost:3000';
    const status = result.alreadyVerified ? 'already_verified' : 'success';
    return NextResponse.redirect(
      `${baseUrl}/${locale}/auth/confirm-email?status=${status}`
    );

  } catch (error) {
    console.error("Email confirmation GET error:", error);
    const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_BASE_URL || 'http://localhost:3000';
    return NextResponse.redirect(
      `${baseUrl}/en/auth/confirm-email?status=error&message=${encodeURIComponent('An unexpected error occurred.')}`
    );
  }
}


// ─────────────────────────────────────────────
// POST — kept for backward compatibility
// (used by the manual verify button on the frontend)
// ─────────────────────────────────────────────
export async function POST(request) {
  try {
    await connectDB();

    const { token, locale = 'en' } = await request.json();

    const result = await verifyEmailToken(token, locale);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: result.status });
    }

    return NextResponse.json({
      success: true,
      message: "Account confirmed successfully. You can now log in."
    });

  } catch (error) {
    console.error("Email confirmation POST error:", error);
    return NextResponse.json({
      success: false,
      error: "An unexpected error occurred during email confirmation."
    }, { status: 500 });
  }
}