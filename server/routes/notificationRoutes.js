const express = require('express');
const router = express.Router();
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

// Get current user's notifications
router.get('/', authMiddleware, getMyNotifications);

// Mark all as read
router.put('/read-all', authMiddleware, markAllAsRead);

// Mark single notification as read
router.put('/:notificationId/read', authMiddleware, markAsRead);

module.exports = router;
