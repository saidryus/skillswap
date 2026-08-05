# Integration Testing — Acadia

## Overview

Integration tests verify end-to-end workflows that span multiple modules, collections, and service boundaries. Each test case describes a complete flow, the steps required, the expected final system state, and the pass/fail result.

All integration tests are run against the full local environment (backend on port 5000, ML services on ports 5001–5003, MongoDB with seeded data). Newman is used for automated HTTP steps; notifications and database state are verified manually or via follow-up API calls.

---

## IT-001: Full Tutor Application Flow

**Flow:** Student applies as tutor → ML pipeline processes document → Admin reviews and approves → Student becomes a tutor

| Step | Action | Expected Intermediate Result |
|---|---|---|
| 1 | Student logs in (`POST /api/auth/login`) | HTTP 200; JWT token returned |
| 2 | Student adds at least one availability slot (`POST /api/availability`) | HTTP 201; `Availability` document created |
| 3 | Student submits tutor application with recommendation letter PDF (`POST /api/tutor-profiles` with multipart file) | HTTP 202; `TutorProfile` created with `status: 'pending'`; OCR triggered |
| 4 | Backend processes document: OCR → textRedactor → signatureDetector → ML Service 1 | ML analysis result stored in `TutorProfile.analysisResult`; encrypted file saved to `uploads/grade-documents/` |
| 5 | Admin receives notification (`GET /api/notifications`) | Notification of type `tutor_application_submitted` visible to admin |
| 6 | Admin re-authenticates for document access (`POST /api/tutor-profiles/:id/reauth`) | HTTP 200; `docToken` returned |
| 7 | Admin views document (`GET /api/tutor-profiles/:id/document?docToken=<token>`) | Decrypted document streamed; audit log entry created in DB |
| 8 | Admin views AI analysis panel (`GET /api/tutor-profiles/:id`) | Analysis result, confidence score, and predicted subjects/strengths visible |
| 9 | Admin approves application (`PATCH /api/tutor-profiles/:id/approve`) | HTTP 200; `TutorProfile.status = 'approved'`; `User.isTutor = true`; competency score calculated |
| 10 | Verify final state | `User.isTutor === true`; encrypted document file deleted from disk; student notification of approval created |

**Expected Result:** Student's `isTutor` flag is `true`, `TutorProfile.status` is `'approved'`, competency score is computed and stored, original document file is deleted from the filesystem, and audit log has at least one `'view'` entry.

**Pass/Fail:** Pass

---

## IT-002: Full Session Booking Flow

**Flow:** Tutee finds tutor → requests slot suggestions → books session → tutor accepts → session completes → tutee rates → competency score updates

| Step | Action | Expected Intermediate Result |
|---|---|---|
| 1 | Tutee logs in | JWT token returned |
| 2 | Tutee queries eligible courses (`GET /api/curriculum`) | List of courses for tutee's year/semester/department |
| 3 | Tutee searches for tutors by subject (`GET /api/tutor-profiles?subject=...`) | List of approved tutors ranked by competency score |
| 4 | Tutee requests slot suggestions (`GET /api/sessions/suggest-slots?tutorId=...`) | List of mutually free, non-holiday, non-Sunday time slots |
| 5 | Tutee books a session (`POST /api/sessions`) | HTTP 201; `Session` created with `status: 'pending'`; tutor receives `session_request` notification |
| 6 | Tutor logs in and accepts session (`PATCH /api/sessions/:id/accept`) | HTTP 200; `Session.status = 'scheduled'`; tutee receives `session_accepted` notification |
| 7 | After scheduled time: tutor marks session complete (`PATCH /api/sessions/:id/complete`) | HTTP 200; `Session.status = 'completed'` |
| 8 | Tutee submits rating (`POST /api/ratings`) | HTTP 201; `Rating` document created; ML feedback analysis queued |
| 9 | Competency score recalculated | `TutorProfile.competencyScore` reflects updated average rating |

**Expected Result:** `Session.status === 'completed'`, `Rating` document exists and linked to session, `TutorProfile.competencyScore` is updated, both tutor and tutee received correct notifications at each step.

**Pass/Fail:** Pass

---

## IT-003: Study Load Upload Flow

**Flow:** Student uploads PDF study load → OCR parses schedule → student ID verified → StudentSchedule created → uploaded file deleted

| Step | Action | Expected Intermediate Result |
|---|---|---|
| 1 | Student logs in | JWT token returned |
| 2 | Student uploads PDF (`POST /api/student-schedules/upload` with multipart PDF) | HTTP 202; file received by multer; OCR processing begins |
| 3 | `studyLoadExtractor.js` parses PDF text layer | Structured schedule entries extracted (subject codes, days, times) |
| 4 | Extracted student ID compared to `req.user.studentId` | If mismatch: HTTP 400 "Student ID on document does not match your account" |
| 5 | On ID match: `StudentSchedule` document created or updated | `StudentSchedule` contains parsed class time blocks |
| 6 | Uploaded PDF file deleted from server | No temp file remains in `uploads/` after processing |

**Expected Result:** `StudentSchedule` document exists in DB with correct class time entries, uploaded temp file is deleted, subsequent slot suggestions correctly exclude the student's class times as busy periods.

**Pass/Fail:** Pass

---

## IT-004: ML Fallback Chain

**Flow:** Recommendation letter submitted while ML Service 1 is down → LLM fallback → LLM unavailable → rule-based fallback

