# Sample Recommendation Letters for Testing

Convert these to PDF before uploading to Acadia.

## HIGH_SCORE_recommendation.txt → Expected: ~85-93% confidence

What makes it score high:
- Has institutional letterhead indicators (University, College, Department)
- Has strong recommendation language ("highly recommend", "strongly recommend", "without reservation", "I am confident", "I endorse")
- Student name "Rafael Dela Cruz" is mentioned
- Student ID "202203001" is mentioned
- Faculty name and position detected ("Dr. Maria Theresa Gonzales", "Department Head")
- Date is present
- Signature indicators ("Respectfully", "Noted by")
- Multiple soft skills mentioned (communication, leadership, problem solving, patience, teamwork)
- Subjects mentioned match what the tutor would select (Information Security, Systems Administration, Web Development)
- Word count is substantial (300+ words)
- Uses Acadia template markers

## LOW_SCORE_recommendation.txt → Expected: ~5-15% confidence

What makes it score low:
- No letterhead
- No formal recommendation language (just "can tutor" — not a recommendation phrase)
- Student name only partially mentioned (first name only, lowercase)
- No student ID
- No faculty name or position
- No date
- No signature indicators
- No soft skills mentioned
- Only one subject vaguely mentioned ("programming")
- Extremely short (under 50 words → triggers anomaly)
- No template markers
- Multiple anomalies flagged

## How to test

1. Open each .txt file
2. Copy the content into a Word doc or just print to PDF
3. Log in as Rafael (202203001 / 001)
4. Go to Become a Tutor → select a course (e.g., Information Security)
5. Upload the PDF
6. Check the admin panel → Tutor Applications to see the analysis results

## What the admin should see

### For HIGH_SCORE:
- Confidence: ~85-93% (High) — green badge
- Recommendation Strength: Strong
- Signature: Detected
- Letterhead: Detected
- Subject Alignment: 100% (if correct courses selected)
- Anomalies: 0 or minimal
- Soft Skills: communication, leadership, problem solving, patience, teamwork

### For LOW_SCORE:
- Confidence: ~5-15% (Low) — red badge
- Recommendation Strength: None
- Signature: Not detected
- Letterhead: Not detected
- Subject Alignment: 0% or very low
- Anomalies: 5-6 (short document, no name, no signature, no recommendation language, no letterhead, no date)
- Soft Skills: None detected
