const express = require('express');
const router = express.Router();
const { getEligibleCourses } = require('../utils/curriculumFilter');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

// @desc    Get eligible courses for the logged-in student
// @route   GET /api/curriculum/eligible
// @access  Private
router.get('/eligible', async (req, res) => {
  try {
    const courses = await getEligibleCourses({
      yearLevel: req.user.yearLevel,
      currentSemester: req.user.currentSemester,
      department: req.user.department || undefined,
    });

    // Group by year for display
    const grouped = {};
    courses.forEach(c => {
      const key = `year${c.yearLevel}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(c);
    });

    res.json({
      courses,
      grouped,
      studentYear: req.user.yearLevel,
      studentSemester: req.user.currentSemester,
      totalEligible: courses.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
