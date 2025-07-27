import axios from 'axios';

// Helper function to get the backend URL
const getBackendUrl = () => {
  return process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:3001';
};

// Create a course using the file-based API
export const createFileCourse = async (courseData) => {
  try {
    console.log('Creating course with file-based API:', courseData);

    // Create a complete course object with all necessary data
    const completeCourse = {
      title: courseData.title,
      shortDesription: courseData.shortDesription || courseData.short_description,
      description: courseData.description || courseData.shortDesription || courseData.short_description,
      category: courseData.category,
      level: courseData.level,
      language: courseData.language,
      format: courseData.format || courseData.courseType || 'recorded',
      modulesCount: courseData.modulesCount || courseData.modules_count || 4,
      instructor_id: courseData.instructor_id,
      // Add missing fields with defaults
      color: courseData.color || '#630000', // Default red color
      icon: courseData.icon || 'FaBook', // Default book icon
      promoVideoUrl: courseData.promoVideoUrl || courseData.promo_video_url || '',
      estimatedDuration: courseData.estimatedDuration || '10 hours',
      totalLectures: courseData.totalLectures || courseData.modulesCount * 3 || 12,
      status: courseData.status || 'published',
      lectures: Array.isArray(courseData.lectures) ? courseData.lectures.map(lecture => ({
        id: lecture.id,
        moduleName: lecture.moduleName,
        topicName: lecture.topicName,
        description: lecture.description,
        videoUrl: lecture.videoUrl,
        sortOrder: lecture.sortOrder
      })) : [],
      faqs: Array.isArray(courseData.faqs) ? courseData.faqs.map(faq => ({
        question: faq.question,
        answer: faq.answer
      })) : [],
      tags: Array.isArray(courseData.tags) ? courseData.tags.map(tag => ({
        tagName: tag.tagName || tag.tag_name
      })) : [],
      scheduling: courseData.scheduling || null,
      // Include instructor information if available
      instructor: courseData.instructor
    };

    // Make the API call
    const response = await axios.post(
      `${getBackendUrl()}/api/file-courses/create`,
      completeCourse
    );

    console.log('File-based course creation response:', response.data);

    return response.data;
  } catch (error) {
    console.error('Error creating course with file-based API:', error);
    throw error;
  }
};

// Get all courses using the file-based API
export const getAllFileCourses = async () => {
  try {
    const response = await axios.get(`${getBackendUrl()}/api/file-courses/all`);
    return response.data.courses || [];
  } catch (error) {
    console.error('Error getting courses with file-based API:', error);
    return [];
  }
};

// Get a course by ID using the file-based API
export const getFileCourseById = async (id) => {
  try {
    const response = await axios.get(`${getBackendUrl()}/api/file-courses/${id}`);
    return response.data.course || null;
  } catch (error) {
    console.error('Error getting course by ID with file-based API:', error);
    return null;
  }
};

// Update a course using the file-based API
export const updateFileCourse = async (id, courseData) => {
  try {
    console.log('Updating course with file-based API:', courseData);

    // Create a complete course object with all necessary data
    const completeCourse = {
      title: courseData.title,
      shortDesription: courseData.shortDesription || courseData.short_description,
      description: courseData.description || courseData.shortDesription || courseData.short_description,
      category: courseData.category,
      level: courseData.level,
      language: courseData.language,
      format: courseData.format || courseData.courseType || 'recorded',
      modulesCount: courseData.modulesCount || courseData.modules_count || 4,
      instructor_id: courseData.instructor_id,
      // Add missing fields with defaults
      color: courseData.color || '#630000', // Default red color
      icon: courseData.icon || 'FaBook', // Default book icon
      promoVideoUrl: courseData.promoVideoUrl || courseData.promo_video_url || '',
      estimatedDuration: courseData.estimatedDuration || '10 hours',
      totalLectures: courseData.totalLectures || courseData.modulesCount * 3 || 12,
      status: courseData.status || 'published',
      lectures: Array.isArray(courseData.lectures) ? courseData.lectures.map(lecture => ({
        id: lecture.id,
        moduleName: lecture.moduleName,
        topicName: lecture.topicName,
        description: lecture.description,
        videoUrl: lecture.videoUrl,
        sortOrder: lecture.sortOrder
      })) : [],
      faqs: Array.isArray(courseData.faqs) ? courseData.faqs.map(faq => ({
        id: faq.id, // Include ID for existing FAQs
        question: faq.question,
        answer: faq.answer
      })) : [],
      tags: Array.isArray(courseData.tags) ? courseData.tags.map(tag => ({
        id: tag.id, // Include ID for existing tags
        tagName: tag.tagName || tag.tag_name
      })) : [],
      scheduling: courseData.scheduling || null,
      // Include instructor information if available
      instructor: courseData.instructor
    };

    const response = await axios.put(
      `${getBackendUrl()}/api/file-courses/${id}`,
      completeCourse
    );

    console.log('File-based course update response:', response.data);

    return response.data;
  } catch (error) {
    console.error('Error updating course with file-based API:', error);
    throw error;
  }
};

// Delete a course using the file-based API
export const deleteFileCourse = async (id) => {
  try {
    const response = await axios.delete(`${getBackendUrl()}/api/file-courses/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting course with file-based API:', error);
    throw error;
  }
};
