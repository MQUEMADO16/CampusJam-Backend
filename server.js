const express = require('express');
const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// ---------------------------------------------
// User Model (inline for simplicity)
// ---------------------------------------------
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
});

const User = mongoose.model('User', userSchema);

app.get('/api/users/search', async (req, res) => {
  try {
    const { name, email } = req.query;

    if (!name && !email) {
      return res.status(400).json({ error: 'Please enter a name or email' });
    }

    // Build dynamic search filter
    const filter = {};
    if (name) filter.name = new RegExp(name, 'i');   
    if (email) filter.email = new RegExp(email, 'i');

    const users = await User.find(filter);

    if (users.length === 0) {
      return res.status(404).json({ message: 'No results' });
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