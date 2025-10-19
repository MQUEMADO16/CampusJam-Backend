const express = require('express');
const app = express();
const mongoose = require('mongoose');

const User = require('./src/models/user.model');
const JamSession = require('./src/models/session.model'); 
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {                 // Connects to mondo db
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// GET endpoint to pull up an user's activity (joined/hosted sessions)
app.get('/api/users/:id/activity', async (req, res) => {
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
    const hostedSessions = await JamSession.find({ host: id })
      .populate('attendees', 'name email')
      .populate('invitedUsers', 'name email')
      .sort({ startTime: -1 });

    // Fetch user's joined sessions
    const joinedSessions = await JamSession.find({ attendees: id })
      .populate('host', 'name email')
      .sort({ startTime: -1 });

    // Fetch sessions they're invited to
    const invitedSessions = await JamSession.find({ invitedUsers: id })
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
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
