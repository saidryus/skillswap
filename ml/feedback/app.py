"""
Tutor Feedback ML Inference Service

Analyzes written tutor reviews and extracts structured insights.
Does NOT modify ratings, competency scores, or tutor rankings.

Endpoints:
  GET  /health       — Health check
  GET  /model-info   — Model metadata
  POST /analyze      — Analyze a single review
  POST /insights     — Aggregate insights from multiple reviews

Port: 5003
"""

import os
import sys
import numpy as np
from flask import Flask, request, jsonify
import joblib

app = Flask(__name__)

model_data = None
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'feedback_model.pkl')


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
    }), 200 if loaded else 503


@app.route('/model-info', methods=['GET'])
def model_info():
    if model_data is None:
        return jsonify({'error': 'Model not loaded'}), 503
    return jsonify({
        'trainingSamples': model_data['training_samples'],
        'metrics': model_data['metrics'],
    })


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
