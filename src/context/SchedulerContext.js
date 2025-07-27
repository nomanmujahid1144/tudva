// src/context/SchedulerContext.js
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import schedulerService from '@/services/schedulerService';
import { toast } from 'sonner';

// Create the context
const SchedulerContext = createContext();

// Hook to use the scheduler context
export const useSchedulerContext = () => useContext(SchedulerContext);

// Time slots definition (matching the ones in your component)
const TIME_SLOTS = [
  { id: 'slot_1', name: 'SLOT 1', time: '9:00 - 9:40' },
  { id: 'slot_2', name: 'SLOT 2', time: '9:45 - 10:25' },
  { id: 'slot_3', name: 'SLOT 3', time: '10:45 - 11:25' },
  { id: 'slot_4', name: 'SLOT 4', time: '11:30 - 12:10' },
  { id: 'slot_5', name: 'SLOT 5', time: '13:35 - 14:15' },
  { id: 'slot_6', name: 'SLOT 6', time: '14:20 - 15:00' }
];

// SchedulerProvider component
export const SchedulerProvider = ({ children }) => {
  // State for UI
  const [isLoading, setIsLoading] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  // State for scheduler data
  const [calendarDates, setCalendarDates] = useState([]);
  const [scheduledItems, setScheduledItems] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  
  // State for filters in side panel
  const [searchQuery, setSearchQuery] = useState('');
  const [courseTypeFilter, setCourseTypeFilter] = useState('');
  
  // Get the next closest Wednesday from any date
  const getNextWednesday = (date) => {
    const result = new Date(date);
    result.setDate(result.getDate() + (3 - result.getDay() + 7) % 7);
    return result;
  };

  // Get a range of consecutive Wednesdays
  const getWednesdayDates = (startDate, count) => {
    const dates = [];
    let currentWednesday = getNextWednesday(startDate);

    for (let i = 0; i < count; i++) {
      const date = new Date(currentWednesday);
      dates.push({
        date,
        formatted: date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        isToday: date.toDateString() === new Date().toDateString()
      });

      // Add 7 days to get next Wednesday
      currentWednesday.setDate(currentWednesday.getDate() + 7);
    }

    return dates;
  };

  // Initialize calendar dates
  useEffect(() => {
    // Initialize calendar with exactly 52 Wednesdays (1 year)
    const dates = getWednesdayDates(new Date(), 52);
    setCalendarDates(dates);
  }, []);

  // Load user's schedule
  const loadUserSchedule = async () => {
    setIsLoading(true);
    try {
      const result = await schedulerService.getUserSchedule();
      if (result.success) {
        setScheduledItems(result.data.scheduledItems || []);
        return true;
      } else {
        toast.error(result.error || 'Failed to load your schedule');
        return false;
      }
    } catch (error) {
      console.error('Error loading user schedule:', error);
      toast.error('Failed to load your schedule');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Load available courses for the side panel
  const loadAvailableCourses = async () => {
    setIsLoading(true);
    try {
      const params = {
        query: searchQuery,
        type: courseTypeFilter
      };
      
      const result = await schedulerService.getAvailableCourses(params);
      if (result.success) {
        setAvailableCourses(result.data.courses || []);
        return true;
      } else {
        toast.error(result.error || 'Failed to load available courses');
        return false;
      }
    } catch (error) {
      console.error('Error loading available courses:', error);
      toast.error('Failed to load available courses');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Add a course item to the schedule
  const addCourseItem = async (courseId, itemId, title, moduleTitle, date, slotId) => {
    setIsLoading(true);
    try {
      const data = {
        courseId,
        itemId,
        title,
        moduleTitle,
        date,
        slotId
      };
      
      const result = await schedulerService.addCourseItem(data);
      if (result.success) {
        // Reload the schedule
        await loadUserSchedule();
        toast.success('Item added to schedule');
        return true;
      } else {
        toast.error(result.error || 'Failed to add item to schedule');
        return false;
      }
    } catch (error) {
      console.error('Error adding course item:', error);
      toast.error('Failed to add item to schedule');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Add a live course (all sessions at once)
  const addLiveCourse = async (courseId) => {
    setIsLoading(true);
    try {
      const data = { courseId };
      
      const result = await schedulerService.addLiveCourse(data);
      if (result.success) {
        // Reload the schedule
        await loadUserSchedule();
        toast.success('Live course added to schedule');
        
        // Close the panel
        setIsPanelOpen(false);
        return true;
      } else {
        toast.error(result.error || 'Failed to add live course');
        return false;
      }
    } catch (error) {
      console.error('Error adding live course:', error);
      toast.error('Failed to add live course');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update a scheduled item
  const updateScheduledItem = async (itemId, updateData) => {
    setIsLoading(true);
    try {
      const data = {
        itemId,
        ...updateData
      };
      
      const result = await schedulerService.updateScheduledItem(data);
      if (result.success) {
        // Reload the schedule
        await loadUserSchedule();
        toast.success('Schedule updated');
        return true;
      } else {
        toast.error(result.error || 'Failed to update schedule');
        return false;
      }
    } catch (error) {
      console.error('Error updating scheduled item:', error);
      toast.error('Failed to update schedule');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle drag start
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag from side panel
  const handleDragStartFromPanel = (e, course, item) => {
    const dragItem = {
      id: item.id,
      courseId: course._id,
      title: item.title,
      moduleTitle: item.moduleTitle || '',
      itemId: item.id,
      type: course.type,
      backgroundColorHex: course.backgroundColorHex,
      iconUrl: course.iconUrl,
      isFromPanel: true
    };
    
    setDraggedItem(dragItem);
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = draggedItem?.isFromPanel ? 'copy' : 'move';
  };

  // Handle drop
  const handleDrop = async (e, date, slotId) => {
    e.preventDefault();
    
    if (!draggedItem) return;
    
    if (draggedItem.isFromPanel) {
      // This is a new item from the panel
      await addCourseItem(
        draggedItem.courseId,
        draggedItem.itemId,
        draggedItem.title,
        draggedItem.moduleTitle,
        date,
        slotId
      );
    } else {
      // This is an existing item being rescheduled
      // Check if trying to drop on the same slot
      const isSameSlot =
        new Date(draggedItem.date).toDateString() === date.toDateString() &&
        draggedItem.slotId === slotId;
        
      if (isSameSlot) {
        console.log('Dropped on the same slot');
        return;
      }
      
      // Update the item
      await updateScheduledItem(draggedItem.id, {
        newDate: date,
        newSlotId: slotId
      });
    }
    
    setDraggedItem(null);
  };

  // Handle click on the + icon to open panel
  const handleAddClick = (date, slotId) => {
    setSelectedSlot({ date, slotId });
    setIsPanelOpen(true);
    loadAvailableCourses();
  };

  // Handle toggling completion status
  const handleToggleCompletion = async (item) => {
    await updateScheduledItem(item.id, { 
      isCompleted: !item.isCompleted 
    });
  };

  // Handle removing an item
  const handleRemoveItem = async (item) => {
    if (window.confirm('Are you sure you want to remove this item from your schedule?')) {
      await updateScheduledItem(item.id, { remove: true });
    }
  };

  // Find events for a specific date and slot
  const getEventsForDateAndSlot = (date, slotId) => {
    return scheduledItems.filter(item => 
      new Date(item.date).toDateString() === date.toDateString() && 
      item.slotId === slotId
    );
  };

  // Search for courses
  const searchCourses = () => {
    loadAvailableCourses();
  };

  // Clear search filters
  const clearFilters = () => {
    setSearchQuery('');
    setCourseTypeFilter('');
    loadAvailableCourses();
  };

  // Initialize data when component mounts
  useEffect(() => {
    loadUserSchedule();
  }, []);

  const value = {
    // State data
    isLoading,
    calendarDates,
    scheduledItems,
    availableCourses,
    draggedItem,
    isPanelOpen,
    selectedSlot,
    searchQuery,
    courseTypeFilter,
    timeSlots: TIME_SLOTS,
    
    // Setters
    setSearchQuery,
    setCourseTypeFilter,
    setIsPanelOpen,
    
    // API methods
    loadUserSchedule,
    loadAvailableCourses,
    addCourseItem,
    addLiveCourse,
    updateScheduledItem,
    
    // UI handlers
    handleDragStart,
    handleDragStartFromPanel,
    handleDragOver,
    handleDrop,
    handleAddClick,
    handleToggleCompletion,
    handleRemoveItem,
    getEventsForDateAndSlot,
    searchCourses,
    clearFilters
  };

  return (
    <SchedulerContext.Provider value={value}>
      {children}
    </SchedulerContext.Provider>
  );
};

export default SchedulerContext;