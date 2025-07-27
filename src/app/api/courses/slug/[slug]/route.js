// src/app/api/courses/slug/[slug]/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course, { TimeSlotDisplay } from '@/models/Course';
import User from '@/models/User';

/**
 * GET /api/courses/slug/[slug]
 * Retrieves detailed course information by slug
 * 
 * Path Parameters:
 * - slug (string): Course slug
 */
export async function GET(request, { params }) {
  try {
    // Connect to the database
    await connectDB();
    
    const { slug } = params;
    
    if (!slug) {
      return NextResponse.json({
        success: false,
        error: 'Course slug is required'
      }, { status: 400 });
    }
    
    // Find the course by slug
    const course = await Course.findOne({ 
      slug,
      status: 'published',
      isDeleted: false 
    })
    .populate({
      path: 'instructor',
      select: 'fullName email profilePicture aboutMe',
      model: User
    })
    .lean();
    
    if (!course) {
      return NextResponse.json({
        success: false,
        error: 'Course not found'
      }, { status: 404 });
    }
    
    // Format module structure - show restricted version for non-enrolled users
    // Only include basic module info and preview videos
    const modules = course.modules ? course.modules.map(module => ({
      id: module._id.toString(),
      title: module.title,
      description: module.description || '',
      order: module.order,
      // Only include preview videos or basic info about videos
      videos: module.videos ? module.videos.map(video => ({
        id: video._id.toString(),
        title: video.title,
        duration: video.duration,
        isPreview: video.isPreview,
        // Include video URL only for preview videos
        url: video.isPreview ? video.url : null,
        thumbnailUrl: video.thumbnailUrl || null
      })) : []
    })) : [];
    
    // Format response data
    const courseData = {
      id: course._id.toString(),
      title: course.title,
      slug: course.slug,
      description: course.description,
      shortDescription: course.shortDescription || '',
      category: course.category,
      subcategory: course.subcategory,
      level: course.level,
      language: course.language,
      type: course.type,
      thumbnailUrl: course.thumbnailUrl,
      iconUrl: course.iconUrl,
      backgroundColorHex: course.backgroundColorHex,
      promoVideoUrl: course.promoVideoUrl || null,
      stats: {
        rating: course.rating || 0,
        reviewCount: course.reviewCount || 0,
        enrollmentCount: course.enrollmentCount || 0
      },
      instructor: {
        id: course.instructor._id.toString(),
        name: course.instructor.fullName,
        profilePicture: course.instructor.profilePicture || null,
        aboutMe: course.instructor.aboutMe || ''
      },
      modules: modules,
      faqs: course.faqs || [],
      tags: course.tags || [],
      createdAt: course.createdAt,
      updatedAt: course.updatedAt
    };
    
    // If it's a live course, include live course meta
    if (course.type === 'live' && course.liveCourseMeta) {
      courseData.liveCourseMeta = {
        startDate: course.liveCourseMeta.startDate,
        endDate: course.liveCourseMeta.endDate,
        plannedLessons: course.liveCourseMeta.plannedLessons,
        maxEnrollment: course.liveCourseMeta.maxEnrollment,
        currentEnrollment: course.enrollmentCount || 0,
        // Format time slots with display values
        timeSlots: course.liveCourseMeta.timeSlots ? course.liveCourseMeta.timeSlots.map(slot => ({
          weekDay: slot.weekDay,
          slot: slot.slot,
          displayTime: TimeSlotDisplay[slot.slot],
          // Include additional session data if available
          matrixRoomId: slot.matrixRoomId,
          recordingUrl: slot.recordingUrl,
          sessionDate: slot.sessionDate,
          sessionStatus: slot.sessionStatus
        })) : []
      };
    }
    
    // Return the course data
    return NextResponse.json({
      success: true,
      data: courseData
    });
    
  } catch (error) {
    console.error('Error fetching course details:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch course details'
    }, { status: 500 });
  }
}