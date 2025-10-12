const JamSession = require('../models/session.model');
const Message = require('../models/message.model'); // import your new model

/**
 * @desc   Get all messages for a specific session
 * @route  GET /api/sessions/:id/messages
 */
exports.getSessionMessages = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: 'FAIL: Session ID is required.',
      });
    }

    const messages = await Message.find({ session: id })
      .select('content sender createdAt') 
      .populate('sender', 'name email')
      .sort({ createdAt: 1 }); // oldest first

    if (!messages || messages.length === 0) {
      return res.status(200).json({
        message: 'INFO: No messages found for this session.',
        messages: [],
      });
    }

    const filteredMessages = messages.map(msg => ({
      content: msg.content,
      sender: msg.sender?.name || msg.sender, // sender name (or ID if not populated)
      timeSent: msg.createdAt,
    }));

    res.status(200).json({
      message: 'SUCCESS: Session messages retrieved.',
      messages: filteredMessages,
    });
  } catch (error) {
    console.error('Error fetching session messages:', error);
    res.status(500).json({
      message: 'Server error while fetching session messages.',
    });
  }
};


/**
 * @desc   Send a new message in a specific session
 * @route  POST /api/sessions/:id/messages
 * @body   { senderId, content }
 */
exports.sendSessionMessage = async (req, res) => {
  try {
    const { id } = req.params; // session ID
    const { senderId, content } = req.body;

    if (!id || !senderId || !content) {
      return res.status(400).json({
        message: 'FAIL: session ID, senderId, and content are required fields.',
      });
    }

    // Verify that session exists
    const sessionExists = await JamSession.exists({ _id: id });
    if (!sessionExists) {
      return res.status(404).json({
        message: 'FAIL: Session not found.',
      });
    }

    // Create and save the message
    const message = new Message({
      session: id,
      sender: senderId,
      content,
    });

    const savedMessage = await message.save();

    res.status(201).json({
      message: 'SUCCESS: Message sent successfully.',
      data: savedMessage,
    });
  }
  catch (error) {
    console.error('Error sending session message:', error);
    res.status(500).json({
      message: 'Server error while sending session message.',
    });
  }
};
