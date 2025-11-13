const { google } = require('googleapis');
const { oauth2Client } = require('../config/google');
const User = require('../models/user.model');

/**
 * Fetches all calendar events from the user's primary Google Calendar.
 */
exports.getCalendarEvents = async (req, res) => {
  try {
    // 1. Get the user from the database
    const user = await User.findById(req.user.id);

    // 2. Check if they have a Google token
    if (!user || !user.googleRefreshToken) {
      return res.status(400).json({ message: 'Google account not linked.' });
    }

    // 3. Set the refresh token on the OAuth2 client
    oauth2Client.setCredentials({
      refresh_token: user.googleRefreshToken,
    });

    // 4. Get a new access token
    const { token: accessToken } = await oauth2Client.getAccessToken();

    // 5. Initialize the Google Calendar API
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // 6. Fetch events
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: (new Date()).toISOString(), // From now...
      maxResults: 50,                     // ...fetch the next 50 events
      singleEvents: true,                 // Show recurring events as single instances
      orderBy: 'startTime',
    });

    const events = response.data.items;
    
    // 7. Send the events back
    res.status(200).json(events);

  } catch (error) {
    console.error('Failed to fetch Google Calendar events:', error);
    res.status(500).json({ message: 'Failed to fetch calendar events.' });
  }
};