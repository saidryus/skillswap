const Notification = require('../models/Notification');

/**
 * Create one or more notifications.
 * @param {Array|Object} notifications - single or array of { recipient, type, title, message, link, meta }
 */
const createNotifications = async (notifications) => {
  try {
    const items = Array.isArray(notifications) ? notifications : [notifications];
    if (items.length === 0) return;
    await Notification.insertMany(items);
  } catch (err) {
    // Notifications are non-critical — log but don't crash the request
    console.error('Notification error:', err.message);
  }
};

module.exports = { createNotifications };
