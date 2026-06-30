const StudentSchedule = require('../models/StudentSchedule');
const User = require('../models/User');
const Course = require('../models/Course');
const { extractStudyLoad } = require('../utils/studyLoadExtractor');
const path = require('path');

// @desc    Get a student's weekly schedule
// @route   GET /api/student-schedules/:studentId
// @access  Private
const getStudentSchedule = async (req, res) => {
  try {
    const schedules = await StudentSchedule.find({ student: req.params.studentId })
      .populate('course', 'courseCode courseName yearLevel')
      .sort({ day: 1, startTime: 1 });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk set a student's weekly schedule (replaces existing)
// @route   POST /api/student-schedules/:studentId
// @access  Admin
const setStudentSchedule = async (req, res) => {
  try {
    const { studentId } = req.params;
    const entries = req.body; // array of { day, startTime, endTime, label }

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (!Array.isArray(entries)) {
      return res.status(400).json({ message: 'Body must be an array of schedule entries' });
    }

    // Clear existing and replace
    await StudentSchedule.deleteMany({ student: studentId });

    const created = [];
    for (const entry of entries) {
      if (!entry.day || !entry.startTime || !entry.endTime) continue;
      const s = await StudentSchedule.create({
        student: studentId,
        day: entry.day,
        startTime: entry.startTime,
        endTime: entry.endTime,
        label: entry.label || '',
        course: entry.course || null,
      });
      created.push(s);
    }

    res.status(201).json({ message: `Schedule set with ${created.length} entries`, schedules: created });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a single entry to a student's schedule
// @route   POST /api/student-schedules/:studentId/entry
// @access  Admin
const addScheduleEntry = async (req, res) => {
  try {
    const { day, startTime, endTime, label, course } = req.body;
    if (!day || !startTime || !endTime) {
      return res.status(400).json({ message: 'day, startTime, and endTime are required' });
    }
    const entry = await StudentSchedule.create({
      student: req.params.studentId,
      day, startTime, endTime,
      label: label || '',
      course: course || null,
    });
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a single schedule entry
// @route   DELETE /api/student-schedules/entry/:entryId
// @access  Admin
const deleteScheduleEntry = async (req, res) => {
  try {
    await StudentSchedule.findByIdAndDelete(req.params.entryId);
    res.json({ message: 'Entry deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear all schedule entries for a student
// @route   DELETE /api/student-schedules/:studentId
// @access  Admin
const clearStudentSchedule = async (req, res) => {
  try {
    await StudentSchedule.deleteMany({ student: req.params.studentId });
    res.json({ message: 'Schedule cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk enroll multiple students with a schedule template
// @route   POST /api/student-schedules/bulk-enroll
// @access  Admin
const bulkEnroll = async (req, res) => {
  try {
    const { studentIds, entries, replaceExisting } = req.body;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: 'studentIds must be a non-empty array' });
    }
    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ message: 'entries must be a non-empty array of schedule entries' });
    }

    // Validate students exist
    const students = await User.find({ _id: { $in: studentIds }, role: 'student' });
    if (students.length === 0) {
      return res.status(404).json({ message: 'No valid students found' });
    }

    let totalCreated = 0;

    for (const student of students) {
      if (replaceExisting) {
        await StudentSchedule.deleteMany({ student: student._id });
      }

      for (const entry of entries) {
        if (!entry.day || !entry.startTime || !entry.endTime) continue;
        await StudentSchedule.create({
          student: student._id,
          day: entry.day,
          startTime: entry.startTime,
          endTime: entry.endTime,
          label: entry.label || '',
          course: entry.course || null,
        });
        totalCreated++;
      }
    }

    res.status(201).json({
      message: `Enrolled ${students.length} student(s) with ${entries.length} schedule entries each`,
      studentsEnrolled: students.length,
      entriesCreated: totalCreated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload study load PDF and auto-enroll student
// @route   POST /api/student-schedules/upload-study-load
// @access  Private (student uploads their own)
const uploadStudyLoad = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const student = await User.findById(req.user._id);

    if (!student || student.role !== 'student') {
      return res.status(403).json({ message: 'Only students can upload study loads' });
    }

    // Extract schedule data from the PDF
    const result = await extractStudyLoad(filePath);

    if (!result.success) {
      return res.status(422).json({
        message: result.message,
        rawText: result.rawText || '',
      });
    }

    // Verify student ID matches — always require a match
    if (!result.studentId) {
      return res.status(400).json({
        message: 'Could not detect a student ID number in the document. Please upload a valid study load/schedule slip.',
      });
    }

    const normalizedExtracted = result.studentId.replace(/[-\s]/g, '');
    const normalizedStudent = (student.studentIdNumber || '').replace(/[-\s]/g, '');
    if (normalizedExtracted !== normalizedStudent) {
      return res.status(400).json({
        message: `Student ID mismatch. Document shows ${result.studentId} but your account is ${student.studentIdNumber}. Please upload your own study load.`,
      });
    }

    // Clear existing schedule and replace with extracted data
    await StudentSchedule.deleteMany({ student: student._id });

    // Try to match labels/EDP codes to existing courses for linking
    const allCourses = await Course.find({ isActive: true });
    const courseCodeMap = {};
    allCourses.forEach(c => { courseCodeMap[c.courseCode.toUpperCase()] = c._id; });

    const created = [];
    for (const entry of result.entries) {
      // Try to match by EDP code or by extracting course code from label
      let courseId = null;
      if (entry.edpCode && courseCodeMap[entry.edpCode.toUpperCase()]) {
        courseId = courseCodeMap[entry.edpCode.toUpperCase()];
      } else if (entry.label) {
        // Try matching the label's course code portion against known courses
        const labelCode = entry.label.split(' - ')[1]?.split(' ')[0]?.toUpperCase();
        if (labelCode && courseCodeMap[labelCode]) {
          courseId = courseCodeMap[labelCode];
        }
      }

      const s = await StudentSchedule.create({
        student: student._id,
        day: entry.day,
        startTime: entry.startTime,
        endTime: entry.endTime,
        label: entry.label,
        course: courseId,
      });
      created.push(s);
    }

    // Update year level if extracted and different
    if (result.yearLevel && result.yearLevel !== student.yearLevel) {
      await User.findByIdAndUpdate(student._id, { yearLevel: result.yearLevel });
    }

    // Update semester if extracted
    if (result.semester) {
      await User.findByIdAndUpdate(student._id, { currentSemester: result.semester });
    }

    // Try to match EDP codes to existing courses
    const edpCodes = [...new Set(result.entries.map(e => e.edpCode))];
    const matchedCourses = await Course.find({ courseCode: { $in: edpCodes } });
    const matchedCount = matchedCourses.length;
    const unmatchedCodes = edpCodes.filter(
      code => !matchedCourses.find(c => c.courseCode === code)
    );

    res.status(201).json({
      message: `Schedule uploaded successfully! ${created.length} entries created.`,
      entriesCreated: created.length,
      studentId: result.studentId,
      yearLevel: result.yearLevel,
      totalUnits: result.totalUnits,
      coursesMatched: matchedCount,
      unmatchedCodes,
      schedules: created,
    });
  } catch (error) {
    console.error('[UploadStudyLoad] Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check if student has a schedule uploaded
// @route   GET /api/student-schedules/has-schedule
// @access  Private
const hasSchedule = async (req, res) => {
  try {
    const count = await StudentSchedule.countDocuments({ student: req.user._id });
    res.json({ hasSchedule: count > 0, entryCount: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStudentSchedule,
  setStudentSchedule,
  addScheduleEntry,
  deleteScheduleEntry,
  clearStudentSchedule,
  bulkEnroll,
  uploadStudyLoad,
  hasSchedule,
};
