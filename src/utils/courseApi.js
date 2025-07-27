import axios from 'axios';
import authService from '@/services/authService';

// Helper function to get auth token
const getAuthHeader = () => {
  return authService.getAuthHeader();
};

// Create a course
export const createCourse = async (courseData) => {
  try {
    const response = await axios.post(
      '/api/instructor/create-course',
      courseData,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
};

// Get all courses
export const getAllCourses = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();

    // Add any provided parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await axios.get(
      `/api/courses?${queryParams.toString()}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

// Get course by ID
export const getCourseById = async (courseId) => {
  try {
    const response = await axios.get(
      `/api/courses/${courseId}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching course with ID ${courseId}:`, error);
    throw error;
  }
};
