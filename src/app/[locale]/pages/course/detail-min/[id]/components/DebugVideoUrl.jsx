'use client';

import { useState, useEffect } from 'react';
import { Button, Card, CardBody } from 'react-bootstrap';

const DebugVideoUrl = ({ courseId }) => {
  const [courseData, setCourseData] = useState(null);
  const [localStorageCourses, setLocalStorageCourses] = useState([]);
  const [isFixed, setIsFixed] = useState(false);

  useEffect(() => {
    // Get course data from localStorage
    const coursesStr = localStorage.getItem('courses');
    if (coursesStr) {
      try {
        const courses = JSON.parse(coursesStr);
        setLocalStorageCourses(courses);
        
        // Find the current course
        const course = courses.find(c => c.id === courseId);
        if (course) {
          setCourseData(course);
        }
      } catch (error) {
        console.error('Error parsing courses from localStorage:', error);
      }
    }
  }, [courseId]);

  const fixBlobUrls = () => {
    if (!courseData || !localStorageCourses) return;
    
    // Create a copy of the courses array
    const updatedCourses = [...localStorageCourses];
    
    // Find the index of the current course
    const courseIndex = updatedCourses.findIndex(c => c.id === courseId);
    if (courseIndex === -1) return;
    
    // Create a copy of the course
    const updatedCourse = { ...updatedCourses[courseIndex] };
    
    // Check if the course has lectures
    if (updatedCourse.lectures && updatedCourse.lectures.length > 0) {
      let hasChanges = false;
      
      // Update each lecture
      updatedCourse.lectures = updatedCourse.lectures.map(lecture => {
        // Check if the videoUrl is a blob URL
        if (lecture.videoUrl && lecture.videoUrl.startsWith('blob:')) {
          hasChanges = true;
          // Replace with a YouTube URL as a fallback
          return {
            ...lecture,
            videoUrl: 'https://www.youtube.com/embed/tXHviS-4ygo'
          };
        }
        return lecture;
      });
      
      if (hasChanges) {
        // Update the course in the array
        updatedCourses[courseIndex] = updatedCourse;
        
        // Save the updated courses back to localStorage
        localStorage.setItem('courses', JSON.stringify(updatedCourses));
        
        // Update state
        setCourseData(updatedCourse);
        setLocalStorageCourses(updatedCourses);
        setIsFixed(true);
        
        // Reload the page to see the changes
        window.location.reload();
      } else {
        alert('No blob URLs found in this course.');
      }
    } else {
      alert('No lectures found in this course.');
    }
  };

  return (
    <Card className="mb-4">
      <CardBody>
        <h5>Debug Video URLs</h5>
        {courseData ? (
          <>
            <p>Course ID: {courseData.id}</p>
            <p>Lecture Count: {courseData.lectures?.length || 0}</p>
            
            {courseData.lectures && courseData.lectures.length > 0 && (
              <div>
                <h6>Lecture Video URLs:</h6>
                <ul className="small">
                  {courseData.lectures.map((lecture, index) => (
                    <li key={index} className={lecture.videoUrl?.startsWith('blob:') ? 'text-danger' : ''}>
                      {lecture.topicName || lecture.title}: {lecture.videoUrl || 'No URL'}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <Button 
              variant="warning" 
              onClick={fixBlobUrls}
              disabled={isFixed}
            >
              {isFixed ? 'Fixed! Reload the page' : 'Fix Blob URLs'}
            </Button>
          </>
        ) : (
          <p>No course data found in localStorage.</p>
        )}
      </CardBody>
    </Card>
  );
};

export default DebugVideoUrl;
