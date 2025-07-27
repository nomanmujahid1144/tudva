// src/app/api/course/[courseId]/reviews/[reviewId]/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import { UserRole } from '@/models/User';
import { authenticateRequest } from '@/middlewares/authMiddleware';
import mongoose from 'mongoose';

// GET - Get a specific review
export async function GET(request, { params }) {
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
        
        // Find the review
        const review = await Review.findOne({
            _id: reviewId,
            course: courseId,
            status: 'published',
            isDeleted: false
        })
        .populate('user', 'fullName profilePicture')
        .populate('instructorReply.repliedBy', 'fullName profilePicture')
        .lean();
        
        if (!review) {
            return NextResponse.json({
                success: false,
                error: 'Review not found'
            }, { status: 404 });
        }
        
        // Format review for response
        const formattedReview = {
            id: review._id.toString(),
            rating: review.rating,
            comment: review.comment,
            createdAt: review.createdAt,
            helpfulVotes: review.helpfulVotes,
            unhelpfulVotes: review.unhelpfulVotes,
            isVerifiedPurchase: review.isVerifiedPurchase,
            user: {
                id: review.user._id.toString(),
                name: review.user.fullName,
                avatar: review.user.profilePicture || null
            },
            instructorReply: review.instructorReply?.comment ? {
                comment: review.instructorReply.comment,
                repliedAt: review.instructorReply.repliedAt,
                instructor: {
                    id: review.instructorReply.repliedBy._id.toString(),
                    name: review.instructorReply.repliedBy.fullName,
                    avatar: review.instructorReply.repliedBy.profilePicture || null
                }
            } : null
        };
        
        return NextResponse.json({
            success: true,
            data: formattedReview
        });
        
    } catch (error) {
        console.error('Error fetching review:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch review'
        }, { status: 500 });
    }
}

// PUT - Update a review
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
        
        // Only learners can update reviews
        if (auth.user.role !== UserRole.LEARNER) {
            return NextResponse.json({
                success: false,
                error: 'Only learners can update reviews'
            }, { status: 403 });
        }
        
        // Find the review
        const review = await Review.findOne({
            _id: reviewId,
            course: courseId,
            user: auth.user.id,
            isDeleted: false
        });
        
        if (!review) {
            return NextResponse.json({
                success: false,
                error: 'Review not found or you are not the owner'
            }, { status: 404 });
        }
        
        // Parse request body
        const { rating, comment } = await request.json();
        
        // Validate input
        if (!rating || !comment) {
            return NextResponse.json({
                success: false,
                error: 'Rating and comment are required'
            }, { status: 400 });
        }
        
        if (rating < 1 || rating > 5) {
            return NextResponse.json({
                success: false,
                error: 'Rating must be between 1 and 5'
            }, { status: 400 });
        }
        
        if (comment.length < 10) {
            return NextResponse.json({
                success: false,
                error: 'Comment must be at least 10 characters long'
            }, { status: 400 });
        }
        
        // Update the review
        review.rating = rating;
        review.comment = comment.trim();
        await review.save();
        
        // Populate user data for response
        await review.populate('user', 'fullName profilePicture');
        
        // Format response
        const formattedReview = {
            id: review._id.toString(),
            rating: review.rating,
            comment: review.comment,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt,
            helpfulVotes: review.helpfulVotes,
            unhelpfulVotes: review.unhelpfulVotes,
            isVerifiedPurchase: review.isVerifiedPurchase,
            user: {
                id: review.user._id.toString(),
                name: review.user.fullName,
                avatar: review.user.profilePicture || null
            },
            instructorReply: review.instructorReply?.comment ? {
                comment: review.instructorReply.comment,
                repliedAt: review.instructorReply.repliedAt
            } : null
        };
        
        return NextResponse.json({
            success: true,
            message: 'Review updated successfully',
            data: formattedReview
        });
        
    } catch (error) {
        console.error('Error updating review:', error);
        
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
            error: 'Failed to update review'
        }, { status: 500 });
    }
}

// DELETE - Delete a review
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
        
        // Find the review
        const review = await Review.findOne({
            _id: reviewId,
            course: courseId,
            isDeleted: false
        });
        
        if (!review) {
            return NextResponse.json({
                success: false,
                error: 'Review not found'
            }, { status: 404 });
        }
        
        // Check permissions - only the review owner or course instructor can delete
        const isOwner = review.user.toString() === auth.user.id;
        const isInstructor = auth.user.role === UserRole.INSTRUCTOR;
        
        if (!isOwner && !isInstructor) {
            return NextResponse.json({
                success: false,
                error: 'You do not have permission to delete this review'
            }, { status: 403 });
        }
        
        // If instructor is deleting, verify they own the course
        if (isInstructor && !isOwner) {
            const Course = mongoose.model('Course');
            const course = await Course.findOne({
                _id: courseId,
                instructor: auth.user.id
            });
            
            if (!course) {
                return NextResponse.json({
                    success: false,
                    error: 'You are not the instructor of this course'
                }, { status: 403 });
            }
        }
        
        // Soft delete the review
        review.isDeleted = true;
        review.deletedAt = new Date();
        await review.save();
        
        return NextResponse.json({
            success: true,
            message: 'Review deleted successfully'
        });
        
    } catch (error) {
        console.error('Error deleting review:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to delete review'
        }, { status: 500 });
    }
}