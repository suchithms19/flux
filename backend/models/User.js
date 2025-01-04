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
    enum: ['pending', 'approved', 'rejected', 'not_applied'],
    default: 'not_applied'
  },
  mentorProfile: {
    expertise: [String],
    bio: String,
    hourlyRate: Number,
    experience: String,
    availability: {
      type: Map,
      of: [String]
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema); 