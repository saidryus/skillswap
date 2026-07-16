"""
Train the Tutor Feedback ML Model.

Multi-task model:
  Task 1: Sentiment classification (Positive/Neutral/Negative)
  Task 2: Strengths extraction (multi-label)
  Task 3: Improvements extraction (multi-label)
  Task 4: Topics extraction (multi-label)

Run:
  python generate_training_data.py
  python train_model.py

Output:
  feedback_model.pkl
  evaluation_metrics.json
"""

import json
import os
import sys
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.linear_model import LogisticRegression
from sklearn.multiclass import OneVsRestClassifier
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score, classification_report
import joblib

STRENGTHS = [
    "Clear Explanations", "Communication", "Patience", "Problem Solving",
    "Teaching Ability", "Encouraging", "Preparedness", "Knowledgeable",
    "Engagement", "Professionalism",
]

IMPROVEMENTS = [
    "Teaching Pace", "Time Management", "Clarity", "Examples Needed",
    "Organization", "Interaction", "Confidence",
]

TOPICS = [
    "Recursion", "Object-Oriented Programming", "SQL", "Normalization",
    "Networking", "Cybersecurity", "Data Structures", "Algorithms",
    "Web Development", "HTML CSS", "JavaScript", "Python", "Java",
    "Linux", "Server Administration", "Database Design", "API Development",
    "Version Control",
]

SENTIMENTS = ["Negative", "Neutral", "Positive"]

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'feedback_model.pkl')
METRICS_PATH = os.path.join(os.path.dirname(__file__), 'evaluation_metrics.json')
DATA_PATH = os.path.join(os.path.dirname(__file__), 'training_data.json')


def preprocess(text):
    return ' '.join(text.lower().split())


def train():
    if not os.path.exists(DATA_PATH):
        print("❌ training_data.json not found. Run generate_training_data.py first.")
        sys.exit(1)

    with open(DATA_PATH) as f:
        dataset = json.load(f)

    print(f"📊 Loaded {len(dataset)} samples")

    texts = [preprocess(s['text']) for s in dataset]
    sentiment_labels = [s['sentiment'] for s in dataset]
    strength_labels = [s['strengths'] for s in dataset]
    improvement_labels = [s['improvements'] for s in dataset]
    topic_labels = [s['topics'] for s in dataset]

    # TF-IDF
    vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2), stop_words='english', min_df=2, max_df=0.95)
    X = vectorizer.fit_transform(texts)
    print(f"📐 Features: {X.shape[1]}")

    # Encode labels
    sentiment_to_idx = {s: i for i, s in enumerate(SENTIMENTS)}
    y_sentiment = np.array([sentiment_to_idx[s] for s in sentiment_labels])

    mlb_strengths = MultiLabelBinarizer(classes=STRENGTHS)
    y_strengths = mlb_strengths.fit_transform(strength_labels)

    mlb_improvements = MultiLabelBinarizer(classes=IMPROVEMENTS)
    y_improvements = mlb_improvements.fit_transform(improvement_labels)

    mlb_topics = MultiLabelBinarizer(classes=TOPICS)
    y_topics = mlb_topics.fit_transform(topic_labels)

    # Split
    X_train, X_test, y_sent_train, y_sent_test, y_str_train, y_str_test, y_imp_train, y_imp_test, y_top_train, y_top_test = train_test_split(
        X, y_sentiment, y_strengths, y_improvements, y_topics, test_size=0.2, random_state=42, stratify=y_sentiment
    )

    print(f"\n🏋️ Train: {X_train.shape[0]} | Test: {X_test.shape[0]}")

    # Task 1: Sentiment
    print("\n── Task 1: Sentiment ──")
    sentiment_model = LogisticRegression(C=1.0, max_iter=10000, solver='lbfgs', class_weight='balanced')
    sentiment_model.fit(X_train, y_sent_train)
    y_sent_pred = sentiment_model.predict(X_test)
    sent_acc = accuracy_score(y_sent_test, y_sent_pred)
    sent_f1 = f1_score(y_sent_test, y_sent_pred, average='macro')
    print(f"  Accuracy: {sent_acc:.4f} | F1: {sent_f1:.4f}")
    print(classification_report(y_sent_test, y_sent_pred, target_names=SENTIMENTS, zero_division=0))

    # Task 2: Strengths
    print("── Task 2: Strengths ──")
    strengths_model = OneVsRestClassifier(LinearSVC(C=1.0, max_iter=10000, class_weight='balanced'))
    strengths_model.fit(X_train, y_str_train)
    y_str_pred = strengths_model.predict(X_test)
    str_f1 = f1_score(y_str_test, y_str_pred, average='macro', zero_division=0)
    print(f"  F1 (macro): {str_f1:.4f}")

    # Task 3: Improvements
    print("\n── Task 3: Improvements ──")
    improvements_model = OneVsRestClassifier(LinearSVC(C=1.0, max_iter=10000, class_weight='balanced'))
    improvements_model.fit(X_train, y_imp_train)
    y_imp_pred = improvements_model.predict(X_test)
    imp_f1 = f1_score(y_imp_test, y_imp_pred, average='macro', zero_division=0)
    print(f"  F1 (macro): {imp_f1:.4f}")

    # Task 4: Topics
    print("\n── Task 4: Topics ──")
    topics_model = OneVsRestClassifier(LinearSVC(C=1.0, max_iter=10000, class_weight='balanced'))
    topics_model.fit(X_train, y_top_train)
    y_top_pred = topics_model.predict(X_test)
    top_f1 = f1_score(y_top_test, y_top_pred, average='macro', zero_division=0)
    print(f"  F1 (macro): {top_f1:.4f}")

    # Save
    model_data = {
        'vectorizer': vectorizer,
        'sentiment_model': sentiment_model,
        'strengths_model': strengths_model,
        'improvements_model': improvements_model,
        'topics_model': topics_model,
        'mlb_strengths': mlb_strengths,
        'mlb_improvements': mlb_improvements,
        'mlb_topics': mlb_topics,
        'sentiments': SENTIMENTS,
        'strengths': STRENGTHS,
        'improvements': IMPROVEMENTS,
        'topics': TOPICS,
        'training_samples': len(dataset),
        'metrics': {
            'sentiment': {'accuracy': round(sent_acc, 4), 'f1': round(sent_f1, 4)},
            'strengths': {'f1': round(str_f1, 4)},
            'improvements': {'f1': round(imp_f1, 4)},
            'topics': {'f1': round(top_f1, 4)},
        },
    }

    joblib.dump(model_data, MODEL_PATH)
    print(f"\n✅ Model saved to: {MODEL_PATH}")

    with open(METRICS_PATH, 'w') as f:
        json.dump(model_data['metrics'], f, indent=2)
    print(f"📊 Metrics saved to: {METRICS_PATH}")


if __name__ == '__main__':
    train()
