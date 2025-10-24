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
import TopNavigationBar from "@/app/pages/course/detail-min/[id]/components/TopNavigationBar";

// Dynamically import components that use window/browser APIs with ssr: false
const BannerVideo = dynamic(() => import("./components/BannerVideo"), { ssr: false });
const CourseDetailSkeleton = dynamic(() => import("@/app/pages/course/detail-min/[id]/components/CourseDetailSkeleton"), { ssr: false });
const CourseBanner = dynamic(() => import("@/app/pages/course/detail-min/[id]/components/CourseBanner"), { ssr: false });

// Import our custom components
const CourseDetails = dynamic(() => import("./components/CourseDetails"), { ssr: false });

const CourseDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id;
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [error, setError] = useState(null);

  console.log('Course detail page loaded with ID:', courseId);

  // Helper function to format and set course data
  const formatAndSetCourse = (courseData) => {
    if (!courseData) {
      console.error('No course data to format');
      return;
    }

    try {
      // Format the course data to match the expected structure
      const formattedCourse = {
        ...courseData,
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
          rating: courseData.averageRating || 0,
          enrolled: courseData.enrollmentCount || 0,
          price: courseData.price || 0,
          duration: courseData.estimatedDuration || 'Not specified',
          certificate: courseData.certificate !== undefined ? courseData.certificate : true,
          createdAt: courseData.createdAt || new Date().toISOString(),
          updatedAt: courseData.updatedAt || new Date().toISOString(),
          status: courseData.status || 'published',
          instructor: courseData.instructor || {
            id: courseData.instructor_id || '1',
            fullName: 'Instructor Name',
            profilePicture: '/assets/images/avatar/01.jpg'
          }
        },
        lectures: courseData.lectures || [],
        reviews: courseData.reviews || [],
        tags: courseData.tags || [],
      };

      // Create modules from lectures or use provided modules
      if (courseData.modules && typeof courseData.modules === 'object' && !Array.isArray(courseData.modules)) {
        // If modules is already in the correct format, use it directly
        formattedCourse.modules = courseData.modules;
        console.log('Using existing modules object:', formattedCourse.modules);
      } else if (courseData.modulesList && Array.isArray(courseData.modulesList) && courseData.modulesList.length > 0) {
        // If modulesList is available (new format), use it to create the modules map
        console.log('Using modulesList to create modules:', courseData.modulesList);
        const moduleMap = {};

        courseData.modulesList.forEach(module => {
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

        formattedCourse.modules = moduleMap;
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

        formattedCourse.modules = moduleMap;
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

        formattedCourse.modules = moduleMap;
      } else {
        // If no modules or lectures exist, create a single empty module
        console.log('No modules or lectures found, creating empty module structure');
        formattedCourse.modules = {
          'Module 1': []
        };

        // Create some dummy lectures for testing
        formattedCourse.modules['Module 1'] = [
          {
            id: 'dummy-1',
            title: 'Introduction to the Course',
            description: 'An overview of what you will learn in this course.',
            duration: '10:00',
            videoUrl: 'https://www.youtube.com/embed/tXHviS-4ygo',
            watched: false,
            isDemoLecture: true,
            isAccessible: true
          },
          {
            id: 'dummy-2',
            title: 'Getting Started',
            description: 'How to get started with the course materials.',
            duration: '15:00',
            videoUrl: 'https://www.youtube.com/embed/tXHviS-4ygo',
            watched: false,
            isDemoLecture: false,
            isAccessible: false
          }
        ];

        // Add a second module with some lectures
        formattedCourse.modules['Module 2'] = [
          {
            id: 'dummy-3',
            title: 'Core Concepts',
            description: 'Understanding the core concepts.',
            duration: '20:00',
            videoUrl: 'https://www.youtube.com/embed/tXHviS-4ygo',
            watched: false,
            isDemoLecture: false,
            isAccessible: false
          },
          {
            id: 'dummy-4',
            title: 'Advanced Techniques',
            description: 'Learning advanced techniques.',
            duration: '25:00',
            videoUrl: 'https://www.youtube.com/embed/tXHviS-4ygo',
            watched: false,
            isDemoLecture: false,
            isAccessible: false
          }
        ];
      }

      console.log('Formatted course data:', formattedCourse);
      setCourse(formattedCourse);

      // Set the first video as current if available
      // First try to find a demo lecture
      let firstVideo = null;

      // Look through all modules for a demo lecture
      for (const moduleName in formattedCourse.modules) {
        const lectures = formattedCourse.modules[moduleName];
        if (Array.isArray(lectures) && lectures.length > 0) {
          // First look for a demo lecture
          const demoLecture = lectures.find(lecture => lecture.isDemoLecture && lecture.videoUrl);
          if (demoLecture) {
            firstVideo = demoLecture;
            break;
          }
          // If no demo lecture, use the first lecture with a videoUrl
          if (!firstVideo) {
            const firstLectureWithVideo = lectures.find(lecture => lecture.videoUrl);
            if (firstLectureWithVideo) {
              firstVideo = firstLectureWithVideo;
              // Don't break here, continue looking for demo lectures in other modules
            }
          }
        }
      }

      // If no video found in modules, try the lectures array
      if (!firstVideo && Array.isArray(formattedCourse.lectures) && formattedCourse.lectures.length > 0) {
        firstVideo = formattedCourse.lectures.find(lecture => lecture.videoUrl);
      }

      if (firstVideo) {
        console.log('Setting first video:', firstVideo);
        setCurrentVideo(firstVideo);
      }
    } catch (error) {
      console.error('Error formatting course data:', error);
      setCourse(courseData); // Fallback to original data
    }
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
  }, [courseId]);

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

        // If not found, try the file-based API
        if (!course) {
          try {
            console.log('Fetching course from file-based API:', courseId);
            const fileCourse = await axiosInstance.get(`/api/file-courses/${courseId}`);

            if (fileCourse.data && fileCourse.data.success && fileCourse.data.course) {
              console.log('Successfully fetched course from file-based API:', fileCourse.data.course);
              course = fileCourse.data.course;

              // If we have modules in the response, add them to the course
              if (fileCourse.data.modules) {
                course.modules = fileCourse.data.modules;
              }
            }
          } catch (fileApiError) {
            console.warn('Error fetching from file-based API:', fileApiError);
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

        // If still not found, try localStorage as a last resort
        if (!course) {
          try {
            console.log('Trying to get course from localStorage:', courseId);
            const coursesStr = localStorage.getItem('courses');
            if (coursesStr) {
              const courses = JSON.parse(coursesStr);
              course = courses.find(c => c.id === courseId);

              if (course) {
                console.log('Found course in localStorage:', course);
              }
            }
          } catch (localStorageError) {
            console.warn('Error fetching from localStorage:', localStorageError);
          }
        }

        if (!course) {
          console.error('Course not found with ID:', courseId);
          setError('Course not found');
          setIsLoading(false);
          return;
        }

        // Format and set the course data
        formatAndSetCourse(course);

        // Store the course in localStorage for faster access next time
        try {
          localStorage.setItem(`course_${courseId}`, JSON.stringify(course));
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
      // Store the selected video in localStorage for persistence
      try {
        localStorage.setItem('lastSelectedVideo_' + courseId, JSON.stringify(video));
      } catch (error) {
        console.warn('Failed to store selected video in localStorage:', error);
      }
    } else {
      console.warn('Attempted to select a video without a videoUrl:', video);
    }
  };

  // Load the last selected video from localStorage on initial load
  useEffect(() => {
    if (courseId) {
      try {
        const savedVideo = localStorage.getItem('lastSelectedVideo_' + courseId);
        if (savedVideo) {
          const parsedVideo = JSON.parse(savedVideo);
          if (parsedVideo && parsedVideo.videoUrl) {
            console.log('Loaded last selected video from localStorage:', parsedVideo);
            setCurrentVideo(parsedVideo);
          }
        }
      } catch (error) {
        console.warn('Failed to load selected video from localStorage:', error);
      }
    }
  }, [courseId]);

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

  return (
    <>

      <main>
        <CourseBanner course={course} />
        <BannerVideo course={course} selectedVideo={currentVideo} onVideoSelect={handleVideoSelect} />
        <CourseDetails course={course} onVideoSelect={handleVideoSelect} selectedVideo={currentVideo} />
      </main>

    </>
  );
};

export default CourseDetailPage;
