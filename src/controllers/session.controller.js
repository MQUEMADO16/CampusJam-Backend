const mongoose = require('mongoose');
const Session = require('../models/session.model');
const User = require('../models/user.model');
const { google } = require('googleapis');
const { oauth2Client } = require('../config/google');

// TODO: implement all endpoint logic

/**
 * @desc Fetch all sessions
 * @route GET /api/sessions
 * Note: Only gets public sessions
 */
exports.getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ isPublic: true })
      .select('-chatMessages -__v') // Exclude chat and version key
      .populate('host', 'name profile.skillLevel'); // Populate host with only their name and skill level - don't want to include other info for now

    res.status(200).json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ message: 'Server error while fetching sessions.' });
  }
};

/**
 * @desc Create a new session
 * @route POST /api/sessions
 */
exports.createSession = async (req, res) => {
  try {
    // 1. Get the host's ID securely from your auth middleware
    const hostId = req.user.id; 

    // 2. Create the session object
    const newSession = new Session({
      ...req.body, // Spread the form data (title, description, startTime, etc.)
      host: hostId  // Explicitly set the host to the logged-in user
    });

    // 3. Save the new session
    await newSession.save();

    // 4. Try to add it to Google Calendar
    try {
const user = await User.findById(hostId)
  .select('+integrations.googleRefreshToken');

if (user && user.integrations?.googleRefreshToken) {
  console.log('User has Google token. Attempting to create calendar event...');
  createCalendarEvent(user.integrations.googleRefreshToken, newSession);
} else {
  console.log('User does not have Google token. Skipping calendar sync.');
}

    } catch (calendarError) {
      console.error('Error during calendar sync check:', calendarError);
    }

    // 5. Send the successful response
    res.status(201).json({
      message: 'Session created successfully!',
      session: newSession,
    });
  }
  catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({
      message: 'Server error while creating session.',
      error: error.message,
    });
  }
};

/**
 * @desc    Get a single session by its ID
 * @route   GET /api/sessions/:id
 */
exports.getSessionById = async (req, res) => {
  try {
    const sessionId = req.params.id;

    const session = await Session.findById(sessionId)
      .select('-chatMessages -__v')
      .populate('host', '-password -__v') // Populate host, exclude sensitive fields
      .populate('attendees.user', '-password -__v');

    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    res.status(200).json(session);
  } catch (error) {
    console.error('Error fetching session by ID:', error);
    res.status(500).json({ message: 'Server error while fetching session.' });
  }
};

/**
 * @desc  Update a session by its ID
 * @route PUT /api/sessions/:id
 */
exports.updateSession = async (req, res) => {
  try {
    const sessionId = req.params.id;
    const updateData = req.body;

    const updatedSession = await Session.findByIdAndUpdate(
    sessionId,
    updateData,
    { new: true, runValidators: true } // Options: return the new doc, run schema validators
    ).select('-chatMessages -__v');

    if (!updatedSession) {
    return res.status(404).json({ message: 'Session not found.' });
    }

    res.status(200).json({
    message: 'Session updated successfully.',
    session: updatedSession
    });
  }
  catch (error) {
    console.error('Error updating session by ID: ', error);
    res.status(500).json({ message: 'Server error while updating session.' });
  }
};

/**
 * @desc  Delete a session by its ID
 * @route DELETE /api/sessions/:id
 */
