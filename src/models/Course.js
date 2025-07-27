import mongoose from 'mongoose';

// Define enums for course-related fields
export const CourseType = {
    RECORDED: 'recorded',
    LIVE: 'live'
};

export const CourseLevel = {
    BEGINNER: 'beginner',
    INTERMEDIATE: 'intermediate',
    ADVANCED: 'advanced',
    ALL_LEVELS: 'all_levels'
};

// Single language for now
export const CourseLanguage = {
    ENGLISH: 'english'
};

// Main categories based on the provided menu items
export const CourseCategory = {
    LANGUAGES_COMMUNICATION: 'Languages & Communication',
    COOKING_HOUSEHOLD: 'Cooking & Household',
    CREATIVITY_CRAFTSMANSHIP: 'Creativity & Craftsmanship',
    DIGITAL_IT: 'Digital & IT',
    HEALTH_EXERCISE: 'Health & Exercise',
    NATURE_GARDENING: 'Nature & Gardening',
    CAREER_EDUCATION: 'Career & Education'
};

// Subcategories mapped to their parent categories
export const CourseSubcategory = {
    // Languages & Communication subcategories
    FOREIGN_LANGUAGES: 'Forigen Languages',
    NATIONAL_LANGUAGE: 'Learning the National Language',
    RHETORIC_COMMUNICATION: 'Rhetoric & International Communicationcom',

    // Cooking & Household subcategories
    COOKING_BAKING: 'Cooking & Baking (including International Cuisine)',
    NUTRITION_SUSTAINABILITY: 'Nutrition & Sustainability',
    HOME_ECONOMICS: 'Home Economics',

    // Creativity & Craftsmanship subcategories
    PAINTING_DRAWING_PHOTOGRAPHY: 'Painting, Drawing, Photography',
    SEWING_CRAFTING_DIY: 'Sewing, Crafting, DIY',
    ARTS_MORE: 'Arts & More',

    // Digital & IT subcategories
    COMPUTERS_INTERNET: 'Computers & Internet',
    SOCIAL_MEDIA_DATA_PROTECTION: 'Social Media & Data Protection',
    SOFTWARE_TOOLS: 'Software & Tools',

    // Health & Exercise subcategories
    FITNESS_YOGA: 'Fitness, Yoga & More',
    RELAXATION_STRESS_MANAGEMENT: 'Relaxation & Stress Management',
    PREVENTION_WELLBEING: 'Prevention & Well-being',

    // Nature & Gardening subcategories
    GARDENING_URBAN: 'Gardening & Urban Gardening',
    ENVIRONMENT_SUSTAINABILITY: 'Environment & Sustainability',
    ECO_PROJECTS: 'Eco Projects',

    // Career & Education subcategories
    SOFT_SKILLS_TIME_MANAGEMENT: 'Soft Skills & Time Management',
    CAREER_ORIENTATION: 'Career Orientation & Qualification',
    BASIC_EDUCATION_LITERACY: 'Basic Education & Literacy'
};

// Map that links subcategories to their parent categories
export const SubcategoryToCategoryMap = {
    // Languages & Communication
    [CourseSubcategory.FOREIGN_LANGUAGES]: CourseCategory.LANGUAGES_COMMUNICATION,
    [CourseSubcategory.NATIONAL_LANGUAGE]: CourseCategory.LANGUAGES_COMMUNICATION,
    [CourseSubcategory.RHETORIC_COMMUNICATION]: CourseCategory.LANGUAGES_COMMUNICATION,

    // Cooking & Household
    [CourseSubcategory.COOKING_BAKING]: CourseCategory.COOKING_HOUSEHOLD,
    [CourseSubcategory.NUTRITION_SUSTAINABILITY]: CourseCategory.COOKING_HOUSEHOLD,
    [CourseSubcategory.HOME_ECONOMICS]: CourseCategory.COOKING_HOUSEHOLD,

    // Creativity & Craftsmanship
    [CourseSubcategory.PAINTING_DRAWING_PHOTOGRAPHY]: CourseCategory.CREATIVITY_CRAFTSMANSHIP,
    [CourseSubcategory.SEWING_CRAFTING_DIY]: CourseCategory.CREATIVITY_CRAFTSMANSHIP,
    [CourseSubcategory.ARTS_MORE]: CourseCategory.CREATIVITY_CRAFTSMANSHIP,

    // Digital & IT
    [CourseSubcategory.COMPUTERS_INTERNET]: CourseCategory.DIGITAL_IT,
    [CourseSubcategory.SOCIAL_MEDIA_DATA_PROTECTION]: CourseCategory.DIGITAL_IT,
    [CourseSubcategory.SOFTWARE_TOOLS]: CourseCategory.DIGITAL_IT,

    // Health & Exercise
    [CourseSubcategory.FITNESS_YOGA]: CourseCategory.HEALTH_EXERCISE,
    [CourseSubcategory.RELAXATION_STRESS_MANAGEMENT]: CourseCategory.HEALTH_EXERCISE,
    [CourseSubcategory.PREVENTION_WELLBEING]: CourseCategory.HEALTH_EXERCISE,

    // Nature & Gardening
    [CourseSubcategory.GARDENING_URBAN]: CourseCategory.NATURE_GARDENING,
    [CourseSubcategory.ENVIRONMENT_SUSTAINABILITY]: CourseCategory.NATURE_GARDENING,
    [CourseSubcategory.ECO_PROJECTS]: CourseCategory.NATURE_GARDENING,

    // Career & Education
    [CourseSubcategory.SOFT_SKILLS_TIME_MANAGEMENT]: CourseCategory.CAREER_EDUCATION,
    [CourseSubcategory.CAREER_ORIENTATION]: CourseCategory.CAREER_EDUCATION,
    [CourseSubcategory.BASIC_EDUCATION_LITERACY]: CourseCategory.CAREER_EDUCATION
};

