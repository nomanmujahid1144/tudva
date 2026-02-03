'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, Badge, Spinner, Alert, Form, Row, Col, Button, Accordion, Dropdown, Modal } from 'react-bootstrap';
import { FaPlus, FaBars, FaSearch, FaFilter, FaTrash, FaLock, FaExclamationTriangle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Image from 'next/image';
import { toast } from 'sonner';
import liveIcon from '@/assets/images/live-course.png';
import recordedIcon from '@/assets/images/recorded-course.png';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

// Import our actual API services
import schedulerService from '@/services/schedulerService';

const CourseScheduler = () => {
  const t = useTranslations('scheduler');
  const { locale } = useParams();

  // Time slots with IDs and formatted times
  const TIME_SLOTS = [
    { id: 'slot_1', name: t('timeSlotNames.slot1'), time: '9:00 - 9:40' },
    { id: 'slot_2', name: t('timeSlotNames.slot2'), time: '9:45 - 10:25' },
    { id: 'slot_3', name: t('timeSlotNames.slot3'), time: '10:45 - 11:25' },
    { id: 'slot_4', name: t('timeSlotNames.slot4'), time: '11:30 - 12:10' },
    { id: 'slot_5', name: t('timeSlotNames.slot5'), time: '13:35 - 14:15' },
    { id: 'slot_6', name: t('timeSlotNames.slot6'), time: '14:20 - 15:00' }
  ];

  // States for calendar dates
  const [startDate, setStartDate] = useState(new Date());
  const [calendarDates, setCalendarDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSplitView, setShowSplitView] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isPanelLoading, setIsPanelLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // States for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // States for error handling
  const [errorItems, setErrorItems] = useState([]);
  const [showToast, setShowToast] = useState(false);

  // Course data state
  const [scheduledItems, setScheduledItems] = useState([]);
  const [temporaryItems, setTemporaryItems] = useState([]); // Items with errors (not saved to backend)
  const [availableCourses, setAvailableCourses] = useState([]);
  const [lastAddedCourse, setLastAddedCourse] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [courseTypeFilter, setCourseTypeFilter] = useState('');
  const [splitViewWidth, setSplitViewWidth] = useState(30); // Default width percentage

  // Refs for drag and drop
  const draggedItemRef = useRef(null);
  const dragSourceRef = useRef(null);
  const resizeHandleRef = useRef(null);

  // State for storing lesson information by itemId
  const [lessonInfoMap, setLessonInfoMap] = useState({});

  // Keep a local cache of scheduled lesson numbers per course to avoid API delays
  const [scheduledLessonsCache, setScheduledLessonsCache] = useState({});

  // Resize functionality for split view
  const startResize = (e) => {
    e.preventDefault();
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResize);
  };

  const resize = (e) => {
    const containerWidth = document.body.clientWidth;
    const newWidth = (e.clientX / containerWidth) * 100;
    // Limit the resize between 20% and 50%
    if (newWidth >= 20 && newWidth <= 50) {
      setSplitViewWidth(newWidth);
    }
  };

  const stopResize = () => {
    window.removeEventListener('mousemove', resize);
    window.removeEventListener('mouseup', stopResize);
  };

  // Calculate lesson progress based on order in scheduler
  const renderLessonProgress = (item) => {
    if (!item) return '';

    // For recorded courses, determine position in scheduler
    if (item.type === 'recorded') {
      // Get all items for this course
      const courseItems = getAllItemsForCourse(item.courseId);

      // Skip if no items
      if (courseItems.length === 0) return '';

      // Sort the items by their position in the schedule 
      // (first by date, then by time slot)
      const sortedItems = [...courseItems].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);

        // First compare by date
        if (dateA < dateB) return -1;
        if (dateA > dateB) return 1;

        // If same date, compare by slot
        const slotA = TIME_SLOTS.findIndex(slot => slot.id === a.slotId);
        const slotB = TIME_SLOTS.findIndex(slot => slot.id === b.slotId);

        return slotA - slotB;
      });

      // Find the position of this item in the sorted array
      const itemPosition = sortedItems.findIndex(i => i.id === item.id) + 1;

      // If item not found, use its current lessonNumber
      if (itemPosition === 0) return `${item.lessonNumber}/${courseItems.length}`;

      // Return the position / total count
      return `${itemPosition}/${courseItems.length}`;
    }

    // For live courses
    if (item.type === 'live' && item.itemId?.startsWith('session_')) {
      const sessionMatch = item.itemId.match(/session_(\d+)/);
      if (sessionMatch && sessionMatch[1]) {
        console.log(item, 'item')
        const sessionNumber = parseInt(sessionMatch[1], 10);
        const totalSessions = item.totalLessons || 0;
        return `${sessionNumber}/${totalSessions}`;
      }
    }

    return '';
  };

  // Effect to update the cache when scheduledItems changes
  useEffect(() => {
    const newCache = {};

    scheduledItems.forEach(item => {
      if (item.courseId && item.lessonNumber) {
        if (!newCache[item.courseId]) {
          newCache[item.courseId] = [];
        }
        if (!newCache[item.courseId].includes(item.lessonNumber)) {
          newCache[item.courseId].push(item.lessonNumber);
        }
      }
    });

    setScheduledLessonsCache(prevCache => ({
      ...prevCache,
      ...newCache
    }));
  }, [scheduledItems]);

  // Function to update lesson ordering when a drop happens
  // Modified updateLessonOrdering function that works with your existing API
  // This targets the specific course's recorded items only

  const updateLessonOrdering = async (courseId) => {
    try {
      // Get all items for this course from the current state
      const courseItems = getAllItemsForCourse(courseId);

      // Filter to only include recorded items
      const recordedItems = courseItems.filter(item => item.type === 'recorded');

      // Skip if no items or only one item (nothing to reorder)
      if (recordedItems.length <= 1) {
        return true;
      }

      // Sort items by position in schedule (by date and time slot)
      const sortedItems = [...recordedItems].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);

        if (dateA < dateB) return -1;
        if (dateA > dateB) return 1;

        const slotA = TIME_SLOTS.findIndex(slot => slot.id === a.slotId);
        const slotB = TIME_SLOTS.findIndex(slot => slot.id === b.slotId);

        return slotA - slotB;
      });

      // Create an array of ordered item IDs
      const orderedItemIds = sortedItems
        .filter(item => !item.isTemporary) // Exclude temporary items
        .map(item => item.id);

      // Skip if no items to update
      if (orderedItemIds.length === 0) {
        return true;
      }

      const result = await schedulerService.updateItemsOrder(courseId, orderedItemIds);

      if (result.success) {

        // Update local data immediately for better UX
        for (let i = 0; i < sortedItems.length; i++) {
          if (!sortedItems[i].isTemporary) {
            sortedItems[i].lessonNumber = i + 1;
          }
        }

        // Force state update to reflect changes
        setScheduledItems(prevItems => {
          // First create a deep copy of prevItems
          const updatedItems = JSON.parse(JSON.stringify(prevItems));

          // Now update lessonNumbers on this copy
          for (let i = 0; i < updatedItems.length; i++) {
            const item = updatedItems[i];
            if (item.courseId === courseId && item.type === 'recorded') {
              // Find this item's position in sortedItems
              const sortedIndex = sortedItems.findIndex(sorted => sorted.id === item.id);
              if (sortedIndex !== -1) {
                // Update the lessonNumber to match its position in sortedItems
                updatedItems[i].lessonNumber = sortedIndex + 1;
              }
            }
          }

          return updatedItems;
        });

        // Complete reload of schedule to ensure DB and UI are in sync
        await loadUserSchedule();

        return true;
      } else {
        console.error('Error reordering lessons:', result.error);
        toast.error(t('messages.orderError'));
        return false;
      }
    } catch (error) {
      console.error('Error updating lesson ordering:', error);
      toast.error(t('messages.orderError'));
      return false;
    }
  };

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
        formatted: date.toLocaleDateString(locale === 'de' ? 'de-DE' : locale === 'hu' ? 'hu-HU' : 'en-US', {
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

  // Load user's schedule from API
  const loadUserSchedule = async () => {
    setLoading(true);
    try {
      const result = await schedulerService.getUserSchedule();
      if (result.success) {
        setScheduledItems(result.data.scheduledItems || []);
      } else {
        toast.error(result.error || t('messages.loadError'));
      }
    } catch (error) {
      console.error('Error loading user schedule:', error);
      toast.error(t('messages.loadError') + ' ' + t('messages.tryAgain'));
    } finally {
      setLoading(false);
    }
  };

  // Load available courses from API
  const loadAvailableCourses = async () => {
    setIsPanelLoading(true);
    try {
      const params = {
        query: searchQuery,
        type: courseTypeFilter
      };

      const result = await schedulerService.getAvailableCourses(params);
      if (result.success) {
        const courses = result.data.courses || [];
        setAvailableCourses(courses);

        // Build a map of itemId -> lesson information
        const newLessonInfoMap = {};
        courses.forEach(course => {
          if (course.availableLessons) {
            course.availableLessons.forEach(lesson => {
              newLessonInfoMap[lesson.id] = {
                lessonNumber: lesson.lessonNumber,
                totalLessons: lesson.totalLessons
              };
            });
          }
        });

        // Update the lesson info map
        setLessonInfoMap(prevMap => ({
          ...prevMap,
          ...newLessonInfoMap
        }));
      } else {
        toast.error(result.error || t('messages.loadError'));
      }
    } catch (error) {
      console.error('Error loading available courses:', error);
      toast.error(t('messages.loadError') + ' ' + t('messages.tryAgain'));
    } finally {
      setIsPanelLoading(false);
    }
  };

  // Initialize calendar dates and load user schedule
  useEffect(() => {
    // Initialize calendar with 52 Wednesdays (1 year)
    const dates = getWednesdayDates(startDate, 52);
    setCalendarDates(dates);

    // Load user schedule
    loadUserSchedule();
  }, [startDate]);

  // Effect to reload available courses when panel is shown or when we've added a new lesson
  useEffect(() => {
    if (showSplitView) {
      loadAvailableCourses();
    }
  }, [showSplitView, refreshKey]);

  // Get all items for a course (from both scheduled and temporary items)
  const getAllItemsForCourse = (courseId) => {

    // Match items by courseId field
    const regularItems = scheduledItems.filter(item => {
      const matches = item.courseId === courseId;
      return matches;
    });

    // Match temporary items
    const tempItems = temporaryItems.filter(item => item.courseId === courseId);

    // Combine and return
    const allItems = [...regularItems, ...tempItems];
    return allItems;
  };

  // Check if a slot is already occupied
  const isSlotOccupied = (date, slotId, excludeItemId = null) => {
    // Check regular items
    const hasRegularItem = scheduledItems.some(item =>
      new Date(item.date).toDateString() === date.toDateString() &&
      item.slotId === slotId &&
      (excludeItemId === null || item.id !== excludeItemId)
    );

    if (hasRegularItem) return true;

    // Check temporary items
    return temporaryItems.some(item =>
      new Date(item.date).toDateString() === date.toDateString() &&
      item.slotId === slotId &&
      (excludeItemId === null || item.id !== excludeItemId)
    );
  };

  // Check if a slot has a conflict between live and recorded courses
  const hasLiveRecordedConflict = (date, slotId) => {
    const items = [...scheduledItems, ...temporaryItems].filter(item =>
      new Date(item.date).toDateString() === date.toDateString() &&
      item.slotId === slotId
    );

    if (items.length < 2) return false;

    const hasLive = items.some(item => item.type === 'live');
    const hasRecorded = items.some(item => item.type === 'recorded');

    return hasLive && hasRecorded;
  };

  // Add an error item to temporary items
  const addErrorItem = (item, date, slotId, errorMessage) => {
    // Generate a unique ID for this temporary item
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create a temporary item object
    const tempItem = {
      ...item,
      id: tempId,
      date: date,
      slotId: slotId,
      isTemporary: true,
      hasError: true,
      errorMessage: errorMessage,
      originalItemId: item.originalItemId || item.id, // Store original ID for later use
      // Ensure lesson information is preserved
      lessonNumber: item.lessonNumber,
      totalLessons: item.totalLessons
    };

    // Add to temporary items
    setTemporaryItems(prev => [...prev, tempItem]);

    // Add to error items for tracking
    setErrorItems(prev => [...prev, tempId]);

    // Show toast notification
    toast.error(errorMessage);
  };

  // Remove a temporary item
  const removeTemporaryItem = (itemId) => {
    setTemporaryItems(prev => prev.filter(item => item.id !== itemId));
    setErrorItems(prev => prev.filter(id => id !== itemId));
  };

  // Handle drag start
  const handleDragStart = (e, item) => {
    // Disable dragging for live courses
    if (item.type === 'live') {
      e.preventDefault();
      return false;
    }


    // Save the source item information
    setDraggedItem(item);
    draggedItemRef.current = item;

    // Store the source element ID to remove it on successful drag
    dragSourceRef.current = item.id;

    // Store data in transfer
    e.dataTransfer.setData('text/plain', JSON.stringify({
      id: item.id,
      type: 'reschedule',
      courseId: item.courseId,
      lessonNumber: item.lessonNumber,
      isTemporary: item.isTemporary || false
    }));

    e.dataTransfer.effectAllowed = 'move';

    // Add a class to the element being dragged
    e.currentTarget.classList.add('dragging');
  };

  // Handle drag from split view - All lessons are now draggable
  const handleDragStartFromPanel = (e, course, item) => {
    e.stopPropagation();

    // CRITICAL: Create a drag item with explicit lesson information
    const dragItem = {
      courseId: course._id,
      title: item.title,
      moduleTitle: item.moduleTitle || '',
      itemId: item.id,
      lessonNumber: parseInt(item.lessonNumber, 10), // Ensure it's an integer
      totalLessons: parseInt(item.totalLessons, 10), // Ensure it's an integer
      isFromPanel: true,
      type: course.type,
      backgroundColorHex: course.backgroundColorHex,
      iconUrl: course.iconUrl,
    };


    setDraggedItem(dragItem);
    draggedItemRef.current = dragItem;

    // CRITICAL: Include lesson numbers in the data transfer
    const transferData = {
      id: item.id,
      type: 'new',
      courseId: course._id,
      lessonNumber: item.lessonNumber,
      totalLessons: item.totalLessons
    };

    e.dataTransfer.setData('text/plain', JSON.stringify(transferData));

    e.dataTransfer.effectAllowed = 'copy';
    e.currentTarget.classList.add('dragging');
  };

  // Handle drag end
  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
    setDraggedItem(null);
    draggedItemRef.current = null;
    // Clear the source reference
    dragSourceRef.current = null;
  };

  // Handle drag over
  const handleDragOver = (e, date, slotId) => {
    e.preventDefault();
    const item = draggedItemRef.current;

    if (!item) return;

    // Clear previous styling
    e.currentTarget.classList.remove('drag-over');
    e.currentTarget.classList.remove('live-conflict-slot');


    // Check for conflicts with live courses
    const hasLiveCourse = [...scheduledItems, ...temporaryItems].some(existingItem =>
      existingItem.type === 'live' &&
      new Date(existingItem.date).toDateString() === date.toDateString() &&
      existingItem.slotId === slotId
    );

    if (hasLiveCourse && item.type === 'recorded') {
      e.currentTarget.classList.add('live-conflict-slot');
      e.dataTransfer.dropEffect = 'none';
      return;
    }

    // If we get here, everything is valid
    e.currentTarget.classList.add('drag-over');
    e.dataTransfer.dropEffect = item.isFromPanel ? 'copy' : 'move';
  };

  // Handle drag leave
  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
    e.currentTarget.classList.remove('live-conflict-slot');
  };

  // Update local cache with newly added lesson
  const updateLocalLessonCache = (courseId, lessonNumber) => {
    // Update the local cache of scheduled lessons
    setScheduledLessonsCache(prevCache => {
      const newCache = { ...prevCache };
      if (!newCache[courseId]) {
        newCache[courseId] = [];
      }
      if (!newCache[courseId].includes(lessonNumber)) {
        newCache[courseId] = [...newCache[courseId], lessonNumber];
      }
      return newCache;
    });

    // Set the last added course to immediately enable the next lesson
    setLastAddedCourse({
      courseId,
      lessonNumber
    });

    // Force refresh of split view
    setRefreshKey(prev => prev + 1);
  };

  // Handle drop - Now with automatic lesson order updating
  const handleDrop = async (e, date, slotId) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    e.currentTarget.classList.remove('live-conflict-slot');

    let data;
    try {
      const rawData = e.dataTransfer.getData('text/plain');
      data = JSON.parse(rawData);
    } catch (error) {
      console.error('Invalid drag data:', error);
      return;
    }

    const item = draggedItemRef.current;
    if (!item) return;

    // Ensure lesson information is preserved
    const itemWithLessonInfo = {
      ...item,
      lessonNumber: parseInt(item.lessonNumber, 10) || parseInt(data.lessonNumber, 10) || 1,
      totalLessons: parseInt(item.totalLessons, 10) || parseInt(data.totalLessons, 10) || 2
    };

    // Check if slot is already occupied
    if (isSlotOccupied(date, slotId, dragSourceRef.current)) {
      addErrorItem(itemWithLessonInfo, date, slotId, t('slot.occupied'));

      // End drag operation
      setDraggedItem(null);
      draggedItemRef.current = null;
      dragSourceRef.current = null;
      return;
    }

    // Save the courseId for reordering later
    const courseIdForReorder = item.courseId;
    const isRecordedType = item.type === 'recorded';

    toast.info(t('actions.updating'));

    // First step: Handle the drag & drop operation
    try {
      if (item.isTemporary) {
        // Remove this item from temporary items first
        removeTemporaryItem(item.id);

        // If it was a conflict item and now we're moving to a free slot
        if (item.hasError) {
          // If it was from the panel (new)
          if (item.isFromPanel) {
            const result = await schedulerService.addCourseItem({
              courseId: item.courseId,
              itemId: item.itemId,
              title: item.title,
              moduleTitle: item.moduleTitle || '',
              lessonNumber: itemWithLessonInfo.lessonNumber,
              totalLessons: itemWithLessonInfo.totalLessons,
              type: item.type,
              date: date,
              slotId: slotId
            });

            if (result.success) {
              toast.success(t('messages.courseAdded'));
              updateLocalLessonCache(item.courseId, itemWithLessonInfo.lessonNumber);
            } else {
              toast.error(result.error || t('messages.addError'));
            }
          }
          // If it was a rescheduled item
          else if (item.originalItemId) {
            const result = await schedulerService.updateScheduledItem({
              itemId: item.originalItemId,
              newDate: date,
              newSlotId: slotId
            });

            if (result.success) {
              toast.success(t('messages.courseRescheduled'));
            } else {
              toast.error(result.error || t('messages.rescheduleError'));
            }
          }
        } else {
          // For other temporary items (not conflicts), just add a new one
          addErrorItem(
            {
              ...itemWithLessonInfo,
              errorMessage: undefined,
              hasError: false
            },
            date,
            slotId,
            ''
          );
        }
      } else if (item.isFromPanel) {

        const result = await schedulerService.addCourseItem({
          courseId: item.courseId,
          itemId: item.itemId,
          title: item.title,
          moduleTitle: item.moduleTitle || '',
          lessonNumber: itemWithLessonInfo.lessonNumber,
          totalLessons: itemWithLessonInfo.totalLessons,
          type: item.type,
          date: date,
          slotId: slotId
        });

        if (result.success) {
          toast.success(t('messages.courseAdded'));
          updateLocalLessonCache(item.courseId, itemWithLessonInfo.lessonNumber);
        } else {
          toast.error(result.error || t('messages.addError'));
        }
      } else {
        // Rescheduling existing item
        // First, remove the item from its source location visually
        setScheduledItems(prev => prev.filter(scheduled => scheduled.id !== dragSourceRef.current));

        // Update in backend
        const result = await schedulerService.updateScheduledItem({
          itemId: dragSourceRef.current,
          newDate: date,
          newSlotId: slotId
        });

        if (result.success) {
          toast.success(t('messages.courseRescheduled'));
        } else {
          toast.error(result.error || t('messages.rescheduleError'));
        }
      }

      // Second step: Reload the schedule to get the updated items
      await loadUserSchedule();

      // Third step: If it's a recorded course, do the reordering
      if (isRecordedType && courseIdForReorder) {

        // Get the latest data
        const currentSchedule = await schedulerService.getUserSchedule();

        if (currentSchedule.success) {
          // Find all recorded items for this course
          const allItems = currentSchedule.data.scheduledItems || [];
          const courseItems = allItems.filter(item =>
            item.courseId === courseIdForReorder && item.type === 'recorded'
          );

          if (courseItems.length > 1) {
            // Sort the items by their position in the scheduler
            const sortedItems = [...courseItems].sort((a, b) => {
              const dateA = new Date(a.date);
              const dateB = new Date(b.date);

              if (dateA < dateB) return -1;
              if (dateA > dateB) return 1;

              const slotA = TIME_SLOTS.findIndex(slot => slot.id === a.slotId);
              const slotB = TIME_SLOTS.findIndex(slot => slot.id === b.slotId);

              return slotA - slotB;
            });

            // Get the ordered IDs
            const orderedItemIds = sortedItems.map(item => item.id);

            // Directly call the reordering API
            const orderResult = await schedulerService.updateItemsOrder(courseIdForReorder, orderedItemIds);

            if (orderResult.success) {
              toast.success(t('messages.orderUpdated'));

              // Final reload to get everything in sync
              await loadUserSchedule();
            } else {
              console.error('Failed to update course order:', orderResult.error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in drag and drop operation:', error);
      toast.error(t('messages.addError'));
    }

    // Clean up
    setDraggedItem(null);
    draggedItemRef.current = null;
    dragSourceRef.current = null;
  };

  // Handle add course button click
  const handleAddClick = (date, slotId) => {
    setSelectedSlot({ date, slotId });
    setShowSplitView(true);
    loadAvailableCourses();
  };

  // Handle menu button click
  const handleMenuClick = (e) => {
    e.stopPropagation();
  };

  // Add course button click handler 
  const handleAddCourse = async (course, item) => {
    if (!selectedSlot) return;

    // Check if slot is occupied
    if (isSlotOccupied(selectedSlot.date, selectedSlot.slotId)) {
      // Add as temporary item with error
      addErrorItem(
        {
          courseId: course._id,
          title: item.title,
          moduleTitle: item.moduleTitle || '',
          itemId: item.id,
          lessonNumber: item.lessonNumber,
          totalLessons: item.totalLessons,
          type: course.type,
          courseTitle: course.title,
          backgroundColorHex: course.backgroundColorHex,
          iconUrl: course.iconUrl,
          originalItemId: item.id, // Store original ID
        },
        selectedSlot.date,
        selectedSlot.slotId,
        t('slot.occupied')
      );
      return;
    }

    // Slot is free, save to backend
    try {
      const payload = {
        courseId: course._id,
        itemId: item.id,
        title: item.title,
        moduleTitle: item.moduleTitle || '',
        lessonNumber: item.lessonNumber,
        totalLessons: item.totalLessons,
        type: course.type,
        date: selectedSlot.date,
        slotId: selectedSlot.slotId
      };

      // Show the user we're processing their request
      toast.info(t('actions.adding'));

      // First step: Add the course item
      const result = await schedulerService.addCourseItem(payload);

      if (result.success) {
        // Now reload the schedule to get the latest items
        await loadUserSchedule();

        // If it's a recorded course, we need to update the order
        if (course.type === 'recorded') {

          // Get all the recorded items for this course
          // We need to use this simpler approach to make sure we have the latest data
          const currentSchedule = await schedulerService.getUserSchedule();

          if (currentSchedule.success) {
            // Find all items for this course
            const allItems = currentSchedule.data.scheduledItems || [];
            const courseItems = allItems.filter(item => item.courseId === course._id && item.type === 'recorded');

            if (courseItems.length > 1) {
              // Sort the items by their position in the scheduler
              const sortedItems = [...courseItems].sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);

                if (dateA < dateB) return -1;
                if (dateA > dateB) return 1;

                const slotA = TIME_SLOTS.findIndex(slot => slot.id === a.slotId);
                const slotB = TIME_SLOTS.findIndex(slot => slot.id === b.slotId);

                return slotA - slotB;
              });

              // Get the ordered IDs
              const orderedItemIds = sortedItems.map(item => item.id);

              // Directly call the reordering API
              const orderResult = await schedulerService.updateItemsOrder(course._id, orderedItemIds);

              if (orderResult.success) {
                toast.success(t('messages.orderUpdated'));
              } else {
                console.error('Failed to update course order:', orderResult.error);
              }
            }
          }
        }

        toast.success(t('messages.courseAdded'));

        // Update the local cache
        updateLocalLessonCache(course._id, item.lessonNumber);

        // Reload one more time to ensure we have the final state
        await loadUserSchedule();
      } else {
        toast.error(result.error || t('messages.addError'));
      }
    } catch (error) {
      console.error('Error adding course:', error);
      toast.error(t('messages.addError'));
    }
  };

  // Add live course button click handler
  const handleAddLiveCourse = async (course) => {
    try {
      const result = await schedulerService.addLiveCourse({
        courseId: course._id
      });

      if (result.success) {
        toast.success(t('messages.courseAdded'));
        await loadUserSchedule(); // Reload schedule
      } else {
        toast.error(result.error || t('messages.addError'));
      }
    } catch (error) {
      console.error('Error adding live course:', error);
      toast.error(t('messages.addError'));
    }
  };

  // Handle initiating item removal
  const handleRemoveItem = (item, e) => {
    e.stopPropagation();

    // If this is a temporary item, remove it directly
    if (item.isTemporary) {
      removeTemporaryItem(item.id);
      return;
    }

    // Otherwise show confirmation for regular items
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  // Confirm item removal
  const confirmRemoveItem = async () => {
    if (!itemToDelete) return;

    try {
      const result = await schedulerService.updateScheduledItem({
        itemId: itemToDelete.id,
        remove: true
      });

      if (result.success) {
        toast.success(t('messages.courseRemoved'));

        // Update local cache by removing the lesson number for this course
        if (itemToDelete.courseId && itemToDelete.lessonNumber) {
          setScheduledLessonsCache(prevCache => {
            const newCache = { ...prevCache };
            if (newCache[itemToDelete.courseId]) {
              newCache[itemToDelete.courseId] = newCache[itemToDelete.courseId]
                .filter(num => num !== itemToDelete.lessonNumber);
            }
            return newCache;
          });

          // Force refresh
          setRefreshKey(prev => prev + 1);
        }

        // Load schedule from API
        await loadUserSchedule();

        // Update lesson ordering in the backend if this was a recorded course
        if (itemToDelete.type === 'recorded') {
          await updateLessonOrdering(itemToDelete.courseId);
        }
      } else {
        toast.error(result.error || t('messages.removeError'));
      }
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error(t('messages.removeError'));
    }

    // Close modal and reset
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  // Cancel item removal
  const cancelRemoveItem = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  // Search for courses
  const handleSearch = () => {
    loadAvailableCourses();
  };

  // Find events for a specific date and slot (combining regular and temporary items)
  const getEventsForDateAndSlot = (date, slotId) => {
    // Get regular items
    const regularItems = scheduledItems.filter(item =>
      new Date(item.date).toDateString() === date.toDateString() &&
      item.slotId === slotId
    );

    // Get temporary items
    const tempItems = temporaryItems.filter(item =>
      new Date(item.date).toDateString() === date.toDateString() &&
      item.slotId === slotId
    );

    // Combine both and sort them so recorded courses are on top of live courses
    const allItems = [...regularItems, ...tempItems].sort((a, b) => {
      // Recorded courses come before live courses
      if (a.type === 'recorded' && b.type === 'live') return -1;
      if (a.type === 'live' && b.type === 'recorded') return 1;
      return 0;
    });

    return allItems;
  };

  // Format date for today highlight
  const isToday = (date) => {
    return date.toDateString() === new Date().toDateString();
  };

  if (loading && scheduledItems.length === 0 && temporaryItems.length === 0) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">{t('messages.loadingSchedule')}</p>
      </div>
    );
  }

  return (
    <div className="course-scheduler mb-4">
      <div className="d-flex position-relative w-100" style={{ minHeight: "calc(100vh - 150px)" }}>
        {/* Split View Toggle */}
        <Button
          variant="primary"
          className="toggle-split-view"
          onClick={() => setShowSplitView(!showSplitView)}
        >
          {showSplitView ? <FaChevronLeft /> : <FaChevronRight />}
        </Button>

        {/* Main Content Area */}
        <div className='w-100'>
          {/* Header Section */}
          <Card className="border mb-3">
            <Card.Body>
              <h3 className="mb-3">{t('title')}</h3>

              <Row className="align-items-center mb-2">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="mb-1"><small>{t('schoolDay.label')}</small></Form.Label>
                    <Form.Select disabled value="wednesday">
                      <option value="wednesday">{t('schoolDay.wednesday')}</option>
                    </Form.Select>
                    <Form.Text className="text-muted">
                      {t('schoolDay.note')}
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Calendar Section */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="p-0 calendar-container">
              <div className="course-calendar">
                {/* Calendar header with dates */}
                <div className="calendar-header">
                  <div className="time-column bg-light border-end">
                    <div className="p-3 text-center fw-medium">{t('timeSlots')}</div>
                  </div>

                  {calendarDates.map((date, index) => (
                    <div
                      key={index}
                      className={`date-column border-end ${date.isToday ? 'bg-primary bg-opacity-10' : 'bg-light'}`}
                    >
                      <div className="p-3 d-flex flex-column text-center fw-medium">
                        <span>{t('schoolDay.wednesday')}</span>
                        <span>{date.formatted}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Calendar body with slots and events */}
                <div className="calendar-body">
                  {TIME_SLOTS.map(slot => (
                    <div key={slot.id} className="d-flex border-bottom">
                      <div className="time-column border-end bg-light p-2">
                        <div className="fw-medium fs-6 mb-1">{slot.name}</div>
                        <div className="text-muted small">{slot.time}</div>
                      </div>

                      {calendarDates.map((date, dateIndex) => {
                        const cellEvents = getEventsForDateAndSlot(date.date, slot.id);
                        const isEmpty = cellEvents.length === 0;
                        const hasConflict = hasLiveRecordedConflict(date.date, slot.id);

                        return (
                          <div
                            key={`${slot.id}-${dateIndex}`}
                            className={`date-cell border-end 
                              ${date.isToday ? 'bg-primary bg-opacity-10' : ''} 
                              ${hasConflict ? 'conflict-cell' : ''}
                            `}
                            onDragOver={(e) => handleDragOver(e, date.date, slot.id)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, date.date, slot.id)}
                          >
                            {isEmpty ? (
                              <div className="empty-cell p-2 h-100 w-100 position-relative">
                                <div className="position-absolute top-0 end-0 mt-1 me-3">
                                  <div className='d-flex flex-column'>
                                    <span
                                      onClick={(e) => handleMenuClick(e)}
                                      style={{ cursor: 'pointer', marginBottom: '5px' }}
                                    >
                                      <FaBars size={12} />
                                    </span>
                                    <span
                                      onClick={() => handleAddClick(date.date, slot.id)}
                                      style={{ cursor: 'pointer' }}
                                    >
                                      <FaPlus size={12} />
                                    </span>
                                  </div>
                                </div>
                                <div className='d-flex justify-content-center align-items-center h-100 w-100'>
                                  <div className='border-dashed h-50 w-50' />
                                </div>
                              </div>
                            ) : (
                              <div className={`events-container ${hasConflict ? 'stacked-events' : ''}`}>
                                {cellEvents.map((item, index) => {
                                  // Ensure recorded courses are positioned above live courses in conflicts
                                  const isTop = hasConflict ? item.type === 'recorded' : true;
                                  const zIndex = hasConflict ? (isTop ? 2 : 1) : 'auto';

                                  return (
                                    <div
                                      key={item.id}
                                      draggable={item.type !== 'live'}
                                      onDragStart={(e) => handleDragStart(e, item)}
                                      onDragEnd={handleDragEnd}
                                      className={`course-card h-100 w-100 rounded shadow-sm overflow-hidden 
                                        ${item.type === 'live' ? 'live-course-card' : ''} 
                                        ${item.isTemporary && item.hasError ? 'error-course-card' : ''}
                                      `}
                                      style={{
                                        zIndex: zIndex
                                      }}
                                    >
                                      <div className='row m-0 h-100 w-auto'>
                                        {/* Live Course Lock */}
                                        {item.type === 'live' && (
                                          <div className="lock-course">
                                            <FaLock size={23} className="text-white" />
                                          </div>
                                        )}
                                        {/* Error icon for temporary items with errors */}
                                        {item.isTemporary && item.hasError && (
                                          <div className="position-absolute top-0 start-0 mt-1 ms-1">
                                            <FaExclamationTriangle size={14} className="text-white" />
                                          </div>
                                        )}
                                        <Col
                                          className="d-flex justify-content-end align-items-center position-relative"
                                          md={12}
                                          style={{ backgroundColor: item.backgroundColorHex || '#eee' }}
                                        >
                                          {item.iconUrl && (
                                            <div className="course-icon">
                                              <img
                                                src={item.iconUrl}
                                                alt={`${item.courseTitle || 'Course'} icon`}
                                                width={35}
                                                height={35}
                                              />
                                            </div>
                                          )}
                                        </Col>
                                        <Col md={12} className="course-body p-2 d-flex align-items-center justify-content-center flex-grow-1">
                                          <h5 className="fs-6 fw-bold text-center m-0">{item.courseTitle || item.courseTitle}</h5>
                                        </Col>
                                        <Col md={12} className="px-4 pb-2 d-flex justify-content-between align-items-center">
                                          <Dropdown>
                                            <Dropdown.Toggle as="div" className="text-muted cursor-pointer">
                                              <FaBars size={16} />
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                              <Dropdown.Item
                                                onClick={(e) => handleRemoveItem(item, e)}
                                                className="text-danger"
                                              >
                                                <FaTrash className="me-2" /> {t('actions.removeLecture')}
                                              </Dropdown.Item>
                                            </Dropdown.Menu>
                                          </Dropdown>
                                          {/* Lesson progress indicator - using updated dynamic ordering */}
                                          <div className="lesson-progress me-2">
                                            {renderLessonProgress(item)}
                                          </div>
                                          <div className="d-flex align-items-center">
                                            <div className="course-type-icon">
                                              <Image
                                                src={item.type === 'live' ? liveIcon : recordedIcon}
                                                alt={item.type === 'live' ? "Live Course" : "Recorded Course"}
                                                width={35}
                                                height={35}
                                              />
                                            </div>
                                          </div>
                                        </Col>

                                        {/* Error message for temporary items with errors */}
                                        {item.isTemporary && item.hasError && (
                                          <div className="error-message">
                                            {item.errorMessage}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </Card.Body>

            <Card.Footer className="bg-light border-0">
              <Alert variant="warning" className="mb-0">
                <strong>{t('footer.importantNote')}</strong> {t('footer.virtualClassroom')}
              </Alert>
            </Card.Footer>
          </Card>
        </div>

        {/* Split View - Courses Panel */}
        {showSplitView && (
          <div
            className="course-panel bg-white border-start"
            style={{
              width: `${splitViewWidth}%`,
              position: 'fixed',
              top: 0,
              right: 0,
              zIndex: 999999,
              transition: 'width 0.3s ease',
              height: '100vh',
            }}
          >
            <Button
              variant="primary"
              style={{
                position: 'absolute',
                top: '10px',
              }}
              onClick={() => setShowSplitView(!showSplitView)}
            >
              {showSplitView ? <FaChevronLeft /> : <FaChevronRight />}
            </Button>
            {/* Resize Handle */}
            <div
              className="resize-handle"
              ref={resizeHandleRef}
              onMouseDown={startResize}
            ></div>

            <div className="p-3 mt-5">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">{t('availableCourses')}</h5>
              </div>

              {/* Search and Filter */}
              <div className="mb-3">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder={t('search.placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={handleSearch}
                  >
                    <FaSearch />
                  </button>
                </div>
              </div>

              {/* Course Type Filter */}
              <div className="mb-3">
                <div className="d-flex">
                  <Button
                    variant={courseTypeFilter === '' ? 'primary' : 'outline-primary'}
                    className="me-2"
                    onClick={() => {
                      setCourseTypeFilter('');
                      loadAvailableCourses();
                    }}
                  >
                    {t('filters.all')}
                  </Button>
                  <Button
                    variant={courseTypeFilter === 'live' ? 'primary' : 'outline-primary'}
                    className="me-2"
                    onClick={() => {
                      setCourseTypeFilter('live');
                      loadAvailableCourses();
                    }}
                  >
                    {t('filters.live')}
                  </Button>
                  <Button
                    variant={courseTypeFilter === 'recorded' ? 'primary' : 'outline-primary'}
                    onClick={() => {
                      setCourseTypeFilter('recorded');
                      loadAvailableCourses();
                    }}
                  >
                    {t('filters.recorded')}
                  </Button>
                </div>
              </div>

              {/* Available Courses List */}
              <div className="available-courses-list">
                {isPanelLoading ? (
                  <div className="text-center p-5">
                    <Spinner animation="border" variant="primary" size="sm" />
                    <p>{t('messages.loadingCourses')}</p>
                  </div>
                ) : availableCourses.length === 0 ? (
                  <div className="text-center p-5">
                    <p>{t('messages.noCourses')}</p>
                  </div>
                ) : (
                  <Accordion key={refreshKey} defaultActiveKey={lastAddedCourse ? lastAddedCourse.courseId : undefined}>
                    {availableCourses.map((course) => {
                      // If lastAddedCourse matches this courseId, highlight this course
                      const isHighlighted = lastAddedCourse && lastAddedCourse.courseId === course._id;

                      return (
                        <Accordion.Item
                          key={course._id}
                          eventKey={course._id}
                          className={isHighlighted ? 'border-primary' : ''}
                        >
                          <Accordion.Header>
                            <div className="d-flex w-100 align-items-center">
                              <div
                                className="course-color me-3"
                                style={{
                                  backgroundColor: course.backgroundColorHex || '#eee',
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '8px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                {course.iconUrl ? (
                                  <img src={course.iconUrl} alt={course.title} width="24" height="24" />
                                ) : (
                                  <Image
                                    src={course.type === 'live' ? liveIcon : recordedIcon}
                                    alt={course.type}
                                    width={24}
                                    height={24}
                                  />
                                )}
                              </div>
                              <div>
                                <strong>{course.title}</strong> &nbsp;
                                <Badge bg={course.type === 'live' ? 'success' : 'info'} className="me-1">
                                  {course.type === 'live' ? t('badges.live') : t('badges.recorded')}
                                </Badge>
                                <Badge bg="secondary">{course.level}</Badge>
                                <div className="small text-muted">
                                  {t('course.progress')}: {course.progress.scheduledCount}/{course.progress.totalCount}
                                </div>
                              </div>
                            </div>
                          </Accordion.Header>
                          <Accordion.Body>
                            {course.type === 'live' ? (
                              // Live course details
                              <div>
                                <p>{course.description}</p>

                                {course.liveCourseMeta && (
                                  <div className="mb-3">
                                    <p className="mb-1">
                                      <strong>{t('course.startDate')}:</strong> {new Date(course.liveCourseMeta.startDate).toLocaleDateString(locale === 'de' ? 'de-DE' : locale === 'hu' ? 'hu-HU' : 'en-US')}
                                    </p>
                                    <p className="mb-1">
                                      <strong>{t('course.timeSlots')}:</strong>
                                      {course.liveCourseMeta.timeSlots.map((slot, i) => (
                                        <span key={i} className="ms-1">
                                          {slot.weekDay} ({slot.slotTime || TIME_SLOTS.find(s => s.id === slot.slot)?.time})
                                        </span>
                                      ))}
                                    </p>

                                    <Button
                                      variant="success"
                                      onClick={() => handleAddLiveCourse(course)}
                                      className="mt-3"
                                    >
                                      {t('course.addAllSessions')}
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              // Recorded course lessons - ALL lessons are now draggable
                              <div>
                                <p>{course.description}</p>

                                {selectedSlot && isSlotOccupied(selectedSlot.date, selectedSlot.slotId) && (
                                  <Alert variant="warning" className="my-2 py-2">
                                    <small>
                                      <FaExclamationTriangle className="me-1" />
                                      {t('slot.occupied')}
                                    </small>
                                  </Alert>
                                )}

                                {course.availableLessons && course.availableLessons.length > 0 ? (
                                  <div className="mt-3">
                                    <h6>{t('course.availableLessons')}</h6>
                                    <div className="lesson-list">
                                      {course.availableLessons.map((lesson, i) => {
                                        // Check if this lesson is already scheduled somewhere
                                        const isAlreadyScheduled =
                                          scheduledItems.some(item =>
                                            item.courseId === course._id &&
                                            item.itemId === lesson.id
                                          );

                                        return (
                                          <div
                                            key={i}
                                            className={`lesson-card mb-2 rounded ${isAlreadyScheduled ? 'border-success' : 'border-primary'}`}
                                            draggable={!isAlreadyScheduled} // All lessons are draggable unless already scheduled
                                            onDragStart={(e) => handleDragStartFromPanel(e, course, lesson)}
                                            onDragEnd={handleDragEnd}
                                            style={{
                                              backgroundColor: isAlreadyScheduled ? '#f0fff0' : '#f0f9ff',
                                              cursor: isAlreadyScheduled ? 'not-allowed' : 'grab',
                                              height: '13rem',
                                            }}
                                          >
                                            <div className='row m-0 h-100 w-auto'>
                                              <Col
                                                className="d-flex py-1 justify-content-end align-items-center position-relative"
                                                md={12}
                                                style={{ backgroundColor: course.backgroundColorHex || '#eee' }}
                                              >
                                                {course.iconUrl && (
                                                  <div className="course-icon">
                                                    <img
                                                      src={course.iconUrl}
                                                      alt={`${course.title || 'Course'} icon`}
                                                      width={45}
                                                      height={45}
                                                    />
                                                  </div>
                                                )}
                                              </Col>
                                              <Col md={12} className="course-body p-2 d-flex align-items-center justify-content-center flex-grow-1">
                                                <h3 className="fs-5 fw-bold text-center m-0">
                                                  {lesson.title || lesson.courseTitle}
                                                  <div className="small text-muted">{lesson.moduleTitle}</div>
                                                </h3>
                                              </Col>
                                              <Col md={12} className="px-4 pb-2 d-flex justify-content-between align-items-center">
                                                <div className="lesson-progress fs-5 me-2">
                                                  {lesson.lessonNumber} / {lesson.totalLessons}
                                                </div>
                                                <div className="d-flex align-items-center">
                                                  <div className="course-type-icon">
                                                    <Image
                                                      src={course.type === 'live' ? liveIcon : recordedIcon}
                                                      alt={course.type === 'live' ? "Live Course" : "Recorded Course"}
                                                      width={45}
                                                      height={45}
                                                    />
                                                  </div>
                                                </div>
                                              </Col>
                                            </div>

                                            {isAlreadyScheduled && (
                                              <div className="mt-1 small text-success">
                                                <FaLock className="me-1" />
                                                {t('course.alreadyScheduled')}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-center p-3">
                                    <p>{t('messages.noLessons')}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </Accordion.Body>
                        </Accordion.Item>
                      );
                    })}
                  </Accordion>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={cancelRemoveItem}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{t('modal.removeTitle')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{t('modal.removeMessage')}</p>
          {itemToDelete && (
            <div className="mt-2">
              <strong>{itemToDelete.title || itemToDelete.courseTitle}</strong>
              <div>
                {new Date(itemToDelete.date).toLocaleDateString(locale === 'de' ? 'de-DE' : locale === 'hu' ? 'hu-HU' : 'en-US')} ({TIME_SLOTS.find(slot => slot.id === itemToDelete.slotId)?.time})
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelRemoveItem}>
            {t('modal.confirmNo')}
          </Button>
          <Button variant="danger" onClick={confirmRemoveItem}>
            {t('modal.confirmYes')}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* CSS for the component */}
      <style jsx global>{`
        .course-scheduler {
          position: relative;
          overflow: hidden;
        }
        
        /* Split View Toggle Button */
        .toggle-split-view {
          position: absolute;
          top: 20px;
          right: ${showSplitView ? `${splitViewWidth}%` : '0'};
          z-index: 1000;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          transition: right 0.3s ease;
        }
        
        /* Resize Handle */
        .resize-handle {
          position: absolute;
          width: 5px;
          height: 100%;
          left: 0;
          top: 0;
          background-color: #dee2e6;
          cursor: ew-resize;
          z-index: 10;
        }
        
        .resize-handle:hover {
          background-color: #adb5bd;
        }
        
        /* Course Panel */
        .course-panel {
          height: calc(100vh - 150px);
          position: relative;
          overflow-y: auto;
          box-shadow: -3px 0 10px rgba(0, 0, 0, 0.1);
        }

        .calendar-container {
          overflow-x: auto;
          width: 100%;
          max-width: 100%;
        }
        
        .course-calendar {
          display: flex;
          flex-direction: column;
          min-width: max-content;
          width: max-content;
        }
        
        .calendar-header {
          display: flex;
          position: sticky;
          top: 0;
          z-index: 10;
          background-color: #f8f9fa;
          border-bottom: 1px solid #dee2e6;
          width: 100%;
        }

        .calendar-body {
          display: flex;
          flex-direction: column;
          width: 100%;
        }
        
        .time-column {
          width: 120px;
          min-width: 120px;
          flex-shrink: 0;
        }
        
        .date-column {
          flex: 0 0 250px;
          min-width: 250px;
        }
        
        .date-cell {
          flex: 0 0 250px;
          min-width: 250px;
          height: 150px;
          padding: 2px;
          position: relative;
          transition: all 0.2s ease-in-out;
        }
        
        /* Conflict styling */
        .conflict-cell {
          border: 2px dashed #dc3545 !important;
        }
        
        /* Live course conflict styling */
        .live-conflict-slot {
          border: 3px solid #007bff !important;
          background-color: rgba(0, 123, 255, 0.1) !important;
          position: relative;
        }
        
        .live-conflict-slot::before {
          content: "${t('slot.cannotMixLive')}";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          padding: 4px;
          background-color: rgba(0, 123, 255, 0.9);
          color: white;
          font-size: 12px;
          text-align: center;
          z-index: 100;
        }
        
        .events-container {
          height: 100%;
          width: 100%;
          position: relative;
        }
        
        .stacked-events {
          position: relative;
        }
        
        .front-card {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 2;
          transform: translateX(0) translateY(0);
          transition: transform 0.3s ease;
        }
        
        .back-card {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          transform: translateX(4px) translateY(4px);
        }
        
        /* When hovering on a stacked event container, shift the front card slightly */
        .stacked-events:hover .front-card {
          transform: translateX(-15px) translateY(-15px);
        }
        
        .empty-cell {
          border: 2px dashed #dee2e6;
          border-radius: 8px;
          background-color: white;
        }
        
        .course-card {
          border: 1px solid #dee2e6;
          border-radius: 8px;
          background-color: white;
          cursor: move;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          position: relative;
          transition: all 0.2s ease-in-out;
        }
        
        .course-card:hover {
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }
        
        /* Error course styling */
        .error-course-card {
          border: 2px dashed #dc3545 !important;
          position: relative;
          animation: pulse-error 1.5s infinite;
        }
        
        @keyframes pulse-error {
          0% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(220, 53, 69, 0); }
          100% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); }
        }
        
        .error-message {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background-color: rgba(220, 53, 69, 0.9);
          color: white;
          padding: 3px;
          font-size: 0.7rem;
          text-align: center;
          z-index: 10;
        }
        
        .border-dashed {
          border: 2px dashed #dee2e6;
          border-radius: 6px;
        }
        
        /* Lesson progress display */
        .lesson-progress {
          font-size: 0.8rem;
          font-weight: 600;
          color: #6c757d;
          background-color: rgba(0, 0, 0, 0.05);
          padding: 2px 6px;
          border-radius: 10px;
        }
        
        /* Drag and drop styles */
        .dragging {
          opacity: 0.7;
          transform: scale(0.95);
        }
        
        .drag-over {
          background-color: rgba(40, 167, 69, 0.1);
          border: 2px dashed #28a745;
        }
        
        .cursor-pointer {
          cursor: pointer;
        }
        
        /* Available courses list styling */
        .available-courses-list {
          max-height: calc(100vh - 280px);
          overflow-y: auto;
        }
        
        .lesson-card {
          transition: all 0.2s ease;
        }
        
        .lesson-card:hover:not(.disabled-lesson) {
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        }
        
        .lock-course {
          position: absolute;
          top: 12px;
          left: 0;
          height: 100%;
          width: 100%;
          z-index: 9;
        }
        
        /* Highlight styling for recently added courses */
        .border-primary {
          border-color: #0d6efd !important;
          border-width: 2px !important;
        }
        
        .border-success {
          border-color: #198754 !important;
        }
        
        /* Media query for better responsiveness */
        @media (max-width: 992px) {
          .time-column {
            min-width: 100px;
            width: 100px;
          }
          
          .date-column, .date-cell {
            min-width: 140px;
            width: 140px;
          }
          
          .date-cell {
            height: 120px;
          }
          
          .toggle-split-view {
            top: 10px;
            width: 30px;
            height: 30px;
          }
          
          .resize-handle {
            width: 3px;
          }
        }
      `}</style>
    </div>
  );
};

export default CourseScheduler;