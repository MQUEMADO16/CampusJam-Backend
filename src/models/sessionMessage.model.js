const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * @desc   Defines schema for chat messages within Jam Sessions
 */
const sessionMessageSchema = new Schema({
  session: {
    type: Schema.Types.ObjectId,
    ref: 'JamSession',
    required: true,
  },
  sender: {
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
}, {
  timestamps: true,
});

const SessionMessage = mongoose.model('Message', sessionMessageSchema, 'messages');
module.exports = SessionMessage;
