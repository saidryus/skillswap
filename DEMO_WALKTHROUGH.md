# Trophe — Demo Walkthrough Guide

> **Purpose:** Step-by-step script for the live demo portion of the defense.
> Follow this in order. Each step tells you exactly what to click, what to say, and what the panel is supposed to see.

---

## Before You Start

Make sure these are ready before the demo begins:

- [ ] Browser open at `https://trophe-eight.vercel.app`
- [ ] You are **not** already logged in (clear session if needed)
- [ ] Screen is visible to the panel
- [ ] Postman open with the Trophe collection loaded (if API demo is required)
- [ ] These credentials written somewhere you can glance at:

| Role | Email | Password |
|---|---|---|
| Admin | admin@trophe.edu | admin123 |
| Faculty | maria.santos@trophe.edu | faculty123 |
| Student | juan.delacruz@trophe.edu | student123 |

**Total demo time:** ~8–10 minutes
**Order:** Admin → Faculty → Student → (optional) Postman API

---

## PART 1 — Admin Portal

*Estimated time: 4 minutes*

---

### Step 1 — Login as Admin

**Do:** Go to `https://trophe-eight.vercel.app` → you should see the login page.

**Say:**
> "We'll start with the Admin portal. The system has three separate portals — Admin, Faculty, and Student — each with their own dashboard and set of features."

**Do:** Type `admin@trophe.edu` in the email field, `admin123` in the password field, click **Login**.

**What happens:** The system verifies the credentials, generates a JWT token, and redirects to the Admin Dashboard.

**Say:**
> "After login, the system reads the user's role from the token and redirects them to the correct portal automatically. An admin always lands here — a student or faculty member would land on a different dashboard."

---

### Step 2 — Admin Dashboard

**What the panel sees:** Stat cards showing total users, courses, schedules, and announcements in the system.

**Say:**
> "The admin dashboard gives a quick overview of the system — how many users, courses, and schedules are currently in the database. These numbers are fetched live from the backend every time the page loads."

**Point to:** The stat cards.

---

### Step 3 — Users Page

**Do:** Click **Users** in the sidebar.

**What the panel sees:** A table of all users — admins, faculty, and students — with their role, department, and status.

**Say:**
> "This is the user management module. The admin has full control over all accounts. They can create new users, update existing ones, deactivate accounts, or delete them. There is no public registration — all accounts are created here by the admin."

**Do:** Point out the role badges (Admin, Faculty, Student) and the active/inactive status.

**Say:**
> "Notice that passwords are never shown — not even to the admin. They are stored as bcrypt hashes in the database and are never returned by the API."

**Optional — show creating a user:**
> Click **Add User** → fill in a name, email, role → click Save → show the new user appearing in the list.

---

### Step 4 — Courses Page

**Do:** Click **Courses** in the sidebar.

**What the panel sees:** A list of all courses with their course code, name, assigned faculty, number of enrolled students, and units.

**Say:**
> "The courses module manages the academic catalog. Each course has a code, a name, a unit count, a type — lecture or laboratory — and an assigned faculty member. The admin can also see the full list of enrolled students for each course."

**Do:** Click on one course to expand or open it.

**Say:**
> "When the admin changes the assigned instructor for a course, the system automatically sends a notification to all enrolled students and to the new faculty member. That happens in the background without any extra steps."

---

### Step 5 — Schedule Planner

**Do:** Click **Schedules** in the sidebar.

**What the panel sees:** The drag-and-drop weekly schedule planner with a course panel on the left and a time grid on the right.

**Say:**
> "This is the Schedule Planner — one of the more complex features. The admin selects a faculty member, and their assigned courses appear in the left panel. To schedule a class, you simply drag a course card onto the grid."

**Do:** Select a faculty member from the dropdown (e.g., Maria Santos).

**Say:**
> "The grid shows Monday through Saturday, with 30-minute slots from 7 AM to 9 PM. Existing schedules are already placed as colored blocks."

**Do:** Drag one of the course cards onto an empty cell on the grid.

**What happens:** A confirmation modal appears asking for duration and room.

**Say:**
> "Before saving, the admin picks the class duration and the room. The system then runs a conflict check on the backend."

**Do:** Fill in a room name → click **Place**.

**What happens:** The block appears on the grid and a success toast shows.

**Say:**
> "The schedule is now saved to the database. All enrolled students and the faculty member automatically receive a notification about the new schedule."

---

### Step 6 — Conflict Detection (Key Feature)

**Say:**
> "Now let me show the conflict detection system — this is one of the standout features."

**Do:** Try to drag the same course (or another course with the same faculty) onto a time slot that overlaps with an existing block.

