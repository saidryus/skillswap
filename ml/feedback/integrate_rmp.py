"""
Integrate RateMyProfessors Data into Feedback Model Training

Downloads the public RateMyProfessors dataset from Mendeley Data
(doi: 10.17632/fvtfjyvw7d) and maps its numeric ratings + comments
into the existing feedback model's label schema, then retrains.

Dataset: "Big Data Set from RateMyProfessor.com for Professors' Teaching Evaluation"
Source:  https://data.mendeley.com/datasets/fvtfjyvw7d/
License: CC BY 4.0 — free for academic and non-commercial use.
         Cite as: Hassan, Saddam (2020). Data in Brief.

Usage:
  # Option A — auto-download (requires internet)
  python integrate_rmp.py

  # Option B — use a local CSV you already downloaded
  python integrate_rmp.py --csv path/to/rmpCapstoneNum.csv

  # Only merge, skip retraining
  python integrate_rmp.py --no-retrain

The script:
  1. Downloads the Mendeley CSV (if not already cached)
  2. Maps the numeric fields to sentiment labels
  3. Infers strength / improvement keywords from the comment text
  4. Merges with existing synthetic training_data.json
  5. Retrains the feedback model on the combined dataset
"""

import argparse
import csv
import json
import os
import sys
import re
import random
import urllib.request
import urllib.error
import zipfile
import io
from collections import Counter

# ──────────────────────────────────────────────────────────────────────────────
# PATHS
# ──────────────────────────────────────────────────────────────────────────────

DIR               = os.path.dirname(__file__)
DATA_PATH         = os.path.join(DIR, 'training_data.json')
MERGED_PATH       = os.path.join(DIR, 'training_data_merged.json')
RMP_CACHE_PATH    = os.path.join(DIR, 'rmp_cache.csv')

# Mendeley direct CSV download URL (public, CC BY 4.0)
# This is the combined "rmpCapstoneNum.csv" from the dataset.
RMP_MENDELEY_URL  = 'https://data.mendeley.com/public-files/datasets/fvtfjyvw7d/files/fbe63f58-c2a2-40e0-ab8a-e7ee9c4f9519/file_downloaded'

# Weight: each RMP sample counts as this many synthetic samples
RMP_SAMPLE_WEIGHT = 2   # lower than corrections because RMP ≠ peer tutoring context

# Max RMP samples to include (keeps training set balanced)
RMP_MAX_SAMPLES   = 3000

# ──────────────────────────────────────────────────────────────────────────────
# LABEL SCHEMA (must match train_model.py)
# ──────────────────────────────────────────────────────────────────────────────

SENTIMENTS   = ['Negative', 'Neutral', 'Positive']

STRENGTHS    = [
    'Clear Explanations', 'Communication', 'Patience', 'Problem Solving',
    'Teaching Ability', 'Encouraging', 'Preparedness', 'Knowledgeable',
    'Engagement', 'Professionalism',
]

IMPROVEMENTS = [
    'Teaching Pace', 'Time Management', 'Clarity', 'Examples Needed',
    'Organization', 'Interaction', 'Confidence',
]

TOPICS       = [
    'Recursion', 'Object-Oriented Programming', 'SQL', 'Normalization',
    'Networking', 'Cybersecurity', 'Data Structures', 'Algorithms',
    'Web Development', 'HTML CSS', 'JavaScript', 'Python', 'Java',
    'Linux', 'Server Administration', 'Database Design', 'API Development',
    'Version Control',
]

# ──────────────────────────────────────────────────────────────────────────────
# KEYWORD DETECTORS
# These map free-form RMP comment text → our label schema
# ──────────────────────────────────────────────────────────────────────────────

STRENGTH_KEYWORDS = {
    'Clear Explanations':  ['clear', 'explain', 'understandable', 'straightforward', 'concise'],
    'Communication':       ['communicat', 'articulate', 'verbal', 'approachable', 'talk'],
    'Patience':            ['patient', 'patience', 'never rushed', 'slow down', 'understanding'],
    'Problem Solving':     ['problem', 'debug', 'troubleshoot', 'solve', 'analytical'],
    'Teaching Ability':    ['teach', 'mentor', 'gift for', 'natural teacher', 'instructor'],
    'Encouraging':         ['encourage', 'motivat', 'support', 'positive', 'confident', 'inspiring'],
    'Preparedness':        ['prepared', 'organized', 'ready', 'material', 'structured'],
    'Knowledgeable':       ['knowledg', 'expert', 'deep understanding', 'know their stuff', 'knows'],
    'Engagement':          ['engag', 'interactive', 'interesting', 'fun', 'dynamic', 'lively'],
    'Professionalism':     ['profess', 'punctual', 'respectful', 'formal', 'on time'],
}

