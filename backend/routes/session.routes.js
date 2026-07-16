const express = require('express');
const router = express.Router();
const {
  suggestSlots,
  createSession,
  getMySessions,
  getAllSessions,
  completeSession,
  cancelSession,
  acceptSession,
  rejectSession,
  getSessionHistory,
  getUserSessions,
  getSessionStats,
  getMyStats,
} = require('../controllers/session.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { getHolidaysForYear } = require('../utils/holidays');

router.use(protect);

// Holidays endpoint for calendar
router.get('/holidays', (req, res) => {
  const year = parseInt(req.query.year) || new Date().getFullYear();
  const holidays = getHolidaysForYear(year);
  res.json(holidays);
});

router.post('/suggest', suggestSlots);
router.get('/my-sessions', getMySessions);
router.get('/my-stats', getMyStats);
router.get('/stats', authorize('admin'), getSessionStats);
router.get('/user/:userId', getUserSessions);
router.get('/history/:studentId', authorize('admin'), getSessionHistory);
router.route('/').get(authorize('admin'), getAllSessions).post(createSession);
router.put('/:id/accept', acceptSession);
router.put('/:id/reject', rejectSession);
router.put('/:id/complete', completeSession);
router.put('/:id/cancel', cancelSession);

module.exports = router;
