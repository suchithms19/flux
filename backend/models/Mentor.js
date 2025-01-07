const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Basic Info
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'others'],
    required: true
  },

  // Professional Info
  organization: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  experience: {
    type: Number,
    required: true
  },
  headline: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    required: true
  },

  // Skills and Areas
  languages: [{
    type: String
  }],
  mentoringAreas: [{
    type: String,
    enum: ['coding-software', 'mba-cat', 'freelancing', 'career-job']
  }],

  // Social Links
  socialLinks: {
    linkedin: String,
    twitter: String,
    github: String,
    instagram: String
  },

  // Mentor Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  
  // Availability
  availability: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    slots: [{
      startTime: String,
      endTime: String
    }]
  }],

  // Ratings and Reviews
  ratings: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    },
    reviews: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      rating: Number,
      comment: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },

  // Session and Earnings
  ratePerMinute: {
    type: Number,
    required: true
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  totalSessionsDone: {
    type: Number,
    default: 0
  },
  totalMinutesTaught: {
    type: Number,
    default: 0
  },

  // Featured Status
  isFeatured: {
    type: Boolean,
    default: false
  },

  // Chat and Session History
  sessions: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    startTime: Date,
    endTime: Date,
    duration: Number,
    amount: Number,
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled'
    },
    rating: Number,
    feedback: String
  }],

  chatHistory: [{
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session'  // We'll create this model later
    },
    messages: [{
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      content: String,
      fileUrl: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
mentorSchema.index({ mentoringAreas: 1 });
mentorSchema.index({ 'ratings.average': -1 });
mentorSchema.index({ status: 1 });
mentorSchema.index({ isFeatured: 1 });

module.exports = mongoose.model('Mentor', mentorSchema); 