**Do:** Fill in the same room as an existing schedule → click **Place**.

**What happens:** A red conflict banner appears at the top of the page with a message like *"Room 101 is already occupied on Monday from 08:00–09:30 by CS101."*

**Say:**
> "The backend checks four types of conflicts before saving: room double-booking, instructor overlap, student schedule clash, and duplicate course slots. If any conflict is found, the API returns a 409 status code and the frontend shows this error. Nothing is saved."

**Point to:** The conflict type label and the specific message.

---

### Step 7 — Lab Schedule Planner

**Do:** Click **Lab Schedules** in the sidebar.

**What the panel sees:** Same grid layout but filtered to laboratory-type courses only, with a purple color scheme.

**Say:**
> "There is a separate planner specifically for laboratory courses. It works the same way but defaults to longer durations — lab sessions are typically 3 hours — and filters to only show courses marked as type 'laboratory'."

---

### Step 8 — Attendance Page (Admin View)

**Do:** Click **Attendance** in the sidebar.

**What the panel sees:** A course selector and attendance table.

**Say:**
> "Admins can also view and manage attendance records across all courses. They can filter by course and date to see who was present, absent, late, or excused on any given day."

---

### Step 9 — Announcements Page (Admin View)

**Do:** Click **Announcements** in the sidebar.

**What the panel sees:** A list of announcements with pinned ones at the top.

**Say:**
> "The announcements module works like a bulletin board. Admins and faculty can post announcements targeted to specific roles — for example, a faculty-only meeting notice, or a system-wide announcement for everyone. When posted, all targeted users receive an automatic in-app notification."

**Do:** Point to a pinned announcement.

**Say:**
> "Pinned announcements always appear at the top regardless of when they were posted."

---

### Step 10 — Notification Bell

**Do:** Click the **bell icon** in the top navigation bar.

**What the panel sees:** A dropdown showing recent notifications with unread badges.

**Say:**
> "Every significant action in the system generates a notification for the relevant users. The bell icon shows the unread count. Clicking a notification can navigate directly to the relevant page — for example, a schedule change notification links to the schedule page."

---

### Step 11 — Logout

**Do:** Click the user menu or logout button → log out.

**Say:**
> "Now let's switch to the Faculty portal."

---

## PART 2 — Faculty Portal

*Estimated time: 2 minutes*

---

### Step 12 — Login as Faculty

**Do:** Login with `maria.santos@trophe.edu` / `faculty123`.

**What happens:** Redirected to the Faculty Dashboard.

**Say:**
> "Faculty members land on their own dashboard. They can only see what's relevant to them — their assigned courses and their students."

---

### Step 13 — Faculty Dashboard

**What the panel sees:** A simpler dashboard showing the faculty's course count and quick stats.

**Say:**
> "The faculty dashboard is scoped to their own data. Prof. Maria Santos only sees the courses she is assigned to — not the full catalog."

---

### Step 14 — Faculty Courses Page

**Do:** Click **My Courses** in the sidebar.

**What the panel sees:** Only the courses assigned to Maria Santos, with the full student roster for each.

**Say:**
> "Faculty can see their full student list per course. This is the same data the admin manages, but the faculty view is read-only — they cannot enroll or unenroll students themselves."

---

### Step 15 — Mark Attendance

**Do:** Click **Attendance** in the sidebar.

**What the panel sees:** A course selector, a date picker, and a list of students with status dropdowns.

**Say:**
> "This is where faculty mark attendance. They select the course, pick the date, then set each student's status — present, absent, late, or excused. Clicking Save submits all records in one request."

**Do:** Select a course → select today's date → set a few statuses → click **Save Attendance**.

**What happens:** A success toast appears.

**Say:**
> "The system uses upsert — if attendance was already marked for this date, it updates the existing records instead of creating duplicates. Faculty can safely re-submit to correct mistakes."

---

### Step 16 — Logout

**Do:** Logout.

**Say:**
> "Finally, let's look at the student experience."

---

## PART 3 — Student Portal

*Estimated time: 2 minutes*

---

### Step 17 — Login as Student

**Do:** Login with `juan.delacruz@trophe.edu` / `student123`.

**What happens:** Redirected to the Student Dashboard.

**Say:**
> "Students have the most limited but most personal view. Everything they see is scoped to their own enrollment — their courses, their schedule, their attendance."

---

### Step 18 — Student Dashboard

**What the panel sees:** Dashboard with the student's enrolled course count, attendance summary, and recent notifications.

**Say:**
> "The student dashboard gives a quick summary of their academic status — how many courses they're enrolled in and their overall attendance standing."

---

### Step 19 — My Courses