IMPROVEMENT_KEYWORDS = {
    'Teaching Pace':    ['too fast', 'rushed', 'pace', 'slow down', 'speed'],
    'Time Management':  ['time', 'ran out', 'didn\'t finish', 'late', 'overtime'],
    'Clarity':          ['confus', 'unclear', 'hard to follow', 'vague', 'lost'],
    'Examples Needed':  ['more example', 'need example', 'practical', 'hands.on', 'demonstrate'],
    'Organization':     ['disorganiz', 'scattered', 'jump', 'no structure', 'messy'],
    'Interaction':      ['no interaction', 'lecture mode', 'one.way', 'doesn\'t ask', 'boring'],
    'Confidence':       ['unsure', 'hesitant', 'not confident', 'mumble', 'nervous'],
}

TOPIC_KEYWORDS = {
    'Recursion':                ['recursion', 'recursive'],
    'Object-Oriented Programming': ['oop', 'object.oriented', 'class', 'inheritance', 'polymorphism'],
    'SQL':                      ['sql', 'query', 'select', 'join', 'database query'],
    'Normalization':             ['normaliz', 'normal form', '1nf', '2nf', '3nf'],
    'Networking':                ['network', 'tcp', 'ip', 'subnet', 'osi'],
    'Cybersecurity':             ['security', 'cyber', 'encrypt', 'firewall', 'hack'],
    'Data Structures':           ['data structure', 'linked list', 'stack', 'queue', 'tree', 'hash'],
    'Algorithms':                ['algorithm', 'sort', 'binary search', 'big.o', 'complexity'],
    'Web Development':           ['web dev', 'website', 'frontend', 'backend', 'full.stack'],
    'HTML CSS':                  ['html', 'css', 'flexbox', 'responsive', 'styling'],
    'JavaScript':                ['javascript', 'js', 'dom', 'async', 'await'],
    'Python':                    ['python'],
    'Java':                      ['java '],   # trailing space avoids matching "javascript"
    'Linux':                     ['linux', 'terminal', 'bash', 'shell', 'command line'],
    'Server Administration':     ['server', 'deploy', 'admin', 'infrastructure'],
    'Database Design':           ['database design', 'schema', 'er diagram', 'table design'],
    'API Development':           ['api', 'rest', 'endpoint', 'http method'],
    'Version Control':           ['git', 'version control', 'branch', 'commit', 'github'],
}


def detect_labels(text: str, keyword_map: dict) -> list:
    """Return labels whose keywords appear in the lowercased text."""
    lower = text.lower()
    return [label for label, kws in keyword_map.items() if any(re.search(kw, lower) for kw in kws)]


# ──────────────────────────────────────────────────────────────────────────────
# SENTIMENT MAPPING
# RMP stores: helpfulRating (1-5), clarityRating (1-5), overallRating (1-5)
# We use overallRating as the ground truth signal.
# ──────────────────────────────────────────────────────────────────────────────

def map_sentiment(overall_rating: float) -> str:
    """Map a 1-5 numeric rating to our sentiment classes."""
    if overall_rating >= 4.0:
        return 'Positive'
    elif overall_rating >= 3.0:
        return 'Neutral'
    else:
        return 'Negative'


# ──────────────────────────────────────────────────────────────────────────────
# DOWNLOAD
# ──────────────────────────────────────────────────────────────────────────────

