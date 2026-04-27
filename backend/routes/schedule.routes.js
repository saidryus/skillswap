const express = require('express');
const router = express.Router();
const {
  getSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getMySchedule,
} = require('../controllers/schedule.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/my-schedule', getMySchedule);
router.route('/').get(getSchedules).post(authorize('admin'), createSchedule);
router
  .route('/:id')
  .get(getScheduleById)
  .put(authorize('admin'), updateSchedule)
  .delete(authorize('admin'), deleteSchedule);

module.exports = router;
