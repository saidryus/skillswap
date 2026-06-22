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

router.post('/upload-study-load', upload.single('studyLoad'), uploadStudyLoad);
router.get('/has-schedule', hasSchedule);
router.post('/bulk-enroll', authorize('admin'), bulkEnroll);
router.delete('/entry/:entryId', authorize('admin'), deleteScheduleEntry);
router.get('/:studentId', getStudentSchedule);
router.post('/:studentId', authorize('admin'), setStudentSchedule);
router.post('/:studentId/entry', authorize('admin'), addScheduleEntry);
router.delete('/:studentId', authorize('admin'), clearStudentSchedule);

module.exports = router;
