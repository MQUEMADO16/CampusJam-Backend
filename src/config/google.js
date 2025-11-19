// config/google.js
const { google } = require('googleapis');
require('dotenv').config();

// Create the OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Define the scopes (what you want to access)
const scopes = [
  'https://www.googleapis.com/auth/calendar' // Full read/write access to calendars
];

module.exports = {
  oauth2Client,
  scopes,
  google // Export the main google object
};