const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  cost: {
    type: Number,
    default: 0
  },
  metadata: {
    type: {
      type: String,
      enum: ['text', 'image', 'file'],
      default: 'text'
    },
    fileName: String,
    fileSize: Number,
    fileUrl: String,
    mimeType: String
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for faster queries
messageSchema.index({ session: 1, createdAt: 1 });
messageSchema.index({ sender: 1 });

const Message = mongoose.model('Message', messageSchema);
module.exports = Message; 