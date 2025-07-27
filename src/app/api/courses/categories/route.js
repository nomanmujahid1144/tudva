// src/app/api/courses/categories/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import { CourseCategory, CourseSubcategory, CourseLevel, CourseType } from '@/models/Course';

/**
 * GET /api/courses/categories
 * Retrieves all available course categories and subcategories
 * with counts of published courses for each
 */
export async function GET() {
  try {
    // Connect to the database
    await connectDB();
    
    // Get only published and non-deleted courses
    const query = { 
      status: 'published',
      isDeleted: false 
    };
    
    // Aggregate to get categories, subcategories and their counts
    const categoryCounts = await Course.aggregate([
      // Match only published courses
      { $match: query },
      
      // Group by category and subcategory
      {
        $group: {
          _id: {
            category: '$category',
            subcategory: '$subcategory'
          },
          count: { $sum: 1 }
        }
      },
      
      // Group again to organize by category with subcategories
      {
        $group: {
          _id: '$_id.category',
          totalCount: { $sum: '$count' },
          subcategories: {
            $push: {
              name: '$_id.subcategory',
              count: '$count'
            }
          }
        }
      },
      
      // Format the output
      {
        $project: {
          _id: 0,
          category: '$_id',
          count: '$totalCount',
          subcategories: {
            $filter: {
              input: '$subcategories',
              as: 'subcategory',
              cond: { $ne: ['$$subcategory.name', null] }
            }
          }
        }
      },
      
      // Sort by category name
      { $sort: { category: 1 } }
    ]);
    
    // Get course levels with counts
    const levelCounts = await Course.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          level: '$_id',
          count: 1
        }
      },
      { $sort: { level: 1 } }
    ]);
    
    // Get course types with counts
    const typeCounts = await Course.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          type: '$_id',
          count: 1
        }
      },
      { $sort: { type: 1 } }
    ]);
    
    // Add all available categories from the enum if not present in results
    const allCategories = Object.values(CourseCategory);
    const existingCategories = categoryCounts.map(cat => cat.category);
    
    allCategories.forEach(category => {
      if (!existingCategories.includes(category)) {
        categoryCounts.push({
          category,
          count: 0,
          subcategories: []
        });
      }
    });
    
    // Return the response with all available options
    return NextResponse.json({
      success: true,
      data: {
        categories: categoryCounts,
        levels: levelCounts,
        types: typeCounts,
        // Include the full set of options from enums
        allOptions: {
          categories: Object.values(CourseCategory),
          subcategories: Object.values(CourseSubcategory),
          levels: Object.values(CourseLevel),
          types: Object.values(CourseType)
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching course categories:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch course categories'
    }, { status: 500 });
  }
}