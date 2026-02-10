// src/app/api/courses/search/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Return empty results if query is too short
    if (query.length < 2) {
      return NextResponse.json({
        success: true,
        data: {
          courses: [],
          total: 0
        }
      });
    }

    // Build search query
    const searchQuery = {
      status: 'published',
      isDeleted: false,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { shortDescription: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { subcategory: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    };

    // Execute search with limit
    const courses = await Course.find(searchQuery)
      .populate('instructor', 'name profilePicture')
      .select('title slug shortDescription category subcategory level type backgroundColorHex iconUrl instructor')
      .limit(limit)
      .lean();

    // Get total count
    const total = await Course.countDocuments(searchQuery);

    // Format results
    const formattedCourses = courses.map(course => ({
      id: course._id.toString(),
      title: course.title,
      slug: course.slug,
      shortDescription: course.shortDescription,
      category: course.category,
      subcategory: course.subcategory,
      level: course.level,
      type: course.type,
      backgroundColorHex: course.backgroundColorHex || '#630000',
      iconUrl: course.iconUrl,
      instructor: {
        name: course.instructor?.name || 'Unknown Instructor',
        profilePicture: course.instructor?.profilePicture
      }
    }));

    return NextResponse.json({
      success: true,
      data: {
        courses: formattedCourses,
        total: total,
        query: query
      }
    });

  } catch (error) {
    console.error('Error searching courses:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to search courses'
    }, { status: 500 });
  }
}