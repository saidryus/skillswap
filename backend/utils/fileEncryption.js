/**
 * File Encryption Utility
 * AES-256-CBC encryption for uploaded documents.
 *
 * Files are encrypted at rest immediately upon upload.
 * Decryption happens in memory only during authorized access.
 * The decrypted content is never written back to disk.
 *
 * Key source: DOC_ENCRYPTION_KEY env var (32 hex bytes = 64 hex chars).
 * Falls back to a SHA-256 hash of JWT_SECRET for backward compatibility,
 * but DOC_ENCRYPTION_KEY should always be set explicitly in production.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;  // 128 bits

/**
 * Derive the 32-byte encryption key.
 * Uses DOC_ENCRYPTION_KEY if set (preferred), otherwise falls back to JWT_SECRET.
 */
function getDerivedKey() {
  const explicit = process.env.DOC_ENCRYPTION_KEY;
  if (explicit) {
    // Accept a 64-char hex string (32 bytes) or any string — hash it to 32 bytes
    if (/^[0-9a-fA-F]{64}$/.test(explicit)) {
      return Buffer.from(explicit, 'hex');
    }
    return crypto.createHash('sha256').update(explicit).digest();
  }
  // Fallback: derive from JWT_SECRET (backward compat — not recommended for production)
  const secret = process.env.JWT_SECRET || 'fallback_secret_change_in_production';
  console.warn('[FileEncryption] Warning: DOC_ENCRYPTION_KEY not set. Using JWT_SECRET as fallback. Set DOC_ENCRYPTION_KEY in .env for production.');
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Encrypt a file in place.
 * Reads the file, encrypts it, overwrites the original file.
 * Prepends the IV to the encrypted data (first 16 bytes = IV).
 *
 * @param {string} filePath - Path to the file to encrypt
 */
function encryptFile(filePath) {
  const key = getDerivedKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const plaintext = fs.readFileSync(filePath);
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);

  // Store: [16 bytes IV][encrypted data]
  const result = Buffer.concat([iv, encrypted]);
  fs.writeFileSync(filePath, result);
}

/**
 * Decrypt a file and return the plaintext buffer (in memory only).
 * Does NOT write the decrypted content to disk.
 *
 * @param {string} filePath - Path to the encrypted file
 * @returns {Buffer} Decrypted file contents
 */
function decryptFileToBuffer(filePath) {
  const key = getDerivedKey();
  const fileData = fs.readFileSync(filePath);

  // Extract IV from first 16 bytes
  const iv = fileData.subarray(0, IV_LENGTH);
  const encrypted = fileData.subarray(IV_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

/**
 * Check if a file is encrypted (heuristic: file was processed through encryptFile).
 * We use a marker file to track this, or check the uploads directory convention.
 * For simplicity, all files in grade-documents/ are treated as encrypted.
 */
function isEncrypted(filePath) {
  return filePath.includes('grade-documents');
}

module.exports = { encryptFile, decryptFileToBuffer, isEncrypted };
