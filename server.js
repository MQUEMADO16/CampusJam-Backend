require('dotenv').config();
const app = require('./src/app');

// ----------------------------------------------------------------
// ## NEW ENDPOINT ##
// POST: Block a user
// ----------------------------------------------------------------
app.post('/api/users/:id/block', (req, res) => {
    const { id: userId } = req.params;
    const { blockId } = req.body; // The ID of the user to block

    // Content validation
    if (!blockId) {
        return res.status(400).json({ error: 'Missing blockId in request body.' });
    }

    if (userId === blockId) {
        return res.status(400).json({ error: 'Users cannot block themselves.' });
    }

    const user = users.find(u => u.id === userId);
    const userToBlock = users.find(u => u.id === blockId);

    if (!user || !userToBlock) {
        return res.status(404).json({ error: 'One or more users not found.' });
    }

    // Check if the user is already blocked
    if (user.blockedUsers.includes(blockId)) {
        return res.status(409).json({ error: 'This user is already blocked.' });
    }

    // Add the user to the block list
    user.blockedUsers.push(blockId);

    // --- Business Logic: Remove friendship upon blocking ---
    // Remove the blocked user from the current user's friend list
    user.friends = user.friends.filter(friendId => friendId !== blockId);
    // Remove the current user from the blocked user's friend list
    userToBlock.friends = userToBlock.friends.filter(friendId => friendId !== userId);

    res.status(200).json({
        message: `User ${userToBlock.name} has been successfully blocked.`,
        user: user
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
