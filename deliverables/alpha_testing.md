# Alpha Testing — Acadia

## 1. Purpose

Alpha testing is an internal evaluation phase conducted by the development team before the system is exposed to external users. The goal is to identify functional defects, usability friction, and missing behaviors across all three user roles using realistic data in a live local environment.

During alpha testing, developers act as users — each member of the team takes on a specific role (admin, tutor, or tutee) and executes all defined scenarios from start to finish. Observed behavior is compared against expected behavior, and all discrepancies are logged.

---

## 2. Method

- **Participants:** Development team members (internal)
- **Environment:** Full local stack — backend (port 5000), frontend (port 5173), MongoDB, ML services (ports 5001, 5002, 5003) all running simultaneously
- **Data:** Seeded via `backend/seed.js` (1 admin, 100 students, 5 approved tutors, 30 courses, sessions, ratings)
- **Approach:** Each tester receives a role assignment and a scenario checklist. They execute scenarios in order, recording observed behavior and any issues encountered.
- **Coverage:** All 50 frontend modules/pages tested for functional correctness and basic usability

---

## 3. Testing Environment

| Component | Value |
|---|---|
| OS | Windows 10 64-bit |
| Browser | Chrome (latest) |
| Backend | `localhost:5000` |
| Frontend | `localhost:5173` |
| Database | MongoDB `trophe`, seeded via `seed.js` |
| ML Services | All three Flask services running (ports 5001, 5002, 5003) |

---

## 4. Test Scenarios

| Scenario ID | Role | Action | Expected Behavior | Observed | Status |
|---|---|---|---|---|---|
| AT-001 | Tutee | Navigate to `/login`; enter valid credentials from seed data | Redirected to Student Dashboard after successful login | — | — |
| AT-002 | Tutee | First login with default password; system prompts password change | Change Password page displayed; user cannot proceed without changing password | — | — |
| AT-003 | Tutee | Upload study load PDF from My Schedule page | PDF uploaded; OCR processes file; parsed class schedule displayed; uploaded file deleted from server | — | — |
| AT-004 | Tutee | Set weekly availability slots (add 3 slots across different days) | Slots appear in availability list; slots are used for session slot suggestions | — | — |
| AT-005 | Tutee | Navigate to Become Tutor page; upload a recommendation letter (PDF) | Upload progress shown; application submitted with `status: 'pending'`; confirmation message displayed | — | — |
| AT-006 | Admin | Log in as admin; navigate to Tutor Applications | Pending application from AT-005 is visible in the list | — | — |
| AT-007 | Admin | Open tutor application; view AI analysis panel | Predicted subjects, strengths, soft skills, confidence score, and `analysisMethod` displayed correctly | — | — |
| AT-008 | Admin | Attempt to view recommendation letter document without re-authenticating | Re-authentication prompt appears; document not accessible | — | — |
| AT-009 | Admin | Re-authenticate and view document | Admin password prompt; on correct password, document streams/downloads; audit log entry created | — | — |
| AT-010 | Admin | Approve the tutor application | Application status changes to `approved`; student's `isTutor` becomes `true`; student receives notification | — | — |
| AT-011 | Tutor | Log in as the newly approved tutor; navigate to Tutor Dashboard | Tutor Dashboard loads with competency score, session stats, and recent feedback | — | — |
| AT-012 | Tutee | Navigate to Find Tutor; search by a subject the approved tutor covers | Approved tutor appears in results ranked by competency score | — | — |
| AT-013 | Tutee | Select tutor; navigate to Book Session; view slot suggestions | Suggested slots shown, excluding Sundays, Philippine holidays, and tutee's class times | — | — |
| AT-014 | Tutee | Select a slot and submit booking | Session created with `status: 'pending'`; tutor receives `session_request` notification | — | — |
| AT-015 | Tutor | Open My Sessions; accept the pending session request | Session `status` changes to `scheduled`; tutee receives `session_accepted` notification | — | — |
| AT-016 | Tutor | Open accepted session; click "Join Session" | Jitsi Meet URL opens in browser/tab; video session interface loads | — | — |
| AT-017 | Tutor | Mark session as completed after scheduled time | Session `status = 'completed'`; tutee prompted to rate | — | — |
| AT-018 | Tutee | Submit a 4-star rating with a written comment | Rating saved; ML feedback analysis result visible in Tutor Dashboard; competency score updated | — | — |
| AT-019 | Tutor | Upload a learning material (PDF) from Learning Resources page | File uploaded; material appears in the resources list with correct visibility setting | — | — |
| AT-020 | Admin | Navigate to Users; create a new student account | New user appears in the table; user can log in with default password | — | — |
| AT-021 | Admin | Create an announcement targeted at students | Announcement saved; all active students receive a notification | — | — |
| AT-022 | Tutee | Open Announcements page | Recent announcement from AT-021 visible | — | — |
| AT-023 | Tutee | Open My Analytics page | Session history, attendance rate, and risk level displayed | — | — |
| AT-024 | Admin | Navigate to Sessions; filter by status `scheduled` | Only scheduled sessions shown | — | — |
| AT-025 | Tutor | Share a recording link in the session chat | Link appears in the messaging thread for both tutor and tutee | — | — |

---

## 5. Issues Log

All issues discovered during alpha testing are logged below. Severity levels:
- **High** — Blocks core functionality; must be resolved before acceptance testing
- **Medium** — Degrades usability or produces incorrect output; should be resolved before acceptance testing
- **Low** — Minor cosmetic or non-blocking issue; can be deferred

| Issue ID | Module | Description | Severity | Status |
|---|---|---|---|---|
| *(To be filled during alpha testing)* | | | | |

---

## 6. Sign-Off Criteria

Alpha testing is considered complete when:

1. All 25 scenarios have been executed by at least one team member for each applicable role.
2. All **High** severity issues have been resolved and the affected scenarios re-tested successfully.
3. All **Medium** severity issues have been documented and either resolved or accepted with written justification.
4. The Issues Log has been reviewed and signed off by the lead developer.

**Alpha testing must be fully signed off before proceeding to acceptance testing.**

Only after sign-off is the system considered ready for external user evaluation.
