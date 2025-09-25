const express = require('express');
const app = express();
app.use(express.json());

// temp array to act as database
let users = [];

// Put your endpoints here

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));