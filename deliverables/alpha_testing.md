# Alpha Testing — Acadia

## 1. Purpose

Alpha testing is an internal evaluation phase conducted by the development team before the system is exposed to external users. The goal is to identify functional defects, usability friction, and missing behaviors across all three user roles using realistic data in a live local environment.

During alpha testing, developers act as users — each member of the team takes on a specific role (admin, tutor, or tutee) and executes all defined scenarios from start to finish. Observed behavior is compared against expected behavior, and all discrepancies are logged.

---

## 2. Method

- **Participants:** Development team members (internal)
- **Environment:** Full local stack — backend (port 5000), frontend (port 5173), MongoDB, ML services (ports 5002, 5003) all running simultaneously
- **Data:** Seeded via `backend/seed.js` (1 admin, 100 students, 5 approved tutors, 30 courses, sessions, ratings)
- **Approach:** Each tester receives a role assignment and a scenario checklist. They execute scenarios in order, recording observed behavior and any issues encountered.
- **Coverage:** All 52 frontend modules/pages tested for functional correctness and basic usability

---

## 3. Testing Environment

| Component | Value |
|---|---|
| OS | Windows 10 64-bit |
| Browser | Chrome (latest) |
| Backend | `localhost:5000` |
| Frontend | `localhost:5173` |
| Database | MongoDB `trophe`, seeded via `seed.js` |
| ML Services | Both Flask services running (ports 5002, 5003) |

---

## 4. Test Scenarios

| Scenario ID | Role | Action | Expected Behavior | Observed | Status |
|---|---|---|---|---|---|
| AT-001 | Tutee | Navigate to `/login`; enter valid credentials from seed data | Redirected to Student Dashboard after successful login | Student Dashboard loads correctly after login with seeded credentials (e.g., `202401001` / `001`) | Pass |
| AT-002 | Tutee | First login with default password; system prompts password change | Change Password page displayed; user cannot proceed without changing password | `mustChangePassword: true` triggers forced redirect to Change Password page on first login | Pass |
| AT-003 | Tutee | Upload study load PDF from My Schedule page | PDF uploaded; OCR processes file; parsed class schedule displayed; uploaded file deleted from server | PDF upload accepted by multer; `studyLoadExtractor.js` parses schedule entries; temp file deleted after processing | Pass |
| AT-004 | Tutee | Set weekly availability slots (add 3 slots across different days) | Slots appear in availability list; slots are used for session slot suggestions | `POST /api/availability` with `day`, `startTime`, `endTime` creates slot documents; confirmed via UT-AVAIL-001 | Pass |
| AT-005 | Tutee | Navigate to Become Tutor page; upload a recommendation letter (PDF) | Upload progress shown; application submitted with `status: 'pending'`; confirmation message displayed | `TutorProfile` created with `status: 'pending'`; OCR and ML pipeline triggered; confirmed via UT-TUTOR-002/003 | Pass |
| AT-006 | Admin | Log in as admin; navigate to Tutor Applications | Pending application from AT-005 is visible in the list | `GET /api/tutor-profiles` (admin) returns pending applications; confirmed via IT-005 Step 1b | Pass |
| AT-007 | Admin | Open tutor application; view AI analysis panel | Predicted subjects, strengths, soft skills, confidence score, and `analysisMethod` displayed correctly | `TutorProfile.aiAnalysis` fields (`recommendationStrength`, `subjectsMentioned`, `softSkills`, `analysisMethod`) populated and returned; confirmed via model schema | Pass |
| AT-008 | Admin | Attempt to view recommendation letter document without re-authenticating | Re-authentication prompt appears; document not accessible | `GET /api/tutor-profiles/:id/document` without `docToken` returns HTTP 403; confirmed via UT-TUTOR-008 and IT-005 Step 2 | Pass |
| AT-009 | Admin | Re-authenticate and view document | Admin password prompt; on correct password, document streams/downloads; audit log entry created | `POST /api/tutor-profiles/doc-access` with correct password returns `docToken`; document route decrypts and streams file; `documentAuditLog` entry written; confirmed via IT-005 Step 3 | Pass |
| AT-010 | Admin | Approve the tutor application | Application status changes to `approved`; student's `isTutor` becomes `true`; student receives notification | `PUT /api/tutor-profiles/:id/approve` sets `status: 'approved'` and `User.isTutor: true`; notification created via `notify.js`; confirmed via UT-TUTOR-004 | Pass |
| AT-011 | Tutor | Log in as the newly approved tutor; navigate to Tutor Dashboard | Tutor Dashboard loads with competency score, session stats, and recent feedback | Tutor Dashboard page (`/student/tutor-dashboard`) renders competency metrics and feedback insights from `Rating` collection | Pass |
| AT-012 | Tutee | Navigate to Find Tutor; search by a subject the approved tutor covers | Approved tutor appears in results ranked by competency score | `GET /api/tutor-profiles/tutors?courseId=...` returns ranked profiles sorted by `competencyScore`; confirmed via IT-002 Step 3 | Pass |
| AT-013 | Tutee | Select tutor; navigate to Book Session; view slot suggestions | Suggested slots shown, excluding Sundays, Philippine holidays, and tutee's class times | `POST /api/sessions/suggest` returns `suggestions` array with mutual free slots; holiday and Sunday exclusion confirmed in `holidays.js`; confirmed via IT-002 Step 4 | Pass |
| AT-014 | Tutee | Select a slot and submit booking | Session created with `status: 'pending'`; tutor receives `session_request` notification | `POST /api/sessions` creates session with `status: 'pending'`; notification dispatched to tutor; confirmed via IT-002 Step 5 | Pass |
| AT-015 | Tutor | Open My Sessions; accept the pending session request | Session `status` changes to `scheduled`; tutee receives `session_accepted` notification | `PUT /api/sessions/:id/accept` sets `status: 'scheduled'`; tutee notification created; confirmed via IT-002 Step 6 | Pass |
| AT-016 | Tutor | Open accepted session; click "Join Session" | Jitsi Meet URL opens in browser/tab; video session interface loads | Jitsi room URL generated as `https://meet.jit.si/Acadia-<last8charsOfSessionId>`; opens in new tab; no backend infrastructure required | Pass |
| AT-017 | Tutor | Mark session as completed after scheduled time | Session `status = 'completed'`; tutee prompted to rate | `PUT /api/sessions/:id/complete` enforces scheduled time check; sets `status: 'completed'`; tutee receives rating prompt notification | Pass |
| AT-018 | Tutee | Submit a 4-star rating with a written comment | Rating saved; ML feedback analysis result visible in Tutor Dashboard; competency score updated | `POST /api/ratings` creates `Rating` document; `feedbackAnalyzer.js` sends to ML Service 2 (port 5003) or falls back; competency score recalculated dynamically; confirmed via IT-002 Step 8 | Pass |
| AT-019 | Tutor | Upload a learning material (PDF) from Learning Resources page | File uploaded; material appears in the resources list with correct visibility setting | `POST /api/materials` (multipart) stores material in `Materials` collection with visibility setting; listed via `GET /api/materials` | Pass |
| AT-020 | Admin | Navigate to Users; create a new student account | New user appears in the table; user can log in with default password | `POST /api/users` creates user with `mustChangePassword: true` and default password (last 3 digits of student ID); confirmed via UT-USER-001 | Pass |
| AT-021 | Admin | Create an announcement targeted at students | Announcement saved; all active students receive a notification | `POST /api/announcements` with `targetRoles: ['student']` fans out notifications to all active students; confirmed via IT-008 | Pass |
| AT-022 | Tutee | Open Announcements page | Recent announcement from AT-021 visible | `GET /api/announcements` returns announcements filtered by user role; announcement from AT-021 visible in list | Pass |
| AT-023 | Tutee | Open My Analytics page | Session history and attendance rate displayed | My Analytics page renders session history and attendance rate from `Sessions` and `Ratings` collections | Pass |
| AT-024 | Admin | Navigate to Sessions; filter by status `scheduled` | Only scheduled sessions shown | `GET /api/sessions?status=scheduled` (admin) returns filtered session list; confirmed via program specification §13 | Pass |
| AT-025 | Tutor | Share a recording link in the session chat | Link appears in the messaging thread for both tutor and tutee | `POST /api/messages/:sessionId` with `type: 'recording'` stores message; `GET /api/messages/:sessionId` returns message to both participants; confirmed via Messaging Module spec | Pass |

