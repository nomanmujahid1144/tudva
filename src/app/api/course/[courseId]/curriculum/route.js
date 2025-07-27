// src/app/api/course/[courseId]/curriculum/route.js - FIXED for Multiple Materials
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import mongoose from 'mongoose';
import { authenticateRequest } from '@/middlewares/authMiddleware';

export async function PUT(request, { params }) {
  try {
    // Connect to the database
    await connectDB();
    
    const { courseId } = params;

    console.log('Updating curriculum for course:', courseId);
    
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
    
    // Find the course
    const course = await Course.findById(courseId);
    
    if (!course) {
      return NextResponse.json({ 
        success: false, 
        error: 'Course not found' 
      }, { status: 404 });
    }
    
    // Verify the user is the instructor of this course
    if (course.instructor.toString() !== auth.user.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'You do not have permission to update this course' 
      }, { status: 403 });
    }
    
    // Parse the request body
    const reqBody = await request.json();

    console.log('Request body:', reqBody.modules);
    
    // Extract modules
    const { modules } = reqBody;
    
    if (!modules || !Array.isArray(modules)) {
      return NextResponse.json({
        success: false,
        error: 'Modules array is required'
      }, { status: 400 });
    }
    
    // FIXED: Validate modules with multiple materials support
    for (let i = 0; i < modules.length; i++) {
      const module = modules[i];
      
      if (!module.title) {
        return NextResponse.json({
          success: false,
          error: `Module at index ${i} is missing a title`
        }, { status: 400 });
      }
      
      // Ensure each module has an order property (1-based)
      module.order = i + 1;
      
      // Make sure videos array exists
      if (!module.videos) {
        module.videos = [];
      }
      
      // ENHANCED: Validate videos with multiple materials support
      if (Array.isArray(module.videos)) {
        for (let j = 0; j < module.videos.length; j++) {
          const video = module.videos[j];
          
          if (!video.title || !video.url) {
            return NextResponse.json({
              success: false,
              error: `Video at index ${j} in module ${i + 1} is missing required fields (title or url)`
            }, { status: 400 });
          }
          
          // FIXED: Process multiple materials array (matches your Course model)
          if (video.materials && Array.isArray(video.materials)) {
            // Validate and clean materials array
            video.materials = video.materials.map(material => {
              // Validate required fields
              if (!material.name || !material.url) {
                console.warn(`Invalid material in video "${video.title}": missing name or url`);
                return null; // Mark for removal
              }
              
              return {
                name: String(material.name).trim(),
                url: String(material.url).trim(),
                size: Number(material.size) || 0,
                type: String(material.type || 'application/octet-stream').trim(),
                uploadedAt: material.uploadedAt ? new Date(material.uploadedAt) : new Date()
              };
            }).filter(material => material !== null); // Remove invalid materials
            
            console.log(`Video "${video.title}" has ${video.materials.length} valid materials`);
          } else {
            // Initialize empty materials array if not provided
            video.materials = [];
          }
          
          // LEGACY: Handle single material conversion to materials array
          if (video.materialUrl && typeof video.materialUrl === 'string' && video.materialUrl.trim()) {
            const legacyMaterial = {
              name: video.materialName || `Material for ${video.title}`,
              url: video.materialUrl.trim(),
              size: Number(video.materialSize) || 0,
              type: String(video.materialType || 'application/octet-stream').trim(),
              uploadedAt: new Date()
            };
            
            // Add legacy material to materials array if not already present
            const existingMaterial = video.materials.find(m => m.url === legacyMaterial.url);
            if (!existingMaterial) {
              video.materials.push(legacyMaterial);
              console.log(`Added legacy material to "${video.title}"`);
            }
            
            // Keep legacy fields for backward compatibility
            video.materialName = video.materialName;
            video.materialSize = video.materialSize;
            video.materialType = video.materialType;
            video.materialUrl = video.materialUrl;
          } else {
            // Clear legacy fields if no materialUrl
            video.materialUrl = undefined;
            video.materialName = undefined;
            video.materialSize = undefined;
            video.materialType = undefined;
          }
          
          // Ensure required video fields are properly typed
          if (video.duration !== undefined && typeof video.duration !== 'number') {
            video.duration = undefined;
          }
          
          if (video.isPreview !== undefined && typeof video.isPreview !== 'boolean') {
            video.isPreview = false;
          }
        }
      }
    }
    
    // Update course with modules
    course.modules = modules;
    
    // Save the updated course
    await course.save();
    
    // ENHANCED: Calculate statistics including multiple materials
    const totalVideos = modules.reduce((count, module) => count + module.videos.length, 0);
    
    const videosWithMaterials = modules.reduce((count, module) => {
      return count + module.videos.filter(video => 
        (video.materials && video.materials.length > 0) || video.materialUrl
      ).length;
    }, 0);
    
    const totalMaterials = modules.reduce((count, module) => {
      return count + module.videos.reduce((videoCount, video) => {
        return videoCount + (video.materials ? video.materials.length : (video.materialUrl ? 1 : 0));
      }, 0);
    }, 0);
    
    console.log(`Updated curriculum: ${totalVideos} videos, ${videosWithMaterials} with materials, ${totalMaterials} total materials`);
    
    // Return success with enhanced statistics
    return NextResponse.json({
      success: true,
      message: 'Course curriculum updated successfully',
      data: {
        courseId: course._id,
        slug: course.slug,
        moduleCount: modules.length,
        totalVideos: totalVideos,
        videosWithMaterials: videosWithMaterials,
        totalMaterials: totalMaterials,
        statistics: {
          modules: modules.map(module => ({
            title: module.title,
            videoCount: module.videos.length,
            videosWithMaterials: module.videos.filter(video => 
              (video.materials && video.materials.length > 0) || video.materialUrl
            ).length,
            totalMaterials: module.videos.reduce((count, video) => {
              return count + (video.materials ? video.materials.length : (video.materialUrl ? 1 : 0));
            }, 0)
          }))
        }
      }
    });
    
  } catch (error) {
    console.error('Error updating course curriculum:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json({
        success: false,
        error: `Validation error: ${validationErrors.join(', ')}`
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update course curriculum'
    }, { status: 500 });
  }
}

