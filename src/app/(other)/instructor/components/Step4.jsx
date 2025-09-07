'use client';
import React, { useState, useEffect } from 'react';
import {
  Badge,
  Button,
  Col,
  Row,
  Form,
  Card,
  Spinner,
  Alert,
  InputGroup,
  Table,
  Dropdown
} from 'react-bootstrap';
import {
  FaEdit,
  FaTimes,
  FaPlus,
  FaCalendarAlt,
  FaInfoCircle,
  FaCheck,
  FaUsers,
  FaBook,
  FaExclamationTriangle,
  FaTag,
  FaSearch
} from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import SlidePanel from '../../../components/side-panel/SlidePanel';
import { useCourseContext } from '@/context/CourseContext';
import { toast } from 'sonner';
import ConfirmDialog from '../../../components/dialog/ConfirmDialog';

// Array of weekdays for live courses with proper enum values
const WEEKDAYS = [
  // { display: 'Monday', value: 'monday' },
  // { display: 'Tuesday', value: 'tuesday' },
  { display: 'Wednesday', value: 'wednesday' },
  // { display: 'Thursday', value: 'thursday' },
  // { display: 'Friday', value: 'friday' }
];

// Predefined time slots with proper enum values
const TIME_SLOTS = [
  { id: 'slot_1', name: 'SLOT 1', time: '9:00 - 9:40' },
  { id: 'slot_2', name: 'SLOT 2', time: '9:45 - 10:25' },
  { id: 'slot_3', name: 'SLOT 3', time: '10:45 - 11:25' },
  { id: 'slot_4', name: 'SLOT 4', time: '11:30 - 12:10' },
  { id: 'slot_5', name: 'SLOT 5', time: '13:35 - 14:15' },
  { id: 'slot_6', name: 'SLOT 6', time: '14:20 - 15:00' }
];

// Predefined tags array
const PREDEFINED_TAGS = [
  "Learning", "Lifelong", "Education", "Skills", "Knowledge", "Teaching", "Sharing", "Community",
  "Social", "Interactive", "Live", "Recorded", "Flexible", "Individual", "Modular", "Module",
  "Course", "Seminar", "Workshop", "Lecture", "Online", "Digital", "Accessible", "Free",
  "Volunteer", "Collaboration", "Communication", "Discussion", "Practice", "SelfPaced",
  "Guided", "Beginner", "Intermediate", "Advanced", "Introduction", "Fundamentals",
  "Essentials", "Basics", "Theory", "Practical", "Resources", "Materials", "Support",
  "Motivation", "Inspiration", "Growth", "Development", "Personal", "Local", "Timetable",
  "Craft", "DIY", "Handmade", "Sewing", "Knitting", "Crocheting", "Weaving", "Embroidery",
  "Quilting", "Felting", "Textiles", "Fabric", "Yarn", "Mending", "Alterations", "Upcycling",
  "Patterns", "Techniques", "Tools", "Jewelry", "Beading", "Macrame", "Papermaking",
  "Bookbinding", "Printing", "Stamping", "Dyeing", "Basketry", "Leatherwork", "Soapmaking",
  "Woodworking", "Carving", "Furniture", "Restoration", "Finishing", "Pottery", "Ceramics",
  "Clay", "Glazing", "Handbuilding", "Wheelthrowing", "Sculpture", "Mosaics", "Glasswork",
  "Metalwork", "Home", "Household", "Cooking", "Baking", "Recipes", "Nutrition", "MealPlanning",
  "Preserving", "Canning", "Fermenting", "Pickling", "Budgeting", "Frugal", "Cleaning",
  "Organizing", "Decluttering", "Laundry", "Ironing", "Hospitality", "Etiquette", "Childcare",
  "Eldercare", "Food", "Cuisine", "Vegetarian", "Vegan", "Bread", "Cakes", "Desserts", "Healthy",
  "Gardening", "Plants", "Flowers", "Vegetables", "Herbs", "Fruit", "Soil", "Composting",
  "Pruning", "Pests", "Weeding", "Balcony", "Indoor", "Outdoor", "Harvest", "Seeds",
  "Propagation", "Nature", "Foraging", "Outdoors", "Repair", "Maintenance", "HomeRepair",
  "Plumbing", "Electrical", "Painting", "Decorating", "Tiling", "Assembly", "Bicycles", "Cars",
  "Sharpening", "Knots", "Safety", "Art", "Drawing", "Sketching", "Watercolor", "Acrylics",
  "Photography", "Calligraphy", "Writing", "Storytelling", "Music", "Singing", "Instrument",
  "Acting", "CreativeWriting", "Wellness", "Health", "Mindfulness", "Meditation", "Yoga",
  "Relaxation", "StressManagement", "Listening", "Confidence", "Habits", "Goals",
  "TimeManagement", "Resilience", "Wellbeing", "Language", "English", "German", "Hungarian",
  "Conversation", "Computer", "Internet", "DigitalLiteracy", "Mobile", "Finance", "Psychology",
  "Design", "FirstAid"
];

