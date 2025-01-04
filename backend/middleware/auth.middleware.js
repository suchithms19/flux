const jwt = require('jsonwebtoken');

exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated() && req.session.passport) {
    req.session.touch();
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};

exports.isMentor = (req, res, next) => {
  if (!req.isAuthenticated() || !req.session.passport) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  if (req.user && req.user.role === 'mentor' && req.user.mentorStatus === 'approved') {
    req.session.touch();
    return next();
  }
  res.status(403).json({ message: 'Access denied. Mentor privileges required.' });
};

exports.isAdmin = (req, res, next) => {
  if (!req.isAuthenticated() || !req.session.passport) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  if (req.user && req.user.role === 'admin') {
    req.session.touch();
    return next();
  }
  res.status(403).json({ message: 'Access denied. Admin privileges required.' });
};

exports.cleanupSession = (req, res, next) => {
  if (req.session && req.session.cookie && req.session.cookie.expires) {
    if (new Date() > req.session.cookie.expires) {
      req.logout((err) => {
        if (err) console.error('Logout error:', err);
      });
      req.session.destroy();
    }
  }
  next();
}; 