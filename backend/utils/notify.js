const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Normalize a Philippine phone number to the format Semaphore expects (09XXXXXXXXX).
 * Accepts:  +639XXXXXXXXX  →  09XXXXXXXXX
 *           9XXXXXXXXX     →  09XXXXXXXXX
 *           09XXXXXXXXX    →  unchanged
 * Returns null if the number doesn't look valid.
 */
function normalizePhone(phone) {
  if (!phone) return null;
  const digits = phone.replace(/[\s\-().+]/g, '');
  if (digits.startsWith('639') && digits.length === 12) return '0' + digits.slice(2);
  if (digits.startsWith('09') && digits.length === 11) return digits;
  if (digits.startsWith('9') && digits.length === 10) return '0' + digits;
  return null;
}

/**
 * Send an SMS via Semaphore (https://semaphore.co).
 * Requires in .env:
 *   SEMAPHORE_API_KEY=your_api_key
 *   SEMAPHORE_SENDER_NAME=TROPHE   (optional, defaults to SEMAPHORE)
 */
async function sendSms(phone, message) {
  if (!phone) return;

  const apiKey     = process.env.SEMAPHORE_API_KEY;
  const senderName = process.env.SEMAPHORE_SENDER_NAME || 'SEMAPHORE';

  if (!apiKey) {
    console.warn('[SMS] Semaphore API key not configured — skipping SMS to', phone);
    return;
  }

  const to = normalizePhone(phone);
  if (!to) {
    console.warn('[SMS] Unrecognized phone format, skipping:', phone);
    return;
  }

  try {
    const res = await fetch('https://api.semaphore.co/api/v4/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apikey:      apiKey,
        number:      to,
        message:     message,
        sendername:  senderName,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error(`[SMS] Semaphore error to ${to}:`, JSON.stringify(data));
    } else {
      console.log(`[SMS] Sent to ${to} — message_id: ${data[0]?.message_id}`);
    }
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
    console.error('Notification error:', err.message);
  }
};

module.exports = { createNotifications, sendSms };
