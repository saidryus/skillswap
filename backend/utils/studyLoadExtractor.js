/**
 * Study Load Extractor Utility
 * Extracts schedule data from uploaded study load/schedule slip PDFs.
 *
 * Expected format (University of Cebu):
 * - Header with ID No., Name, Course, Year Level
 * - Table with columns: Edp Code | Subject | Time | Days | Units | Remarks
 * - Days use abbreviations: MWF, TTH, MW, SAT, etc.
 * - Time format: "9:00 - 10:00 - AM" or "1:30 - 3:00 - PM"
 */

const { extractText } = require('./gradeExtractor');

/**
 * Day abbreviation mapping
 * Expands short day codes (MWF, TTH, etc.) into full day names
 */
const DAY_MAP = {
  M: 'Monday',
  T: 'Tuesday',
  W: 'Wednesday',
  TH: 'Thursday',
  F: 'Friday',
  SAT: 'Saturday',
  S: 'Saturday',
};

/**
 * Parse day abbreviation string into array of full day names
 * e.g. "MWF" → ["Monday", "Wednesday", "Friday"]
 *      "TTH" → ["Tuesday", "Thursday"]
 *      "MW"  → ["Monday", "Wednesday"]
 *      "SAT" → ["Saturday"]
 */
function parseDays(dayStr) {
  if (!dayStr) return [];
  const upper = dayStr.trim().toUpperCase();

  // Handle common patterns explicitly
  const patterns = {
    MWF: ['Monday', 'Wednesday', 'Friday'],
    TTH: ['Tuesday', 'Thursday'],
    TTHS: ['Tuesday', 'Thursday', 'Saturday'],
    MW: ['Monday', 'Wednesday'],
    TF: ['Tuesday', 'Friday'],
    MF: ['Monday', 'Friday'],
    SAT: ['Saturday'],
    MWFS: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
  };

  if (patterns[upper]) return patterns[upper];

  // Fallback: parse character by character
  const days = [];
  let i = 0;
  while (i < upper.length) {
    if (upper.slice(i, i + 3) === 'SAT') {
      days.push('Saturday');
      i += 3;
    } else if (upper.slice(i, i + 2) === 'TH') {
      days.push('Thursday');
      i += 2;
    } else if (DAY_MAP[upper[i]]) {
      days.push(DAY_MAP[upper[i]]);
      i++;
    } else {
      i++;
    }
  }

  return [...new Set(days)];
}

/**
 * Parse time string from study load format
 * Input examples: "9:00 - 10:00 - AM", "1:30 - 3:00 - PM", "10:30 - 12:00 - PM"
 * Returns: { startTime: "09:00", endTime: "10:00" } in 24h format
 */
function parseTime(timeStr) {
  if (!timeStr) return null;

  // Match pattern: startH:startM - endH:endM - AM/PM
  const match = timeStr.match(
    /(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})\s*-?\s*(AM|PM)/i
  );

  if (!match) {
    // Try alternate format: "9:00AM - 10:00AM" or "9:00 AM - 10:00 AM"
    const alt = timeStr.match(
      /(\d{1,2}):(\d{2})\s*(AM|PM)?\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i
    );
    if (!alt) return null;

    let [, sh, sm, sAmPm, eh, em, eAmPm] = alt;
    sh = parseInt(sh);
    sm = parseInt(sm);
    eh = parseInt(eh);
    em = parseInt(em);

    // If start AM/PM not specified, infer from end
    if (!sAmPm) sAmPm = eAmPm;

    if (sAmPm.toUpperCase() === 'PM' && sh < 12) sh += 12;
    if (sAmPm.toUpperCase() === 'AM' && sh === 12) sh = 0;
    if (eAmPm.toUpperCase() === 'PM' && eh < 12) eh += 12;
    if (eAmPm.toUpperCase() === 'AM' && eh === 12) eh = 0;

    return {
      startTime: `${String(sh).padStart(2, '0')}:${String(sm).padStart(2, '0')}`,
      endTime: `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`,
    };
  }

  let [, startH, startM, endH, endM, ampm] = match;
  startH = parseInt(startH);
  startM = parseInt(startM);
  endH = parseInt(endH);
  endM = parseInt(endM);

  // Both times share the same AM/PM indicator in this format
  const isPM = ampm.toUpperCase() === 'PM';

  // Convert to 24h — the tricky part is that start might be AM when end is PM
  // e.g. "11:30 - 12:30 - PM" means 11:30 AM to 12:30 PM
  // e.g. "1:30 - 3:00 - PM" means 1:30 PM to 3:00 PM
  if (isPM) {
    // If endH is 12, it's already correct (12:30 PM = 12:30)
    if (endH < 12) endH += 12;
    // For start: if startH > endH (in 12h), it means start is AM
    // e.g. "11:30 - 12:30 - PM": start=11, end=12 → start is AM (11:30), end is PM (12:30)
    if (startH < 12 && startH + 12 > endH) {
      // start is AM
      // startH stays as-is
    } else if (startH < 12) {
      startH += 12;
    }
  } else {
    // AM - both are AM
    if (startH === 12) startH = 0;
    if (endH === 12) endH = 0;
  }

  return {
    startTime: `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`,
    endTime: `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`,
  };
}

