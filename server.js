const express = require('express');
const app = express();
app.use(express.json());

// temp array to act as database
let users = [];


// GET endpoint: get all currrent users
app.get('/api/users', (req, res) => 
    {
        res.json(users);
    });

// PATCH endpoint: update a user's info
app.patch('/api/users/:email', (req, res) => {
  const { email } = req.params;
  const { name, dob } = req.body;

  //Locate the correct user
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  //Update the fields requested
  if (name) user.name = name;
  if (dob) user.dob = dob;

  res.json(user);
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));