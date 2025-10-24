"use client"
import Footer from "@/components/Footer";
import dynamic from 'next/dynamic';
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { checkIsLoggedInUser } from "@/helpers/checkLoggedInUser";
import axiosInstance from "@/utils/axiosInstance";
import { getAllFileCourses } from "@/utils/fileCourseApi";
import { getAllDirectCourses } from "@/utils/directCourseApi";
import { getAllSimpleCourses } from "@/utils/simpleCourseApi";
import TopNavigationBar from "./components/TopNavigationBar";

// Dynamically import components that use window/browser APIs with ssr: false
const BannerVideo = dynamic(() => import("./components/BannerVideo"), { ssr: false });
const CourseDetails = dynamic(() => import("./components/CourseDetails"), { ssr: false });
const CourseDetailSkeleton = dynamic(() => import("./components/CourseDetailSkeleton"), { ssr: false });
const CourseBanner = dynamic(() => import("./components/CourseBanner"), { ssr: false });

const DetailMinimal = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id;
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [error, setError] = useState(null);

  console.log('Course detail page loaded with ID:', courseId);

  // Function to format and set course data
  const formatAndSetCourse = (courseData) => {
    if (!courseData || !courseData.id) {
      console.error('Invalid course data:', courseData);
      return;
    }

    console.log('Formatting course data:', courseData);

    // Extract scheduling data
    let schedulingData = null;

    // Check if scheduling data is available directly
    if (courseData.scheduling) {
      schedulingData = courseData.scheduling;
      console.log('Found scheduling data directly in course:', schedulingData);
    }
    // Check if scheduling data is available in schedules array
    else if (courseData.schedules && courseData.schedules.length > 0) {
      const schedule = courseData.schedules[0];
      schedulingData = {
        day: schedule.day,
        slotsPerDay: schedule.slotsPerDay,
        selectedSlots: schedule.selectedSlots,
        startDate: schedule.startDate,
        endDate: schedule.endDate,
        totalWeeks: schedule.totalWeeks
      };
      console.log('Extracted scheduling data from schedules array:', schedulingData);
    }
    // Try to get scheduling data from localStorage
    else {
      try {
        const localCourseStr = localStorage.getItem(`course_${courseData.id}`);
        if (localCourseStr) {
          const localCourse = JSON.parse(localCourseStr);
          if (localCourse.scheduling) {
            schedulingData = localCourse.scheduling;
            console.log('Found scheduling data in localStorage:', schedulingData);
          }
        }
      } catch (error) {
        console.error('Error accessing localStorage for scheduling data:', error);
      }
    }

    // Format the course data to match the expected structure
    const formattedData = {
      course: {
        id: courseData.id,
        title: courseData.title || 'Untitled Course',
        description: courseData.description || '',
        modules_count: courseData.modulesCount || courseData.modules_count || 4,
        short_description: courseData.shortDescription || courseData.short_description || '',
        level: courseData.level || 'Beginner',
        color: courseData.color || '#ffffff',
        icon: courseData.icon || 'FaBook',
        promo_video_url: courseData.promo_video_url || courseData.promoVideoUrl || '',
        format: courseData.format || 'video',
        courseType: courseData.courseType || 'recorded',
        category: courseData.category || 'General',
        language: courseData.language || 'English',
        instructor_id: courseData.instructor_id || 'local_instructor',
        instructor: courseData.instructor || {
          name: 'Instructor Name',
          title: 'Course Instructor',
          avatar: '/assets/images/avatar/placeholder.svg',
          bio: 'Experienced instructor with expertise in this subject.',
          id: courseData.instructor_id || 'local_instructor'
        },
        rating: courseData.averageRating || 0,
        enrolled: courseData.enrollmentCount || 0,
        price: courseData.price || 0,
        duration: courseData.estimatedDuration || 'Not specified',
        certificate: courseData.certificate !== undefined ? courseData.certificate : true,
        createdAt: courseData.createdAt || new Date().toISOString(),
        updatedAt: courseData.updatedAt || new Date().toISOString(),
        status: courseData.status || 'published',
        // Add scheduling data if available
        seminarDay: courseData.seminarDay || (schedulingData ? {
          id: schedulingData.day,
          name: schedulingData.day.charAt(0).toUpperCase() + schedulingData.day.slice(1)
        } : null),
        slots: courseData.slots || []
      },
      lectures: Array.isArray(courseData.lectures) ? courseData.lectures : [],
      faqs: Array.isArray(courseData.faqs) ? courseData.faqs : [],
      tags: Array.isArray(courseData.tags) ? courseData.tags : [],
      reviews: Array.isArray(courseData.reviews) ? courseData.reviews : [],
      averageRating: courseData.averageRating || 0,
      reviewCount: courseData.reviewCount || 0,
      // Add scheduling data to the top level
      scheduling: schedulingData
    };

    // Save the formatted data to localStorage for backup
    try {
      localStorage.setItem(`course_${courseData.id}`, JSON.stringify({
        ...courseData,
        scheduling: schedulingData
      }));
      console.log('Saved course with scheduling data to localStorage');
    } catch (error) {
      console.error('Error saving course to localStorage:', error);
    }

    console.log('Formatted course data:', formattedData);

    // Create modules from lectures or use provided modules
    if (courseData.modules && typeof courseData.modules === 'object' && !Array.isArray(courseData.modules)) {
      // If modules is already in the correct format, use it directly
      formattedData.modules = courseData.modules;
      console.log('Using existing modules object:', formattedData.modules);
    } else if (courseData.modulesList && Array.isArray(courseData.modulesList) && courseData.modulesList.length > 0) {
      // If modulesList is available (new format), use it to create the modules map
      console.log('Using modulesList to create modules:', courseData.modulesList);
      const moduleMap = {};

      courseData.modulesList.forEach((module) => {
        const moduleName = module.title || `Module ${module.moduleNumber || 1}`;
        moduleMap[moduleName] = [];

        // Find lectures for this module
        if (Array.isArray(courseData.lectures)) {
          const moduleLectures = courseData.lectures.filter(lecture =>
            lecture.moduleId === module.id || lecture.moduleName === moduleName
          );

          moduleLectures.forEach(lecture => {
            moduleMap[moduleName].push({
              id: lecture.id,
              title: lecture.title || lecture.topicName || 'Untitled Lecture',
              description: lecture.description || '',
              duration: lecture.durationMinutes ? `${lecture.durationMinutes}:00` : '45:00',
              videoUrl: lecture.videoUrl || lecture.videoFile || lecture.video_url || 'https://www.youtube.com/embed/tXHviS-4ygo',
              watched: false,
              isDemoLecture: lecture.isDemoLecture || false,
              isAccessible: lecture.isAccessible || false
            });
          });
        }
      });

      formattedData.modules = moduleMap;
      console.log('Created modules from modulesList:', formattedData.modules);
    } else if (Array.isArray(courseData.modules) && courseData.modules.length > 0) {
      // If modules is an array, convert it to the expected format
      console.log('Converting modules array to map:', courseData.modules);
      const moduleMap = {};
      courseData.modules.forEach((module, index) => {
        const moduleName = module.title || `Module ${index + 1}`;
        moduleMap[moduleName] = [];

        // Add lectures from this module if they exist
        if (Array.isArray(module.lectures)) {
          module.lectures.forEach(lecture => {
            moduleMap[moduleName].push({
              id: lecture.id,
              title: lecture.title || 'Untitled Lecture',
              description: lecture.description || '',
              duration: lecture.durationMinutes ? `${lecture.durationMinutes}:00` : '45:00',
              videoUrl: lecture.videoUrl || lecture.videoFile || lecture.video_url || 'https://www.youtube.com/embed/tXHviS-4ygo',
              watched: false,
              isDemoLecture: lecture.isDemoLecture || false,
              isAccessible: lecture.isAccessible || false
            });
          });
        }
      });

      formattedData.modules = moduleMap;
    } else if (Array.isArray(courseData.lectures) && courseData.lectures.length > 0) {
      // Group lectures by module if no modules are provided
      console.log('Grouping lectures by moduleName:', courseData.lectures);
      const moduleMap = {};
      courseData.lectures.forEach(lecture => {
        const moduleName = lecture.moduleName || 'Module 1';
        if (!moduleMap[moduleName]) {
          moduleMap[moduleName] = [];
        }
        moduleMap[moduleName].push({
          id: lecture.id,
          title: lecture.topicName || lecture.title || 'Untitled Lecture',
          description: lecture.description || '',
          duration: lecture.durationMinutes ? `${lecture.durationMinutes}:00` : '45:00',
          videoUrl: lecture.videoUrl || lecture.videoFile || lecture.video_url || 'https://www.youtube.com/embed/tXHviS-4ygo',
          watched: false,
          isDemoLecture: lecture.isDemoLecture || false,
          isAccessible: lecture.isAccessible || false
        });
      });

      formattedData.modules = moduleMap;
      console.log('Created modules from lectures:', formattedData.modules);
    } else {
      // If no modules or lectures exist, create a single empty module
      console.log('No modules or lectures found, creating empty module structure');
      formattedData.modules = {
        'Module 1': []
      };

      // Show error in console for debugging
      console.error('Course has no modules or lectures. This may indicate incomplete course data.');

      // Set error state to inform user
      setError('This course has no content yet. Please check back later.');
    }

    // Set the course data
    setCourse(formattedData);
    setIsLoading(false);
  };

  // Try to get the course from localStorage immediately
  useEffect(() => {
    if (!courseId) {
      console.error('No course ID provided');
      setError('No course ID provided');
      setIsLoading(false);
      return;
    }

    try {
      // Check if course is in localStorage
      const specificCourseStr = localStorage.getItem(`course_${courseId}`);
      if (specificCourseStr) {
        const localCourse = JSON.parse(specificCourseStr);
        console.log('Found course in localStorage immediately:', localCourse);
        // Format and set the course data
        formatAndSetCourse(localCourse);
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
  }, [courseId])
  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) {
        console.error('No course ID provided');
        setIsLoading(false);
        return;
      }

      console.log('Fetching course with ID:', courseId);
      try {
        setIsLoading(true);

        // Try to get the course directly by ID
        let course = null;

        // First try to fetch directly from the backend API
        try {
          console.log('Fetching course directly from backend API:', courseId);
          const response = await axiosInstance.get(`/api/courses/${courseId}`);

          if (response.data && response.data.success && response.data.course) {
            console.log('Successfully fetched course from backend API:', response.data.course);
            course = response.data.course;

            // If we have modules in the response, add them to the course
            if (response.data.modules) {
              course.modules = response.data.modules;
            }
          }
        } catch (backendError) {
          console.warn('Error fetching from backend API:', backendError);
        }

        // If not found in backend API, try file-based API
        if (!course) {
          try {
            console.log('Trying to fetch course from file-based API');
            const fileResponse = await axiosInstance.get(`/api/file-courses/${courseId}`);

            if (fileResponse.data && fileResponse.data.course) {
              console.log('Successfully fetched course from file-based API:', fileResponse.data.course);
              course = fileResponse.data.course;
            }
          } catch (fileApiError) {
            console.warn('Error fetching from file-based API:', fileApiError);
          }
        }

        // If still not found, try direct API
        if (!course) {
          try {
            console.log('Trying to fetch course from direct API');
            const directResponse = await axiosInstance.get(`/api/direct-courses/${courseId}`);

            if (directResponse.data && directResponse.data.course) {
              console.log('Successfully fetched course from direct API:', directResponse.data.course);
              course = directResponse.data.course;
            }
          } catch (directApiError) {
            console.warn('Error fetching from direct API:', directApiError);
          }
        }

        // If still not found, try getting all courses from different APIs
        if (!course) {
          try {
            // Try all file courses
            const fileCourses = await getAllFileCourses();
            course = fileCourses.find(c => c.id === courseId);

            if (!course) {
              // Try all direct courses
              const directCourses = await getAllDirectCourses();
              course = directCourses.find(c => c.id === courseId);

              if (!course) {
                // Try all simple courses
                const simpleCourses = await getAllSimpleCourses();
                course = simpleCourses.find(c => c.id === courseId);
              }
            }
          } catch (allCoursesError) {
            console.warn('Error fetching all courses:', allCoursesError);
          }
        }

        // If still not found, try localStorage as last resort
        if (!course) {
          try {
            // Try courses in localStorage
            const coursesStr = localStorage.getItem('courses');
            if (coursesStr) {
              const courses = JSON.parse(coursesStr);
              course = courses.find(c => c.id === courseId);
            }

            // If not found, try fileCourses in localStorage
            if (!course) {
              const fileCoursesStr = localStorage.getItem('fileCourses');
              if (fileCoursesStr) {
                const fileCourses = JSON.parse(fileCoursesStr);
                course = fileCourses.find(c => c.id === courseId);
              }
            }

            // If still not found, try directCourses in localStorage
            if (!course) {
              const directCoursesStr = localStorage.getItem('directCourses');
              if (directCoursesStr) {
                const directCourses = JSON.parse(directCoursesStr);
                course = directCourses.find(c => c.id === courseId);
              }
            }

            // If still not found, try specific course in localStorage
            if (!course) {
              const specificCourseStr = localStorage.getItem(`course_${courseId}`);
              if (specificCourseStr) {
                course = JSON.parse(specificCourseStr);
              }
            }
          } catch (localStorageError) {
            console.error('Error accessing localStorage:', localStorageError);
          }
        }

        if (!course) {
          console.error(`Course with ID ${courseId} not found in any API`);
          setError(`Course with ID ${courseId} not found`);
          setIsLoading(false);
          return;
        }

        console.log('Final course data before formatting:', course);

        // Format and set the course data
        formatAndSetCourse(course);

        // Store the course in localStorage for future use
        try {
          // Store in localStorage
          localStorage.setItem(`course_${courseId}`, JSON.stringify(course));

          // Also update the courses array if it exists
          const coursesStr = localStorage.getItem('courses');
          if (coursesStr) {
            const courses = JSON.parse(coursesStr);
            // Check if course already exists
            const existingIndex = courses.findIndex(c => c.id === courseId);
            if (existingIndex >= 0) {
              // Update existing course
              courses[existingIndex] = course;
            } else {
              // Add new course
              courses.push(course);
            }
            localStorage.setItem('courses', JSON.stringify(courses));
          } else {
            // Create new courses array
            localStorage.setItem('courses', JSON.stringify([course]));
          }
        } catch (storageError) {
          console.warn('Error storing course in localStorage:', storageError);
        }



        // Course data has been formatted and set
      } catch (error) {
        console.error("Error fetching course:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleVideoSelect = (video) => {
    console.log('Video selected in page:', video);
    if (video && video.videoUrl) {
      setCurrentVideo(video);
    }
  };
  console.log(currentVideo, "in the ccccccccccccc")

  // Show loading state while fetching course data
  if (isLoading) {
    return (
      <>
        
        <CourseDetailSkeleton />
    
      </>
    );
  }

  // Show error state if course data is not available
  if (!course) {
    return (
      <>
        <div className="container my-5 py-5 text-center">
          <h2>Course Not Found</h2>
          <p>{error || 'The course you are looking for could not be found. Please try again later or check the URL.'}</p>
          <button
            className="btn btn-primary mt-3"
            onClick={() => {
              // Go back to courses page
              router.push('/pages/course/grid');
            }}
          >
            Browse Courses
          </button>
        </div>
      </>
    );
  }

  return <>
    <main>
      <CourseBanner course={course} />
      <BannerVideo course={course} selectedVideo={currentVideo} onVideoSelect={handleVideoSelect} />
      <CourseDetails course={course} onVideoSelect={handleVideoSelect} />
    </main>
  </>;
};
export default DetailMinimal;
