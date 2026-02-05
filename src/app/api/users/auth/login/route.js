import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Parse request body
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: "Email and password are required"
      }, { status: 400 });
    }
    
    // Find user by email
    const user = await User.findOne({ 
      email,
      isDeleted: { $ne: true }
    });
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: "Invalid email or password"
      }, { status: 401 });
    }
    
    // Check if user account is active (email verified)
    if (!user.isActive) {
      return NextResponse.json({
        success: false,
        error: "Please verify your email before logging in"
      }, { status: 403 });
    }
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        error: "Invalid email or password"
      }, { status: 401 });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id.toString(),
        email: user.email,
        fullName: user.fullName ,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Set JWT token in cookie
    cookies().set({
      name: 'token',
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    });
    
    // Return user data (exclude sensitive fields)
    return NextResponse.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          profilePicture: user.profilePicture || null
        },
        token // Include token in response for client-side storage if needed
      }
    });
    
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({
      success: false,
      error: "An unexpected error occurred. Please try again."
    }, { status: 500 });
  }
}