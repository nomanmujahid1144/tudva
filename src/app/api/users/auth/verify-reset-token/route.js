import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    await connectDB();
    
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json({
        success: false,
        error: "Reset token is required."
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
        error: "Invalid or expired reset token."
      }, { status: 400 });
    }
    
    // Find user with this token
    const user = await User.findOne({
      _id: decoded.userId,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: "Invalid or expired reset token."
      }, { status: 400 });
    }
    
    // Token is valid
    return NextResponse.json({
      success: true,
      message: "Token is valid. You can proceed with password reset.",
      userId: user._id
    });
    
  } catch (error) {
    console.error("Verify reset token error:", error);
    return NextResponse.json({
      success: false,
      error: "An unexpected error occurred. Please try again later."
    }, { status: 500 });
  }
}