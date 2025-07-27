// /api/learning/mark-completed
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CourseSchedulerEnrollment from '@/models/CourseSchedulerEnrollment';
import { authenticateRequest } from '@/middlewares/authMiddleware';
import mongoose from 'mongoose';

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

    // Get user ID from auth
    const userId = auth.user.id;

    // Parse the request body
    const reqBody = await request.json();
    
    // Extract required data
    const { itemId } = reqBody;

    // Validate required fields
    if (!itemId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: itemId'
      }, { status: 400 });
    }

    // Find the user's scheduler enrollment
    const schedulerEnrollment = await CourseSchedulerEnrollment.findOne({
      learner: new mongoose.Types.ObjectId(userId)
    });

    if (!schedulerEnrollment) {
      return NextResponse.json({
        success: false,
        error: 'Scheduler enrollment not found'
      }, { status: 404 });
    }

    // Find the course and item within the enrollment
    let itemFound = false;
    let courseUpdated = null;

    for (const course of schedulerEnrollment.scheduledCourses) {
      for (const item of course.scheduledItems) {
        if (item._id.toString() === itemId) {
          item.isCompleted = true;
          item.completedAt = new Date();
          itemFound = true;
          courseUpdated = course;
          break;
        }
      }
      if (itemFound) break;
    }

    if (!itemFound) {
      return NextResponse.json({
        success: false,
        error: 'Scheduled item not found'
      }, { status: 404 });
    }

    // Update the progress for the course
    if (courseUpdated) {
      const completedItems = courseUpdated.scheduledItems.filter(item => item.isCompleted).length;
      courseUpdated.progress.completed = completedItems;
    }

    // Save the changes
    await schedulerEnrollment.save();

    return NextResponse.json({
      success: true,
      message: 'Item marked as completed successfully',
      data: {
        courseProgress: courseUpdated ? {
          completed: courseUpdated.progress.completed,
          total: courseUpdated.progress.total
        } : null
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error marking item as completed:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json({
        success: false,
        error: `Validation error: ${validationErrors.join(', ')}`
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to mark item as completed'
    }, { status: 500 });
  }
}