const mongoose = require('mongoose')
const User = require('../models/user.model');
const Session = require('../models/session.model');

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

// TODO: add password hashing
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

/**
 * @desc    Add a session to a user's joinedSessions list
 * @route   POST /api/users/:id/sessions
 * @access  Private (should be authenticated)
 */
exports.addSessionToUser = async (req, res) => {
  try {
    const { id: userId } = req.params;
    const { sessionId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ message: 'Invalid user or session ID format.' });
    }

    const user = await User.findById(userId);
    const session = await Session.findById(sessionId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    if (user.joinedSessions.includes(sessionId)) {
      return res.status(400).json({ message: 'User has already joined this session.' });
    }

    user.joinedSessions.push(sessionId);
    await user.save();

    res.status(200).json({
      message: 'Session successfully added to user profile.',
      joinedSessions: user.joinedSessions,
    });

  } catch (error) {
    console.error('Error adding session to user:', error);
    res.status(500).json({ message: 'Server error while adding session to user.' });
  }
};

/**
 * @desc    Remove a session from a user's joinedSessions list
 * @route   DELETE /api/users/:userId/sessions/:sessionId
 * @access  Private (should be authenticated)
 */
exports.removeSessionFromUser = async (req, res) => {
  try {
    const { id: userId, sessionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ message: 'Invalid user or session ID format.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!user.joinedSessions.includes(sessionId)) {
      return res.status(400).json({ message: 'User has not joined this session.' });
    }

    // Remove the session ID using $pull for efficiency
    await User.updateOne(
      { _id: userId },
      { $pull: { joinedSessions: sessionId } }
    );

    res.status(200).json({
      message: 'Session successfully removed from user profile.',
    });

  } catch (error) {
    console.error('Error removing session from user:', error);
    res.status(500).json({ message: 'Server error while removing session from user.' });
  }
};

// GET /api/users/:id
exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ error: 'Failed to fetch user', details: error.message });
  }
};

// Update user profile
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  if (!name && !email) {
    return res.status(400).json({ error: 'Must provide name or email to update.' });
  }

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();
    res.status(200).json({ message: 'User updated successfully.', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update user.' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) return res.status(404).json({ error: 'User not found.' });
    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete user.' });
  }
};

// Add a friend
exports.addFriend = async (req, res) => {
  const { id: userId } = req.params;
  const { friendId } = req.body;

  if (!friendId) {
    return res.status(400).json({ error: 'Missing friend ID.' });
  }

  try {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ error: 'User or friend not found.' });
    }

    if (user.friends.includes(friendId)) {
      return res.status(409).json({ error: 'Users are already friends.' });
    }

    user.friends.push(friendId);
    friend.friends.push(userId);

    await user.save();
    await friend.save();

    res.status(200).json({ message: 'Friend added successfully.', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add friend.' });
  }
};
// Update password with old password check
exports.updatePassword = async (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Old password and new password are required.' });
  }

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Check old password
    if (user.password !== oldPassword) { // In production, use bcrypt.compare()
      return res.status(401).json({ error: 'Old password is incorrect.' });
    }

    // Update password
    user.password = newPassword; // In production, hash this!
    await user.save();

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update password.' });
  }
};
// Block a user
exports.blockUser = async (req, res) => {
  const { id } = req.params; // current user
  const { blockedUserId } = req.body; // user to block

  if (!blockedUserId) {
    return res.status(400).json({ error: 'blockedUserId is required.' });
  }

  try {
    const user = await User.findById(id);
    const blockedUser = await User.findById(blockedUserId);

    if (!user || !blockedUser) {
      return res.status(404).json({ error: 'User or user to block not found.' });
    }

    if (user.blockedUsers.includes(blockedUserId)) {
      return res.status(409).json({ error: 'User is already blocked.' });
    }

    user.blockedUsers.push(blockedUserId);
    await user.save();

    res.status(200).json({ message: `User ${blockedUser.name} blocked successfully.`, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to block user.' });
  }
};

// View blocked users
exports.getBlockedUsers = async (req, res) => {
  const { id } = req.params; // current user

  try {
    const user = await User.findById(id).populate('blockedUsers', 'name email');
    if (!user) return res.status(404).json({ error: 'User not found.' });

    res.status(200).json({ blockedUsers: user.blockedUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch blocked users.' });
  }
};
// Unfriend a user
exports.removeFriend = async (req, res) => {
  const { id: userId } = req.params;
  const { friendId } = req.body;

  if (!friendId) {
    return res.status(400).json({ error: 'Missing friendId.' });
  }

  try {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ error: 'User or friend not found.' });
    }

    // Check if they are friends
    if (!user.friends.includes(friendId)) {
      return res.status(400).json({ error: 'Users are not friends.' });
    }

    // Remove friendId from user's friends list
    user.friends = user.friends.filter(f => f.toString() !== friendId);
    // Remove userId from friend's friends list
    friend.friends = friend.friends.filter(f => f.toString() !== userId);

    await user.save();
    await friend.save();

    res.status(200).json({ message: 'Friend removed successfully.', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to remove friend.' });
  }
};

// View friends
exports.getFriends = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).populate('friends', 'name email');
    if (!user) return res.status(404).json({ error: 'User not found.' });

    res.status(200).json({ friends: user.friends });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch friends.' });
  }
};