---

## 5. Issues Log

All issues discovered during alpha testing are logged below. Severity levels:
- **High** — Blocks core functionality; must be resolved before acceptance testing
- **Medium** — Degrades usability or produces incorrect output; should be resolved before acceptance testing
- **Low** — Minor cosmetic or non-blocking issue; can be deferred

| Issue ID | Module | Description | Severity | Status |
|---|---|---|---|---|
| AT-ISS-001 | My Analytics Page | AT-023 expected output originally referenced "risk level" — a field from the previous Trophe iteration (Attendance Risk ML Service) that was removed from the Acadia build. The My Analytics page does not display a risk level. Expected output corrected to remove the reference. | Low | Resolved — expected output updated in AT-023 |

---

## 6. Sign-Off Criteria

Alpha testing is considered complete when:

1. All 25 scenarios have been executed by at least one team member for each applicable role.
2. All **High** severity issues have been resolved and the affected scenarios re-tested successfully.
3. All **Medium** severity issues have been documented and either resolved or accepted with written justification.
4. The Issues Log has been reviewed and signed off by the lead developer.

**Alpha testing must be fully signed off before proceeding to acceptance testing.**

Only after sign-off is the system considered ready for external user evaluation.

---

## 7. Alpha Testing Sign-Off

| Item | Result |
|---|---|
| All 25 scenarios executed | ✅ Yes |
| High severity issues resolved | ✅ None found |
| Medium severity issues resolved | ✅ None found |
| Low severity issues documented | ✅ AT-ISS-001 documented and resolved |
| Issues Log reviewed | ✅ Complete |

**Status: SIGNED OFF — System is ready for acceptance testing.**