| Step | Action | Expected Intermediate Result |
|---|---|---|
| 1 | Stop ML Service 1 (port 5002) | Service not running |
| 2 | Student submits tutor application with recommendation letter | Backend attempts `POST http://localhost:5002/analyze` |
| 3 | ML Service 1 returns ECONNREFUSED | `mlRecommendationClient.js` catches error; logs fallback trigger |
| 4 | `OPENAI_API_KEY` is set in environment | `llmDocumentAnalyzer.js` is called with redacted OCR text |
| 5 | LLM returns structured analysis | `TutorProfile.analysisResult` populated with `analysisMethod: 'llm'` |
| 5b | (Alternative) Remove `OPENAI_API_KEY` from env | `llmDocumentAnalyzer.js` skipped |
| 6 | Rule-based fallback executes | Keyword pattern matching on redacted text; `analysisMethod: 'rule-based'`; partial results stored |
| 7 | Application saved with fallback analysis | HTTP 202 still returned to client; no 500 error |

**Expected Result:** Application is saved successfully regardless of which fallback tier is reached. The `analysisMethod` field in `TutorProfile.analysisResult` correctly reflects which tier was used. No HTTP 500 errors are returned to the client.

**Pass/Fail:** Pass

---

## IT-005: Document Security Gate Flow

**Flow:** Admin attempts document access without re-auth → blocked → re-authenticates → views document → audit log recorded

| Step | Action | Expected Intermediate Result |
|---|---|---|
| 1 | Admin logs in | JWT token returned |
| 2 | Admin requests document directly (`GET /api/tutor-profiles/:id/document`) without `docToken` | HTTP 403; "Document re-authentication required" |
| 3 | Admin POSTs re-auth (`POST /api/tutor-profiles/:id/reauth`) with correct password | HTTP 200; `docToken` (short-lived JWT, 15 min) returned |
| 4 | Admin requests document with valid `docToken` in query string | HTTP 200; decrypted document bytes streamed; audit log entry `{ action: 'view', adminId, ip, timestamp }` written to DB |
| 5 | Admin uses the same `docToken` after 15 minutes | HTTP 401; "Document token expired" |
| 6 | Admin POSTs re-auth 3 times with wrong password | After 3rd failure: HTTP 403; account flagged with 3-hour document lockout stored on User record |
| 7 | Admin attempts re-auth during 3-hour lockout | HTTP 403; "Document access locked. Try again after [timestamp]" |

**Expected Result:** Document is inaccessible without a valid `docToken`. Every successful document view creates an audit log entry. Brute-force protection correctly locks document re-auth after 3 failures for 3 hours.

**Pass/Fail:** Pass

---

## IT-006: Notification Delivery Flow

**Flow:** Booking creates notifications → acceptance creates notifications → correct users receive correct notification types

| Step | Action | Expected Intermediate Result |
|---|---|---|
| 1 | Tutee books session (`POST /api/sessions`) | `notify.js` called for tutor: notification `{ type: 'session_request', userId: tutorId }` created in Notifications collection |
| 2 | Tutor queries notifications (`GET /api/notifications`) | `session_request` notification visible and `isRead: false` |
| 3 | Tutor accepts session (`PATCH /api/sessions/:id/accept`) | `notify.js` called for tutee: notification `{ type: 'session_accepted', userId: tuteeId }` created |
| 4 | Tutee queries notifications | `session_accepted` notification visible; previous tutor notifications remain in their own feed |
| 5 | Tutee marks notification as read (`PATCH /api/notifications/:id/read`) | `isRead: true` set on notification document |
| 6 | Tutor marks all notifications as read (`PATCH /api/notifications/read-all`) | All of tutor's notifications set to `isRead: true` |

**Expected Result:** Notifications are correctly routed to the intended recipient's userId. Notification types match the triggering event. Read/unread state is independently managed per user.

**Pass/Fail:** Pass

---

## IT-007: Account Lockout and Recovery Flow

**Flow:** 3 failed logins → account locked → admin unlocks → successful login

| Step | Action | Expected Intermediate Result |
|---|---|---|
| 1 | POST 3 login attempts with wrong password for same account | HTTP 401 each time; `User.loginAttempts` increments to 3 |
| 2 | 3rd failure triggers lockout | `User.isLocked = true`; `User.lockUntil` set to a future timestamp |
| 3 | Attempt login with correct password while locked | HTTP 403; "Account locked" |
| 4 | Admin resets user's locked state via user update (`PATCH /api/users/:id`) | `isLocked: false`, `loginAttempts: 0` reset on User document |
| 5 | User logs in with correct credentials after admin reset | HTTP 200; JWT token returned; login successful |

**Expected Result:** Lockout is correctly applied after 3 failures. Correct credentials are rejected while the account is locked. Admin can unlock the account. Login succeeds after unlock.

**Pass/Fail:** Pass

---

## IT-008: Announcement with Notification Fan-Out

**Flow:** Admin creates announcement targeted at students → all active student accounts receive a notification

| Step | Action | Expected Intermediate Result |
|---|---|---|
| 1 | Admin creates announcement (`POST /api/announcements`) with `targetRole: 'student'` | HTTP 201; `Announcement` document created |
| 2 | Backend fans out: queries all Users where `role: 'student'` and `isActive: true` | `notify.js` called for each student |
| 3 | Notification documents created for each active student | Count of new notifications = count of active student users |
| 4 | Random student queries notifications | New announcement notification visible in their feed |

**Expected Result:** Every active student account has a new notification linked to the announcement. Inactive users and non-student roles do not receive the notification.

**Pass/Fail:** Pass
