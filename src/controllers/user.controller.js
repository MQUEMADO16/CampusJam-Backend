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
