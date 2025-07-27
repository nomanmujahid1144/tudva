// src/app/api/scheduler/update-item-order/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CourseSchedulerEnrollment from '@/models/CourseSchedulerEnrollment';
import { authenticateRequest } from '@/middlewares/authMiddleware';
import mongoose from 'mongoose';

export async function PUT(request) {
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
    
    // Parse the request body
    const reqBody = await request.json();
    console.log(reqBody, "reqBody");
    
    // Extract parameters
    const { 
      courseId,       // ID of the course to reorder
      orderedItemIds  // Array of item IDs in their new order
    } = reqBody;
    
    // Validate required fields
    if (!courseId || !orderedItemIds || !Array.isArray(orderedItemIds)) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: courseId and orderedItemIds array'
      }, { status: 400 });
    }
    
    // Find the user's scheduler enrollment
    const scheduler = await CourseSchedulerEnrollment.findOne({
      learner: new mongoose.Types.ObjectId(auth.user.id)
    });
    
    if (!scheduler) {
      return NextResponse.json({
        success: false,
        error: 'Scheduler not found'
      }, { status: 404 });
    }
    
    console.log("Found scheduler with courses:", scheduler.scheduledCourses.length);
    
    // Find the course in the scheduler by comparing course field
    const courseIndex = scheduler.scheduledCourses.findIndex(c => 
      c.course && c.course.toString() === courseId
    );
    
    if (courseIndex === -1) {
      return NextResponse.json({
        success: false,
        error: `Course with ID ${courseId} not found in scheduler`
      }, { status: 404 });
    }
    
    console.log(`Found course at index ${courseIndex}`);
    
    // Get the items for this course
    const currentItems = scheduler.scheduledCourses[courseIndex].scheduledItems;
    console.log(`Course has ${currentItems.length} items before reordering`);
    
    // Map of all existing items by ID for quick lookup
    const itemsMap = {};
    currentItems.forEach(item => {
      itemsMap[item._id.toString()] = item;
    });
    
    // First check if all ordered items exist in this course
    for (const itemId of orderedItemIds) {
      if (!itemsMap[itemId]) {
        return NextResponse.json({
          success: false,
          error: `Item with ID ${itemId} not found in course`
        }, { status: 404 });
      }
    }
    
    // Collect all non-recorded items (like live sessions) that aren't part of the reordering
    const nonRecordedItems = currentItems.filter(item => 
      item.type !== 'recorded' || !orderedItemIds.includes(item._id.toString())
    );
    
    // Create a new array with ordered recorded items first
    const reorderedItems = [];
    
    // 1. Add all the recorded items in the specified order
    for (let i = 0; i < orderedItemIds.length; i++) {
      const itemId = orderedItemIds[i];
      const originalItem = itemsMap[itemId];
      
      if (originalItem && originalItem.type === 'recorded') {
        // Create a copy of the item with the updated lesson number
        const newItem = JSON.parse(JSON.stringify(originalItem));
        newItem.lessonNumber = i + 1;
        
        // Add to the new array
        reorderedItems.push(newItem);
        console.log(`Added item ${itemId} at position ${i} with lessonNumber=${i + 1}`);
      }
    }
    
    // 2. Add all non-recorded items after the recorded ones
    nonRecordedItems.forEach(item => {
      reorderedItems.push(JSON.parse(JSON.stringify(item)));
    });
    
    console.log(`Reordered array has ${reorderedItems.length} items`);
    
    // CRITICAL: Replace the entire scheduledItems array with the reordered one
    scheduler.scheduledCourses[courseIndex].scheduledItems = reorderedItems;
    
    // Save the updated scheduler
    await scheduler.save();
    console.log("Successfully saved reordered items");
    
    // Return success
    return NextResponse.json({
      success: true,
      message: 'Items reordered successfully',
      data: {
        updatedScheduler: scheduler
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error reordering items:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to reorder items: ' + error.message
    }, { status: 500 });
  }
}