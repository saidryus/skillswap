# Facilitator Guide — Acadia Usability Evaluation
**For Research Team Members Conducting the Study**
University of Cebu Pardo-Talisay Campus | College of Computer Studies

---

## Overview

This guide is for teammates facilitating the Acadia usability evaluation sessions. Your job is to guide participants through the testing tasks, observe their behavior, and collect their survey responses. You are **not** here to teach them how to use the system — you are here to watch and record what happens when they try to use it on their own.

**Total participants needed:** 10
**Role breakdown:** ~4 tutees · ~3 tutors · ~3 admins

**Per session estimate:** 45–60 minutes
- 5 min — briefing and consent
- 30–35 min — task completion + observation
- 10–15 min — survey (Google Forms, shared via Messenger)

---

## Before the Session — Setup Checklist

Complete this before each participant arrives.

- [ ] Backend is running (`npm run dev` in `backend/` — port 5000)
- [ ] Frontend is running (`npm run dev` in `frontend/` — port 5173)
- [ ] MongoDB is running (`mongod`)
- [ ] ML services are running (both `python app.py` in `ml/recommendation/` and `ml/feedback/`)
- [ ] Database is seeded with demo data (`node seed.js` — only needed once, do not re-run between sessions)
- [ ] Browser is open at `http://localhost:5173` and logged out
- [ ] Google Forms survey link is ready to share via Messenger
- [ ] Your observation sheet is printed or open on a separate device
- [ ] Internet is available (needed for Jitsi Meet video task)

> **If something breaks:** The ML services are optional. If they're not running, the system falls back to rule-based analysis automatically. The rest of the platform still works. Just note it in your observation log.

---

## Demo Accounts

Give participants only the credentials for their assigned role. Do not give them credentials for other roles.

| Role | Login ID | Password | Notes |
|---|---|---|---|
| Admin | `admin@acadia.edu` | `admin123` | Full access |
| Tutor (Year 3) | `23063670` | `670` | Simone Makinano — use sample recommendation letter PDF |
| Tutee (Year 1) | `202401001` | `001` | Juan Dela Cruz |
| Tutee (Year 2) | `202302001` | `001` | Miguel Dela Cruz |
| Tutee (Year 3) | `202203001` | `001` | Rafael Dela Cruz |
| Tutee (Year 4) | `202104001` | `001` | Antonio Dela Cruz |

> All student passwords are the **last 3 digits of their student ID**. All seeded students will be prompted to change their password on first login — this is expected and part of the test.

**Sample recommendation letter for tutor testing:**
Use any PDF from `deliverables/sample_letters/` — start with `01_STRONG_full_formal.pdf` for a clean first test. Use `08_EDGE_ocr_noise.pdf` to test the OCR fallback behavior if you want to see how the system handles a messy scan.

---

## Step 1 — Briefing the Participant (5 minutes)

Read this to each participant before they start. Say it conversationally, not robotically.

---

*"Thank you for participating. We're evaluating a system called Acadia — a peer tutoring platform we developed as part of our research. The goal today is to understand how easy or difficult the system is to use.*

*Important: we're testing the system, not you. There are no wrong answers and no grades involved. If something is confusing or doesn't work the way you expect, that's actually useful information for us — please say it out loud.*

*I'll give you a set of tasks to complete. Try to do them on your own. I won't help you unless you're completely stuck, but please talk through what you're thinking as you go — it helps us understand your experience.*

*After the tasks, I'll send you a short survey via Messenger. It has open-ended questions about your experience — just respond honestly.*

*Everything you say and do today is confidential. You'll be identified as Participant [number] in our report — never by name.*

*Do you have any questions before we start? Do you consent to participating?"*

---

Obtain verbal or written consent before proceeding. If they decline, thank them and do not record anything.

---

## Step 2 — Task Completion (30–35 minutes)

Give participants only the tasks for their assigned role. Read each task aloud, then let them attempt it independently.

