const router = require('express').Router();
const { isAuthenticated } = require('../middleware/auth.middleware');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Message = require('../models/Message');
const Session = require('../models/Session');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'chat_attachments',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
    resource_type: 'auto'
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Upload file for a chat session
router.post('/:sessionId/upload', isAuthenticated, upload.single('file'), async (req, res) => {
  try {
    const { sessionId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Verify session exists and user is part of it
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.mentor.toString() !== req.user._id.toString() && 
        session.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Calculate cost if student is uploading
    let cost = 0;
    if (session.student.toString() === req.user._id.toString()) {
      // Calculate cost based on file size (1 block per MB)
      const fileSizeInMB = file.size / (1024 * 1024);
      const blocks = Math.ceil(fileSizeInMB);
      cost = blocks * session.ratePerBlock;

      // Update session total cost
      session.totalCost += cost;
      await session.save();
    }

    // Create message for the file
    const message = new Message({
      session: sessionId,
      sender: req.user._id,
      content: file.originalname, // Use filename as content
      cost,
      metadata: {
        type: file.mimetype.startsWith('image/') ? 'image' : 'file',
        fileName: file.originalname,
        fileSize: file.size,
        fileUrl: file.path,
        mimeType: file.mimetype
      }
    });

    await message.save();

    // Notify through WebSocket
    if (global.wss) {
      global.wss.clients.forEach(client => {
        if (client.sessionId === sessionId) {
          client.send(JSON.stringify({
            type: 'NEW_MESSAGE',
            message
          }));
        }
      });
    }

    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        url: file.path,
        filename: file.originalname,
        mimetype: file.mimetype
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading file' });
  }
});

module.exports = router; 