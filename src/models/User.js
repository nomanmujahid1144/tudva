import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Define the enum for user roles
export const UserRole = {
    LEARNER: 'learner',
    INSTRUCTOR: 'instructor',
    ADMIN: 'admin',
};

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: Object.values(UserRole),
        default: UserRole.LEARNER
    },
    isActive: {
        type: Boolean,
        default: true
    },
    phoneNo: {
        type: String
    },
    aboutMe: {
        type: String
    },
    profilePicture: {
        type: String
    },
    education: [{
        type: String
    }],
    // NEW: Favorites field for course favoriting functionality
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    confirmationToken: {
        type: String,
        default: null
    },
    tokenExpiration: {
        type: Date,
        default: null
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date
    }
}, {
    timestamps: true // This creates createdAt and updatedAt fields automatically
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.passwordHash);
};

// Static method to hash password
userSchema.statics.hashPassword = async function(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

// NEW: Method to check if a course is in user's favorites
userSchema.methods.hasFavorite = function(courseId) {
    if (!this.favorites || this.favorites.length === 0) {
        return false;
    }
    return this.favorites.some(fav => fav.toString() === courseId.toString());
};

// NEW: Method to add a course to favorites
userSchema.methods.addToFavorites = function(courseId) {
    if (!this.favorites) {
        this.favorites = [];
    }
    
    // Check if course is already in favorites
    if (!this.hasFavorite(courseId)) {
        this.favorites.push(courseId);
    }
    
    return this.save();
};

// NEW: Method to remove a course from favorites
userSchema.methods.removeFromFavorites = function(courseId) {
    if (!this.favorites || this.favorites.length === 0) {
        return this.save();
    }
    
    this.favorites = this.favorites.filter(fav => fav.toString() !== courseId.toString());
    return this.save();
};

// NEW: Method to get favorites count
userSchema.methods.getFavoritesCount = function() {
    return this.favorites ? this.favorites.length : 0;
};

// NEW: Method to toggle favorite status
userSchema.methods.toggleFavorite = function(courseId) {
    if (this.hasFavorite(courseId)) {
        return this.removeFromFavorites(courseId);
    } else {
        return this.addToFavorites(courseId);
    }
};

// Add index for faster favorite lookups
userSchema.index({ favorites: 1 });

// Add method to ensure model isn't overwritten during hot reloads in development
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;