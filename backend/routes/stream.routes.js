const router = require('express').Router();
const { isAuthenticated } = require('../middleware/auth.middleware');
const { 
  createChatToken, 
  createChatChannel,
  createVideoToken,
  createVideoCall 
} = require('../utils/streamService');
const Session = require('../models/Session');

// Get Stream tokens for a session
router.get('/tokens/:sessionId', isAuthenticated, async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Verify user is part of the session
    if (session.mentor.toString() !== req.user._id.toString() && 
        session.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const chatToken = createChatToken(req.user._id.toString());
    const videoToken = createVideoToken(req.user._id.toString());

    res.json({
      chatToken,
      videoToken
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error generating tokens',
      error: error.message 
    });
  }
});

// Initialize session communication channels
router.post('/init/:sessionId', isAuthenticated, async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId)
      .populate('mentor')
      .populate('student');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Create chat channel
    const channel = await createChatChannel(
      session._id.toString(),
      session.mentor._id.toString(),
      session.student._id.toString()
    );

    // Create video call
    const call = await createVideoCall(
      session._id.toString(),
      session.mentor._id.toString(),
      session.student._id.toString()
    );

    res.json({
      channelId: channel.id,
      callId: call.id
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error initializing session channels',
      error: error.message 
    });
  }
});

// Store chat message in session history
router.post('/chat/message/:sessionId', isAuthenticated, async (req, res) => {
  try {
    const { content, fileUrl } = req.body;
    const session = await Session.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Verify user is part of the session
    if (session.mentor.toString() !== req.user._id.toString() && 
        session.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Add message to chat history
    session.chatHistory.push({
      sender: req.user._id,
      content,
      fileUrl
    });

    await session.save();
    res.json(session.chatHistory);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error storing chat message',
      error: error.message 
    });
  }
});

module.exports = router; 