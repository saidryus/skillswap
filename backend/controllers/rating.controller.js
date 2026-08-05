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

    // ── Auto-retrain: if the rating has a comment, run ML analysis on it
    // and submit the labelled result to the feedback service for incremental
    // retraining. Fire-and-forget — never blocks the response.
    if (comment && comment.trim().length >= 5) {
      setImmediate(async () => {
        try {
          const {
            isFeedbackServiceAvailable,
            analyzeReview,
            submitRetrainSamples,
          } = require('../utils/feedbackAnalyzer');

          const available = await isFeedbackServiceAvailable();
          if (!available) return;

          // Use the current model to label this review — the label becomes
          // training data for the next model version.
          const analysis = await analyzeReview(comment.trim());
          if (!analysis) return;

          const sample = {
            text: comment.trim(),
            sentiment: analysis.sentiment || 'Neutral',
            strengths: analysis.strengths || [],
            improvements: analysis.improvements || [],
            topics: analysis.topics || [],
          };

          const result = await submitRetrainSamples([sample]);
          console.log(`[AutoRetrain] Feedback sample submitted: ${result.queued ? 'retrain started' : (result.reason || result.message || 'accumulated')}`);
        } catch (err) {
          console.error('[AutoRetrain] Feedback retrain trigger failed:', err.message);
        }
      });
    }
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

// @desc    Get tutor dashboard stats for the logged-in user
// @route   GET /api/ratings/my-tutor-stats
// @access  Private (tutor)
const getMyTutorStats = async (req, res) => {
  try {
    const TutorProfile = require('../models/TutorProfile');

    // Get all approved tutor profiles for this user
    const profiles = await TutorProfile.find({ tutor: req.user._id, status: 'approved' })
      .populate('course', 'courseCode courseName');

    if (profiles.length === 0) {
      return res.json({
        isApprovedTutor: false,
        message: 'You are not an approved tutor for any course.',
      });
    }

    // Get all ratings for this tutor
    const ratings = await Rating.find({ tutor: req.user._id })
      .populate('ratedBy', 'firstName lastName')
      .populate('course', 'courseCode courseName')
      .sort({ createdAt: -1 });

    const totalRatings = ratings.length;
    const avgScore = totalRatings > 0
      ? ratings.reduce((sum, r) => sum + r.score, 0) / totalRatings
      : 0;

    // Rating distribution (1-5 stars)
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratings.forEach(r => { distribution[r.score] = (distribution[r.score] || 0) + 1; });

    // Get session stats
    const completedSessions = await Session.countDocuments({ tutor: req.user._id, status: 'completed' });
    const cancelledSessions = await Session.countDocuments({ tutor: req.user._id, status: 'cancelled' });
    const scheduledSessions = await Session.countDocuments({ tutor: req.user._id, status: 'scheduled' });
    const pendingSessions = await Session.countDocuments({ tutor: req.user._id, status: 'pending' });
    const totalSessions = completedSessions + cancelledSessions + scheduledSessions + pendingSessions;

    // Completion rate
    const totalAttempted = completedSessions + cancelledSessions;
    const completionRate = totalAttempted > 0 ? Math.round((completedSessions / totalAttempted) * 100) : 100;

    // Per-course breakdown
    const courseStats = await Promise.all(profiles.map(async (profile) => {
      const courseRatings = ratings.filter(r => r.course?._id?.toString() === profile.course._id.toString());
      const courseAvg = courseRatings.length > 0
        ? courseRatings.reduce((sum, r) => sum + r.score, 0) / courseRatings.length
        : 0;
      const courseCompleted = await Session.countDocuments({
        tutor: req.user._id, course: profile.course._id, status: 'completed',
      });

      return {
        courseId: profile.course._id,
        courseCode: profile.course.courseCode,
        courseName: profile.course.courseName,
        grade: profile.grade,
        avgRating: Math.round(courseAvg * 10) / 10,
        totalRatings: courseRatings.length,
        completedSessions: courseCompleted,
      };
    }));

    // Recent ratings (last 10)
    const recentRatings = ratings.slice(0, 10).map(r => ({
      _id: r._id,
      score: r.score,
      comment: r.comment,
      ratedBy: r.ratedBy ? `${r.ratedBy.firstName} ${r.ratedBy.lastName}` : 'Anonymous',
      course: r.course?.courseCode || '',
      date: r.createdAt,
    }));

    // This week's sessions
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const sessionsThisWeek = await Session.countDocuments({
      tutor: req.user._id,
      date: { $gte: weekStart, $lt: weekEnd },
      status: { $in: ['pending', 'scheduled'] },
    });

    const maxPerWeek = req.user.maxSessionsPerWeek || 5;

    res.json({
      isApprovedTutor: true,
      overview: {
        avgScore: Math.round(avgScore * 10) / 10,
        totalRatings,
        completedSessions,
        scheduledSessions,
        pendingSessions,
        cancelledSessions,
        totalSessions,
        completionRate,
        sessionsThisWeek,
        maxSessionsPerWeek: maxPerWeek,
        availableSlots: Math.max(0, maxPerWeek - sessionsThisWeek),
        coursesApproved: profiles.length,
      },
      distribution,
      courseStats,
      recentRatings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get ML-powered feedback insights for a tutor (per subject or overall)
// @route   GET /api/ratings/insights/:tutorId
// @access  Private
const getTutorInsights = async (req, res) => {
  try {
    const { courseId } = req.query;
    const filter = { tutor: req.params.tutorId };
    if (courseId) filter.course = courseId;

    const ratings = await Rating.find(filter)
      .populate('course', 'courseCode courseName')
      .sort({ createdAt: -1 });

    // Get reviews with comments
    const reviews = ratings.filter(r => r.comment && r.comment.trim().length > 5);

    if (reviews.length === 0) {
      return res.json({
        hasInsights: false,
        message: 'Not enough reviews with comments to generate insights.',
        totalRatings: ratings.length,
        reviewsWithComments: 0,
      });
    }

    // Try ML feedback service
    const { isFeedbackServiceAvailable, getAggregatedInsights } = require('../utils/feedbackAnalyzer');
    const available = await isFeedbackServiceAvailable();

    if (!available) {
      return res.json({
        hasInsights: false,
        message: 'Feedback analysis service unavailable.',
        totalRatings: ratings.length,
        reviewsWithComments: reviews.length,
      });
    }

    const reviewTexts = reviews.map(r => r.comment);
    const insights = await getAggregatedInsights(reviewTexts);

    if (!insights) {
      return res.json({
        hasInsights: false,
        message: 'Failed to generate insights.',
        totalRatings: ratings.length,
        reviewsWithComments: reviews.length,
      });
    }

    res.json({
      hasInsights: true,
      totalRatings: ratings.length,
      reviewsWithComments: reviews.length,
      insights,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createRating, getTutorRatings, getSessionRating, getMyTutorStats, getTutorInsights };
