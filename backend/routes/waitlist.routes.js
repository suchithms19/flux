const express = require('express');
const router = express.Router();
const Waitlist = require('../models/Waitlist');

// Join waitlist
router.post('/join', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if email already exists
    const existingEmail = await Waitlist.findOne({ email });
    if (existingEmail) {
      return res.status(200).json({ message: 'You are already on the waitlist!' });
    }

    // Create new waitlist entry
    const waitlistEntry = new Waitlist({ email });
    await waitlistEntry.save();

    res.status(201).json({ 
      message: 'Successfully joined the waitlist!',
      status: 'pending'
    });

  } catch (error) {
    console.error('Waitlist join error:', error);
    res.status(500).json({ message: 'Error joining waitlist' });
  }
});

// Get waitlist count (optional - for displaying total signups)
router.get('/count', async (req, res) => {
  try {
    const count = await Waitlist.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    console.error('Waitlist count error:', error);
    res.status(500).json({ message: 'Error getting waitlist count' });
  }
});

module.exports = router; 