# Survey Guide for Teammates
## Acadia Usability Evaluation — Testing Day Reference
*Read this fully before the first participant arrives.*

---

## What You're Doing Today

You're running a usability evaluation for Acadia — our peer tutoring platform. Each participant will:
1. Use the system to complete a set of tasks (~30 minutes)
2. Fill out a short Google Forms survey after (~5–8 minutes)

Your job is to **watch and record**, not teach. The goal is to see how real users interact with the system on their own.

---

## Who You Need (10 total)

| Role | How many | Who to recruit |
|---|---|---|
| Tutee | 7 | Any CCS student willing to act as someone looking for tutoring |
| Tutor | 5 | CCS students willing to act as peer tutors (they'll upload a sample letter) |
| Admin | 3 | Faculty, department staff, or a classmate you assign the admin account to |

They don't need real tutoring experience. They just need to be currently enrolled in or employed by CCS and willing to participate.

---

## Before Anyone Arrives — Setup

Do this once before the first session, not before each participant.

- [ ] Open a terminal and make sure these are all running:
  - `mongod` (MongoDB)
  - `npm run dev` inside `backend/` → should say **port 5000**
  - `npm run dev` inside `frontend/` → should say **http://localhost:5173**
  - `python app.py` inside `ml/recommendation/` → should say **port 5002**
  - `python app.py` inside `ml/feedback/` → should say **port 5003**
- [ ] Open Chrome and go to `http://localhost:5173` — login page should appear
- [ ] Log out of any previous session before each new participant
- [ ] Have the Google Forms survey link ready to paste into Messenger
- [ ] Have the sample recommendation letter PDF ready (`deliverables/sample_letters/01_STRONG_full_formal.pdf`)
- [ ] Have your observation sheet open (printed or on a separate device)

> If the ML services aren't running, don't panic — the system falls back automatically and everything still works. Just note it.

---

## Login Credentials

Give each participant only the credentials for their assigned role.

| Role | Login ID | Password |
|---|---|---|
| Admin | `admin@acadia.edu` | `admin123` |
| Tutor 1 | `23063670` | `670` |
| Tutor 2 | `202203001` | `001` |
| Tutor 3 | `202104001` | `001` |
| Tutor 4 | `202302001` | `001` |
| Tutor 5 | `202401001` | `001` |
| Tutee 1 | `202201001` | `001` |
| Tutee 2 | `202201002` | `002` |
| Tutee 3 | `202201003` | `003` |
| Tutee 4 | `202301001` | `001` |
| Tutee 5 | `202301002` | `002` |
| Tutee 6 | `202401002` | `002` |
| Tutee 7 | `202401003` | `003` |

> All student passwords = last 3 digits of their student ID. Everyone gets a forced password change on first login — this is normal, tell them to just set any new password.

---

## What to Say Before They Start

Say this to each participant before they touch the system:

> *"We're evaluating a system called Acadia — a peer tutoring platform we built. We want to see how easy or difficult it is to use for someone using it for the first time.*
>
> *Important: we're testing the system, not you. If something is confusing or doesn't work the way you expect, say it out loud — that's actually the most useful thing you can tell us.*
>
> *I'll give you tasks to complete. Try to do them on your own. I won't help unless you're completely stuck. Please talk through what you're thinking as you go.*
>
> *Everything is confidential — you'll appear as Participant [number] in our report, never by name.*
>
> *Do you have any questions? Do you agree to participate?"*

Get verbal confirmation before proceeding. If they decline, thank them and stop.

---

## Tasks to Give Each Role

Read each task out loud one at a time. Wait for them to attempt it before reading the next one.

### Tutee Tasks

| # | Say this to them | Done when |
|---|---|---|
| T1 | "Log in using the credentials I gave you." | Dashboard visible (they'll change password first — normal) |
| T2 | "Go to your schedule page and upload this PDF." *(hand them the sample PDF)* | Parsed schedule appears on screen |
| T3 | "Set at least two weekly availability slots — times when you're free." | Two slots visible |
| T4 | "Find a tutor for any subject you're eligible for." | Tutor list loads, they browse it |
| T5 | "Book a tutoring session with one of the tutors." | Session request submitted, pending status shown |
| T6 | "Find a completed session and rate the tutor." | Rating submitted |
| T7 | "Browse the learning resources and try to open one." | Resources page loads, material accessed |
| T8 | "Find your personal session analytics." | Analytics page loads |

### Tutor Tasks

| # | Say this to them | Done when |
|---|---|---|
| U1 | "Log in using the credentials I gave you." | Dashboard visible |
| U2 | "Set at least three weekly availability slots." | Three slots visible |
| U3 | "Apply to become a tutor by uploading this recommendation letter." *(hand them the sample PDF)* | Application submitted, pending status shown |
| U4 | "Check for pending session requests and respond to one." | Session accepted or rejected |
| U5 | "Upload a learning material for one of your subjects." | Material appears in Resources |
| U6 | "Find a scheduled session and open the video room." | Jitsi Meet URL opens *(needs internet)* |

### Admin Tasks

| # | Say this to them | Done when |
|---|---|---|
| A1 | "Log in as the administrator." | Admin dashboard visible |
| A2 | "Create a new student account with any test details." | New user appears in the users table |
| A3 | "Find a pending tutor application and read the AI analysis report." | Application open, AI panel visible |
| A4 | "Make a decision on the application — approve, reject, or request resubmission." | Status updated |
| A5 | "View the sessions list and filter it to show only scheduled sessions." | Filter applied |
| A6 | "Create an announcement for students only." | Announcement saved |

---

## While They're Doing Tasks — What to Write Down

For each participant, fill in this on paper or your phone:

```
Participant No.: ____    Role: ____    Date: ____

For each task — mark: ✓ done on their own  △ done with difficulty  ✗ couldn't do it

Tasks: [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ]

Where did they hesitate or get confused?


What did they say out loud?


Did you need to help them? Which task?


Anything unexpected that happened?


Overall: smooth / some difficulty / struggled a lot
```

---

## What NOT to Do

- **Don't show them where to click** — even if it's obvious to you
- **Don't say "yes that's right" or "no try again"** — stay neutral
- **Don't rush them** — silence is fine, they're thinking
- **Don't share what other participants said**
- **Don't fix problems for them** — if something breaks, note it and move on

If they're completely stuck for more than 2 minutes and can't continue, say *"Let's move to the next task"* and mark it as not completed.

---

## After the Tasks — Survey

1. Send them the Google Forms survey link via Facebook Messenger (or show them on their phone)
2. Say: *"This has 8 short open-ended questions about your experience today. Just write honestly based on what you felt — no right or wrong answers. Take your time."*
3. Let them fill it out on their own — don't read questions aloud or suggest answers
4. Wait for them to submit before they leave
5. Thank them and remind them their responses are confidential

---

## If Something Goes Wrong

| Problem | What to do |
|---|---|
| Can't log in | Check the credentials table above. First login forces password change — normal. |
| "You need to set availability first" error | They skipped Task T3 or U2. Help them add one slot and note it. |
| OCR takes a long time on the PDF | Normal — can take up to 30 seconds. Tell them "it's processing, please wait." |
| ML analysis shows "rule-based" instead of AI | ML service might not be running. Not a blocker — system still works, just note it. |
| Jitsi video doesn't load | Check internet connection. If no internet, skip that task and note it. |
| Admin document access locked | 3 wrong password attempts triggered a lockout. Restart the backend to reset. |
| System crashes / white screen | Note what they were doing, restart `npm run dev` in backend, continue from next task. |
| Participant wants to quit | Thank them, stop recording, don't use their data. |

---

## After All Sessions

Collect and keep:
- Your filled-in observation notes for each participant
- Confirmation that each participant submitted the Google Forms survey

Send everything to the researcher when done. Do not share observation notes between participants.

---

*This guide is for internal team use only. Do not share with participants.*
