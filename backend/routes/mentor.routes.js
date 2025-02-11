const router = require('express').Router();
const { isAuthenticated, isAdmin } = require('../middleware/auth.middleware');
const Mentor = require('../models/Mentor');
const User = require('../models/User');
const sendEmail = require('../utils/emailService'); 
const { validateMentorOnboarding } = require('../middleware/mentorValidation.middleware');
const upload = require('../middleware/upload.middleware');
const { uploadToCloudinary } = require('../utils/uploadService');
const MentorAvailability = require('../models/MentorAvailability');
const WebSocket = require('ws');



// Get all mentors with filters
router.get('/mentordata', async (req, res) => {
  try {
    const {
      area,
      maxRate,
      experience,
      search,
      page = 1,
      limit = 10
    } = req.query;

    const query = { status: 'approved' };

    // Apply filters
    if (area) query.mentoringAreas = area;
    if (maxRate) query.ratePerMinute = { $lte: parseFloat(maxRate) };
    if (experience) query.experience = { $gte: parseFloat(experience) };
    
    // Search by name, headline, or bio
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { headline: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { mentoringTopics: { $regex: search, $options: 'i' } }
      ];
    }

    const mentors = await Mentor.find(query)
      .select('-chatHistory -sessions')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Mentor.countDocuments(query);

    res.json({
      mentors,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        perPage: limit
      }
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching mentors',
      error: error.message 
    });
  }
});

