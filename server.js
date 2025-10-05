const express = require('express');
const app = express();
app.use(express.json());

// Postman test users.
// Mongo Info

// ----------------------------------------------------------------
// ## NEW ENDPOINT ##
// PUT: Update a user's profile info
// ----------------------------------------------------------------
app.put('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;

    // Find the user in the array
    const user = users.find(u => u.id === id);

    // If user doesn't exist, return 404
    if (!user) {
        return res.status(404).json({ error: 'User not found.' });
    }

    // Content validation: Ensure at least one field is being updated
    if (!name && !email) {
        return res.status(400).json({ error: 'Request body must contain a name or email to update.' });
    }

    // Update user fields if they are provided in the request
    if (name) user.name = name;
    if (email) user.email = email;

    // Respond with a 200 OK status and the updated user object
    res.status(200).json({
        message: 'User profile updated successfully.',
        user: user
    });
});


// ----------------------------------------------------------------
// ## NEW ENDPOINT ##
// DELETE: Delete a user
// ----------------------------------------------------------------
app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;

    // Find the index of the user to delete
    const userIndex = users.findIndex(u => u.id === id);

    // If user doesn't exist, return 404
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found.' });
    }

    
    // Remove the deleted user's ID from all other users' friend lists
    users.forEach(user => {
        const friendIndex = user.friends.indexOf(id);
        if (friendIndex > -1) {
            user.friends.splice(friendIndex, 1);
        }
    });

    // Remove the user from the main users array
    users.splice(userIndex, 1);

    // Respond with a 200 OK status
    res.status(200).json({ message: 'User deleted successfully.' });
});



// POST: Friend a user

app.post('/api/users/:id/friends', (req, res) => {
    const { id: userId } = req.params;
    const { friendId } = req.body;

    // Content validation
    if (!friendId) {
        return res.status(400).json({ error: 'Missing friend ID in request body.' });
    }

    // Find the actual user objects instead of relying on array indexes
    const user = users.find(u => u.id === userId);
    const newFriend = users.find(u => u.id === friendId);

    if (!user || !newFriend) {
        return res.status(404).json({ error: 'User or friend not found.' });
    }

    if (user.friends.includes(friendId)) {
        return res.status(409).json({ error: 'Users are already friends.' });
    }
    
    // Add the new friend to both users' friend lists
    user.friends.push(friendId);
    newFriend.friends.push(userId);

    // Respond with a 200 OK status code
    res.status(200).json({
        message: 'Friend added successfully.',
        user: user,
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
