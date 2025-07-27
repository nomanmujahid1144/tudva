// src/app/api/course/[courseId]/reviews/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import Review from '@/models/Review';
import User, { UserRole } from '@/models/User';
import { authenticateRequest } from '@/middlewares/authMiddleware';
import mongoose from 'mongoose';

// GET - Fetch reviews for a course
export async function GET(request, { params }) {
    try {
        await connectDB();
        
        const { courseId } = params;
        
        // Validate courseId
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid course ID'
            }, { status: 400 });
        }
        
        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return NextResponse.json({
                success: false,
                error: 'Course not found'
            }, { status: 404 });
        }
        
        // Parse query parameters
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const sortBy = searchParams.get('sortBy') || 'newest'; // newest, oldest, helpful, rating_high, rating_low
        
        // Calculate skip for pagination
        const skip = (page - 1) * limit;
        
        // Build sort criteria
        let sortCriteria = {};
        switch (sortBy) {
            case 'oldest':
                sortCriteria = { createdAt: 1 };
                break;
            case 'helpful':
                sortCriteria = { helpfulVotes: -1, createdAt: -1 };
                break;
            case 'rating_high':
                sortCriteria = { rating: -1, createdAt: -1 };
                break;
            case 'rating_low':
                sortCriteria = { rating: 1, createdAt: -1 };
                break;
            case 'newest':
            default:
                sortCriteria = { createdAt: -1 };
                break;
        }
        
        // Fetch reviews with pagination
        const reviews = await Review.find({
            course: courseId,
            status: 'published',
            isDeleted: false
        })
        .populate('user', 'fullName profilePicture')
        .populate('instructorReply.repliedBy', 'fullName profilePicture')
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .lean();
        
        // Get total count for pagination
        const totalReviews = await Review.countDocuments({
            course: courseId,
            status: 'published',
            isDeleted: false
        });
        
        // Get course rating statistics
        const ratingStats = await Review.getCourseRatingStats(courseId);
        
        // Calculate total pages
        const totalPages = Math.ceil(totalReviews / limit);
        
        // Format reviews for response
        const formattedReviews = reviews.map(review => ({
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
        }));
        
        return NextResponse.json({
            success: true,
            data: {
                reviews: formattedReviews,
                ratingStats,
                pagination: {
                    page,
                    limit,
                    totalReviews,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });
        
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch reviews'
        }, { status: 500 });
    }
}

// POST - Create a new review
export async function POST(request, { params }) {
    try {
        await connectDB();
        
        const { courseId } = params;
        
        // Validate courseId
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
        
        // Only learners can create reviews
        if (auth.user.role !== UserRole.LEARNER) {
            return NextResponse.json({
                success: false,
                error: 'Only learners can write reviews'
            }, { status: 403 });
        }
        
        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return NextResponse.json({
                success: false,
                error: 'Course not found'
            }, { status: 404 });
        }
        
        // Check if user already has an active (non-deleted) review for this course
        const existingReview = await Review.findOne({
            course: courseId,
            user: auth.user.id,
            isDeleted: false
        });
        
        if (existingReview) {
            return NextResponse.json({
                success: false,
                error: 'You have already reviewed this course'
            }, { status: 400 });
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
        
        // TODO: Check if user is enrolled in the course (when enrollment system is implemented)
        // For now, we'll set isVerifiedPurchase to false
        const isVerifiedPurchase = false;
        
        // Create the review
        const review = new Review({
            course: courseId,
            user: auth.user.id,
            rating,
            comment: comment.trim(),
            isVerifiedPurchase
        });
        
        await review.save();
        
        // Populate user data for response
        await review.populate('user', 'fullName profilePicture');
        
        // Format response
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
            instructorReply: null
        };
        
        return NextResponse.json({
            success: true,
            message: 'Review created successfully',
            data: formattedReview
        }, { status: 201 });
        
    } catch (error) {
        console.error('Error creating review:', error);
        
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
            error: 'Failed to create review'
        }, { status: 500 });
    }
}