/**
 * Signature Detector Utility
 * Analyzes uploaded letter of recommendation documents to detect
 * the presence of a signature from the department head.
 *
 * Strategy:
 * 1. Extract text from the document
 * 2. Look for signature indicators (keywords like "Signed", "Dept. Head", etc.)
 * 3. Verify the document contains recommendation-related language
 * 4. Return confidence level on whether the document appears legitimate
 *
 * NOTE: This is NOT a forgery-proof system. It provides an initial screening
 * layer. Final verification is always done by the admin who can visually
 * inspect the document.
 */

const { extractText } = require('./gradeExtractor');

/**
 * Signature-related keywords that suggest a signed document
 */
const SIGNATURE_INDICATORS = [
  'signature', 'signed', 'signatories', 'signatory',
  'noted by', 'approved by', 'recommended by', 'endorsed by',
  'department head', 'dept. head', 'dept head', 'chairperson',
  'program head', 'program chair', 'dean', 'coordinator',
  'head, department', 'head of department',
];

/**
 * Keywords that indicate a letter of recommendation
 */
const RECOMMENDATION_INDICATORS = [
  'recommend', 'recommendation', 'endorsement', 'certify',
  'hereby recommend', 'letter of recommendation',
  'to whom it may concern', 'peer tutor', 'tutoring',
  'academic performance', 'competent', 'qualified',
  'good standing', 'good moral', 'in good standing',
];

/**
 * Analyze a document for signature presence and legitimacy
 *
 * @param {string} filePath - path to uploaded file
 * @param {string} studentName - name of the applying student (to verify it's mentioned)
 * @returns {Object} { signatureDetected, confidence, message, isRecommendation, studentMentioned }
 */
async function analyzeRecommendation(filePath, studentName) {
  try {
    const text = await extractText(filePath);

    if (!text || text.trim().length < 20) {
      return {
        signatureDetected: false,
        confidence: 'none',
        message: 'Could not extract text from document. Admin will verify manually.',
        isRecommendation: false,
        studentMentioned: false,
      };
    }

    const lowerText = text.toLowerCase();

    // Check for signature indicators
    const signatureMatches = SIGNATURE_INDICATORS.filter(kw => lowerText.includes(kw));
    const hasSignatureIndicators = signatureMatches.length > 0;

    // Check for recommendation language
    const recMatches = RECOMMENDATION_INDICATORS.filter(kw => lowerText.includes(kw));
    const isRecommendation = recMatches.length >= 2; // at least 2 keywords

    // Check if student's name is mentioned
    let studentMentioned = false;
    if (studentName) {
      const nameParts = studentName.toLowerCase().split(' ').filter(p => p.length > 2);
      studentMentioned = nameParts.some(part => lowerText.includes(part));
    }

    // Determine confidence
    let confidence = 'none';
    let signatureDetected = false;

    if (hasSignatureIndicators && isRecommendation && studentMentioned) {
      confidence = 'high';
      signatureDetected = true;
    } else if (hasSignatureIndicators && isRecommendation) {
      confidence = 'medium';
      signatureDetected = true;
    } else if (hasSignatureIndicators || isRecommendation) {
      confidence = 'low';
      signatureDetected = hasSignatureIndicators;
    }

    // Build message
    let message = '';
    if (confidence === 'high') {
      message = `Document appears to be a signed letter of recommendation mentioning ${studentName}. Signature indicators found: ${signatureMatches.slice(0, 3).join(', ')}.`;
    } else if (confidence === 'medium') {
      message = `Document contains signature indicators and recommendation language, but student name was not clearly found.`;
    } else if (confidence === 'low') {
      message = `Document has limited indicators. ${hasSignatureIndicators ? 'Signature markers found but lacks recommendation language.' : 'Has recommendation language but no clear signature markers.'}`;
    } else {
      message = 'Could not detect signature or recommendation language. Admin will verify manually.';
    }

    return {
      signatureDetected,
      confidence,
      message,
      isRecommendation,
      studentMentioned,
      matchedSignatureKeywords: signatureMatches,
      matchedRecommendationKeywords: recMatches,
    };
  } catch (err) {
    console.error('[SignatureDetector] Error:', err.message);
    return {
      signatureDetected: false,
      confidence: 'none',
      message: `Document analysis failed: ${err.message}`,
      isRecommendation: false,
      studentMentioned: false,
    };
  }
}

module.exports = { analyzeRecommendation };
