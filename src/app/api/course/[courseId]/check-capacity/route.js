// src/app/api/course/[courseId]/check-capacity/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course, { CourseType } from '@/models/Course';
import CourseSchedulerEnrollment from '@/models/CourseSchedulerEnrollment';
import mongoose from 'mongoose';
import { authenticateRequest } from '@/middlewares/authMiddleware';

/**
 * GET /api/course/[courseId]/check-capacity
 * Check if a course has available enrollment capacity
 */
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
    
    // For recorded courses, there's no enrollment limit
    if (course.type === CourseType.RECORDED) {
      return NextResponse.json({
        success: true,
        data: {
          hasCapacity: true,
          maxEnrollment: null,
          currentEnrollment: 0,
          availableSlots: null,
          message: 'Recorded courses have unlimited enrollment'
        }
      });
    }
    
    // For live courses, check maxEnrollment capacity
    if (course.type === CourseType.LIVE) {
      const maxEnrollment = course.liveCourseMeta?.maxEnrollment || 0;
      
      if (maxEnrollment <= 0) {
        return NextResponse.json({
          success: false,
          error: 'Course enrollment capacity is not properly configured'
        }, { status: 400 });
      }
      
      // Count current enrollments for this live course
      const currentEnrollmentCount = await CourseSchedulerEnrollment.countDocuments({
        'scheduledCourses.course': new mongoose.Types.ObjectId(courseId)
      });
      
      const availableSlots = maxEnrollment - currentEnrollmentCount;
      const hasCapacity = availableSlots > 0;
      
      return NextResponse.json({
        success: true,
        data: {
          hasCapacity,
          maxEnrollment,
          currentEnrollment: currentEnrollmentCount,
          availableSlots,
          message: hasCapacity 
            ? `${availableSlots} enrollment slots available`
            : 'Course is at maximum capacity'
        }
      });
    }
    
    // Fallback for unknown course types
    return NextResponse.json({
      success: false,
      error: 'Unknown course type'
    }, { status: 400 });
    
  } catch (error) {
    console.error('Error checking course capacity:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to check course capacity'
    }, { status: 500 });
  }
}

/**
 * POST /api/course/[courseId]/check-capacity
 * Check if a specific user can enroll in the course
 */
export async function POST(request, { params }) {
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
    
    // Check if user is already enrolled in this course
    const existingEnrollment = await CourseSchedulerEnrollment.findOne({
      learner: new mongoose.Types.ObjectId(auth.user.id),
      'scheduledCourses.course': new mongoose.Types.ObjectId(courseId)
    });
    
    if (existingEnrollment) {
      return NextResponse.json({
        success: false,
        error: 'You are already enrolled in this course',
        data: {
          isAlreadyEnrolled: true
        }
      }, { status: 409 });
    }
    
    // For recorded courses, user can always enroll (no capacity limit)
    if (course.type === CourseType.RECORDED) {
      return NextResponse.json({
        success: true,
        data: {
          canEnroll: true,
          hasCapacity: true,
          maxEnrollment: null,
          currentEnrollment: 0,
          availableSlots: null,
          isAlreadyEnrolled: false,
          message: 'You can enroll in this recorded course'
        }
      });
    }
    
    // For live courses, check capacity
    if (course.type === CourseType.LIVE) {
      const maxEnrollment = course.liveCourseMeta?.maxEnrollment || 0;
      
      if (maxEnrollment <= 0) {
        return NextResponse.json({
          success: false,
          error: 'Course enrollment capacity is not properly configured'
        }, { status: 400 });
      }
      
      // Count current enrollments for this live course
      const currentEnrollmentCount = await CourseSchedulerEnrollment.countDocuments({
        'scheduledCourses.course': new mongoose.Types.ObjectId(courseId)
      });
      
      const availableSlots = maxEnrollment - currentEnrollmentCount;
      const hasCapacity = availableSlots > 0;
      const canEnroll = hasCapacity;
      
      return NextResponse.json({
        success: true,
        data: {
          canEnroll,
          hasCapacity,
          maxEnrollment,
          currentEnrollment: currentEnrollmentCount,
          availableSlots,
          isAlreadyEnrolled: false,
          message: canEnroll 
            ? `You can enroll in this course. ${availableSlots} slots remaining.`
            : 'This course is at maximum capacity'
        }
      });
    }
    
    // Fallback for unknown course types
    return NextResponse.json({
      success: false,
      error: 'Unknown course type'
    }, { status: 400 });
    
  } catch (error) {
    console.error('Error checking user enrollment eligibility:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to check enrollment eligibility'
    }, { status: 500 });
  }
}