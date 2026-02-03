import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import User, { UserRole } from '../../../../../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendVerificationEmail } from '../../../../../lib/email';

export async function POST(request) {
  try {
    // Connect to MongoDB
    await connectDB();

    // Parse request body
    const reqBody = await request.json();
    console.log(reqBody, 'reqBody')
    const { email, password, fullName, role = UserRole.LEARNER, locale = 'en' } = reqBody;

    // Input validation
    if (!email || !password || !fullName) {
      return NextResponse.json({
        success: false,
        error: "Email, password, and full name are required."
      }, { status: 400 });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({
        success: false,
        error: "Invalid email format."
      }, { status: 400 });
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json({
        success: false,
        error: "Password must be at least 8 characters long."
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: "Email already registered."
      }, { status: 409 });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user (initially inactive)
    const newUser = new User({
      email,
      passwordHash,
      fullName,
      role,
      isActive: false // Set to inactive initially
    });

    // Save the user first to get an ID
    const savedUser = await newUser.save();

    // Generate confirmation token
    const token = jwt.sign(
      { userId: savedUser._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Update user with confirmation token
    savedUser.confirmationToken = token;
    savedUser.tokenExpiration = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await savedUser.save();

    // Send confirmation email
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const confirmationUrl = `${baseUrl}/${locale}/auth/confirm-email?token=${token}`;

      await sendVerificationEmail({
        to: savedUser.email,
        username: savedUser.fullName,
        verificationUrl: confirmationUrl
      });
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);

      // Handle email sending failure - delete the user
      await User.findByIdAndDelete(savedUser._id);

      return NextResponse.json({
        success: false,
        error: "Failed to send confirmation email. Registration incomplete."
      }, { status: 500 });
    }

    // Return success
    return NextResponse.json({
      message: "Registration successful. Please check your email for confirmation.",
      success: true,
      data: {
        userId: savedUser._id
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({
      success: false,
      error: "An unexpected error occurred during registration."
    }, { status: 500 });
  }
}