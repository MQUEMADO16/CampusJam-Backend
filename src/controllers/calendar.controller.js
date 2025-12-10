const { google } = require('googleapis');
const { oauth2Client } = require('../config/google');
const User = require('../models/user.model');
const Session = require('../models/session.model');
/**
 * Fetches all calendar events from the user's primary Google Calendar.
 */
exports.getCalendarEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId)
      .select('+integrations.googleRefreshToken');

    if (!user || !user.integrations?.googleRefreshToken) {
      return res.status(400).json({ message: 'Google account not linked.' });
    }

    oauth2Client.setCredentials({
      refresh_token: user.integrations.googleRefreshToken,
    });
    
    await oauth2Client.getAccessToken();

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: (new Date()).toISOString(),
      maxResults: 50,
      singleEvents: true,
      orderBy: 'startTime',
    });

    res.status(200).json(response.data.items);

  } catch (error) {
    console.error('Failed to fetch Google Calendar events:', error);
    // Handle specific auth errors
    if (error.code === 400 || error.code === 401 || error.message.includes('invalid_grant')) {
       return res.status(401).json({ message: 'Google Calendar link expired. Please reconnect in settings.' });
    }
    res.status(500).json({ message: 'Failed to fetch calendar events.' });
  }
};

/**
 * Finds a session by ID and adds it to the user's Google Calendar.
 */
exports.addSessionToCalendar = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id; // From authMiddleware

    // 1. Find the session details
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }

   const user = await User.findById(userId)
  .select('+integrations.googleRefreshToken');

if (!user || !user.integrations?.googleRefreshToken) {
  return res.status(400).json({ message: 'Google account not linked.' });
}

await createCalendarEvent(user.integrations.googleRefreshToken, session);


    res.status(201).json({ message: 'Event added to your Google Calendar!' });

  } catch (error) {
    console.error('Failed to add session to Google Calendar:', error);
    res.status(500).json({ message: 'Failed to add event to calendar.' });
  }
};

/**
 * Creates a new Google Calendar event.
 * (This is a helper function, not exported)
 */
async function createCalendarEvent(refreshToken, session) {
  try {
    // 1. Set the refresh token on the OAuth2 client
    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    // 2. Get a new access token
    const { token: accessToken } = await oauth2Client.getAccessToken();

    // 3. Initialize the Google Calendar API
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // 4. Define the calendar event resource
    const event = {
      summary: session.title,
      description: session.description,
      start: {
        dateTime: session.startTime, // Assumes this is an ISO 8601 string
        timeZone: 'America/New_York',
      },
      end: {
        dateTime: session.endTime, // Assumes this is an ISO 8601 string
        timeZone: 'America/New_York',
      },
    };

    // 5. Insert the event
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });

    console.log('Google Calendar event created:', response.data.htmlLink);

  } catch (error) {
    console.error('Failed to create Google Calendar event:', error.message);
  }
}