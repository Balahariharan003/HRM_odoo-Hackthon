const { Notification } = require('../models');

/**
 * 1. getMyNotifications
 * Get notifications for the authenticated user with unread filter and pagination
 */
const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const offset = (page - 1) * limit;

    const where = { userId };
    if (req.query.unreadOnly === 'true' || req.query.unreadOnly === true) {
      where.isRead = false;
    }

    const { count, rows } = await Notification.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    const unreadCount = await Notification.count({
      where: { userId, isRead: false },
    });

    return res.status(200).json({
      notifications: rows,
      totalItems: count,
      unreadCount,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error('Error in getMyNotifications:', error);
    return res.status(500).json({ message: 'Error retrieving notifications', error: error.message });
  }
};

/**
 * 2. markAsRead
 * Mark a single notification as read for the authenticated user
 */
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user?.userId || req.user?.id;

    const notification = await Notification.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notification.update({ isRead: true });

    return res.status(200).json({
      message: 'Notification marked as read',
      notification,
    });
  } catch (error) {
    console.error('Error in markAsRead:', error);
    return res.status(500).json({ message: 'Error updating notification status', error: error.message });
  }
};

/**
 * 3. markAllAsRead
 * Mark all unread notifications as read for the authenticated user
 */
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;

    await Notification.update(
      { isRead: true },
      { where: { userId, isRead: false } }
    );

    return res.status(200).json({
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Error in markAllAsRead:', error);
    return res.status(500).json({ message: 'Error marking all notifications as read', error: error.message });
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
};
