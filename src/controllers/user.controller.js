const User = require('../models/user.model');

// TODO: implement endpoint logic here
exports.getAllUsers = async (req, res) => {
};

/**
 * @desc    Create a new user (Simplified for initial testing)
 * @route   POST /api/users
 * @access  Public
 */
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, dateOfBirth } = req.body;

    const newUser = new User({
      name,
      email,
      password, // Storing password in plain text ONLY for this initial test.
      dateOfBirth,
    });

    await newUser.save();

    res.status(201).json({
      message: 'SUCCESS: User was created and saved to the database.',
      user: newUser,
    });

  } catch (error) {
    
    console.error('DATABASE CONNECTION ERROR:', error);
    res.status(500).json({
      message: 'FAIL: An error occurred while trying to save the user.',
      error: error.message,
    });
  }
};