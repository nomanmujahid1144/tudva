// src/app/api/course/[courseId]/reviews/[reviewId]/vote/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import { UserRole } from '@/models/User';
import { authenticateRequest } from '@/middlewares/authMiddleware';
import mongoose from 'mongoose';

// POST - Vote on a review (helpful/unhelpful)
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
        
        // Only learners can vote on reviews
        if (auth.user.role !== UserRole.LEARNER) {
            return NextResponse.json({
                success: false,
                error: 'Only learners can vote on reviews'
            }, { status: 403 });
        }
        
        // Parse request body
        const { voteType } = await request.json();
        
        // Validate vote type
        if (!voteType || !['helpful', 'unhelpful'].includes(voteType)) {
            return NextResponse.json({
                success: false,
                error: 'Vote type must be either "helpful" or "unhelpful"'
            }, { status: 400 });
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
        
        // Check if user is trying to vote on their own review
        if (review.user.toString() === auth.user.id) {
            return NextResponse.json({
                success: false,
                error: 'You cannot vote on your own review'
            }, { status: 400 });
        }
        
        // Check if user has already voted
        const existingVoteType = review.getUserVoteType(auth.user.id);
        
        if (existingVoteType === voteType) {
            // User is trying to vote the same way again, remove the vote
            await review.removeVote(auth.user.id);
            
            return NextResponse.json({
                success: true,
                message: 'Vote removed successfully',
                data: {
                    helpfulVotes: review.helpfulVotes,
                    unhelpfulVotes: review.unhelpfulVotes,
                    userVote: null
                }
            });
        } else {
            // Add or update the vote
            await review.addVote(auth.user.id, voteType);
            
            return NextResponse.json({
                success: true,
                message: 'Vote recorded successfully',
                data: {
                    helpfulVotes: review.helpfulVotes,
                    unhelpfulVotes: review.unhelpfulVotes,
                    userVote: voteType
                }
            });
        }
        
    } catch (error) {
        console.error('Error voting on review:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to record vote'
        }, { status: 500 });
    }
}

// GET - Get user's vote on a review
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
            status: 'published',
            isDeleted: false
        });
        
        if (!review) {
            return NextResponse.json({
                success: false,
                error: 'Review not found'
            }, { status: 404 });
        }
        
        // Get user's vote
        const userVote = review.getUserVoteType(auth.user.id);
        
        return NextResponse.json({
            success: true,
            data: {
                helpfulVotes: review.helpfulVotes,
                unhelpfulVotes: review.unhelpfulVotes,
                userVote: userVote
            }
        });
        
    } catch (error) {
        console.error('Error getting vote information:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to get vote information'
        }, { status: 500 });
    }
}