**Your job during tasks:**
- Watch and take notes on your observation sheet
- Do **not** point at the screen, suggest actions, or answer "where is X?"
- If they are stuck for more than 2 minutes and clearly cannot proceed, you may say: *"It's okay — let's move to the next task"*
- If they are completely blocked on a task that blocks all future tasks (e.g., can't log in), you may help just enough to unblock them — note it in your sheet

---

### Tasks for Tutee Participants

Read each task one at a time. Wait for the participant to attempt it before reading the next one.

**Task T1 — Log in**
> "Log in to the system using the credentials I gave you."

*Success: Dashboard is visible. Note: they will be forced to change their password first — this is expected.*

**Task T2 — Upload study load**
> "Go to your schedule page and upload your study load PDF. I'll give you the file to use."

*Hand them a sample PDF. Success: parsed schedule appears on screen. Note how long it takes and whether they found the page easily.*

**Task T3 — Set availability**
> "Set at least two weekly availability slots — the times when you're free for tutoring sessions."

*Success: two or more slots visible in the availability section.*

**Task T4 — Find a tutor**
> "Find a tutor for a subject you're eligible for. Take a look at the information shown about the tutors."

*Success: tutor results load, participant browses the list. Note whether they understand the competency score and subject filter.*

**Task T5 — Book a session**
> "Book a tutoring session with one of the tutors."

*Success: session request submitted, pending status shown. Note whether they understood the slot selection process.*

**Task T6 — Rate a tutor**
> "Find a completed session and submit a rating for the tutor."

*Note: a completed session should be in the seeded data. Success: rating submitted, confirmation shown.*

**Task T7 — Browse materials**
> "Go to the learning resources section and try to access one of the materials."

*Success: resources page loads, participant clicks on a material.*

**Task T8 — View analytics**
> "Find your personal session analytics."

*Success: analytics page loads, participant views the data.*

---

### Tasks for Tutor Participants

**Task U1 — Log in**
> "Log in to the system using the credentials I gave you."

*Success: dashboard visible, password change completed.*

**Task U2 — Set availability**
> "Set at least three weekly availability slots."

*Success: three slots visible.*

**Task U3 — Apply as tutor**
> "Apply to become a tutor by uploading a faculty recommendation letter. I'll give you the file."

*Hand them the sample PDF from `deliverables/sample_letters/`. Success: application submitted, pending status shown. Note the OCR processing time and whether any confusion arose around the upload step.*

**Task U4 — Respond to a session request**
> "Check if you have any pending session requests and respond to one."

*Success: participant finds pending session and either accepts or rejects it.*

**Task U5 — Upload a learning material**
> "Upload a learning resource file for one of your subjects."

*Success: material appears in the resources page.*

**Task U6 — Join a video session**
> "Find a scheduled session and open the video session room."

*Success: Jitsi Meet URL opens in browser. Note: internet is required.*

**Task U7 — Share a recording link**
> "In the session chat, share a recording link. You can use any URL as a placeholder."

*Success: link posted in the chat thread.*

---

### Tasks for Admin Participants

**Task A1 — Log in**
> "Log in as the system administrator."

*Success: admin dashboard visible.*

**Task A2 — Create a student account**
> "Create a new student user account with any test details you like."

*Success: new user appears in the users table.*

**Task A3 — Review a tutor application**
> "Find a pending tutor application and read through the AI analysis report."

*Success: application opens, AI panel with subjects, strengths, and confidence score is visible. Note whether the participant understands what the confidence score means.*

**Task A4 — Approve or reject the application**
> "Make a decision on the application — approve it, reject it, or request a resubmission."

*Success: application status changes, notification triggered.*

**Task A5 — View and filter sessions**
> "Go to the session overview and filter the list to show only scheduled sessions."

*Success: filter applied, list updates.*

**Task A6 — Create an announcement**
> "Create an announcement targeted at students only."

*Success: announcement saved, confirmation shown.*

---

## Step 3 — Observation Sheet

Fill this in for each participant during and immediately after the session. Be specific.

```
OBSERVATION SHEET
─────────────────────────────────────────────────────────
Participant No.:  ___________
Role assigned:    ○ Tutee   ○ Tutor   ○ Admin
Date:             ___________
Facilitator:      ___________

TASK LOG
─────────────────────────────────────────────────────────
For each task, mark: ✓ Completed  △ Completed with difficulty  ✗ Could not complete

TUTEE TASKS
  T1 — Login                    [ ]  Time: ___  Notes: _________________________
  T2 — Upload study load        [ ]  Time: ___  Notes: _________________________
  T3 — Set availability         [ ]  Time: ___  Notes: _________________________
  T4 — Find a tutor             [ ]  Time: ___  Notes: _________________________
  T5 — Book a session           [ ]  Time: ___  Notes: _________________________
  T6 — Rate a tutor             [ ]  Time: ___  Notes: _________________________
  T7 — Browse materials         [ ]  Time: ___  Notes: _________________________
  T8 — View analytics           [ ]  Time: ___  Notes: _________________________

TUTOR TASKS
  U1 — Login                    [ ]  Time: ___  Notes: _________________________
  U2 — Set availability         [ ]  Time: ___  Notes: _________________________
  U3 — Apply as tutor           [ ]  Time: ___  Notes: _________________________
  U4 — Respond to session       [ ]  Time: ___  Notes: _________________________
  U5 — Upload material          [ ]  Time: ___  Notes: _________________________
  U6 — Join video session       [ ]  Time: ___  Notes: _________________________
  U7 — Share recording link     [ ]  Time: ___  Notes: _________________________

ADMIN TASKS
  A1 — Login                    [ ]  Time: ___  Notes: _________________________
  A2 — Create account           [ ]  Time: ___  Notes: _________________________
  A3 — Review application       [ ]  Time: ___  Notes: _________________________
  A4 — Approve/reject           [ ]  Time: ___  Notes: _________________________
  A5 — Filter sessions          [ ]  Time: ___  Notes: _________________________
  A6 — Create announcement      [ ]  Time: ___  Notes: _________________________

BEHAVIORAL OBSERVATIONS
─────────────────────────────────────────────────────────
Points of hesitation (where did they pause or look confused?):



Navigation issues (did they go to the wrong page, get lost?):



Verbal reactions (anything they said out loud during tasks):



Tasks where assistance was required:



Anything unexpected that happened:



OVERALL IMPRESSION
─────────────────────────────────────────────────────────
General fluency level:   ○ Very smooth  ○ Some difficulty  ○ Struggled significantly

Completion rate:  _____ / _____ tasks completed independently

Additional notes:
```

---

## Step 4 — Survey Distribution (10–15 minutes)

After the tasks are done:

1. Send the participant the Google Forms survey link via Facebook Messenger (or show them the QR code if you have one printed).
2. Tell them: *"This survey has open-ended questions about your experience. There are no right or wrong answers — just describe what you actually felt and thought. You can answer at your own pace."*
3. Give them space to fill it out on their own. Do not read the questions aloud or suggest answers.
4. If they ask you to clarify a question, say: *"Just write whatever comes to mind based on your experience today."*
5. Confirm their responses were submitted before they leave.

---

## Step 5 — Debrief (2–3 minutes)

After the survey is submitted:

- Thank them for their time.
- Let them ask any questions about the system or the study.
- Remind them their responses are confidential and will only appear in the report as Participant [number].
- Do not share findings from other participants.

---

## Common Issues and What to Do

| Situation | What to do |
|---|---|
| Participant can't log in | Check that the correct ID and password were given. Default password = last 3 digits of student ID. First login forces a password change — this is normal. |
| "Schedule required" error when booking | Participant skipped Task T3. Help them set one availability slot and note in your sheet that Task T3 was not completed independently. |
| OCR takes a long time on study load upload | Normal — Tesseract.js can take 10–30 seconds. Tell them: *"The system is processing your file, please wait."* |
| ML analysis shows "rule-based" instead of ML | The ML service may not be running. Not a blocker — note it in your sheet and continue. |
| Jitsi Meet doesn't load | Check internet connection. If no internet is available, skip Task U6 and note it. |
| Document access locked (admin) | This happens after 3 wrong password attempts on the document re-auth screen. Wait or restart the backend to reset it. |
| Participant gets completely stuck | After 2 minutes of no progress, say *"Let's move to the next task"* and mark the task as not completed. Do not demonstrate how to do it. |
| System crashes or shows an error | Note the exact error and what the participant was doing. If it blocks all further tasks, you may need to restart the backend and re-seed. |

---

## What NOT to Do

- Do not demonstrate how to complete any task before the participant attempts it
- Do not confirm whether they did something correctly ("Yes, that's right!")
- Do not suggest where to click or what to look for
- Do not rush them — silence during task completion is normal and valuable
- Do not share one participant's feedback with another participant
- Do not alter observation notes after the session — write them in real time

---

## After All Sessions — Handoff to the Researcher

Once you have completed your assigned sessions, hand over:

1. All filled-in observation sheets (physical or digital)
2. Confirmation that Google Forms survey responses were submitted by each participant
3. Any notes on system issues, unexpected behavior, or participant comments that didn't fit the observation sheet

The researcher will compile all observation sheets and survey responses and conduct thematic analysis using Braun & Clarke's six-phase framework.

---

*This guide is for internal research team use only. Do not share with participants.*
