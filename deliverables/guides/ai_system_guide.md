# Acadia AI System Guide
**How the Machine Learning components work, how they were built, and how they keep improving**

---

## Overview

Acadia uses two Machine Learning services to help with two different tasks:

1. **Recommendation Letter Analysis** — when a student applies to be a tutor, the system reads their uploaded faculty recommendation letter and extracts useful information automatically.
2. **Tutor Feedback Analysis** — when a tutee submits a written comment after a session, the system analyzes that text to generate structured insights for the tutor.

Both are built using supervised machine learning — meaning they were trained on labeled examples to learn patterns, and then applied to new, unseen text.

Neither model makes decisions. They only extract and organize information. The admin approves or rejects tutor applications. The feedback insights are for display only and do not affect ratings or rankings.

---

## Part 1 — Recommendation Letter Analysis

### What it does

When a student uploads a faculty recommendation letter as part of their tutor application, the system:

1. Extracts the text from the PDF or image using OCR (Tesseract.js)
2. Sends the text to the ML service
3. The ML service predicts:
   - Which **subjects** the faculty is recommending the student to tutor (e.g. "Web Development", "Database Systems")
   - How **strong** the recommendation is (Strong / Moderate / Weak / None)
   - What **soft skills** are mentioned (e.g. "Patience", "Communication", "Leadership")
4. The system also computes a **confidence score** (0–100) based on how much useful information could be extracted — not whether the document is authentic

The admin sees all of this in the AI analysis panel and uses it to help decide whether to approve the application.

---

### How the model was built

**Algorithm:** TF-IDF vectorization + Linear SVM (for subjects and soft skills) + Logistic Regression (for recommendation strength)

**Step 1 — Generate training data**

Since real recommendation letters weren't available at training time, synthetic training data was generated programmatically (`generate_training_data.py`). This script creates thousands of realistic-sounding recommendation letter texts, each labeled with:
- Which subjects are mentioned
- The strength of the recommendation
- Soft skills present in the text

Over 4,350 samples were generated, covering a range of styles from formal institutional letters to informal brief notes, including Tagalog-English mixed language common in Philippine academic settings.

**Step 2 — Text preprocessing**

Each letter is lowercased, whitespace-normalized, and converted to a feature vector using two TF-IDF vectorizers:
- **Word n-grams (1–2):** captures standard phrases like "highly recommend" or "excelled in"
- **Character n-grams (3–5):** handles OCR noise, misspellings, and partial words from scanned documents

The two feature matrices are stacked horizontally, giving the model both phrase-level and character-level signals.

**Step 3 — Training three classifiers**

Three separate classifiers are trained on the same feature matrix:

| Task | Algorithm | Type |
|---|---|---|
| Subject prediction | Linear SVM (OneVsRest) | Multi-label classification |
| Strength prediction | Logistic Regression | Multi-class classification (4 classes) |
| Soft skills extraction | Linear SVM (OneVsRest) | Multi-label classification |

Multi-label means a single letter can match multiple subjects or multiple soft skills simultaneously.

**Step 4 — Threshold tuning**

For subject prediction, the decision threshold is lowered from the default (0.0) to -0.2. This increases recall — the model is more likely to flag a subject as present even if it's not highly confident. Since the admin reviews the results anyway, missing a subject is worse than flagging one incorrectly.

**Step 5 — Saving the model**

All three classifiers, both vectorizers, and the label encoders are saved together as a single `.pkl` file (`recommendation_model.pkl`) using `joblib`. This file is loaded by the Flask service at startup and kept in memory for fast inference.

---

### The 3-tier fallback pipeline

The system doesn't rely entirely on the ML model. If something goes wrong, it falls back gracefully:

