const router = require('express').Router();
const passport = require('passport');

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email']
  })
);

router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL}/login`,
    session: true
  }),
  (req, res) => {
    // Set session data
    req.session.userId = req.user._id;
    req.session.role = req.user.role;
    
    // Save session before redirect
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.redirect(`${process.env.CLIENT_URL}/login`);
      }
      
      // Redirect based on user role
      if (req.user.role === 'admin') {
        res.redirect(`${process.env.CLIENT_URL}/admin/dashboard`);
      } else if (req.user.role === 'mentor' && req.user.mentorStatus === 'approved') {
        res.redirect(`${process.env.CLIENT_URL}/mentor/dashboard`);
      } else {
        res.redirect(`${process.env.CLIENT_URL}/dashboard`);
      }
    });
  }
);

// Get current user
router.get('/current-user', (req, res) => {
  // Add rate limiting or debouncing here if needed
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  // Send minimal user data
  const { _id, name, email, role, picture, mentorStatus } = req.user;
  res.json({ _id, name, email, role, picture, mentorStatus });
});

// Logout route
router.get('/logout', (req, res) => {
  try {
    // Clear the session
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
        return res.status(500).json({ message: 'Error logging out' });
      }

      // Logout from passport
      req.logout((err) => {
        if (err) {
          console.error('Passport logout error:', err);
          return res.status(500).json({ message: 'Error logging out' });
        }

        // Clear the session cookie
        res.clearCookie('sessionId');
        res.clearCookie('connect.sid');
        
        // Send success response
        res.status(200).json({ message: 'Logged out successfully' });
      });
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Error logging out' });
  }
});

module.exports = router; 