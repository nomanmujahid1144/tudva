import mongoose from 'mongoose';

// Define the Review schema
const reviewSchema = new mongoose.Schema({
    // Course and user references
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Review content
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        validate: {
            validator: function(v) {
                return v >= 1 && v <= 5;
            },
            message: 'Rating must be between 1 and 5'
        }
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        minlength: [10, 'Review comment must be at least 10 characters'],
        maxlength: [1000, 'Review comment cannot exceed 1000 characters']
    },
    
    // Review metadata
    isVerifiedPurchase: {
        type: Boolean,
        default: false // Set to true if user is enrolled in the course
    },
    
    // Helpfulness tracking
    helpfulVotes: {
        type: Number,
        default: 0
    },
    unhelpfulVotes: {
        type: Number,
        default: 0
    },
    
    // Users who voted on this review
    votedUsers: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        voteType: {
            type: String,
            enum: ['helpful', 'unhelpful'],
            required: true
        }
    }],
    
    // Instructor reply
    instructorReply: {
        comment: {
            type: String,
            trim: true,
            maxlength: [500, 'Instructor reply cannot exceed 500 characters']
        },
        repliedAt: {
            type: Date
        },
        repliedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    
    // Status and moderation
    status: {
        type: String,
        enum: ['published', 'pending', 'flagged', 'hidden'],
        default: 'published'
    },
    
    // Soft delete
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Indexes for better performance
// FIXED: Unique index only applies to non-deleted reviews
reviewSchema.index(
    { course: 1, user: 1 }, 
    { 
        unique: true,
        partialFilterExpression: { isDeleted: false }
    }
);
reviewSchema.index({ course: 1, status: 1, isDeleted: 1 });
reviewSchema.index({ user: 1, status: 1, isDeleted: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });

// Virtual for net helpfulness score
reviewSchema.virtual('helpfulnessScore').get(function() {
    return this.helpfulVotes - this.unhelpfulVotes;
});

// Method to check if a user has voted on this review
reviewSchema.methods.hasUserVoted = function(userId) {
    return this.votedUsers.some(vote => 
        vote.user.toString() === userId.toString()
    );
};

// Method to get user's vote type
reviewSchema.methods.getUserVoteType = function(userId) {
    const vote = this.votedUsers.find(vote => 
        vote.user.toString() === userId.toString()
    );
    return vote ? vote.voteType : null;
};

// Method to add or update a vote
reviewSchema.methods.addVote = function(userId, voteType) {
    // Remove existing vote if any
    this.votedUsers = this.votedUsers.filter(vote => 
        vote.user.toString() !== userId.toString()
    );
    
    // Add new vote
    this.votedUsers.push({
        user: userId,
        voteType: voteType
    });
    
    // Update vote counts
    this.helpfulVotes = this.votedUsers.filter(vote => vote.voteType === 'helpful').length;
    this.unhelpfulVotes = this.votedUsers.filter(vote => vote.voteType === 'unhelpful').length;
    
    return this.save();
};

// Method to remove a vote
reviewSchema.methods.removeVote = function(userId) {
    this.votedUsers = this.votedUsers.filter(vote => 
        vote.user.toString() !== userId.toString()
    );
    
    // Update vote counts
    this.helpfulVotes = this.votedUsers.filter(vote => vote.voteType === 'helpful').length;
    this.unhelpfulVotes = this.votedUsers.filter(vote => vote.voteType === 'unhelpful').length;
    
    return this.save();
};

// Method to add instructor reply
reviewSchema.methods.addInstructorReply = function(comment, instructorId) {
    this.instructorReply = {
        comment: comment,
        repliedAt: new Date(),
        repliedBy: instructorId
    };
    
    return this.save();
};

// Static method to calculate course rating statistics
reviewSchema.statics.getCourseRatingStats = async function(courseId) {
    const stats = await this.aggregate([
        {
            $match: {
                course: new mongoose.Types.ObjectId(courseId),
                status: 'published',
                isDeleted: false
            }
        },
        {
            $group: {
                _id: null,
                averageRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 },
                ratingDistribution: {
                    $push: '$rating'
                }
            }
        },
        {
            $project: {
                _id: 0,
                averageRating: { $round: ['$averageRating', 1] },
                totalReviews: 1,
                ratingDistribution: 1
            }
        }
    ]);
    
    if (stats.length === 0) {
        return {
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: {
                5: 0, 4: 0, 3: 0, 2: 0, 1: 0
            }
        };
    }
    
    const result = stats[0];
    
    // Calculate rating distribution
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    result.ratingDistribution.forEach(rating => {
        distribution[rating]++;
    });
    
    return {
        averageRating: result.averageRating,
        totalReviews: result.totalReviews,
        ratingDistribution: distribution
    };
};

// Static method to get recent reviews for a course
reviewSchema.statics.getRecentReviews = async function(courseId, limit = 5) {
    return await this.find({
        course: courseId,
        status: 'published',
        isDeleted: false
    })
    .populate('user', 'fullName profilePicture')
    .populate('instructorReply.repliedBy', 'fullName profilePicture')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

// Pre-save middleware to update course rating
reviewSchema.post('save', async function(doc) {
    if (this.isNew || this.isModified('rating') || this.isModified('status')) {
        try {
            console.log('🔄 Review saved, updating course rating...', {
                reviewId: doc._id,
                courseId: doc.course,
                isNew: this.isNew,
                rating: doc.rating,
                status: doc.status
            });
            
            // Use mongoose.models to access Course model safely
            const Course = mongoose.models.Course || mongoose.model('Course');
            const stats = await this.constructor.getCourseRatingStats(doc.course);
            
            console.log('📊 Calculated stats:', stats);
            
            const updateResult = await Course.findByIdAndUpdate(doc.course, {
                rating: stats.averageRating,
                reviewCount: stats.totalReviews
            }, { new: true });
            
            console.log('✅ Course updated successfully:', {
                courseId: doc.course,
                newRating: updateResult?.rating,
                newReviewCount: updateResult?.reviewCount
            });
        } catch (error) {
            console.error('❌ Error updating course rating:', error);
        }
    }
});

// Pre-remove middleware to update course rating
reviewSchema.post('findOneAndDelete', async function(doc) {
    if (doc) {
        try {
            console.log('🗑️ Review deleted, updating course rating...', {
                reviewId: doc._id,
                courseId: doc.course
            });
            
            // Use mongoose.models to access Course model safely
            const Course = mongoose.models.Course || mongoose.model('Course');
            const stats = await doc.constructor.getCourseRatingStats(doc.course);
            
            console.log('📊 Calculated stats after deletion:', stats);
            
            const updateResult = await Course.findByIdAndUpdate(doc.course, {
                rating: stats.averageRating,
                reviewCount: stats.totalReviews
            }, { new: true });
            
            console.log('✅ Course updated after deletion:', {
                courseId: doc.course,
                newRating: updateResult?.rating,
                newReviewCount: updateResult?.reviewCount
            });
        } catch (error) {
            console.error('❌ Error updating course rating after deletion:', error);
        }
    }
});

// Ensure model isn't overwritten during hot reloads in development
const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

export default Review;