**Do:** Click **My Courses** in the sidebar.

**What the panel sees:** Only the courses Juan Dela Cruz is enrolled in — CS101, CS201, and MATH101.

**Say:**
> "Students only see their own enrolled courses. They can see the course details and who their instructor is, but they cannot modify anything."

---

### Step 20 — My Schedule

**Do:** Click **Schedule** in the sidebar.

**What the panel sees:** A weekly timetable showing only the schedule slots for Juan's enrolled courses.

**Say:**
> "The schedule page shows the student's personal timetable — only the courses they are enrolled in, with the day, time, room, and instructor. If the admin updates or removes a schedule, this view updates automatically and the student receives a notification."

---

### Step 21 — My Attendance

**Do:** Click **Attendance** in the sidebar.

**What the panel sees:** A history of attendance records across all courses, with status badges and dates.

**Say:**
> "Students can see their full attendance history. They can see which sessions they were present, absent, late, or excused for, across all their courses."

**Do:** Point to the attendance percentage if visible.

**Say:**
> "The attendance percentage counts both present and late as attended. The formula is: present plus late, divided by total sessions."

---

### Step 22 — Announcements

**Do:** Click **Announcements** in the sidebar.

**What the panel sees:** Announcements targeted to students — the faculty-only announcement is not visible here.

**Say:**
> "Students only see announcements that were targeted to them. The faculty meeting notice we saw earlier does not appear here because it was set to faculty-only."

---

### Step 23 — Print Study Load

**Do:** Click **Print Study Load** in the sidebar (or navigate to it).

**What the panel sees:** A formatted, print-ready document showing the student's full course load — course codes, names, instructor, schedule, units, and total units.

**Say:**
> "Students can generate their official study load document directly from the system. This is formatted like a real school document."

**Do:** Click **Download PDF** or **Print**.

**Say:**
> "The PDF is generated entirely in the browser using the jsPDF library — no server request is needed. It builds the document client-side and triggers a download instantly."

---

## PART 4 — API Demo (Optional, if panel asks)

*Estimated time: 1–2 minutes*

---

### Step 24 — Show Login Request in Postman

**Do:** Open Postman → open the Trophe collection → open the **Login** request.

**Say:**
> "This is the raw API layer. When the frontend logs in, it sends this POST request to `/api/auth/login` with the email and password in the request body."

**Do:** Click **Send**.

**What the panel sees:** A 200 response with the user object and a JWT token string.

**Say:**
> "The token in this response is what the frontend stores and attaches to every future request. Without it, all protected endpoints return 401 Unauthorized."

---

### Step 25 — Show a Protected Request

**Do:** Open the **Get All Courses** request → make sure the Authorization header has the token → click **Send**.

**What the panel sees:** A JSON array of all courses with populated faculty and student data.

**Say:**
> "This is what the frontend receives when it loads the Courses page. The backend populates the faculty and student references automatically — instead of just IDs, you get the actual names and details."

---

### Step 26 — Show a Conflict Response

**Do:** Open the **Create Schedule** request → set a time that conflicts with an existing schedule → click **Send**.

**What the panel sees:** A 409 response with `conflictType` and a descriptive `message`.

**Say:**
> "This is the conflict detection in action at the API level. The backend returns a 409 Conflict status with the exact type of conflict and a human-readable message. The frontend reads the `conflictType` field to decide which color to show the error banner in."

---

## Handling Common Demo Problems

| Problem | What to do |
|---|---|
| Live site is down | Switch to local: `http://localhost:5173` — make sure backend is running on port 5000 |
| Login fails | Double-check credentials. If DB was reset, run `npm run seed` in the backend folder |
| Drag and drop not working | Refresh the page. Make sure a faculty member is selected in the dropdown |
| Conflict not triggering | Make sure the time slot actually overlaps with an existing block and uses the same room or faculty |
| Notifications not showing | They may all be marked as read — enroll/unenroll a student to generate a fresh one |
| PDF download blocked | Allow popups in the browser for the site |

---

## Quick Credential Reference

| Role | Email | Password | Student ID |
|---|---|---|---|
| Super Admin | admin@trophe.edu | admin123 | — |
| Faculty | maria.santos@trophe.edu | faculty123 | — |
| Faculty | jose.reyes@trophe.edu | faculty123 | — |
| Student | juan.delacruz@trophe.edu | student123 | STU-2024-001 |
| Student | ana.gonzales@trophe.edu | student123 | STU-2024-002 |
| Student | carlos.mendoza@trophe.edu | student123 | STU-2024-003 |

---

*Trophe Smart Campus Management System — Demo Walkthrough*
*Live URL: https://trophe-eight.vercel.app*
