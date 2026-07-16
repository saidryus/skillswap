const express = require('express');
const router = express.Router();
const { createRating, getTutorRatings, getSessionRating, getMyTutorStats, getTutorInsights } = require('../controllers/rating.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/my-tutor-stats', getMyTutorStats);
router.get('/insights/:tutorId', getTutorInsights);
router.post('/', createRating);
router.get('/tutor/:tutorId', getTutorRatings);
router.get('/session/:sessionId', getSessionRating);

module.exports = router;
