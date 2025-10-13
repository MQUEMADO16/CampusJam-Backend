const express = require('express');
const app = express();
const User = require('./src/models/user.model');
app.use(express.json());

app.get('/api/users/:id/activity', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.activities || user.activities.length === 0) {
      return res.status(404).json({ message: 'No activity from this user' });
    }

    res.status(200).json({ userId: user._id, activity: user.activities });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ error: 'Failed to fetch user activity', details: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));