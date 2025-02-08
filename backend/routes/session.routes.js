const router = require('express').Router();
const { isAuthenticated } = require('../middleware/auth.middleware');
const Session = require('../models/Session');
const Mentor = require('../models/Mentor');
const sendEmail = require('../utils/emailService');
const { initializeStreamChannels } = require('../utils/streamService');
const Message = require('../models/Message');
const User = require('../models/User');

// Book a session slot
router.post('/book', isAuthenticated, async (req, res) => {
  try {
    const { mentorId, ratePerBlock, metadata } = req.body;

    // Verify mentor exists and is approved
    const mentor = await User.findOne({ _id: mentorId, role: 'mentor' });
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    // Create new session
    const session = new Session({
      mentor: mentorId,
      student: req.user._id,
      ratePerBlock: ratePerBlock || 1,
      metadata: metadata || {
        topic: 'General Discussion',
        description: 'Chat session with mentor'
      }
    });

    await session.save();

    // Populate mentor details
    await session.populate('mentor', 'fullName profilePhoto');

    res.status(201).json(session);
  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({ message: 'Error creating session' });
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

    if (session.mentor.toString() !== req.user._id.toString() && 
        session.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to end this session' });
    }

    session.status = 'completed';
    session.endTime = new Date();
    await session.save();

    res.json(session);
  } catch (error) {
    console.error('Session end error:', error);
    res.status(500).json({ message: 'Error ending session' });
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

// Get session details
router.get('/:sessionId', isAuthenticated, async (req, res) => {
  try {
    console.log('Fetching session details for ID:', req.params.sessionId);
    const session = await Session.findById(req.params.sessionId)
      .populate('mentor', 'fullName profilePhoto name picture')
      .populate('student', 'fullName profilePhoto name picture');

    if (!session) {
      console.log('Session not found:', req.params.sessionId);
      return res.status(404).json({ message: 'Session not found' });
    }

    console.log('Session found:', {
      id: session._id,
      mentor: session.mentor?._id,
      student: session.student?._id
    });

    // Verify user is part of the session
    const mentorId = session.mentor._id ? session.mentor._id.toString() : session.mentor.toString();
    const studentId = session.student._id ? session.student._id.toString() : session.student.toString();
    const userId = req.user._id.toString();

    if (mentorId !== userId && studentId !== userId) {
      console.log('User not authorized:', {
        userId,
        mentorId,
        studentId
      });
      return res.status(403).json({ message: 'Not authorized to view this session' });
    }

    // Get messages for this session
    const messages = await Message.find({ session: session._id })
      .sort({ createdAt: 1 })
      .limit(100);

    console.log('Found messages:', messages.length);

    res.json({
      ...session.toObject(),
      messages
    });
  } catch (error) {
    console.error('Session fetch error:', error);
    res.status(500).json({ message: 'Error fetching session details', error: error.message });
  }
});

// Add message to session
router.post('/:sessionId/messages', isAuthenticated, async (req, res) => {
  try {
    const { content, metadata } = req.body;
    const session = await Session.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Verify user is part of the session
    if (session.mentor.toString() !== req.user._id.toString() && 
        session.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to message in this session' });
    }

    // Calculate message cost (if student)
    let messageCost = 0;
    if (session.student.toString() === req.user._id.toString()) {
      const charCount = content.length;
      const blocks = Math.ceil(charCount / 160);
      messageCost = blocks * session.ratePerBlock;

      // Update session total cost
      session.totalCost += messageCost;
      await session.save();
    }

    // Create message
    const message = new Message({
      session: session._id,
      sender: req.user._id,
      content,
      metadata,
      cost: messageCost
    });

    await message.save();

    // Notify through WebSocket (handled by the WebSocket service)
    if (global.wss) {
      global.wss.clients.forEach(client => {
        if (client.sessionId === session._id.toString()) {
          client.send(JSON.stringify({
            type: 'NEW_MESSAGE',
            message
          }));
        }
      });
    }

    res.status(201).json(message);
  } catch (error) {
    console.error('Message creation error:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
});

module.exports = router; 