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
      
      // Redirect to success page
      res.redirect(`${process.env.CLIENT_URL}/auth/success`);
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
  if (req.session) {
    const sessionStore = req.sessionStore;
    const sessionId = req.session.id;

    // First logout from passport
    req.logout(function(err) {
      if (err) {
        console.error('Passport logout error:', err);
        return res.status(500).json({ message: 'Error logging out' });
      }

      // Then destroy the session from store
      sessionStore.destroy(sessionId, (err) => {
        if (err) {
          console.error('Session store destruction error:', err);
        }

        // Finally destroy the session object
        req.session.destroy(function(err) {
          if (err) {
            console.error('Session destruction error:', err);
            return res.status(500).json({ message: 'Error logging out' });
          }

          // Clear cookies
          res.clearCookie('sessionId', {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
          });
          res.clearCookie('connect.sid', {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
          });

          res.status(200).json({ message: 'Logged out successfully' });
        });
      });
    });
  } else {
    // If no session exists, just send success
    res.status(200).json({ message: 'Already logged out' });
  }
});

module.exports = router; 