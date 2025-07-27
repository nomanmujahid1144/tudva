// src/app/api/course/[courseId]/update-rating/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import Review from '@/models/Review';
import mongoose from 'mongoose';

export async function POST(request, { params }) {
    try {
        await connectDB();
        
        const { courseId } = params;
        
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid course ID'
            }, { status: 400 });
        }
        
        const course = await Course.findById(courseId);
        if (!course) {
            return NextResponse.json({
                success: false,
                error: 'Course not found'
            }, { status: 404 });
        }
        
        // Calculate rating statistics
        const stats = await Review.getCourseRatingStats(courseId);
        
        // Update the course
        const updatedCourse = await Course.findByIdAndUpdate(
            courseId, 
            {
                rating: stats.averageRating,
                reviewCount: stats.totalReviews
            },
            { new: true }
        );
        
        return NextResponse.json({
            success: true,
            message: 'Course rating updated successfully',
            data: {
                courseId,
                newRating: updatedCourse.rating,
                newReviewCount: updatedCourse.reviewCount,
                ratingStats: stats
            }
        });
        
    } catch (error) {
        console.error('Error updating course rating:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to update course rating'
        }, { status: 500 });
    }
}