// Subscription related endpoints
exports.getSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('subscription');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ subscription: user.subscription });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateSubscription = async (req, res) => {
  const { tier } = req.body;

  if (!['basic', 'pro'].includes(tier)) {
    return res.status(400).json({ message: 'Invalid subscription tier' });
  }

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.subscription.tier = tier;
    await user.save();

    res.status(200).json({ message: 'Subscription updated', subscription: user.subscription });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get an user's joined/hosted sessions
exports.getUserActivity = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Confirm user exists
    const user = await User.findById(id).select('name email');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch user's hosted jam sessions
    const hostedSessions = await Session.find({ host: id })
      .populate('attendees', 'name email')
      .populate('invitedUsers', 'name email')
      .sort({ startTime: -1 });

    // Fetch user's joined sessions
    const joinedSessions = await Session.find({ attendees: id })
      .populate('host', 'name email')
      .sort({ startTime: -1 });

    // Fetch sessions they're invited to
    const invitedSessions = await Session.find({ invitedUsers: id })
      .populate('host', 'name email')
      .sort({ startTime: -1 });

    // Check for activity
    if (
      hostedSessions.length === 0 &&
      joinedSessions.length === 0 &&
      invitedSessions.length === 0
    ) {
      return res.status(404).json({ message: 'No activity found for this user.' });
    }

    // Combine and format response
    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      hostedSessions,
      joinedSessions,
      invitedSessions
    });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({
      error: 'Failed to fetch user activity',
      details: error.message,
    });
  }
};

// Report an user
exports.reportUser = async (req,res) => {
  const Report = require('../models/report.model');
  const reportedUserId = req.params.id;
  const { reportedBy, reason } = req.body;

  if (!reportedBy || !reason) {
    return res.status(400).json({ message: 'Missing reportedBy or reason in request' });
  }

  try {
    // Check if the reported user exists
    const reportedUser = await User.findById(reportedUserId);
    if (!reportedUser) {
      return res.status(404).json({ message: 'Reported user not found' });
    }

    // Optional: Check if the reporter is not reporting themselves
    if (reportedUserId === reportedBy) {
      return res.status(400).json({ message: 'You cannot report yourself' });
    }

    // Save the report
    const report = new Report({
      reportedUser: reportedUserId,
      reportedBy,
      reason
    });

    await report.save();

    res.status(201).json({ message: 'User reported successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while reporting user' });
  }
};

// GET users with matching usernames to given input
exports.searchUser = async (req,res) => {

  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ error: 'Please enter a username' });
    }

    // Build dynamic search filter
    const filter = { name: new RegExp(name, 'i') }; // case-insensitive name search

    const users = await User.find(filter).select('-password'); // exclude password field

    if (users.length === 0) {
      return res.status(404).json({ message: 'No matching user' });
    }

    res.status(200).json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Failed to search users', details: error.message });
  }
};

