// src/app/api/course/create/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course, { CourseType, CourseStatus } from '@/models/Course';
import { UserRole } from '@/models/User';
import { authenticateRequest } from '@/middlewares/authMiddleware';

// Helper function to generate a slug
const generateSlug = (title) => {
    // Convert to lowercase and replace non-alphanumeric chars with hyphens
    const baseSlug = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    // Add a timestamp suffix to ensure uniqueness
    return `${baseSlug}-${Date.now().toString().slice(-6)}`;
};

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

        // Check if the user is an instructor
        if (auth.user.role !== UserRole.INSTRUCTOR) {
            return NextResponse.json({
                success: false,
                error: 'Only instructors can create courses'
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

        // Generate a slug for the course
        const slug = generateSlug(title);

        // Create a new course
        const newCourse = new Course({
            title,
            description,
            shortDescription: shortDescription || '',
            instructor: auth.user.id,
            category,
            subcategory,
            level,
            language: language || 'english', // Default to English
            type,
            promoVideoUrl: promoVideoUrl || '',
            status: CourseStatus.DRAFT, // Always start as draft
            slug // Explicitly set the slug
        });

        // For live courses, initialize the liveCourseMeta object
        if (type === CourseType.LIVE) {
            newCourse.liveCourseMeta = {
                plannedLessons: 0,
                maxEnrollment: 0,
                timeSlots: []
            };
        }

        // Save the course
        await newCourse.save();

        // Return success with the course ID
        return NextResponse.json({
            success: true,
            message: 'Course created successfully',
            data: {
                courseId: newCourse._id,
                slug: newCourse.slug
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating course:', error);

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
            error: 'Failed to create course'
        }, { status: 500 });
    }
}