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
- **Coverage:** All frontend modules/pages tested for functional correctness and basic usability

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
| AT-001 | Tutee | Navigate to `/login`; enter valid credentials from seed data | Redirected to Student Dashboard after successful login | Student Dashboard loaded correctly after entering seeded credentials (`202401001` / `001`). Password change screen appeared as expected on first login. | ✓ Pass |
| AT-002 | Tutee | First login with default password; system prompts password change | Change Password page displayed; user cannot proceed without changing password | System immediately redirected to Change Password page. Navigation to other pages was blocked until password was changed. | ✓ Pass |
| AT-003 | Tutee | Upload study load PDF from My Schedule page | PDF uploaded; OCR processes file; parsed class schedule displayed; uploaded file deleted from server | PDF accepted. OCR processing took approximately 15 seconds. Parsed schedule entries appeared on screen. Confirmed temp file removed from server after processing. | ✓ Pass |
| AT-004 | Tutee | Set weekly availability slots (add 3 slots across different days) | Slots appear in availability list; slots are used for session slot suggestions | Three slots added across Monday, Wednesday, and Friday. Slots displayed correctly in the availability grid. Slot suggestions later reflected these times. | ✓ Pass |
| AT-005 | Tutee | Navigate to Become Tutor page; upload a recommendation letter (PDF) | Upload progress shown; application submitted with `status: 'pending'`; confirmation message displayed | Upload progress indicator shown during file upload. Application submitted successfully. Status displayed as Pending on the page. Admin received notification. | ✓ Pass |
| AT-006 | Admin | Log in as admin; navigate to Tutor Applications | Pending application from AT-005 is visible in the list | Admin dashboard loaded. Navigated to Tutor Applications. Pending application from AT-005 appeared in the list with applicant name, course, and confidence score. | ✓ Pass |
| AT-007 | Admin | Open tutor application; view AI analysis panel | Predicted subjects, strengths, soft skills, confidence score, and `analysisMethod` displayed correctly | AI analysis panel opened correctly. Predicted subjects, recommendation strength, soft skills, and confidence score all displayed. Analysis method shown as `ml`. | ✓ Pass |
| AT-008 | Admin | Attempt to view recommendation letter document without re-authenticating | Re-authentication prompt appears; document not accessible | Clicking View Document immediately showed a password prompt. Document was not accessible until password was entered. HTTP 403 returned without token. | ✓ Pass |
| AT-009 | Admin | Re-authenticate and view document | Admin password prompt; on correct password, document streams/downloads; audit log entry created | Entered correct admin password. Document opened in browser as PDF. Audit log entry confirmed via database inspection (action: `viewed`, adminId and IP logged). | ✓ Pass |
| AT-010 | Admin | Approve the tutor application | Application status changes to `approved`; student's `isTutor` becomes `true`; student receives notification | Application status updated to Approved. Student account's `isTutor` flag confirmed as `true`. Student received in-app notification of approval. | ✓ Pass |
| AT-011 | Tutor | Log in as the newly approved tutor; navigate to Tutor Dashboard | Tutor Dashboard loads with competency score, session stats, and recent feedback | Tutor Dashboard loaded and displayed competency score breakdown (ratings, recommendation, completion rate, sessions). Session statistics and pending requests visible. | ✓ Pass |
| AT-012 | Tutee | Navigate to Find Tutor; search by a subject the approved tutor covers | Approved tutor appears in results ranked by competency score | Approved tutor appeared in the ranked list for the searched subject. Competency score, average rating, and subject badges displayed on the tutor card. | ✓ Pass |
| AT-013 | Tutee | Select tutor; navigate to Book Session; view slot suggestions | Suggested slots shown, excluding Sundays, Philippine holidays, and tutee's class times | Slot suggestions displayed correctly. Sundays excluded from the list. Class schedule times correctly blocked. Holiday dates absent from suggestions. | ✓ Pass |
| AT-014 | Tutee | Select a slot and submit booking | Session created with `status: 'pending'`; tutor receives `session_request` notification | Session booking submitted successfully. Status showed as Pending in My Sessions. Tutor received notification for the new session request. | ✓ Pass |
| AT-015 | Tutor | Open My Sessions; accept the pending session request | Session `status` changes to `scheduled`; tutee receives `session_accepted` notification | Tutor accepted the session. Status updated to Scheduled. Tutee received in-app notification confirming the session was accepted. | ✓ Pass |
| AT-016 | Tutor | Open accepted session; click "Join Session" | Jitsi Meet URL opens in browser/tab; video session interface loads | Join Session button opened Jitsi Meet in a new browser tab. Video interface loaded successfully. Room name matched expected format (`Acadia-<sessionId suffix>`). | ✓ Pass |
| AT-017 | Tutor | Mark session as completed after scheduled time | Session `status = 'completed'`; tutee prompted to rate | Mark as Complete button became active after the scheduled end time. Session status changed to Completed. Tutee received prompt to submit a rating. | ✓ Pass |
| AT-018 | Tutee | Submit a 4-star rating with a written comment | Rating saved; ML feedback analysis result visible in Tutor Dashboard; competency score updated | 4-star rating submitted with comment. Rating appeared in the tutor's profile. Feedback insights updated on Tutor Dashboard. Competency score recalculated to reflect the new rating. | ✓ Pass |
| AT-019 | Tutor | Upload a learning material (PDF) from Learning Resources page | File uploaded; material appears in the resources list with correct visibility setting | PDF uploaded successfully. Material appeared in the Learning Resources page with the selected visibility setting. Download link functional. | ✓ Pass |
| AT-020 | Admin | Navigate to Users; create a new student account | New user appears in the table; user can log in with default password | New student account created with a test student ID. Account appeared in the Users table immediately. Logged in with default password (last 3 digits of student ID) successfully. | ✓ Pass |
| AT-021 | Admin | Create an announcement targeted at students | Announcement saved; all active students receive a notification | Announcement created with target audience set to Students. Announcement saved and appeared in the Announcements page. Active student accounts received in-app notifications. | ✓ Pass |
| AT-022 | Tutee | Open Announcements page | Recent announcement from AT-021 visible | Announcements page loaded. Announcement created in AT-021 visible at the top of the list. | ✓ Pass |
| AT-023 | Tutee | Open My Analytics page | Session history, attendance rate, and monthly trend displayed | My Analytics page loaded. Session counts by status displayed. Attendance rate calculated and shown. Monthly trend chart visible with last 6 months of data. | ✓ Pass |
| AT-024 | Admin | Navigate to Sessions; filter by status `scheduled` | Only scheduled sessions shown | Sessions page loaded. Status filter set to Scheduled. List updated to show only sessions with Scheduled status. Other statuses not present in filtered results. | ✓ Pass |
| AT-025 | Tutor | Share a recording link in the session chat | Link appears in the messaging thread for both tutor and tutee | Recording link pasted into the session chat. Message appeared in the chat thread for the tutor. Tutee view of the same session showed the recording link message. | ✓ Pass |

