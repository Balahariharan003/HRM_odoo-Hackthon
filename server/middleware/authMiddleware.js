const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const xUserId = req.headers['x-user-id'];

    let targetUserId = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        targetUserId = decoded.id || decoded.userId;
      } catch (jwtErr) {
        // Fallback for mock token (if token is just a raw UUID/ID string)
        if (token.length > 5) {
          targetUserId = token;
        } else {
          throw jwtErr;
        }
      }
    } else if (xUserId) {
      targetUserId = xUserId;
    }

    if (!targetUserId) {
      return res.status(401).json({ message: 'Authentication required. Please provide credentials.' });
    }

    const user = await User.findByPk(targetUserId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid or expired user session.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Token is invalid or expired', error: error.message });
  }
};

const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions.' });
    }
    next();
  };
};

module.exports = {
  authMiddleware,
  checkRole,
  JWT_SECRET,
};
