// src/app/api/users/auth/update-profile/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Get token for authentication
    let token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    // If no token in header, check cookies
    if (!token) {
      const cookieStore = cookies();
      token = cookieStore.get('auth_token')?.value;
    }
    
    // If still no token, return auth error
    if (!token) {
      return NextResponse.json({
        success: false,
        error: "Authentication required"
      }, { status: 401 });
    }
    
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return NextResponse.json({
        success: false,
        error: "Invalid or expired token"
      }, { status: 401 });
    }
    
    // Get user data from request
    const userData = await request.json();
    
    // Find user by ID
    const user = await User.findOne({ 
      _id: decoded.userId,
      isActive: true,
      isDeleted: { $ne: true }
    });
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: "User not found or account is inactive"
      }, { status: 404 });
    }
    
    // Update user fields
    if (userData.fullName) user.fullName = userData.fullName;
    if (userData.phoneNo !== undefined) user.phoneNo = userData.phoneNo;
    if (userData.aboutMe !== undefined) user.aboutMe = userData.aboutMe;
    if (userData.profilePicture !== undefined) user.profilePicture = userData.profilePicture;
    if (userData.education) user.education = userData.education;
    
    // Save updated user
    await user.save();
    
    // Return updated user data without sensitive fields
    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        phoneNo: user.phoneNo || null,
        aboutMe: user.aboutMe || null,
        profilePicture: user.profilePicture || null,
        education: user.education || [],
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
    
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({
      success: false,
      error: "An unexpected error occurred while updating profile"
    }, { status: 500 });
  }
}