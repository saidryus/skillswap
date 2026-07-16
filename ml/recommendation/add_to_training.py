"""
Add realistic letters to training data and retrain.

Run this after reviewing and correcting realistic_letters.json.

Usage:
  python add_to_training.py

What it does:
  1. Loads existing training_data.json (synthetic)
  2. Loads realistic_letters.json (manually crafted)
  3. Weights each realistic sample x10 (they are real-style, high value)
  4. Merges and saves training_data.json
  5. Retrains the model
"""

import json, os, random
import train_model as trainer

DIR = os.path.dirname(__file__)
TRAINING_PATH  = os.path.join(DIR, 'training_data.json')
REALISTIC_PATH = os.path.join(DIR, 'realistic_letters.json')

REAL_WEIGHT = 10  # each realistic letter counts as 10 synthetic samples

def main():
    if not os.path.exists(REALISTIC_PATH):
        print("❌ realistic_letters.json not found. Run realistic_letters.py first.")
        return

    with open(TRAINING_PATH, encoding='utf-8') as f:
        synthetic = json.load(f)
    print(f"📂 Loaded {len(synthetic)} synthetic samples")

    with open(REALISTIC_PATH, encoding='utf-8') as f:
        realistic = json.load(f)
    print(f"📂 Loaded {len(realistic)} realistic letter samples")

    # Weight realistic samples
    weighted = realistic * REAL_WEIGHT
    print(f"⚖️  Applying ×{REAL_WEIGHT} weight → adds {len(weighted)} effective samples")

    merged = synthetic + weighted
    random.seed(42)
    random.shuffle(merged)
    print(f"📊 Total merged dataset: {len(merged)} samples")

    from collections import Counter
    dist = Counter(s['strength'] for s in merged)
    for k in ['Strong', 'Moderate', 'Weak', 'None']:
        pct = dist.get(k, 0) / len(merged) * 100
        print(f"   {k:>10}: {dist.get(k,0):>5}  ({pct:.1f}%)")

    with open(TRAINING_PATH, 'w', encoding='utf-8') as f:
        json.dump(merged, f, indent=2, ensure_ascii=False)
    print(f"\n✅ training_data.json updated")

    print("\n🏋️ Retraining model...\n")
    trainer.train()
    print("\n✅ Done. Restart app.py to load the new model.")

if __name__ == '__main__':
    main()
