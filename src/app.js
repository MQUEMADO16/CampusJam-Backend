const express = require('express');
const { connectDB } = require('./config/database');
const userRoutes = require('./routes/user.routes');

// Init DB connection
connectDB();

const app = express();

// Init Middleware
app.use(express.json());

// Define Routes
app.use('/api', userRoutes);

module.exports = app; // Export the app