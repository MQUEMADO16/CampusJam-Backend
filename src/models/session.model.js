/**
 * Defines the Mongoose schema for a Jam Session. This is the core
 * event entity in the application. It includes details about the
 * session and participants.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const jamSessionSchema = new Schema({
  title: {
    type: String,
    required: [true, 'A title for the jam session is required.'],
    trim: true,
  },
  description: {
    type: String,
    maxlength: 1000,
  },
  host: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Ongoing', 'Finished', 'Cancelled'],
    default: 'Scheduled',
  },

  // ession Details
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
  },
  location: {
    type: String,
    trim: true,
  },
  genre: {
    type: String,
    trim: true,
  },
  skillLevel: {
    type: String,
    enum: ['Any', 'Beginner', 'Intermediate', 'Advanced'],
    default: 'Any',
  },
  instrumentsNeeded: [{
    type: String,
    trim: true
  }],
  spotifyPlaylistUrl: {
    type: String,
    trim: true,
  },

  // Participants
  attendees: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  invitedUsers: [{ // Primarily for private sessions
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
}, {
  timestamps: true,
});

// Note: The model is named 'JamSession' for clarity in the code, but it will be stored in the 'sessions' collection in MongoDB
const JamSession = mongoose.model('JamSession', jamSessionSchema, 'sessions');
module.exports = JamSession;

