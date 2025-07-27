// src/app/api/course/[courseId]/video/update-url/route.js
import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/middlewares/authMiddleware';
import { UserRole } from '@/models/User';
import Course from '@/models/Course';
import connectDB from '@/lib/mongodb';

export async function PUT(request, { params }) {
  try {
    await connectDB();

    // Authenticate request
    const auth = await authenticateRequest(request);
    
    if (!auth.success) {
      return NextResponse.json({
        success: false,
        error: auth.error
      }, { status: 401 });
    }
    
    // Only allow instructors to update video URLs
    if (auth.user.role !== UserRole.INSTRUCTOR) {
      return NextResponse.json({
        success: false,
        error: 'Only instructors can update video URLs'
      }, { status: 403 });
    }

    const { courseId } = params;
    const { uploadId, finalUrl } = await request.json();

    console.log('Updating video URL for course:', courseId);
    console.log('Upload ID:', uploadId);
    console.log('Final URL:', finalUrl);

    if (!uploadId || !finalUrl) {
      return NextResponse.json({
        success: false,
        error: 'Upload ID and final URL are required'
      }, { status: 400 });
    }

    // Find the course
    const course = await Course.findById(courseId);
    
    if (!course) {
      return NextResponse.json({
        success: false,
        error: 'Course not found'
      }, { status: 404 });
    }

    // Check if user owns the course
    if (course.instructor.toString() !== auth.user.id) {
      return NextResponse.json({
        success: false,
        error: 'Not authorized to update this course'
      }, { status: 403 });
    }

    // Find and update the video with the matching temp upload ID
    let videoFound = false;
    let updatedVideoInfo = null;

    for (let module of course.modules) {
      for (let video of module.videos) {
        // Check if this video has the temp upload ID
        if (video.tempUploadId === uploadId || 
            (video.url && video.url.includes('temp-')) ||
            video.uploadId === uploadId) {
          
          console.log('Found video to update:', video.title);
          
          // Update the video URL and status
          video.url = finalUrl;
          video.status = 'completed';
          video.uploadPhase = 'completed';
          video.progress = 100;
          
          // Clean up temporary fields
          delete video.tempUploadId;
          delete video.uploadId;
          delete video.currentChunk;
          delete video.totalChunks;
          delete video.timeRemaining;
          delete video.isProcessing;
          
          videoFound = true;
          updatedVideoInfo = {
            moduleTitle: module.title,
            videoTitle: video.title,
            newUrl: finalUrl
          };
          break;
        }
      }
      
      if (videoFound) break;
    }

    if (!videoFound) {
      console.log('No video found with upload ID:', uploadId);
      return NextResponse.json({
        success: false,
        error: 'Video not found with the provided upload ID'
      }, { status: 404 });
    }

    // Save the updated course
    await course.save();

    console.log('✅ Video URL updated successfully:', updatedVideoInfo);

    return NextResponse.json({
      success: true,
      message: 'Video URL updated successfully',
      data: {
        courseId,
        uploadId,
        finalUrl,
        updatedVideo: updatedVideoInfo
      }
    });

  } catch (error) {
    console.error('Error updating video URL:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update video URL'
    }, { status: 500 });
  }
}