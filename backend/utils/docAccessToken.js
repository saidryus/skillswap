/**
 * Document Access Token Utility
 *
 * Short-lived tokens (5 minutes) granted after admin re-authentication.
 * Separate from regular JWT auth tokens.
 * Stored in memory — expires naturally, no DB writes needed.
 */

const crypto = require('crypto');

// In-memory store: { token: { adminId, expiresAt, useCount } }
const docTokens = new Map();

const MAX_TOKEN_USES = 15; // max document fetches per token

// Brute force tracker: { adminId: { attempts, lockedUntil } }
const docAuthAttempts = new Map();

const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 60 * 60 * 1000; // 1 hour
const TOKEN_TTL_MS = 5 * 60 * 1000;          // 5 minutes

/**
 * Check if an admin is locked out from document access
 */
function isDocAccessLocked(adminId) {
  const record = docAuthAttempts.get(adminId);
  if (!record) return false;
  if (record.lockedUntil && Date.now() < record.lockedUntil) {
    return { locked: true, secondsLeft: Math.ceil((record.lockedUntil - Date.now()) / 1000) };
  }
  return false;
}

/**
 * Record a failed document access attempt
 * Returns lockout info if now locked
 */
function recordFailedDocAccess(adminId) {
  const record = docAuthAttempts.get(adminId) || { attempts: 0, lockedUntil: null };
  record.attempts += 1;

  if (record.attempts >= MAX_ATTEMPTS) {
    record.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    record.attempts = 0;
    docAuthAttempts.set(adminId, record);
    return { locked: true, secondsLeft: LOCKOUT_DURATION_MS / 1000 };
  }

  docAuthAttempts.set(adminId, record);
  return { locked: false, attemptsRemaining: MAX_ATTEMPTS - record.attempts };
}

/**
 * Reset attempt counter after successful re-auth
 */
function resetDocAccessAttempts(adminId) {
  docAuthAttempts.delete(adminId);
}

/**
 * Generate a document access token for an admin
 * @param {string} adminId
 * @returns {string} token
 */
function generateDocAccessToken(adminId) {
  const token = crypto.randomBytes(32).toString('hex');
  docTokens.set(token, {
    adminId: adminId.toString(),
    expiresAt: Date.now() + TOKEN_TTL_MS,
    useCount: 0,
  });
  return token;
}

/**
 * Verify a document access token and increment its use counter.
 * Returns false if expired, wrong admin, or use cap exceeded.
 */
function verifyDocAccessToken(token, adminId) {
  const record = docTokens.get(token);
  if (!record) return false;
  if (record.adminId !== adminId.toString()) return false;
  if (Date.now() > record.expiresAt) {
    docTokens.delete(token);
    return false;
  }
  if (record.useCount >= MAX_TOKEN_USES) {
    docTokens.delete(token);
    return false;
  }
  record.useCount += 1;
  return true;
}

/**
 * Revoke a document access token (after use or on decision)
 */
function revokeDocAccessToken(token) {
  docTokens.delete(token);
}

// Clean up expired tokens every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, record] of docTokens.entries()) {
    if (now > record.expiresAt) docTokens.delete(token);
  }
}, 10 * 60 * 1000);

module.exports = {
  isDocAccessLocked,
  recordFailedDocAccess,
  resetDocAccessAttempts,
  generateDocAccessToken,
  verifyDocAccessToken,
  revokeDocAccessToken,
  TOKEN_TTL_MS,
  MAX_ATTEMPTS,
  MAX_TOKEN_USES,
};
