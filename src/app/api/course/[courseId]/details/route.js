// src/app/api/course/[courseId]/details/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import mongoose from 'mongoose';
import { authenticateRequest } from '@/middlewares/authMiddleware';

export async function GET(request, { params }) {
  try {
    // Connect to the database
    await connectDB();
    
    const { courseId } = params;
    
    // Validate course ID
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid course ID' 
      }, { status: 400 });
    }
    
    // Authenticate the request
    const auth = await authenticateRequest(request);
    
    if (!auth.success) {
      return NextResponse.json({ 
        success: false, 
        error: auth.error 
      }, { status: 401 });
    }
    
    // Find the course with full details and populate instructor
    const course = await Course.findById(courseId)
      .populate('instructor', 'name email profilePicture')
      .lean();
    
    if (!course) {
      return NextResponse.json({ 
        success: false, 
        error: 'Course not found' 
      }, { status: 404 });
    }
    
    // Verify the user is the instructor of this course
    if (course.instructor._id.toString() !== auth.user.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'You do not have permission to view this course details' 
      }, { status: 403 });
    }
    
    // Format the response data
    const courseData = {
      id: course._id.toString(),
      title: course.title,
      slug: course.slug,
      description: course.description,
      shortDescription: course.shortDescription,
      category: course.category,
      subcategory: course.subcategory,
      level: course.level,
      language: course.language,
      type: course.type,
      price: course.price,
      status: course.status,
      promoVideoUrl: course.promoVideoUrl || null,
      thumbnailUrl: course.thumbnailUrl || null,
      iconUrl: course.iconUrl || null,
      backgroundColorHex: course.backgroundColorHex || '#ffffff',
      instructor: {
        id: course.instructor._id.toString(),
        name: course.instructor.name,
        email: course.instructor.email,
        profilePicture: course.instructor.profilePicture || null
      },
      createdAt: course.createdAt,
      updatedAt: course.updatedAt
    };
    
    // Add modules if they exist
    if (course.modules && course.modules.length > 0) {
      courseData.modules = course.modules.map(module => ({
        id: module._id.toString(),
        title: module.title,
        description: module.description || '',
        order: module.order,
        videos: module.videos ? module.videos.map(video => ({
          id: video._id.toString(),
          title: video.title,
          description: video.description || '',
          url: video.url,
          duration: video.duration || 0,
          thumbnailUrl: video.thumbnailUrl || null,
          isPreview: video.isPreview || false
        })) : []
      }));
    } else {
      courseData.modules = [];
    }
    
    // Add FAQs if they exist
    if (course.faqs && course.faqs.length > 0) {
      courseData.faqs = course.faqs;
    } else {
      courseData.faqs = [];
    }
    
    // Add tags if they exist
    if (course.tags && course.tags.length > 0) {
      courseData.tags = course.tags;
    } else {
      courseData.tags = [];
    }
    
    // Add live course meta if it exists and course type is live
    if (course.type === 'live' && course.liveCourseMeta) {
      courseData.liveCourseMeta = {
        startDate: course.liveCourseMeta.startDate,
        endDate: course.liveCourseMeta.endDate,
        plannedLessons: course.liveCourseMeta.plannedLessons,
        maxEnrollment: course.liveCourseMeta.maxEnrollment,
        timeSlots: course.liveCourseMeta.timeSlots
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