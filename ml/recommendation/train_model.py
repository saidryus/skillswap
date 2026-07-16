"""
Train the Recommendation Letter ML Model.

Multi-task model:
  Task 1: Multi-label subject classification (which subjects are recommended)
  Task 2: Recommendation strength classification (Strong/Moderate/Weak/None)

Pipeline:
  Text → TF-IDF Vectorization → Linear SVM (subject) + Logistic Regression (strength)

Run:
  python generate_training_data.py   (first, if training_data.json doesn't exist)
  python train_model.py

Output:
  recommendation_model.pkl  (serialized model for inference)
  evaluation_metrics.json   (accuracy, precision, recall, F1 for documentation)
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
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    classification_report, confusion_matrix
)
from sklearn.pipeline import Pipeline
import joblib

# ═══════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════

SUBJECTS = [
    "Programming Fundamentals",
    "Database Systems",
    "Web Development",
    "Networking",
    "Information Security",
    "Data Structures",
    "Systems Administration",
    "Software Engineering",
]

SOFT_SKILLS = [
    "Communication",
    "Leadership",
    "Patience",
    "Problem Solving",
    "Teamwork",
    "Teaching Ability",
    "Critical Thinking",
    "Adaptability",
    "Professionalism",
    "Dedication",
]

STRENGTH_CLASSES = ["None", "Weak", "Moderate", "Strong"]

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'recommendation_model.pkl')
METRICS_PATH = os.path.join(os.path.dirname(__file__), 'evaluation_metrics.json')
DATA_PATH = os.path.join(os.path.dirname(__file__), 'training_data.json')

# ═══════════════════════════════════════════════════════════════
# PREPROCESSING
# ═══════════════════════════════════════════════════════════════

def preprocess_text(text):
    """Basic text preprocessing."""
    text = text.lower().strip()
    text = ' '.join(text.split())
    return text


def train():
    if not os.path.exists(DATA_PATH):
        print("❌ training_data.json not found. Run generate_training_data.py first.")
        sys.exit(1)

    with open(DATA_PATH, 'r') as f:
        dataset = json.load(f)

    print(f"📊 Loaded {len(dataset)} samples")

    texts = [preprocess_text(s['text']) for s in dataset]
    subject_labels = [s['subjects'] for s in dataset]
    strength_labels = [s['strength'] for s in dataset]
    soft_skill_labels = [s.get('softSkills', []) for s in dataset]

    # ── TF-IDF Vectorizer ──
    # Uses both word n-grams (1-2) and character n-grams (3-5).
    # Word n-grams: standard phrase matching.
    # Char n-grams: handles OCR noise, misspellings, partial words.
    # Two separate vectorizers are stacked via FeatureUnion.
    from sklearn.pipeline import FeatureUnion
    from sklearn.base import BaseEstimator, TransformerMixin

    class ColumnSelector(BaseEstimator, TransformerMixin):
        """Pass-through transformer — required for FeatureUnion with raw text."""
        def fit(self, X, y=None): return self
        def transform(self, X): return X

    word_vectorizer = TfidfVectorizer(
        max_features=6000,
        ngram_range=(1, 2),
        stop_words='english',
        min_df=2,
        max_df=0.95,
        analyzer='word',
    )
    char_vectorizer = TfidfVectorizer(
        max_features=4000,
        ngram_range=(3, 5),
        min_df=3,
        max_df=0.95,
        analyzer='char_wb',   # char n-grams within word boundaries
    )

    from scipy.sparse import hstack
    X_word = word_vectorizer.fit_transform(texts)
    X_char = char_vectorizer.fit_transform(texts)
    X = hstack([X_word, X_char])
    print(f"📐 Feature matrix: {X.shape}  (word + char n-grams)")

    # ── Multi-label subject binarization ──
    mlb = MultiLabelBinarizer(classes=SUBJECTS)
    y_subjects = mlb.fit_transform(subject_labels)

    # ── Multi-label soft skills binarization ──
    mlb_skills = MultiLabelBinarizer(classes=SOFT_SKILLS)
    y_skills = mlb_skills.fit_transform(soft_skill_labels)

    # ── Strength encoding ──
    strength_to_idx = {s: i for i, s in enumerate(STRENGTH_CLASSES)}
    y_strength = np.array([strength_to_idx[s] for s in strength_labels])

    # ── Train/Test Split ──
    X_train, X_test, y_sub_train, y_sub_test, y_str_train, y_str_test, y_sk_train, y_sk_test = train_test_split(
        X, y_subjects, y_strength, y_skills, test_size=0.2, random_state=42, stratify=y_strength
    )

    print(f"\n🏋️ Training set: {X_train.shape[0]} samples")
    print(f"🧪 Test set: {X_test.shape[0]} samples")

    # ══════════════════════════════════════════
    # TASK 1: Subject Classification (Multi-label SVM)
    # ══════════════════════════════════════════
    print("\n── Task 1: Subject Classification (Multi-label Linear SVM) ──")
    
    subject_model = OneVsRestClassifier(LinearSVC(
        C=1.0,
        max_iter=10000,
        class_weight='balanced',
    ))
    subject_model.fit(X_train, y_sub_train)

    # Use a lowered decision threshold for subject prediction.
    # Default threshold is 0 (predict positive when decision_function > 0).
    # Lowering to -0.2 increases recall — we'd rather catch a subject that's
    # present than miss it. The admin sees the result anyway, so false positives
    # are less harmful than false negatives.
    SUBJECT_THRESHOLD = -0.2

    def predict_subjects_with_threshold(model, X, threshold=SUBJECT_THRESHOLD):
        scores = model.decision_function(X)
        return (scores >= threshold).astype(int)

    y_sub_pred = predict_subjects_with_threshold(subject_model, X_test)

    sub_accuracy = accuracy_score(y_sub_test, y_sub_pred)
    sub_precision = precision_score(y_sub_test, y_sub_pred, average='macro', zero_division=0)
    sub_recall = recall_score(y_sub_test, y_sub_pred, average='macro', zero_division=0)
    sub_f1 = f1_score(y_sub_test, y_sub_pred, average='macro', zero_division=0)

    print(f"  Accuracy (exact match): {sub_accuracy:.4f}")
    print(f"  Precision (macro):      {sub_precision:.4f}")
    print(f"  Recall (macro):         {sub_recall:.4f}")
    print(f"  F1 Score (macro):       {sub_f1:.4f}")

    # Per-subject report
    print("\n  Per-subject classification report:")
    print(classification_report(y_sub_test, y_sub_pred, target_names=SUBJECTS, zero_division=0))

    # ══════════════════════════════════════════
    # TASK 2: Strength Classification (Logistic Regression)
    # ══════════════════════════════════════════
    print("\n── Task 2: Recommendation Strength (Logistic Regression) ──")

    strength_model = LogisticRegression(
        C=1.0,
        max_iter=10000,
        solver='lbfgs',
        class_weight='balanced',
    )
    strength_model.fit(X_train, y_str_train)

    y_str_pred = strength_model.predict(X_test)

    str_accuracy = accuracy_score(y_str_test, y_str_pred)
    str_precision = precision_score(y_str_test, y_str_pred, average='macro', zero_division=0)
    str_recall = recall_score(y_str_test, y_str_pred, average='macro', zero_division=0)
    str_f1 = f1_score(y_str_test, y_str_pred, average='macro', zero_division=0)

    print(f"  Accuracy:          {str_accuracy:.4f}")
    print(f"  Precision (macro): {str_precision:.4f}")
    print(f"  Recall (macro):    {str_recall:.4f}")
    print(f"  F1 Score (macro):  {str_f1:.4f}")

    print("\n  Classification report:")
    print(classification_report(y_str_test, y_str_pred, target_names=STRENGTH_CLASSES, zero_division=0))

    print("\n  Confusion matrix:")
    cm = confusion_matrix(y_str_test, y_str_pred)
    print(f"  {STRENGTH_CLASSES}")
    for i, row in enumerate(cm):
        print(f"  {STRENGTH_CLASSES[i]:>10}: {row}")

    # ══════════════════════════════════════════
    # TASK 3: Soft Skills Classification (Multi-label SVM)
    # ══════════════════════════════════════════
    print("\n── Task 3: Soft Skills Classification (Multi-label Linear SVM) ──")

    skills_model = OneVsRestClassifier(LinearSVC(
        C=1.0,
        max_iter=10000,
        class_weight='balanced',
    ))
    skills_model.fit(X_train, y_sk_train)

    y_sk_pred = skills_model.predict(X_test)

    sk_f1 = f1_score(y_sk_test, y_sk_pred, average='macro', zero_division=0)
    sk_precision = precision_score(y_sk_test, y_sk_pred, average='macro', zero_division=0)
    sk_recall = recall_score(y_sk_test, y_sk_pred, average='macro', zero_division=0)

    print(f"  Precision (macro): {sk_precision:.4f}")
    print(f"  Recall (macro):    {sk_recall:.4f}")
    print(f"  F1 Score (macro):  {sk_f1:.4f}")
    print(classification_report(y_sk_test, y_sk_pred, target_names=SOFT_SKILLS, zero_division=0))

    # ══════════════════════════════════════════
    # SAVE MODEL
    # ══════════════════════════════════════════
    model_data = {
        'word_vectorizer': word_vectorizer,
        'char_vectorizer': char_vectorizer,
        'subject_model': subject_model,
        'strength_model': strength_model,
        'skills_model': skills_model,
        'mlb': mlb,
        'mlb_skills': mlb_skills,
        'subjects': SUBJECTS,
        'soft_skills': SOFT_SKILLS,
        'strength_classes': STRENGTH_CLASSES,
        'subject_threshold': SUBJECT_THRESHOLD,
        'training_samples': len(dataset),
        'metrics': {
            'subject': {
                'accuracy': round(sub_accuracy, 4),
                'precision': round(sub_precision, 4),
                'recall': round(sub_recall, 4),
                'f1': round(sub_f1, 4),
            },
            'strength': {
                'accuracy': round(str_accuracy, 4),
                'precision': round(str_precision, 4),
                'recall': round(str_recall, 4),
                'f1': round(str_f1, 4),
            },
            'soft_skills': {
                'precision': round(sk_precision, 4),
                'recall': round(sk_recall, 4),
                'f1': round(sk_f1, 4),
            },
        },
    }

    joblib.dump(model_data, MODEL_PATH)
    print(f"\n✅ Model saved to: {MODEL_PATH}")

    # Save metrics as JSON for documentation
    metrics = {
        'training_samples': len(dataset),
        'test_samples': X_test.shape[0],
        'features': X.shape[1],
        'subject_classification': {
            'algorithm': 'Linear SVM (OneVsRest)',
            'accuracy': round(sub_accuracy, 4),
            'precision_macro': round(sub_precision, 4),
            'recall_macro': round(sub_recall, 4),
            'f1_macro': round(sub_f1, 4),
            'num_classes': len(SUBJECTS),
            'classes': SUBJECTS,
        },
        'strength_classification': {
            'algorithm': 'Logistic Regression (Multinomial)',
            'accuracy': round(str_accuracy, 4),
            'precision_macro': round(str_precision, 4),
            'recall_macro': round(str_recall, 4),
            'f1_macro': round(str_f1, 4),
            'num_classes': len(STRENGTH_CLASSES),
            'classes': STRENGTH_CLASSES,
            'confusion_matrix': cm.tolist(),
        },
    }

    with open(METRICS_PATH, 'w') as f:
        json.dump(metrics, f, indent=2)
    print(f"📊 Metrics saved to: {METRICS_PATH}")


if __name__ == '__main__':
    train()
