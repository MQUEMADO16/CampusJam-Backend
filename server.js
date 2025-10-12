// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const User = require('./src/models/userModel'); // adjust path if needed

const app = express();
app.use(express.json()); // to parse JSON bodies

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// POST endpoint: Create a new user
app.post('/api/users', async (req, res) => {
  const { name, email, password, dateOfBirth } = req.body;

  if (!name || !email || !password || !dateOfBirth) {
    return res.status(400).json({ error: 'Name, email, password, and dateOfBirth are required' });
  }

  try {
    const newUser = new User({
      name,
      email,
      password,       // TODO: hash this in production
      dateOfBirth,
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user', details: error.message });
  }
});

// GET endpoint: Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users', details: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

