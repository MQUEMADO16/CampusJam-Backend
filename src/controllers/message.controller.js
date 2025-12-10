const mongoose = require('mongoose');
const DirectMessage = require('../models/directMessage.model');
const SessionMessage = require('../models/sessionMessage.model');
const User = require('../models/user.model');
const JamSession = require('../models/session.model');

exports.getConversations = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized.' });

    const userIdString = req.user._id || req.user.id;
    const currentUserId = new mongoose.Types.ObjectId(userIdString);

    const conversations = await DirectMessage.aggregate([
      { $match: { $or: [{ sender: currentUserId }, { recipient: currentUserId }] } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: { $cond: [{ $eq: ['$sender', currentUserId] }, '$recipient', '$sender'] },
          lastMessage: { $first: '$$ROOT' },
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
      { $unwind: '$otherUser' },
      {
        $project: {
          _id: 0,
          otherUser: { _id: '$otherUser._id', name: '$otherUser.name', email: '$otherUser.email' },
          lastMessage: {
            content: '$lastMessage.content',
            createdAt: '$lastMessage.createdAt',
            read: '$lastMessage.read',
            sender: '$lastMessage.sender',
          },
        },
      },
      { $sort: { 'lastMessage.createdAt': -1 } },
    ]);

    res.status(200).json({ message: 'SUCCESS: Conversations retrieved.', conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Server error while fetching conversations.', error: error.message });
  }
};

exports.getDirectMessages = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized: User info missing.' });

    const currentUserId = req.user._id || req.user.id;
    const otherUserId = req.params.userId;
    if (!otherUserId) return res.status(400).json({ message: 'FAIL: User ID is required to fetch conversation.' });

    const messages = await DirectMessage.find({
      $or: [
        { sender: currentUserId, recipient: otherUserId },
        { sender: otherUserId, recipient: currentUserId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'name email profile.avatar')
      .populate('recipient', 'name email profile.avatar');

    res.status(200).json({ message: 'SUCCESS: Conversation retrieved.', messages });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ message: 'Server error while fetching conversation.', error: error.message });
  }
};

exports.sendDirectMessage = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized: User info missing.' });

    const senderId = req.user._id || req.user.id;
    if (!senderId) return res.status(401).json({ message: 'Unauthorized: Sender ID missing.' });

    const { recipientId, content } = req.body;
    if (!recipientId || !content) return res.status(400).json({ message: 'FAIL: Recipient ID and content are required.' });

    if (senderId.toString() === recipientId.toString())
      return res.status(400).json({ message: 'FAIL: You cannot send a message to yourself.' });

    const recipientExists = await User.exists({ _id: recipientId });
    if (!recipientExists) return res.status(404).json({ message: 'FAIL: Recipient user not found.' });

    // Save message
    const newMessage = new DirectMessage({ sender: senderId, recipient: recipientId, content });
    const saved = await newMessage.save();

    // Populate sender & recipient after saving
    const populated = await DirectMessage.findById(saved._id)
      .populate('sender', 'name email profile.avatar')
      .populate('recipient', 'name email profile.avatar')
      .lean()
      .exec();

    // Emit to recipient and sender
    const io = req.io;
    if (io) {
      const payload = {
        _id: populated._id,
        content: populated.content,
        createdAt: populated.createdAt,
        read: false,
        sender: {
          _id: populated.sender._id,
          name: populated.sender.name,
          email: populated.sender.email,
          avatar: populated.sender?.profile?.avatar || null,
        },
        recipient: {
          _id: populated.recipient._id,
          name: populated.recipient.name,
          email: populated.recipient.email,
        },
      };

      io.to(recipientId.toString()).emit('receive_message', payload);
      io.to(senderId.toString()).emit('message_sent', payload);
    } else {
      console.warn('Socket IO not available on req.io — skipping emit.');
    }

    res.status(201).json({ message: 'SUCCESS: Message sent successfully.', data: populated });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error while sending message.', error: error.message });
  }
};

/**
 * @desc   Mark all messages from a specific sender as read
 * @route  PUT /api/messages/dm/:senderId/read
 * @access Protected
 */
exports.markAsRead = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    const currentUserId = req.user._id || req.user.id;
    const senderId = req.params.senderId;

    if (!senderId) {
      return res.status(400).json({ message: 'Sender ID is required.' });
    }

    await DirectMessage.updateMany(
      { sender: senderId, recipient: currentUserId, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ message: 'SUCCESS: Messages marked as read.' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      message: 'Server error while marking messages as read.',
      error: error.message,
    });
  }
};

exports.getSessionMessages = async (req, res) => {
  try {
    const sessionId = req.params.sessionId || req.params.id;
    if (!sessionId) return res.status(400).json({ message: 'FAIL: Session ID is required.' });

    const messages = await SessionMessage.find({ session: sessionId })
      .select('content sender createdAt')
      .populate('sender', 'name email')
      .sort({ createdAt: 1 });

    res.status(200).json({ message: 'SUCCESS: Session messages retrieved.', messages });
  } catch (error) {
    console.error('Error fetching session messages:', error);
    res.status(500).json({ message: 'Server error while fetching session messages.' });
  }
};

exports.sendSessionMessage = async (req, res) => {
  try {
    const sessionId = req.params.sessionId || req.params.id;
    const senderId = req.user._id;
    const { content } = req.body;

    if (!sessionId || !content) return res.status(400).json({ message: 'FAIL: Session ID and content are required.' });

    const sessionExists = await JamSession.exists({ _id: sessionId });
    if (!sessionExists) return res.status(404).json({ message: 'FAIL: Session not found.' });

    const message = new SessionMessage({ session: sessionId, sender: senderId, content });
    const savedMessage = await message.save();

    await savedMessage.populate('sender', 'name email');

    res.status(201).json({ message: 'SUCCESS: Message sent successfully.', data: savedMessage });
  } catch (error) {
    console.error('Error sending session message:', error);
    res.status(500).json({ message: 'Server error while sending session message.', error: error.message });
  }
};
