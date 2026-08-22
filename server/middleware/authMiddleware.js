const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] || req.user?.id;
    const authHeader = req.headers['authorization'];

    let targetUserId = userId;

    if (!targetUserId && authHeader && authHeader.startsWith('Bearer ')) {
      // In a full JWT setup, jwt.verify(token) would yield userId.
      // If token is a raw userId or mock token, try using it as userId:
      const token = authHeader.split(' ')[1];
      targetUserId = token;
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
    return res.status(500).json({ message: 'Authentication error' });
  }
};

const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions.' });
    }

    next();
  };
};

module.exports = {
  authMiddleware,
  checkRole,
};
