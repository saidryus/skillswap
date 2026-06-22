import os
import sys
import numpy as np
from flask import Flask, request, jsonify
import joblib

app = Flask(__name__)

model = None
feature_names = None
target_names = None
model_accuracy = None
training_samples = None


def load_model():
    global model, feature_names, target_names, model_accuracy, training_samples
    model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
    if not os.path.exists(model_path):
        return False
    try:
        data = joblib.load(model_path)
        model = data['model']
        feature_names = data['feature_names']
        target_names = data['target_names']
        model_accuracy = data['accuracy']
        training_samples = data['training_samples']
        return True
    except Exception as e:
        print(f"Error loading model: {e}", file=sys.stderr)
        return False


@app.route('/health', methods=['GET'])
def health():
    loaded = model is not None
    status_code = 200 if loaded else 503
    return jsonify({
        'status': 'ok' if loaded else 'unavailable',
        'modelLoaded': loaded
    }), status_code


@app.route('/model-info', methods=['GET'])
def model_info():
    if model is None:
        return jsonify({'error': 'Model not loaded. Run train.py first.'}), 503
    return jsonify({
        'accuracy': model_accuracy,
        'trainingSamples': training_samples,
        'features': feature_names,
    })


@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model not loaded. Run train.py first.'}), 503

    data = request.get_json()
    if not data or 'features' not in data:
        return jsonify({'error': 'Missing features in request body'}), 400

    features_dict = data['features']

    try:
        X = np.array([[features_dict[name] for name in feature_names]])
    except KeyError as e:
        return jsonify({'error': f'Missing feature: {e}'}), 400

    proba = model.predict_proba(X)[0]
    pred_class = int(model.predict(X)[0])
    pred_label = target_names[pred_class]

    risk_levels = {'none': 0, 'low': 1, 'medium': 2, 'high': 3}
    risk_score = int(risk_levels[pred_label] * 100 / 3)

    confidence = float(np.max(proba) * 100)

    probabilities = {}
    for i, name in enumerate(target_names):
        probabilities[name] = round(float(proba[i]), 4)

    importances = model.feature_importances_
    top_indices = np.argsort(importances)[-3:][::-1]
    top_factors = [feature_names[i] for i in top_indices]

    return jsonify({
        'riskLevel': pred_label,
        'riskScore': risk_score,
        'confidence': round(confidence, 2),
        'probabilities': probabilities,
        'topFactors': top_factors,
    })


if __name__ == '__main__':
    loaded = load_model()
    if loaded:
        print("Model loaded successfully")
    else:
        print("WARNING: model.pkl not found. Run train.py first.")
    app.run(host='0.0.0.0', port=5001, debug=False)