// Custom Dropdown for Tags with Search
const TagSearchDropdown = ({ onSelect, selectedTags }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [show, setShow] = useState(false);

  // Filter tags based on search term
  const filteredTags = searchTerm
    ? PREDEFINED_TAGS
      .filter(tag => !selectedTags.some(t => t.tagName === tag))
      .filter(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    : PREDEFINED_TAGS.filter(tag => !selectedTags.some(t => t.tagName === tag));

  const handleSelect = (tag) => {
    onSelect(tag);
    setSearchTerm('');
    setShow(false);
  };

  const handleRequestTag = () => {
    // Empty function - will be implemented later
    toast.info('Tag request feature will be available soon!');
    setShow(false);
  };

  return (
    <Dropdown show={show} onToggle={(isOpen) => setShow(isOpen)} className="w-100">
      <Dropdown.Toggle variant="outline-secondary" id="tag-dropdown" className="d-flex justify-content-between align-items-center w-100">
        <span className="text-start text-truncate">
          <FaTag className="me-2" />
          Select tags
        </span>
      </Dropdown.Toggle>

      <Dropdown.Menu className="w-100 position-relative z-index-9999">
        <div className="px-3 py-2">
          <InputGroup className="mb-2">
            <InputGroup.Text><FaSearch /></InputGroup.Text>
            <Form.Control
              placeholder="Search tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </InputGroup>
        </div>
        <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
          {filteredTags.length > 0 ? (
            filteredTags.map((tag) => (
              <Dropdown.Item
                key={tag}
                onClick={() => handleSelect(tag)}
                className="d-flex align-items-center"
              >
                {tag}
              </Dropdown.Item>
            ))
          ) : (
            <div className="text-center py-2 text-muted">
              No tags match your search
            </div>
          )}
        </div>
        <Dropdown.Divider />
        <Dropdown.Item
          onClick={handleRequestTag}
          className="text-primary fw-bold"
        >
          <FaPlus className="me-2" /> Request a new tag
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

// FAQ Panel Component
const FaqPanel = ({
  isOpen,
  onClose,
  onSave,
  editingFaq = null
}) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [validated, setValidated] = useState(false);

  // Initialize form if editing
  useEffect(() => {
    if (editingFaq) {
      setQuestion(editingFaq.question || '');
      setAnswer(editingFaq.answer || '');
    } else {
      setQuestion('');
      setAnswer('');
    }
    setValidated(false);
  }, [editingFaq, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    const faqData = {
      question: question.trim(),
      answer: answer.trim(),
      id: editingFaq?.id || Date.now().toString() // Use existing ID or create new one
    };

    onSave(faqData, editingFaq !== null);

    // Reset form
    setQuestion('');
    setAnswer('');
    setValidated(false);
    onClose();
  };

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={editingFaq ? "Edit FAQ" : "Add New FAQ"}
      size="lg"
    >
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Question <span className="text-danger">*</span></Form.Label>
          <Form.Control
            type="text"
            placeholder="e.g. How long will I have access to the course?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
          />
          <Form.Control.Feedback type="invalid">
            Please provide a question.
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Answer <span className="text-danger">*</span></Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            placeholder="e.g. Once enrolled, you'll have lifetime access to the course materials."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            required
          />
          <Form.Control.Feedback type="invalid">
            Please provide an answer.
          </Form.Control.Feedback>
        </Form.Group>

        <div className="d-grid mt-4">
          <Button variant="primary" type="submit">
            {editingFaq ? 'Update FAQ' : 'Add FAQ'}
          </Button>
        </div>
      </Form>
    </SlidePanel>
  );
};

// Live Course Schedule Panel Component
const LiveCourseSchedulePanel = ({
  isOpen,
  onClose,
  onSave,
  courseData,
  mode
}) => {
  const [selectedWeekday, setSelectedWeekday] = useState('');
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [startDate, setStartDate] = useState(null); // Changed to null for react-datepicker
  const [maxEnrollment, setMaxEnrollment] = useState('');
  const [validated, setValidated] = useState(false);
  const [endDate, setEndDate] = useState(null);
  const [plannedLessons, setPlannedLessons] = useState(0);
  const [lessonWarning, setLessonWarning] = useState('');

  // Load plannedLessons from localStorage
  useEffect(() => {
    const STEP3_STORAGE_KEY = `${mode}_course_step3_data`;
    const savedData = localStorage.getItem(STEP3_STORAGE_KEY);

    console.log(savedData, 'savedData')

    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        let storedPlannedLessons = null;

        // Check all possible locations where plannedLessons might be stored
        if (parsedData?.liveCourseMeta?.plannedLessons) {
          storedPlannedLessons = parsedData.liveCourseMeta.plannedLessons;
        } else if (parsedData?.plannedLessons) {
          storedPlannedLessons = parsedData.plannedLessons;
        }

        if (storedPlannedLessons) {
          setPlannedLessons(parseInt(storedPlannedLessons, 10));
        }
      } catch (error) {
        console.error('Error parsing saved data:', error);
      }
    }
  }, [courseData]);

  // Initialize form with existing data
  useEffect(() => {
    if (courseData && courseData.liveCourseMeta) {
      // Extract weekday from the first time slot if it exists
      if (courseData.liveCourseMeta.timeSlots && courseData.liveCourseMeta.timeSlots.length > 0) {
        setSelectedWeekday(courseData.liveCourseMeta.timeSlots[0].weekDay || '');

        // Set selected slots
        const slots = courseData.liveCourseMeta.timeSlots.map(slot => slot.slot);
        setSelectedSlots(slots);
      }

      // Format startDate for DatePicker if it exists
      if (courseData.liveCourseMeta.startDate) {
        setStartDate(new Date(courseData.liveCourseMeta.startDate));
      }

      // No need to set plannedLessons here as we get it from Step 3 via localStorage
      setMaxEnrollment(courseData.liveCourseMeta.maxEnrollment || '');
    }
  }, [courseData, isOpen]);

  // Check if the lessons calculation works with selected slots
  useEffect(() => {
    if (plannedLessons > 0 && selectedSlots.length > 0) {
      // Check if plannedLessons is divisible by the number of slots per day
      if (plannedLessons % selectedSlots.length !== 0) {
        setLessonWarning(
          `The number of planned lessons (${plannedLessons}) must be divisible by the number of slots per day (${selectedSlots.length}). ` +
          `Please adjust your time slots to ensure equal lessons per day.`
        );
      } else {
        setLessonWarning('');
        // Calculate end date
        calculateEndDate();
      }
    } else {
      setLessonWarning('');
    }
  }, [plannedLessons, selectedSlots]);

  // Calculate the end date based on start date, slots per week, and planned lessons
  const calculateEndDate = () => {
    if (startDate && plannedLessons && selectedSlots.length > 0) {
      const start = new Date(startDate);
      const lessonsPerWeek = selectedSlots.length;
      const weeksNeeded = Math.ceil(parseInt(plannedLessons) / lessonsPerWeek);

      // Find the weekday index for the selected weekday
      const weekdayObj = WEEKDAYS.find(day => day.value === selectedWeekday);
      if (!weekdayObj) return;

      const weekdayIndex = WEEKDAYS.findIndex(day => day.value === selectedWeekday);
      if (weekdayIndex === -1) return;

      // Find the first occurrence of the selected weekday from the start date
      const startWeekday = start.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const weekdayOffset = ((weekdayIndex + 1) % 7) - startWeekday;
      const adjustedStart = new Date(start);
      adjustedStart.setDate(start.getDate() + (weekdayOffset >= 0 ? weekdayOffset : weekdayOffset + 7));

      // Calculate end date by adding the required number of weeks
      const end = new Date(adjustedStart);
      end.setDate(adjustedStart.getDate() + ((weeksNeeded - 1) * 7));

      setEndDate(end);
    } else {
      setEndDate(null);
    }
  };

  const toggleSlot = (slotId) => {
    let newSelectedSlots;

    if (selectedSlots.includes(slotId)) {
      newSelectedSlots = selectedSlots.filter(id => id !== slotId);
    } else {
      newSelectedSlots = [...selectedSlots, slotId];
    }

    setSelectedSlots(newSelectedSlots);

    // Check slot compatibility with plannedLessons immediately
    if (plannedLessons > 0 && newSelectedSlots.length > 0) {
      if (plannedLessons % newSelectedSlots.length !== 0) {
        setLessonWarning(
          `The number of planned lessons (${plannedLessons}) must be divisible by the number of slots per day (${newSelectedSlots.length}). ` +
          `Please adjust your time slots to ensure equal lessons per day.`
        );
      } else {
        setLessonWarning('');
      }
    } else {
      setLessonWarning('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    // Make sure weekday is selected
    if (!selectedWeekday) {
      toast.error('Please select a weekday for your sessions');
      return;
    }

    // Make sure at least one time slot is selected
    if (selectedSlots.length === 0) {
      toast.error('Please select at least one time slot');
      return;
    }

    // Make sure start date is selected
    if (!startDate) {
      toast.error('Please select a start date');
      return;
    }

    // Verify plannedLessons is compatible with selected slots
    if (plannedLessons % selectedSlots.length !== 0) {
      toast.error(`The number of planned lessons (${plannedLessons}) must be divisible by the number of slots per day (${selectedSlots.length})`);
      return;
    }

    // Prepare the data with proper enum values
    const liveCourseMeta = {
      startDate: startDate.toISOString(),
      plannedLessons: parseInt(plannedLessons),
      maxEnrollment: parseInt(maxEnrollment),
      timeSlots: selectedSlots.map(slotId => ({
        weekDay: selectedWeekday,
        slot: slotId
      })),
      endDate: endDate ? endDate.toISOString() : null
    };

    onSave(liveCourseMeta);
    onClose();
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'Not calculated yet';
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get nearest upcoming date for the selected weekday
  const getUpcomingDate = (weekdayValue) => {
    const today = new Date();
    const weekdayIndex = WEEKDAYS.findIndex(day => day.value === weekdayValue);
    if (weekdayIndex === -1) return null;

    // Add 1 to convert from our 0-indexed weekday to JavaScript's day of week (where Monday=1)
    const targetDay = weekdayIndex + 1; // 1 = Monday, 2 = Tuesday, etc.

    // Get the current day of the week (0 = Sunday, 1 = Monday, etc.)
    const todayDay = today.getDay() || 7; // Convert Sunday from 0 to 7 for easier calculation

    // Calculate how many days to add to get to the next occurrence of the target day
    const daysToAdd = (targetDay - todayDay + 7) % 7 || 7; // If 0, make it 7 (next week)

    const result = new Date(today);
    result.setDate(today.getDate() + daysToAdd);
    return result;
  };

  const handleWeekdayChange = (weekdayValue) => {
    setSelectedWeekday(weekdayValue);

    // Reset the start date when weekday changes
    setStartDate(null);

    // Suggest a start date that matches the selected weekday
    const suggestedDate = getUpcomingDate(weekdayValue);
    if (suggestedDate) setStartDate(suggestedDate);
  };

  // Function to filter dates that don't match the selected weekday
  const filterDate = (date) => {
    if (!selectedWeekday) return true;

    // Get the day of week (0-6, where 0 is Sunday)
    const dayOfWeek = date.getDay();

    // Convert selectedWeekday to a day number
    const weekdayIndex = WEEKDAYS.findIndex(day => day.value === selectedWeekday);
    if (weekdayIndex === -1) return false;

    // Add 1 to convert from our 0-indexed weekday to JavaScript's day of week (where Monday=1)
    const targetDay = weekdayIndex + 3;

    // Return true if the day of week matches our target day
    return dayOfWeek === targetDay;
  };

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title="Live Course Schedule"
      size="lg"
    >
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Alert variant="info" className="d-flex align-items-center mb-4">
          <FaInfoCircle className="me-2 flex-shrink-0" size={18} />
          <div>
            <strong>Set your live course schedule:</strong> Select a weekday, time slots, and
            specify the total number of planned lessons. The system will calculate the end date
            based on your selections.
          </div>
        </Alert>

        {/* Display the plannedLessons from Step 3 */}
        <Alert variant="primary" className="mb-4">
          <div className="d-flex align-items-center">
            <FaBook className="me-2 flex-shrink-0" size={18} />
            <div>
              <strong>Planned Lessons:</strong> {plannedLessons} lessons
              <div className="small text-muted mt-1">
                This value was set in the Curriculum step and determines the total number of sessions.
              </div>
            </div>
          </div>
        </Alert>

        {lessonWarning && (
          <Alert variant="warning" className="mb-4">
            <FaExclamationTriangle className="me-2" /> {lessonWarning}
          </Alert>
        )}

        <Row className="mb-4">
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Select Weekday <span className="text-danger">*</span></Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {WEEKDAYS.map((day) => (
                  <Button
                    key={day.value}
                    variant={selectedWeekday === day.value ? "primary" : "outline-secondary"}
                    onClick={() => handleWeekdayChange(day.value)}
                    className="mb-2"
                  >
                    {day.display}
                  </Button>
                ))}
              </div>
              <Form.Text>Choose the day of the week for your live sessions.</Form.Text>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Start Date <span className="text-danger">*</span></Form.Label>
              <div>
                {/* Use react-datepicker with day filter */}
                <DatePicker
                  selected={startDate}
                  onChange={date => setStartDate(date)}
                  filterDate={filterDate}
                  minDate={new Date()} // Disable past dates
                  dateFormat="MMMM d, yyyy"
                  placeholderText={selectedWeekday
                    ? `Select a ${WEEKDAYS.find(day => day.value === selectedWeekday)?.display}`
                    : "Select a weekday first"}
                  className="form-control"
                  disabled={!selectedWeekday}
                  required
                />
              </div>
              <Form.Control.Feedback type="invalid">
                Please select a start date.
              </Form.Control.Feedback>
              <Form.Text>
                {selectedWeekday
                  ? `Only ${WEEKDAYS.find(day => day.value === selectedWeekday)?.display}s will be available to select.`
                  : "Select a weekday first to enable date selection."}
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-4">
          <Form.Label>Select Time Slots <span className="text-danger">*</span></Form.Label>
          <div className="border rounded p-3 bg-light">
            <div className="d-flex flex-wrap gap-2">
              {TIME_SLOTS.map((slot) => (
                <Button
                  key={slot.id}
                  variant={selectedSlots.includes(slot.id) ? "primary" : "outline-secondary"}
                  onClick={() => toggleSlot(slot.id)}
                  className="mb-2"
                  disabled={!selectedWeekday} // Disable if no weekday selected
                >
                  <span className="d-block">{slot.name}</span>
                  <small>{slot.time}</small>
                  {selectedSlots.includes(slot.id) && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success">
                      <FaCheck size={8} />
                    </span>
                  )}
                </Button>
              ))}
            </div>
            {!selectedWeekday && (
              <div className="text-muted small mt-2">
                Please select a weekday first to enable time slot selection.
              </div>
            )}
          </div>
          <Form.Text>
            Select time slots carefully. The number of lessons ({plannedLessons}) must be divisible
            by the number of slots per day to ensure equal lessons each day.
          </Form.Text>
        </Form.Group>

        <Row className="mb-4">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Maximum Enrollment <span className="text-danger">*</span></Form.Label>
              <InputGroup>
                <InputGroup.Text><FaUsers /></InputGroup.Text>
                <Form.Control
                  type="number"
                  placeholder="e.g. 25"
                  value={maxEnrollment}
                  onChange={(e) => setMaxEnrollment(e.target.value)}
                  required
                  min="1"
                />
              </InputGroup>
              <Form.Control.Feedback type="invalid">
                Please enter the maximum number of students.
              </Form.Control.Feedback>
              <Form.Text>Maximum number of students who can enroll.</Form.Text>
            </Form.Group>
          </Col>
        </Row>

        {/* Course Schedule Summary */}
        <Card className="mb-4 bg-light border">
          <Card.Header className="bg-light">
            <h6 className="mb-0">Course Schedule Summary</h6>
          </Card.Header>
          <Card.Body>
            <Table borderless size="sm" className="mb-0">
              <tbody>
                <tr>
                  <td className="text-muted" width="40%">Day of Week:</td>
                  <td>
                    {selectedWeekday ? WEEKDAYS.find(day => day.value === selectedWeekday)?.display || 'Not selected' : 'Not selected'}
                  </td>
                </tr>
                <tr>
                  <td className="text-muted">Time Slots:</td>
                  <td>
                    {selectedSlots.length > 0 ? (
                      <div className="d-flex flex-wrap gap-1">
                        {selectedSlots.map(slotId => {
                          const slot = TIME_SLOTS.find(s => s.id === slotId);
                          return slot ? (
                            <Badge bg="primary" key={slotId}>
                              {slot.time}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    ) : 'No slots selected'}
                  </td>
                </tr>
                <tr>
                  <td className="text-muted">Start Date:</td>
                  <td>{startDate ? formatDate(startDate) : 'Not selected'}</td>
                </tr>
                <tr>
                  <td className="text-muted">Lessons Per Day:</td>
                  <td>{selectedSlots.length || 0}</td>
                </tr>
                <tr>
                  <td className="text-muted">Total Course Days:</td>
                  <td>{selectedSlots.length > 0 ? Math.ceil(plannedLessons / selectedSlots.length) : 'Cannot calculate'}</td>
                </tr>
                <tr>
                  <td className="text-muted">Total Planned Lessons:</td>
                  <td>{plannedLessons}</td>
                </tr>
                <tr>
                  <td className="text-muted">Maximum Enrollment:</td>
                  <td>{maxEnrollment || 'Not specified'}</td>
                </tr>
                <tr>
                  <td className="text-muted">Estimated End Date:</td>
                  <td className="fw-bold">
                    {endDate ? formatDate(endDate) : 'Not calculated yet'}
                  </td>
                </tr>
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        <div className="d-grid mt-4">
          <Button variant="primary" type="submit" disabled={!!lessonWarning}>
            Save Schedule
          </Button>
        </div>
      </Form>
    </SlidePanel>
  );
};

const Step4 = ({ stepperInstance, mode = 'create' }) => {
  const {
    courseData,
    setCourseData,
    isLoading,
    saveAdditionalInfo,
    courseLoading,
    courseLoadError
  } = useCourseContext();

  // Local state
  const [faqs, setFaqs] = useState([]);
  const [tags, setTags] = useState([]);
  const [reviewerMessage, setReviewerMessage] = useState('');
  const [hasRights, setHasRights] = useState(false);
  const [liveCourseMeta, setLiveCourseMeta] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Panel control
  const [showFaqPanel, setShowFaqPanel] = useState(false);
  const [showSchedulePanel, setShowSchedulePanel] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);

  // Confirmation dialog
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);

  // Dynamic localStorage key based on mode
  const STEP3_STORAGE_KEY = `${mode}_course_step3_data`;
  const STEP4_STORAGE_KEY = `${mode}_course_step4_data`;

  // FIXED: Load data based on mode and priority - following Step1/Step2/Step3 pattern
  useEffect(() => {
    const loadData = () => {
      if (mode === 'edit') {
        // In edit mode, prioritize course data from API
        if (courseData && courseData._id && !dataLoaded) {
          console.log('Edit mode: Loading course additional data into form', courseData);
          populateFormWithCourseData();
          setDataLoaded(true);
        } else if (!courseData._id && !courseLoading && !dataLoaded) {
          // If no course data and not loading, try localStorage
          loadFromLocalStorage();
          setDataLoaded(true);
        }
      } else {
        // Create mode - always try localStorage first
        if (!dataLoaded) {
          loadFromLocalStorage();
          setDataLoaded(true);
        }
      }
    };

    loadData();
  }, [courseData, mode, courseLoading, dataLoaded]);

  // FIXED: Add forced data loading when courseData changes in edit mode
  useEffect(() => {
    if (mode === 'edit' && courseData._id && (courseData.faqs || courseData.tags || courseData.liveCourseMeta)) {
      console.log('Force loading Step4 data due to courseData change');
      populateFormWithCourseData();
      setDataLoaded(true);
    }
  }, [courseData._id, courseData.faqs, courseData.tags, courseData.liveCourseMeta, mode]);

  // FIXED: Function to populate form with course data (edit mode)
  // FIXED: Function to populate form with course data (edit mode)
  const populateFormWithCourseData = () => {
    console.log('Populating Step 4 form with course data:', {
      faqs: courseData.faqs,
      tags: courseData.tags,
      liveCourseMeta: courseData.liveCourseMeta,
      reviewerMessage: courseData.reviewerMessage,
      hasRights: courseData.hasRights
    });

    // Set FAQs
    if (courseData.faqs && Array.isArray(courseData.faqs)) {
      console.log('Setting FAQs from courseData:', courseData.faqs);
      // Ensure FAQs have IDs for editing
      const faqsWithIds = courseData.faqs.map((faq, index) => ({
        ...faq,
        id: faq.id || faq._id || `faq_${index}_${Date.now()}`
      }));
      setFaqs(faqsWithIds);
    }

    // Set Tags
    if (courseData.tags && Array.isArray(courseData.tags)) {
      console.log('Setting tags from courseData:', courseData.tags);
      // Convert string array to objects with IDs for compatibility
      const tagsWithIds = courseData.tags.map((tag, index) => ({
        id: `tag_${index}_${Date.now()}`,
        tagName: typeof tag === 'string' ? tag : tag.tagName || tag
      }));
      setTags(tagsWithIds);
    }

    // FIXED: Set Live Course Meta with proper delay to ensure state updates
    if (courseData.liveCourseMeta) {
      console.log('Setting liveCourseMeta from courseData:', courseData.liveCourseMeta);
      // Ensure all properties including maxEnrollment are properly set
      const liveMetaData = {
        ...courseData.liveCourseMeta,
        maxEnrollment: courseData.liveCourseMeta.maxEnrollment || 30 // Default value if missing
      };

      // Use setTimeout to ensure the state update happens after the component has fully loaded
      setTimeout(() => {
        setLiveCourseMeta(liveMetaData);
        console.log('Set liveCourseMeta with data:', liveMetaData);
      }, 0);
    }

    // Set Reviewer Message
    if (courseData.reviewerMessage) {
      console.log('Setting reviewerMessage from courseData:', courseData.reviewerMessage);
      setReviewerMessage(courseData.reviewerMessage);
    }

    // Set Rights Confirmation
    if (courseData.hasRights !== undefined) {
      console.log('Setting hasRights from courseData:', courseData.hasRights);
      setHasRights(courseData.hasRights);
    }

    console.log('Populated Step 4 form with course data');
  };

  // ADDED: Additional useEffect to handle live course meta loading when navigating between steps
  useEffect(() => {
    // This handles the case when navigating from step3 to step4 in edit mode
    if (mode === 'edit' && courseData._id && courseData.liveCourseMeta) {
      console.log('Loading liveCourseMeta on step navigation:', courseData.liveCourseMeta);
      console.log('Current liveCourseMeta state:', liveCourseMeta);

      // Always update if courseData has liveCourseMeta, regardless of current state
      setLiveCourseMeta(courseData.liveCourseMeta);
    }
  }, [courseData.liveCourseMeta, mode, courseData._id]);

  // ADDED: Force update liveCourseMeta when courseData changes in edit mode
  useEffect(() => {
    if (mode === 'edit' && courseData._id && courseData.liveCourseMeta && dataLoaded) {
      console.log('Force updating liveCourseMeta due to courseData change');
      setLiveCourseMeta(courseData.liveCourseMeta);
    }
  }, [courseData, mode, dataLoaded]);

  // Function to load from localStorage
  const loadFromLocalStorage = () => {
    const savedData = localStorage.getItem(STEP4_STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        console.log(`${mode} mode: Loading Step 4 data from localStorage`, parsedData);

        if (parsedData.faqs) setFaqs(parsedData.faqs);
        if (parsedData.tags) setTags(parsedData.tags);
        if (parsedData.reviewerMessage) setReviewerMessage(parsedData.reviewerMessage);
        if (parsedData.hasRights !== undefined) setHasRights(parsedData.hasRights);
        if (parsedData.liveCourseMeta) setLiveCourseMeta(parsedData.liveCourseMeta);
      } catch (error) {
        console.error('Error parsing saved Step 4 data:', error);
      }
    }
  };

  // Save to localStorage when data changes
  useEffect(() => {
    if (dataLoaded) {
      const dataToSave = {
        faqs,
        tags,
        reviewerMessage,
        hasRights,
        liveCourseMeta
      };

      localStorage.setItem(STEP4_STORAGE_KEY, JSON.stringify(dataToSave));
    }
  }, [faqs, tags, reviewerMessage, hasRights, liveCourseMeta, dataLoaded, STEP4_STORAGE_KEY]);

  // ADDED: Debug panel for development
  // const DebugPanel = () => {
  //   if (process.env.NODE_ENV !== 'development') return null;

  //   return (
  //     <div className="mb-3 p-3 bg-light border rounded">
  //       <h6>Debug Info (Development Only)</h6>
  //       <p><strong>Mode:</strong> {mode}</p>
  //       <p><strong>Course ID:</strong> {courseData._id || 'None'}</p>
  //       <p><strong>Course Type:</strong> {courseData.type || 'None'}</p>
  //       <p><strong>DB FAQs Count:</strong> {courseData.faqs?.length || 0}</p>
  //       <p><strong>DB Tags Count:</strong> {courseData.tags?.length || 0}</p>
  //       <p><strong>DB Live Course Meta:</strong> {courseData.liveCourseMeta ? 'Yes' : 'No'}</p>
  //       <p><strong>Local FAQs Count:</strong> {faqs.length}</p>
  //       <p><strong>Local Tags Count:</strong> {tags.length}</p>
  //       <p><strong>Local Live Course Meta:</strong> {liveCourseMeta ? 'Yes' : 'No'}</p>
  //       <p><strong>Data Loaded:</strong> {dataLoaded ? 'Yes' : 'No'}</p>
  //       <p><strong>Course Loading:</strong> {courseLoading ? 'Yes' : 'No'}</p>
  //       <button 
  //         className="btn btn-sm btn-secondary me-2"
  //         onClick={() => {
  //           console.log('Force reload data');
  //           setDataLoaded(false);
  //         }}
  //       >
  //         Force Reload Data
  //       </button>
  //       <button 
  //         className="btn btn-sm btn-info"
  //         onClick={() => {
  //           console.log('Force populate form');
  //           populateFormWithCourseData();
  //         }}
  //       >
  //         Force Populate Form
  //       </button>
  //     </div>
  //   );
  // };

  // FAQ handlers
  const handleAddFaq = (faqData) => {
    setFaqs([...faqs, faqData]);
    toast.success('FAQ added successfully');
  };

  const handleUpdateFaq = (faqData) => {
    const updatedFaqs = faqs.map(faq =>
      faq.id === editingFaq.id ? faqData : faq
    );
    setFaqs(updatedFaqs);
    setEditingFaq(null);
    toast.success('FAQ updated successfully');
  };

  const handleEditFaq = (index) => {
    setEditingFaq(faqs[index]);
    setShowFaqPanel(true);
  };

  const handleDeleteFaq = (index) => {
    const updatedFaqs = [...faqs];
    updatedFaqs.splice(index, 1);
    setFaqs(updatedFaqs);
    toast.success('FAQ deleted successfully');
  };

  // Tag handlers
  const handleAddTag = (tagName) => {
    // Check if tag already exists
    if (tags.some(tag => tag.tagName.toLowerCase() === tagName.toLowerCase())) {
      toast.error('This tag already exists');
      return;
    }

    // Check tag limit
    if (tags.length >= 14) {
      toast.error('Maximum of 14 tags allowed');
      return;
    }

    setTags([...tags, { id: Date.now() + Math.random(), tagName }]);
    toast.success('Tag added successfully');
  };

  const handleDeleteTag = (index) => {
    const updatedTags = [...tags];
    updatedTags.splice(index, 1);
    setTags(updatedTags);
  };

  // Live course schedule handler
  const handleSaveSchedule = (scheduleData) => {
    setLiveCourseMeta(scheduleData);
    toast.success('Course schedule saved successfully');
  };

  // Submit handlers
  // const handleSaveAsDraft = async () => {
  //   if (!hasRights && courseData.type === 'recorded') {
  //     toast.error('Please confirm that you have the rights to sell this content');
  //     return;
  //   }

  //   await saveDraft(false);
  // };

  const handleConfirmPublish = () => {
    // Validate before showing confirmation
    if (!validateForPublish()) {
      return;
    }

    setShowPublishConfirm(true);
  };

  const clearAllCourseLocalStorage = () => {
    localStorage.removeItem(`${mode}_course_step1_data`);
    localStorage.removeItem(`${mode}_course_step2_data`);
    localStorage.removeItem(`${mode}_course_step3_data`);
    localStorage.removeItem(`${mode}_course_active_step`);
    localStorage.removeItem(STEP4_STORAGE_KEY);
    localStorage.removeItem('currentCourseData');
  };

  // Updated saveDraft function
  const saveDraft = async (publish = false) => {
    // Convert tags from objects to strings for API
    const tagStrings = tags.map(tag => tag.tagName);

    const data = {
      faqs,
      tags: tagStrings,
      reviewerMessage,
      publish
    };

    // Add live course meta if applicable
    if (courseData.type === 'live' && liveCourseMeta) {
      data.liveCourseMeta = liveCourseMeta;
    }

    const success = await saveAdditionalInfo(data);

    if (success) {
      // Always clear localStorage when successfully saving
      clearAllCourseLocalStorage();

      if (publish) {
        window.location.href = '/instructor/manage-course';
      } else {
        // Navigate to previous step
        stepperInstance?.previous();
      }
    }

    return success;
  };

  // Updated handlePublish function
  const handlePublish = async () => {
    return await saveDraft(true);
  };

  const validateForPublish = () => {
    // Validate common fields
    if (faqs.length === 0) {
      toast.error('Please add at least one FAQ');
      return false;
    }

    if (tags.length === 0) {
      toast.error('Please add at least one tag');
      return false;
    }

    if (!hasRights && courseData.type === 'recorded') {
      toast.error('Please confirm that you have the rights to sell this content');
      return false;
    }

    // Validate live course specific fields
    if (courseData.type === 'live') {
      if (!liveCourseMeta) {
        toast.error('Please set up your live course schedule');
        return false;
      }

      if (!liveCourseMeta.startDate) {
        toast.error('Please select a start date for your live course');
        return false;
      }

      if (!liveCourseMeta.timeSlots || liveCourseMeta.timeSlots.length === 0) {
        toast.error('Please select at least one time slot for your live course');
        return false;
      }

      if (!liveCourseMeta.maxEnrollment || liveCourseMeta.maxEnrollment <= 0) {
        toast.error('Please specify the maximum enrollment for your live course');
        return false;
      }

      // Verify plannedLessons compatibility with selected slots
      const plannedLessons = liveCourseMeta.plannedLessons;
      const slotsCount = liveCourseMeta.timeSlots.length;

      if (plannedLessons % slotsCount !== 0) {
        toast.error(`The number of planned lessons (${plannedLessons}) must be divisible by the number of slots per day (${slotsCount})`);
        return false;
      }
    }

    return true;
  };

  const handlePrevious = () => {
    stepperInstance?.previous();
  };

  // Show loading spinner if course is still loading in edit mode
  if (mode === 'edit' && courseLoading) {
    return (
      <div id="step-4" role="tabpanel" className="content fade" aria-labelledby="steppertrigger4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <h5>Loading course information...</h5>
            <p className="text-muted">Please wait while we fetch your course information.</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if in edit mode but failed to load course data
  if (mode === 'edit' && !courseLoading && courseLoadError) {
    return (
      <div id="step-4" role="tabpanel" className="content fade" aria-labelledby="steppertrigger4">
        <Alert variant="danger">
          <h5>Error Loading Course Information</h5>
          <p>Unable to load course information: {courseLoadError}</p>
          <Button variant="outline-danger" onClick={() => window.location.href = '/instructor/manage-course'}>
            Back to Course Management
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div id="step-4" role="tabpanel" className="content fade" aria-labelledby="steppertrigger4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>
          {mode === 'edit' ? 'Edit Additional Information' : 'Additional Information'}
        </h4>
        {courseData.type === 'live' && (
          <Button
            variant="primary"
            onClick={() => setShowSchedulePanel(true)}
          >
            <FaCalendarAlt className="me-2" /> {liveCourseMeta ? 'Edit Schedule' : 'Set Schedule'}
          </Button>
        )}
      </div>
      <hr />

      {/* Debug Panel - Only in development */}
      {/* <DebugPanel /> */}

      {courseData.type === 'live' && liveCourseMeta && (
        <Card className="mb-4 border shadow-sm">
          <Card.Header className="bg-light">
            <h5 className="mb-0 d-flex align-items-center">
              <FaCalendarAlt className="me-2" /> Live Course Schedule
            </h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <h6>Schedule Details</h6>
                <Table borderless size="sm">
                  <tbody>
                    <tr>
                      <td className="text-muted" width="40%">Day:</td>
                      <td>
                        {liveCourseMeta.timeSlots && liveCourseMeta.timeSlots.length > 0
                          ? WEEKDAYS.find(day => day.value === liveCourseMeta.timeSlots[0].weekDay)?.display || 'Not set'
                          : 'Not set'}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted">Time Slots:</td>
                      <td>
                        {liveCourseMeta.timeSlots && liveCourseMeta.timeSlots.length > 0 ? (
                          <div className="d-flex flex-wrap gap-1">
                            {liveCourseMeta.timeSlots.map(slot => {
                              const timeSlot = TIME_SLOTS.find(s => s.id === slot.slot);
                              return timeSlot ? (
                                <Badge bg="primary" key={slot.slot}>
                                  {timeSlot.time}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        ) : 'No slots selected'}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted">Start Date:</td>
                      <td>
                        {liveCourseMeta.startDate
                          ? new Date(liveCourseMeta.startDate).toLocaleDateString()
                          : 'Not set'}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted">End Date:</td>
                      <td>
                        {liveCourseMeta.endDate
                          ? new Date(liveCourseMeta.endDate).toLocaleDateString()
                          : 'Not calculated'}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
              <Col md={6}>
                <h6>Enrollment Details</h6>
                <Table borderless size="sm">
                  <tbody>
                    <tr>
                      <td className="text-muted" width="50%">Planned Lessons:</td>
                      <td>{liveCourseMeta.plannedLessons || 'Not set'}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Maximum Enrollment:</td>
                      <td>{liveCourseMeta.maxEnrollment || 'Not set'}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Lessons Per Day:</td>
                      <td>{liveCourseMeta.timeSlots ? liveCourseMeta.timeSlots.length : 0}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Total Course Days:</td>
                      <td>
                        {liveCourseMeta.timeSlots && liveCourseMeta.plannedLessons
                          ? Math.ceil(liveCourseMeta.plannedLessons / liveCourseMeta.timeSlots.length)
                          : 'Cannot calculate'}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
            </Row>
            <div className="text-end mt-2">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setShowSchedulePanel(true)}
              >
                <FaEdit className="me-1" /> Edit Schedule
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}

      <Row className="g-4">
        {/* FAQs Section */}
        <Col xs={12}>
          <Card className="shadow-sm border">
            <Card.Header className="bg-light">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Frequently Asked Questions</h5>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setEditingFaq(null);
                    setShowFaqPanel(true);
                  }}
                >
                  <FaPlus className="me-1" /> Add FAQ
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {faqs.length === 0 ? (
                <div className="text-center py-4 bg-light rounded">
                  <FaExclamationTriangle className="text-warning mb-3" style={{ fontSize: '2rem' }} />
                  <h6>No FAQs added yet</h6>
                  <p className="text-muted small mb-3">Help potential students by adding frequently asked questions</p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setEditingFaq(null);
                      setShowFaqPanel(true);
                    }}
                  >
                    <FaPlus className="me-2" /> Add First FAQ
                  </Button>
                </div>
              ) : (
                <div className="faq-list">
                  {faqs.map((faq, index) => (
                    <div key={faq.id} className="bg-light p-3 rounded mb-3 border">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="mb-0">{faq.question}</h6>
                        <div>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-1 btn-icon"
                            onClick={() => handleEditFaq(index)}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="btn-icon"
                            onClick={() => handleDeleteFaq(index)}
                          >
                            <FaTimes />
                          </Button>
                        </div>
                      </div>
                      <p className="text-muted mb-0 small">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Tags Section */}
        <Col xs={12}>
          <Card className="shadow-sm border">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <FaTag className="me-2" /> Tags
              </h5>
            </Card.Header>
            <Card.Body>
              <Form.Group>
                <Form.Label>Select tags to help students find your course</Form.Label>

                {/* Tag Search Dropdown */}
                <TagSearchDropdown
                  onSelect={handleAddTag}
                  selectedTags={tags}
                />

                <div className="mt-3">
                  {tags.length > 0 ? (
                    <div className="d-flex flex-wrap gap-2">
                      {tags.map((tag, index) => (
                        <Badge
                          key={tag.id}
                          bg="primary"
                          className="py-2 px-3 d-flex align-items-center"
                        >
                          {tag.tagName}
                          <Button
                            variant="link"
                            size="sm"
                            className="text-white p-0 ms-2"
                            onClick={() => handleDeleteTag(index)}
                          >
                            <FaTimes />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted">No tags selected yet</div>
                  )}
                </div>
                <div className="small text-muted mt-2">
                  Maximum of 14 tags. Select tags that best describe your course content.
                </div>
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>

        {/* Message to Reviewer Section */}
        <Col xs={12} >
          <Card className="shadow-sm border">
            <Card.Body>
              {/* Rights confirmation checkbox - only for recorded courses */}
              <Form.Group className="mt-3">
                <Form.Check
                  type="checkbox"
                  id="rights-checkbox"
                  checked={hasRights}
                  onChange={(e) => setHasRights(e.target.checked)}
                  label="I confirm that any images, sounds, or other assets that are not my own work have been appropriately licensed for use in this course. Other than these items, this work is entirely my own and I have full rights to sell it here."
                />
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>

        {/* Navigation Buttons */}
        <Col xs={12} >
          <div className="d-md-flex justify-content-between align-items-center mt-2">
            <Button
              variant="light"
              onClick={handlePrevious}
              disabled={isLoading}
              className="mb-2 mb-md-0"
            >
              Previous
            </Button>

            <div className="ms-auto">
              {/* <Button
                variant="secondary"
                className="me-2 mb-2 mb-md-0"
                onClick={handleSaveAsDraft}
                disabled={isLoading}
              >
                {mode === 'edit' ? 'Update as Draft' : 'Save as Draft'}
              </Button> */}

              <Button
                variant="success"
                onClick={handleConfirmPublish}
                disabled={isLoading}
                className="mb-2 mb-md-0"
              >
                {isLoading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                    {mode === 'edit' ? 'Updating...' : 'Publishing...'}
                  </>
                ) : (mode === 'edit' ? 'Update & Publish' : 'Publish Course')}
              </Button>
            </div>
          </div>

          <div className="text-muted small mt-3">
            <FaInfoCircle className="me-1" />
            {mode === 'edit'
              ? 'Your changes will be saved and the course will be updated.'
              : 'Once you publish your course, it will be reviewed by our team before becoming available to students.'
            }
          </div>
        </Col>
      </Row>

      {/* FAQ Panel */}
      <FaqPanel
        isOpen={showFaqPanel}
        onClose={() => {
          setShowFaqPanel(false);
          setEditingFaq(null);
        }}
        onSave={(faqData, isEditing) => {
          if (isEditing) {
            handleUpdateFaq(faqData);
          } else {
            handleAddFaq(faqData);
          }
        }}
        editingFaq={editingFaq}
      />

      {/* Live Course Schedule Panel */}
      {courseData.type === 'live' && (
        <LiveCourseSchedulePanel
          isOpen={showSchedulePanel}
          onClose={() => setShowSchedulePanel(false)}
          mode={mode}
          onSave={handleSaveSchedule}
          courseData={courseData}
        />
      )}

      {/* Publish Confirmation Dialog */}
      <ConfirmDialog
        show={showPublishConfirm}
        onHide={() => setShowPublishConfirm(false)}
        onConfirm={handlePublish}
        title={mode === 'edit' ? 'Update Course' : 'Publish Course'}
        message={mode === 'edit'
          ? 'Are you ready to update your course? Your changes will be saved and applied immediately.'
          : 'Are you ready to publish your course? Once published, it will be sent for review before becoming available to students.'
        }
        confirmText={mode === 'edit' ? 'Update' : 'Publish'}
        cancelText="Not yet"
        variant="success"
      />
    </div>
  );
};

export default Step4;