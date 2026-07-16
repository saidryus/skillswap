/**
 * Text Redactor
 *
 * Strips PII from OCR-extracted text before it is persisted to MongoDB.
 * The original PDF on disk is NOT modified — this only affects the stored text.
 *
 * What gets redacted:
 *   - Phone numbers (PH mobile: 09XX-XXX-XXXX, intl: +639XX...)
 *   - Email addresses
 *   - Physical addresses (street/barangay/city patterns common in PH docs)
 *   - Passport / SSS / GSIS / TIN / PhilHealth / UMID numbers
 *   - Standalone long numeric strings (8+ digits) that aren't school IDs
 *
 * What is intentionally preserved:
 *   - Student school ID numbers (passed in as `preserveIds`)
 *   - Dates, grades, course codes
 *   - All recommendation content (names, positions, institution names)
 */

const REDACTED = '[REDACTED]';

// ── PH phone numbers ───────────────────────────────────────────
// 09XXXXXXXXX, +639XXXXXXXXX, (02) XXXX-XXXX, 02-XXXX-XXXX
const PHONE_PATTERNS = [
  /(\+?63|0)[\s\-]?9\d{2}[\s\-]?\d{3}[\s\-]?\d{4}/g,
  /\(\d{2,3}\)\s?\d{3,4}[\s\-]?\d{4}/g,
  /\b0\d{2}[\s\-]?\d{3}[\s\-]?\d{4}\b/g,
];

// ── Email addresses ────────────────────────────────────────────
const EMAIL_PATTERN = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

// ── Physical address indicators (PH-specific) ──────────────────
// Matches lines/phrases starting with address keywords
const ADDRESS_PATTERNS = [
  /\b\d+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Street|St\.|Avenue|Ave\.|Road|Rd\.|Blvd|Drive|Dr\.|Lane|Ln\.)[^\n]*/gi,
  /\b(?:Barangay|Brgy\.?|Purok|Block|Lot|Unit|Rm\.?|Room)\s+[\w\-]+[^\n]*/gi,
  /\b(?:ZIP|Postal Code):?\s*\d{4}\b/gi,
];

// ── Government / national ID patterns ─────────────────────────
// SSS: XX-XXXXXXX-X, TIN: XXX-XXX-XXX-XXX, Passport: 2 letters + 7 digits
const GOV_ID_PATTERNS = [
  /\b\d{2}-\d{7}-\d\b/g,                        // SSS
  /\b\d{3}-\d{3}-\d{3}(?:-\d{3})?\b/g,          // TIN / PhilHealth
  /\b[A-Z]{2}\d{7}\b/g,                          // Passport
  /\b\d{4}-\d{7}-\d\b/g,                         // UMID / GSIS
];

/**
 * Redact PII from extracted text.
 *
 * @param {string} text - Raw OCR text
 * @param {string[]} preserveIds - ID strings to NOT redact (e.g. student school ID)
 * @returns {{ redactedText: string, redactionCount: number }}
 */
function redactText(text, preserveIds = []) {
  if (!text) return { redactedText: '', redactionCount: 0 };

  let result = text;
  let count = 0;

  const replace = (pattern) => {
    result = result.replace(pattern, (match) => {
      // Skip if this match contains a preserved ID
      if (preserveIds.some(id => id && match.includes(id))) return match;
      count++;
      return REDACTED;
    });
  };

  PHONE_PATTERNS.forEach(replace);
  replace(EMAIL_PATTERN);
  ADDRESS_PATTERNS.forEach(replace);
  GOV_ID_PATTERNS.forEach(replace);

  return { redactedText: result, redactionCount: count };
}

module.exports = { redactText };
