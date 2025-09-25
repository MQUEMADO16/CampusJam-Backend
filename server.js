const express = require('express');
const app = express();
app.use(express.json());

// temp array to act as database
let users = [];

// POST endpoint: Create a new user
app.post('/api/users', (req, res) => {
  const { name, email, dob } = req.body;

  // Basic validation
  if (!name || !email || !dob) {
    return res.status(400).json({ error: 'Name, email, and dob are required' });
  }

  // Create a new user object
  const newUser = 
  {
    id: users.length + 1, // simple auto-increment ID
    name,
    email,
    dob
  };

  // Save to our "database"
  users.push(newUser);

  // Respond with 201 Created and the new user
  res.status(201).json(newUser);
});
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