```
1. ML Service (port 5002)
   → TF-IDF + Linear SVM + Logistic Regression
   → Fastest, no cost, works offline

        ↓ if ML service is unavailable

2. LLM Fallback (OpenAI GPT-4o-mini)
   → Richer extraction, understands context better
   → Requires OPENAI_API_KEY in .env
   → Costs per API call

        ↓ if no API key or LLM fails

3. Rule-Based Fallback
   → Keyword pattern matching on the OCR text
   → Always available, no external dependencies
   → Less accurate but never fails
```

The `analysisMethod` field in the AI analysis panel shows which tier was used.

---

### Confidence score — what it measures

The confidence score (0–100) is computed deterministically — it has nothing to do with document authenticity. It measures how much useful information was extractable from the document.

| Component | Weight | What it checks |
|---|---|---|
| OCR quality | 20% | How cleanly was the text read from the file |
| Faculty information | 20% | Was a faculty name, position, and department found |
| Signature detection | 15% | Did signature keywords appear (e.g. "Noted by", "Department Head") |
| Recommendation strength | 15% | How strong was the ML-predicted recommendation |
| Subject alignment | 20% | Do the predicted subjects match what the tutor selected |
| Required sections | 10% | Were the student's name, a date, and institutional letterhead present |

A score of 70+ is considered high. A score below 45 is low. A low score doesn't mean the document is fake — it may just be a blurry scan or a short informal letter.

---

## Part 2 — Tutor Feedback Analysis

### What it does

After a tutee submits a written comment when rating a tutor, the system:

1. Sends the comment text to the Feedback ML service
2. The service predicts:
   - **Sentiment** — Positive, Neutral, or Negative
   - **Teaching strengths** — what the tutor did well (e.g. "Clear Explanations", "Patience", "Engagement")
   - **Areas for improvement** — what could be better (e.g. "Teaching Pace", "Organization")
   - **Topics covered** — what subjects were discussed in the session (e.g. "Recursion", "SQL", "Web Development")
3. These insights are aggregated across all reviews and displayed on the tutor's profile and dashboard

This is purely for display. The feedback insights do not affect ratings, competency scores, or rankings.

---

### How the model was built

**Algorithm:** TF-IDF vectorization + Logistic Regression (sentiment) + Linear SVM (strengths, improvements, topics)

**Training data**

1,200 synthetic tutor review samples were generated programmatically (`generate_training_data.py`). Each sample is a realistic-sounding written review labeled with sentiment, strengths mentioned, improvements needed, and topics covered.

**Four separate classifiers**

| Task | Algorithm | Labels |
|---|---|---|
| Sentiment | Logistic Regression | Positive, Neutral, Negative |
| Strengths | Linear SVM (OneVsRest) | 10 strength categories |
| Improvements | Linear SVM (OneVsRest) | 7 improvement categories |
| Topics | Linear SVM (OneVsRest) | 18 topic categories |

All four classifiers share the same TF-IDF feature matrix (word unigrams and bigrams, 5000 features).

**Output aggregation**

When the Tutor Dashboard or a tutor profile page loads, the system sends all of the tutor's comments to the `/insights` endpoint. The service runs each comment through all four classifiers and aggregates the results:
- Top 5 strengths by frequency
- Top 5 improvements by frequency
- Top 8 topics covered
- Overall sentiment distribution

---

## Part 3 — Auto-Retraining (Self-Improving AI)

Both models can retrain themselves automatically without anyone running commands.

### Recommendation model retraining

**When it triggers:** Every time an admin submits an ML correction — when the admin disagrees with what the ML predicted and corrects the subjects, strength, or soft skills on a tutor application.

**What happens:**
1. The correction is saved to the database
2. After the admin gets their response, a background task fires silently
3. All stored corrections are collected from the database
4. Once at least 3 corrections exist (`REC_MIN_NEW_SAMPLES`, configurable via env var), the system sends them to the Flask service
5. The Flask service merges the corrections with the original synthetic training data (each correction counted 5× to outweigh the much larger synthetic set)
6. The model retrains in a background thread
7. When training is done, the in-memory model is swapped out for the new one — no restart required

