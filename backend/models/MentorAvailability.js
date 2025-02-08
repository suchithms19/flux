const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  start: {
    type: String,
    required: true,
    // Format: "HH:mm" (24-hour)
    validate: {
      validator: function(v) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: props => `${props.value} is not a valid time format! Use HH:mm`
    }
  },
  end: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: props => `${props.value} is not a valid time format! Use HH:mm`
    }
  }
});

const mentorAvailabilitySchema = new mongoose.Schema({
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  schedule: {
    monday: [timeSlotSchema],
    tuesday: [timeSlotSchema],
    wednesday: [timeSlotSchema],
    thursday: [timeSlotSchema],
    friday: [timeSlotSchema],
    saturday: [timeSlotSchema],
    sunday: [timeSlotSchema]
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  timezone: {
    type: String,
    default: 'UTC'
  }
}, {
  timestamps: true
});

// Validate that end time is after start time
timeSlotSchema.pre('save', function(next) {
  const start = new Date(`1970-01-01T${this.start}`);
  const end = new Date(`1970-01-01T${this.end}`);
  
  if (end <= start) {
    next(new Error('End time must be after start time'));
  }
  next();
});

// Update lastSeen when mentor goes offline
mentorAvailabilitySchema.pre('save', function(next) {
  if (this.isModified('isOnline') && !this.isOnline) {
    this.lastSeen = new Date();
  }
  next();
});

const MentorAvailability = mongoose.model('MentorAvailability', mentorAvailabilitySchema);
module.exports = MentorAvailability; 