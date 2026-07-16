"""
Merge Admin Corrections into Training Data and Retrain

Fetches real labelled samples from the backend's export endpoint,
merges them with the existing synthetic training data, then retrains
the recommendation model.

Usage:
  python merge_corrections.py [--api-url URL] [--token ADMIN_JWT]

  --api-url   Backend base URL  (default: http://localhost:5000)
  --token     Admin JWT token   (required — get from browser localStorage
                                 key "Acadia_user", field "token")

Example:
  python merge_corrections.py --token eyJhbGc...

The real correction samples are given a weight multiplier so the model
treats each real sample as equivalent to REAL_SAMPLE_WEIGHT synthetic ones.
This prevents the (small) real set from being drowned out by the 2000+
synthetic samples.
"""

import argparse
import json
import os
import sys
import urllib.request
import urllib.error

# Weight multiplier: each admin-corrected sample counts as this many
# synthetic samples during training. Increase if real data is scarce.
REAL_SAMPLE_WEIGHT = 5

DATA_PATH     = os.path.join(os.path.dirname(__file__), 'training_data.json')
MERGED_PATH   = os.path.join(os.path.dirname(__file__), 'training_data_merged.json')
CORRECTIONS_CACHE = os.path.join(os.path.dirname(__file__), 'corrections_cache.json')

# ──────────────────────────────────────────────────────────────────────────────
# FETCH
# ──────────────────────────────────────────────────────────────────────────────

def fetch_corrections(api_url: str, token: str) -> list:
    """Pull corrections from the backend export endpoint."""
    url = f"{api_url.rstrip('/')}/api/tutor-profiles/ml-corrections/export"
    req = urllib.request.Request(
        url,
        headers={
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json',
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode())
            samples = data.get('samples', [])
            print(f"✅ Fetched {len(samples)} correction(s) from backend  (exported at {data.get('exportedAt', '?')})")
            return samples
    except urllib.error.HTTPError as e:
        print(f"❌ HTTP {e.code}: {e.reason}")
        sys.exit(1)
    except urllib.error.URLError as e:
        print(f"❌ Could not reach backend: {e.reason}")
        sys.exit(1)


# ──────────────────────────────────────────────────────────────────────────────
# NORMALISE
# ──────────────────────────────────────────────────────────────────────────────

VALID_STRENGTHS = {'None', 'Weak', 'Moderate', 'Strong'}

# Must match train_model.py SOFT_SKILLS exactly
KNOWN_SOFT_SKILLS = {
    "Communication", "Leadership", "Patience", "Problem Solving",
    "Teamwork", "Teaching Ability", "Critical Thinking",
    "Adaptability", "Professionalism", "Dedication",
}

def normalise_correction(sample: dict) -> dict | None:
    """Validate and normalise a single correction sample."""
    text = (sample.get('text') or '').strip()
    if len(text) < 20:
        return None   # skip if text is too short to be useful

    # Normalise strength to title-case to match train_model.py STRENGTH_CLASSES
    raw_strength = (sample.get('strength') or 'none').strip().title()
    strength = raw_strength if raw_strength in VALID_STRENGTHS else 'None'

    subjects = sample.get('subjects') or []

    # Filter soft skills to only ones the recommendation model knows about
    raw_skills = sample.get('softSkills') or []
    soft_skills = [s for s in raw_skills if s in KNOWN_SOFT_SKILLS]

    return {
        'text': text,
        'strength': strength,
        'subjects': subjects,
        'softSkills': soft_skills,
        'source': 'admin_correction',
    }


# ──────────────────────────────────────────────────────────────────────────────
# MERGE
# ──────────────────────────────────────────────────────────────────────────────

def merge(synthetic: list, corrections: list) -> list:
    """
    Merge real corrections into synthetic data.

    Real samples are duplicated REAL_SAMPLE_WEIGHT times so the model
    doesn't ignore them relative to the much-larger synthetic set.
    """
    normalised = [normalise_correction(s) for s in corrections]
    normalised = [s for s in normalised if s is not None]

    if not normalised:
        print("⚠️  No usable correction samples after normalisation — using synthetic data only.")
        return synthetic

    print(f"📊 Normalised {len(normalised)} correction sample(s)")
    print(f"   Applying ×{REAL_SAMPLE_WEIGHT} weight multiplier → adds {len(normalised) * REAL_SAMPLE_WEIGHT} effective samples")

    weighted_real = normalised * REAL_SAMPLE_WEIGHT

    merged = synthetic + weighted_real

    # Shuffle so real samples are spread throughout
    import random
    random.seed(42)
    random.shuffle(merged)

    return merged


# ──────────────────────────────────────────────────────────────────────────────
# MAIN
# ──────────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description='Merge admin corrections and retrain recommendation model')
    parser.add_argument('--api-url', default='http://localhost:5000', help='Backend base URL')
    parser.add_argument('--token',   required=True, help='Admin JWT token')
    parser.add_argument('--no-retrain', action='store_true', help='Only merge data, skip retraining')
    args = parser.parse_args()

    # ── Load synthetic base ──
    if not os.path.exists(DATA_PATH):
        print(f"❌ {DATA_PATH} not found. Run generate_training_data.py first.")
        sys.exit(1)

    with open(DATA_PATH) as f:
        synthetic = json.load(f)
    print(f"📂 Loaded {len(synthetic)} synthetic samples from {DATA_PATH}")

    # ── Fetch real corrections ──
    corrections = fetch_corrections(args.api_url, args.token)

    # Cache corrections locally so you can inspect them
    with open(CORRECTIONS_CACHE, 'w') as f:
        json.dump(corrections, f, indent=2)
    print(f"💾 Corrections cached to {CORRECTIONS_CACHE}")

    # ── Merge ──
    merged = merge(synthetic, corrections)
    print(f"\n📊 Merged dataset: {len(merged)} total samples")

    from collections import Counter
    dist = Counter(s['strength'] for s in merged)
    for k in ['Strong', 'Moderate', 'Weak', 'None']:
        pct = dist.get(k, 0) / len(merged) * 100
        print(f"   {k:>10}: {dist.get(k, 0):>5}  ({pct:.1f}%)")

    with open(MERGED_PATH, 'w') as f:
        json.dump(merged, f, indent=2)
    print(f"\n✅ Merged data saved to {MERGED_PATH}")

    if args.no_retrain:
        print("⏭️  --no-retrain flag set. Skipping training.")
        return

    # ── Retrain using the merged data ──
    print("\n🏋️ Starting retraining on merged dataset…\n")

    # Temporarily swap DATA_PATH so train.py picks up the merged file
    import importlib
    import train_model as trainer

    # Monkey-patch the DATA_PATH in the trainer module
    trainer.DATA_PATH = MERGED_PATH
    trainer.train()

    print("\n✅ Retraining complete. The new recommendation_model.pkl includes real correction data.")
    print("   Restart the Flask ML service (app.py) to load the updated model.")


if __name__ == '__main__':
    main()