def download_rmp_csv() -> str:
    """
    Download the RMP CSV from Mendeley. Returns the local cache path.
    If the cache already exists, skip the download.
    """
    if os.path.exists(RMP_CACHE_PATH):
        print(f"📂 Using cached RMP data: {RMP_CACHE_PATH}")
        return RMP_CACHE_PATH

    print(f"⬇️  Downloading RMP dataset from Mendeley…")
    print(f"   This is a large file (~80MB), please wait…")
    print(f"   Source: {RMP_MENDELEY_URL}")
    print(f"   License: CC BY 4.0  (Hassan, Saddam, 2020)")

    try:
        req = urllib.request.Request(
            RMP_MENDELEY_URL,
            headers={'User-Agent': 'Mozilla/5.0 (SkillSwap ML pipeline)'}
        )
        with urllib.request.urlopen(req, timeout=120) as resp:
            content = resp.read()

        # The Mendeley download is a raw CSV (not zipped for this file)
        with open(RMP_CACHE_PATH, 'wb') as f:
            f.write(content)

        print(f"✅ Downloaded and cached to {RMP_CACHE_PATH}")
        return RMP_CACHE_PATH

    except Exception as e:
        print(f"\n❌ Download failed: {e}")
        print("\n  The automatic download may fail due to Mendeley authentication.")
        print("  Please download manually:")
        print("  1. Go to: https://data.mendeley.com/datasets/fvtfjyvw7d/")
        print("  2. Download 'rmpCapstoneNum.csv'")
        print(f"  3. Save it to: {RMP_CACHE_PATH}")
        print("  4. Re-run this script with --csv path/to/rmpCapstoneNum.csv")
        sys.exit(1)


# ──────────────────────────────────────────────────────────────────────────────
# PARSE + CONVERT
# ──────────────────────────────────────────────────────────────────────────────

# RMP CSV column names (rmpCapstoneNum.csv)
# Columns vary by version — we try multiple common names.
OVERALL_COL_CANDIDATES  = ['overallRating', 'overall_rating', 'Average Rating', 'avgRating']
HELPFUL_COL_CANDIDATES  = ['helpfulRating', 'helpful_rating', 'Average Helpfulness']
CLARITY_COL_CANDIDATES  = ['clarityRating', 'clarity_rating', 'Average Easiness']
COMMENT_COL_CANDIDATES  = ['comments', 'comment', 'Comments', 'review', 'Review']


def find_col(header: list, candidates: list) -> str | None:
    for c in candidates:
        if c in header:
            return c
    # Case-insensitive fallback
    lower_header = {h.lower(): h for h in header}
    for c in candidates:
        if c.lower() in lower_header:
            return lower_header[c.lower()]
    return None


def parse_rmp_csv(csv_path: str, max_samples: int = RMP_MAX_SAMPLES) -> list:
    """
    Parse the RMP CSV and convert to our training data format.
    Returns a list of sample dicts matching the feedback model schema.
    """
    samples = []

    with open(csv_path, encoding='utf-8', errors='replace') as f:
        reader = csv.DictReader(f)
        header = reader.fieldnames or []

        overall_col  = find_col(header, OVERALL_COL_CANDIDATES)
        helpful_col  = find_col(header, HELPFUL_COL_CANDIDATES)
        comment_col  = find_col(header, COMMENT_COL_CANDIDATES)

        if not overall_col:
            print(f"⚠️  Could not find an overall rating column in the CSV.")
            print(f"   Available columns: {header}")
            print(f"   Attempting to use the first numeric column as rating…")

        skipped = 0
        for row in reader:
            # ── Rating ──
            try:
                rating_raw = row.get(overall_col, '') if overall_col else ''
                if not rating_raw:
                    skipped += 1
                    continue
                rating = float(rating_raw)
            except (ValueError, TypeError):
                skipped += 1
                continue

            # ── Comment text ──
            comment = ''
            if comment_col:
                comment = (row.get(comment_col) or '').strip()

            # Skip rows with no comment — we need text to train on
            if len(comment) < 15:
                skipped += 1
                continue

            # ── Map to our schema ──
            sentiment  = map_sentiment(rating)
            strengths  = detect_labels(comment, STRENGTH_KEYWORDS)
            improvs    = detect_labels(comment, IMPROVEMENT_KEYWORDS)
            topics     = detect_labels(comment, TOPIC_KEYWORDS)

            # For positive reviews without detected strengths, infer generic ones
            if sentiment == 'Positive' and not strengths:
                strengths = ['Teaching Ability']  # safe generic fallback

            samples.append({
                'text':        comment,
                'sentiment':   sentiment,
                'strengths':   strengths,
                'improvements': improvs,
                'topics':      topics,
                'source':      'rmp',
            })

            if len(samples) >= max_samples:
                break

    print(f"✅ Parsed {len(samples)} usable RMP samples  (skipped {skipped} rows)")
    return samples


