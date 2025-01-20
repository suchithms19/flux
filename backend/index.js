require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const sessionConfig = require('./config/session.config');
require('./config/passport');  // Import passport configuration
const paymentRoutes = require('./routes/payment.routes');
const mentorRoutes = require('./routes/mentor.routes');
const streamRoutes = require('./routes/stream.routes');
const waitlistRoutes = require('./routes/waitlist.routes');

const app = express();



// Basic middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));



// Session and auth middleware
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

// Security headers
app.use((req, res, next) => {
  res.set({
    'X-XSS-Protection': '1; mode=block',
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  });
  next();
});

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/mentors', require('./routes/mentor.routes'));
app.use('/api/sessions', require('./routes/session.routes'));
app.use('/api/stream', require('./routes/stream.routes'));
app.use('/api/payments', paymentRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/stream', streamRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/waitlist', waitlistRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 