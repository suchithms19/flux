const session = require('express-session');
const MongoStore = require('connect-mongo');

const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 24 * 60 * 60, // 1 day
    autoRemove: 'interval',
    autoRemoveInterval: 10, // In minutes, how frequent expired sessions should be cleaned up
    touchAfter: 24 * 3600, // time period in seconds
    collectionName: 'sessions',
    crypto: {
      secret: process.env.SESSION_SECRET
    },
    stringify: false // Don't stringify session data
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    sameSite: 'lax',
    path: '/'
  },
  name: 'sessionId', // Change default session cookie name for security
  rolling: true, // Forces the session identifier cookie to be set on every response
  unset: 'destroy'
};

module.exports = sessionConfig; 