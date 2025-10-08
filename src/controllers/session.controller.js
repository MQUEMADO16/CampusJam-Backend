const Session = require('../models/session.model');

// TODO: implement all endpoint logic 

/**
 * @desc Fetch all sessions
 * @route GET /api/sessions
 * Note: might want to not make this publicly available 
 * since this will include private sessions
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
        // Verify user host exists
        /* TODO: this is commented out so we can test insertion
        const hostExists = await User.findById(req.body.host);
        if (!hostExists) {
            return res.status(404).json({ message: 'Host user not found.' });
        }
        */

        const newSession = new Session(req.body);
        await newSession.save();

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