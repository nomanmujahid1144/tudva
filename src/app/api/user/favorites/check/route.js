// src/app/api/user/favorites/check/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { authenticateRequest } from '@/middlewares/authMiddleware';
import mongoose from 'mongoose';

// POST - Check favorite status for multiple courses
export async function POST(request) {
  try {
    // Connect to the database
    await connectDB();

    // Authenticate the request
    const auth = await authenticateRequest(request);

    if (!auth.success) {
      return NextResponse.json({
        success: false,
        error: auth.error
      }, { status: 401 });
    }

    // Check if user is learner
    if (auth.user.role !== 'learner') {
      return NextResponse.json({
        success: false,
        error: 'Only learners can have favorite courses'
      }, { status: 403 });
    }

    // Parse request body
    const { courseIds } = await request.json();

    // Validate courseIds
    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'courseIds must be a non-empty array'
      }, { status: 400 });
    }

    // Validate each courseId
    const invalidIds = courseIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Invalid course IDs: ${invalidIds.join(', ')}`
      }, { status: 400 });
    }

    // Get user with favorites
    const user = await User.findById(auth.user.id).select('favorites');
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // Create result object with favorite status for each course
    const favoriteStatus = {};
    
    courseIds.forEach(courseId => {
      favoriteStatus[courseId] = user.favorites && user.favorites.includes(courseId);
    });

    return NextResponse.json({
      success: true,
      data: favoriteStatus
    }, { status: 200 });

  } catch (error) {
    console.error('Error checking bulk favorite status:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to check favorite status'
    }, { status: 500 });
  }
}