export const CourseStatus = {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    ARCHIVED: 'archived'
};

export const WeekDay = {
    MONDAY: 'monday',
    TUESDAY: 'tuesday',
    WEDNESDAY: 'wednesday',
    THURSDAY: 'thursday',
    FRIDAY: 'friday'
};

// Updated time slots with actual times
export const TimeSlot = {
    SLOT_1: 'slot_1', // 9:00 - 9:40
    SLOT_2: 'slot_2', // 9:45 - 10:25
    SLOT_3: 'slot_3', // 10:45 - 11:25
    SLOT_4: 'slot_4', // 11:30 - 12:10
    SLOT_5: 'slot_5', // 13:35 - 14:15
    SLOT_6: 'slot_6'  // 14:20 - 15:00
};

// Time slot display text for UI
export const TimeSlotDisplay = {
    [TimeSlot.SLOT_1]: '9:00 - 9:40',
    [TimeSlot.SLOT_2]: '9:45 - 10:25',
    [TimeSlot.SLOT_3]: '10:45 - 11:25',
    [TimeSlot.SLOT_4]: '11:30 - 12:10',
    [TimeSlot.SLOT_5]: '13:35 - 14:15',
    [TimeSlot.SLOT_6]: '14:20 - 15:00'
};

// ENHANCED: Video Material schema for multiple materials per video
const videoMaterialSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    url: {
        type: String,
        required: true,
        trim: true
    },
    size: {
        type: Number, // File size in bytes
        required: true
    },
    type: {
        type: String, // MIME type
        required: true,
        trim: true
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: true });

// ENHANCED: Updated Video schema with multiple materials support
const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    url: {
        type: String,
        required: true
    },
    duration: {
        type: Number, // Duration in seconds
    },
    isPreview: {
        type: Boolean,
        default: false
    },
    thumbnailUrl: {
        type: String,
        trim: true
    },
    // ENHANCED: Multiple materials support
    materials: [videoMaterialSchema],
    
    // LEGACY: Keep single material fields for backward compatibility
    materialUrl: {
        type: String,
        trim: true
    },
    materialName: {
        type: String,
        trim: true
    },
    materialSize: {
        type: Number // File size in bytes
    },
    materialType: {
        type: String,
        trim: true // MIME type of the material file
    }
}, { _id: true, timestamps: true });

// Module schema for curriculum (for recorded courses)
const moduleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    order: {
        type: Number,
        required: true
    },
    videos: [videoSchema]
}, { _id: true, timestamps: true });

// FAQ schema
const faqSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true
    },
    answer: {
        type: String,
        required: true,
        trim: true
    }
}, { _id: true });

const liveLessonMaterialSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    url: {
        type: String,
        required: true,
        trim: true
    },
    size: {
        type: Number, // File size in bytes
        required: true
    },
    type: {
        type: String, // MIME type
        required: true,
        trim: true
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: true });

