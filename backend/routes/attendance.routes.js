const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getCourseAttendance,
  getMyAttendance,
  getAttendanceSummary,
  exportAttendance,
} = require('../controllers/attendance.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/mark', authorize('admin', 'faculty'), markAttendance);
router.get('/export', authorize('admin', 'faculty'), exportAttendance);
router.get('/my-attendance', getMyAttendance);
router.get('/course/:courseId', authorize('admin', 'faculty'), getCourseAttendance);
router.get('/summary/:studentId/:courseId', getAttendanceSummary);

module.exports = router;
