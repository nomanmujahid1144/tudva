// src/app/api/course/[courseId]/update-media/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import mongoose from 'mongoose';
import { authenticateRequest } from '@/middlewares/authMiddleware';

export async function PUT(request, { params }) {
  try {
    // Connect to the database
    await connectDB();
    
    const { courseId } = params;
    
    // Validate course ID
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid course ID' 
      }, { status: 400 });
    }
    
    // Authenticate the request
    const auth = await authenticateRequest(request);
    
    if (!auth.success) {
      return NextResponse.json({ 
        success: false, 
        error: auth.error 
      }, { status: 401 });
    }
    
    // Find the course
    const course = await Course.findById(courseId);
    
    if (!course) {
      return NextResponse.json({ 
        success: false, 
        error: 'Course not found' 
      }, { status: 404 });
    }
    
    // Verify the user is the instructor of this course
    if (course.instructor.toString() !== auth.user.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'You do not have permission to update this course' 
      }, { status: 403 });
    }
    
    // Parse the request body
    const reqBody = await request.json();
    
    // Extract media information
    const { 
      backgroundColorHex,
      iconUrl,
      thumbnailUrl
    } = reqBody;
    
    // Update course with media info
    if (backgroundColorHex) {
      course.backgroundColorHex = backgroundColorHex;
    }
    
    if (iconUrl) {
      course.iconUrl = iconUrl;
    }
    
    if (thumbnailUrl) {
      course.thumbnailUrl = thumbnailUrl;
    }
    
    // Save the updated course
    await course.save();
    
    // Return success
    return NextResponse.json({
      success: true,
      message: 'Course media updated successfully',
      data: {
        courseId: course._id,
        slug: course.slug
      }
    });
    
  } catch (error) {
    console.error('Error updating course media:', error);
    
    // Handle specific validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json({
        success: false,
        error: `Validation error: ${validationErrors.join(', ')}`
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update course media'
    }, { status: 500 });
  }
}