# Enhanced Enrollment System

This directory contains the frontend components for the enhanced enrollment system. These components implement the following features:

1. **Time-Based Lecture Access**: Lectures are only accessible after their scheduled time
2. **Slot-Based Enrollment Restrictions**: Students can't enroll in multiple courses on the same day
3. **Course Type Handling**: Different rules for live vs. recorded courses
4. **Visual Schedule Management**: Drag-and-drop interface for rescheduling recorded courses

## Components

### Enrollment Components

1. **EnrollButton**: A button that opens an enrollment modal with conflict detection
   - Handles different enrollment rules for live vs. recorded courses
   - Implements day-level conflict detection
   - Shows appropriate UI for different course types

2. **CourseScheduleSelector**: A component for selecting time slots when enrolling
   - Shows fixed schedule for live courses
   - Allows slot selection for recorded courses
   - Highlights conflicts with existing enrollments

3. **EnrollmentConfirmation**: A confirmation screen for enrollment
   - Shows course details and selected schedule
   - Displays terms and conditions
   - Provides clear enrollment action

### Schedule Management Components

1. **WeeklyCalendar**: A weekly calendar view with drag-and-drop functionality
   - Shows a weekly view of enrolled courses
   - Implements drag-and-drop for rescheduling recorded courses
   - Validates drop targets to prevent invalid rescheduling

2. **DraggableCourseCard**: A draggable card for course representation
   - Shows course details and progress
   - Only allows dragging for recorded courses
   - Provides visual feedback during drag operations

3. **UpcomingLectures**: A component to show upcoming lectures
   - Lists upcoming lectures with access status
   - Shows countdown timers for locked lectures
   - Updates automatically when lectures become available

### Lecture Access Components

1. **LectureAccessIndicator**: A component to show locked/unlocked status
   - Shows visual indicators for lecture access status
   - Implements countdown timers for locked lectures
   - Updates automatically when lectures become available

2. **EnhancedPlaylist**: An updated playlist component with access control
   - Shows lecture access status for each lecture
   - Only allows playing accessible lectures
   - Shows countdown timers for locked lectures

## Usage

### EnrollButton

```jsx
import EnrollButton from '@/components/enrollment/EnrollButton';

// In your component
<EnrollButton course={courseData} />
```

### WeeklyCalendar

```jsx
import WeeklyCalendar from '@/components/schedule/WeeklyCalendar';

// In your component
<WeeklyCalendar initialEnrolledCourses={enrolledCourses} />
```

### UpcomingLectures

```jsx
import UpcomingLectures from '@/components/schedule/UpcomingLectures';

// In your component
<UpcomingLectures initialEnrolledCourses={enrolledCourses} />
```

### EnhancedPlaylist

```jsx
import EnhancedPlaylist from '@/app/pages/course/detail-min/[id]/components/EnhancedPlaylist';

// In your component
<EnhancedPlaylist course={courseData} onVideoSelect={handleVideoSelect} />
```

## Demo

A demo of all components is available at `/demos/enhanced-enrollment`. This demo showcases all the components with dummy data.

## Implementation Notes

1. These components currently use dummy data from `@/utils/dummyData/enrollmentData.js`
2. In a real implementation, these components would be connected to backend APIs
3. The components follow the file-based strategy pattern used in the backend
4. CSS styles are defined in `@/styles/enhanced-enrollment.css`
