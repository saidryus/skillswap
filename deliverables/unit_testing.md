# Unit Testing — Acadia

## Overview

Unit tests verify individual module behavior in isolation. Each test case defines a specific input scenario, the expected system output, and the pass/fail result. Tests are executed manually against the running backend with seeded test data unless otherwise noted.

**Status values:** Pass / Fail / Not Run

---

## Authentication Module

| Test Case ID | Module | Input | Expected Output | Pass/Fail |
|---|---|---|---|---|
| UT-AUTH-001 | Auth | Valid email + correct password | HTTP 200; response contains `token` (JWT); user object with `role`, `name`, `_id` | Pass |
| UT-AUTH-002 | Auth | Valid email + incorrect password | HTTP 401; error message: "Invalid credentials"; `loginAttempts` incremented on User document | Pass |
| UT-AUTH-003 | Auth | Valid email, 3 consecutive wrong passwords | After 3rd failure: HTTP 401; `isLocked: true` set on User; subsequent login attempt with correct password returns HTTP 403 "Account locked" | Pass |
| UT-AUTH-004 | Auth | Login with a locked account | HTTP 403; response indicates account is locked | Pass |
| UT-AUTH-005 | Auth | Login with `isActive: false` account | HTTP 403; response indicates account is inactive | Pass |
| UT-AUTH-006 | Auth — Change Password | Authenticated user submits current password (correct) + new password + confirmation (matching) | HTTP 200; password updated; `mustChangePassword: false` on User; old JWT still valid until expiry | Pass |
| UT-AUTH-007 | Auth — Change Password | New password and confirmation do not match | HTTP 400; validation error returned; password not changed | Pass |
| UT-AUTH-008 | Auth — Change Password | Current password provided is incorrect | HTTP 401; password not changed | Pass |
| UT-AUTH-009 | Auth | Request to protected route without Authorization header | HTTP 401; "No token provided" | Pass |
| UT-AUTH-010 | Auth | Request to protected route with expired JWT | HTTP 401; "Token expired" | Pass |

---

## User Management Module

| Test Case ID | Module | Input | Expected Output | Pass/Fail |
|---|---|---|---|---|
| UT-USER-001 | User | Admin creates a new student with all required fields (name, email, studentId, department) | HTTP 201; new User document created; `mustChangePassword: true`; default password set | Pass |
| UT-USER-002 | User | Admin creates user with an email already in the database | HTTP 409; error: "Email already in use"; no new document created | Pass |
| UT-USER-003 | User | Admin creates student with a `studentId` already in the database | HTTP 409; error: "Student ID already in use"; no new document created | Pass |
| UT-USER-004 | User | Admin uploads CSV with 5 valid rows + 1 row missing required `email` field | HTTP 207; 5 users created; 1 row returned in `errors` array with row number and reason; valid rows are not rolled back | Pass |
| UT-USER-005 | User | Admin with department A tries to view/edit a user in department B | HTTP 403 or empty result (department scope enforced) | Pass |
| UT-USER-006 | User | Admin updates a user's role from `student` to `faculty` | HTTP 200; User document updated; role change reflected in next login JWT | Pass |
| UT-USER-007 | User | Admin deletes a user | HTTP 200; User document removed from `Users` collection | Pass |

---

## Tutor Application Module

| Test Case ID | Module | Input | Expected Output | Pass/Fail |
|---|---|---|---|---|
| UT-TUTOR-001 | Tutor Application | Student submits application without having set any availability slots | HTTP 400; error: "You must set your availability before applying"; no `TutorProfile` created | Pass |
| UT-TUTOR-002 | Tutor Application | Student submits application without attaching a recommendation letter file | HTTP 400; validation error for missing file; no document processing triggered | Pass |
| UT-TUTOR-003 | Tutor Application | Student submits application with availability set + valid PDF recommendation letter | HTTP 202; `TutorProfile` created with `status: 'pending'`; OCR and ML analysis triggered; encrypted document stored; admin notification created | Pass |
| UT-TUTOR-004 | Tutor Application | Admin approves a pending tutor application | HTTP 200; `TutorProfile.status = 'approved'`; `User.isTutor = true`; competency score calculated and stored | Pass |
| UT-TUTOR-005 | Tutor Application | Admin rejects a pending application | HTTP 200; `TutorProfile.status = 'rejected'`; `User.isTutor` remains false; applicant notification created | Pass |
| UT-TUTOR-006 | Tutor Application | Competency score calculation with: avgRating=4.5, recommendationScore=80, completionRate=90%, completedSessions=15 | `competencyScore = (4.5/5)×0.45 + (80/100)×0.15 + (90/100)×0.20 + (15/20)×0.20 = 0.405 + 0.12 + 0.18 + 0.15 = 0.855` | Pass |
| UT-TUTOR-007 | Tutor Application | Competency score with completedSessions=25 (above cap of 20) | Session count component uses `min(25/20, 1) = 1.0`; full 0.20 weight applied | Pass |
| UT-TUTOR-008 | Tutor Application | Admin attempts to view document without re-authenticating | HTTP 403; "Document re-authentication required" | Pass |
| UT-TUTOR-009 | Tutor Application | Student submits a second application while one is already `pending` | HTTP 409; error: "Application already pending"; no duplicate TutorProfile created | Pass |

---

## Session Scheduling Module

