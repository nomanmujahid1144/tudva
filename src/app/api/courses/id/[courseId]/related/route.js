// src/app/api/courses/id/[courseId]/related/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import mongoose from 'mongoose';

/**
 * GET /api/courses/id/[courseId]/related
 * Retrieves related courses based on category, subcategory, and tags
 * 
 * Path Parameters:
 * - courseId (string): ID of the source course
 * 
 * Query Parameters:
 * - limit (number): Maximum number of related courses to return, default: 4
 */
export async function GET(request, { params }) {
  try {
    // Connect to the database
    await connectDB();
    
    const { courseId } = params;
    
    // Validate courseId format
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid course ID format'
      }, { status: 400 });
    }
    
    // Parse URL and extract query parameters
    const { searchParams } = new URL(request.url);
    
    // Get limit parameter (default to 4)
    const limit = Math.min(8, Math.max(1, parseInt(searchParams.get('limit') || '4')));
    
    // Find the source course to get its category, subcategory, and tags
    const sourceCourse = await Course.findById(courseId)
      .select('category subcategory tags')
      .lean();
    
    if (!sourceCourse) {
      return NextResponse.json({
        success: false,
        error: 'Source course not found'
      }, { status: 404 });
    }
    
    // Build query to find related courses
    const query = {
      _id: { $ne: courseId },            // Exclude the source course
      status: 'published',               // Only include published courses
      isDeleted: false                   // Don't include deleted courses
    };
    
    // Create a scoring system based on similarity
    const aggregation = [
      // Match initial criteria
      { $match: query },
      
      // Add fields for scoring based on relation
      { $addFields: {
        categoryMatch: {
          $cond: [
            { $eq: ['$category', sourceCourse.category] },
            5, // Higher weight for matching category
            0
          ]
        },
        subcategoryMatch: {
          $cond: [
            { $and: [
              { $eq: ['$category', sourceCourse.category] },
              { $eq: ['$subcategory', sourceCourse.subcategory] }
            ]},
            10, // Even higher weight for matching subcategory
            0
          ]
        },
        // Score based on matching tags (if any)
        tagMatchScore: {
          $cond: [
            { $gt: [{ $size: { $ifNull: [sourceCourse.tags, []] } }, 0] },
            {
              $size: {
                $filter: {
                  input: '$tags',
                  as: 'tag',
                  cond: { $in: ['$$tag', sourceCourse.tags] }
                }
              }
            },
            0
          ]
        }
      }},
      
      // Calculate total relation score
      { $addFields: {
        relationScore: { $add: ['$categoryMatch', '$subcategoryMatch', { $multiply: ['$tagMatchScore', 2] }] }
      }},
      
      // Sort by relation score, then by rating and enrollment
      { $sort: {
        relationScore: -1,
        rating: -1,
        enrollmentCount: -1
      }},
      
      // Limit results
      { $limit: limit },
      
      // Include instructor information
      { $lookup: {
        from: 'users',
        localField: 'instructor',
        foreignField: '_id',
        as: 'instructorInfo'
      }},
      
      // Unwind instructor array (convert to single object)
      { $unwind: {
        path: '$instructorInfo',
        preserveNullAndEmptyArrays: true
      }},
      
      // Project only needed fields
      { $project: {
        _id: 1,
        title: 1,
        slug: 1,
        shortDescription: 1,
        category: 1,
        subcategory: 1,
        level: 1,
        type: 1,
        thumbnailUrl: 1,
        iconUrl: 1,
        backgroundColorHex: 1,
        rating: 1,
        reviewCount: 1,
        enrollmentCount: 1,
        createdAt: 1,
        updatedAt: 1,
        instructor: {
          _id: '$instructorInfo._id',
          fullName: '$instructorInfo.fullName',
          profilePicture: '$instructorInfo.profilePicture'
        },
        relationScore: 1 // Include this for debugging if needed
      }}
    ];
    
    // Execute the aggregation
    const relatedCourses = await Course.aggregate(aggregation);
    
    // Format response data
    const formattedCourses = relatedCourses.map(course => ({
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
    console.error('Error fetching related courses:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch related courses'
    }, { status: 500 });
  }
}