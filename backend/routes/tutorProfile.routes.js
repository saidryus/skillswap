const express = require('express');
const router = express.Router();
const {
  applyAsTutor,
  getApplications,
  getMyApplications,
  getTutorsForCourse,
  approveApplication,
  rejectApplication,
  getDocument,
} = require('../controllers/tutorProfile.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload');

router.use(protect);

router.get('/my-applications', getMyApplications);
router.get('/tutors', getTutorsForCourse);
router.get('/:id/document', authorize('admin'), getDocument);
router.post('/', authorize('student'), upload.single('gradeDocument'), applyAsTutor);
router.get('/', authorize('admin'), getApplications);
router.put('/:id/approve', authorize('admin'), approveApplication);
router.put('/:id/reject', authorize('admin'), rejectApplication);

module.exports = router;
