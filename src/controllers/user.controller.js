const User = require('../models/user.model');

// TODO: implement endpoint logic here

/**
 * @desc  Fetch all users
 * @route GET /api/users
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -__v');
    res.status(200).json(users);
  }
  catch (error) {
    console.error('Error fetching users: ', error);
    res.status(500).json({
      message: 'Server error while fetching users.',
    });
  }
};

/**
 * @desc  Create a new user (Simplified for initial testing)
 * @route POST /api/users
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
  }
  catch (error) {
    console.error('DATABASE CONNECTION ERROR:', error);
    res.status(500).json({
      message: 'FAIL: An error occurred while trying to save the user.',
      error: error.message,
    });
  }
};