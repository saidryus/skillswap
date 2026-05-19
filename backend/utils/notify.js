const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Send an SMS to a phone number.
 * Currently a stub — wire up a real provider (e.g. Twilio) by setting
 * TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER in .env
 * and replacing the body of this function.
 */
async function sendSms(phone, message) {
  if (!phone) return;
  // Uncomment and configure when a provider is available:
  // const twilio = require('twilio');
  // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  // await client.messages.create({ body: message, from: process.env.TWILIO_FROM_NUMBER, to: phone });
  console.log(`[SMS stub] To: ${phone} | Message: ${message}`);
}

/**
 * Create one or more in-app notifications and optionally SMS the recipients.
 * @param {Array|Object} notifications - single or array of
 *   { recipient, type, title, message, link, meta, sms? }
 *   Set sms: true on a notification to also send an SMS to the recipient's phone.
 */
const createNotifications = async (notifications) => {
  try {
    const items = Array.isArray(notifications) ? notifications : [notifications];
    if (items.length === 0) return;

    // Insert in-app notifications (strip the sms flag before inserting)
    const dbItems = items.map(({ sms, ...rest }) => rest);
    await Notification.insertMany(dbItems);

    // Send SMS to recipients who have a phone number, for items flagged with sms: true
    const smsItems = items.filter(n => n.sms);
    if (smsItems.length > 0) {
      const recipientIds = [...new Set(smsItems.map(n => n.recipient?.toString()))];
      const users = await User.find({ _id: { $in: recipientIds }, phone: { $exists: true, $ne: '' } }).select('_id phone');
      const phoneMap = {};
      users.forEach(u => { phoneMap[u._id.toString()] = u.phone; });

      await Promise.allSettled(
        smsItems.map(n => {
          const phone = phoneMap[n.recipient?.toString()];
          if (phone) return sendSms(phone, `${n.title}: ${n.message}`);
        })
      );
    }
  } catch (err) {
    // Notifications are non-critical — log but don't crash the request
    console.error('Notification error:', err.message);
  }
};

module.exports = { createNotifications, sendSms };
