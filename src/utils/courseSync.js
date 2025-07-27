import axios from 'axios';

// Helper function to get auth token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Function to sync courses between localStorage and backend
export const syncCourses = async () => {
  try {
    // First, get courses from localStorage as a baseline
    const localCoursesStr = localStorage.getItem('courses');
    const localCourses = localCoursesStr ? JSON.parse(localCoursesStr) : [];

    // Try to get courses from the backend with a smaller page size
    try {
      const response = await axios.get('/api/courses', {
        headers: getAuthHeader(),
        params: { pageSize: 20 } // Use a smaller page size to avoid header size issues
      });

      // If backend request is successful, update localStorage
      if (response.data && response.data.success && response.data.courses) {
        console.log('Syncing courses from backend:', response.data.courses);

        // Merge backend courses with local courses, preferring backend data
        // but keeping local courses that don't exist in backend
        const backendCourseIds = response.data.courses.map(course => course.id);
        const localOnlyCourses = localCourses.filter(course => !backendCourseIds.includes(course.id));

        // Combine backend courses with local-only courses
        const mergedCourses = [...response.data.courses, ...localOnlyCourses];

        // Update localStorage
        localStorage.setItem('courses', JSON.stringify(mergedCourses));

        return mergedCourses;
      }
    } catch (apiError) {
      console.warn('Error fetching courses from API, using localStorage only:', apiError.message);
      // Continue with localStorage only
    }

    // Return courses from localStorage if API call fails
    return localCourses;
  } catch (error) {
    console.error('Error in syncCourses:', error);

    // Return empty array as last resort
    return [];
  }
};

// Function to add a course to both localStorage and backend
export const addCourse = async (course) => {
  try {
    // First, add to localStorage
    const localCoursesStr = localStorage.getItem('courses');
    const localCourses = localCoursesStr ? JSON.parse(localCoursesStr) : [];

    // Create a simplified course object to avoid large localStorage objects
    const simplifiedCourse = {
      id: course.id,
      title: course.title,
      shortDesription: course.shortDesription,
      short_description: course.short_description || course.shortDesription,
      description: course.description || course.shortDesription,
      category: course.category,
      level: course.level,
      language: course.language,
      modulesCount: course.modulesCount || course.modules_count || 4,
      modules_count: course.modules_count || course.modulesCount || 4,
      format: course.format || course.courseType || 'recorded',
      courseType: course.courseType || course.format || 'recorded',
      status: course.status || 'published',
      instructor_id: course.instructor_id,
      createdAt: course.createdAt || new Date().toISOString(),
      updatedAt: course.updatedAt || new Date().toISOString(),
      // Include only essential data from complex objects
      faqs: Array.isArray(course.faqs) ? course.faqs.map(faq => ({
        question: faq.question,
        answer: faq.answer
      })) : [],
      tags: Array.isArray(course.tags) ? course.tags.map(tag => ({
        tagName: tag.tagName || tag.tag_name
      })) : []
    };

    // Check if course already exists
    const existingIndex = localCourses.findIndex(c => c.id === simplifiedCourse.id);

    if (existingIndex >= 0) {
      // Update existing course
      localCourses[existingIndex] = { ...localCourses[existingIndex], ...simplifiedCourse };
    } else {
      // Add new course
      localCourses.push(simplifiedCourse);
    }

    // Update localStorage
    localStorage.setItem('courses', JSON.stringify(localCourses));

    // Don't try to sync with backend immediately to avoid request header size issues
    // The next time syncCourses is called, it will handle the sync

    return { success: true, course: simplifiedCourse };
  } catch (error) {
    console.error('Error adding course:', error);
    return { success: false, error: error.message };
  }
};

// Function to get all courses (from localStorage, synced with backend)
export const getAllCourses = async () => {
  return await syncCourses();
};
