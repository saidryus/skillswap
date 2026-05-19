const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Normalize a Philippine phone number to E.164 format (+63XXXXXXXXXX).
 * Accepts:  09XXXXXXXXX  →  +639XXXXXXXXX
 *           9XXXXXXXXX   →  +639XXXXXXXXX
 *           +639XXXXXXXX →  unchanged
 * Returns null if the number doesn't look valid.
 */
function normalizePhone(phone) {
  if (!phone) return null;
  const digits = phone.replace(/[\s\-().]/g, '');
  if (digits.startsWith('+63')) return digits;
  if (digits.startsWith('09') && digits.length === 11) return '+63' + digits.slice(1);
  if (digits.startsWith('9') && digits.length === 10) return '+63' + digits;
  return null; // unrecognized format — skip
}

/**
 * Send an SMS via Twilio.
 * Requires in .env:
 *   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 *   TWILIO_AUTH_TOKEN=your_auth_token
 *   TWILIO_FROM_NUMBER=+1XXXXXXXXXX   (your Twilio number)
 */
async function sendSms(phone, message) {
  if (!phone) return;

  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_FROM_NUMBER;

  // Skip silently if Twilio is not configured
  if (!sid || !token || !from) {
    console.warn('[SMS] Twilio not configured — skipping SMS to', phone);
    return;
  }

  const to = normalizePhone(phone);
  if (!to) {
    console.warn('[SMS] Unrecognized phone format, skipping:', phone);
    return;
  }

  try {
    const twilio = require('twilio');
    const client = twilio(sid, token);
    const result = await client.messages.create({ body: message, from, to });
    console.log(`[SMS] Sent to ${to} — SID: ${result.sid}`);
  } catch (err) {
    console.error(`[SMS] Failed to send to ${to}:`, err.message);
  }
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
      const users = await User.find({
        _id: { $in: recipientIds },
        phone: { $exists: true, $ne: '' },
      }).select('_id phone');

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
