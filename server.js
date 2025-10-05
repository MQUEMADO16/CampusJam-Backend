require('dotenv').config();
const app = require('./src/app');

app.get('/api/users', (req, res) => {
    res.status(200).json(users);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
