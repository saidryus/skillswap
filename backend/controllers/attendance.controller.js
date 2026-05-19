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

// @desc    Export attendance as CSV for a course within a date range
// @route   GET /api/attendance/export?courseId=&dateFrom=&dateTo=
// @access  Faculty, Admin
const exportAttendance = async (req, res) => {
  try {
    const { courseId, dateFrom, dateTo } = req.query;
    if (!courseId) return res.status(400).json({ message: 'courseId is required' });

    const filter = { course: courseId };
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    const records = await Attendance.find(filter)
      .populate('student', 'firstName lastName studentId email')
      .populate('course', 'courseCode courseName')
      .sort({ date: 1, 'student.lastName': 1 });

    if (records.length === 0) {
      return res.status(404).json({ message: 'No attendance records found for the selected range' });
    }

    const courseName = records[0].course?.courseName || 'Course';
    const courseCode = records[0].course?.courseCode || '';

    // Build CSV
    const header = ['Date', 'Student ID', 'Last Name', 'First Name', 'Status', 'Remarks'];
    const rows = records.map(r => [
      new Date(r.date).toISOString().split('T')[0],
      r.student?.studentId || '',
      r.student?.lastName || '',
      r.student?.firstName || '',
      r.status,
      r.remarks || '',
    ]);

    const csv = [header, ...rows]
      .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\r\n');

    const filename = `Attendance_${courseCode}_${dateFrom || 'all'}_to_${dateTo || 'all'}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { markAttendance, getCourseAttendance, getMyAttendance, getAttendanceSummary, exportAttendance };
