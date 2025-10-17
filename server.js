const express = require('express'); // Server.js
const app = express();
app.use(express.json());            

const mongoose = require('mongoose');
const User = require('./src/models/user.model'); 

mongoose.connect(process.env.MONGO_URI, {         //Connects to MongoDB
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));


// GET endpoint to pull up an user based on their username
app.get('/api/users/search', async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ error: 'Please enter a username' });
    }

    // Build dynamic search filter
    const filter = { name: new RegExp(name, 'i') }; // case-insensitive name search

    const users = await User.find(filter).select('-password'); // exclude password field

    if (users.length === 0) {
      return res.status(404).json({ message: 'No matching user' });
    }

    res.status(200).json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Failed to search users', details: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));