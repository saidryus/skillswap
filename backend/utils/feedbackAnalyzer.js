/**
 * Feedback Analyzer Client
 * 
 * Connects to the Tutor Feedback ML service (port 5003)
 * for analyzing written tutor reviews.
 * 
 * This does NOT modify ratings, competency scores, or rankings.
 * It only extracts structured insights for display purposes.
 */

const FEEDBACK_SERVICE_URL = process.env.ML_FEEDBACK_URL || 'http://localhost:5003';

/**
 * Check if the feedback ML service is available
 */
async function isFeedbackServiceAvailable() {
  try {
    const response = await fetch(`${FEEDBACK_SERVICE_URL}/health`, { signal: AbortSignal.timeout(3000) });
    const data = await response.json();
    return data.status === 'ok' && data.modelLoaded;
  } catch {
    return false;
  }
}

/**
 * Analyze a single review text
 * @param {string} text - The review/comment text
 * @returns {Object} { sentiment, strengths, improvements, topics, summary }
 */
async function analyzeReview(text) {
  try {
    const response = await fetch(`${FEEDBACK_SERVICE_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Get aggregated insights from multiple reviews
 * @param {Array<string>} reviews - Array of review texts
 * @returns {Object} Aggregated insights
 */
async function getAggregatedInsights(reviews) {
  try {
    const response = await fetch(`${FEEDBACK_SERVICE_URL}/insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviews }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.aggregated;
  } catch {
    return null;
  }
}

/**
 * Submit new labelled review samples for incremental retraining.
 * Called automatically after a rating with a comment is saved.
 *
 * @param {Array} samples - Array of { text, sentiment, strengths, improvements, topics }
 * @returns {Promise<Object>}
 */
async function submitRetrainSamples(samples) {
  try {
    const response = await fetch(`${FEEDBACK_SERVICE_URL}/retrain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ samples }),
      signal: AbortSignal.timeout(10000),
    });
    const data = await response.json();
    return { success: response.ok, ...data };
  } catch (err) {
    return { success: false, error: `Retrain submit failed: ${err.message}` };
  }
}

/**
 * Get current retraining status.
 * @returns {Promise<Object|null>}
 */
async function getFeedbackRetrainStatus() {
  try {
    const response = await fetch(`${FEEDBACK_SERVICE_URL}/retrain/status`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

module.exports = { isFeedbackServiceAvailable, analyzeReview, getAggregatedInsights, submitRetrainSamples, getFeedbackRetrainStatus };
