// // src/app/api/course/[courseId]/additional-info/route.js
// import { NextResponse } from 'next/server';
// import connectDB from '@/lib/mongodb';
// import Course, { CourseType, CourseStatus } from '@/models/Course';
// import mongoose from 'mongoose';
// import { authenticateRequest } from '@/middlewares/authMiddleware';

// export async function PUT(request, { params }) {
//   try {
//     // Connect to the database
//     await connectDB();

//     const { courseId } = params;

//     // Validate course ID
//     if (!mongoose.Types.ObjectId.isValid(courseId)) {
//       return NextResponse.json({
//         success: false,
//         error: 'Invalid course ID'
//       }, { status: 400 });
//     }

//     // Authenticate request
//     const auth = await authenticateRequest(request);

//     if (!auth.success) {
//       return NextResponse.json({
//         success: false,
//         error: auth.error
//       }, { status: 401 });
//     }

//     // Find the course
//     const course = await Course.findById(courseId);

//     if (!course) {
//       return NextResponse.json({
//         success: false,
//         error: 'Course not found'
//       }, { status: 404 });
//     }

//     // Verify the user is the instructor of this course
//     if (course.instructor.toString() !== auth.user.id) {
//       return NextResponse.json({
//         success: false,
//         error: 'You do not have permission to update this course'
//       }, { status: 403 });
//     }

//     // Parse the request body
//     const reqBody = await request.json();

//     // Extract data
//     const {
//       faqs,
//       tags,
//       publish,
//       liveCourseMeta,
//       courseMaterials // NEW: For backward compatibility, but we'll handle it inside liveCourseMeta
//     } = reqBody;

//     // Update FAQs
//     if (faqs && Array.isArray(faqs)) {
//       course.faqs = faqs.filter(faq => faq.question && faq.answer);
//     }

//     // Update tags
//     if (tags && Array.isArray(tags)) {
//       course.tags = tags.filter(tag => tag && typeof tag === 'string');
//     }

//     // NEW: Update live course specific details including courseMaterials
//     if (course.type === CourseType.LIVE && liveCourseMeta) {
//       // Initialize liveCourseMeta if it doesn't exist
//       if (!course.liveCourseMeta) {
//         course.liveCourseMeta = {};
//       }

//       // Update start date
//       if (liveCourseMeta.startDate) {
//         course.liveCourseMeta.startDate = new Date(liveCourseMeta.startDate);
//       }

//       // Update planned lessons
//       if (liveCourseMeta.plannedLessons && Number.isInteger(liveCourseMeta.plannedLessons)) {
//         course.liveCourseMeta.plannedLessons = liveCourseMeta.plannedLessons;
//       }

//       // Update maximum enrollment
//       if (liveCourseMeta.maxEnrollment && Number.isInteger(liveCourseMeta.maxEnrollment)) {
//         course.liveCourseMeta.maxEnrollment = liveCourseMeta.maxEnrollment;
//       }

//       // Update time slots
//       if (liveCourseMeta.timeSlots && Array.isArray(liveCourseMeta.timeSlots)) {
//         // Validate time slots
//         const validTimeSlots = liveCourseMeta.timeSlots.filter(
//           slot => slot.weekDay && slot.slot
//         );

//         course.liveCourseMeta.timeSlots = validTimeSlots;

//         // Calculate end date based on start date, planned lessons, and time slots
//         if (course.liveCourseMeta.startDate && course.liveCourseMeta.plannedLessons && validTimeSlots.length > 0) {
//           // Calculate end date
//           const lessonsPerWeek = validTimeSlots.length;
//           const weeksNeeded = Math.ceil(course.liveCourseMeta.plannedLessons / lessonsPerWeek);

//           const endDate = new Date(course.liveCourseMeta.startDate);
//           endDate.setDate(endDate.getDate() + (weeksNeeded * 7));
 
