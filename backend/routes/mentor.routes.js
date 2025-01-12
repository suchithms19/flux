const router = require('express').Router();
const { isAuthenticated, isAdmin } = require('../middleware/auth.middleware');
const Mentor = require('../models/Mentor');
const User = require('../models/User');
const sendEmail = require('../utils/emailService'); 
const { validateMentorOnboarding } = require('../middleware/mentorValidation.middleware');
const upload = require('../middleware/upload.middleware');
const { uploadToCloudinary } = require('../utils/uploadService');



// Get all mentors with filters
router.get('/', async (req, res) => {
  try {
    const {
      area,
      minRating,
      maxRate,
      language,
      featured,
      search,
      page = 1,
      limit = 10
    } = req.query;

    const query = { status: 'approved' };

    // Apply filters
    if (area) query.mentoringAreas = area;
    if (minRating) query['ratings.average'] = { $gte: parseFloat(minRating) };
    if (maxRate) query.ratePerMinute = { $lte: parseFloat(maxRate) };
    if (language) query.languages = language;
    if (featured === 'true') query.isFeatured = true;
    
    // Search by name or headline
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { headline: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ];
    }

    const mentors = await Mentor.find(query)
      .select('-chatHistory -sessions')
      .sort({ 'ratings.average': -1, isFeatured: -1 })
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
    const { status } = req.body;
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
        status,
        mentorName: mentor.fullName
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
      .populate('user', 'name email picture')
      .select('-chatHistory -sessions');

    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    res.json(mentor);
  } catch (error) {
    res.status(500).json({ 
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
        mentoringAreas, profilePhoto, // Add profilePhoto
        education, work, ...mentorData 
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
        profilePhoto, // Save the Cloudinary URL
        ...mentorData,
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

module.exports = router; 