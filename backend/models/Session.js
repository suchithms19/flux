const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  ratePerBlock: {
    type: Number,
    required: true,
    min: 0
  },
  totalCost: {
    type: Number,
    default: 0
  },
  metadata: {
    topic: String,
    description: String,
    additionalInfo: mongoose.Schema.Types.Mixed
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update lastActivity when the session is modified
sessionSchema.pre('save', function(next) {
  this.lastActivity = new Date();
  next();
});

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session; 