# Acceptance Testing — Acadia

## 1. Purpose

Acceptance testing evaluates the system with real end users to determine whether Acadia meets its usability requirements as a peer tutoring platform for Philippine college departments. This phase follows the Technology Acceptance Model (TAM) methodology described in Chapter 3 of the study.

The evaluation measures two primary constructs:
- **Perceived Usefulness (PU)** — whether participants believe the system improves their tutoring experience
- **Perceived Ease of Use (PEOU)** — whether participants find the system easy to learn and use

The system is considered to pass acceptance testing when ≥ 70% of participants rate it positively on both constructs (average score ≥ 3.5 out of 5.0).

---

## 2. Participants

| Attribute | Details |
|---|---|
| Sample size | n = 10 participants |
| Source | College of Computer Studies (CCS) |
| Sampling method | Purposive sampling — participants selected based on role alignment (actual students who tutor or seek tutoring, and faculty/admin staff) |
| Role distribution | ~4 tutees (student role), ~3 tutors (student with tutor experience), ~3 admin/faculty staff |

Participants are recruited from within the target department. They should have no prior exposure to the Acadia system to ensure the evaluation measures first-use experience.

---

## 3. Method

| Phase | Activity |
|---|---|
| Briefing | Researcher explains the purpose of the study. Participants are informed that the system — not the user — is being evaluated. Informed consent obtained. |
| Guided Task Completion | Participants execute a defined set of tasks (see Section 5) using the seeded demo environment. The researcher observes and records completion, errors, and time-on-task without providing assistance unless the participant is completely blocked. |
| Structured Observation | Researcher logs observed behavior, hesitations, and errors per task using the observation protocol. |
| Survey | Participants complete a structured Google Forms survey based on TAM questionnaire items (5-point Likert scale). Open-ended items capture qualitative feedback. |
| Debrief | Researcher answers questions and collects any additional verbal feedback. |

---

## 4. Testing Environment

| Component | Configuration |
|---|---|
| Device | Laptop or desktop provided by the research team |
| Browser | Google Chrome (latest) |
| Environment | Local network; backend on port 5000, frontend on port 5173 |
| Data | Seeded via `backend/seed.js` — demo accounts, tutors, courses, sessions |
| Internet | Available for Jitsi Meet video test tasks |

---

## 5. Test Tasks

### Tutee Tasks

| Task ID | Role | Task Description | Completion Criteria |
|---|---|---|---|
| ACT-T01 | Tutee | Log in using the provided student credentials | Successfully logged in; Student Dashboard visible |
| ACT-T02 | Tutee | Upload your study load PDF from the My Schedule page | PDF uploaded; parsed schedule displayed on screen |
| ACT-T03 | Tutee | Set at least two weekly availability slots | Two or more slots visible in the availability list |
| ACT-T04 | Tutee | Find a tutor for a specific subject | At least one tutor result displayed; tutor's competency score and subjects visible |
| ACT-T05 | Tutee | Book a session with a tutor | Session booking submitted; confirmation/pending status shown |
| ACT-T06 | Tutee | Rate your tutor after a completed session | Rating submitted (1–5 stars); confirmation message shown |
| ACT-T07 | Tutee | Browse learning materials | Learning Resources page loads; at least one material visible; download attempted |
| ACT-T08 | Tutee | View your session analytics | My Analytics page loads; session history visible |

### Tutor Tasks

| Task ID | Role | Task Description | Completion Criteria |
|---|---|---|---|
| ACT-U01 | Tutor | Log in using the provided tutor credentials | Successfully logged in; Tutor Dashboard accessible |
| ACT-U02 | Tutor | Set your weekly availability (add 3 slots) | Three slots visible in availability list |
| ACT-U03 | Tutor | Apply to become a tutor by uploading a recommendation letter | Application submitted; "pending" status shown on Become Tutor page |
| ACT-U04 | Tutor | Respond to a pending session request (accept or reject) | Session status updated; confirmation visible in My Sessions |
| ACT-U05 | Tutor | Upload a learning material | Material appears in the Learning Resources page |
| ACT-U06 | Tutor | Join a video session via Jitsi Meet | Jitsi room URL opens; video interface loads in browser |
| ACT-U07 | Tutor | Share a recording link in the session chat | Recording link visible in the session messaging thread |

### Admin Tasks

| Task ID | Role | Task Description | Completion Criteria |
|---|---|---|---|
| ACT-A01 | Admin | Log in as admin | Admin Dashboard visible |
| ACT-A02 | Admin | Create a new student user account | New user appears in the Users table |
| ACT-A03 | Admin | Review a pending tutor application and read the AI analysis | Application visible; AI panel with subjects, strengths, and confidence score displayed |
| ACT-A04 | Admin | Approve or reject the tutor application | Application status updated; applicant notification triggered |
| ACT-A05 | Admin | View the session overview and filter by status | Sessions list visible; filter by status functions correctly |
| ACT-A06 | Admin | Create an announcement targeted at students | Announcement saved; confirmation shown |

---

## 6. Observation Record Template

For each participant, the facilitator records:

| Task ID | Completed? (Y/N) | Errors Observed | Assistance Required? | Time (approx.) | Notes |
|---|---|---|---|---|---|
| ACT-T01 | | | | | |
| ACT-T02 | | | | | |
| … | | | | | |

---

## 7. Survey Instrument

Participants complete a Google Forms survey after task completion. The survey uses a 5-point Likert scale (1 = Strongly Disagree, 5 = Strongly Agree) for TAM items and open-ended questions for qualitative feedback.

**Sample TAM items:**
- "Using Acadia would improve my ability to find tutoring help." (PU)
- "I think Acadia is easy to learn how to use." (PEOU)
- "I would use Acadia regularly if it were available at my institution." (Behavioral Intention)
- "The booking process was straightforward." (PEOU)
- "The tutor recommendation helped me find a suitable tutor." (PU)

**Open-ended items:**
- "What did you find most useful about Acadia?"
- "What was the most confusing or difficult part of using the system?"
- "What feature would you most like to see added or improved?"

---

## 8. Acceptance Criteria

| Criterion | Threshold | Measurement |
|---|---|---|
| Overall usability rating | ≥ 3.5 / 5.0 average on TAM items | Computed from Google Forms survey responses |
| Positive usability rating | ≥ 70% of participants rate ≥ 3.5 / 5.0 | Per-participant aggregation |
| Core task completion rate | ≥ 70% complete login, tutor search, and booking tasks without assistance | Observation record |
| Critical error rate | Zero participants encounter a system crash or data loss during tasks | Observation record |

If any criterion is not met, the study documents the gap and identifies specific usability issues to address before deployment.

---

## 9. Known Limitations Disclosed to Participants

The following limitations are communicated to participants in the briefing to set appropriate expectations:

| Limitation | Details |
|---|---|
| ML models trained on synthetic data | The recommendation letter analysis and feedback insights are based on models trained on generated data, not real institutional letters. Analysis accuracy may not reflect production performance. |
| OCR quality dependent on document | The system's ability to analyze recommendation letters depends on the scan or photo quality of the uploaded document. Blurry or low-contrast images may reduce accuracy. |
| Jitsi recording not built-in | The system links to Jitsi Meet for video sessions but does not provide a native recording feature. Recording links must be shared manually. |
| No self-registration | Student and admin accounts are created by administrators. Participants use pre-created demo accounts during this evaluation. |
| Internet required for video | Jitsi Meet video sessions require internet connectivity. All other features function on a local network. |