//           course.liveCourseMeta.endDate = endDate;
//         }
//       }

//       // NEW: Update course materials for live courses
//       if (liveCourseMeta.courseMaterials && Array.isArray(liveCourseMeta.courseMaterials)) {
//         // REMOVE THE FILTERING - Keep ALL materials including empty ones
//         const validMaterials = liveCourseMeta.courseMaterials
//           .filter(material => {
//             // Must have lesson number (keep this validation)
//             if (!material.lessonNumber || !Number.isInteger(material.lessonNumber) || material.lessonNumber < 1) {
//               return false;
//             }

//             // REMOVE THIS LINE - it was filtering out empty materials:
//             // return material.materialName || material.materialUrl;

//             // REPLACE WITH: Always return true to keep ALL lessons
//             return true;
//           })
//           .map(material => ({
//             lessonNumber: material.lessonNumber,
//             materialName: material.materialName ? material.materialName.trim() : '',
//             materialUrl: material.materialUrl ? material.materialUrl.trim() : '',
//             materialSize: (material.materialSize && typeof material.materialSize === 'number' && material.materialSize > 0)
//               ? material.materialSize
//               : null, // Changed from undefined to null for consistency
//             materialType: (material.materialType && typeof material.materialType === 'string')
//               ? material.materialType.trim()
//               : null, // Changed from undefined to null for consistency
//             uploadedAt: material.uploadedAt ? new Date(material.uploadedAt) : new Date(),
//             hasContent: !!(material.materialName || material.materialUrl) // Add hasContent flag
//           }))
//           // Sort by lesson number
//           .sort((a, b) => a.lessonNumber - b.lessonNumber);

//         course.liveCourseMeta.courseMaterials = validMaterials;
//       }

//       // ALSO UPDATE the backward compatibility section (around line 135):
//       else if (courseMaterials && Array.isArray(courseMaterials)) {
//         const validMaterials = courseMaterials
//           .filter(material => {
//             if (!material.lessonNumber || !Number.isInteger(material.lessonNumber) || material.lessonNumber < 1) {
//               return false;
//             }
//             // REMOVE THIS LINE:
//             // return material.materialName || material.materialUrl;

//             // REPLACE WITH:
//             return true; // Keep ALL lessons including empty ones
//           })
//           .map(material => ({
//             lessonNumber: material.lessonNumber,
//             materialName: material.materialName ? material.materialName.trim() : '',
//             materialUrl: material.materialUrl ? material.materialUrl.trim() : '',
//             materialSize: (material.materialSize && typeof material.materialSize === 'number' && material.materialSize > 0)
//               ? material.materialSize
//               : null,
//             materialType: (material.materialType && typeof material.materialType === 'string')
//               ? material.materialType.trim()
//               : null,
//             uploadedAt: material.uploadedAt ? new Date(material.uploadedAt) : new Date(),
//             hasContent: !!(material.materialName || material.materialUrl)
//           }))
//           .sort((a, b) => a.lessonNumber - b.lessonNumber);

//         course.liveCourseMeta.courseMaterials = validMaterials;
//       }
//     }

//     // Publish the course if requested
//     if (publish === true) {
//       // Check if the course can be published
//       // For recorded courses, we need modules with videos
//       if (course.type === CourseType.RECORDED) {
//         if (!course.modules || course.modules.length === 0) {
//           return NextResponse.json({
//             success: false,
//             error: 'Cannot publish a recorded course without any modules'
//           }, { status: 400 });
//         }

//         // Check if each module has at least one video
//         const hasVideos = course.modules.every(module =>
//           module.videos && module.videos.length > 0
//         );

//         if (!hasVideos) {
//           return NextResponse.json({
//             success: false,
//             error: 'Each module must have at least one video'
//           }, { status: 400 });
//         }
//       }