/**
 * Extract student info and schedule entries from study load text
 */
function parseStudyLoadText(text) {
  const result = {
    studentId: null,
    name: null,
    course: null,
    yearLevel: null,
    totalUnits: null,
    entries: [],
    rawText: text,
  };

  if (!text || text.trim().length < 20) return result;

  // Extract student ID
  const idMatch = text.match(/ID\s*No\.?\s*:?\s*(\d{5,})/i);
  if (idMatch) result.studentId = idMatch[1];

  // Extract name
  const nameMatch = text.match(/Name\s*:?\s*([A-Z][A-Z\s,.'()-]+)/i);
  if (nameMatch) result.name = nameMatch[1].trim();

  // Extract year level
  const yearMatch = text.match(/Year\s*Level\s*:?\s*(\d)/i);
  if (yearMatch) result.yearLevel = parseInt(yearMatch[1]);

  // Extract total units
  const unitsMatch = text.match(/Total\s*Units\s*:?\s*(\d+)/i);
  if (unitsMatch) result.totalUnits = parseInt(unitsMatch[1]);

  // Extract course
  const courseMatch = text.match(/Course\s*:?\s*([A-Z]+)/i);
  if (courseMatch) result.course = courseMatch[1].trim();

  // Parse schedule entries
  // Pattern: IT - XXXXX SubjectCode - LEC/LAB  Time  Days  Units
  // The EDP code pattern: "IT - 32094" or similar
  const linePattern = /IT\s*-\s*(\d{5})\s+([\w-]+(?:\s*[-_]+\s*)?)\s*-\s*(LEC|LAB)\s+([\d:]+\s*-\s*[\d:]+\s*-?\s*[AP]M)\s+([A-Z]+)\s+(\d+)/gi;

  let match;
  while ((match = linePattern.exec(text)) !== null) {
    const [, edpCode, subjectRaw, type, timeStr, daysStr, units] = match;
    const subject = subjectRaw.replace(/[\s_]+$/, '').trim();
    const timeData = parseTime(timeStr);
    const days = parseDays(daysStr);

    if (timeData && days.length > 0) {
      const label = `${edpCode} - ${subject} (${type})`;

      for (const day of days) {
        result.entries.push({
          day,
          startTime: timeData.startTime,
          endTime: timeData.endTime,
          label,
          edpCode,
          subject,
          type,
          units: parseInt(units),
        });
      }
    }
  }

  // If regex didn't match well, try a more flexible approach
  if (result.entries.length === 0) {
    // Split by lines and look for EDP code patterns
    const lines = text.split(/\n/);
    for (const line of lines) {
      const flexMatch = line.match(
        /(\d{5})\s+([\w-]+\d*)\s*-\s*(LEC|LAB)\s+([\d:]+\s*-\s*[\d:]+\s*-?\s*[AP]M)\s+([A-Z]+)\s+(\d+)/i
      );
      if (flexMatch) {
        const [, edpCode, subject, type, timeStr, daysStr, units] = flexMatch;
        const timeData = parseTime(timeStr);
        const days = parseDays(daysStr);

        if (timeData && days.length > 0) {
          const label = `${edpCode} - ${subject} (${type})`;
          for (const day of days) {
            result.entries.push({
              day,
              startTime: timeData.startTime,
              endTime: timeData.endTime,
              label,
              edpCode,
              subject,
              type,
              units: parseInt(units),
            });
          }
        }
      }
    }
  }

  return result;
}

/**
 * Main function: extract schedule from a study load document
 * 
 * @param {string} filePath - path to the uploaded PDF/image
 * @returns {Object} { studentId, name, yearLevel, entries[], rawText, message }
 */
async function extractStudyLoad(filePath) {
  try {
    const text = await extractText(filePath);

    if (!text || text.trim().length < 20) {
      return {
        success: false,
        studentId: null,
        entries: [],
        message: 'Could not extract text from document. The file may be empty or corrupted.',
      };
    }

    const parsed = parseStudyLoadText(text);

    if (parsed.entries.length === 0) {
      return {
        success: false,
        studentId: parsed.studentId,
        name: parsed.name,
        yearLevel: parsed.yearLevel,
        entries: [],
        rawText: text.substring(0, 1000),
        message: 'Could not parse schedule entries from the document. The format may not be recognized.',
      };
    }

    return {
      success: true,
      studentId: parsed.studentId,
      name: parsed.name,
      course: parsed.course,
      yearLevel: parsed.yearLevel,
      totalUnits: parsed.totalUnits,
      entries: parsed.entries,
      message: `Successfully extracted ${parsed.entries.length} schedule entries for student ${parsed.studentId || 'unknown'}.`,
    };
  } catch (err) {
    console.error('[StudyLoadExtractor] Error:', err.message);
    return {
      success: false,
      studentId: null,
      entries: [],
      message: `Study load extraction failed: ${err.message}`,
    };
  }
}

module.exports = { extractStudyLoad, parseStudyLoadText, parseTime, parseDays };
