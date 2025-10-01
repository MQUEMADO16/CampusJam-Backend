// Imports
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
const mongoose = require('mongoose');

// Configure .env database URI
dotenvExpand.expand(dotenv.config());
const dbURI = process.env.MONGO_URI;

// Open connection
const connectDB = async () => {
    try {
        await mongoose.connect(dbURI, {
            // currently deprecated: useNewUrlParser: true,
            // currently deprecated: useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully!');
    }
    catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
};

const closeDB = async () => {
    try {
        await mongoose.disconnect();
        console.log('MongoDB connection closed!');
    } catch (err) {
        console.error('Error while closing MongoDB connection:', err.message);
    }
};

module.exports = connectDB;
module.exports = closeDB;