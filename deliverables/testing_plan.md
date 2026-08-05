# Testing Plan — Acadia

## 1. Overview

Acadia's testing strategy combines automated API testing, structured manual evaluation, and formal user acceptance evaluation aligned with the Chapter 3 methodology of the study. The goal is to verify functional correctness, system integration, and usability before deployment to actual users.

Testing is conducted in three sequential phases:
1. **Unit Testing** — individual module-level correctness
2. **Integration Testing** — end-to-end flows spanning multiple modules
3. **Alpha Testing** — internal full-system walkthrough by the development team
4. **Acceptance Testing** — evaluation with real participants (n=10 from CCS)

---

## 2. Test Types Employed

| Test Type | Purpose | Method |
|---|---|---|
| Unit Testing | Verify that each module handles valid inputs, invalid inputs, and edge cases correctly in isolation | Manual test case execution against running backend; some cases automated via Newman |
| Integration Testing | Verify that multi-module workflows produce correct end-to-end outcomes | Scenario-based testing using seeded data and real HTTP requests |
| Alpha Testing | Internal full-system walkthrough across all three user roles to catch functional and usability issues before real users are involved | Developers act as users; structured observation; issues logged by severity |
| Acceptance Testing | Evaluate the system with actual target users per the TAM-based research methodology | Guided task completion, structured observation, and Google Forms survey |

---

## 3. Testing Environment

| Component | Configuration |
|---|---|
| Backend | Node.js 18+, Express, running on `localhost:5000` |
| Frontend | Vite dev server on `localhost:5173` |
| Database | MongoDB 7.x, local instance, database: `trophe` |
| ML Service 1 (Recommendation) | Python Flask on `localhost:5002` |
| ML Service 2 (Feedback) | Python Flask on `localhost:5003` |
| ML Service 3 (Attendance) | Python Flask on `localhost:5001` |
| Operating System | Windows 10 64-bit |
| Browser | Google Chrome (latest) |
| Network | Localhost; internet access available for Jitsi Meet and OpenAI fallback testing |

All services must be running concurrently for integration and alpha testing. Unit tests for individual backend logic can be run with only the backend and MongoDB active.

---

## 4. Test Data

Test data is seeded using `backend/seed.js`. The seed script populates the following:

| Entity | Count/Details |
|---|---|
| Admin accounts | 1 super admin (`admin@acadia.edu` / `admin123`) |
| Student accounts | 100 students across departments |
| Faculty accounts | 5 faculty users |
| Courses | 30 courses across departments with curriculum metadata |
| Approved tutors | 5 students with `isTutor: true` and completed `TutorProfile` records |
| Sessions | Mix of pending, scheduled, and completed sessions |
| Ratings | Ratings for completed sessions |
| Availability | Weekly slots for all 5 tutors |
| Departments | Multiple departments (e.g., CCS, COE) |

Additional seed scripts:
- `seed-demo.js` — lightweight demo data for presentations
- `seed-reviews.js` — synthetic ratings and feedback for ML Feedback Service testing

---

## 5. Testing Tools

| Tool | Version | Purpose |
|---|---|---|
| Newman | 6.1.1 | CLI runner for Postman API test collections. Executes all API routes programmatically. |
| newman-reporter-htmlextra | latest | Generates detailed HTML reports from Newman runs with request/response diffs, pass/fail summaries, and timings. |
| Postman | latest | API collection authoring, manual endpoint exploration, and collection export. |
| Google Forms | N/A | Structured survey instrument for acceptance testing (as per Chapter 3 methodology). |

### Running the API Test Suite

```bash
newman run acadia_api_tests.postman_collection.json \
  --environment acadia_local.postman_environment.json \
  --reporters cli,htmlextra \
  --reporter-htmlextra-export ./test-reports/api-report.html
```

---

## 6. Test Roles

| Role | Description |
|---|---|
| Admin | Uses the super admin account seeded by `seed.js`. Tests user management, tutor application review, session oversight, and announcement creation. |
| Tutor | A student account with `isTutor: true` and an approved `TutorProfile`. Tests availability management, session acceptance/rejection, material upload, and the Tutor Dashboard. |
| Tutee | A regular student account without `isTutor`. Tests study load upload, tutor search, session booking, rating submission, and analytics. |

---

## 7. Testing Phases

| Phase | Timing | Participants | Tools |
|---|---|---|---|
| Unit Testing | During development, before integration | Development team | Manual + Newman |
| Integration Testing | After all modules are complete | Development team | Newman + Manual |
| Alpha Testing | After integration testing passes | Development team (acting as users) | Manual observation |
| Acceptance Testing | After alpha sign-off | 10 CCS participants (purposive sample) | Guided tasks + Google Forms |

---

## 8. Pass/Fail Criteria

### Unit Testing
- **Pass:** Module returns the expected output for the given input as defined in the test case table. HTTP status code, response body structure, and database state all match expectations.
- **Fail:** Any deviation from expected output, unexpected errors, or incorrect database state.

### Integration Testing
- **Pass:** The complete multi-step flow produces the correct final state across all involved modules and collections, with correct notification delivery and no data corruption.
- **Fail:** Any intermediate step fails, the final state is incorrect, or side effects (notifications, audit logs, competency score updates) do not occur.

### Alpha Testing
- **Pass:** All test scenarios complete without blocking errors. All High-severity issues identified in alpha are resolved before proceeding to acceptance testing.
- **Fail:** Any scenario cannot be completed due to a system error. All High-severity issues block sign-off.

### Acceptance Testing
- **Pass:** ≥ 70% of participants rate the system as usable (TAM benchmark — perceived usefulness and ease of use rated ≥ 3.5/5 on average). All defined tasks can be completed by ≥ 70% of participants with at most minimal guidance.
- **Fail:** Below 70% usability threshold, or critical tasks (login, booking, applying as tutor) have <70% completion rate.

---

## 9. Known Limitations and Constraints

| Limitation | Impact on Testing |
|---|---|
| ML models trained on synthetic data | Recommendation letter analysis accuracy may not reflect real faculty letters. OCR quality depends heavily on document scan quality. |
| Jitsi Meet requires internet | Video session testing requires an internet-connected environment. |
| OCR processing speed | Tesseract.js OCR can take 10–30 seconds per document; integration tests involving document upload will have longer execution times. |
| No automated UI testing | Frontend testing is manual (alpha/acceptance phases); no Cypress or Playwright suite is included. |
| Rate limiter state | Newman tests that repeat the same login endpoint rapidly may trigger the login rate limiter (10/15min). The environment should be reset between test runs if needed. |
