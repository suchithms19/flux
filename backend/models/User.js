const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  picture: String,
  role: {
    type: String,
    enum: ['student', 'mentor', 'admin'],
    default: 'student'
  },
  mentorStatus: {
    type: String,
    enum: ['none', 'pending', 'approved', 'rejected'],
    default: 'none'
  },
  balance: {
    type: Number,
    default: 10,
    min: [0, 'Balance cannot be negative'],
    validate: {
      validator: function(v) {
        return v >= 0;
      },
      message: 'Insufficient balance'
    }
  },
  sessionsAttended: {
    type: Number,
    default: 0
  },
  recentSessions: [{
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mentor'
    },
    date: Date,
    duration: Number,
    topic: String
  }],

  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema); 