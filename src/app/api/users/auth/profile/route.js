import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Get token from Authorization header first
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
    
    // Find user by ID
    const user = await User.findOne({ 
      _id: decoded.userId,
      isActive: true,
      isDeleted: { $ne: true }
    }).select('-passwordHash -confirmationToken -tokenExpiration -resetPasswordToken -resetPasswordExpires');
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: "User not found or account is inactive"
      }, { status: 404 });
    }
    
    // Return user profile data
    return NextResponse.json({
      success: true,
      data: {
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
      }
    });
    
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({
      success: false,
      error: "An unexpected error occurred while fetching the user profile"
    }, { status: 500 });
  }
}