const { Notification } = require('../models');

/**
 * Helper to create a notification record for a user
 * @param {Object} param0 
 * @param {string} param0.userId
 * @param {string} param0.type
 * @param {string} param0.title
 * @param {string} param0.message
 * @param {string} [param0.link]
 */
const createNotification = async ({ userId, type, title, message, link }) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      link: link || null,
      isRead: false,
    });
    return notification;
  } catch (error) {
    console.error(`Failed to create notification for user ${userId}:`, error);
    throw error;
  }
};

module.exports = {
  createNotification,
};
