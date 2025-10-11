// TODO: implement endpoint logic here
exports.getAllUsers = async (req, res) => {
};

exports.createUser = async (req, res) => {
};
const User = require('../models/User');

// Update user
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    if (!name && !email) return res.status(400).json({ error: 'Provide name or email.' });

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();
    res.status(200).json({ message: 'User updated', user });
};

// Add friend
exports.addFriend = async (req, res) => {
    const { id } = req.params;
    const { friendId } = req.body;

    if (!friendId) return res.status(400).json({ error: 'Missing friendId' });

    const user = await User.findById(id);
    const friend = await User.findById(friendId);

    if (!user || !friend) return res.status(404).json({ error: 'User not found' });

    if (user.friends.includes(friendId)) return res.status(409).json({ error: 'Already friends' });

    user.friends.push(friendId);
    friend.friends.push(id);

    await user.save();
    await friend.save();

    res.status(200).json({ message: 'Friend added', user });
};

// Delete user
exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Remove from friends lists
    await User.updateMany(
        { friends: id },
        { $pull: { friends: id } }
    );

    await user.remove();
    res.status(200).json({ message: 'User deleted' });
};