exports.deleteSessionById = async (req, res) => {
    try {
    const sessionId = req.params.id;

    const session = await Session.findByIdAndDelete(sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    res.status(200).json({ message: 'Session deleted successfully.' });
    }
    catch (error) {
        console.error('Erorr deleting session by ID: ', error);
        res.status(500).json({ message: 'Server error while deleting session.' });
    }
};

/**
 * @desc Get all users in a session by session ID
 * @route GET /api/sessions/:id/participants
 */
exports.getSessionParticipants = async (req, res) => {
  try {
    const sessionId = req.params.id;

    // Find the session and populate the 'user' field within the 'attendees' array
    const session = await Session.findById(sessionId)
      .select('attendees')
      .populate({
        path: 'attendees.user',
        select: '-password -__v'
      });

    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    const participants = session.attendees;

    res.status(200).json(participants);
  }
  catch (error) {
    console.error('Error fetching session participants:', error);
    res.status(500).json({ message: 'Server error while fetching participants.' });
  }
};

/**
 * @desc Add a user to a session's attendees list
 * @route POST /api/sessions/:id/participants
 */
exports.addUserToSession = async (req, res) => {
  try {
    const { id: sessionId } = req.params;
    const { userId } = req.body;

    // Validate the format of the provided IDs before querying the database.
    if (!mongoose.Types.ObjectId.isValid(sessionId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid session or user ID format.' });
    }

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    if (session.attendees.some(attendee => attendee.equals(userId))) {
      return res.status(400).json({ message: 'User is already in the session.' });
    }

    session.attendees.push(userId);
    await session.save();

    res.status(200).json({
      message: 'User added to session successfully.',
      attendees: session.attendees
    });
  } catch (error) {
    console.error('Error adding user to session:', error);
    res.status(500).json({ message: 'Server error while adding user to session.' });
  }
};

/**
 * @desc Remove a user from a session's attendees list
 * @route DELETE /api/sessions/:id/participants/:userId
 */
exports.removeUserFromSession = async (req, res) => {
  try {
    const { id: sessionId, userId } = req.params;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(sessionId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid session or user ID format.' });
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }

    // Find attendee index (ObjectIds directly)
    const attendeeIndex = session.attendees.findIndex(attendee => attendee.equals(userId));

    if (attendeeIndex === -1) {
      return res.status(404).json({ message: 'User is not in this session.' });
    }

    session.attendees.splice(attendeeIndex, 1);
    await session.save();

    res.status(200).json({
      message: 'User removed from session successfully.',
      attendees: session.attendees
    });
  } catch (error) {
    console.error('Error removing user from session:', error);
    res.status(500).json({ message: 'Server error while removing user from session.' });
  }
};

/**
 * @desc   Get visibility state of a specific session
 * @route  GET /api/sessions/:id/visibility
 */
exports.getVisibility = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: 'FAIL: Session ID is required.',
      });
    }

    const session = await Session.findById(id).select('isPublic');

    if (!session) {
      return res.status(404).json({
        message: 'FAIL: Session not found.',
      });
    }

    res.status(200).json({
      visibility: session.isPublic,
    });
  } catch (error) {
    console.error('Error fetching session visibility: ', error);
    res.status(500).json({
      message: 'Server error while fetching session visibility.',
    });
  }
};

/**
 * @desc   Set session visibility (public/private)
 * @route  POST /api/sessions/visibility
 * @body   { sessionId, isPublic }
 */
exports.setVisibility = async (req, res) => {
  try {
    const { sessionId, isPublic } = req.body;

    if (!sessionId || typeof isPublic !== 'boolean') {
      return res.status(400).json({
        message: 'FAIL: sessionId and isPublic are required fields.',
      });
    }

    const session = await Session.findByIdAndUpdate(
      sessionId,
      { isPublic },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({
        message: 'FAIL: Session not found.',
      });
    }

    res.status(200).json({
      message: 'SUCCESS: Session visibility updated.',
    });
  }
  catch (error) {
    console.error('Error setting session visibility: ', error);
    res.status(500).json({
      message: 'Server error while setting session visibility.',
    });
  }
};

/**
 * @desc   Update session visibility
 * @route  PUT /api/sessions/visibility
 * @body   { sessionId, isPublic }
 */
