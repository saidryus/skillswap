import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

np.random.seed(42)

NUM_STUDENTS = 300
NUM_COURSES = 8
WEEKS = 16
SESSIONS_PER_WEEK = 3
TOTAL_SESSIONS = WEEKS * SESSIONS_PER_WEEK


def generate_student_profile(profile_type):
    base_rate = 1.0
    pattern = None

    if profile_type == 'good':
        base_rate = np.random.uniform(0.90, 1.0)
    elif profile_type == 'average':
        base_rate = np.random.uniform(0.75, 0.89)
    elif profile_type == 'declining':
        base_rate = 0.85
        pattern = 'declining'
    elif profile_type == 'at_risk':
        base_rate = np.random.uniform(0.60, 0.74)
    elif profile_type == 'chronic':
        base_rate = np.random.uniform(0.40, 0.59)

    return base_rate, pattern


def generate_sessions(base_rate, pattern, total=TOTAL_SESSIONS):
    statuses = []
    absence_streak = 0

    for i in range(total):
        if pattern == 'declining':
            progress = i / total
            current_rate = base_rate - progress * 0.30
            current_rate = max(current_rate, 0.50)
        else:
            current_rate = base_rate

        if absence_streak >= 4:
            p_present = 0.1
            p_absent = 0.8
            p_late = 0.05
            p_excused = 0.05
        else:
            if pattern == 'chronic':
                p_present = current_rate * 0.6
                p_absent = 1.0 - p_present - 0.10
                p_late = 0.15
                p_excused = 0.05
            elif pattern == 'at_risk':
                p_present = current_rate * 0.8
                p_absent = 1.0 - p_present - 0.08
                p_late = 0.10
                p_excused = 0.04
            else:
                p_present = current_rate * 0.92
                p_absent = 1.0 - p_present - 0.05
                p_late = 0.05
                p_excused = 0.03

        p_present = max(0.05, min(0.95, p_present))
        p_absent = max(0.01, min(0.90, p_absent))
        remaining = 1.0 - p_present - p_absent
        p_late = remaining * 0.6
        p_excused = remaining * 0.4

        r = np.random.random()
        if r < p_present:
            statuses.append('present')
            absence_streak = 0
        elif r < p_present + p_absent:
            statuses.append('absent')
            absence_streak += 1
        elif r < p_present + p_absent + p_late:
            statuses.append('late')
            absence_streak = 0
        else:
            statuses.append('excused')
            absence_streak = 0

    return statuses


def assign_risk_label(statuses):
    total = len(statuses)
    absences = sum(1 for s in statuses if s == 'absent')
    final_absence_rate = absences / total

    max_consecutive = 0
    current = 0
    for s in statuses:
        if s == 'absent':
            current += 1
            max_consecutive = max(max_consecutive, current)
        else:
            current = 0

    if final_absence_rate > 0.40 or max_consecutive >= 4:
        return 3
    if final_absence_rate > 0.25 or max_consecutive >= 3:
        return 2
    if final_absence_rate > 0.10:
        return 1
    return 0


