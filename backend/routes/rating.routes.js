const express = require('express');
const router = express.Router();
const { createRating, getTutorRatings, getSessionRating } = require('../controllers/rating.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/', createRating);
router.get('/tutor/:tutorId', getTutorRatings);
router.get('/session/:sessionId', getSessionRating);

module.exports = router;
