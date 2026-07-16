/**
 * ML Recommendation Service Client
 * 
 * Connects to the Python Flask ML service (port 5002)
 * for recommendation letter subject and strength prediction.
 * 
 * This replaces keyword matching with trained ML predictions.
 * The ML model uses TF-IDF + Linear SVM for subjects and Logistic Regression for strength.
 */

const ML_SERVICE_URL = process.env.ML_RECOMMENDATION_URL || 'http://localhost:5002';

/**
 * Check if the ML service is available
 * @returns {Promise<boolean>}
 */
async function isMLServiceAvailable() {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/health`, { 
      signal: AbortSignal.timeout(3000) 
    });
    const data = await response.json();
    return data.status === 'ok' && data.modelLoaded;
  } catch {
    return false;
  }
}

/**
 * Get ML model info (metrics, training details)
 * @returns {Promise<Object|null>}
 */
async function getModelInfo() {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/model-info`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Predict recommended subjects and strength from recommendation letter text.
 * 
 * @param {string} text - OCR-extracted text from the recommendation letter
 * @returns {Promise<Object>} Prediction result
 */
async function predictFromText(text) {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const err = await response.json();
      return {
        success: false,
        error: err.error || `ML service returned ${response.status}`,
      };
    }

    const result = await response.json();
    return {
      success: true,
      recommendedSubjects: result.recommendedSubjects || [],
      recommendationStrength: result.recommendationStrength || 'None',
      softSkills: result.softSkills || [],
      confidence: result.confidence || 0,
      strengthConfidence: result.strengthConfidence || 0,
      subjectConfidences: result.subjectConfidences || {},
      strengthProbabilities: result.strengthProbabilities || {},
    };
  } catch (err) {
    return {
      success: false,
      error: `ML service error: ${err.message}`,
    };
  }
}

module.exports = { isMLServiceAvailable, getModelInfo, predictFromText };
