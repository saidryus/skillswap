/**
 * Curriculum Filter Utility
 * 
 * Computes eligible subjects based on verified academic progression.
 * This is the SINGLE SOURCE OF TRUTH for subject eligibility.
 * 
 * Logic:
 *   Show all courses where:
 *     - yearLevel < student's yearLevel (all previous years)
 *     - yearLevel === student's yearLevel AND semester <= student's currentSemester
 *   
 *   Hide:
 *     - yearLevel > student's yearLevel (future years)
 *     - yearLevel === student's yearLevel AND semester > student's currentSemester (future semester)
 * 
 * Used by:
 *   - Become a Tutor (subject selection)
 *   - Find a Tutor (course filtering)
 *   - Current Courses
 *   - Any future feature requiring course selection
 */

const Course = require('../models/Course');

/**
 * Get eligible courses for a student based on their verified academic progression.
 * 
 * @param {Object} params
 * @param {number} params.yearLevel - Student's verified year level (1-4)
 * @param {number} params.currentSemester - Student's verified current semester (1 or 2)
 * @param {string} [params.department] - Student's department (optional filter)
 * @returns {Promise<Array>} Eligible courses
 */
async function getEligibleCourses({ yearLevel, currentSemester, department }) {
  if (!yearLevel || !currentSemester) {
    return [];
  }

  const filter = { isActive: true };

  // Department filter (optional)
  if (department) {
    filter.department = department;
  }

  // Eligible: all previous years + current year up to current semester
  filter.$or = [
    { yearLevel: { $lt: yearLevel } },                              // All previous years
    { yearLevel: yearLevel, semester: { $lte: currentSemester } },   // Current year, up to current semester
    { yearLevel: yearLevel, semester: null },                        // Current year, no semester specified
  ];

  const courses = await Course.find(filter)
    .sort({ yearLevel: 1, semester: 1, courseCode: 1 });

  return courses;
}

/**
 * Check if a specific course is eligible for a student.
 * 
 * @param {Object} course - Course document (with yearLevel and semester)
 * @param {number} studentYear - Student's verified year level
 * @param {number} studentSemester - Student's verified current semester
 * @returns {boolean}
 */
function isCourseEligible(course, studentYear, studentSemester) {
  if (!course.yearLevel) return true; // No year restriction
  if (course.yearLevel < studentYear) return true;
  if (course.yearLevel === studentYear) {
    if (!course.semester) return true;
    return course.semester <= studentSemester;
  }
  return false;
}

/**
 * Group eligible courses by year level for UI display.
 * 
 * @param {Array} courses - Array of course documents
 * @returns {Object} { year1sem1: [...], year1sem2: [...], year2sem1: [...], ... }
 */
function groupCoursesByYear(courses) {
  const grouped = {};

  courses.forEach(course => {
    const key = `year${course.yearLevel || 0}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(course);
  });

  return grouped;
}

module.exports = { getEligibleCourses, isCourseEligible, groupCoursesByYear };
