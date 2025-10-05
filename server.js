require('dotenv').config();
const app = require('./src/app');

// ----------------------------------------------------------------
// ## NEW ENDPOINT ##
// GET: Get all notifications for a specific user
// ----------------------------------------------------------------
app.get('/api/users/:id/notifications', (req, res) => {
    const { id } = req.params;
    // Correctly find the user by their ID property
    const user = users.find(u => u.id === id);

    if (!user) {
        return res.status(404).json({ error: 'User not found.' });
    }

    res.status(200).json({
        userId: user.id,
        notifications: user.notifications
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
