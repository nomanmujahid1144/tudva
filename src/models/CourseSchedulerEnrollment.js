// src/models/CourseSchedulerEnrollment.js
import mongoose from 'mongoose';

// Define status constants
export const SchedulerStatus = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed'
};

export const CourseType = {
  RECORDED: 'recorded',
  LIVE: 'live'
};

// Define schema for scheduled items within a course
const ScheduledItemSchema = new mongoose.Schema({
  itemId: {
    type: String,
    required: [true, 'Item ID is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required']
  },
  moduleTitle: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    required: [true, 'Scheduled date is required']
  },
  slotId: {
    type: String,
    required: [true, 'Time slot ID is required'],
    enum: ['slot_1', 'slot_2', 'slot_3', 'slot_4', 'slot_5', 'slot_6']
  },
  lessonNumber: {
    type: Number
  },
  totalLessons: {
    type: Number
  },
  type: {
    type: String,
    enum: Object.values(CourseType)
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

// Define schema for a scheduled course
const ScheduledCourseSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required']
  },
  scheduledItems: [ScheduledItemSchema],
  progress: {
    completed: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: [true, 'Total items count is required']
    }
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: Object.values(SchedulerStatus),
    default: SchedulerStatus.ACTIVE
  }
}, { timestamps: true });

// Define the main schema for course scheduler enrollment
const CourseSchedulerEnrollmentSchema = new mongoose.Schema({
  learner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Learner ID is required']
  },
  scheduledCourses: [ScheduledCourseSchema],
  settings: {
    defaultWeekDay: {
      type: String,
      enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      default: 'wednesday'
    },
    reminderEnabled: {
      type: Boolean,
      default: true
    },
    reminderTime: {
      type: Number, // minutes before session
      default: 30
    }
  }
}, { timestamps: true });

// Pre-save hook to update progress when items are completed
ScheduledCourseSchema.pre('save', function (next) {
  const completedItems = this.scheduledItems.filter(item => item.isCompleted).length;
  this.progress.completed = completedItems;
  next();
});

// Create and export model (only if it doesn't already exist)
const CourseSchedulerEnrollment = mongoose.models.CourseSchedulerEnrollment ||
  mongoose.model('CourseSchedulerEnrollment', CourseSchedulerEnrollmentSchema);

export default CourseSchedulerEnrollment;