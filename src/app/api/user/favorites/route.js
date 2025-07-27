// src/app/api/user/favorites/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import User from '@/models/User';
import { authenticateRequest } from '@/middlewares/authMiddleware';

// GET - Get all favorite courses for the authenticated user
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

    // Check if user is learner
    if (auth.user.role !== 'learner') {
      return NextResponse.json({
        success: false,
        error: 'Only learners can have favorite courses'
      }, { status: 403 });
    }

    // Get URL search params for pagination and filtering
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    const type = searchParams.get('type');

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get user with favorites
    const user = await User.findById(auth.user.id).select('favorites');
    
    if (!user || !user.favorites || user.favorites.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          courses: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalCourses: 0,
            hasMore: false,
            hasPrevious: false,
            limit
          }
        }
      }, { status: 200 });
    }

    // Build filter query for courses
    const filterQuery = {
      _id: { $in: user.favorites },
      status: 'published',
      isDeleted: false
    };

    // Add optional filters
    if (category && category !== 'All') filterQuery.category = category;
    if (level && level !== 'All') filterQuery.level = level;
    if (type && type !== 'All') filterQuery.type = type;

    // Get total count for pagination
    const totalCourses = await Course.countDocuments(filterQuery);
    const totalPages = Math.ceil(totalCourses / limit);

    // Get favorite courses with pagination
    const favoriteCourses = await Course.find(filterQuery)
      .populate('instructor', 'fullName email profilePicture')
      .select([
        'title',
        'slug',
        'description',
        'shortDescription',
        'category',
        'subcategory',
        'level',
        'type',
        'thumbnailUrl',
        'iconUrl',
        'backgroundColorHex',
        'rating',
        'reviewCount',
        'enrollmentCount',
        'modules',
        'createdAt',
        'updatedAt',
        'liveCourseMeta.startDate',
        'liveCourseMeta.endDate',
        'liveCourseMeta.maxEnrollment'
      ].join(' '))
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Format the courses data to include isFavorite: true (since these are all favorites)
    const formattedCourses = favoriteCourses.map(course => ({
      id: course._id.toString(),
      title: course.title,
      slug: course.slug,
      shortDescription: course.shortDescription || '',
      description: course.description || '',
      category: course.category,
      subcategory: course.subcategory,
      level: course.level,
      type: course.type,
      thumbnailUrl: course.thumbnailUrl,
      iconUrl: course.iconUrl,
      backgroundColorHex: course.backgroundColorHex,
      isFavorite: true, // All courses in this response are favorites
      modules: course.modules || [],
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

    // Prepare pagination info
    const pagination = {
      currentPage: page,
      totalPages,
      totalCourses,
      hasMore: page < totalPages,
      hasPrevious: page > 1,
      limit
    };

    return NextResponse.json({
      success: true,
      data: {
        courses: formattedCourses,
        pagination
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching favorite courses:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch favorite courses'
    }, { status: 500 });
  }
}