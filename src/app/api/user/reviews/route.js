// src/app/api/user/reviews/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import { UserRole } from '@/models/User';
import { authenticateRequest } from '@/middlewares/authMiddleware';

// GET - Get current user's reviews
export async function GET(request) {
    try {
        await connectDB();
        
        // Authenticate the request
        const auth = await authenticateRequest(request);
        if (!auth.success) {
            return NextResponse.json({
                success: false,
                error: auth.error
            }, { status: 401 });
        }
        
        // Parse query parameters
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const status = searchParams.get('status') || 'published';
        
        // Calculate skip for pagination
        const skip = (page - 1) * limit;
        
        // Build query
        const query = {
            user: auth.user.id,
            isDeleted: false
        };
        
        if (status !== 'all') {
            query.status = status;
        }
        
        // Fetch user's reviews
        const reviews = await Review.find(query)
            .populate('course', 'title slug thumbnailUrl iconUrl backgroundColorHex')
            .populate('instructorReply.repliedBy', 'fullName profilePicture')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        
        // Get total count for pagination
        const totalReviews = await Review.countDocuments(query);
        
        // Calculate total pages
        const totalPages = Math.ceil(totalReviews / limit);
        
        // Format reviews for response
        const formattedReviews = reviews.map(review => ({
            id: review._id.toString(),
            rating: review.rating,
            comment: review.comment,
            status: review.status,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt,
            helpfulVotes: review.helpfulVotes,
            unhelpfulVotes: review.unhelpfulVotes,
            isVerifiedPurchase: review.isVerifiedPurchase,
            course: {
                id: review.course._id.toString(),
                title: review.course.title,
                slug: review.course.slug,
                thumbnail: review.course.thumbnailUrl,
                icon: review.course.iconUrl,
                backgroundColor: review.course.backgroundColorHex
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
        console.error('Error fetching user reviews:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch reviews'
        }, { status: 500 });
    }
}