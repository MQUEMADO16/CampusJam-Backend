const express = require('express');
const app = express();
app.use(express.json());

// pseudo database for listed sessions
let sessions_db = [];

//Get endpoint to retrieve all sessions
app.get('/api/sessions', (req, res) => 
    {
        res.json(sessions_db);
    });

// POST endpoint: Create a new user
app.post('/api/sessions', (req, res) => {
  const { host, name, datetime, location } = req.body;

  // Basic validation
  if (!host || !name || !datetime || !location) {
    return res.status(400).json({ error: 'You need a name, date, time and location to post your session!' });
  }

  // Create a new session
  const newSesh = 
  {
    id: sessions_db.length + 1, // simple auto-increment ID
    host,
    name,
    datetime,
    location
  };

  // Save to our "database"
  sessions_db.push(newSesh);

  // Respond with 201 Created and the new session
  res.status(201).json(newSesh);
});
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));