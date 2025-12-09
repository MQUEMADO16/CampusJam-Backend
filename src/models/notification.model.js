const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true // The user receiving the notification
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true // The user who triggered it (the new friend)
  },
  type: {
    type: String,
    enum: ['follow'], // We strictly limit this to 'follow' for now
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  link: {
    type: String, // Where the user goes when they click (e.g., profile)
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);