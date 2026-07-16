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
 * Preprocesses: removes table lines by detecting straight lines and whiting them out
 */
async function extractTextFromImage(filePath) {
  const Tesseract = require('tesseract.js');
  const sharp = require('sharp');
  const fs = require('fs');

  const preprocessedPath = filePath + '.preprocessed.png';
  try {
    // Get image metadata
    const metadata = await sharp(filePath).metadata();
    const width = metadata.width;
    const height = metadata.height;

    // Step 1: Create a high-res grayscale version
    const upscaleWidth = Math.max(width, 2500);
    let pipeline = sharp(filePath)
      .resize({ width: upscaleWidth, withoutEnlargement: false })
      .grayscale();

    // Step 2: Get raw pixel buffer to manually remove table lines
    const { data: rawBuffer, info } = await pipeline
      .raw()
      .toBuffer({ resolveWithObject: true });

    const w = info.width;
    const h = info.height;
    const buf = Buffer.from(rawBuffer);

    // Remove horizontal lines: if a row has >60% dark pixels in a line, white it out
    for (let y = 0; y < h; y++) {
      let darkCount = 0;
      for (let x = 0; x < w; x++) {
        if (buf[y * w + x] < 128) darkCount++;
      }
      // If more than 40% of the row is dark, it's likely a horizontal line
      if (darkCount > w * 0.4) {
        for (let x = 0; x < w; x++) {
          buf[y * w + x] = 255; // white out the line
        }
      }
    }

    // Remove vertical lines: if a column has >50% dark pixels, white it out
    for (let x = 0; x < w; x++) {
      let darkCount = 0;
      for (let y = 0; y < h; y++) {
        if (buf[y * w + x] < 128) darkCount++;
      }
      if (darkCount > h * 0.4) {
        for (let y = 0; y < h; y++) {
          buf[y * w + x] = 255;
        }
      }
    }

    // Step 3: Save processed image and run OCR
    await sharp(buf, { raw: { width: w, height: h, channels: 1 } })
      .normalize()
      .sharpen({ sigma: 1.5 })
      .toFile(preprocessedPath);

    const { data: { text } } = await Tesseract.recognize(preprocessedPath, 'eng', {
      logger: () => {},
    });

    try { fs.unlinkSync(preprocessedPath); } catch (_) {}
    return text;
  } catch (err) {
    console.log('[GradeExtractor] Image preprocessing failed:', err.message);
    try { fs.unlinkSync(preprocessedPath); } catch (_) {}

    // Fallback: raw OCR
    const { data: { text } } = await Tesseract.recognize(filePath, 'eng', {
      logger: () => {},
    });
    return text;
  }
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
 * Strategy: Find the course code in the text, then look for grade values
 * (1.0-5.0) that appear AFTER the course code within a reasonable distance.
 * If exactly 2 grades are found (midterm + final), take the second (final).
 * Otherwise take the first match.
 * 
 * Returns the grade as a number or null if not found.
 */
function findGradeForCourse(text, courseCode) {
  if (!text || !courseCode) return null;

  const normalizedCode = courseCode.replace(/[-\s]/g, '').toUpperCase();

  const normalizedText = text.replace(/[-]/g, '');
  const upperText = normalizedText.toUpperCase();

  const codeIndex = upperText.indexOf(normalizedCode);
  if (codeIndex === -1) return null;

  // Look at text AFTER the course code — but stop at the next row (next EDP code = 5-digit number at start)
  let afterCode = normalizedText.substring(codeIndex + normalizedCode.length, codeIndex + normalizedCode.length + 250);
  
  // Cut off at the next row boundary (5-digit EDP code signals a new row)
  const nextRowMatch = afterCode.match(/\s\d{5}\s/);
  if (nextRowMatch) {
    afterCode = afterCode.substring(0, nextRowMatch.index);
  }

  // Find grade patterns: 1.0, 1.00, 1.25, 1.5, 2.00, etc.
  const gradePattern = /\b([1-5])\.([0-9]{1,2})\b/g;
  const allMatches = [...afterCode.matchAll(gradePattern)];

  const validGrades = allMatches
    .map(m => parseFloat(m[0]))
    .filter(g => g >= 1.0 && g <= 5.0);

  console.log(`[GradeExtractor] Course: ${courseCode}, found grades: [${validGrades.join(', ')}] in text: "${afterCode.substring(0, 100)}..."`);

  if (validGrades.length === 0) return null;

  // If exactly 2 grades (midterm + final pattern), take the second (final)
  if (validGrades.length === 2) {
    return validGrades[1];
  }

  // Otherwise take the first match (safest default)
  return validGrades[0];
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
