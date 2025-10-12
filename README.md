//SRC FILE CHANGES 

User Controller:
// src/controllers/user.controller.js
const User = require('../models/user.model');

// GET /api/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users', details: error.message });
  }
};

// POST /api/users
exports.createUser = async (req, res) => {
  const { name, email, password, dateOfBirth } = req.body;

  if (!name || !email || !password || !dateOfBirth) {
    return res.status(400).json({ error: 'Name, email, password, and dateOfBirth are required' });
  }

  try {
    const newUser = new User({
      name,
      email,
      password, // TODO: hash in production
      dateOfBirth,
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user', details: error.message });
  }
};

User Model:

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
