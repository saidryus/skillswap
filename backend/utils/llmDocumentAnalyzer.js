/**
 * LLM Document Understanding Module
 * 
 * Replaces keyword/pattern-matching with semantic understanding via LLM.
 * The LLM extracts structured information from recommendation letters.
 * 
 * Design Principles:
 * - LLM handles ONLY document understanding (natural language → structured data)
 * - Business rules remain deterministic
 * - Subject alignment remains deterministic (string comparison)
 * - Confidence scoring remains deterministic (weighted arithmetic)
 * - The AI does NOT approve or reject applications
 * - The administrator remains the final decision maker
 * 
 * Architecture:
 *   Recommendation Letter → OCR → LLM Document Understanding → Structured JSON
 *   → Deterministic Validation → Administrator Review
 */

const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * System prompt for the LLM document analyzer.
 * Instructs the model to extract structured information only.
 */
const SYSTEM_PROMPT = `You are a document analysis assistant for a peer tutoring platform at a Philippine college.

Your task is to READ a recommendation letter and extract structured information from it.

You must NOT:
- Judge whether the document is real or fake
- Decide whether the student should be approved
- Make any recommendations about acceptance

You must ONLY:
- Extract factual information present in the document
- Infer recommendation strength from context and tone
- Identify subjects mentioned (map to standard academic subject names)
- Identify soft skills mentioned or implied
- Summarize the document content
- Note any missing sections or inconsistencies

Return ONLY valid JSON matching the specified schema. No explanations outside the JSON.`;

/**
 * User prompt template for analyzing a recommendation letter.
 */
function buildUserPrompt(extractedText, studentName, studentId) {
  return `Analyze the following recommendation letter and extract structured information.

Student applying: ${studentName} (ID: ${studentId || 'unknown'})

--- DOCUMENT TEXT ---
${extractedText}
--- END DOCUMENT ---

Extract the following and return as JSON:

{
  "faculty": {
    "name": "Faculty member's full name or null if not found",
    "position": "Their title/position or null",
    "department": "Their department or null"
  },
  "recommendationStrength": "Strong | Moderate | Weak | None",
  "recommendedSubjects": ["Array of academic subjects mentioned or implied, use standard names like 'Programming', 'Database Systems', 'Web Development', 'Networking', 'Information Security', 'Data Structures', 'Systems Administration', 'Software Engineering', etc."],
  "softSkills": ["Array of soft skills mentioned or implied, e.g. 'Communication', 'Leadership', 'Patience', 'Problem Solving', 'Teamwork', 'Critical Thinking', 'Mentoring', 'Teaching Ability', 'Adaptability', etc."],
  "summary": "A 1-2 sentence summary of the recommendation letter content",
  "observations": ["Array of factual observations about the document, e.g. 'Signature block is present', 'Date is included', 'Institutional letterhead detected', 'No subjects explicitly mentioned', 'Document is very short', etc."],
  "dateFound": "The date mentioned in the document or null",
  "studentMentioned": true/false,
  "signaturePresent": true/false,
  "letterheadPresent": true/false,
  "templateUsed": true/false
}

Return ONLY the JSON object. No markdown, no explanation.`;
}

/**
 * Analyze a recommendation letter using LLM.
 * 
 * @param {string} extractedText - OCR-extracted text from the document
 * @param {string} studentName - Full name of the student applying
 * @param {string} studentId - Student ID number
 * @returns {Object} Structured analysis result
 */
async function analyzeLetter(extractedText, studentName, studentId) {
  // Validate input
  if (!extractedText || extractedText.trim().length < 10) {
    return {
      success: false,
      error: 'Insufficient text to analyze',
      result: getEmptyResult(),
    };
  }

  // Check if API key is configured
  if (!process.env.OPENAI_API_KEY) {
    console.warn('[LLM Analyzer] OPENAI_API_KEY not set. Falling back to rule-based analysis.');
    return {
      success: false,
      error: 'LLM service not configured (OPENAI_API_KEY missing)',
      result: getEmptyResult(),
      fallbackUsed: true,
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(extractedText, studentName, studentId) },
      ],
      temperature: 0.1, // Low temperature for consistent, factual extraction
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return {
        success: false,
        error: 'Empty response from LLM',
        result: getEmptyResult(),
      };
    }

    const parsed = JSON.parse(content);

    // Normalize the result
    const result = {
      faculty: {
        name: parsed.faculty?.name || null,
        position: parsed.faculty?.position || null,
        department: parsed.faculty?.department || null,
      },
      recommendationStrength: normalizeStrength(parsed.recommendationStrength),
      recommendedSubjects: Array.isArray(parsed.recommendedSubjects) ? parsed.recommendedSubjects : [],
      softSkills: Array.isArray(parsed.softSkills) ? parsed.softSkills : [],
      summary: parsed.summary || '',
      observations: Array.isArray(parsed.observations) ? parsed.observations : [],
      dateFound: parsed.dateFound || null,
      studentMentioned: !!parsed.studentMentioned,
      signaturePresent: !!parsed.signaturePresent,
      letterheadPresent: !!parsed.letterheadPresent,
      templateUsed: !!parsed.templateUsed,
    };

    return {
      success: true,
      result,
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      tokensUsed: response.usage?.total_tokens || 0,
    };
  } catch (err) {
    console.error('[LLM Analyzer] Error:', err.message);
    return {
      success: false,
      error: `LLM analysis failed: ${err.message}`,
      result: getEmptyResult(),
    };
  }
}

/**
 * Normalize recommendation strength to a standard value
 */
function normalizeStrength(value) {
  if (!value) return 'none';
  const lower = value.toLowerCase().trim();
  if (lower.includes('strong')) return 'strong';
  if (lower.includes('moderate')) return 'moderate';
  if (lower.includes('weak')) return 'weak';
  if (lower.includes('none') || lower.includes('no ')) return 'none';
  return 'none';
}

/**
 * Return empty/default result structure
 */
function getEmptyResult() {
  return {
    faculty: { name: null, position: null, department: null },
    recommendationStrength: 'none',
    recommendedSubjects: [],
    softSkills: [],
    summary: '',
    observations: [],
    dateFound: null,
    studentMentioned: false,
    signaturePresent: false,
    letterheadPresent: false,
    templateUsed: false,
  };
}

module.exports = { analyzeLetter, getEmptyResult };
