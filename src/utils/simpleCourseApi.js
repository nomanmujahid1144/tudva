import axios from 'axios';

// Helper function to get the backend URL
const getBackendUrl = () => {
  return process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:3001';
};

// Create a course using the simplified API
export const createSimpleCourse = async (courseData) => {
  try {
    console.log('Creating course with simplified API:', courseData);

    // Create a simplified course object
    const simplifiedCourse = {
      title: courseData.title,
      shortDesription: courseData.shortDesription || courseData.short_description,
      description: courseData.description || courseData.shortDesription || courseData.short_description,
      category: courseData.category,
      level: courseData.level,
      language: courseData.language,
      format: courseData.format || courseData.courseType || 'recorded',
      modulesCount: courseData.modulesCount || courseData.modules_count || 4,
      instructor_id: courseData.instructor_id
    };

    // Make the API call
    const response = await axios.post(
      `${getBackendUrl()}/api/simple-courses/create`,
      simplifiedCourse
    );

    console.log('Simple course creation response:', response.data);

    return response.data;
  } catch (error) {
    console.error('Error creating course with simplified API:', error);
    throw error;
  }
};

// Get all courses using the simplified API
export const getAllSimpleCourses = async () => {
  try {
    const response = await axios.get(`${getBackendUrl()}/api/simple-courses/all`);
    return response.data.courses || [];
  } catch (error) {
    console.error('Error getting courses with simplified API:', error);
    return [];
  }
};
