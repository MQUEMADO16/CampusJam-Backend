const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const Session = require('../models/session.model');
const Notification = require('../models/notification.model');

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
    // Destructure the top-level fields
    const {
      name,
      email,
      password,
      dateOfBirth,
      profile,
      subscription,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the new user with the correctly nested data
    const newUser = new User({
      // Core Identity
      name,
      email,
      password: hashedPassword,
      dateOfBirth,

      // Nested Subscription object
      // Use the 'subscription' object from req.body, or default
      subscription: {
        tier: subscription?.tier || 'basic', 
      },

      // Nested Profile object
      // Use the 'profile' object from req.body, or default
      profile: {
        instruments: profile?.instruments || [],
        genres: profile?.genres || [],
        skillLevel: profile?.skillLevel || 'Beginner',
      },
    });

    // Save the user
    await newUser.save();

    // Remove password hash from the response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    // Send the sanitized user object
    res.status(201).json({
      message: 'SUCCESS: User was created and saved to the database.',
      user: userResponse,
    });
  }
  catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'FAIL: Validation error.',
        error: error.message,
      });
    }

    console.error('CREATE USER ERROR:', error);
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
  
  // Destructure the full object from the frontend
  const { name, email, profile } = req.body;

  // Basic validation
  if (!name || !email || !profile) {
    return res.status(400).json({ message: 'Missing required update fields.' });
  }

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Update top-level fields
    user.name = name;
    user.email = email;

    // Update all nested profile fields
    user.profile.bio = profile.bio;
    user.profile.instruments = profile.instruments;
    user.profile.genres = profile.genres;
    user.profile.skillLevel = profile.skillLevel;

    await user.save();
    
    // Sanitize the password from the response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({ message: 'User updated successfully.', user: userResponse });

  } catch (error) {
    console.error('Update User Error:', error);
  
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation failed', error: error.message });
    }
    
    res.status(500).json({ message: 'Failed to update user.' });
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
    return res.status(400).json({ message: 'Missing friend ID.' });
  }

  try {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ message: 'User or friend not found.' });
    }

    if (user.connections.following.includes(friendId)) {
      return res.status(409).json({ message: 'You are already following this user.' });
    }

    user.connections.following.push(friendId);
    friend.connections.followers.push(userId);

    await user.save();
    await friend.save();
    try {
  await Notification.create({
    recipient: friendId, // The person being followed gets the alert
    sender: userId,      // The person following
    type: 'follow',
    message: `${user.name} started following you.`,
    link: `/profile/${userId}` // Clicking takes them to the follower's profile
  });
} catch (err) {
  console.error('Notification creation failed:', err);
}    
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({ message: 'Friend added successfully.', user: userResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to add friend.' });
  }
};

// Update password with old password check
exports.updatePassword = async (req, res) => {
const { id } = req.params;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Old password and new password are required.' });
  }

  if (oldPassword === newPassword) {
    return res.status(400).json({ error: 'New password cannot be the same as the old password.' });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Old password is incorrect.' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedNewPassword; // Store the new hashed password
    await user.save();

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Error updating password:', error);
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
    return res.status(400).json({ message: 'Missing friend ID.' });
  }

  try {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ message: 'User or friend not found.' });
    }

    user.connections.following.pull(friendId);
    friend.connections.followers.pull(userId);

    await user.save();
    await friend.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({ message: 'Friend removed successfully.', user: userResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to remove friend.' });
  }
};

// View friends
exports.getFriends = async (req, res) => {
  const { id } = req.params;

  try {
    // Populate the correct field: 'connections.following'
    const user = await User.findById(id).populate('connections.following', 'name email');

    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Ensure we always return an array, even if 'following' is null/undefined
    const friendsList = user.connections.following || [];

    res.status(200).json({ friends: friendsList });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch friends.' });
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
exports.searchUser = async (req, res) => {
  try {
    const { 
      name,
      genres,
      instruments,
      skillLevel,
      campus,
      page = 1,
      limit = 20 
    } = req.query;

    if (!name) {
      return res.status(400).json({ 
        error: 'Name is required for user search. Please enter a name to search for users.' 
      });
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const filter = { 
      name: new RegExp(name, 'i') 
    };

    if (campus) filter.campus = campus;
    if (skillLevel) filter['profile.skillLevel'] = skillLevel;
    
    if (instruments) {
      if (Array.isArray(instruments)) {
        filter['profile.instruments'] = { $all: instruments };
      } else {
        filter['profile.instruments'] = instruments;
      }
    }
    
    if (genres) {
      if (Array.isArray(genres)) {
        filter['profile.genres'] = { $all: genres };
      } else {
        filter['profile.genres'] = genres;
      }
    }

    const totalCount = await User.countDocuments(filter);

    const users = await User.find(filter)
      .select('-password -__v -integrations.googleRefreshToken')
      .sort({ name: 1 })
      .skip(skip)
      .limit(limitNum);

    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    const filtersApplied = [];
    if (campus) filtersApplied.push(`at ${campus} campus`);
    if (skillLevel) filtersApplied.push(`with ${skillLevel} skill level`);
    if (instruments) filtersApplied.push(`who play ${Array.isArray(instruments) ? instruments.join(', ') : instruments}`);
    if (genres) filtersApplied.push(`interested in ${Array.isArray(genres) ? genres.join(', ') : genres}`);

    if (users.length === 0) {
      const message = filtersApplied.length > 0
        ? `No users named "${name}" found ${filtersApplied.join(' and ')}`
        : `No users found with name containing "${name}"`;
      
      return res.status(200).json({ 
        message,
        searchQuery: name,
        filtersApplied: filtersApplied.length > 0 ? filtersApplied : null,
        pagination: {
          totalCount: 0,
          totalPages: 0,
          currentPage: pageNum,
          limit: limitNum,
          hasNextPage: false,
          hasPrevPage: false
        },
        users: [] 
      });
    }

    res.status(200).json({
      searchQuery: name,
      filtersApplied: filtersApplied.length > 0 ? filtersApplied : null,
      pagination: {
        totalCount,
        totalPages,
        currentPage: pageNum,
        limit: limitNum,
        hasNextPage,
        hasPrevPage
      },
      count: users.length,
      users
    });

  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ 
      error: 'Failed to search users', 
      details: error.message 
    });
  }
};
