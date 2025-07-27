// src/app/api/course/instructor/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import { authenticateRequest } from '@/middlewares/authMiddleware';

export async function GET(request) {
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
    
    // Get the instructor ID from the authenticated user
    const instructorId = auth.user.id;
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status') || null;
    const sort = searchParams.get('sort') || '-createdAt'; // Default sort by newest first
    
    // Calculate skip for pagination
    const skip = (page - 1) * limit;
    
    // Build query - only courses where the user is the instructor
    const query = { instructor: instructorId };
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }
    
    // Execute query with pagination and sorting
    const courses = await Course.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('_id title slug shortDescription status type createdAt thumbnailUrl iconUrl backgroundColorHex')
      .lean();
    
    // Get total count for pagination
    const totalCourses = await Course.countDocuments(query);
    
    // Calculate total pages
    const totalPages = Math.ceil(totalCourses / limit);
    
    // Format response data
    const formattedCourses = courses.map(course => ({
      id: course._id.toString(),
      title: course.title,
      slug: course.slug,
      shortDescription: course.shortDescription,
      status: course.status,
      type: course.type,
      createdAt: course.createdAt,
      thumbnailUrl: course.thumbnailUrl || null,
      iconUrl: course.iconUrl || null,
      backgroundColorHex: course.backgroundColorHex || '#ffffff'
    }));
    
    // Return paginated results
    return NextResponse.json({
      success: true,
      data: {
        courses: formattedCourses,
        pagination: {
          page,
          limit,
          totalCourses,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching instructor courses:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch instructor courses'
    }, { status: 500 });
  }
}