// Admin: Approve/Reject mentor
router.put('/application/:mentorId', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { status, dashboardUrl } = req.body;
    const mentor = await Mentor.findById(req.params.mentorId);

    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    mentor.status = status;
    await mentor.save();

    // Update user role and status
    await User.findByIdAndUpdate(mentor.user, {
      role: status === 'approved' ? 'mentor' : 'student',
      mentorStatus: status
    });

    // Send email notification to mentor
    await sendEmail({
      to: mentor.email,
      subject: `Mentor Application ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      template: 'mentorApplicationStatus',
      data: {
        mentorName: mentor.fullName,
        approved: status === 'approved',
        dashboardUrl
      }
    });

    res.json({ message: `Mentor ${status} successfully`, mentor });

  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating mentor status',
      error: error.message 
    });
  }
});

// Get pending mentor applications (admin only)
router.get('/applications/pending', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const pendingMentors = await Mentor.find({ status: 'pending' })
      .populate('user', 'name email picture')
      .select('-chatHistory -sessions')
      .sort({ createdAt: -1 });

    res.json(pendingMentors);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching pending applications',
      error: error.message 
    });
  }
});

// Get mentor profile
router.get('/profile/:mentorId', async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.mentorId)
      .select(`
        fullName email profilePhoto role organization
        headline bio experience languages mentoringAreas
        mentoringTopics socialLinks ratings ratePerMinute
        totalSessionsDone isFeatured availability
        gender phone user
      `)
      .populate('user', '_id name email')
      .populate({
        path: 'ratings.reviews',
        populate: {
          path: 'user',
          select: 'name profilePhoto'
        }
      })
      .lean();

    if (!mentor) {
      console.log('Mentor not found');
      return res.status(404).json({ 
        success: false,
        message: 'Mentor not found' 
      });
    }

    res.json({
      success: true,
      mentor
    });
  } catch (error) {
    console.error('Error in mentor profile route:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching mentor profile',
      error: error.message 
    });
  }
});

// Update mentor profile (for approved mentors)
router.put('/profile', isAuthenticated, async (req, res) => {
  try {
    const mentor = await Mentor.findOne({ 
      user: req.user._id,
      status: 'approved'
    });

    if (!mentor) {
      return res.status(404).json({ 
        message: 'Mentor profile not found or not approved' 
      });
    }

    // Fields that can be updated
    const updatableFields = [
      'headline', 'bio', 'languages', 'availability',
      'ratePerMinute', 'socialLinks'
    ];

    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        mentor[field] = req.body[field];
      }
    });

    await mentor.save();
    res.json(mentor);

  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating mentor profile',
      error: error.message 
    });
  }
});

// Add this route to handle mentor onboarding form
router.post('/onboard',
  isAuthenticated, 
  validateMentorOnboarding,
  async (req, res) => {
    try {
      // Check if user already has a mentor profile
      const existingMentor = await Mentor.findOne({ user: req.user._id });
      if (existingMentor) {
        return res.status(400).json({ 
          message: 'You already have a mentor profile' 
        });
      }

      // Validate required fields
      const { 
        fullName, email, phone, gender, organization,
        role, experience, headline, bio, languages,
        mentoringAreas, profilePhoto, mentoringTopics,
        socialLinks
      } = req.body;

      // Validate profile photo
      if (!profilePhoto) {
        return res.status(400).json({
          message: 'Profile photo is required'
        });
      }

      // Create new mentor profile
      const mentor = new Mentor({
        user: req.user._id,
        fullName,
        email,
        phone,
        gender,
        organization,
        role,
        experience,
        headline,
        bio,
        languages,
        mentoringAreas,
        profilePhoto,
        mentoringTopics,
        socialLinks: socialLinks || {},
        status: 'pending',
        ratePerMinute: 1
      });

      // Save the mentor profile
      await mentor.save();

      // Update user's mentor status
      await User.findByIdAndUpdate(req.user._id, {
        mentorStatus: 'pending',
        mentorProfile: {
          expertise: mentoringAreas,
          bio: bio,
          experience: experience
        }
      });

      // Send email notifications
      await Promise.all([
        sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: 'New Mentor Application',
          template: 'newMentorApplication',
          data: {
            mentorName: fullName,
            mentorEmail: email,
            adminDashboardUrl: `${process.env.CLIENT_URL}/admin/mentors/pending`
          }
        }),
        sendEmail({
          to: email,
          subject: 'Mentor Application Received',
          template: 'mentorApplicationReceived',
          data: {
            mentorName: fullName
          }
        })
      ]);

      res.status(201).json({
        message: 'Mentor application submitted successfully',
        mentor
      });

    } catch (error) {
      console.error('Mentor onboarding error:', error);
      res.status(500).json({ 
        message: 'Error submitting mentor application',
        error: error.message 
      });
    }
  }
);

// Add a route to upload mentor profile photo
router.post('/upload-photo', 
  upload.single('photo'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const result = await uploadToCloudinary(req.file);

      res.json({ 
        message: 'Photo uploaded successfully',
        url: result.url
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ 
        message: 'Error uploading photo',
        error: error.message 
      });
    }
  }
);

// Get mentor's schedule
router.get('/schedule/:mentorId', async (req, res) => {
  try {
    const availability = await MentorAvailability.findOne({
      mentor: req.params.mentorId
    });

    if (!availability) {
      return res.json({ schedule: {} });
    }

    res.json({ schedule: availability.schedule });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching schedule',
      error: error.message 
    });
  }
});

// Update mentor's schedule
router.put('/schedule', isAuthenticated, async (req, res) => {
  try {
    const { schedule } = req.body;

    let availability = await MentorAvailability.findOne({
      mentor: req.user._id
    });

    if (!availability) {
      availability = new MentorAvailability({
        mentor: req.user._id,
        schedule
      });
    } else {
      availability.schedule = schedule;
    }

    await availability.save();
    res.json(availability);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating schedule',
      error: error.message 
    });
  }
});

// Get mentor's online status
router.get('/status/:mentorId', async (req, res) => {
  try {
    const availability = await MentorAvailability.findOne({
      mentor: req.params.mentorId
    });

    if (!availability) {
      return res.json({
        isOnline: false,
        lastSeen: new Date()
      });
    }

    res.json({
      isOnline: availability.isOnline,
      lastSeen: availability.lastSeen
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching status',
      error: error.message 
    });
  }
});

// Update mentor's online status
router.put('/status', isAuthenticated, async (req, res) => {
  try {
    const { isOnline } = req.body;

    let availability = await MentorAvailability.findOne({
      mentor: req.user._id
    });

    if (!availability) {
      availability = new MentorAvailability({
        mentor: req.user._id,
        isOnline
      });
    } else {
      availability.isOnline = isOnline;
    }

    await availability.save();

    // Notify connected clients through WebSocket
    if (global.wss) {
      global.wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'MENTOR_STATUS',
            mentorId: req.user._id,
            isOnline,
            lastSeen: availability.lastSeen
          }));
        }
      });
    }

    res.json(availability);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating status',
      error: error.message 
    });
  }
});

module.exports = router; 