const express = require('express');
const app = express();
app.use(express.json());

app.get('/api/users/subscription', async (req, res) => {
  try {
    const userId = req.userId || req.user?._id || req.query.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated or user ID missing' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.subscription || !user.subscription.tier) {
      return res.status(404).json({ message: 'No subscription tier found for this user' });
    }

    res.status(200).json({
      userId: user._id,
      subscription: user.subscription
    });
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    res.status(500).json({ error: 'Failed to fetch user subscription', details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));