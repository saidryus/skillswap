const express = require('express');
const router = express.Router();
const {
  getUserAvailability,
  getMyAvailability,
  setMyAvailability,
  addAvailabilitySlot,
  removeAvailabilitySlot,
  hasAvailability,
} = require('../controllers/availability.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/has-availability', hasAvailability);
router.get('/me', getMyAvailability);
router.put('/me', setMyAvailability);
router.post('/', addAvailabilitySlot);
router.delete('/:slotId', removeAvailabilitySlot);
router.get('/:userId', getUserAvailability);

module.exports = router;
