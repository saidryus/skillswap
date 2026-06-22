/**
 * Grade Extractor Utility
 * Extracts grades from uploaded grade slip documents (PDF or image).
 * 
 * Strategy:
 * 1. Extract text from the document (PDF → pdf-parse, image → Tesseract OCR)
 * 2. Search for the course code in the extracted text
 * 3. Find the grade value (1.0-5.0) near the course code
 * 4. Return the detected grade or null if not found
 */

const fs = require('fs');
const path = require('path');

/**
 * Extract text from a PDF file using pdfjs-dist (Mozilla PDF.js)
 */
async function extractTextFromPdf(filePath) {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const buffer = fs.readFileSync(filePath);
  const uint8 = new Uint8Array(buffer);

  const doc = await pdfjsLib.getDocument({ data: uint8, useSystemFonts: true }).promise;
  let fullText = '';

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += pageText + '\n';
  }

  await doc.destroy();
  return fullText;
}

/**
 * Extract text from an image file using Tesseract OCR
 */
async function extractTextFromImage(filePath) {
  const Tesseract = require('tesseract.js');
  const { data: { text } } = await Tesseract.recognize(filePath, 'eng', {
    logger: () => {}, // suppress progress logs
  });
  return text;
}

/**
 * Extract text from a document (PDF or image)
 */
async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.pdf') {
    try {
      const text = await extractTextFromPdf(filePath);
      // If PDF has very little text, it might be a scanned document — try OCR
      if (text.trim().length < 20) {
        console.log('[GradeExtractor] PDF has minimal text, may be scanned. Text extraction limited.');
        return text;
      }
      return text;
    } catch (err) {
      console.error('[GradeExtractor] PDF parse error:', err.message);
      return '';
    }
  }

  if (['.jpg', '.jpeg', '.png'].includes(ext)) {
    try {
      return await extractTextFromImage(filePath);
    } catch (err) {
      console.error('[GradeExtractor] OCR error:', err.message);
      return '';
    }
  }

  return '';
}

/**
 * Find a grade value for a course code in extracted text.
 * 
 * Strategy: Find the course code in the text, then look for the nearest
 * grade value (1.0-5.0) that appears AFTER the course code within a reasonable
 * character distance.
 * 
 * Returns the grade as a number or null if not found.
 */
function findGradeForCourse(text, courseCode) {
  if (!text || !courseCode) return null;

  const normalizedCode = courseCode.replace(/[-\s]/g, '').toUpperCase();

  // Find all positions of the course code in the text
  const normalizedText = text.replace(/[-]/g, '');
  const upperText = normalizedText.toUpperCase();

  const codeIndex = upperText.indexOf(normalizedCode);
  if (codeIndex === -1) return null;

  // Look at the text AFTER the course code, within 150 chars
  // (covers: course name + units + grade)
  const afterCode = normalizedText.substring(codeIndex + normalizedCode.length, codeIndex + normalizedCode.length + 150);

  // Find grade patterns (decimal): 1.00, 1.25, 1.50, 1.75, 2.00, etc.
  const gradePattern = /\b([1-5])\.([0-9]{2})\b/g;
  const matches = [...afterCode.matchAll(gradePattern)];

  if (matches.length > 0) {
    const grade = parseFloat(matches[0][0]);
    if (grade >= 1.0 && grade <= 5.0) return grade;
  }

  // Try single decimal: 1.5, 2.0, 3.0
  const singleDecPattern = /\b([1-5])\.([0-9])\b/g;
  const singleMatches = [...afterCode.matchAll(singleDecPattern)];

  if (singleMatches.length > 0) {
    const grade = parseFloat(singleMatches[0][0]);
    if (grade >= 1.0 && grade <= 5.0) return grade;
  }

  return null;
}

/**
 * Main function: extract grade from a document for a specific course.
 * Also verifies the student ID matches.
 * 
 * @param {string} filePath - path to the uploaded file
 * @param {string} courseCode - the course code to search for (e.g. "IT201")
 * @param {string} studentIdNumber - the student's ID to verify against the document
 * @returns {Object} { grade, idVerified, extractedText, confidence, message }
 */
async function extractGradeFromDocument(filePath, courseCode, studentIdNumber) {
  try {
    const text = await extractText(filePath);

    if (!text || text.trim().length < 10) {
      return {
        grade: null,
        idVerified: false,
        extractedText: '',
        confidence: 'none',
        message: 'Could not extract text from document. Admin will enter the grade manually.',
      };
    }

    // Verify student ID appears in the document
    let idVerified = false;
    if (studentIdNumber) {
      const normalizedId = studentIdNumber.replace(/[-\s]/g, '');
      const normalizedText = text.replace(/[-\s]/g, '');
      idVerified = normalizedText.includes(normalizedId);
    }

    const grade = findGradeForCourse(text, courseCode);

    if (grade !== null) {
      return {
        grade,
        idVerified,
        extractedText: text.substring(0, 500),
        confidence: idVerified ? 'high' : 'medium',
        message: idVerified
          ? `Detected grade ${grade.toFixed(2)} for ${courseCode}. Student ID verified.`
          : `Detected grade ${grade.toFixed(2)} for ${courseCode}, but student ID was not found in the document.`,
      };
    }

    return {
      grade: null,
      idVerified,
      extractedText: text.substring(0, 500),
      confidence: 'low',
      message: `Could not find grade for ${courseCode} in document. Admin will enter manually.${idVerified ? ' Student ID was verified.' : ' Student ID was also not found.'}`,
    };
  } catch (err) {
    console.error('[GradeExtractor] Error:', err.message);
    return {
      grade: null,
      idVerified: false,
      extractedText: '',
      confidence: 'error',
      message: `Grade extraction failed: ${err.message}`,
    };
  }
}

module.exports = { extractGradeFromDocument, extractText, findGradeForCourse };
