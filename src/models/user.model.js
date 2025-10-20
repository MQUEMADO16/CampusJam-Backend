/*
 * Defines the Mongoose schema for a User.
 * This model captures all user-specific information, including authentication
 * and profile details to social connections and API integrations.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  // Core Identity & Auth
  name: {
    type: String,
    required: [true, 'User name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/.+\@.+\..+/, 'Please provide a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    // Note: Password should be hashed before saving.
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required for age verification'],
  },
  campus: {
    type: String,
    trim: true,
  },

  // Basic subscription tier implementation
  subscription: {
    tier: {
      type: String,
      enum: ['basic', 'pro'],
      default: 'basic',
    }
  },

  // Musician Profile
  profile: {
    instruments: [{
      type: String,
      trim: true
    }],
    genres: [{
      type: String,
      trim: true
    }],
    skillLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Beginner',
    },
    bio: {
      type: String,
      maxlength: 500,
    },
  },

  joinedSessions: [{
    type: Schema.Types.ObjectId,
    ref: 'Session' // This tells Mongoose to reference the 'Session' model
  }],

  // Social Graph & Safety
  connections: {
    following: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    followers: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
  },
  blockedUsers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],

  // API Integrations
  // TODO: this might need tweaked when we do the integrations
  integrations: {
    googleId: String,
    spotify: {
      id: String,
      topGenres: [String],
    }
  }
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);
module.exports = User;