### Feedback model retraining

**When it triggers:** Every time a tutee submits a rating with a written comment.

**What happens:**
1. The comment is analyzed by the current model to generate labels (sentiment, strengths, etc.)
2. The labelled sample is added to a persistent queue (`pending_reviews.json`)
3. Once 10 new samples accumulate (`FB_MIN_NEW_SAMPLES`, configurable via env var), retraining fires automatically
4. The pending queue is cleared after successful retraining
5. Same background thread + hot-swap approach — service stays live throughout

### Checking retrain status

Admins can check the retraining status at any time:

```
GET /api/ml/status
Authorization: Bearer <admin-token>
```

Returns:
- Whether either service is currently retraining
- When the last retrain ran
- Whether it succeeded or failed
- How many samples were used
- How many feedback samples are pending

---

## Part 4 — What the AI Cannot Do

These are hard limits — not bugs, by design:

- **Cannot determine if a document is authentic.** The confidence score measures extractability, not authenticity. A well-written fake letter will score high.
- **Cannot approve or reject tutor applications.** The admin always makes the final decision.
- **Cannot modify ratings or competency scores.** Feedback insights are display-only.
- **Cannot access personal data after PII redaction.** Before storing OCR text in the database, phone numbers, email addresses, physical addresses, and government IDs are stripped. The student school ID is kept to allow admin verification.
- **Cannot process encrypted files directly.** Documents are encrypted on disk (AES-256-CBC). OCR runs on the plaintext file before encryption, and decryption for document viewing happens in memory only — never written to disk.

---

## Part 5 — Subjects and Labels the Models Know

### Recommendation model — subjects it can predict

- Programming Fundamentals
- Database Systems
- Web Development
- Networking
- Information Security
- Data Structures
- Systems Administration
- Software Engineering

### Recommendation model — soft skills it can detect

Communication · Leadership · Patience · Problem Solving · Teamwork · Teaching Ability · Critical Thinking · Adaptability · Professionalism · Dedication

### Recommendation model — strength classes

None · Weak · Moderate · Strong

### Feedback model — teaching strengths it can detect

Clear Explanations · Communication · Patience · Problem Solving · Teaching Ability · Encouraging · Preparedness · Knowledgeable · Engagement · Professionalism

### Feedback model — improvement areas it can detect

Teaching Pace · Time Management · Clarity · Examples Needed · Organization · Interaction · Confidence

### Feedback model — topics it can detect

Recursion · OOP · SQL · Normalization · Networking · Cybersecurity · Data Structures · Algorithms · Web Development · HTML/CSS · JavaScript · Python · Java · Linux · Server Administration · Database Design · API Development · Version Control

---

## Part 6 — Files and Locations

| File | Purpose |
|---|---|
| `ml/recommendation/train_model.py` | Trains the recommendation letter model |
| `ml/recommendation/generate_training_data.py` | Generates synthetic training samples |
| `ml/recommendation/app.py` | Flask inference API (port 5002) with auto-retrain |
| `ml/recommendation/recommendation_model.pkl` | Trained model (generated, not committed) |
| `ml/feedback/train_model.py` | Trains the feedback analysis model |
| `ml/feedback/generate_training_data.py` | Generates synthetic review samples |
| `ml/feedback/app.py` | Flask inference API (port 5003) with auto-retrain |
| `ml/feedback/feedback_model.pkl` | Trained model (generated, not committed) |
| `backend/utils/recommendationAnalyzer.js` | Orchestrates OCR → ML → LLM → rule-based pipeline |
| `backend/utils/mlRecommendationClient.js` | HTTP client for the recommendation Flask service |
| `backend/utils/feedbackAnalyzer.js` | HTTP client for the feedback Flask service |
| `backend/routes/mlStatus.routes.js` | Admin endpoint for checking ML service health |
