// src/app/api/courses/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import User from '@/models/User';
import { authenticateRequest } from '@/middlewares/authMiddleware';

export async function GET(request) {
  try {
    // Connect to the database
    await connectDB();

    // Parse URL and extract query parameters
    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12')));
    const skip = (page - 1) * limit;
    
    // Sorting parameters
    const allowedSortFields = ['createdAt', 'title', 'enrollmentCount', 'rating'];
    let sort = searchParams.get('sort') || '-createdAt';
    
    // Validate sort parameter
    const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
    if (!allowedSortFields.includes(sortField)) {
      sort = '-createdAt'; // Default sort if invalid
    }
    
    // Build filter query
    const query = {
      status: 'published', // Only show published courses
      isDeleted: false     // Don't show deleted courses
    };
    
    // Category filter
    if (searchParams.has('category') && searchParams.get('category')) {
      query.category = searchParams.get('category');
    }
    
    // Subcategory filter
    if (searchParams.has('subcategory') && searchParams.get('subcategory')) {
      query.subcategory = searchParams.get('subcategory');
    }
    
    // Level filter
    if (searchParams.has('level') && searchParams.get('level')) {
      query.level = searchParams.get('level');
    }
    
    // Type filter (recorded or live)
    if (searchParams.has('type') && searchParams.get('type')) {
      query.type = searchParams.get('type');
    }
    
    // Rating filter
    if (searchParams.has('rating')) {
      const minRating = parseFloat(searchParams.get('rating'));
      if (!isNaN(minRating) && minRating > 0) {
        query.rating = { $gte: minRating };
      }
    }
    
    // Search query
    if (searchParams.has('search') && searchParams.get('search').trim()) {
      const searchQuery = searchParams.get('search').trim();
      query.$or = [
        { title: { $regex: searchQuery, $options: 'i' } },
        { shortDescription: { $regex: searchQuery, $options: 'i' } },
        { tags: { $in: [new RegExp(searchQuery, 'i')] } }
      ];
    }

    console.log('Query:', JSON.stringify(query));
    console.log('Sort:', sort);
    
    // Execute the query with pagination
    const courses = await Course.find(query)
      .select('title shortDescription slug category subcategory level type iconUrl thumbnailUrl backgroundColorHex rating reviewCount enrollmentCount instructor createdAt updatedAt')
      .populate({
        path: 'instructor',
        select: 'fullName profilePicture',
        model: User
      })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count for pagination
    const totalCourses = await Course.countDocuments(query);
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalCourses / limit);
    const hasMore = page < totalPages;
    const hasPrevious = page > 1;

    // Check authentication for favorites
    let userFavorites = [];
    const auth = await authenticateRequest(request);
    
    if (auth.success) {
      // Get user's favorites if authenticated
      const user = await User.findById(auth.user.id).select('favorites').lean();
      if (user && user.favorites && user.favorites.length > 0) {
        // Convert ObjectIds to strings for comparison
        userFavorites = user.favorites.map(fav => {
          // Handle both ObjectId and string formats
          return typeof fav === 'object' && fav._id ? fav._id.toString() : fav.toString();
        });
      }
    }
    
    // Format response data with favorite status
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
      isFavorite: userFavorites.includes(course._id.toString()),
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
      data: {
        courses: formattedCourses,
        pagination: {
          page,
          limit,
          totalItems: totalCourses,
          totalPages,
          hasMore,
          hasPrevious
        },
        meta: {
          isAuthenticated: auth.success,
          totalFavorites: userFavorites.length
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching courses:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch courses'
    }, { status: 500 });
  }
}