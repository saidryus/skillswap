"""
Tutor Feedback ML Inference Service

Analyzes written tutor reviews and extracts structured insights.
Does NOT modify ratings, competency scores, or tutor rankings.

Auto-retraining: POST /retrain appends new labelled review samples and
retrains the model in the background once the threshold is reached.

Endpoints:
  GET  /health          — Health check
  GET  /model-info      — Model metadata
  POST /analyze         — Analyze a single review
  POST /insights        — Aggregate insights from multiple reviews
  POST /retrain         — Append new samples and trigger background retraining
  GET  /retrain/status  — Check retraining status

Port: 5003
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

model_data = None
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'feedback_model.pkl')

# ── Retraining state ────────────────────────────────────────────
_retrain_lock = threading.Lock()
_retrain_status = {
    'running': False,
    'lastRun': None,
    'lastResult': None,
    'lastError': None,
    'samplesUsed': 0,
    'pendingCount': 0,
}

DATA_PATH    = os.path.join(os.path.dirname(__file__), 'training_data.json')
PENDING_PATH = os.path.join(os.path.dirname(__file__), 'pending_reviews.json')

# Accumulate this many new reviews before retraining
MIN_NEW_SAMPLES = int(os.environ.get('FB_MIN_NEW_SAMPLES', '10'))


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


def preprocess(text):
    return ' '.join(text.lower().split())


@app.route('/health', methods=['GET'])
def health():
    loaded = model_data is not None
    return jsonify({
        'status': 'ok' if loaded else 'unavailable',
        'modelLoaded': loaded,
        'service': 'feedback-ml',
        'retraining': _retrain_status['running'],
        'pendingReviews': _retrain_status['pendingCount'],
    }), 200 if loaded else 503


@app.route('/model-info', methods=['GET'])
def model_info():
    if model_data is None:
        return jsonify({'error': 'Model not loaded'}), 503
    return jsonify({
        'trainingSamples': model_data['training_samples'],
        'metrics': model_data['metrics'],
    })


# ═══════════════════════════════════════════════════════════════
# AUTO-RETRAINING
# ═══════════════════════════════════════════════════════════════

VALID_SENTIMENTS = {'Positive', 'Neutral', 'Negative'}


def _load_pending():
    if not os.path.exists(PENDING_PATH):
        return []
    with open(PENDING_PATH) as f:
        return json.load(f)


def _save_pending(samples):
    with open(PENDING_PATH, 'w') as f:
        json.dump(samples, f, indent=2)


def _retrain_background(all_samples):
    global model_data

    try:
        print(f'[AutoRetrain-Feedback] Starting with {len(all_samples)} new sample(s)...')

        # Load base training data
        if not os.path.exists(DATA_PATH):
            raise FileNotFoundError(f'{DATA_PATH} not found')
        with open(DATA_PATH) as f:
            base = json.load(f)

        # Filter valid samples
        valid = []
        for s in all_samples:
            text = (s.get('text') or '').strip()
            sentiment = s.get('sentiment', '').title()
            if len(text) >= 5 and sentiment in VALID_SENTIMENTS:
                valid.append({
                    'text': text,
                    'sentiment': sentiment,
                    'strengths': s.get('strengths') or [],
                    'improvements': s.get('improvements') or [],
                    'topics': s.get('topics') or [],
                })

        if not valid:
            raise ValueError('No usable samples after validation')

        # New reviews get a 3x weight so they influence the model despite the smaller count
        merged = base + (valid * 3)

        import random
        random.seed(int(time.time()))
        random.shuffle(merged)

        # Write a temp merged file and retrain
        merged_path = os.path.join(os.path.dirname(__file__), 'training_data_merged.json')
        with open(merged_path, 'w') as f:
            json.dump(merged, f)

        import importlib
        import train_model as trainer
        importlib.reload(trainer)
        trainer.DATA_PATH = merged_path
        trainer.train()

        # Hot-swap model
        new_model = joblib.load(MODEL_PATH)
        model_data = new_model

        # Clear pending queue after successful retrain
        _save_pending([])

        with _retrain_lock:
            _retrain_status['lastResult'] = 'success'
            _retrain_status['samplesUsed'] = len(merged)
            _retrain_status['lastError'] = None
            _retrain_status['pendingCount'] = 0
        print(f'[AutoRetrain-Feedback] ✅ Complete. Hot-swapped ({len(merged)} samples).')

    except Exception as e:
        with _retrain_lock:
            _retrain_status['lastResult'] = 'failed'
            _retrain_status['lastError'] = str(e)
        print(f'[AutoRetrain-Feedback] ❌ Failed: {e}', file=sys.stderr)

    finally:
        with _retrain_lock:
            _retrain_status['running'] = False


@app.route('/retrain', methods=['POST'])
def retrain():
    """
    Append new labelled review samples and trigger retraining once the
    threshold (FB_MIN_NEW_SAMPLES, default 10) is reached.

    Called automatically by the Node.js backend after a rating with a
    comment is saved (POST /api/ratings).

    Request body:
    {
        "samples": [
            {
                "text": "Great tutor, very patient",
                "sentiment": "Positive",
                "strengths": ["Patience"],
                "improvements": [],
                "topics": ["Recursion"]
            }
        ]
    }
    """
    data = request.get_json()
    if not data or 'samples' not in data:
        return jsonify({'error': 'Missing "samples" array'}), 400

    incoming = data['samples']
    if not isinstance(incoming, list) or len(incoming) == 0:
        return jsonify({'error': '"samples" must be a non-empty array'}), 400

    # Append to pending queue (persisted to disk so it survives restarts)
    pending = _load_pending()
    pending.extend(incoming)
    _save_pending(pending)

    with _retrain_lock:
        _retrain_status['pendingCount'] = len(pending)

    if len(pending) < MIN_NEW_SAMPLES:
        return jsonify({
            'queued': False,
            'reason': f'Accumulating samples: {len(pending)}/{MIN_NEW_SAMPLES} needed.',
            'pending': len(pending),
            'threshold': MIN_NEW_SAMPLES,
        }), 200

    if _retrain_status['running']:
        return jsonify({
            'queued': False,
            'reason': 'Retraining already in progress.',
            'pending': len(pending),
        }), 200

    # Mark running before spawning the thread
    with _retrain_lock:
        _retrain_status['running'] = True
        _retrain_status['lastRun'] = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())

    t = threading.Thread(target=_retrain_background, args=(pending,), daemon=True)
    t.start()

    return jsonify({
        'queued': True,
        'samplesReceived': len(pending),
        'message': f'Retraining started ({len(pending)} new samples). Current model stays live until complete.',
    }), 202


@app.route('/retrain/status', methods=['GET'])
def retrain_status():
    return jsonify(_retrain_status)


@app.route('/analyze', methods=['POST'])
def analyze():
    """
    Analyze a single tutor review.
    
    Request: { "text": "He explained recursion really well..." }
    Response: { "sentiment": "Positive", "strengths": [...], "improvements": [...], "topics": [...], "summary": "..." }
    """
    if model_data is None:
        return jsonify({'error': 'Model not loaded'}), 503

    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({'error': 'Missing "text"'}), 400

    text = preprocess(data['text'])
    if len(text) < 5:
        return jsonify({'sentiment': 'Neutral', 'strengths': [], 'improvements': [], 'topics': [], 'summary': ''})

    result = predict_single(text)
    return jsonify(result)


@app.route('/insights', methods=['POST'])
def insights():
    """
    Aggregate insights from multiple reviews.
    
    Request: { "reviews": ["review1 text", "review2 text", ...] }
    Response: { "aggregated": { "topStrengths": [...], "topImprovements": [...], ... } }
    """
    if model_data is None:
        return jsonify({'error': 'Model not loaded'}), 503

    data = request.get_json()
    if not data or 'reviews' not in data or not isinstance(data['reviews'], list):
        return jsonify({'error': 'Missing "reviews" array'}), 400

    reviews = [preprocess(r) for r in data['reviews'] if len(r.strip()) >= 5]
    if not reviews:
        return jsonify({'aggregated': {'topStrengths': [], 'topImprovements': [], 'topTopics': [], 'sentimentBreakdown': {}}})

    # Analyze each review
    results = [predict_single(r) for r in reviews]

    # Aggregate
    from collections import Counter
    all_strengths = Counter()
    all_improvements = Counter()
    all_topics = Counter()
    sentiments = Counter()

    for r in results:
        sentiments[r['sentiment']] += 1
        for s in r['strengths']:
            all_strengths[s] += 1
        for imp in r['improvements']:
            all_improvements[imp] += 1
        for t in r['topics']:
            all_topics[t] += 1

    total = len(results)
    aggregated = {
        'totalReviews': total,
        'sentimentBreakdown': {k: v for k, v in sentiments.most_common()},
        'topStrengths': [{'label': k, 'count': v, 'percentage': round(v / total * 100)} for k, v in all_strengths.most_common(5)],
        'topImprovements': [{'label': k, 'count': v, 'percentage': round(v / total * 100)} for k, v in all_improvements.most_common(5)],
        'topTopics': [{'label': k, 'count': v} for k, v in all_topics.most_common(8)],
        'overallSentiment': sentiments.most_common(1)[0][0] if sentiments else 'Neutral',
    }

    return jsonify({'aggregated': aggregated})


def predict_single(text):
    """Run all 4 prediction tasks on a single review."""
    vectorizer = model_data['vectorizer']
    X = vectorizer.transform([text])

    # Sentiment
    sent_pred_idx = model_data['sentiment_model'].predict(X)[0]
    sentiment = model_data['sentiments'][sent_pred_idx]

    # Strengths
    str_pred = model_data['strengths_model'].predict(X)[0]
    strengths = list(model_data['mlb_strengths'].inverse_transform(str_pred.reshape(1, -1))[0])

    # Improvements
    imp_pred = model_data['improvements_model'].predict(X)[0]
    improvements = list(model_data['mlb_improvements'].inverse_transform(imp_pred.reshape(1, -1))[0])

    # Topics
    top_pred = model_data['topics_model'].predict(X)[0]
    topics = list(model_data['mlb_topics'].inverse_transform(top_pred.reshape(1, -1))[0])

    # Generate summary
    summary_parts = []
    if sentiment == 'Positive' and strengths:
        summary_parts.append(f"Students appreciated: {', '.join(strengths[:3])}")
    elif sentiment == 'Negative' and improvements:
        summary_parts.append(f"Areas for improvement: {', '.join(improvements[:3])}")
    elif strengths and improvements:
        summary_parts.append(f"Praised for {', '.join(strengths[:2])} but could improve {', '.join(improvements[:2])}")
    if topics:
        summary_parts.append(f"Topics covered: {', '.join(topics[:3])}")
    summary = ". ".join(summary_parts) + "." if summary_parts else ""

    return {
        'sentiment': sentiment,
        'strengths': strengths,
        'improvements': improvements,
        'topics': topics,
        'summary': summary,
    }


if __name__ == '__main__':
    loaded = load_model()
    if loaded:
        print(f"✅ Feedback model loaded ({model_data['training_samples']} samples)")
    else:
        print("⚠️ Model not found. Run train_model.py first.")
    app.run(host='0.0.0.0', port=5003, debug=False)
