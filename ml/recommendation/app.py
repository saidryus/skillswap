"""
Recommendation Letter ML Inference Service

Flask API that serves predictions from the trained recommendation model.
Loaded at startup — no retraining during runtime.

Endpoints:
  GET  /health          — Service health check
  GET  /model-info      — Model metadata and metrics
  POST /predict         — Predict subjects and strength from text

Run: python app.py
Port: 5002
"""

import os
import sys
import numpy as np
from flask import Flask, request, jsonify
import joblib

app = Flask(__name__)

# ═══════════════════════════════════════════════════════════════
# MODEL LOADING
# ═══════════════════════════════════════════════════════════════

model_data = None
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'recommendation_model.pkl')


def load_model():
    global model_data
    if not os.path.exists(MODEL_PATH):
        return False
    try:
        model_data = joblib.load(MODEL_PATH)
        return True
    except Exception as e:
        print(f"Error loading model: {e}", file=sys.stderr)
        return False


def preprocess_text(text):
    """Same preprocessing as training."""
    text = text.lower().strip()
    text = ' '.join(text.split())
    return text


# ═══════════════════════════════════════════════════════════════
# ENDPOINTS
# ═══════════════════════════════════════════════════════════════

@app.route('/health', methods=['GET'])
def health():
    loaded = model_data is not None
    return jsonify({
        'status': 'ok' if loaded else 'unavailable',
        'modelLoaded': loaded,
        'service': 'recommendation-ml',
    }), 200 if loaded else 503


@app.route('/model-info', methods=['GET'])
def model_info():
    if model_data is None:
        return jsonify({'error': 'Model not loaded. Run train_model.py first.'}), 503
    return jsonify({
        'trainingSamples': model_data['training_samples'],
        'subjects': model_data['subjects'],
        'strengthClasses': model_data['strength_classes'],
        'metrics': model_data['metrics'],
    })


@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict recommended subjects and recommendation strength from letter text.
    
    Request body:
    {
        "text": "The extracted recommendation letter text..."
    }
    
    Response:
    {
        "recommendedSubjects": ["Programming Fundamentals", "Database Systems"],
        "recommendationStrength": "Strong",
        "confidence": 0.94,
        "subjectConfidences": { "Programming Fundamentals": 0.87, ... }
    }
    """
    if model_data is None:
        return jsonify({'error': 'Model not loaded. Run train_model.py first.'}), 503

    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({'error': 'Missing "text" in request body'}), 400

    text = preprocess_text(data['text'])
    if len(text) < 10:
        return jsonify({
            'recommendedSubjects': [],
            'recommendationStrength': 'None',
            'confidence': 0.0,
            'subjectConfidences': {},
        })

    try:
        word_vectorizer = model_data.get('word_vectorizer') or model_data.get('vectorizer')
        char_vectorizer = model_data.get('char_vectorizer')
        subject_model = model_data['subject_model']
        strength_model = model_data['strength_model']
        mlb = model_data['mlb']
        subjects = model_data['subjects']
        strength_classes = model_data['strength_classes']
        subject_threshold = model_data.get('subject_threshold', 0.0)

        # Vectorize — support both old (single vectorizer) and new (word + char) models
        from scipy.sparse import hstack as sp_hstack
        X_word = word_vectorizer.transform([text])
        if char_vectorizer is not None:
            X_char = char_vectorizer.transform([text])
            X = sp_hstack([X_word, X_char])
        else:
            X = X_word

        # ── Task 1: Subject prediction with tuned threshold ──
        subject_scores = subject_model.decision_function(X)[0]
        subject_pred_binary = (subject_scores >= subject_threshold).astype(int)
        predicted_subjects = list(mlb.inverse_transform(subject_pred_binary.reshape(1, -1))[0])

        # Get sigmoid-normalised confidence per subject
        subject_confidences = {}
        for i, subj in enumerate(subjects):
            score = float(1 / (1 + np.exp(-subject_scores[i])))  # sigmoid
            subject_confidences[subj] = round(score, 4)

        # ── Task 2: Strength prediction ──
        strength_pred_idx = strength_model.predict(X)[0]
        strength_pred = strength_classes[strength_pred_idx]

        # Strength confidence from probability
        strength_proba = strength_model.predict_proba(X)[0]
        strength_confidence = float(np.max(strength_proba))

        # ── Task 3: Soft Skills prediction ──
        predicted_skills = []
        if 'skills_model' in model_data and 'mlb_skills' in model_data:
            skills_model = model_data['skills_model']
            mlb_skills = model_data['mlb_skills']
            # Use decision_function with lower threshold for better recall
            skills_scores = skills_model.decision_function(X)[0]
            soft_skills_list = model_data.get('soft_skills', [])
            for i, score in enumerate(skills_scores):
                if score > -0.3:  # Lower threshold than default 0 for better recall
                    if i < len(soft_skills_list):
                        predicted_skills.append(soft_skills_list[i])

        # Overall confidence (average of strength confidence and mean subject confidence for predicted subjects)
        if predicted_subjects:
            subject_conf_values = [subject_confidences[s] for s in predicted_subjects]
            overall_confidence = (strength_confidence + np.mean(subject_conf_values)) / 2
        else:
            overall_confidence = strength_confidence * 0.5  # Lower if no subjects predicted

        return jsonify({
            'recommendedSubjects': predicted_subjects,
            'recommendationStrength': strength_pred,
            'softSkills': predicted_skills,
            'confidence': round(overall_confidence, 4),
            'strengthConfidence': round(strength_confidence, 4),
            'subjectConfidences': subject_confidences,
            'strengthProbabilities': {
                strength_classes[i]: round(float(p), 4)
                for i, p in enumerate(strength_proba)
            },
        })

    except Exception as e:
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500


# ═══════════════════════════════════════════════════════════════
# STARTUP
# ═══════════════════════════════════════════════════════════════

if __name__ == '__main__':
    loaded = load_model()
    if loaded:
        print(f"✅ Recommendation model loaded ({model_data['training_samples']} training samples)")
        print(f"   Subjects: {model_data['subjects']}")
        print(f"   Strength classes: {model_data['strength_classes']}")
    else:
        print("⚠️ Model not found. Run train_model.py first.")
        print(f"   Expected at: {MODEL_PATH}")

    app.run(host='0.0.0.0', port=5002, debug=False)
