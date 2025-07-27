// src/app/api/course/[courseId]/basic-details/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course, { CourseType } from '@/models/Course';
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

    // Extract course details
    const {
      title,
      description,
      shortDescription,
      category,
      subcategory,
      level,
      language,
      type,
      promoVideoUrl
    } = reqBody;

    // Validate required fields
    if (!title || !description || !category || !subcategory || !level || !type) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Update the course fields
    course.title = title;
    course.description = description;
    course.shortDescription = shortDescription || '';
    course.category = category;
    course.subcategory = subcategory;
    course.level = level;
    course.language = language || 'english';
    course.type = type;
    course.promoVideoUrl = promoVideoUrl || '';

    // If the course type has changed to LIVE, initialize the liveCourseMeta if it doesn't exist
    if (type === CourseType.LIVE && (!course.liveCourseMeta || Object.keys(course.liveCourseMeta).length === 0)) {
      course.liveCourseMeta = {
        plannedLessons: 0,
        maxEnrollment: 0,
        timeSlots: []
      };
    }
    
    // Save the updated course
    await course.save();
    
    // Return success
    return NextResponse.json({
      success: true,
      message: 'Course basic details updated successfully',
      data: {
        courseId: course._id,
        slug: course.slug
      }
    });
    
  } catch (error) {
    console.error('Error updating course basic details:', error);
    
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
      error: 'Failed to update course basic details'
    }, { status: 500 });
  }
}