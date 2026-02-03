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
import SlidePanel from '../../../../components/side-panel/SlidePanel';
import { useCourseContext } from '@/context/CourseContext';
import { toast } from 'sonner';
import ConfirmDialog from '../../../../components/dialog/ConfirmDialog';
import { useTranslations } from 'next-intl';

// Array of weekdays for live courses with proper enum values
const WEEKDAYS = [
  { display: 'Wednesday', value: 'wednesday' }
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
  const t = useTranslations('instructor.course.step4.tags');

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
    toast.info(t('requestNewTagMessage'));
    setShow(false);
  };

  return (
    <Dropdown show={show} onToggle={(isOpen) => setShow(isOpen)} className="w-100">
      <Dropdown.Toggle variant="outline-secondary" id="tag-dropdown" className="d-flex justify-content-between align-items-center w-100">
        <span className="text-start text-truncate">
          <FaTag className="me-2" />
          {t('selectPlaceholder')}
        </span>
      </Dropdown.Toggle>

      <Dropdown.Menu className="w-100 position-relative z-index-9999">
        <div className="px-3 py-2">
          <InputGroup className="mb-2">
            <InputGroup.Text><FaSearch /></InputGroup.Text>
            <Form.Control
              placeholder={t('searchPlaceholder')}
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
              {t('noTagsMatch')}
            </div>
          )}
        </div>
        <Dropdown.Divider />
        <Dropdown.Item
          onClick={handleRequestTag}
          className="text-primary fw-bold"
        >
          <FaPlus className="me-2" /> {t('requestNewTag')}
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
  const t = useTranslations('instructor.course.step4.faq');

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
      id: editingFaq?.id || Date.now().toString()
    };

    onSave(faqData, editingFaq !== null);

    setQuestion('');
    setAnswer('');
    setValidated(false);
    onClose();
  };

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={editingFaq ? t('panelEditTitle') : t('panelAddTitle')}
      size="lg"
    >
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>{t('questionLabel')} <span className="text-danger">*</span></Form.Label>
          <Form.Control
            type="text"
            placeholder={t('questionPlaceholder')}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
          />
          <Form.Control.Feedback type="invalid">
            {t('questionRequired')}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>{t('answerLabel')} <span className="text-danger">*</span></Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            placeholder={t('answerPlaceholder')}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            required
          />
          <Form.Control.Feedback type="invalid">
            {t('answerRequired')}
          </Form.Control.Feedback>
        </Form.Group>

        <div className="d-grid mt-4">
          <Button variant="primary" type="submit">
            {editingFaq ? t('updateButton') : t('addButtonSubmit')}
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
  const [startDate, setStartDate] = useState(null);
  const [maxEnrollment, setMaxEnrollment] = useState('');
  const [validated, setValidated] = useState(false);
  const [endDate, setEndDate] = useState(null);
  const [plannedLessons, setPlannedLessons] = useState(0);
  const [lessonWarning, setLessonWarning] = useState('');

  const t = useTranslations('instructor.course.step4.schedulePanel');
  const tWeekdays = useTranslations('instructor.course.step4.weekdays');

  // Get translated weekdays
  const getTranslatedWeekdays = () => {
    return WEEKDAYS.map(day => ({
      ...day,
      display: tWeekdays(day.value)
    }));
  };

  useEffect(() => {
    const STEP3_STORAGE_KEY = `${mode}_course_step3_data`;
    const savedData = localStorage.getItem(STEP3_STORAGE_KEY);

    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        let storedPlannedLessons = null;

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
  }, [courseData, mode]);

  useEffect(() => {
    if (courseData && courseData.liveCourseMeta) {
      if (courseData.liveCourseMeta.timeSlots && courseData.liveCourseMeta.timeSlots.length > 0) {
        setSelectedWeekday(courseData.liveCourseMeta.timeSlots[0].weekDay || '');
        const slots = courseData.liveCourseMeta.timeSlots.map(slot => slot.slot);
        setSelectedSlots(slots);
      }

      if (courseData.liveCourseMeta.startDate) {
        setStartDate(new Date(courseData.liveCourseMeta.startDate));
      }

      setMaxEnrollment(courseData.liveCourseMeta.maxEnrollment || '');
    }
  }, [courseData, isOpen]);

  useEffect(() => {
    if (plannedLessons > 0 && selectedSlots.length > 0) {
      if (plannedLessons % selectedSlots.length !== 0) {
        setLessonWarning(
          t('lessonWarning', { planned: plannedLessons, slots: selectedSlots.length })
        );
      } else {
        setLessonWarning('');
        calculateEndDate();
      }
    } else {
      setLessonWarning('');
    }
  }, [plannedLessons, selectedSlots, t]);

  const calculateEndDate = () => {
    if (startDate && plannedLessons && selectedSlots.length > 0) {
      const start = new Date(startDate);
      const lessonsPerWeek = selectedSlots.length;
      const weeksNeeded = Math.ceil(parseInt(plannedLessons) / lessonsPerWeek);

      const weekdayObj = WEEKDAYS.find(day => day.value === selectedWeekday);
      if (!weekdayObj) return;

      const weekdayIndex = WEEKDAYS.findIndex(day => day.value === selectedWeekday);
      if (weekdayIndex === -1) return;

      const startWeekday = start.getDay();
      const weekdayOffset = ((weekdayIndex + 1) % 7) - startWeekday;
      const adjustedStart = new Date(start);
      adjustedStart.setDate(start.getDate() + (weekdayOffset >= 0 ? weekdayOffset : weekdayOffset + 7));

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

    if (plannedLessons > 0 && newSelectedSlots.length > 0) {
      if (plannedLessons % newSelectedSlots.length !== 0) {
        setLessonWarning(
          t('lessonWarning', { planned: plannedLessons, slots: newSelectedSlots.length })
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

    if (!selectedWeekday) {
      toast.error(t('selectWeekdayError'));
      return;
    }

    if (selectedSlots.length === 0) {
      toast.error(t('selectSlotError'));
      return;
    }

    if (!startDate) {
      toast.error(t('selectDateError'));
      return;
    }

    if (plannedLessons % selectedSlots.length !== 0) {
      toast.error(t('lessonsDivisibleError', { planned: plannedLessons, slots: selectedSlots.length }));
      return;
    }

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

  const formatDate = (date) => {
    if (!date) return t('notCalculatedYet');
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getUpcomingDate = (weekdayValue) => {
    const today = new Date();
    const weekdayIndex = WEEKDAYS.findIndex(day => day.value === weekdayValue);
    if (weekdayIndex === -1) return null;

    const targetDay = weekdayIndex + 1;
    const todayDay = today.getDay() || 7;
    const daysToAdd = (targetDay - todayDay + 7) % 7 || 7;

    const result = new Date(today);
    result.setDate(today.getDate() + daysToAdd);
    return result;
  };

  const handleWeekdayChange = (weekdayValue) => {
    setSelectedWeekday(weekdayValue);
    setStartDate(null);

    const suggestedDate = getUpcomingDate(weekdayValue);
    if (suggestedDate) setStartDate(suggestedDate);
  };

  const filterDate = (date) => {
    if (!selectedWeekday) return true;

    const dayOfWeek = date.getDay();
    const weekdayIndex = WEEKDAYS.findIndex(day => day.value === selectedWeekday);
    if (weekdayIndex === -1) return false;

    const targetDay = weekdayIndex + 3;
    return dayOfWeek === targetDay;
  };

  const translatedWeekdays = getTranslatedWeekdays();
  const selectedWeekdayDisplay = translatedWeekdays.find(day => day.value === selectedWeekday)?.display;

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={t('title')}
      size="lg"
    >
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Alert variant="info" className="d-flex align-items-center mb-4">
          <FaInfoCircle className="me-2 flex-shrink-0" size={18} />
          <div>
            <strong>{t('infoMessage')}</strong> {t('infoDescription')}
          </div>
        </Alert>

        <Alert variant="primary" className="mb-4">
          <div className="d-flex align-items-center">
            <FaBook className="me-2 flex-shrink-0" size={18} />
            <div>
              <strong>{t('plannedLessonsAlert')}</strong> {plannedLessons} {t('plannedLessonsCount')}
              <div className="small text-muted mt-1">
                {t('plannedLessonsNote')}
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
              <Form.Label>{t('selectWeekdayLabel')} <span className="text-danger">*</span></Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {translatedWeekdays.map((day) => (
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
              <Form.Text>{t('selectWeekdayHelp')}</Form.Text>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>{t('startDateLabel')} <span className="text-danger">*</span></Form.Label>
              <div>
                <DatePicker
                  selected={startDate}
                  onChange={date => setStartDate(date)}
                  filterDate={filterDate}
                  minDate={new Date()}
                  dateFormat="MMMM d, yyyy"
                  placeholderText={selectedWeekday
                    ? t('startDatePlaceholder', { weekday: selectedWeekdayDisplay })
                    : t('startDatePlaceholderDefault')}
                  className="form-control"
                  disabled={!selectedWeekday}
                  required
                />
              </div>
              <Form.Control.Feedback type="invalid">
                {t('startDateRequired')}
              </Form.Control.Feedback>
              <Form.Text>
                {selectedWeekday
                  ? t('startDateHelp', { weekday: selectedWeekdayDisplay })
                  : t('startDateHelpDefault')}
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-4">
          <Form.Label>{t('selectTimeSlotsLabel')} <span className="text-danger">*</span></Form.Label>
          <div className="border rounded p-3 bg-light">
            <div className="d-flex flex-wrap gap-2">
              {TIME_SLOTS.map((slot) => (
                <Button
                  key={slot.id}
                  variant={selectedSlots.includes(slot.id) ? "primary" : "outline-secondary"}
                  onClick={() => toggleSlot(slot.id)}
                  className="mb-2"
                  disabled={!selectedWeekday}
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
                {t('selectWeekdayFirst')}
              </div>
            )}
          </div>
          <Form.Text>
            {t('selectTimeSlotsHelp', { planned: plannedLessons })}
          </Form.Text>
        </Form.Group>

        <Row className="mb-4">
          <Col md={6}>
            <Form.Group>
              <Form.Label>{t('maxEnrollmentLabel')} <span className="text-danger">*</span></Form.Label>
              <InputGroup>
                <InputGroup.Text><FaUsers /></InputGroup.Text>
                <Form.Control
                  type="number"
                  placeholder={t('maxEnrollmentPlaceholder')}
                  value={maxEnrollment}
                  onChange={(e) => setMaxEnrollment(e.target.value)}
                  required
                  min="1"
                />
              </InputGroup>
              <Form.Control.Feedback type="invalid">
                {t('maxEnrollmentRequired')}
              </Form.Control.Feedback>
              <Form.Text>{t('maxEnrollmentHelp')}</Form.Text>
            </Form.Group>
          </Col>
        </Row>

        <Card className="mb-4 bg-light border">
          <Card.Header className="bg-light">
            <h6 className="mb-0">{t('summaryTitle')}</h6>
          </Card.Header>
          <Card.Body>
            <Table borderless size="sm" className="mb-0">
              <tbody>
                <tr>
                  <td className="text-muted" width="40%">{t('summaryDayOfWeek')}</td>
                  <td>
                    {selectedWeekday ? translatedWeekdays.find(day => day.value === selectedWeekday)?.display || t('notSelected') : t('notSelected')}
                  </td>
                </tr>
                <tr>
                  <td className="text-muted">{t('summaryTimeSlots')}</td>
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
                    ) : t('notSelected')}
                  </td>
                </tr>
                <tr>
                  <td className="text-muted">{t('summaryStartDate')}</td>
                  <td>{startDate ? formatDate(startDate) : t('notSelected')}</td>
                </tr>
                <tr>
                  <td className="text-muted">{t('summaryLessonsPerDay')}</td>
                  <td>{selectedSlots.length || 0}</td>
                </tr>
                <tr>
                  <td className="text-muted">{t('summaryTotalDays')}</td>
                  <td>{selectedSlots.length > 0 ? Math.ceil(plannedLessons / selectedSlots.length) : t('notCalculatedYet')}</td>
                </tr>
                <tr>
                  <td className="text-muted">{t('summaryTotalLessons')}</td>
                  <td>{plannedLessons}</td>
                </tr>
                <tr>
                  <td className="text-muted">{t('summaryMaxEnrollment')}</td>
                  <td>{maxEnrollment || t('notSpecified')}</td>
                </tr>
                <tr>
                  <td className="text-muted">{t('summaryEndDate')}</td>
                  <td className="fw-bold">
                    {endDate ? formatDate(endDate) : t('notCalculatedYet')}
                  </td>
                </tr>
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        <div className="d-grid mt-4">
          <Button variant="primary" type="submit" disabled={!!lessonWarning}>
            {t('saveButton')}
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

  const [faqs, setFaqs] = useState([]);
  const [tags, setTags] = useState([]);
  const [reviewerMessage, setReviewerMessage] = useState('');
  const [hasRights, setHasRights] = useState(false);
  const [liveCourseMeta, setLiveCourseMeta] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [showFaqPanel, setShowFaqPanel] = useState(false);
  const [showSchedulePanel, setShowSchedulePanel] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);

  const [showPublishConfirm, setShowPublishConfirm] = useState(false);

  // Translation hooks
  const t = useTranslations('instructor.course.step4');
  const tSchedule = useTranslations('instructor.course.step4.schedule');
  const tFaq = useTranslations('instructor.course.step4.faq');
  const tTags = useTranslations('instructor.course.step4.tags');
  const tRights = useTranslations('instructor.course.step4.rights');
  const tButtons = useTranslations('instructor.course.step4.buttons');
  const tValidation = useTranslations('instructor.course.step4.validation');
  const tPublish = useTranslations('instructor.course.step4.publish');
  const tWeekdays = useTranslations('instructor.course.step4.weekdays');

  const STEP3_STORAGE_KEY = `${mode}_course_step3_data`;
  const STEP4_STORAGE_KEY = `${mode}_course_step4_data`;

  useEffect(() => {
    const loadData = () => {
      if (mode === 'edit') {
        if (courseData && courseData._id && !dataLoaded) {
          console.log('Edit mode: Loading course additional data into form', courseData);
          populateFormWithCourseData();
          setDataLoaded(true);
        } else if (!courseData._id && !courseLoading && !dataLoaded) {
          loadFromLocalStorage();
          setDataLoaded(true);
        }
      } else {
        if (!dataLoaded) {
          loadFromLocalStorage();
          setDataLoaded(true);
        }
      }
    };

    loadData();
  }, [courseData, mode, courseLoading, dataLoaded]);

  useEffect(() => {
    if (mode === 'edit' && courseData._id && (courseData.faqs || courseData.tags || courseData.liveCourseMeta)) {
      console.log('Force loading Step4 data due to courseData change');
      populateFormWithCourseData();
      setDataLoaded(true);
    }
  }, [courseData._id, courseData.faqs, courseData.tags, courseData.liveCourseMeta, mode]);

  const populateFormWithCourseData = () => {
    console.log('Populating Step 4 form with course data:', {
      faqs: courseData.faqs,
      tags: courseData.tags,
      liveCourseMeta: courseData.liveCourseMeta,
      reviewerMessage: courseData.reviewerMessage,
      hasRights: courseData.hasRights
    });

    if (courseData.faqs && Array.isArray(courseData.faqs)) {
      console.log('Setting FAQs from courseData:', courseData.faqs);
      const faqsWithIds = courseData.faqs.map((faq, index) => ({
        ...faq,
        id: faq.id || faq._id || `faq_${index}_${Date.now()}`
      }));
      setFaqs(faqsWithIds);
    }

    if (courseData.tags && Array.isArray(courseData.tags)) {
      console.log('Setting tags from courseData:', courseData.tags);
      const tagsWithIds = courseData.tags.map((tag, index) => ({
        id: `tag_${index}_${Date.now()}`,
        tagName: typeof tag === 'string' ? tag : tag.tagName || tag
      }));
      setTags(tagsWithIds);
    }

    if (courseData.liveCourseMeta) {
      console.log('Setting liveCourseMeta from courseData:', courseData.liveCourseMeta);
      const liveMetaData = {
        ...courseData.liveCourseMeta,
        maxEnrollment: courseData.liveCourseMeta.maxEnrollment || 30
      };

      setTimeout(() => {
        setLiveCourseMeta(liveMetaData);
        console.log('Set liveCourseMeta with data:', liveMetaData);
      }, 0);
    }

    if (courseData.reviewerMessage) {
      console.log('Setting reviewerMessage from courseData:', courseData.reviewerMessage);
      setReviewerMessage(courseData.reviewerMessage);
    }

    if (courseData.hasRights !== undefined) {
      console.log('Setting hasRights from courseData:', courseData.hasRights);
      setHasRights(courseData.hasRights);
    }

    console.log('Populated Step 4 form with course data');
  };

  useEffect(() => {
    if (mode === 'edit' && courseData._id && courseData.liveCourseMeta) {
      console.log('Loading liveCourseMeta on step navigation:', courseData.liveCourseMeta);
      setLiveCourseMeta(courseData.liveCourseMeta);
    }
  }, [courseData.liveCourseMeta, mode, courseData._id]);

  useEffect(() => {
    if (mode === 'edit' && courseData._id && courseData.liveCourseMeta && dataLoaded) {
      console.log('Force updating liveCourseMeta due to courseData change');
      setLiveCourseMeta(courseData.liveCourseMeta);
    }
  }, [courseData, mode, dataLoaded]);

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

  const handleAddFaq = (faqData) => {
    setFaqs([...faqs, faqData]);
    toast.success(tFaq('addedSuccess'));
  };

  const handleUpdateFaq = (faqData) => {
    const updatedFaqs = faqs.map(faq =>
      faq.id === editingFaq.id ? faqData : faq
    );
    setFaqs(updatedFaqs);
    setEditingFaq(null);
    toast.success(tFaq('updatedSuccess'));
  };

  const handleEditFaq = (index) => {
    setEditingFaq(faqs[index]);
    setShowFaqPanel(true);
  };

  const handleDeleteFaq = (index) => {
    const updatedFaqs = [...faqs];
    updatedFaqs.splice(index, 1);
    setFaqs(updatedFaqs);
    toast.success(tFaq('deletedSuccess'));
  };

  const handleAddTag = (tagName) => {
    if (tags.some(tag => tag.tagName.toLowerCase() === tagName.toLowerCase())) {
      toast.error(tTags('tagExists'));
      return;
    }

    if (tags.length >= 14) {
      toast.error(tTags('maxTagsReached'));
      return;
    }

    setTags([...tags, { id: Date.now() + Math.random(), tagName }]);
    toast.success(tTags('tagAddedSuccess'));
  };

  const handleDeleteTag = (index) => {
    const updatedTags = [...tags];
    updatedTags.splice(index, 1);
    setTags(updatedTags);
  };

  const handleSaveSchedule = (scheduleData) => {
    setLiveCourseMeta(scheduleData);
    toast.success(t('schedulePanel.scheduleSavedSuccess'));
  };

  const handleConfirmPublish = () => {
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

  const saveDraft = async (publish = false) => {
    const tagStrings = tags.map(tag => tag.tagName);

    const data = {
      faqs,
      tags: tagStrings,
      reviewerMessage,
      publish
    };

    if (courseData.type === 'live' && liveCourseMeta) {
      data.liveCourseMeta = liveCourseMeta;
    }

    const success = await saveAdditionalInfo(data);

    if (success) {
      clearAllCourseLocalStorage();

      if (publish) {
        window.location.href = '/instructor/manage-course';
      } else {
        stepperInstance?.previous();
      }
    }

    return success;
  };

  const handlePublish = async () => {
    return await saveDraft(true);
  };

  const validateForPublish = () => {
    if (faqs.length === 0) {
      toast.error(tValidation('addOneFaq'));
      return false;
    }

    if (tags.length === 0) {
      toast.error(tValidation('addOneTag'));
      return false;
    }

    if (!hasRights && courseData.type === 'recorded') {
      toast.error(tValidation('confirmRights'));
      return false;
    }

    if (courseData.type === 'live') {
      if (!liveCourseMeta) {
        toast.error(tValidation('setSchedule'));
        return false;
      }

      if (!liveCourseMeta.startDate) {
        toast.error(tValidation('selectStartDate'));
        return false;
      }

      if (!liveCourseMeta.timeSlots || liveCourseMeta.timeSlots.length === 0) {
        toast.error(tValidation('selectTimeSlot'));
        return false;
      }

      if (!liveCourseMeta.maxEnrollment || liveCourseMeta.maxEnrollment <= 0) {
        toast.error(tValidation('specifyMaxEnrollment'));
        return false;
      }

      const plannedLessons = liveCourseMeta.plannedLessons;
      const slotsCount = liveCourseMeta.timeSlots.length;

      if (plannedLessons % slotsCount !== 0) {
        toast.error(t('schedulePanel.lessonsDivisibleError', { planned: plannedLessons, slots: slotsCount }));
        return false;
      }
    }

    return true;
  };

  const handlePrevious = () => {
    stepperInstance?.previous();
  };

  if (mode === 'edit' && courseLoading) {
    return (
      <div id="step-4" role="tabpanel" className="content fade" aria-labelledby="steppertrigger4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <h5>{t('loadingInfo')}</h5>
            <p className="text-muted">{t('loadingSubtext')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'edit' && !courseLoading && courseLoadError) {
    return (
      <div id="step-4" role="tabpanel" className="content fade" aria-labelledby="steppertrigger4">
        <Alert variant="danger">
          <h5>{t('errorLoadingTitle')}</h5>
          <p>{t('errorLoadingMessage')} {courseLoadError}</p>
          <Button variant="outline-danger" onClick={() => window.location.href = '/instructor/manage-course'}>
            {t('backToCourseManagement')}
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div id="step-4" role="tabpanel" className="content fade" aria-labelledby="steppertrigger4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>
          {mode === 'edit' ? t('editTitle') : t('title')}
        </h4>
        {courseData.type === 'live' && (
          <Button
            variant="primary"
            onClick={() => setShowSchedulePanel(true)}
          >
            <FaCalendarAlt className="me-2" /> {liveCourseMeta ? tSchedule('buttonEdit') : tSchedule('buttonSet')}
          </Button>
        )}
      </div>
      <hr />

      {courseData.type === 'live' && liveCourseMeta && (
        <Card className="mb-4 border shadow-sm">
          <Card.Header className="bg-light">
            <h5 className="mb-0 d-flex align-items-center">
              <FaCalendarAlt className="me-2" /> {tSchedule('cardTitle')}
            </h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <h6>{tSchedule('scheduleDetails')}</h6>
                <Table borderless size="sm">
                  <tbody>
                    <tr>
                      <td className="text-muted" width="40%">{tSchedule('day')}</td>
                      <td>
                        {liveCourseMeta.timeSlots && liveCourseMeta.timeSlots.length > 0
                          ? tWeekdays(liveCourseMeta.timeSlots[0].weekDay) || tSchedule('notSet')
                          : tSchedule('notSet')}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted">{tSchedule('timeSlots')}</td>
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
                        ) : tSchedule('noSlotsSelected')}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted">{tSchedule('startDate')}</td>
                      <td>
                        {liveCourseMeta.startDate
                          ? new Date(liveCourseMeta.startDate).toLocaleDateString()
                          : tSchedule('notSet')}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted">{tSchedule('endDate')}</td>
                      <td>
                        {liveCourseMeta.endDate
                          ? new Date(liveCourseMeta.endDate).toLocaleDateString()
                          : tSchedule('notCalculated')}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
              <Col md={6}>
                <h6>{tSchedule('enrollmentDetails')}</h6>
                <Table borderless size="sm">
                  <tbody>
                    <tr>
                      <td className="text-muted" width="50%">{tSchedule('plannedLessons')}</td>
                      <td>{liveCourseMeta.plannedLessons || tSchedule('notSet')}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">{tSchedule('maxEnrollment')}</td>
                      <td>{liveCourseMeta.maxEnrollment || tSchedule('notSet')}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">{tSchedule('lessonsPerDay')}</td>
                      <td>{liveCourseMeta.timeSlots ? liveCourseMeta.timeSlots.length : 0}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">{tSchedule('totalCourseDays')}</td>
                      <td>
                        {liveCourseMeta.timeSlots && liveCourseMeta.plannedLessons
                          ? Math.ceil(liveCourseMeta.plannedLessons / liveCourseMeta.timeSlots.length)
                          : tSchedule('cannotCalculate')}
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
                <FaEdit className="me-1" /> {tSchedule('editScheduleButton')}
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
                <h5 className="mb-0">{tFaq('title')}</h5>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setEditingFaq(null);
                    setShowFaqPanel(true);
                  }}
                >
                  <FaPlus className="me-1" /> {tFaq('addButton')}
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {faqs.length === 0 ? (
                <div className="text-center py-4 bg-light rounded">
                  <FaExclamationTriangle className="text-warning mb-3" style={{ fontSize: '2rem' }} />
                  <h6>{tFaq('noFaqsTitle')}</h6>
                  <p className="text-muted small mb-3">{tFaq('noFaqsDescription')}</p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setEditingFaq(null);
                      setShowFaqPanel(true);
                    }}
                  >
                    <FaPlus className="me-2" /> {tFaq('addFirstButton')}
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
                <FaTag className="me-2" /> {tTags('title')}
              </h5>
            </Card.Header>
            <Card.Body>
              <Form.Group>
                <Form.Label>{tTags('selectLabel')}</Form.Label>

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
                    <div className="text-muted">{tTags('noTagsSelected')}</div>
                  )}
                </div>
                <div className="small text-muted mt-2">
                  {tTags('maxTagsInfo')}
                </div>
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>

        {/* Rights Confirmation */}
        <Col xs={12}>
          <Card className="shadow-sm border">
            <Card.Body>
              <Form.Group className="mt-3">
                <Form.Check
                  type="checkbox"
                  id="rights-checkbox"
                  checked={hasRights}
                  onChange={(e) => setHasRights(e.target.checked)}
                  label={tRights('confirmationLabel')}
                />
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>

        {/* Navigation Buttons */}
        <Col xs={12}>
          <div className="d-md-flex justify-content-between align-items-center mt-2">
            <Button
              variant="light"
              onClick={handlePrevious}
              disabled={isLoading}
              className="mb-2 mb-md-0"
            >
              {tButtons('previous')}
            </Button>

            <div className="ms-auto">
              <Button
                variant="success"
                onClick={handleConfirmPublish}
                disabled={isLoading}
                className="mb-2 mb-md-0"
              >
                {isLoading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                    {mode === 'edit' ? tButtons('updating') : tButtons('publishing')}
                  </>
                ) : (mode === 'edit' ? tButtons('updateAndPublish') : tButtons('publishCourse'))}
              </Button>
            </div>
          </div>

          <div className="text-muted small mt-3">
            <FaInfoCircle className="me-1" />
            {mode === 'edit'
              ? tPublish('infoMessageEdit')
              : tPublish('infoMessage')
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
        title={mode === 'edit' ? tPublish('confirmUpdateTitle') : tPublish('confirmTitle')}
        message={mode === 'edit'
          ? tPublish('confirmUpdateMessage')
          : tPublish('confirmMessage')
        }
        confirmText={mode === 'edit' ? tPublish('updateButton') : tPublish('confirmButton')}
        cancelText={tPublish('cancelButton')}
        variant="success"
      />
    </div>
  );
};

export default Step4;