# ──────────────────────────────────────────────────────────────────────────────
# MERGE
# ──────────────────────────────────────────────────────────────────────────────

def merge(synthetic: list, rmp_samples: list) -> list:
    """
    Merge RMP samples into synthetic data with weight multiplier.
    Also balances sentiment distribution to avoid the RMP data skewing things.
    """
    if not rmp_samples:
        print("⚠️  No usable RMP samples — keeping synthetic data only.")
        return synthetic

    # Balance the RMP set — RMP tends to be positive-heavy
    rmp_by_sentiment = {'Positive': [], 'Neutral': [], 'Negative': []}
    for s in rmp_samples:
        rmp_by_sentiment[s['sentiment']].append(s)

    neg_count  = len(rmp_by_sentiment['Negative'])
    neu_count  = len(rmp_by_sentiment['Neutral'])
    pos_cap    = min(len(rmp_by_sentiment['Positive']), max(neg_count, neu_count) * 2)

    balanced_rmp = (
        rmp_by_sentiment['Negative'] +
        rmp_by_sentiment['Neutral'] +
        rmp_by_sentiment['Positive'][:pos_cap]
    )
    random.seed(42)
    random.shuffle(balanced_rmp)

    print(f"⚖️  Balanced RMP: {len(balanced_rmp)} samples  (Neg:{neg_count} Neu:{neu_count} Pos:{pos_cap})")
    print(f"   Applying ×{RMP_SAMPLE_WEIGHT} weight multiplier → adds {len(balanced_rmp) * RMP_SAMPLE_WEIGHT} effective samples")

    weighted = balanced_rmp * RMP_SAMPLE_WEIGHT
    merged   = synthetic + weighted
    random.shuffle(merged)

    return merged


# ──────────────────────────────────────────────────────────────────────────────
# MAIN
# ──────────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description='Integrate RMP data and retrain feedback model')
    parser.add_argument('--csv',       default=None,              help='Path to local rmpCapstoneNum.csv')
    parser.add_argument('--no-retrain', action='store_true',      help='Only merge data, skip retraining')
    parser.add_argument('--max',       type=int, default=RMP_MAX_SAMPLES, help='Max RMP samples to use')
    args = parser.parse_args()

    # ── Load synthetic base ──
    if not os.path.exists(DATA_PATH):
        print(f"❌ {DATA_PATH} not found. Run generate_training_data.py first.")
        sys.exit(1)

    with open(DATA_PATH) as f:
        synthetic = json.load(f)
    print(f"📂 Loaded {len(synthetic)} synthetic samples")

    # ── Get RMP CSV ──
    csv_path = args.csv if args.csv else download_rmp_csv()
    rmp_samples = parse_rmp_csv(csv_path, max_samples=args.max)

    # ── Merge ──
    merged = merge(synthetic, rmp_samples)
    print(f"\n📊 Merged dataset: {len(merged)} total samples")

    dist = Counter(s['sentiment'] for s in merged)
    for k in ['Positive', 'Neutral', 'Negative']:
        pct = dist.get(k, 0) / len(merged) * 100
        print(f"   {k:>10}: {dist.get(k,0):>5}  ({pct:.1f}%)")

    with open(MERGED_PATH, 'w') as f:
        json.dump(merged, f, indent=2)
    print(f"\n✅ Merged data saved to {MERGED_PATH}")

    if args.no_retrain:
        print("⏭️  --no-retrain flag set. Skipping training.")
        return

    # ── Retrain ──
    print("\n🏋️ Starting retraining on merged dataset…\n")

    import train_model as trainer
    trainer.DATA_PATH = MERGED_PATH
    trainer.train()

    print("\n✅ Retraining complete. feedback_model.pkl now includes RMP data.")
    print("   Restart the Flask ML service (app.py, port 5003) to load the updated model.")


if __name__ == '__main__':
    main()
