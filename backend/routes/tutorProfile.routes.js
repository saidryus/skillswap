const express = require('express');
const router = express.Router();
const {
  applyAsTutor,
  getApplications,
  getMyApplications,
  getTutorsForCourse,
  approveApplication,
  rejectApplication,
  requestResubmission,
  getDocument,
  requestDocAccess,
  submitMLCorrection,
  exportMLCorrections,
} = require('../controllers/tutorProfile.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { docAuthLimiter, docViewLimiter } = require('../middleware/rateLimiter');
const upload = require('../middleware/upload');

router.use(protect);

router.get('/my-applications', getMyApplications);
router.get('/tutors', getTutorsForCourse);
router.get('/ml-corrections/export', authorize('admin'), exportMLCorrections);
router.post('/doc-access', authorize('admin'), docAuthLimiter, requestDocAccess);
router.get('/:id/document', authorize('admin'), docViewLimiter, getDocument);
router.post('/', authorize('student'), upload.single('recommendationDocument'), applyAsTutor);
router.get('/', authorize('admin'), getApplications);
router.put('/:id/approve', authorize('admin'), approveApplication);
router.put('/:id/reject', authorize('admin'), rejectApplication);
router.put('/:id/resubmit', authorize('admin'), requestResubmission);
router.post('/:id/ml-correction', authorize('admin'), submitMLCorrection);

module.exports = router;