//       // For live courses, we need scheduled time slots
//       if (course.type === CourseType.LIVE) {
//         if (!course.liveCourseMeta ||
//           !course.liveCourseMeta.startDate ||
//           !course.liveCourseMeta.timeSlots ||
//           course.liveCourseMeta.timeSlots.length === 0) {
//           return NextResponse.json({
//             success: false,
//             error: 'Cannot publish a live course without start date and time slots'
//           }, { status: 400 });
//         }

//         if (!course.liveCourseMeta.plannedLessons || course.liveCourseMeta.plannedLessons <= 0) {
//           return NextResponse.json({
//             success: false,
//             error: 'Live courses must have at least one planned lesson'
//           }, { status: 400 });
//         }

//         if (!course.liveCourseMeta.maxEnrollment || course.liveCourseMeta.maxEnrollment <= 0) {
//           return NextResponse.json({
//             success: false,
//             error: 'Live courses must specify maximum enrollment'
//           }, { status: 400 });
//         }
//       }

//       // All checks passed, publish the course
//       course.status = CourseStatus.PUBLISHED;
//     }

//     // Save the updated course
//     await course.save();

//     // Prepare response data with material statistics
//     const responseData = {
//       courseId: course._id,
//       slug: course.slug,
//       status: course.status
//     };

//     // NEW: Add material statistics for live courses
//     if (course.type === CourseType.LIVE && course.liveCourseMeta) {
//       const courseMaterials = course.liveCourseMeta.courseMaterials || [];
//       const materialsWithFiles = courseMaterials.filter(material => material.materialUrl);

//       responseData.materialStatistics = {
//         totalLessons: course.liveCourseMeta.plannedLessons || 0,
//         lessonsWithMaterials: materialsWithFiles.length,
//         totalMaterialFiles: materialsWithFiles.length,
//         materialsByLesson: courseMaterials.map(material => ({
//           lessonNumber: material.lessonNumber,
//           hasMaterial: !!material.materialUrl,
//           materialName: material.materialName || null
//         }))
//       };
//     }

//     // Add material statistics for recorded courses
//     if (course.type === CourseType.RECORDED && course.modules) {
//       const videosWithMaterials = course.modules.reduce((count, module) => {
//         return count + module.videos.filter(video => video.materialUrl).length;
//       }, 0);

//       const totalVideos = course.modules.reduce((count, module) => count + module.videos.length, 0);

//       responseData.materialStatistics = {
//         totalVideos: totalVideos,
//         videosWithMaterials: videosWithMaterials
//       };
//     }

//     // Return success
//     return NextResponse.json({
//       success: true,
//       message: 'Course additional information updated successfully',
//       data: responseData
//     });

//   } catch (error) {
//     console.error('Error updating course additional info:', error);

//     // Handle validation errors
//     if (error.name === 'ValidationError') {
//       const validationErrors = Object.values(error.errors).map(err => err.message);
//       return NextResponse.json({
//         success: false,
//         error: `Validation error: ${validationErrors.join(', ')}`
//       }, { status: 400 });
//     }

//     return NextResponse.json({
//       success: false,
//       error: 'Failed to update course additional information'
//     }, { status: 500 });
//   }
// }

// // NEW: GET endpoint to retrieve additional info including materials
// export async function GET(request, { params }) {
//   try {
//     await connectDB();

//     const { courseId } = params;

//     if (!mongoose.Types.ObjectId.isValid(courseId)) {
//       return NextResponse.json({
//         success: false,
//         error: 'Invalid course ID'
//       }, { status: 400 });
//     }

//     const auth = await authenticateRequest(request);

//     if (!auth.success) {
//       return NextResponse.json({
//         success: false,
//         error: auth.error
//       }, { status: 401 });
//     }

//     const course = await Course.findById(courseId).select('faqs tags liveCourseMeta instructor title type status');

//     if (!course) {
//       return NextResponse.json({
//         success: false,
//         error: 'Course not found'
//       }, { status: 404 });
//     }

