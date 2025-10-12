const Session = require('../models/session.model');

// implement endpoint logic here

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
