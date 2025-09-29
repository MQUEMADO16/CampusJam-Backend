const express = require('express');
const app = express();
app.use(express.json());

// temp array to act as database
let users = [];

// POST: Friend a user
app.post('/api/users/:id/friends', (req, res) => {

    // Get data from request body
    const { id: userId } = req.params;
    const { friendId } = req.body;

    // Content validation
    if (!friendId) {
        return res.status(400).json({ error: 'Missing friend ID in request body.' });
    }

    const user = users[userId];
    const newFriend = users[friendId];

    if (!user || !newFriend) {
        return res.status(404).json({ error: 'User or friend not found.' });
    }

    if (user.friends.includes(friendId)) {
        return res.status(409).json({ error: 'Users are already friends.' });
    }

    // If valid, post new friend into list of friends of the user

    // Add the new friend to both lists
    user.friends.push(friendId);
    newFriend.friends.push(userId);

    // Respond with a 200 OK status code
    res.status(200).json({
    message: 'Friend added successfully.',
    user: { id: userId, ...user },
  });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));