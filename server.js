require('dotenv').config();
const app = require('./src/app');

// ----------------------------------------------------------------
// ## NEW ENDPOINT ##
// GET: View all of a user's friends
// ----------------------------------------------------------------
app.get('/api/users/:id/friends', (req, res) => {
    const { id } = req.params;
    const user = users.find(u => u.id === id);

    if (!user) {
        return res.status(404).json({ error: 'User not found.' });
    }

    // Map friend IDs to full user objects for a richer response
    const friendDetails = user.friends.map(friendId => {
        const friend = users.find(u => u.id === friendId);
        // Return a simplified friend object to avoid sending sensitive data
        return { id: friend.id, name: friend.name };
    }).filter(friend => friend); // Filter out any potential nulls if a user was deleted

    res.status(200).json(friendDetails);
});

// ----------------------------------------------------------------
// ## NEW ENDPOINT ##
// GET: View all users a user has blocked
// ----------------------------------------------------------------
app.get('/api/users/:id/list/block', (req, res) => {
    const { id } = req.params;
    const user = users.find(u => u.id === id);

    if (!user) {
        return res.status(404).json({ error: 'User not found.' });
    }

    // Map blocked user IDs to full user objects
    const blockedUserDetails = user.blockedUsers.map(blockedId => {
        const blockedUser = users.find(u => u.id === blockedId);
        return { id: blockedUser.id, name: blockedUser.name };
    }).filter(user => user);

    res.status(200).json(blockedUserDetails);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