def extract_features(statuses):
    total = len(statuses)
    if total == 0:
        return None

    present = sum(1 for s in statuses if s == 'present')
    absent = sum(1 for s in statuses if s == 'absent')
    late = sum(1 for s in statuses if s == 'late')
    excused = sum(1 for s in statuses if s == 'excused')

    overall_attendance_rate = (present + late) / total
    absence_rate = absent / total
    late_rate = late / total

    max_consecutive_absences = 0
    current_streak = 0
    for s in statuses:
        if s == 'absent':
            current_streak += 1
            max_consecutive_absences = max(max_consecutive_absences, current_streak)
        else:
            current_streak = 0

    recent_count = min(5, total)
    recent_sessions = statuses[-recent_count:]
    earlier_sessions = statuses[:-recent_count]

    recent_absence_rate = sum(1 for s in recent_sessions if s == 'absent') / recent_count
    earlier_absence_rate = sum(1 for s in earlier_sessions if s == 'absent') / len(earlier_sessions) if earlier_sessions else 0
    trend_direction = recent_absence_rate - earlier_absence_rate

    weekly_rates = []
    week_size = max(1, total // 4)
    for i in range(0, total, week_size):
        week = statuses[i:i + week_size]
        week_abs = sum(1 for s in week if s == 'absent') / len(week)
        weekly_rates.append(week_abs)
    volatility = float(np.std(weekly_rates)) if len(weekly_rates) > 1 else 0.0

    unexcused_absences = absent - excused
    unexcused_ratio = unexcused_absences / absent if absent > 0 else 0.0

    last_abs_idx = None
    for i in range(total - 1, -1, -1):
        if statuses[i] == 'absent':
            last_abs_idx = i
            break
    last_absence_recency = (last_abs_idx / total) if last_abs_idx is not None else 0.0

    return {
        'overall_attendance_rate': overall_attendance_rate,
        'absence_rate': absence_rate,
        'late_rate': late_rate,
        'max_consecutive_absences': max_consecutive_absences,
        'recent_absence_rate': recent_absence_rate,
        'trend_direction': trend_direction,
        'volatility': volatility,
        'unexcused_ratio': unexcused_ratio,
        'last_absence_recency': last_absence_recency,
        'total_sessions': total,
    }


def main():
    print("Generating synthetic attendance data...")
    all_features = []
    all_labels = []

    profile_types = ['good'] * (NUM_STUDENTS // 3) \
        + ['average'] * (NUM_STUDENTS // 3) \
        + ['declining'] * (NUM_STUDENTS // 6) \
        + ['at_risk'] * (NUM_STUDENTS // 9) \
        + ['chronic'] * (NUM_STUDENTS // 9)
    profile_types = profile_types[:NUM_STUDENTS]
    np.random.shuffle(profile_types)

    count = 0
    for student_idx in range(NUM_STUDENTS):
        profile = profile_types[student_idx]
        num_courses = np.random.randint(1, min(NUM_COURSES, 4))
        selected_courses = np.random.choice(range(NUM_COURSES), size=num_courses, replace=False)

        base_rate, pattern = generate_student_profile(profile)

        for course_idx in selected_courses:
            if pattern == 'declining':
                statuses = generate_sessions(base_rate, 'declining')
            else:
                statuses = generate_sessions(base_rate, None)

            features = extract_features(statuses)
            if features is None:
                continue

            risk_label = assign_risk_label(statuses)

            all_features.append(features)
            all_labels.append(risk_label)
            count += 1

    print(f"Generated {count} student-course combinations")

    feature_names = list(all_features[0].keys())
    X = np.array([[f[name] for name in feature_names] for f in all_features])
    y = np.array(all_labels)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"\nTraining sample distribution:")
    unique, counts = np.unique(y_train, return_counts=True)
    for l, c in zip(unique, counts):
        labels = {0: 'none', 1: 'low', 2: 'medium', 3: 'high'}
        print(f"  {labels[l]}: {c} samples")

    print("\nTraining Random Forest classifier...")
    rf = RandomForestClassifier(
        n_estimators=200,
        max_depth=12,
        min_samples_leaf=4,
        random_state=42,
        class_weight='balanced'
    )
    rf.fit(X_train, y_train)

    y_pred = rf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\nTest Accuracy: {acc:.4f}")
    print("\nClassification Report:")
    target_names = ['none', 'low', 'medium', 'high']
    print(classification_report(y_test, y_pred, target_names=target_names))

    print("\nFeature Importances:")
    for name, imp in sorted(zip(feature_names, rf.feature_importances_),
                            key=lambda x: x[1], reverse=True):
        print(f"  {name}: {imp:.4f}")

    model_data = {
        'model': rf,
        'feature_names': feature_names,
        'accuracy': acc,
        'training_samples': len(X_train),
        'target_names': target_names,
    }

    model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
    joblib.dump(model_data, model_path)
    print(f"\nModel saved to {model_path}")


if __name__ == '__main__':
    main()
