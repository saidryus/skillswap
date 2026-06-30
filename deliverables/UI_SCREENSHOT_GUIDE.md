# SkillSwap UI/UX Screenshot Guide

This guide lists every screen you should screenshot for the design hearing presentation and documentation. Organized by user role and flow.

---

## How to Take Screenshots

- Use the browser at **1920×1080** (full HD) for consistency
- Use **dark mode** (your default theme) for all screenshots
- Make sure there's **sample data visible** (not empty states) where possible
- Hide the browser address bar if possible (F11 fullscreen or use a screenshot tool that crops it)

---

## LOGIN & AUTHENTICATION

| # | Screen | What to show | Login as |
|---|--------|-------------|----------|
| 1 | **Login Page** | The full login page with the demo account dropdown visible | — |
| 2 | **Password Change** | The forced password change dialog on first login | Any seeded student (e.g. 202401001) |

---

## ADMIN SCREENS

Login as: `admin@skillswap.edu` / `admin123`

| # | Screen | What to show | Notes |
|---|--------|-------------|-------|
| 3 | **Admin Dashboard** | Overview stats (total students, active courses, pending apps, sessions this week) | Make sure stats have non-zero values |
| 4 | **Users Page — Student List** | Table of students with year level badges, search bar, year filter tabs | Show at least 10 students |
| 5 | **Users Page — Create Student Modal** | The form for creating a new student (all fields visible) | Open the modal |
| 6 | **Users Page — CSV Import** | The bulk import modal with CSV format instructions | Open the import modal |
| 7 | **Courses Page** | Course list with year level badges, semester badges, filters active | Use the semester filter |
| 8 | **Courses Page — Create/Edit Modal** | Form showing courseCode, name, units, yearLevel, semester fields | Open create modal |
| 9 | **Student Schedules Page — Student List** | Sidebar with student list, selected student's timetable displayed | Select Simone |
| 10 | **Student Schedules Page — Timetable View** | The visual weekly timetable grid for a student | Simone's schedule |
| 11 | **Tutor Applications Page — Queue** | List of pending applications with OCR results, confidence badges | Need at least 1 pending app |
| 12 | **Tutor Applications — Review Detail** | Expanded view showing OCR-extracted grade, confidence, approve/reject buttons, grade document preview | Click on an application |
| 13 | **Announcements Page** | List of announcements with pin/active toggles | Create one first if empty |
| 14 | **Departments Page** | Department list with CRUD | Show IT department |

---

## STUDENT SCREENS (TUTEE FLOW)

Login as: `23063670` / `670` (Simone — has schedule uploaded)

| # | Screen | What to show | Notes |
|---|--------|-------------|-------|
| 15 | **Student Dashboard** | Overview with upcoming sessions, quick actions | |
| 16 | **My Schedule Page — Empty State** | The upload prompt when no schedule exists | Use a student without schedule |
| 17 | **My Schedule Page — Upload Success** | After uploading study load, showing extracted entries count | Simone already has one |
| 18 | **My Schedule Page — Timetable View** | The visual weekly timetable with all classes | Simone's view |
| 19 | **Find a Tutor — Course Selection** | Expandable course sections showing "Currently Enrolled" and "Year 3 Subjects" groups | |
| 20 | **Find a Tutor — Tutor Cards** | Ranked tutor cards with competency scores, ratings, session count | Need at least 1 approved tutor for a course |
| 21 | **Book a Session — Step 1** | Course dropdown (grouped by year) + tutor dropdown | Select a course and tutor |
| 22 | **Book a Session — Step 2 Timetable** | Side-by-side timetable comparison with green "FREE" slots highlighted | After clicking "Find Available Slots" |
| 23 | **Book a Session — Step 2 Slot Picker** | The day accordion with available time slots listed | Show expanded day with slots |
| 24 | **Book a Session — Step 3 Confirm** | Confirmation form with selected slot, venue input, venue type toggle | After selecting a slot |
| 25 | **My Sessions — Pending Tab** | Session card showing pending status, awaiting tutor response | After booking |
| 26 | **My Sessions — Scheduled Tab** | Session card showing scheduled status with date/time/venue | After tutor accepts |
| 27 | **My Sessions — Completed Tab** | Completed session with rating prompt or submitted rating | |
| 28 | **Become a Tutor — Schedule Required Warning** | The amber warning box shown when no schedule exists | Use a student without schedule |
| 29 | **Become a Tutor — Application Form** | Course dropdown (grouped: Currently Enrolled + Year groups with semester tags), file upload area | Simone's view |
| 30 | **Become a Tutor — My Applications** | Application cards showing pipeline tracker (Submitted → OCR → Admin Review → status) | After submitting |
| 31 | **Rate Tutor** | The rating modal/form after session completion (stars + comment) | |
| 32 | **Notifications** | Notification bell dropdown showing unread notifications | Trigger a notification first |
| 33 | **Announcements View** | Student view of pinned announcements | Need at least 1 announcement |

---

## STUDENT SCREENS (TUTOR FLOW)

Login as: an approved tutor account

| # | Screen | What to show | Notes |
|---|--------|-------------|-------|
| 34 | **My Sessions — Incoming Request** | Session request with accept/reject buttons | Need a pending session directed to this tutor |
| 35 | **My Sessions — After Accepting** | Session moved to "Scheduled" tab | |
| 36 | **My Sessions — Mark Complete** | The option to mark a session as completed | |

---

## RESPONSIVE / MOBILE VIEWS (Optional but impressive)

| # | Screen | What to show |
|---|--------|-------------|
| 37 | **Mobile — Login** | Login page at 375px width |
| 38 | **Mobile — Dashboard** | Student dashboard collapsed sidebar |
| 39 | **Mobile — Find Tutor** | Course cards stacked vertically |

---

## SPECIAL STATES

| # | Screen | What to show | How to trigger |
|---|--------|-------------|----------------|
| 40 | **Empty State — No Tutors Found** | "No tutors available for this course" message | Select a course with no approved tutors |
| 41 | **Empty State — No Free Slots** | "No mutual free slots found" message | Two students with fully conflicting schedules |
| 42 | **Error State — Schedule Required (Book Session)** | Amber warning on Book Session page | Login as student without schedule |
| 43 | **Dark/Light Mode Toggle** | Same page in both themes (side by side) | Toggle theme |

---

## SCREENSHOT NAMING CONVENTION

Use this format for file names:
```
01_login_page.png
02_password_change.png
03_admin_dashboard.png
04_admin_users_list.png
...
```

---

## PRIORITY ORDER (If short on time)

Must-have for the hearing (minimum screenshots):
1. Login Page (#1)
2. Admin Dashboard (#3)
3. Courses Page (#7)
4. Student Schedule Timetable (#10 or #18)
5. Tutor Application Review with OCR (#12)
6. Find a Tutor with cards (#20)
7. Book Session Timetable Comparison (#22)
8. Become a Tutor form with grouped dropdown (#29)
9. My Sessions (#25 or #26)
10. Notifications (#32)

These 10 cover the core flow and show all intelligent features (OCR, constraint engine, competency scores).

---

## SETUP CHECKLIST BEFORE SCREENSHOTS

Before taking screenshots, make sure:
- [ ] Simone has schedule uploaded (30 entries)
- [ ] At least 1 tutor is approved for a 3rd year course
- [ ] At least 1 pending session exists
- [ ] At least 1 completed session with a rating exists
- [ ] At least 1 announcement is posted
- [ ] At least 1 pending tutor application exists (for admin review screenshot)
- [ ] Backend server is running (`npm run dev` in backend/)
- [ ] Frontend is running (`npm run dev` in frontend/)
