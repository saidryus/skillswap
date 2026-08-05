const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { isMLServiceAvailable, getModelInfo, getRetrainStatus } = require('../utils/mlRecommendationClient');
const { isFeedbackServiceAvailable, getFeedbackRetrainStatus } = require('../utils/feedbackAnalyzer');

router.use(protect);

/**
 * GET /api/ml/status
 * Returns health + retraining status for both ML services.
 * Admin-only.
 */
router.get('/status', authorize('admin'), async (req, res) => {
  try {
    const [recAvailable, fbAvailable, recInfo, recRetrain, fbRetrain] = await Promise.all([
      isMLServiceAvailable(),
      isFeedbackServiceAvailable(),
      getModelInfo(),
      getRetrainStatus(),
      getFeedbackRetrainStatus(),
    ]);

    res.json({
      recommendation: {
        available: recAvailable,
        modelInfo: recInfo,
        retrainStatus: recRetrain,
      },
      feedback: {
        available: fbAvailable,
        retrainStatus: fbRetrain,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
