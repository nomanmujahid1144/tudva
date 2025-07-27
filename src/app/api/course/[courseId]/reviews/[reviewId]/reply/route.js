// src/app/api/course/[courseId]/reviews/[reviewId]/reply/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import Review from '@/models/Review';
import { UserRole } from '@/models/User';
import { authenticateRequest } from '@/middlewares/authMiddleware';
import mongoose from 'mongoose';

// POST - Add instructor reply to a review
export async function POST(request, { params }) {
    try {
        await connectDB();
        
        const { courseId, reviewId } = params;
        
        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(reviewId)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid course ID or review ID'
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
        
        // Only instructors can reply to reviews
        if (auth.user.role !== UserRole.INSTRUCTOR) {
            return NextResponse.json({
                success: false,
                error: 'Only instructors can reply to reviews'
            }, { status: 403 });
        }
        
        // Check if course exists and belongs to the instructor
        const course = await Course.findOne({
            _id: courseId,
            instructor: auth.user.id
        });
        
        if (!course) {
            return NextResponse.json({
                success: false,
                error: 'Course not found or you are not the instructor'
            }, { status: 404 });
        }
        
        // Find the review
        const review = await Review.findOne({
            _id: reviewId,
            course: courseId,
            status: 'published',
            isDeleted: false
        });
        
        if (!review) {
            return NextResponse.json({
                success: false,
                error: 'Review not found'
            }, { status: 404 });
        }
        
        // Check if instructor has already replied
        if (review.instructorReply && review.instructorReply.comment) {
            return NextResponse.json({
                success: false,
                error: 'You have already replied to this review'
            }, { status: 400 });
        }
        
        // Parse request body
        const { comment } = await request.json();
        
        // Validate comment
        if (!comment || comment.trim().length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Reply comment is required'
            }, { status: 400 });
        }
        
        if (comment.trim().length > 500) {
            return NextResponse.json({
                success: false,
                error: 'Reply comment cannot exceed 500 characters'
            }, { status: 400 });
        }
        
        // Add the instructor reply
        await review.addInstructorReply(comment.trim(), auth.user.id);
        
        // Populate instructor data for response
        await review.populate('instructorReply.repliedBy', 'fullName profilePicture');
        
        // Format response
        const replyData = {
            comment: review.instructorReply.comment,
            repliedAt: review.instructorReply.repliedAt,
            instructor: {
                id: review.instructorReply.repliedBy._id.toString(),
                name: review.instructorReply.repliedBy.fullName,
                avatar: review.instructorReply.repliedBy.profilePicture || null
            }
        };
        
        return NextResponse.json({
            success: true,
            message: 'Reply added successfully',
            data: replyData
        });
        
    } catch (error) {
        console.error('Error adding instructor reply:', error);
        
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
            error: 'Failed to add reply'
        }, { status: 500 });
    }
}

// PUT - Update instructor reply
export async function PUT(request, { params }) {
    try {
        await connectDB();
        
        const { courseId, reviewId } = params;
        
        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(reviewId)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid course ID or review ID'
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
        
        // Only instructors can update replies
        if (auth.user.role !== UserRole.INSTRUCTOR) {
            return NextResponse.json({
                success: false,
                error: 'Only instructors can update replies'
            }, { status: 403 });
        }
        
        // Check if course exists and belongs to the instructor
        const course = await Course.findOne({
            _id: courseId,
            instructor: auth.user.id
        });
        
        if (!course) {
            return NextResponse.json({
                success: false,
                error: 'Course not found or you are not the instructor'
            }, { status: 404 });
        }
        
        // Find the review
        const review = await Review.findOne({
            _id: reviewId,
            course: courseId,
            status: 'published',
            isDeleted: false
        });
        
        if (!review) {
            return NextResponse.json({
                success: false,
                error: 'Review not found'
            }, { status: 404 });
        }
        
        // Check if instructor reply exists
        if (!review.instructorReply || !review.instructorReply.comment) {
            return NextResponse.json({
                success: false,
                error: 'No reply found to update'
            }, { status: 404 });
        }
        
        // Check if the current instructor is the one who made the original reply
        if (review.instructorReply.repliedBy.toString() !== auth.user.id) {
            return NextResponse.json({
                success: false,
                error: 'You can only update your own replies'
            }, { status: 403 });
        }
        
        // Parse request body
        const { comment } = await request.json();
        
        // Validate comment
        if (!comment || comment.trim().length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Reply comment is required'
            }, { status: 400 });
        }
        
        if (comment.trim().length > 500) {
            return NextResponse.json({
                success: false,
                error: 'Reply comment cannot exceed 500 characters'
            }, { status: 400 });
        }
        
        // Update the reply
        review.instructorReply.comment = comment.trim();
        await review.save();
        
        // Populate instructor data for response
        await review.populate('instructorReply.repliedBy', 'fullName profilePicture');
        
        // Format response
        const replyData = {
            comment: review.instructorReply.comment,
            repliedAt: review.instructorReply.repliedAt,
            instructor: {
                id: review.instructorReply.repliedBy._id.toString(),
                name: review.instructorReply.repliedBy.fullName,
                avatar: review.instructorReply.repliedBy.profilePicture || null
            }
        };
        
        return NextResponse.json({
            success: true,
            message: 'Reply updated successfully',
            data: replyData
        });
        
    } catch (error) {
        console.error('Error updating instructor reply:', error);
        
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
            error: 'Failed to update reply'
        }, { status: 500 });
    }
}

// DELETE - Delete instructor reply
export async function DELETE(request, { params }) {
    try {
        await connectDB();
        
        const { courseId, reviewId } = params;
        
        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(reviewId)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid course ID or review ID'
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
        
        // Only instructors can delete replies
        if (auth.user.role !== UserRole.INSTRUCTOR) {
            return NextResponse.json({
                success: false,
                error: 'Only instructors can delete replies'
            }, { status: 403 });
        }
        
        // Check if course exists and belongs to the instructor
        const course = await Course.findOne({
            _id: courseId,
            instructor: auth.user.id
        });
        
        if (!course) {
            return NextResponse.json({
                success: false,
                error: 'Course not found or you are not the instructor'
            }, { status: 404 });
        }
        
        // Find the review
        const review = await Review.findOne({
            _id: reviewId,
            course: courseId,
            status: 'published',
            isDeleted: false
        });
        
        if (!review) {
            return NextResponse.json({
                success: false,
                error: 'Review not found'
            }, { status: 404 });
        }
        
        // Check if instructor reply exists
        if (!review.instructorReply || !review.instructorReply.comment) {
            return NextResponse.json({
                success: false,
                error: 'No reply found to delete'
            }, { status: 404 });
        }
        
        // Check if the current instructor is the one who made the original reply
        if (review.instructorReply.repliedBy.toString() !== auth.user.id) {
            return NextResponse.json({
                success: false,
                error: 'You can only delete your own replies'
            }, { status: 403 });
        }
        
        // Delete the reply
        review.instructorReply = {
            comment: null,
            repliedAt: null,
            repliedBy: null
        };
        
        await review.save();
        
        return NextResponse.json({
            success: true,
            message: 'Reply deleted successfully'
        });
        
    } catch (error) {
        console.error('Error deleting instructor reply:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to delete reply'
        }, { status: 500 });
    }
}