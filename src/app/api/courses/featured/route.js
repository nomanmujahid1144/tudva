// src/app/api/courses/featured/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import User from '@/models/User';

/**
 * GET /api/courses/featured
 * Retrieves a list of featured courses for homepage or other promotional sections
 * 
 * Query Parameters:
 * - limit (number): Maximum number of courses to return, default: 6
 * - category (string): Optional filter by category
 */
export async function GET(request) {
  try {
    // Connect to the database
    await connectDB();
    
    // Parse URL and extract query parameters
    const { searchParams } = new URL(request.url);
    
    // Get limit parameter (default to 6)
    const limit = Math.min(12, Math.max(1, parseInt(searchParams.get('limit') || '6')));
    
    // Build query
    const query = {
      status: 'published',
      isDeleted: false
    };
    
    // Optional category filter
    if (searchParams.has('category') && searchParams.get('category')) {
      query.category = searchParams.get('category');
    }
    
    // Get courses with high ratings and enrollment
    const courses = await Course.find(query)
      .select('title shortDescription slug category subcategory level type thumbnailUrl iconUrl backgroundColorHex rating reviewCount enrollmentCount instructor createdAt updatedAt')
      .populate({
        path: 'instructor',
        select: 'fullName profilePicture',
        model: User
      })
      .sort({ rating: -1, enrollmentCount: -1 })
      .limit(limit)
      .lean();
    
    // Format response data
    const formattedCourses = courses.map(course => ({
      id: course._id.toString(),
      title: course.title,
      slug: course.slug,
      shortDescription: course.shortDescription || '',
      category: course.category,
      subcategory: course.subcategory,
      level: course.level,
      type: course.type,
      thumbnailUrl: course.thumbnailUrl,
      iconUrl: course.iconUrl,
      backgroundColorHex: course.backgroundColorHex,
      stats: {
        rating: course.rating || 0,
        reviewCount: course.reviewCount || 0,
        enrollmentCount: course.enrollmentCount || 0
      },
      instructor: course.instructor ? {
        id: course.instructor._id.toString(),
        name: course.instructor.fullName,
        profilePicture: course.instructor.profilePicture || null
      } : null,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt
    }));
    
    // Return the response
    return NextResponse.json({
      success: true,
      data: formattedCourses
    });
    
  } catch (error) {
    console.error('Error fetching featured courses:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch featured courses'
    }, { status: 500 });
  }
}