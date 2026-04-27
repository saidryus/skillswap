const Attendance = require('../models/Attendance');
const Course = require('../models/Course');

// @desc    Mark attendance (bulk)
// @route   POST /api/attendance/mark
// @access  Faculty, Admin
const markAttendance = async (req, res) => {
  try {
    const { courseId, date, records } = req.body;
    // records: [{ studentId, status, remarks }]

    const results = [];
    for (const record of records) {
      const attendance = await Attendance.findOneAndUpdate(
        { student: record.studentId, course: courseId, date: new Date(date) },
        { status: record.status, remarks: record.remarks, markedBy: req.user._id },
        { upsert: true, new: true }
      );
      results.push(attendance);
    }

    res.status(201).json({ message: 'Attendance marked successfully', results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get attendance for a course
// @route   GET /api/attendance/course/:courseId
// @access  Faculty, Admin
const getCourseAttendance = async (req, res) => {
  try {
    const { date } = req.query;
    const filter = { course: req.params.courseId };
    if (date) filter.date = new Date(date);

    const attendance = await Attendance.find(filter)
      .populate('student', 'firstName lastName studentId')
      .populate('course', 'courseCode courseName')
      .sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get attendance for logged-in student
// @route   GET /api/attendance/my-attendance
// @access  Student
const getMyAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({ student: req.user._id })
      .populate('course', 'courseCode courseName')
      .sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get attendance summary per student per course
// @route   GET /api/attendance/summary/:studentId/:courseId
// @access  Private
const getAttendanceSummary = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    const records = await Attendance.find({ student: studentId, course: courseId });

    const total = records.length;
    const present = records.filter((r) => r.status === 'present').length;
    const absent = records.filter((r) => r.status === 'absent').length;
    const late = records.filter((r) => r.status === 'late').length;
    const excused = records.filter((r) => r.status === 'excused').length;
    const percentage = total > 0 ? ((present + late) / total) * 100 : 0;

    res.json({ total, present, absent, late, excused, percentage: percentage.toFixed(2) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { markAttendance, getCourseAttendance, getMyAttendance, getAttendanceSummary };
