/**
 * Document Auto-Expiry Job
 *
 * Runs daily. For any pending tutor application whose document
 * has passed its expiry date, the encrypted file is deleted from
 * disk and the profile is flagged as documentExpired.
 *
 * Default TTL: 30 days from upload (configurable via DOC_EXPIRY_DAYS env var).
 * The expiry date is stamped onto the profile at upload time.
 */

const fs   = require('fs');
const path = require('path');

const EXPIRY_DAYS = parseInt(process.env.DOC_EXPIRY_DAYS || '30', 10);
const MS_PER_DAY  = 24 * 60 * 60 * 1000;

/**
 * Calculate expiry date from upload timestamp.
 * @param {Date} uploadedAt
 * @returns {Date}
 */
function calcExpiresAt(uploadedAt) {
  return new Date(uploadedAt.getTime() + EXPIRY_DAYS * MS_PER_DAY);
}

/**
 * Run the expiry sweep once.
 * Call this on server start and then on a daily interval.
 */
async function runExpiryJob() {
  const TutorProfile = require('../models/TutorProfile');
  const now = new Date();

  const expired = await TutorProfile.find({
    status: 'pending',
    documentExpired: false,
    documentExpiresAt: { $lte: now },
    $or: [
      { recommendationDocument: { $ne: '' } },
      { gradeDocument: { $ne: '' } },
    ],
  });

  if (expired.length === 0) return;

  console.log(`[DocExpiry] Running sweep — ${expired.length} document(s) to expire`);

  for (const profile of expired) {
    const docPath = profile.recommendationDocument || profile.gradeDocument;

    // Delete file from disk
    if (docPath) {
      const absPath = path.resolve(docPath);
      try {
        if (fs.existsSync(absPath)) {
          fs.unlinkSync(absPath);
          console.log(`[DocExpiry] Deleted: ${absPath}`);
        }
      } catch (err) {
        console.error(`[DocExpiry] Failed to delete ${absPath}:`, err.message);
      }
    }

    // Mark expired, clear stored text and paths, and append audit entry
    profile.documentExpired = true;
    profile.extractedText = '';
    profile.recommendationDocument = '';
    profile.gradeDocument = '';
    profile.documentAuditLog.push({
      adminId:   null,
      adminName: 'system',
      action:    'auto_expired',
      timestamp: now,
      ip:        '',
    });
    await profile.save();
    console.log(`[DocExpiry] Marked expired: profile ${profile._id} (tutor application pending > ${EXPIRY_DAYS} days)`);
  }
}

/**
 * Start the daily expiry scheduler.
 * Runs once immediately on boot, then every 24 hours.
 */
function startExpiryScheduler() {
  console.log(`[DocExpiry] Scheduler started — TTL: ${EXPIRY_DAYS} days, sweep interval: 24h`);
  runExpiryJob().catch(err => console.error('[DocExpiry] Initial sweep error:', err.message));
  setInterval(() => {
    runExpiryJob().catch(err => console.error('[DocExpiry] Sweep error:', err.message));
  }, MS_PER_DAY);
}

module.exports = { startExpiryScheduler, calcExpiresAt, EXPIRY_DAYS };
