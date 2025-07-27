// src/validation/courseSchema.js
import * as yup from 'yup';
import {
  CourseCategory,
  CourseSubcategory,
  CourseLevel,
  CourseLanguage,
  CourseType,
  WeekDay,
  TimeSlot
} from '@/constants/courseEnums';

// Basic course details validation schema
export const basicDetailsSchema = yup.object({
  title: yup.string()
    .required('Please enter course title')
    .max(35, 'Title must be 35 characters or less'),
  description: yup.string()
    .required('Please provide a course description'),
  shortDescription: yup.string()
    .required('Please provide a short description')
    .max(150, 'Short description must be 150 characters or less'),
  category: yup.string()
    .oneOf(Object.values(CourseCategory), 'Please select a valid category')
    .required('Please select a category'),
  subcategory: yup.string()
    .oneOf(Object.values(CourseSubcategory), 'Please select a valid subcategory')
    .required('Please select a subcategory'),
  level: yup.string()
    .oneOf(Object.values(CourseLevel), 'Please select a valid level')
    .required('Please select a course level'),
  language: yup.string()
    .oneOf(Object.values(CourseLanguage), 'Please select a valid language')
    .required('Please select a course language'),
  type: yup.string()
    .oneOf(Object.values(CourseType), 'Please select a valid course type')
    .required('Please select a course type'),
  promoVideoUrl: yup.string().url('Please enter a valid URL')
});

// Course media validation schema
export const courseMediaSchema = yup.object({
  backgroundColorHex: yup.string()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color')
    .required('Please select a background color'),
  iconUrl: yup.string().required('Please select an icon'),
  // thumbnailUrl: yup.string().url('Please enter a valid URL').required('Please upload a thumbnail')
});

// Recorded course curriculum validation schema
export const curriculumSchema = yup.object({
  modules: yup.array().of(
    yup.object({
      title: yup.string().required('Module title is required'),
      description: yup.string(),
      videos: yup.array().of(
        yup.object({
          title: yup.string().required('Video title is required'),
          description: yup.string(),
          url: yup.string().url('Please enter a valid URL').required('Video URL is required'),
          duration: yup.number().min(1, 'Duration must be at least 1 second'),
          isPreview: yup.boolean()
        })
      ).min(1, 'Each module must have at least one video')
    })
  ).min(1, 'At least one module is required')
});

// Live course time slots validation schema
export const liveCourseSlotsSchema = yup.object({
  startDate: yup.date().required('Start date is required'),
  plannedLessons: yup.number()
    .required('Number of planned lessons is required')
    .min(1, 'At least one lesson is required')
    .integer('Number of lessons must be a whole number'),
  maxEnrollment: yup.number()
    .required('Maximum enrollment is required')
    .min(1, 'At least one student must be allowed')
    .integer('Maximum enrollment must be a whole number'),
  timeSlots: yup.array().of(
    yup.object({
      weekDay: yup.string()
        .oneOf(Object.values(WeekDay), 'Please select a valid weekday')
        .required('Weekday is required'),
      slot: yup.string()
        .oneOf(Object.values(TimeSlot), 'Please select a valid time slot')
        .required('Time slot is required')
    })
  ).min(1, 'At least one time slot is required')
});

// Additional info validation schema
export const additionalInfoSchema = yup.object({
  faqs: yup.array().of(
    yup.object({
      question: yup.string().required('Question is required'),
      answer: yup.string().required('Answer is required')
    })
  ),
  tags: yup.array().of(
    yup.string().max(50, 'Tag must be 50 characters or less')
  ),
  publish: yup.boolean()
});

// Export all schemas
export default {
  basicDetailsSchema,
  courseMediaSchema,
  curriculumSchema,
  liveCourseSlotsSchema,
  additionalInfoSchema
};