// ENHANCED: GET endpoint to retrieve curriculum with multiple materials
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { courseId } = params;
    
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid course ID' 
      }, { status: 400 });
    }
    
    const auth = await authenticateRequest(request);
    
    if (!auth.success) {
      return NextResponse.json({ 
        success: false, 
        error: auth.error 
      }, { status: 401 });
    }
    
    const course = await Course.findById(courseId).select('modules instructor title type');
    
    if (!course) {
      return NextResponse.json({ 
        success: false, 
        error: 'Course not found' 
      }, { status: 404 });
    }
    
    // Verify the user is the instructor of this course
    if (course.instructor.toString() !== auth.user.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'You do not have permission to view this curriculum' 
      }, { status: 403 });
    }
    
    // ENHANCED: Calculate statistics with multiple materials support
    const totalVideos = course.modules.reduce((count, module) => count + module.videos.length, 0);
    
    const videosWithMaterials = course.modules.reduce((count, module) => {
      return count + module.videos.filter(video => 
        (video.materials && video.materials.length > 0) || video.materialUrl
      ).length;
    }, 0);
    
    const totalMaterials = course.modules.reduce((count, module) => {
      return count + module.videos.reduce((videoCount, video) => {
        return videoCount + (video.materials ? video.materials.length : (video.materialUrl ? 1 : 0));
      }, 0);
    }, 0);
    
    return NextResponse.json({
      success: true,
      data: {
        courseId: course._id,
        courseTitle: course.title,
        courseType: course.type,
        modules: course.modules,
        statistics: {
          totalModules: course.modules.length,
          totalVideos: totalVideos,
          videosWithMaterials: videosWithMaterials,
          totalMaterials: totalMaterials
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching curriculum:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch curriculum'
    }, { status: 500 });
  }
}