| Test Case ID | Module | Input | Expected Output | Pass/Fail |
|---|---|---|---|---|
| UT-SESS-001 | Session | Tutee requests slot suggestions for a tutor who has not set any availability | HTTP 400; error: "Tutor has no availability configured" or empty slots array returned | Pass |
| UT-SESS-002 | Session | Tutee requests slot suggestions; tutor has availability but tutee has no study load uploaded | HTTP 200; slots suggested based on tutor availability alone (no tutee busy-time filtering applied) | Pass |
| UT-SESS-003 | Session | Slot suggestion run for a date that falls on a Philippine public holiday | Holiday date is excluded from returned slot suggestions | Pass |
| UT-SESS-004 | Session | Slot suggestion run for a date that falls on a Sunday | Sunday slots are excluded from returned slot suggestions | Pass |
| UT-SESS-005 | Session | Tutee books a slot that is already occupied by another `scheduled` session for the same tutor | HTTP 409; error: "Slot not available"; no duplicate session created | Pass |
| UT-SESS-006 | Session | Tutor accepts a pending session request | HTTP 200; session `status = 'scheduled'`; tutee receives `session_accepted` notification | Pass |
| UT-SESS-007 | Session | Tutor rejects a pending session request | HTTP 200; session `status = 'rejected'`; tutee receives `session_rejected` notification | Pass |
| UT-SESS-008 | Session | Tutor attempts to mark a session as complete before the scheduled end time | HTTP 400; error: "Session cannot be completed before its scheduled time" | Pass |
| UT-SESS-009 | Session | Tutor marks a session as complete after the scheduled time has passed | HTTP 200; session `status = 'completed'`; tutee receives prompt to submit rating | Pass |
| UT-SESS-010 | Session | Student cancels a session | HTTP 200; session `status = 'cancelled'`; other party notified | Pass |

---

## Rating & Feedback Module

| Test Case ID | Module | Input | Expected Output | Pass/Fail |
|---|---|---|---|---|
| UT-RATE-001 | Rating | Tutee submits a 5-star rating with a written comment for a `completed` session | HTTP 201; `Rating` document created; tutor's `competencyScore` recalculated; ML feedback analysis triggered | Pass |
| UT-RATE-002 | Rating | Tutee attempts to rate a session with `status = 'scheduled'` (not yet complete) | HTTP 400; error: "Session must be completed before rating" | Pass |
| UT-RATE-003 | Rating | Tutee submits a second rating for the same session | HTTP 409; error: "You have already rated this session" | Pass |
| UT-RATE-004 | Rating | Rating submitted with a value of 0 | HTTP 400; validation error: rating must be between 1 and 5 | Pass |
| UT-RATE-005 | Rating | Rating submitted with a value of 6 | HTTP 400; validation error: rating must be between 1 and 5 | Pass |

---

## Availability Module

| Test Case ID | Module | Input | Expected Output | Pass/Fail |
|---|---|---|---|---|
| UT-AVAIL-001 | Availability | Tutor adds a new weekly slot: Monday 10:00–12:00 | HTTP 201; `Availability` document created with `dayOfWeek: 'Monday'`, `startTime: '10:00'`, `endTime: '12:00'`, linked to user | Pass |
| UT-AVAIL-002 | Availability | Tutor removes an existing availability slot | HTTP 200; `Availability` document deleted; slot no longer returned in suggestions | Pass |
| UT-AVAIL-003 | Availability | Slot suggestion check for user with at least one slot set | `hasAvailability` returns true; slot suggestions can be generated | Pass |
| UT-AVAIL-004 | Availability | Tutor adds duplicate slot (same day + same times) | HTTP 409 or existing slot returned without duplication; no duplicate document created | Pass |

---

## Curriculum Module

| Test Case ID | Module | Input | Expected Output | Pass/Fail |
|---|---|---|---|---|
| UT-CURR-001 | Curriculum | Query eligible courses for Year 2, Semester 1, Department: CCS | Returns only courses where `yearLevel: 2`, `semester: 1`, `department: CCS` | Pass |
| UT-CURR-002 | Curriculum | Query eligible courses for Year 4, Semester 2, Department: CCS | Returns only courses where `yearLevel: 4`, `semester: 2`, `department: CCS` | Pass |
| UT-CURR-003 | Curriculum | Query for a year/semester/department combination with no courses in the database | Returns empty array; HTTP 200 (not 404) | Pass |

---

## ML Confidence Score / Document Analysis

| Test Case ID | Module | Input | Expected Output | Pass/Fail |
|---|---|---|---|---|
| UT-CONF-001 | Recommendation Analyzer | OCR text with subject mentions, faculty name present, signature block present | High confidence score returned; all three indicators present; `hasFacultyName: true`, `hasSignature: true` | Pass |
| UT-CONF-002 | Recommendation Analyzer | OCR text with no signature keywords detected (`hasSignature: false`) | Confidence score penalized; score below threshold for auto-approval | Pass |
| UT-CONF-003 | Recommendation Analyzer | OCR text with no faculty name detected, no signature | Low confidence score; admin sees warning in AI analysis panel | Pass |
| UT-CONF-004 | Recommendation Analyzer | ML Service 1 is not running (connection refused) | System falls through to LLM fallback (if key present) or rule-based fallback; no 500 error returned to client | Pass |
| UT-CONF-005 | Recommendation Analyzer | ML Service 1 down AND `OPENAI_API_KEY` not set | Rule-based fallback executes; partial analysis result returned with `analysisMethod: 'rule-based'` | Pass |
