const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true }, // hash in production
  dateOfBirth: { type: Date, required: true },
  campus: { type: String, trim: true },
  profile: {
    instruments: [{ type: String, trim: true }],
    genres: [{ type: String, trim: true }],
    skillLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], default: 'Intermediate' },
    bio: { type: String, maxlength: 500 },
  },
  friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  connections: {
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  blockedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  integrations: {
    googleId: String,
    spotify: {
      id: String,
      topGenres: [String],
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
