const router = require('express').Router();
const { isAuthenticated } = require('../middleware/auth.middleware');
const Session = require('../models/Session');
const Mentor = require('../models/Mentor');
const sendEmail = require('../utils/emailService');
const { initializeStreamChannels } = require('../utils/streamService');

// Book a session slot
router.post('/book', isAuthenticated, async (req, res) => {
  try {
    const { mentorId, startTime } = req.body;

    // Find mentor and check availability
    const mentor = await Mentor.findById(mentorId);
    if (!mentor || mentor.status !== 'approved') {
      return res.status(404).json({ message: 'Mentor not found or not approved' });
    }

    // Check if slot is available (1-hour slot)
    const slotStart = new Date(startTime);
    const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000); // 1 hour later

    // Check for existing sessions in this slot
    const existingSession = await Session.findOne({
      mentor: mentorId,
      startTime: {
        $gte: slotStart,
        $lt: slotEnd
      },
      status: { $nin: ['cancelled', 'completed'] }
    });

    if (existingSession) {
      return res.status(400).json({ message: 'This slot is already booked' });
    }

    // Create session
    const session = new Session({
      mentor: mentorId,
      student: req.user._id,
      startTime: slotStart,
      status: 'scheduled'
    });

    await session.save();

    // Send email notifications
    await Promise.all([
      sendEmail({
        to: req.user.email,
        subject: 'Session Slot Booked Successfully',
        template: 'sessionBooked',
        data: {
          mentorName: mentor.fullName,
          startTime: slotStart.toLocaleString(),
          ratePerMinute: mentor.ratePerMinute
        }
      }),
      sendEmail({
        to: mentor.email,
        subject: 'New Session Slot Booked',
        template: 'newSession',
        data: {
          studentName: req.user.name,
          startTime: slotStart.toLocaleString()
        }
      })
    ]);

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error booking session',
      error: error.message 
    });
  }
});

// Start session
router.post('/:sessionId/start', isAuthenticated, async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Verify mentor is starting the session
    if (session.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (session.status !== 'scheduled') {
      return res.status(400).json({ message: 'Session cannot be started' });
    }

    // Initialize Stream channels
    const { channelId, callId } = await initializeStreamChannels(session);
    
    session.status = 'ongoing';
    session.startTime = new Date();
    session.streamData = { channelId, callId };
    await session.save();

    res.json(session);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error starting session',
      error: error.message 
    });
  }
});

// End session and calculate charges
router.post('/:sessionId/end', isAuthenticated, async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Verify mentor is ending the session
    if (session.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (session.status !== 'ongoing') {
      return res.status(400).json({ message: 'Session is not ongoing' });
    }

    const mentor = await Mentor.findById(session.mentor);
    session.status = 'completed';
    session.endTime = new Date();
    
    // Calculate actual duration in minutes
    const durationMs = session.endTime - session.startTime;
    session.actualDuration = Math.ceil(durationMs / (1000 * 60));
    
    // Calculate amount
    session.amount = session.actualDuration * mentor.ratePerMinute;

    await session.save();

    // Update mentor stats
    await Mentor.findByIdAndUpdate(session.mentor, {
      $inc: {
        totalSessionsDone: 1,
        totalMinutesTaught: session.actualDuration,
        totalEarnings: session.amount
      }
    });

    res.json(session);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error ending session',
      error: error.message 
    });
  }
});

// Get user's sessions (both mentor and student)
router.get('/my-sessions', isAuthenticated, async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [
        { student: req.user._id },
        { mentor: req.user._id }
      ]
    })
    .populate('mentor', 'fullName picture')
    .populate('student', 'name picture')
    .sort({ startTime: -1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching sessions',
      error: error.message 
    });
  }
});

// Update session status
router.put('/:sessionId/status', isAuthenticated, async (req, res) => {
  try {
    const { status } = req.body;
    const session = await Session.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Verify user is part of the session
    if (session.mentor.toString() !== req.user._id.toString() && 
        session.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    session.status = status;
    if (status === 'completed') {
      session.endTime = new Date();
      // Update mentor stats
      await Mentor.findByIdAndUpdate(session.mentor, {
        $inc: {
          totalSessionsDone: 1,
          totalMinutesTaught: session.duration,
          totalEarnings: session.amount
        }
      });
    }

    await session.save();
    res.json(session);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating session',
      error: error.message 
    });
  }
});

// Add session feedback and rating
router.post('/:sessionId/feedback', isAuthenticated, async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const session = await Session.findById(req.params.sessionId);

    if (!session || session.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    session.rating = rating;
    session.feedback = feedback;
    await session.save();

    // Update mentor ratings
    const mentor = await Mentor.findById(session.mentor);
    const totalRatings = mentor.ratings.count + 1;
    const newAverage = (mentor.ratings.average * mentor.ratings.count + rating) / totalRatings;

    await Mentor.findByIdAndUpdate(session.mentor, {
      $push: {
        'ratings.reviews': {
          user: req.user._id,
          rating,
          comment: feedback
        }
      },
      $set: {
        'ratings.average': newAverage,
        'ratings.count': totalRatings
      }
    });

    res.json(session);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error adding feedback',
      error: error.message 
    });
  }
});

module.exports = router; 