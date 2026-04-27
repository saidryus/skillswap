const express = require('express');
const router = express.Router();
const {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcement.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

router.route('/').get(getAnnouncements).post(authorize('admin', 'faculty'), createAnnouncement);
router
  .route('/:id')
  .put(authorize('admin', 'faculty'), updateAnnouncement)
  .delete(authorize('admin', 'faculty'), deleteAnnouncement);

module.exports = router;