exports.updateVisibility = async (req, res) => {
  try {
    const { sessionId, isPublic } = req.body;

    if (!sessionId || typeof isPublic !== 'boolean') {
      return res.status(400).json({
        message: 'FAIL: sessionId and isPublic are required fields.',
      });
    }

    const session = await Session.findByIdAndUpdate(
      sessionId,
      { isPublic },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({
        message: 'FAIL: Session not found.',
      });
    }

    res.status(200).json({
      message: 'SUCCESS: Session visibility updated.',
    });
  }
  catch (error) {
    console.error('Error updating session visibility: ', error);
    res.status(500).json({
      message: 'Server error while updating session visibility.',
    });
  }
};

/**
 * @desc   Mark a session as complete (Finished)
 * @route  POST /api/sessions/:id/complete
 */
exports.markComplete = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await Session.findByIdAndUpdate(
      id,
      { status: 'Finished', endTime: new Date() },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({
        message: 'FAIL: Session not found.',
      });
    }

    res.status(200).json({
      message: 'SUCCESS: Session marked as complete.',
      session,
    });
  }
  catch (error) {
    console.error('Error marking session complete: ', error);
    res.status(500).json({
      message: 'Server error while marking session complete.',
    });
  }
};

/**
 * @desc   Get all active sessions (status = 'Ongoing')
 * @route  GET /api/sessions
 */
exports.getActiveSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ status: 'Ongoing' }).sort({ startTime: 1 });
    res.status(200).json(sessions);
  }
  catch (error) {
    console.error('Error fetching active sessions: ', error);
    res.status(500).json({
      message: 'Server error while fetching active sessions.',
    });
  }
};

/**
 * @desc   Get all upcoming sessions (status = 'Scheduled')
 * @route  GET /api/sessions/upcoming
 */
exports.getUpcomingSessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      status: 'Scheduled',
      startTime: { $gte: new Date() },
    }).sort({ startTime: 1 });

    res.status(200).json(sessions);
  }
  catch (error) {
    console.error('Error fetching upcoming sessions: ', error);
    res.status(500).json({
      message: 'Server error while fetching upcoming sessions.',
    });
  }
};

/**
 * @desc   Get all past/completed sessions (status = 'Finished')
 * @route  GET /api/sessions/past
 */
exports.getPastSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ status: 'Finished' }).sort({ endTime: -1 });
    res.status(200).json(sessions);
  }
  catch (error) {
    console.error('Error fetching past sessions: ', error);
    res.status(500).json({
      message: 'Server error while fetching past sessions.',
    });
  }
};

/**
 * @desc Get all sessions for the logged-in user (hosted and joined)
 * @route GET /api/sessions/my-sessions
 */
exports.getUserSessions = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find sessions the user hosts
    const hostedSessions = await Session.find({ host: userId })
      .select('-chatMessages -__v')
      .populate('host', 'name profile.skillLevel');

    // Find sessions the user has joined (is an attendee)
    const joinedSessions = await Session.find({ attendees: userId })
      .select('-chatMessages -__v')
      .populate('host', 'name profile.skillLevel');

    res.status(200).json({ hostedSessions, joinedSessions });
  } catch (error)
 {
    console.error('Error fetching user sessions:', error);
    res.status(500).json({ message: 'Server error while fetching user sessions.' });
  }
};

/**
 * Creates a new Google Calendar event.
 * @param {string} refreshToken - The user's Google refresh token.
 * @param {object} session - The session object from your database.
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
        dateTime: session.startTime, // Uses the date from the form
        timeZone: 'America/New_York', // You can make this dynamic later
      },
      end: {
        dateTime: session.endTime, // Uses the date from the form
        timeZone: 'America/New_York',
      },
    };

    // 5. Insert the event
    const response = await calendar.events.insert({
      calendarId: 'primary', // 'primary' means the user's main calendar
      resource: event,
    });

    console.log('Google Calendar event created:', response.data.htmlLink);

  } catch (error) {
    // We log the error but don't stop the main 'createSession' from working
    console.error('Failed to create Google Calendar event:', error.message);
  }
}
