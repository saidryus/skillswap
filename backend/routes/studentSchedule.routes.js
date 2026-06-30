const express = require('express');
const router = express.Router();
const {
  getStudentSchedule,
  setStudentSchedule,
  addScheduleEntry,
  deleteScheduleEntry,
  clearStudentSchedule,
  bulkEnroll,
  uploadStudyLoad,
  hasSchedule,
} = require('../controllers/studentSchedule.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload');

router.use(protect);

router.get('/my-courses', async (req, res) => {
  try {
    const StudentSchedule = require('../models/StudentSchedule');
    const Course = require('../models/Course');
    const studentYear = req.user.yearLevel || 1;
    const studentSemester = req.user.currentSemester || null;

    // Get courses linked from schedule (currently enrolled)
    const schedules = await StudentSchedule.find({ student: req.user._id, course: { $ne: null } })
      .populate('course', 'courseCode courseName yearLevel semester department isActive');
    const enrolledCourses = [...new Map(
      schedules.filter(s => s.course && s.course.isActive)
        .map(s => [s.course._id.toString(), s.course])
    ).values()];

    // Get previous courses (lower year levels, or same year but previous semester)
    const previousFilter = {
      isActive: true,
      $or: [
        { yearLevel: { $lt: studentYear } },
      ],
    };
    // If we know the current semester, same year + previous semester is also "previous"
    if (studentSemester === 2) {
      previousFilter.$or.push({ yearLevel: studentYear, semester: 1 });
    }

    const previousCourses = await Course.find(previousFilter).sort({ yearLevel: -1, semester: -1, courseCode: 1 });

    // Exclude courses already in enrolled list
    const enrolledIds = new Set(enrolledCourses.map(c => c._id.toString()));
    const filteredPrevious = previousCourses.filter(c => !enrolledIds.has(c._id.toString()));

    res.json({ enrolledCourses, previousCourses: filteredPrevious, studentYear, studentSemester });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/upload-study-load', upload.single('studyLoad'), uploadStudyLoad);
router.get('/has-schedule', hasSchedule);
router.post('/bulk-enroll', authorize('admin'), bulkEnroll);
router.delete('/entry/:entryId', authorize('admin'), deleteScheduleEntry);
router.get('/:studentId', getStudentSchedule);
router.post('/:studentId', authorize('admin'), setStudentSchedule);
router.post('/:studentId/entry', authorize('admin'), addScheduleEntry);
router.delete('/:studentId', authorize('admin'), clearStudentSchedule);

module.exports = router;
