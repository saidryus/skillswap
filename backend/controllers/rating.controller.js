const Rating = require('../models/Rating');
const Session = require('../models/Session');

// @desc    Rate a tutor after a completed session
// @route   POST /api/ratings
// @access  Student (tutee only)
const createRating = async (req, res) => {
  try {
    const { sessionId, score, comment } = req.body;

    if (!sessionId || !score) {
      return res.status(400).json({ message: 'sessionId and score (1-5) are required' });
    }

    if (score < 1 || score > 5) {
      return res.status(400).json({ message: 'Score must be between 1 and 5' });
    }

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    if (session.status !== 'completed') {
      return res.status(400).json({ message: 'Can only rate completed sessions' });
    }

    // Must be a tutee in that session
    const isTutee = session.tutees.map(t => t.toString()).includes(req.user._id.toString());
    if (!isTutee) {
      return res.status(403).json({ message: 'Only tutees can rate a session' });
    }

    // Check if already rated
    const existing = await Rating.findOne({ session: sessionId, ratedBy: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'You have already rated this session' });
    }

    const rating = await Rating.create({
      session: sessionId,
      tutor: session.tutor,
      ratedBy: req.user._id,
      course: session.course,
      score,
      comment: comment || '',
    });

    res.status(201).json(rating);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get ratings for a tutor
// @route   GET /api/ratings/tutor/:tutorId
// @access  Private
const getTutorRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ tutor: req.params.tutorId })
      .populate('ratedBy', 'firstName lastName')
      .populate('course', 'courseCode courseName')
      .sort({ createdAt: -1 });

    const totalRatings = ratings.length;
    const avgScore = totalRatings > 0
      ? ratings.reduce((sum, r) => sum + r.score, 0) / totalRatings
      : 0;

    res.json({
      ratings,
      stats: {
        totalRatings,
        avgScore: Math.round(avgScore * 10) / 10,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check if current user already rated a session
// @route   GET /api/ratings/session/:sessionId
// @access  Private
const getSessionRating = async (req, res) => {
  try {
    const rating = await Rating.findOne({
      session: req.params.sessionId,
      ratedBy: req.user._id,
    });
    res.json({ rated: !!rating, rating: rating || null });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createRating, getTutorRatings, getSessionRating };
