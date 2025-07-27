// src/app/api/course/[courseId]/favourite/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import User from '@/models/User';
import { authenticateRequest } from '@/middlewares/authMiddleware';
import mongoose from 'mongoose';

// GET - Check if course is in user's favorites
export async function GET(request, { params }) {
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

        // Get user and check if course is in favorites
        const user = await User.findById(auth.user.id);
        const isFavorite = user.favorites && user.favorites.includes(courseId);

        return NextResponse.json({
            success: true,
            data: {
                isFavorite,
                courseId
            }
        }, { status: 200 });

    } catch (error) {
        console.error('Error checking favorite status:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to check favorite status'
        }, { status: 500 });
    }
}

// POST - Add course to favorites
export async function POST(request, { params }) {
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

        const { courseId } = params;

        // Validate courseId
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid course ID'
            }, { status: 400 });
        }

        // Check if course exists and is published
        const course = await Course.findById(courseId);
        if (!course) {
            return NextResponse.json({
                success: false,
                error: 'Course not found'
            }, { status: 404 });
        }

        if (course.status !== 'published') {
            return NextResponse.json({
                success: false,
                error: 'Cannot favorite unpublished courses'
            }, { status: 400 });
        }

        // Add course to user's favorites (using $addToSet to avoid duplicates)
        const updatedUser = await User.findByIdAndUpdate(
            auth.user.id,
            { 
                $addToSet: { favorites: courseId }
            },
            { 
                new: true,
                upsert: false // Don't create user if not exists
            }
        );

        if (!updatedUser) {
            return NextResponse.json({
                success: false,
                error: 'User not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Course added to favorites',
            data: {
                courseId,
                isFavorite: true
            }
        }, { status: 200 });

    } catch (error) {
        console.error('Error adding course to favorites:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to add course to favorites'
        }, { status: 500 });
    }
}

// DELETE - Remove course from favorites
export async function DELETE(request, { params }) {
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

        const { courseId } = params;

        // Validate courseId
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid course ID'
            }, { status: 400 });
        }

        // Remove course from user's favorites
        const updatedUser = await User.findByIdAndUpdate(
            auth.user.id,
            { 
                $pull: { favorites: courseId }
            },
            { 
                new: true,
                upsert: false
            }
        );

        if (!updatedUser) {
            return NextResponse.json({
                success: false,
                error: 'User not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Course removed from favorites',
            data: {
                courseId,
                isFavorite: false
            }
        }, { status: 200 });

    } catch (error) {
        console.error('Error removing course from favorites:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to remove course from favorites'
        }, { status: 500 });
    }
}