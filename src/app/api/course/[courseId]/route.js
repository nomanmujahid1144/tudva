// src/app/api/course/[courseId]/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import mongoose from 'mongoose';
import { authenticateRequest } from '@/middlewares/authMiddleware';

export async function GET(request, { params }) {
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
        error: 'You do not have permission to access this course' 
      }, { status: 403 });
    }
    
    // Return course data
    return NextResponse.json({
      success: true,
      data: course
    });
    
  } catch (error) {
    console.error('Error fetching course:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch course'
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
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
        error: 'You do not have permission to delete this course' 
      }, { status: 403 });
    }
    
    // Delete the course
    await Course.findByIdAndDelete(courseId);
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting course:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to delete course'
    }, { status: 500 });
  }
}