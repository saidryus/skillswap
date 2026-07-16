/**
 * Recommendation Letter Analyzer
 * 
 * AI-assisted analysis of uploaded recommendation letters.
 * This module does NOT determine document authenticity.
 * It only extracts information, detects patterns, and identifies inconsistencies.
 * The administrator always has the final decision.
 * 
 * Architecture:
 * 1. OCR Service → extractText (from gradeExtractor.js)
 * 2. AI Analysis Service → analyzeRecommendationContent
 * 3. Subject Alignment Service → computeSubjectAlignment
 * 4. Confidence Scoring Service → computeConfidenceScore
 */

const { extractText } = require('./gradeExtractor');

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */

const RECOMMENDATION_PHRASES = [
  'i highly recommend',
  'i strongly recommend',
  'i recommend',
  'i endorse',
  'i am pleased to recommend',
  'it is my pleasure to recommend',
  'is qualified to',
  'has demonstrated',
  'i am confident',
  'without reservation',
  'wholeheartedly recommend',
  'has shown exceptional',
  'has proven to be',
  'is well-suited',
  'is capable of',
  'has excelled in',
  'i certify that',
  'to whom it may concern',
];

const SIGNATURE_INDICATORS = [
  'signature', 'signed', 'noted by', 'approved by',
  'recommended by', 'endorsed by', 'respectfully',
  'sincerely', 'truly yours', 'very truly yours',
  'dept. head', 'department head', 'chairperson',
  'program head', 'program chair', 'dean', 'coordinator',
  'faculty', 'professor', 'instructor', 'head of department',
];

const LETTERHEAD_INDICATORS = [
  'university', 'college', 'campus', 'department of',
  'office of', 'school of', 'institute', 'republic of the philippines',
  'commission on higher education', 'ched',
];

const SOFT_SKILLS = [
  'communication', 'leadership', 'problem solving', 'problem-solving',
  'patience', 'teamwork', 'collaboration', 'critical thinking',
  'time management', 'adaptability', 'creativity', 'analytical',
  'interpersonal', 'mentoring', 'teaching', 'presentation',
  'organization', 'responsibility', 'initiative', 'empathy',
  'dedication', 'punctuality', 'professionalism', 'discipline',
];

const POSITION_KEYWORDS = [
  'professor', 'instructor', 'faculty', 'dean', 'chairperson',
  'department head', 'program head', 'coordinator', 'adviser',
  'advisor', 'teacher', 'lecturer', 'director',
];

/* ═══════════════════════════════════════════════════════════════
   OCR SERVICE
   ═══════════════════════════════════════════════════════════════ */

/**
 * Extract text from uploaded document
 * @param {string} filePath
 * @returns {Object} { text, success, ocrConfidence }
 */