// Course Material schema for LIVE courses
const courseMaterialSchema = new mongoose.Schema({
    lessonNumber: {
        type: Number,
        required: true,
        min: 1
    },

    // Multiple materials array for each lesson
    materials: [liveLessonMaterialSchema],

    materialName: {
        type: String,
        trim: true
    },
    materialUrl: {
        type: String,
        trim: true
    },
    materialSize: {
        type: Number // File size in bytes
    },
    materialType: {
        type: String,
        trim: true // MIME type of the material file
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: true });

// Time slot schema for live courses
const timeSlotSchema = new mongoose.Schema({
    weekDay: {
        type: String,
        enum: Object.values(WeekDay),
        required: true
    },
    slot: {
        type: String,
        enum: Object.values(TimeSlot),
        required: true
    },
    // New fields for Matrix integration
    matrixRoomId: {
        type: String
    },
    recordingUrl: {
        type: String
    },
    sessionDate: {
        type: Date
    },
    sessionStatus: {
        type: String,
        enum: ['scheduled', 'live', 'completed', 'cancelled'],
        default: 'scheduled'
    }
}, { _id: true });

// Course schema
const courseSchema = new mongoose.Schema({
    // Basic course info
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    shortDescription: {
        type: String,
        trim: true
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Updated to include both category and subcategory
    category: {
        type: String,
        enum: Object.values(CourseCategory),
        required: true
    },
    subcategory: {
        type: String,
        enum: Object.values(CourseSubcategory),
        required: true
    },
    level: {
        type: String,
        enum: Object.values(CourseLevel),
        required: true
    },
    language: {
        type: String,
        enum: Object.values(CourseLanguage),
        default: CourseLanguage.ENGLISH
    },

    // Course type and status
    type: {
        type: String,
        enum: Object.values(CourseType),
        required: true
    },
    status: {
        type: String,
        enum: Object.values(CourseStatus),
        default: CourseStatus.DRAFT
    },

    // Course media
    backgroundColorHex: {
        type: String,
        default: '#ffffff'
    },
    iconUrl: {
        type: String
    },
    thumbnailUrl: {
        type: String
    },
    promoVideoUrl: {
        type: String
    },

    // Curriculum (for recorded courses only)
    modules: [moduleSchema],

    // Additional information
    faqs: [faqSchema],
    tags: [{
        type: String,
        trim: true
    }],

    // Live course specific fields
    liveCourseMeta: {
        startDate: {
            type: Date
        },
        endDate: {
            type: Date
        },
        plannedLessons: {
            type: Number
        },
        maxEnrollment: {
            type: Number
        },
        timeSlots: [timeSlotSchema],
        courseMaterials: [courseMaterialSchema]
    },

    // Statistics and metrics
    enrollmentCount: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    reviewCount: {
        type: Number,
        default: 0
    },

    // Soft delete implementation
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date
    }
}, { timestamps: true });

// Validate that subcategory belongs to the selected category
courseSchema.pre('validate', function (next) {
    if (this.category && this.subcategory) {
        if (SubcategoryToCategoryMap[this.subcategory] !== this.category) {
            this.invalidate('subcategory', 'Subcategory must belong to the selected category');
        }
    }
    next();
});

// Index for faster searches
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });
courseSchema.index({ status: 1, isDeleted: 1 });
courseSchema.index({ instructor: 1, status: 1 });
courseSchema.index({ category: 1, subcategory: 1 });

// Generate slug from title
courseSchema.pre('save', function (next) {
    if (!this.isModified('title')) {
        return next();
    }

    this.slug = this.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    // Add a unique identifier to avoid slug collisions
    this.slug = `${this.slug}-${Date.now().toString().slice(-6)}`;

    next();
});

// Method to check if a course is live
courseSchema.methods.isLiveCourse = function () {
    return this.type === CourseType.LIVE;
};

// Method to check if enrollments are open
courseSchema.methods.isEnrollmentOpen = function () {
    if (this.type === CourseType.RECORDED) {
        return this.status === CourseStatus.PUBLISHED;
    }

    if (this.type === CourseType.LIVE) {
        const now = new Date();

        if (this.liveCourseMeta.startDate && now > this.liveCourseMeta.startDate) {
            return false;
        }

        if (this.enrollmentCount >= this.liveCourseMeta.maxEnrollment) {
            return false;
        }

        return this.status === CourseStatus.PUBLISHED;
    }

    return false;
};

// ENHANCED: Method to get materials for a specific lesson (live courses)
courseSchema.methods.getMaterialsForLesson = function (lessonNumber) {
    if (this.type !== CourseType.LIVE || !this.liveCourseMeta || !this.liveCourseMeta.courseMaterials) {
        return [];
    }
    
    const lessonMaterial = this.liveCourseMeta.courseMaterials.find(
        material => material.lessonNumber === lessonNumber
    );
    
    if (!lessonMaterial) {
        return [];
    }
    
    const materials = [];
    
    // Add new materials array
    if (lessonMaterial.materials && lessonMaterial.materials.length > 0) {
        materials.push(...lessonMaterial.materials);
    }
    
    // Add legacy single material for backward compatibility
    if (!lessonMaterial.materials?.length && lessonMaterial.materialUrl) {
        materials.push({
            name: lessonMaterial.materialName || 'Course Material',
            url: lessonMaterial.materialUrl,
            size: lessonMaterial.materialSize || 0,
            type: lessonMaterial.materialType || 'application/octet-stream'
        });
    }
    
    return materials;
};