//     // Verify the user is the instructor of this course
//     if (course.instructor.toString() !== auth.user.id) {
//       return NextResponse.json({
//         success: false,
//         error: 'You do not have permission to view this course information'
//       }, { status: 403 });
//     }

//     return NextResponse.json({
//       success: true,
//       data: {
//         courseId: course._id,
//         courseTitle: course.title,
//         courseType: course.type,
//         status: course.status,
//         faqs: course.faqs,
//         tags: course.tags,
//         liveCourseMeta: course.liveCourseMeta
//       }
//     });

//   } catch (error) {
//     console.error('Error fetching additional info:', error);
//     return NextResponse.json({
//       success: false,
//       error: 'Failed to fetch course additional information'
//     }, { status: 500 });
//   }
// }


// src/app/api/course/[courseId]/additional-info/route.js - ENHANCED for Multiple Materials
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course, { CourseType, CourseStatus } from '@/models/Course';
import mongoose from 'mongoose';
import { authenticateRequest } from '@/middlewares/authMiddleware';

export async function PUT(request, { params }) {
  try {
    // Connect to the database
    await connectDB();
    
    const { courseId } = params;

    console.log('Updating additional info for course:', courseId);
    
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
    console.log('Request body for additional info:', JSON.stringify(reqBody, null, 2));
    
    // Extract data (keeping your original structure)
    const {
      faqs,
      tags,
      publish,
      liveCourseMeta,
      courseMaterials // For backward compatibility
    } = reqBody;
    
    // Update FAQs (keeping original)
    if (faqs && Array.isArray(faqs)) {
      course.faqs = faqs.filter(faq => faq.question && faq.answer);
    }
    
    // Update tags (keeping original)
    if (tags && Array.isArray(tags)) {
      course.tags = tags.filter(tag => tag && typeof tag === 'string');
    }
    
    // ENHANCED: Update live course specific details with multiple materials support
    if (course.type === CourseType.LIVE && liveCourseMeta) {
      // Initialize liveCourseMeta if it doesn't exist
      if (!course.liveCourseMeta) {
        course.liveCourseMeta = {};
      }

      // Update start date (keeping original)
      if (liveCourseMeta.startDate) {
        course.liveCourseMeta.startDate = new Date(liveCourseMeta.startDate);
      }

      // Update planned lessons (keeping original)
      if (liveCourseMeta.plannedLessons && Number.isInteger(liveCourseMeta.plannedLessons)) {
        course.liveCourseMeta.plannedLessons = liveCourseMeta.plannedLessons;
      }

      // Update maximum enrollment (keeping original)
      if (liveCourseMeta.maxEnrollment && Number.isInteger(liveCourseMeta.maxEnrollment)) {
        course.liveCourseMeta.maxEnrollment = liveCourseMeta.maxEnrollment;
      }

      // Update time slots (keeping original logic)
      if (liveCourseMeta.timeSlots && Array.isArray(liveCourseMeta.timeSlots)) {
        // Validate time slots
        const validTimeSlots = liveCourseMeta.timeSlots.filter(
          slot => slot.weekDay && slot.slot
        );

        course.liveCourseMeta.timeSlots = validTimeSlots;

        // Calculate end date based on start date, planned lessons, and time slots
        if (course.liveCourseMeta.startDate && course.liveCourseMeta.plannedLessons && validTimeSlots.length > 0) {
          // Calculate end date
          const lessonsPerWeek = validTimeSlots.length;
          const weeksNeeded = Math.ceil(course.liveCourseMeta.plannedLessons / lessonsPerWeek);

          const endDate = new Date(course.liveCourseMeta.startDate);
          endDate.setDate(endDate.getDate() + (weeksNeeded * 7));
 
          course.liveCourseMeta.endDate = endDate;
        }
      }

      // ENHANCED: Update course materials with MULTIPLE MATERIALS support
      if (liveCourseMeta.courseMaterials && Array.isArray(liveCourseMeta.courseMaterials)) {
        console.log('Processing course materials with multiple materials support...');
        
        const processedMaterials = liveCourseMeta.courseMaterials
          .filter(material => {
            // Must have lesson number (keep this validation)
            if (!material.lessonNumber || !Number.isInteger(material.lessonNumber) || material.lessonNumber < 1) {
              return false;
            }
            // Keep ALL lessons including empty ones
            return true;
          })
          .map(material => {
            const processedMaterial = {
              lessonNumber: material.lessonNumber,
              // ENHANCED: Multiple materials array support
              materials: [],
              // LEGACY: Single material support for backward compatibility
              materialName: material.materialName ? material.materialName.trim() : '',
              materialUrl: material.materialUrl ? material.materialUrl.trim() : '',
              materialSize: (material.materialSize && typeof material.materialSize === 'number' && material.materialSize > 0)
                ? material.materialSize
                : null,
              materialType: (material.materialType && typeof material.materialType === 'string')
                ? material.materialType.trim()
                : null,
              uploadedAt: material.uploadedAt ? new Date(material.uploadedAt) : new Date()
            };

            // ENHANCED: Process multiple materials array
            if (material.materials && Array.isArray(material.materials)) {
              console.log(`Processing ${material.materials.length} materials for lesson ${material.lessonNumber}`);
              
              processedMaterial.materials = material.materials.map(mat => ({
                name: String(mat.name || '').trim(),
                url: String(mat.url || '').trim(),
                size: Number(mat.size) || 0,
                type: String(mat.type || 'application/octet-stream').trim(),
                uploadedAt: mat.uploadedAt ? new Date(mat.uploadedAt) : new Date()
              })).filter(mat => mat.name && mat.url); // Filter out invalid materials
            }

            // LEGACY: Convert single material to materials array if needed
            if (material.materialUrl && material.materialUrl.trim()) {
              const legacyMaterial = {
                name: material.materialName || `Lesson ${material.lessonNumber} Material`,
                url: material.materialUrl.trim(),
                size: Number(material.materialSize) || 0,
                type: String(material.materialType || 'application/octet-stream').trim(),
                uploadedAt: new Date()
              };
              
              // Add to materials array if not already present
              const existingMaterial = processedMaterial.materials.find(m => m.url === legacyMaterial.url);
              if (!existingMaterial) {
                processedMaterial.materials.push(legacyMaterial);
              }
            }

            // Calculate hasContent based on both arrays and legacy fields
            const hasMultipleMaterials = processedMaterial.materials && processedMaterial.materials.length > 0;
            const hasLegacyMaterial = !!(processedMaterial.materialName || processedMaterial.materialUrl);
            processedMaterial.hasContent = hasMultipleMaterials || hasLegacyMaterial;

            return processedMaterial;
          })
          // Sort by lesson number
          .sort((a, b) => a.lessonNumber - b.lessonNumber);

        course.liveCourseMeta.courseMaterials = processedMaterials;

        // Calculate and log statistics
        const totalMaterials = processedMaterials.reduce((count, lesson) => 
          count + (lesson.materials ? lesson.materials.length : 0), 0
        );
        
        const lessonsWithContent = processedMaterials.filter(lesson => 
          lesson.hasContent
        ).length;

        console.log(`✅ Updated course materials: ${lessonsWithContent} lessons with content, ${totalMaterials} total materials`);
      }

      // ENHANCED: Backward compatibility with multiple materials
      else if (courseMaterials && Array.isArray(courseMaterials)) {
        console.log('Processing course materials via backward compatibility...');
        
        const processedMaterials = courseMaterials
          .filter(material => {
            if (!material.lessonNumber || !Number.isInteger(material.lessonNumber) || material.lessonNumber < 1) {
              return false;
            }
            return true; // Keep ALL lessons including empty ones
          })
          .map(material => {
            const processedMaterial = {
              lessonNumber: material.lessonNumber,
              // ENHANCED: Initialize materials array
              materials: [],
              // LEGACY: Single material support
              materialName: material.materialName ? material.materialName.trim() : '',
              materialUrl: material.materialUrl ? material.materialUrl.trim() : '',
              materialSize: (material.materialSize && typeof material.materialSize === 'number' && material.materialSize > 0)
                ? material.materialSize
                : null,
              materialType: (material.materialType && typeof material.materialType === 'string')
                ? material.materialType.trim()
                : null,
              uploadedAt: material.uploadedAt ? new Date(material.uploadedAt) : new Date()
            };

            // Process materials array if present
            if (material.materials && Array.isArray(material.materials)) {
              processedMaterial.materials = material.materials.map(mat => ({
                name: String(mat.name || '').trim(),
                url: String(mat.url || '').trim(),
                size: Number(mat.size) || 0,
                type: String(mat.type || 'application/octet-stream').trim(),
                uploadedAt: mat.uploadedAt ? new Date(mat.uploadedAt) : new Date()
              })).filter(mat => mat.name && mat.url);
            }

            // Calculate hasContent
            const hasMultipleMaterials = processedMaterial.materials && processedMaterial.materials.length > 0;
            const hasLegacyMaterial = !!(processedMaterial.materialName || processedMaterial.materialUrl);
            processedMaterial.hasContent = hasMultipleMaterials || hasLegacyMaterial;

            return processedMaterial;
          })
          .sort((a, b) => a.lessonNumber - b.lessonNumber);

        course.liveCourseMeta.courseMaterials = processedMaterials;
      }
    }

    // Publish the course if requested (keeping original logic)
    if (publish === true) {
      // Check if the course can be published
      // For recorded courses, we need modules with videos
      if (course.type === CourseType.RECORDED) {
        if (!course.modules || course.modules.length === 0) {
          return NextResponse.json({
            success: false,
            error: 'Cannot publish a recorded course without any modules'
          }, { status: 400 });
        }

        // Check if each module has at least one video
        const hasVideos = course.modules.every(module =>
          module.videos && module.videos.length > 0
        );

        if (!hasVideos) {
          return NextResponse.json({
            success: false,
            error: 'Each module must have at least one video'
          }, { status: 400 });
        }
      }

      // For live courses, we need scheduled time slots
      if (course.type === CourseType.LIVE) {
        if (!course.liveCourseMeta ||
          !course.liveCourseMeta.startDate ||
          !course.liveCourseMeta.timeSlots ||
          course.liveCourseMeta.timeSlots.length === 0) {
          return NextResponse.json({
            success: false,
            error: 'Cannot publish a live course without start date and time slots'
          }, { status: 400 });
        }

        if (!course.liveCourseMeta.plannedLessons || course.liveCourseMeta.plannedLessons <= 0) {
          return NextResponse.json({
            success: false,
            error: 'Live courses must have at least one planned lesson'
          }, { status: 400 });
        }

        if (!course.liveCourseMeta.maxEnrollment || course.liveCourseMeta.maxEnrollment <= 0) {
          return NextResponse.json({
            success: false,
            error: 'Live courses must specify maximum enrollment'
          }, { status: 400 });
        }
      }

      // All checks passed, publish the course
      course.status = CourseStatus.PUBLISHED;
    }

    // Save the updated course
    await course.save();

    // ENHANCED: Prepare response data with detailed material statistics
    const responseData = {
      courseId: course._id,
      slug: course.slug,
      status: course.status
    };

    // ENHANCED: Add comprehensive material statistics for live courses
    if (course.type === CourseType.LIVE && course.liveCourseMeta) {
      const courseMaterials = course.liveCourseMeta.courseMaterials || [];
      
      // Calculate multiple materials statistics
      const totalMaterials = courseMaterials.reduce((count, lesson) => 
        count + (lesson.materials ? lesson.materials.length : 0), 0
      );
      
      const lessonsWithContent = courseMaterials.filter(lesson => 
        lesson.hasContent
      ).length;
      
      const lessonsWithMultipleMaterials = courseMaterials.filter(lesson => 
        lesson.materials && lesson.materials.length > 0
      ).length;

      responseData.materialStatistics = {
        totalLessons: course.liveCourseMeta.plannedLessons || 0,
        lessonsWithContent: lessonsWithContent,
        lessonsWithMultipleMaterials: lessonsWithMultipleMaterials,
        totalMaterialFiles: totalMaterials,
        materialsByLesson: courseMaterials.map(material => ({
          lessonNumber: material.lessonNumber,
          hasContent: material.hasContent,
          materialsCount: material.materials ? material.materials.length : 0,
          legacyMaterial: material.materialName || null,
          materials: material.materials || []
        }))
      };

      responseData.liveCourseMeta = {
        plannedLessons: course.liveCourseMeta.plannedLessons,
        totalMaterials,
        lessonsWithContent,
        materialsStatistics: courseMaterials.map(lesson => ({
          lessonNumber: lesson.lessonNumber,
          materialsCount: lesson.materials ? lesson.materials.length : 0,
          hasContent: lesson.hasContent,
          materialNames: lesson.materials ? lesson.materials.map(m => m.name) : []
        }))
      };

      console.log('✅ Response statistics:', responseData.materialStatistics);
    }

    // Add material statistics for recorded courses (enhanced)
    if (course.type === CourseType.RECORDED && course.modules) {
      const videosWithMaterials = course.modules.reduce((count, module) => {
        return count + module.videos.filter(video => 
          (video.materials && video.materials.length > 0) || video.materialUrl
        ).length;
      }, 0);

      const totalVideos = course.modules.reduce((count, module) => count + module.videos.length, 0);
      
      const totalMaterials = course.modules.reduce((count, module) => {
        return count + module.videos.reduce((videoCount, video) => {
          return videoCount + (video.materials ? video.materials.length : (video.materialUrl ? 1 : 0));
        }, 0);
      }, 0);

      responseData.materialStatistics = {
        totalVideos: totalVideos,
        videosWithMaterials: videosWithMaterials,
        totalMaterials: totalMaterials
      };
    }

    // Return success
    return NextResponse.json({
      success: true,
      message: 'Course additional information updated successfully',
      data: responseData
    });

  } catch (error) {
    console.error('Error updating course additional info:', error);

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
      error: 'Failed to update course additional information'
    }, { status: 500 });
  }
}

// ENHANCED: GET endpoint with multiple materials support
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

    const course = await Course.findById(courseId).select('faqs tags liveCourseMeta instructor title type status');

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
        error: 'You do not have permission to view this course information'
      }, { status: 403 });
    }

    // ENHANCED: Add material statistics to GET response
    let materialStatistics = null;
    
    if (course.type === CourseType.LIVE && course.liveCourseMeta?.courseMaterials) {
      const courseMaterials = course.liveCourseMeta.courseMaterials;
      const totalMaterials = courseMaterials.reduce((count, lesson) => 
        count + (lesson.materials ? lesson.materials.length : 0), 0
      );
      
      materialStatistics = {
        totalLessons: course.liveCourseMeta.plannedLessons || 0,
        lessonsWithContent: courseMaterials.filter(m => m.hasContent).length,
        totalMaterials: totalMaterials
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        courseId: course._id,
        courseTitle: course.title,
        courseType: course.type,
        status: course.status,
        faqs: course.faqs,
        tags: course.tags,
        liveCourseMeta: course.liveCourseMeta,
        materialStatistics: materialStatistics
      }
    });

  } catch (error) {
    console.error('Error fetching additional info:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch course additional information'
    }, { status: 500 });
  }
}