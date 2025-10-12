const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * @desc   Defines schema for chat messages within Jam Sessions
 */
const messageSchema = new Schema({
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

const Message = mongoose.model('Message', messageSchema, 'messages');
module.exports = Message;