// Method to get total materials count for all lessons
courseSchema.methods.getTotalLiveMaterialsCount = function () {
    if (this.type !== CourseType.LIVE || !this.liveCourseMeta || !this.liveCourseMeta.courseMaterials) {
        return 0;
    }
    
    let totalCount = 0;
    
    this.liveCourseMeta.courseMaterials.forEach(lessonMaterial => {
        // Count new materials array
        if (lessonMaterial.materials && lessonMaterial.materials.length > 0) {
            totalCount += lessonMaterial.materials.length;
        }
        // Count legacy single material if no new materials
        else if (lessonMaterial.materialUrl) {
            totalCount += 1;
        }
    });
    
    return totalCount;
};

// Method to get lessons with materials count
courseSchema.methods.getLiveLessonsWithMaterialsCount = function () {
    if (this.type !== CourseType.LIVE || !this.liveCourseMeta || !this.liveCourseMeta.courseMaterials) {
        return 0;
    }
    
    return this.liveCourseMeta.courseMaterials.filter(lessonMaterial => {
        return (lessonMaterial.materials && lessonMaterial.materials.length > 0) || 
               lessonMaterial.materialUrl;
    }).length;
};

// Method to add materials to a specific lesson
courseSchema.methods.addMaterialsToLesson = function (lessonNumber, materials) {
    if (this.type !== CourseType.LIVE) {
        throw new Error('This method is only for live courses');
    }
    
    if (!this.liveCourseMeta) {
        this.liveCourseMeta = {};
    }
    
    if (!this.liveCourseMeta.courseMaterials) {
        this.liveCourseMeta.courseMaterials = [];
    }
    
    // Find existing lesson or create new one
    let lessonMaterial = this.liveCourseMeta.courseMaterials.find(
        material => material.lessonNumber === lessonNumber
    );
    
    if (!lessonMaterial) {
        lessonMaterial = {
            lessonNumber,
            materials: []
        };
        this.liveCourseMeta.courseMaterials.push(lessonMaterial);
    }
    
    // Ensure materials array exists
    if (!lessonMaterial.materials) {
        lessonMaterial.materials = [];
    }
    
    // Add new materials
    if (Array.isArray(materials)) {
        lessonMaterial.materials.push(...materials);
    } else {
        lessonMaterial.materials.push(materials);
    }
    
    return lessonMaterial;
};

// ENHANCED: Method to get all videos with materials (recorded courses) - supports multiple materials
courseSchema.methods.getVideosWithMaterials = function () {
    if (this.type !== CourseType.RECORDED) {
        return [];
    }
    
    const videosWithMaterials = [];
    this.modules.forEach(module => {
        module.videos.forEach(video => {
            // Check both new materials array and legacy single material
            const hasMaterials = (video.materials && video.materials.length > 0) || video.materialUrl;
            
            if (hasMaterials) {
                const videoData = {
                    moduleTitle: module.title,
                    videoTitle: video.title,
                    materials: []
                };

                // Add new materials
                if (video.materials && video.materials.length > 0) {
                    videoData.materials = video.materials.map(material => ({
                        name: material.name,
                        url: material.url,
                        size: material.size,
                        type: material.type
                    }));
                }

                // Add legacy material for backward compatibility
                if (video.materialUrl && !video.materials?.length) {
                    videoData.materials.push({
                        name: video.materialName || 'Course Material',
                        url: video.materialUrl,
                        size: video.materialSize,
                        type: video.materialType
                    });
                }

                videosWithMaterials.push(videoData);
            }
        });
    });
    
    return videosWithMaterials;
};

// ENHANCED: Method to get total materials count for a video
courseSchema.methods.getVideoMaterialsCount = function (video) {
    let count = 0;
    
    // Count new materials array
    if (video.materials && video.materials.length > 0) {
        count += video.materials.length;
    }
    
    // Count legacy material if no new materials
    if (!video.materials?.length && video.materialUrl) {
        count += 1;
    }
    
    return count;
};

// Ensure model isn't overwritten during hot reloads in development
const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);

export default Course;