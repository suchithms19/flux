const router = require('express').Router();
const { isAuthenticated, isAdmin, isMentor } = require('../middleware/auth.middleware');
const User = require('../models/User');

// Apply to become a mentor
router.post('/apply', isAuthenticated, async (req, res) => {
  try {
    if (req.user.mentorStatus !== 'not_applied') {
      return res.status(400).json({ message: 'Application already submitted' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        mentorStatus: 'pending',
        mentorProfile: req.body.mentorProfile
      },
      { new: true }
    );

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error submitting application', error: error.message });
  }
});

// Get all mentor applications (admin only)
router.get('/applications', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const applications = await User.find({
      mentorStatus: 'pending'
    });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
});

// Approve/Reject mentor application (admin only)
router.put('/application/:userId', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        mentorStatus: status,
        role: status === 'approved' ? 'mentor' : 'student'
      },
      { new: true }
    );

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating application', error: error.message });
  }
});

// Get all approved mentors
router.get('/', async (req, res) => {
  try {
    const mentors = await User.find({
      role: 'mentor',
      mentorStatus: 'approved'
    }).select('name picture mentorProfile');
    res.json(mentors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching mentors', error: error.message });
  }
});

module.exports = router; 