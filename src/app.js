const express = require('express');
const { connectDB } = require('./config/database');
const userRoutes = require('./routes/user.routes');
const sessionRoutes = require('./routes/session.routes');
const messageRoutes = require('./routes/message.routes');

// Init DB connection
connectDB();

const app = express();

// Init Middleware
app.use(express.json());

// Define Routes
app.use('/api', userRoutes);
app.use('/api', sessionRoutes);
app.use('/api', messageRoutes);

module.exports = app; // Export the app