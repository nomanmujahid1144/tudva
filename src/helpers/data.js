import { blogsData, courseResumeData, eventScheduleData, playListData, pricingPlans, studentData, studentReviewData, testimonialData, userReviewData } from "@/assets/data/other";
import { booksData, collegesData, courseCategories, coursesData, eventsData, instructorsData } from "@/assets/data/products";
import { sleep } from "@/utils/promise";
import axiosInstance from "@/utils/axiosInstance";

export const getAllCourses = async () => {
  try {
    const response = await axiosInstance.get('/api/courses');
    if (response.data && response.data.success) {
      // Map backend data to match frontend expected format
      return response.data.courses.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        short_description: course.short_description,
        category: course.category,
        level: course.level,
        language: course.language,
        format: course.format,
        modules_count: course.modules_count,
        status: course.status || 'pending',
        instructor_id: course.instructor_id,
        rating: { star: 4.5 }, // Default rating
        duration: '3h 15m', // Default duration
        lectures: course.modules_count || 0,
        badge: { text: course.level || 'All level' },
        icon: 'FaNodeJs', // Default icon
        color: '#6c757d' // Default color
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching courses:', error);
    // Fallback to sample data if API fails
    return coursesData;
  }
};
export const getAllEvents = async () => {
  await sleep();
  return eventsData;
};
export const getAllInstructors = async () => {
  try {
    const response = await axiosInstance.get('/api/user/all?role=instructor');
    if (response.data && response.data.success) {
      // Map backend data to match frontend expected format
      return response.data.users.map(user => ({
        id: user.userId,
        name: user.fullName,
        subject: "Instructor",
        rating: 4.5,
        totalCourses: 0,
        verified: user.isActive,
        students: 0,
        tasks: 0,
        department: user.role
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching instructors:', error);
    // Fallback to sample data if API fails
    return instructorsData;
  }
};

export const getInstructorById = async id => {
  try {
    const response = await axiosInstance.get(`/api/user/${id}`);
    if (response.data && response.data.success) {
      const user = response.data.user;
      return {
        id: user.userId,
        name: user.fullName,
        subject: "Instructor",
        rating: 4.5,
        totalCourses: 0,
        verified: user.isActive,
        students: 0,
        tasks: 0,
        department: user.role
      };
    }
    // Fallback to sample data if API fails
    const data = instructorsData.find(instructor => instructor.id == id);
    return data;
  } catch (error) {
    console.error('Error fetching instructor:', error);
    // Fallback to sample data if API fails
    const data = instructorsData.find(instructor => instructor.id == id);
    return data;
  }
};
export const getAllColleges = async () => {
  await sleep();
  return collegesData;
};
export const getAllBooks = async () => {
  await sleep();
  return booksData;
};
export const getProductById = async id => {
  const data = booksData.find(product => product.id == id);
  await sleep();
  return data;
};
export const getAllEventSchedule = async () => {
  await sleep();
  return eventScheduleData;
};
export const getAllStudents = async () => {
  try {
    // Get all users with learner role
    const response = await axiosInstance.get('/api/user/all?role=learner');
    if (response.data && response.data.success) {
      // Get courses for mapping
      const coursesResponse = await axiosInstance.get('/api/courses');
      const courses = coursesResponse.data && coursesResponse.data.success ?
        coursesResponse.data.courses : [];

      // Map users to student format
      return response.data.users.map(user => {
        // Assign a random course to each student for now
        const randomCourseIndex = Math.floor(Math.random() * (courses.length || 1));
        const course = courses.length > 0 ? courses[randomCourseIndex] : null;

        return {
          id: user.userId,
          courseId: course ? course.id : '1',
          location: 'Unknown',
          payments: Math.floor(Math.random() * 10000),
          progress: Math.floor(Math.random() * 100),
          totalCourse: Math.floor(Math.random() * 10) + 1,
          course: course ? {
            id: course.id,
            title: course.title,
            description: course.description,
            short_description: course.short_description,
            category: course.category,
            level: course.level,
            language: course.language,
            format: course.format,
            modules_count: course.modules_count,
            status: course.status || 'pending',
            instructor_id: course.instructor_id,
            rating: { star: 4.5 }, // Default rating
            duration: '3h 15m', // Default duration
            lectures: course.modules_count || 0,
            badge: { text: course.level || 'All level' }
          } : null
        };
      });
    }

    // Fallback to sample data
    const data = studentData.map(student => {
      const course = coursesData.find(course => course.id === student.courseId);
      return {
        ...student,
        course
      };
    });
    return data;
  } catch (error) {
    console.error('Error fetching students:', error);
    // Fallback to sample data
    const data = studentData.map(student => {
      const course = coursesData.find(course => course.id === student.courseId);
      return {
        ...student,
        course
      };
    });
    return data;
  }
};
export const getAllCategories = async () => {
  try {
    // Get all courses to extract unique categories
    const response = await axiosInstance.get('/api/courses');
    if (response.data && response.data.success) {
      // Extract unique categories from courses
      const categories = response.data.courses.reduce((acc, course) => {
        if (course.category && !acc.find(cat => cat.title === course.category)) {
          acc.push({
            id: `cat-${acc.length + 1}`,
            title: course.category,
            courses: 0,
            variant: getRandomVariant()
          });
        }
        return acc;
      }, []);

      // Count courses per category
      response.data.courses.forEach(course => {
        if (course.category) {
          const category = categories.find(cat => cat.title === course.category);
          if (category) {
            category.courses++;
          }
        }
      });

      return categories.length > 0 ? categories : courseCategories;
    }
    return courseCategories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return courseCategories;
  }
};

// Helper function to get random variant for categories
function getRandomVariant() {
  const variants = [
    'bg-success', 'bg-orange', 'bg-danger', 'bg-purple',
    'bg-info', 'bg-blue', 'bg-warning', 'bg-dark', 'bg-primary'
  ];
  return variants[Math.floor(Math.random() * variants.length)];
}
export const getAllUserReviews = async () => {
  await sleep();
  return userReviewData;
};
export const getAllStudentsReviews = async () => {
  await sleep();
  return studentReviewData;
};
export const getAllPlaylist = async () => {
  await sleep();
  return playListData;
};
export const getAllBlogs = async () => {
  await sleep();
  return blogsData;
};
export const getAllPricingPlans = async () => {
  await sleep();
  return pricingPlans;
};
export const getBlogById = async id => {
  const data = blogsData.find(blog => blog.id == id);
  await sleep();
  return data;
};
export const getAllTestimonials = async () => {
  const data = testimonialData.map(testimonial => {
    const course = coursesData.find(course => course.id === testimonial.courseId);
    return {
      ...testimonial,
      course
    };
  });
  await sleep();
  return data;
};
export const getAllCourseResume = async () => {
  const data = courseResumeData.map(courseResume => {
    const course = coursesData.find(course => course.id === courseResume.courseId);
    return {
      ...courseResume,
      course
    };
  });
  await sleep();
  return data;
};
