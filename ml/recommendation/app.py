"""
Recommendation Letter ML Inference Service

Flask API that serves predictions from the trained recommendation model.
Auto-retraining: POST /retrain triggers background retraining when new
admin corrections arrive. The service keeps serving the old model while
retraining runs, then hot-swaps to the new model when done.

Endpoints:
  GET  /health          — Service health check
  GET  /model-info      — Model metadata and metrics
  POST /predict         — Predict subjects and strength from text
  POST /retrain         — Trigger background retraining with new samples
  GET  /retrain/status  — Check current retraining status

Run: python app.py
Port: 5002
"""

import os
import sys
import json
import threading
import time
import numpy as np
from flask import Flask, request, jsonify
import joblib

app = Flask(__name__)

# ═══════════════════════════════════════════════════════════════
# MODEL LOADING
# ═══════════════════════════════════════════════════════════════

model_data = None
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'recommendation_model.pkl')

# ── Retraining state (thread-safe via lock) ──────────────────
_retrain_lock = threading.Lock()
_retrain_status = {
    'running': False,
    'lastRun': None,
    'lastResult': None,   # 'success' | 'failed'
    'lastError': None,
    'samplesUsed': 0,
}

# Minimum new corrections needed to trigger a retrain
MIN_NEW_SAMPLES = int(os.environ.get('REC_MIN_NEW_SAMPLES', '3'))


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
        'retraining': _retrain_status['running'],
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


# ═══════════════════════════════════════════════════════════════
# AUTO-RETRAINING
# ═══════════════════════════════════════════════════════════════

DATA_PATH        = os.path.join(os.path.dirname(__file__), 'training_data.json')
MERGED_PATH      = os.path.join(os.path.dirname(__file__), 'training_data_merged.json')
CORRECTIONS_PATH = os.path.join(os.path.dirname(__file__), 'corrections_cache.json')

REAL_SAMPLE_WEIGHT = 5  # each real correction counts as this many synthetic samples

VALID_STRENGTHS = {'None', 'Weak', 'Moderate', 'Strong'}
KNOWN_SOFT_SKILLS = {
    "Communication", "Leadership", "Patience", "Problem Solving",
    "Teamwork", "Teaching Ability", "Critical Thinking",
    "Adaptability", "Professionalism", "Dedication",
}


def _normalise(sample):
    text = (sample.get('text') or '').strip()
    if len(text) < 20:
        return None
    raw_strength = (sample.get('strength') or 'none').strip().title()
    strength = raw_strength if raw_strength in VALID_STRENGTHS else 'None'
    subjects = sample.get('subjects') or []
    raw_skills = sample.get('softSkills') or []
    soft_skills = [s for s in raw_skills if s in KNOWN_SOFT_SKILLS]
    return {'text': text, 'strength': strength, 'subjects': subjects,
            'softSkills': soft_skills, 'source': 'admin_correction'}


def _retrain_background(new_samples):
    """Runs in a daemon thread. Retrains the model and hot-swaps it."""
    global model_data

    try:
        print(f'[AutoRetrain] Starting with {len(new_samples)} new correction(s)...')

        # Load synthetic base
        if not os.path.exists(DATA_PATH):
            raise FileNotFoundError(f'{DATA_PATH} not found')
        with open(DATA_PATH) as f:
            synthetic = json.load(f)

        # Normalise and weight new samples
        normalised = [_normalise(s) for s in new_samples]
        normalised = [s for s in normalised if s is not None]
        if not normalised:
            raise ValueError('No usable samples after normalisation')

        weighted = normalised * REAL_SAMPLE_WEIGHT

        import random
        merged = synthetic + weighted
        random.seed(42)
        random.shuffle(merged)

        # Persist merged data
        with open(MERGED_PATH, 'w') as f:
            json.dump(merged, f)
        print(f'[AutoRetrain] Merged dataset: {len(merged)} samples')

        # Import trainer and point it at the merged file
        import importlib
        import train_model as trainer
        importlib.reload(trainer)
        trainer.DATA_PATH = MERGED_PATH
        trainer.train()

        # Hot-swap — load the freshly written .pkl without restarting
        new_model = joblib.load(MODEL_PATH)
        model_data = new_model

        with _retrain_lock:
            _retrain_status['lastResult'] = 'success'
            _retrain_status['samplesUsed'] = len(merged)
            _retrain_status['lastError'] = None
        print(f'[AutoRetrain] ✅ Complete. Model hot-swapped ({len(merged)} samples).')

    except Exception as e:
        with _retrain_lock:
            _retrain_status['lastResult'] = 'failed'
            _retrain_status['lastError'] = str(e)
        print(f'[AutoRetrain] ❌ Failed: {e}', file=sys.stderr)

    finally:
        with _retrain_lock:
            _retrain_status['running'] = False


@app.route('/retrain', methods=['POST'])
def retrain():
    """
    Trigger background retraining with new correction samples.

    Called automatically by the Node.js backend whenever an admin
    submits an ML correction (POST /api/tutor-profiles/:id/ml-correction).

    Request body:
    {
        "samples": [
            {
                "text": "...",
                "strength": "Strong",
                "subjects": ["Web Development"],
                "softSkills": ["Patience"]
            },
            ...
        ]
    }
    """
    data = request.get_json()
    if not data or 'samples' not in data:
        return jsonify({'error': 'Missing "samples" array'}), 400

    samples = data['samples']
    if not isinstance(samples, list) or len(samples) == 0:
        return jsonify({'error': '"samples" must be a non-empty array'}), 400

    if len(samples) < MIN_NEW_SAMPLES:
        return jsonify({
            'queued': False,
            'reason': f'Need at least {MIN_NEW_SAMPLES} samples to retrain (got {len(samples)}). Corrections saved — will retrain when threshold is reached.',
            'received': len(samples),
            'threshold': MIN_NEW_SAMPLES,
        }), 200

    if _retrain_status['running']:
        return jsonify({
            'queued': False,
            'reason': 'Retraining already in progress. New corrections will be included next time.',
        }), 200

    # Persist corrections locally for audit / restart recovery
    with open(CORRECTIONS_PATH, 'w') as f:
        json.dump(samples, f, indent=2)

    # Mark as running before spawning — prevents double-trigger between
    # the thread start and the thread acquiring the lock internally.
    with _retrain_lock:
        _retrain_status['running'] = True
        _retrain_status['lastRun'] = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())

    t = threading.Thread(target=_retrain_background, args=(samples,), daemon=True)
    t.start()

    return jsonify({
        'queued': True,
        'samplesReceived': len(samples),
        'message': 'Retraining started in background. Predictions continue from current model until complete.',
    }), 202


@app.route('/retrain/status', methods=['GET'])
def retrain_status():
    return jsonify(_retrain_status)


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
