const DirectMessage = require('../models/directMessage.model');
const SessionMessage = require('../models/sessionMessage.model');
const User = require('../models/user.model');
const JamSession = require('../models/session.model');

// Direct Messaging Controllers (User to User)

/**
 * @desc   Get list of active conversations (inbox)
 * @route  GET /api/messages/conversations
 * @access Protected
 */
exports.getConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const conversations = await DirectMessage.aggregate([
      {
        $match: {
          $or: [{ sender: currentUserId }, { recipient: currentUserId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', currentUserId] },
              '$recipient',
              '$sender',
            ],
          },
          lastMessage: { $first: '$$ROOT' }, // Keep the full last message document
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'otherUser',
        },
      },
      {
        $unwind: '$otherUser',
      },
      {
        $project: {
          _id: 0,
          otherUser: {
            _id: '$otherUser._id',
            name: '$otherUser.name',
            email: '$otherUser.email',
          },
          lastMessage: {
            content: '$lastMessage.content',
            createdAt: '$lastMessage.createdAt',
            read: '$lastMessage.read',
            sender: '$lastMessage.sender',
          },
        },
      },
      {
        $sort: { 'lastMessage.createdAt': -1 },
      },
    ]);

    res.status(200).json({
      message: 'SUCCESS: Conversations retrieved.',
      conversations: conversations,
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      message: 'Server error while fetching conversations.',
      error: error.message,
    });
  }
};

/**
 * @desc   Get chat history between the current user and another user
 * @route  GET /api/messages/dm/:userId
 * @access Protected
 */
exports.getDirectMessages = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.userId;

    if (!otherUserId) {
      return res.status(400).json({
        message: 'FAIL: User ID is required to fetch conversation.',
      });
    }

    const messages = await DirectMessage.find({
      $or: [
        { sender: currentUserId, recipient: otherUserId },
        { sender: otherUserId, recipient: currentUserId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'name email profile.avatar')
      .populate('recipient', 'name email profile.avatar');

    res.status(200).json({
      message: 'SUCCESS: Conversation retrieved.',
      messages: messages,
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({
      message: 'Server error while fetching conversation.',
      error: error.message,
    });
  }
};

/**
 * @desc   Send a direct message to another user
 * @route  POST /api/messages/dm
 * @body   { recipientId, content }
 * @access Protected
 */
exports.sendDirectMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { recipientId, content } = req.body;

    if (!recipientId || !content) {
      return res.status(400).json({
        message: 'FAIL: Recipient ID and content are required.',
      });
    }

    if (senderId.toString() === recipientId) {
      return res.status(400).json({
        message: 'FAIL: You cannot send a message to yourself.',
      });
    }

    const recipientExists = await User.exists({ _id: recipientId });
    if (!recipientExists) {
      return res.status(404).json({
        message: 'FAIL: Recipient user not found.',
      });
    }

    const newMessage = new DirectMessage({
      sender: senderId,
      recipient: recipientId,
      content,
    });

    await newMessage.save();

    const populatedMessage = await newMessage.populate('sender', 'name email profile.avatar');

    res.status(201).json({
      message: 'SUCCESS: Message sent successfully.',
      data: populatedMessage,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      message: 'Server error while sending message.',
      error: error.message,
    });
  }
};

// Session Messaging Controllers (Group Chat)
/**
 * @desc   Get all messages for a specific session
 * @route  GET /api/messages/session/:sessionId
 * @access Protected
 */
exports.getSessionMessages = async (req, res) => {
  try {
    const sessionId = req.params.sessionId || req.params.id;

    if (!sessionId) {
      return res.status(400).json({
        message: 'FAIL: Session ID is required.',
      });
    }

    const messages = await SessionMessage.find({ session: sessionId })
      .select('content sender createdAt')
      .populate('sender', 'name email')
      .sort({ createdAt: 1 });

    res.status(200).json({
      message: 'SUCCESS: Session messages retrieved.',
      messages: messages,
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
 * @route  POST /api/messages/session/:sessionId
 * @body   { content }
 * @access Protected
 */
exports.sendSessionMessage = async (req, res) => {
  try {
    const sessionId = req.params.sessionId || req.params.id;
    const senderId = req.user._id;
    const { content } = req.body;

    if (!sessionId || !content) {
      return res.status(400).json({
        message: 'FAIL: Session ID and content are required.',
      });
    }

    const sessionExists = await JamSession.exists({ _id: sessionId });
    if (!sessionExists) {
      return res.status(404).json({
        message: 'FAIL: Session not found.',
      });
    }

    const message = new SessionMessage({
      session: sessionId,
      sender: senderId,
      content,
    });

    const savedMessage = await message.save();
    
    await savedMessage.populate('sender', 'name email');

    res.status(201).json({
      message: 'SUCCESS: Message sent successfully.',
      data: savedMessage,
    });
  } catch (error) {
    console.error('Error sending session message:', error);
    res.status(500).json({
      message: 'Server error while sending session message.',
      error: error.message,
    });
  }
};