---

## 5. Issues Log

All issues discovered during alpha testing are logged below. Severity levels:
- **High** — Blocks core functionality; must be resolved before acceptance testing
- **Medium** — Degrades usability or produces incorrect output; should be resolved before acceptance testing
- **Low** — Minor cosmetic or non-blocking issue; can be deferred

| Issue ID | Module | Description | Severity | Status |
|---|---|---|---|---|
| AT-ISS-001 | Study Load Upload (AT-003) | OCR processing time was approximately 15 seconds for a standard PDF. Longer for image-based PDFs. No loading indicator visible during processing on slower machines. | Low | Accepted — system displays an upload progress indicator; OCR delay is a known hardware-dependent limitation documented in the software specification. |
| AT-ISS-002 | Session Completion (AT-017) | Mark as Complete button is hidden before the session end time, which is correct, but no message is shown explaining why the button is not yet available. Users may be confused. | Low | Accepted — behavior is intentional per system design. A tooltip or helper text can be added in a future iteration. |

---

## 6. Sign-Off Criteria

Alpha testing is considered complete when:

1. All 25 scenarios have been executed by at least one team member for each applicable role.
2. All **High** severity issues have been resolved and the affected scenarios re-tested successfully.
3. All **Medium** severity issues have been documented and either resolved or accepted with written justification.
4. The Issues Log has been reviewed and signed off by the lead developer.

**Alpha testing must be fully signed off before proceeding to acceptance testing.**

---

## 7. Alpha Testing Sign-Off

| Item | Result |
|---|---|
| All 25 scenarios executed | ✅ Yes — all scenarios completed by development team members |
| High severity issues resolved | ✅ None found |
| Medium severity issues resolved | ✅ None found |
| Low severity issues documented | ✅ AT-ISS-001 and AT-ISS-002 documented and accepted |
| Issues Log reviewed | ✅ Complete |

**Status: SIGNED OFF — System is ready for acceptance testing.**
