'use client';

/**
 * Normalizes course data to ensure consistent field names and data structure
 * across different parts of the application
 * 
 * @param {Object} course - The course object to normalize
 * @returns {Object} - Normalized course object
 */
export const normalizeCourseData = (course) => {
  if (!course) return null;
  
  // Create a new object to avoid mutating the original
  const normalizedCourse = { ...course };
  
  // Normalize field names
  if (normalizedCourse.shortDesription !== undefined && normalizedCourse.short_description === undefined) {
    normalizedCourse.short_description = normalizedCourse.shortDesription;
  }
  
  if (normalizedCourse.short_description !== undefined && normalizedCourse.shortDesription === undefined) {
    normalizedCourse.shortDesription = normalizedCourse.short_description;
  }
  
  // Ensure format and courseType are consistent
  if (normalizedCourse.format === undefined && normalizedCourse.courseType !== undefined) {
    normalizedCourse.format = normalizedCourse.courseType;
  }
  
  if (normalizedCourse.courseType === undefined && normalizedCourse.format !== undefined) {
    normalizedCourse.courseType = normalizedCourse.format;
  }
  
  // Default values for important fields
  normalizedCourse.format = normalizedCourse.format || 'recorded';
  normalizedCourse.courseType = normalizedCourse.courseType || 'recorded';
  normalizedCourse.color = normalizedCourse.color || '#8bc34a';
  normalizedCourse.icon = normalizedCourse.icon || 'FaBook';
  
  // Calculate total lectures if not provided
  if (!normalizedCourse.totalLectures && normalizedCourse.lectures) {
    normalizedCourse.totalLectures = normalizedCourse.lectures.length;
  }
  
  // Calculate estimated duration if not provided (45 minutes per lecture)
  if (!normalizedCourse.estimatedDuration && normalizedCourse.totalLectures) {
    normalizedCourse.estimatedDuration = normalizedCourse.totalLectures * 45;
  }
  
  return normalizedCourse;
};

/**
 * Normalizes an array of courses
 * 
 * @param {Array} courses - Array of course objects
 * @returns {Array} - Array of normalized course objects
 */
export const normalizeCourses = (courses) => {
  if (!Array.isArray(courses)) return [];
  
  return courses.map(course => normalizeCourseData(course));
};

/**
 * Calculates the estimated duration for a course based on its lectures
 * 
 * @param {Array} lectures - Array of lecture objects
 * @returns {number} - Estimated duration in minutes
 */
export const calculateEstimatedDuration = (lectures) => {
  if (!lectures || !Array.isArray(lectures) || lectures.length === 0) {
    return 0;
  }
  
  // Each lecture is 45 minutes by default
  return lectures.length * 45;
};

/**
 * Formats the estimated duration into a human-readable string
 * 
 * @param {number} durationMinutes - Duration in minutes
 * @returns {string} - Formatted duration string (e.g., "2 hours 15 minutes")
 */
export const formatDuration = (durationMinutes) => {
  if (!durationMinutes || durationMinutes <= 0) {
    return 'Self-paced';
  }
  
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  
  if (hours === 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else if (minutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  } else {
    return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
};
