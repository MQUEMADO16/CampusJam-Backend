require('dotenv').config();
const app = require('./src/app');

// ----------------------------------------------------------------
// ## NEW ENDPOINT ##
// PUT: Update a user's password
// ----------------------------------------------------------------
app.put('/api/users/:id/change-password', (req, res) => {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Validate request body
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Request must include currentPassword and newPassword.' });
    }

    const user = users.find(u => u.id === id);

    if (!user) {
        return res.status(404).json({ error: 'User not found.' });
    }

    // Verify the current password
    if (user.password !== currentPassword) {
        return res.status(401).json({ error: 'Unauthorized: Incorrect current password.' });
    }

    // Update to the new password
    user.password = newPassword;

    res.status(200).json({ message: 'Password updated successfully.' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
