// src/app/api/scheduler/update-item/route.js
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
    
    // Extract parameters
    const { 
      itemId,      // ID of the scheduled item
      newDate,     // New date (if rescheduling)
      newSlotId,   // New slot ID (if rescheduling)
      isCompleted, // Mark as completed
      remove,      // Remove the item
      lessonNumber // NEW: Update lesson number for ordering
    } = reqBody;
    
    // Validate required fields
    if (!itemId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: itemId'
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
    
    // Find the scheduled item
    let foundItem = null;
    let courseIndex = -1;
    let itemIndex = -1;
    
    // Loop through scheduled courses to find the item
    for (let i = 0; i < scheduler.scheduledCourses.length; i++) {
      const course = scheduler.scheduledCourses[i];
      
      for (let j = 0; j < course.scheduledItems.length; j++) {
        if (course.scheduledItems[j]._id.toString() === itemId) {
          foundItem = course.scheduledItems[j];
          courseIndex = i;
          itemIndex = j;
          break;
        }
      }
      
      if (foundItem) break;
    }
    
    if (!foundItem) {
      return NextResponse.json({
        success: false,
        error: 'Scheduled item not found'
      }, { status: 404 });
    }
    
    // Handle remove request
    if (remove === true) {
      // Remove the item
      scheduler.scheduledCourses[courseIndex].scheduledItems.splice(itemIndex, 1);
      
      // If this was the last item, remove the course too
      if (scheduler.scheduledCourses[courseIndex].scheduledItems.length === 0) {
        scheduler.scheduledCourses.splice(courseIndex, 1);
      } else {
        // Update progress if the item was completed
        if (foundItem.isCompleted) {
          scheduler.scheduledCourses[courseIndex].progress.completed -= 1;
        }
      }
    } else {
      // Handle rescheduling and completion updates
      
      // Update date and slot if provided
      if (newDate) {
        scheduler.scheduledCourses[courseIndex].scheduledItems[itemIndex].date = new Date(newDate);
      }
      
      if (newSlotId) {
        scheduler.scheduledCourses[courseIndex].scheduledItems[itemIndex].slotId = newSlotId;
      }
      
      // NEW: Update lesson number if provided
      if (lessonNumber !== undefined) {
        scheduler.scheduledCourses[courseIndex].scheduledItems[itemIndex].lessonNumber = lessonNumber;
        console.log(`Updated lessonNumber to ${lessonNumber} for item ${itemId}`);
      }
      
      // Update completion status if provided
      if (isCompleted !== undefined) {
        const previousStatus = scheduler.scheduledCourses[courseIndex].scheduledItems[itemIndex].isCompleted;
        
        scheduler.scheduledCourses[courseIndex].scheduledItems[itemIndex].isCompleted = isCompleted;
        
        // Set completed timestamp or clear it
        if (isCompleted) {
          scheduler.scheduledCourses[courseIndex].scheduledItems[itemIndex].completedAt = new Date();
        } else {
          scheduler.scheduledCourses[courseIndex].scheduledItems[itemIndex].completedAt = null;
        }
        
        // Update course progress
        if (isCompleted && !previousStatus) {
          // Item newly completed
          scheduler.scheduledCourses[courseIndex].progress.completed += 1;
        } else if (!isCompleted && previousStatus) {
          // Item marked incomplete
          scheduler.scheduledCourses[courseIndex].progress.completed -= 1;
        }
        
        // Update course status if all items completed
        if (scheduler.scheduledCourses[courseIndex].progress.completed >= 
            scheduler.scheduledCourses[courseIndex].progress.total) {
          scheduler.scheduledCourses[courseIndex].status = 'completed';
        } else {
          scheduler.scheduledCourses[courseIndex].status = 'active';
        }
      }
    }
    
    // Save the updated scheduler
    await scheduler.save();
    
    // Return success
    return NextResponse.json({
      success: true,
      message: remove ? 'Item removed successfully' : 'Item updated successfully',
      data: {
        updatedScheduler: scheduler
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error updating scheduled item:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update scheduled item'
    }, { status: 500 });
  }
}