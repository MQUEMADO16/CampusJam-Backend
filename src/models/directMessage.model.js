const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * @desc   Defines schema for direct messages (DM) between two users.
 */
const directMessageSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: [true, 'Message content is required.'],
    trim: true,
    maxlength: 2000,
  },
  read: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Index for faster queries when retrieving conversation history
// This helps find messages between two specific users quickly
directMessageSchema.index({ sender: 1, recipient: 1, createdAt: 1 });

const DirectMessage = mongoose.model('DirectMessage', directMessageSchema);
module.exports = DirectMessage;