async function extractDocumentText(filePath) {
  try {
    const text = await extractText(filePath);
    
    if (!text || text.trim().length < 20) {
      return {
        text: '',
        success: false,
        ocrConfidence: 0,
        message: 'Could not extract text from document.',
      };
    }

    // Estimate OCR confidence based on text quality
    const wordCount = text.split(/\s+/).length;
    const hasGarbage = (text.match(/[^\w\s.,;:!?'"()\-\/]/g) || []).length;
    const garbageRatio = hasGarbage / text.length;
    
    let ocrConfidence = 100;
    if (garbageRatio > 0.1) ocrConfidence -= 30;
    if (garbageRatio > 0.2) ocrConfidence -= 20;
    if (wordCount < 30) ocrConfidence -= 20;
    if (wordCount < 15) ocrConfidence -= 20;
    ocrConfidence = Math.max(0, Math.min(100, ocrConfidence));

    return {
      text,
      success: true,
      ocrConfidence,
      wordCount,
      message: `Successfully extracted ${wordCount} words.`,
    };
  } catch (err) {
    return {
      text: '',
      success: false,
      ocrConfidence: 0,
      message: `OCR failed: ${err.message}`,
    };
  }
}

/* ═══════════════════════════════════════════════════════════════
   AI ANALYSIS SERVICE
   ═══════════════════════════════════════════════════════════════ */

/**
 * Analyze recommendation letter content.
 * 
 * Priority:
 * 1. ML Model (trained SVM/LogReg — fast, no API cost)
 * 2. LLM (OpenAI — richer extraction but requires API key)
 * 3. Rule-based fallback (pattern matching — always available)
 * 
 * @param {string} text - Extracted text from OCR
 * @param {string} studentName - Applicant's full name
 * @param {string} studentId - Applicant's student ID
 * @returns {Object} Structured analysis result
 */
async function analyzeRecommendationContent(text, studentName, studentId) {
  const { predictFromText, isMLServiceAvailable } = require('./mlRecommendationClient');

  // ── Try ML Service first (trained model — fastest, no cost) ──
  const mlAvailable = await isMLServiceAvailable();
  if (mlAvailable) {
    // Clean up OCR text for better ML prediction (remove excessive whitespace, normalize)
    const cleanedText = text.replace(/\s+/g, ' ').trim();
    console.log('[RecommendationAnalyzer] Sending to ML (first 200 chars):', cleanedText.substring(0, 200));
    const mlResult = await predictFromText(cleanedText);
    if (mlResult.success) {
      console.log('[RecommendationAnalyzer] Using ML model for analysis');

      // ML gives us subjects + strength. We still need other fields via simple extraction.
      const supplementary = extractSupplementaryInfo(text, studentName, studentId);

      return {
        facultyName: supplementary.facultyName,
        facultyPosition: supplementary.facultyPosition,
        department: supplementary.department,
        date: supplementary.date,
        studentMentioned: supplementary.studentMentioned,
        studentIdMentioned: checkStudentId(text, studentId),
        recommendationLanguage: [],
        recommendationStrength: mlResult.recommendationStrength.toLowerCase(),
        signatureDetected: supplementary.signatureDetected,
        signatureIndicators: supplementary.signatureIndicators,
        letterheadDetected: supplementary.letterheadDetected,
        letterheadIndicators: [],
        templateUsed: supplementary.templateUsed,
        subjectsMentioned: mlResult.recommendedSubjects,
        softSkills: mlResult.softSkills || supplementary.softSkills,
        summary: `ML model predicts ${mlResult.recommendationStrength} recommendation for: ${mlResult.recommendedSubjects.join(', ') || 'no specific subjects'}. Confidence: ${Math.round(mlResult.confidence * 100)}%.`,
        observations: [],
        anomalies: buildAnomaliesFromML(supplementary, mlResult, text),
        wordCount: text.split(/\s+/).length,
        analysisMethod: 'ml',
        llmModel: null,
        tokensUsed: 0,
        mlConfidence: mlResult.confidence,
        mlStrengthConfidence: mlResult.strengthConfidence,
        mlSubjectConfidences: mlResult.subjectConfidences,
        mlStrengthProbabilities: mlResult.strengthProbabilities,
      };
    }
  }

  // ── Try LLM second (richer extraction) ──
  const { analyzeLetter } = require('./llmDocumentAnalyzer');
  const llmResult = await analyzeLetter(text, studentName, studentId);

  if (llmResult.success) {
    console.log('[RecommendationAnalyzer] Using LLM for analysis');
    const r = llmResult.result;
    return {
      facultyName: r.faculty.name,
      facultyPosition: r.faculty.position,
      department: r.faculty.department,
      date: r.dateFound,
      studentMentioned: r.studentMentioned,
      studentIdMentioned: checkStudentId(text, studentId),
      recommendationLanguage: [],
      recommendationStrength: r.recommendationStrength,
      signatureDetected: r.signaturePresent,
      signatureIndicators: r.signaturePresent ? ['detected by LLM'] : [],
      letterheadDetected: r.letterheadPresent,
      letterheadIndicators: r.letterheadPresent ? ['detected by LLM'] : [],
      templateUsed: r.templateUsed,
      subjectsMentioned: r.recommendedSubjects,
      softSkills: r.softSkills,
      summary: r.summary,
      observations: r.observations,
      anomalies: buildAnomalies(r, text),
      wordCount: text.split(/\s+/).length,
      analysisMethod: 'llm',
      llmModel: llmResult.model,
      tokensUsed: llmResult.tokensUsed,
    };
  }

  // ── Fallback to rule-based ──
  console.log('[RecommendationAnalyzer] Using rule-based fallback');
  return analyzeWithRules(text, studentName, studentId);
}

/**
 * Extract supplementary info that the ML model doesn't provide
 * (faculty name, signature, letterhead, date, soft skills)
 */
function extractSupplementaryInfo(text, studentName, studentId) {
  const lowerText = text.toLowerCase();
  
  const info = {
    facultyName: null,
    facultyPosition: null,
    department: null,
    date: null,
    studentMentioned: false,
    signatureDetected: false,
    signatureIndicators: [],
    letterheadDetected: false,
    templateUsed: false,
    softSkills: [],
  };

  // Student name
  if (studentName) {
    const nameParts = studentName.toLowerCase().split(' ').filter(p => p.length > 2);
    const fullNameMatch = lowerText.includes(studentName.toLowerCase());
    const partialMatch = nameParts.some(part => lowerText.includes(part));
    info.studentMentioned = fullNameMatch || partialMatch;
    console.log('[SupplementaryInfo] Student name check:', { studentName, nameParts, fullNameMatch, partialMatch, mentioned: info.studentMentioned, textSample: lowerText.substring(0, 300) });
  }

  // Signature
  SIGNATURE_INDICATORS.forEach(ind => {
    if (lowerText.includes(ind)) {
      info.signatureDetected = true;
      info.signatureIndicators.push(ind);
    }
  });

  // Letterhead
  info.letterheadDetected = LETTERHEAD_INDICATORS.some(ind => lowerText.includes(ind));

  // Date
  const datePatterns = [/(\w+ \d{1,2},? \d{4})/i, /(\d{1,2}\s+\w+\s+\d{4})/, /(\d{1,2}\/\d{1,2}\/\d{4})/, /(\d{4}-\d{2}-\d{2})/];
  for (const p of datePatterns) {
    const m = text.match(p);
    if (m) { info.date = m[1]; break; }
  }

  // Faculty position and name extraction
  POSITION_KEYWORDS.forEach(kw => {
    if (lowerText.includes(kw) && !info.facultyPosition) info.facultyPosition = kw;
  });

  // Extract faculty name — look for patterns like "Dr. Name", "I, Name,", or name near position keywords
  const namePatterns = [
    /(?:Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/,  // Dr. Maria Theresa Gonzales
    /I,\s+(?:Dr\.\s+|Prof\.\s+|Mr\.\s+|Ms\.\s+|Mrs\.\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/,  // I, Dr. Maria Theresa Gonzales
    /(?:Signed|Respectfully|Noted by)[,:\s]+(?:Dr\.\s+|Prof\.\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/i,  // Signed: Dr. Name
    /(?:Department Head|Program Head|Chairperson|Dean|Coordinator)[,:\s]+(?:Dr\.\s+|Prof\.\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/i,  // Department Head: Name
    /(?:Dr\.|Prof\.)\s*([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){1,3})/,  // Dr. Name (relaxed)
  ];

  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match && match[1] && match[1].length > 5) {
      info.facultyName = match[1].trim();
      break;
    }
  }

  // Department extraction
  const deptPatterns = [
    /[Dd]epartment\s+of\s+([A-Za-z\s]+?)(?:\n|,|\.|\sat)/,
    /[Dd]epartment\s+Head[,:\s]+([A-Za-z\s]+?)(?:\n|,|\.)/,
    /[Cc]ollege\s+of\s+([A-Za-z\s]+?)(?:\n|,|\.)/,
  ];
  for (const pattern of deptPatterns) {
    const match = text.match(pattern);
    if (match && match[1] && match[1].trim().length > 3) {
      info.department = match[1].trim();
      break;
    }
  }

  // Soft skills
  SOFT_SKILLS.forEach(skill => {
    if (lowerText.includes(skill)) info.softSkills.push(skill);
  });

  return info;
}

/**
 * Build anomalies from ML + supplementary analysis
 */
function buildAnomaliesFromML(supplementary, mlResult, text) {
  const anomalies = [];
  const wordCount = text.split(/\s+/).length;

  if (wordCount < 50) anomalies.push('Document is unusually short (less than 50 words)');
  if (!supplementary.studentMentioned) anomalies.push('Student name not found in document');
  if (!supplementary.signatureDetected) anomalies.push('No signature detected');
  if (mlResult.recommendationStrength === 'None') anomalies.push('No recommendation language detected');
  if (!supplementary.letterheadDetected) anomalies.push('No institutional letterhead detected');
  if (!supplementary.date) anomalies.push('No date detected in document');
  if (!supplementary.facultyPosition) anomalies.push('No faculty position/title detected');

  return anomalies;
}

/**
 * Check if student ID appears in text
 */
function checkStudentId(text, studentId) {
  if (!studentId) return false;
  const normalizedId = studentId.replace(/[-\s]/g, '');
  const normalizedText = text.replace(/[-\s]/g, '');
  return normalizedText.includes(normalizedId);
}

/**
 * Build anomaly list from LLM result
 */
function buildAnomalies(result, text) {
  const anomalies = [];
  const wordCount = text.split(/\s+/).length;

  if (wordCount < 50) anomalies.push('Document is unusually short (less than 50 words)');
  if (!result.studentMentioned) anomalies.push('Student name not found in document');
  if (!result.signaturePresent) anomalies.push('No signature detected');
  if (result.recommendationStrength === 'none') anomalies.push('No recommendation language detected');
  if (!result.letterheadPresent) anomalies.push('No institutional letterhead detected');
  if (!result.dateFound) anomalies.push('No date detected in document');
  if (!result.faculty.name && !result.faculty.position) anomalies.push('No faculty information detected');
  if (result.recommendedSubjects.length === 0) anomalies.push('No specific subjects mentioned');

  return anomalies;
}

/**
 * Rule-based fallback analysis (original pattern matching approach)
 * Used when LLM is unavailable (no API key, rate limit, error)
 */
function analyzeWithRules(text, studentName, studentId) {
  const lowerText = text.toLowerCase();
  const analysis = {
    facultyName: null,
    facultyPosition: null,
    department: null,
    date: null,
    studentMentioned: false,
    studentIdMentioned: false,
    recommendationLanguage: [],
    recommendationStrength: 'none',
    signatureDetected: false,
    signatureIndicators: [],
    letterheadDetected: false,
    letterheadIndicators: [],
    templateUsed: false,
    subjectsMentioned: [],
    softSkills: [],
    summary: '',
    observations: [],
    anomalies: [],
    wordCount: text.split(/\s+/).length,
    analysisMethod: 'rule-based',
    llmModel: null,
    tokensUsed: 0,
  };

  // Student Name Detection
  if (studentName) {
    const nameParts = studentName.toLowerCase().split(' ').filter(p => p.length > 2);
    analysis.studentMentioned = lowerText.includes(studentName.toLowerCase()) ||
      nameParts.some(part => lowerText.includes(part));
  }

  // Student ID
  analysis.studentIdMentioned = checkStudentId(text, studentId);

  // Recommendation Language
  RECOMMENDATION_PHRASES.forEach(phrase => {
    if (lowerText.includes(phrase)) analysis.recommendationLanguage.push(phrase);
  });
  const recCount = analysis.recommendationLanguage.length;
  if (recCount >= 4) analysis.recommendationStrength = 'strong';
  else if (recCount >= 2) analysis.recommendationStrength = 'moderate';
  else if (recCount >= 1) analysis.recommendationStrength = 'weak';

  // Signature
  SIGNATURE_INDICATORS.forEach(indicator => {
    if (lowerText.includes(indicator)) {
      analysis.signatureDetected = true;
      analysis.signatureIndicators.push(indicator);
    }
  });

  // Letterhead
  LETTERHEAD_INDICATORS.forEach(indicator => {
    if (lowerText.includes(indicator)) {
      analysis.letterheadDetected = true;
      analysis.letterheadIndicators.push(indicator);
    }
  });

  // Soft Skills
  SOFT_SKILLS.forEach(skill => {
    if (lowerText.includes(skill)) analysis.softSkills.push(skill);
  });

  // Faculty Position
  POSITION_KEYWORDS.forEach(keyword => {
    if (lowerText.includes(keyword) && !analysis.facultyPosition) {
      analysis.facultyPosition = keyword;
    }
  });

  // Date
  const datePatterns = [/(\w+ \d{1,2},? \d{4})/i, /(\d{1,2}\s+\w+\s+\d{4})/, /(\d{1,2}\/\d{1,2}\/\d{4})/, /(\d{4}-\d{2}-\d{2})/];
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) { analysis.date = match[1]; break; }
  }

  // Department
  const deptMatch = text.match(/[Dd]epartment\s+of\s+([A-Za-z\s]+?)(?:\n|,|\.)/);
  if (deptMatch) analysis.department = deptMatch[1].trim();

  // Anomalies
  if (analysis.wordCount < 50) analysis.anomalies.push('Document is unusually short (less than 50 words)');
  if (!analysis.studentMentioned) analysis.anomalies.push('Student name not found in document');
  if (!analysis.signatureDetected) analysis.anomalies.push('No signature indicators detected');
  if (analysis.recommendationStrength === 'none') analysis.anomalies.push('No recommendation language detected');
  if (!analysis.letterheadDetected) analysis.anomalies.push('No institutional letterhead indicators detected');
  if (!analysis.date) analysis.anomalies.push('No date detected in document');
  if (!analysis.facultyPosition) analysis.anomalies.push('No faculty position/title detected');

  // Summary (rule-based)
  analysis.summary = `Document contains ${analysis.wordCount} words. ` +
    `Recommendation strength: ${analysis.recommendationStrength}. ` +
    `${analysis.signatureDetected ? 'Signature detected.' : 'No signature detected.'} ` +
    `${analysis.softSkills.length > 0 ? `Soft skills: ${analysis.softSkills.join(', ')}.` : 'No soft skills detected.'}`;

  return analysis;
}

/* ═══════════════════════════════════════════════════════════════
   SUBJECT ALIGNMENT SERVICE
   ═══════════════════════════════════════════════════════════════ */

/**
 * Compare tutor-selected subjects against LLM-extracted or text-mentioned subjects.
 * This is purely deterministic — no AI involved in the comparison.
 * 
 * @param {Array<string>} selectedSubjects - Subjects the tutor selected (course names/codes)
 * @param {string} text - Document text to search in
 * @param {Array<string>} llmSubjects - Subjects extracted by LLM (standardized names)
 * @returns {Object} { alignments, alignmentPercentage, mentionedSubjects }
 */
function computeSubjectAlignment(selectedSubjects, text, llmSubjects = []) {
  const lowerText = text.toLowerCase();
  
  const alignments = selectedSubjects.map(subject => {
    const subjectLower = subject.toLowerCase();
    const subjectWords = subjectLower.split(/[\s-]+/).filter(w => w.length > 3);

    // Check against LLM-extracted subjects first (semantic match already done by LLM)
    if (llmSubjects.length > 0) {
      const llmMatch = llmSubjects.some(llmSub => {
        const llmLower = llmSub.toLowerCase();
        // Exact match
        if (llmLower === subjectLower) return true;
        // Partial overlap (share significant words)
        const llmWords = llmLower.split(/[\s-]+/).filter(w => w.length > 3);
        const shared = subjectWords.filter(w => llmWords.includes(w) || llmLower.includes(w));
        return shared.length >= 1;
      });
      if (llmMatch) return { subject, status: 'matched', confidence: 'exact' };
    }

    // Fallback: text search
    if (lowerText.includes(subjectLower)) {
      return { subject, status: 'matched', confidence: 'exact' };
    }
    
    const matchedWords = subjectWords.filter(word => lowerText.includes(word));
    if (matchedWords.length >= 2 || (subjectWords.length === 1 && matchedWords.length === 1)) {
      return { subject, status: 'matched', confidence: 'partial' };
    }
    
    if (matchedWords.length === 1 && subjectWords.length > 1) {
      return { subject, status: 'uncertain', confidence: 'weak' };
    }

    return { subject, status: 'not_mentioned', confidence: 'none' };
  });

  const matched = alignments.filter(a => a.status === 'matched').length;
  const total = alignments.length;
  const alignmentPercentage = total > 0 ? Math.round((matched / total) * 100) : 0;

  return {
    alignments,
    alignmentPercentage,
    matchedCount: matched,
    totalSubjects: total,
  };
}

/* ═══════════════════════════════════════════════════════════════
   CONFIDENCE SCORING SERVICE
   ═══════════════════════════════════════════════════════════════ */

/**
 * Compute overall confidence score using weighted heuristics.
 * This score indicates document completeness, extractability, and consistency.
 * It does NOT evaluate formatting or template usage.
 * 
 * Weights:
 *   OCR Confidence:                 20%
 *   Faculty Information:            20%
 *   Signature Detection:            15%
 *   Recommendation Strength:        15%
 *   Subject Alignment:              20%
 *   Required Sections Present:      10%
 * 
 * @param {Object} params
 * @returns {Object} { score, level, breakdown }
 */
function computeConfidenceScore({
  ocrConfidence,
  recommendationStrength,
  signatureDetected,
  letterheadDetected,
  alignmentPercentage,
  anomalyCount,
  studentMentioned,
  dateMentioned,
  facultyName,
  facultyPosition,
  facultyDepartment,
}) {
  const breakdown = {};

  // OCR Confidence: 20 points
  breakdown.ocrConfidence = Math.round((ocrConfidence / 100) * 20);

  // Faculty Information Completeness: 20 points
  // Name = 8, Position = 6, Department = 6
  let facultyScore = 0;
  if (facultyName) facultyScore += 8;
  if (facultyPosition) facultyScore += 6;
  if (facultyDepartment) facultyScore += 6;
  breakdown.facultyInformation = facultyScore;

  // Signature Detection: 15 points
  breakdown.signatureDetected = signatureDetected ? 15 : 0;

  // Recommendation Strength (from ML): 15 points
  const recScores = { strong: 15, moderate: 12, weak: 7, none: 0 };
  breakdown.recommendationStrength = recScores[recommendationStrength] || 0;

  // Subject Alignment: 20 points
  breakdown.subjectAlignment = Math.round((alignmentPercentage / 100) * 20);

  // Required Sections Present: 10 points
  // Student named = 4, date present = 3, letterhead = 3
  let sectionsScore = 0;
  if (studentMentioned) sectionsScore += 4;
  if (dateMentioned) sectionsScore += 3;
  if (letterheadDetected) sectionsScore += 3;
  breakdown.requiredSections = sectionsScore;

  // Calculate total
  const score = Math.max(0, Math.min(100,
    breakdown.ocrConfidence +
    breakdown.facultyInformation +
    breakdown.signatureDetected +
    breakdown.recommendationStrength +
    breakdown.subjectAlignment +
    breakdown.requiredSections
  ));

  // Determine level
  let level = 'low';
  if (score >= 70) level = 'high';
  else if (score >= 45) level = 'medium';

  return { score, level, breakdown };
}

/* ═══════════════════════════════════════════════════════════════
   MAIN ORCHESTRATOR
   ═══════════════════════════════════════════════════════════════ */

/**
 * Full analysis pipeline for a recommendation letter.
 * 
 * @param {string} filePath - Path to uploaded file
 * @param {Object} params
 * @param {string} params.studentName - Full name of the applicant
 * @param {string} params.studentId - Student ID number
 * @param {Array<string>} params.selectedSubjects - Subjects the tutor selected
 * @returns {Object} Complete analysis result
 */
async function analyzeRecommendationLetter(filePath, { studentName, studentId, selectedSubjects }) {
  // Step 1: OCR
  const ocrResult = await extractDocumentText(filePath);
  
  if (!ocrResult.success) {
    return {
      success: false,
      ocrResult,
      analysis: null,
      alignment: null,
      confidence: { score: 0, level: 'low', breakdown: {} },
      message: ocrResult.message,
    };
  }

  // Step 2: AI Analysis (ML → LLM → rule-based fallback) — runs on full unredacted text
  const analysis = await analyzeRecommendationContent(ocrResult.text, studentName, studentId);

  // Step 3: Subject Alignment (deterministic — uses LLM-extracted subjects for better matching)
  const alignment = computeSubjectAlignment(
    selectedSubjects || [],
    ocrResult.text,
    analysis.subjectsMentioned || []
  );

  // Step 4: Confidence Score (deterministic — no template dependency)
  const confidence = computeConfidenceScore({
    ocrConfidence: ocrResult.ocrConfidence,
    recommendationStrength: analysis.recommendationStrength,
    signatureDetected: analysis.signatureDetected,
    letterheadDetected: analysis.letterheadDetected,
    alignmentPercentage: alignment.alignmentPercentage,
    anomalyCount: analysis.anomalies.length,
    studentMentioned: analysis.studentMentioned,
    dateMentioned: !!analysis.date,
    facultyName: analysis.facultyName,
    facultyPosition: analysis.facultyPosition,
    facultyDepartment: analysis.department,
  });

  // Step 5: Redact PII from the text before persisting to the database.
  // The PDF on disk is not modified — only the stored OCR text is cleaned.
  const { redactText } = require('./textRedactor');
  const { redactedText, redactionCount } = redactText(ocrResult.text, [studentId]);
  if (redactionCount > 0) {
    console.log(`[RecommendationAnalyzer] Redacted ${redactionCount} PII instance(s) from extracted text before storage`);
  }

  return {
    success: true,
    ocrResult: {
      text: redactedText,       // stored in DB — PII stripped
      ocrConfidence: ocrResult.ocrConfidence,
      wordCount: ocrResult.wordCount,
      redactionCount,
    },
    analysis,
    alignment,
    confidence,
    message: `Analysis complete. Confidence: ${confidence.score}% (${confidence.level}). Method: ${analysis.analysisMethod || 'unknown'}.${redactionCount > 0 ? ` ${redactionCount} PII item(s) redacted from stored text.` : ''}`,
  };
}

module.exports = {
  analyzeRecommendationLetter,
  extractDocumentText,
  analyzeRecommendationContent,
  computeSubjectAlignment,
  computeConfidenceScore,
};
