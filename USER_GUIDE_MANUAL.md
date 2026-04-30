# TROPHE SMART CAMPUS MANAGEMENT SYSTEM
## User Guide Manual

**Version:** 1.0.0
**System:** Trophe Smart Campus Management System
**Stack:** MERN (MongoDB, Express.js, React, Node.js)
**Prepared by:** [Your Name]
**Date:** May 1, 2026

---

## TABLE OF CONTENTS

1. [Introduction](#1-introduction)
2. [Getting Started](#2-getting-started)
3. [Admin User Guide](#3-admin-user-guide)
4. [Faculty User Guide](#4-faculty-user-guide)
5. [Student User Guide](#5-student-user-guide)
6. [Notification System](#6-notification-system)
7. [Print Study Load](#7-print-study-load)
8. [Screenshot Checklist](#8-screenshot-checklist)

---

## 1. INTRODUCTION

Trophe is a Smart Campus Management System designed to digitize and streamline campus operations for educational institutions. It provides three role-based portals:

| Role | Access Level | Key Functions |
|------|-------------|---------------|
| Admin | Full system access | Manage users, courses, schedules, attendance, announcements |
| Faculty | Course-level access | View assigned courses, mark attendance, post announcements |
| Student | Personal access | View enrolled courses, schedules, attendance, study load |

### System Requirements
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Internet connection

### Live Application URL
🌐 **https://trophe-eight.vercel.app**

### Default Login Credentials (Seeded Data)
```
Admin:
  Email:    admin@trophe.edu
  Password: admin123

Faculty:
  Email:    maria.santos@trophe.edu
  Password: faculty123

  Email:    jose.reyes@trophe.edu
  Password: faculty123

Student:
  Email:    juan.delacruz@trophe.edu
  Password: student123  (ID: STU-2024-001)

  Email:    ana.gonzales@trophe.edu
  Password: student123  (ID: STU-2024-002)

  Email:    carlos.mendoza@trophe.edu
  Password: student123  (ID: STU-2024-003)
```

---

## 2. GETTING STARTED

### 2.1 Accessing the System

Open your browser and navigate to: `http://localhost:5173`

You will be redirected to the Login page.

---

### 2.2 Login Page

📸 **SCREENSHOT GUIDE — Login Page**
> Navigate to `http://localhost:5173`
> **What to capture:** The full login page showing the Trophe logo (owl/laurel wreath), the email and password fields, and the Login button. Do NOT fill in credentials yet — capture the empty form first.

**How to log in:**
1. Enter your email address
2. Enter your password
3. Click the **Login** button
4. You will be redirected to your role-specific dashboard

📸 **SCREENSHOT GUIDE — Login with Credentials**
> Fill in `admin@trophe.edu` and `admin123`
> **What to capture:** The login form with credentials filled in, just before clicking Login.

---

### 2.3 Register Page

📸 **SCREENSHOT GUIDE — Register Page**
> Click "Register" or navigate to `http://localhost:5173/register`
> **What to capture:** The full registration form showing all fields: First Name, Last Name, Email, Password, Role dropdown, Student ID (optional), Department.

**How to register:**
1. Fill in First Name and Last Name
2. Enter a valid email address
3. Create a password (minimum 6 characters)
4. Select your role (Student, Faculty, Admin)
5. Enter Student ID if registering as a student
6. Select your department
7. Click **Register**

---

## 3. ADMIN USER GUIDE

Log in as: `admin@trophe.edu` / `admin123`

---

### 3.1 Admin Dashboard

📸 **SCREENSHOT GUIDE — Admin Dashboard**
> After logging in as admin, you land on the dashboard.
> **What to capture:** The full dashboard showing the stat cards (Total Users, Total Courses, Total Schedules, Total Attendance), the sidebar navigation on the left, and the Topbar with the notification bell at the top.

**Dashboard Overview:**
The Admin Dashboard displays a summary of the entire system:
- **Total Users** — count of all registered users
- **Total Courses** — count of all active courses
- **Total Schedules** — count of all class schedules
- **Total Attendance** — count of all attendance records
- **Recent Announcements** — latest pinned and recent announcements

---

### 3.2 User Management

Navigate to: **Sidebar → Users**

📸 **SCREENSHOT GUIDE — Users Page (Full List)**
> Click "Users" in the sidebar.
> **What to capture:** The full Users page showing the table/list of all users with their names, emails, roles, departments, and status. Make sure at least 3–4 users are visible.

📸 **SCREENSHOT GUIDE — Create User Modal**
> Click the "Add User" or "+" button on the Users page.
> **What to capture:** The modal/form that appears with fields: First Name, Last Name, Email, Password, Role, Department, Student ID.

**How to create a user:**
1. Click the **Add User** button (top right)
2. Fill in the user details:
   - First Name, Last Name
   - Email address
   - Password
   - Role: Admin / Faculty / Student
   - Department
   - Student ID (for students only)
3. Click **Save** or **Create**

📸 **SCREENSHOT GUIDE — Edit User Modal**
> Click the edit (pencil) icon on any user row.
> **What to capture:** The edit modal pre-filled with the user's existing data, showing which fields can be modified.

**How to edit a user:**
1. Click the **Edit** (pencil) icon on the user row
2. Modify the desired fields
3. Click **Save**

📸 **SCREENSHOT GUIDE — Delete User Confirmation**
> Click the delete (trash) icon on any user row.
> **What to capture:** The confirmation dialog asking "Are you sure you want to delete this user?"

**How to delete a user:**
1. Click the **Delete** (trash) icon on the user row
2. Confirm the deletion in the dialog
3. The user is permanently removed

---

### 3.3 Course Management

Navigate to: **Sidebar → Courses**

📸 **SCREENSHOT GUIDE — Courses Page (Full List)**
> Click "Courses" in the sidebar.
> **What to capture:** The full Courses page showing all course cards or table rows with course code, name, units, faculty, and enrolled student count.

📸 **SCREENSHOT GUIDE — Create Course Modal**
> Click the "Add Course" or "+" button.
> **What to capture:** The create course form showing fields: Course Code, Course Name, Description, Units, Department, Faculty (dropdown).

**How to create a course:**
1. Click **Add Course**
2. Enter:
   - Course Code (e.g., CS101) — must be unique
   - Course Name
   - Description (optional)
   - Units (1–6)
   - Department
   - Assign Faculty (optional)
3. Click **Save**

📸 **SCREENSHOT GUIDE — Enroll Student in Course**
> Open a course and click the "Enroll Student" button.
> **What to capture:** The enrollment modal showing a student dropdown or search field, with the course name visible in the modal title.

**How to enroll a student:**
1. Click on a course to open it, or click the enroll icon
2. Select the student from the dropdown
3. Click **Enroll**
4. The student receives an automatic notification

---

### 3.4 Schedule Management

Navigate to: **Sidebar → Schedules**

📸 **SCREENSHOT GUIDE — Schedules Page (Full List)**
> Click "Schedules" in the sidebar.
> **What to capture:** The full Schedules page showing all schedule entries with course name, day, time, room, semester, and school year.

📸 **SCREENSHOT GUIDE — Create Schedule Modal**
> Click the "Add Schedule" or "+" button.
> **What to capture:** The create schedule form showing fields: Course (dropdown), Day, Start Time, End Time, Room, Semester, School Year.

**How to create a schedule:**
1. Click **Add Schedule**
2. Select the Course from the dropdown
3. Choose the Day of the week
4. Set Start Time and End Time
5. Enter the Room
6. Set Semester and School Year
7. Click **Save**

📸 **SCREENSHOT GUIDE — Schedule Conflict Error**
> Try to create a schedule that conflicts with an existing one (same room, same day, overlapping time).
> **What to capture:** The error banner/message inside the modal showing the conflict type (e.g., "Room conflict: Room 101 is already booked on Monday from 08:00 to 09:30").

**Conflict Detection:**
The system automatically checks for 4 types of conflicts:
- **Room Conflict** — same room booked at overlapping times
- **Instructor Conflict** — faculty assigned to two courses simultaneously
- **Student Conflict** — student enrolled in two overlapping courses
- **Course Conflict** — same course scheduled twice at the same time

---

### 3.5 Attendance Management

Navigate to: **Sidebar → Attendance**

📸 **SCREENSHOT GUIDE — Attendance Page**
> Click "Attendance" in the sidebar.
> **What to capture:** The Attendance page showing attendance records with student names, course, date, and status (present/absent/late/excused).

📸 **SCREENSHOT GUIDE — Mark Attendance**
> Select a course and date, then mark attendance for students.
> **What to capture:** The attendance marking interface showing the list of students with status dropdowns or buttons (Present, Absent, Late, Excused).

**How to mark attendance:**
1. Select the Course
2. Select the Date
3. For each student, set their status:
   - ✅ Present
   - ❌ Absent
   - ⏰ Late
   - 📋 Excused
4. Add remarks if needed
5. Click **Submit**

---

### 3.6 Announcements

Navigate to: **Sidebar → Announcements**

📸 **SCREENSHOT GUIDE — Announcements Page**
> Click "Announcements" in the sidebar.
> **What to capture:** The Announcements page showing all announcements with title, content preview, author, date, and target roles. Pinned announcements should appear at the top.

📸 **SCREENSHOT GUIDE — Create Announcement Modal**
> Click the "New Announcement" or "+" button.
> **What to capture:** The create announcement form showing fields: Title, Content (text area), Target Roles (checkboxes for Admin/Faculty/Student), Pin toggle.

**How to create an announcement:**
1. Click **New Announcement**
2. Enter the Title
3. Write the Content
4. Select Target Roles (who can see it):
   - Admin
   - Faculty
   - Student
5. Toggle **Pin** if it should appear at the top
6. Click **Post**

---

## 4. FACULTY USER GUIDE

Log in as: `maria.santos@trophe.edu` / `faculty123`

---

### 4.1 Faculty Dashboard

📸 **SCREENSHOT GUIDE — Faculty Dashboard**
> After logging in as faculty, you land on the faculty dashboard.
> **What to capture:** The full Faculty Dashboard showing stat cards (My Courses, My Students, Attendance Records), the sidebar with faculty-specific navigation, and the notification bell.

**Dashboard Overview:**
- **My Courses** — number of courses assigned to this faculty
- **My Students** — total students across all assigned courses
- **Attendance Records** — total attendance entries marked

---

### 4.2 My Courses (Faculty)

Navigate to: **Sidebar → My Courses**

📸 **SCREENSHOT GUIDE — Faculty My Courses Page**
> Click "My Courses" in the sidebar while logged in as faculty.
> **What to capture:** The courses page showing only the courses assigned to this faculty member. Each course card should show: course code, course name, units, number of enrolled students, and department.

**What faculty can see:**
- Only courses where they are assigned as the instructor
- Number of enrolled students per course
- Student list within each course card

---

### 4.3 Faculty Attendance

Navigate to: **Sidebar → Attendance**

📸 **SCREENSHOT GUIDE — Faculty Attendance Page**
> Click "Attendance" in the sidebar while logged in as faculty.
> **What to capture:** The attendance page showing the faculty's courses and the attendance marking interface.

📸 **SCREENSHOT GUIDE — Faculty Marking Attendance**
> Select a course and date, then mark students.
> **What to capture:** The list of students in the selected course with status options visible (Present, Absent, Late, Excused).

**How faculty marks attendance:**
1. Select the Course from the dropdown
2. Select the Date (defaults to today)
3. Mark each student's status
4. Add optional remarks
5. Click **Submit Attendance**

---

### 4.4 Announcements (Faculty)

Navigate to: **Sidebar → Announcements**

📸 **SCREENSHOT GUIDE — Faculty Announcements Page**
> Click "Announcements" while logged in as faculty.
> **What to capture:** The announcements page showing only announcements targeted to faculty and all roles. Faculty should NOT see student-only announcements.

Faculty can:
- View announcements targeted to their role
- Create new announcements for students and/or faculty
- Edit and delete their own announcements

---

## 5. STUDENT USER GUIDE

Log in as: `juan.delacruz@trophe.edu` / `student123`

---

### 5.1 Student Dashboard

📸 **SCREENSHOT GUIDE — Student Dashboard**
> After logging in as a student, you land on the student dashboard.
> **What to capture:** The full Student Dashboard showing stat cards (My Courses, My Schedule, Attendance Rate), the sidebar with student-specific navigation, and the notification bell.

**Dashboard Overview:**
- **My Courses** — number of enrolled courses
- **My Schedule** — number of scheduled classes
- **Attendance Rate** — overall attendance percentage

---

### 5.2 My Courses (Student)

Navigate to: **Sidebar → My Courses**

📸 **SCREENSHOT GUIDE — Student My Courses Page**
> Click "My Courses" in the sidebar while logged in as a student.
> **What to capture:** The courses page showing only the courses this student is enrolled in. Each card should show: course code, course name, units, instructor name, and department.

**What students can see:**
- Only courses they are enrolled in
- Instructor name for each course
- Course units and department

---

### 5.3 My Schedule

Navigate to: **Sidebar → My Schedule**

📸 **SCREENSHOT GUIDE — Student Schedule Page**
> Click "My Schedule" in the sidebar while logged in as a student.
> **What to capture:** The schedule page showing the student's weekly class schedule with course name, day, time, room, and instructor.

**Schedule Information:**
- Day of the week
- Start and end time
- Room/location
- Course name and code
- Instructor name

---

### 5.4 My Attendance

Navigate to: **Sidebar → Attendance**

📸 **SCREENSHOT GUIDE — Student Attendance Page**
> Click "Attendance" in the sidebar while logged in as a student.
> **What to capture:** The attendance page showing the student's attendance history with course name, date, status (present/absent/late/excused), and attendance percentage per course.

**Attendance Status Types:**
| Status | Meaning |
|--------|---------|
| ✅ Present | Student attended the class |
| ❌ Absent | Student did not attend |
| ⏰ Late | Student arrived after class started |
| 📋 Excused | Absence with valid excuse |

---

### 5.5 Announcements (Student)

Navigate to: **Sidebar → Announcements**

📸 **SCREENSHOT GUIDE — Student Announcements Page**
> Click "Announcements" while logged in as a student.
> **What to capture:** The announcements page showing only announcements targeted to students. Pinned announcements appear at the top with a pin icon.

Students can:
- View announcements targeted to their role
- Read full announcement content
- Cannot create or delete announcements

---

## 6. NOTIFICATION SYSTEM

Available to: All roles (Admin, Faculty, Student)

📸 **SCREENSHOT GUIDE — Notification Bell (Unread Badge)**
> While logged in as any user, look at the top-right of the screen.
> **What to capture:** The Topbar showing the notification bell icon with a red badge/number indicating unread notifications.

📸 **SCREENSHOT GUIDE — Notification Dropdown Panel**
> Click the notification bell icon.
> **What to capture:** The dropdown panel showing the list of notifications with their titles, messages, timestamps, and read/unread status (unread notifications appear highlighted).

📸 **SCREENSHOT GUIDE — Notification After Action**
> Perform an action that triggers a notification (e.g., enroll a student in a course as admin, then log in as that student).
> **What to capture:** The notification showing the enrollment message in the student's notification panel.

**Automatic Notification Triggers:**

| Action | Who Gets Notified |
|--------|------------------|
| Student enrolled in course | The enrolled student |
| Student removed from course | The affected student |
| Instructor assigned to course | The assigned faculty |
| Instructor changed | Old and new faculty |
| Schedule created | All enrolled students |
| Schedule updated | All enrolled students |
| Schedule deleted | All enrolled students |
| New announcement posted | All users in target roles |

**Notification Features:**
- Red badge shows unread count
- Click bell to open notification panel
- Click a notification to mark it as read
- Unread count updates every 30 seconds automatically

---

## 7. PRINT STUDY LOAD

Available to: Students only

Navigate to: **Topbar → Print Study Load button** (visible only when logged in as student)

📸 **SCREENSHOT GUIDE — Print Study Load Page**
> Log in as a student, then click the "Print Study Load" button in the topbar.
> **What to capture:** The full print-ready page showing the official study load document with: Trophe logo, student name, student ID, department, semester, school year, course table (course code, course name, units, instructor, schedule), and total units.

📸 **SCREENSHOT GUIDE — Print Dialog**
> On the Print Study Load page, click the "Print" button.
> **What to capture:** The browser's print dialog showing the document ready to print, with the study load visible in the print preview.

📸 **SCREENSHOT GUIDE — Download as PDF**
> On the Print Study Load page, click the "Download PDF" button.
> **What to capture:** The PDF download being triggered (the save dialog or the downloaded PDF file in the browser's download bar).

**How to print study load:**
1. Log in as a student
2. Click **Print Study Load** in the top navigation bar
3. Review the study load document
4. Click **Print** to send to printer
   - OR click **Download PDF** to save as PDF file
5. The print page uses a white background (printer-friendly)
6. Buttons are hidden when printing

**Study Load Document Contains:**
- Institution name and logo
- Student full name
- Student ID number
- Department
- Current semester and school year
- Table of enrolled courses:
  - Course Code
  - Course Name
  - Units
  - Instructor
  - Schedule (day and time)
- Total units

---

## 8. SCREENSHOT CHECKLIST

Use this checklist to ensure you have captured all required screenshots:

### Authentication (3 screenshots)
- [ ] Login page (empty form)
- [ ] Login page (with credentials filled)
- [ ] Register page

### Admin Portal (14 screenshots)
- [ ] Admin Dashboard (stat cards visible)
- [ ] Users page (full list)
- [ ] Create User modal (form visible)
- [ ] Edit User modal (pre-filled form)
- [ ] Delete User confirmation dialog
- [ ] Courses page (full list)
- [ ] Create Course modal
- [ ] Enroll Student modal
- [ ] Schedules page (full list)
- [ ] Create Schedule modal
- [ ] Schedule Conflict error message
- [ ] Attendance page
- [ ] Mark Attendance interface
- [ ] Announcements page + Create Announcement modal

### Faculty Portal (4 screenshots)
- [ ] Faculty Dashboard
- [ ] Faculty My Courses page
- [ ] Faculty Attendance page
- [ ] Faculty Announcements page

### Student Portal (5 screenshots)
- [ ] Student Dashboard
- [ ] Student My Courses page
- [ ] Student Schedule page
- [ ] Student Attendance page
- [ ] Student Announcements page

### Notifications (3 screenshots)
- [ ] Notification bell with unread badge
- [ ] Notification dropdown panel open
- [ ] Notification after a triggered action

### Print Study Load (3 screenshots)
- [ ] Print Study Load page (document view)
- [ ] Print dialog
- [ ] PDF download

---

**TOTAL: 32 screenshots**

---

## APPENDIX: NAVIGATION STRUCTURE

### Admin Sidebar
```
Dashboard
Users
Courses
Schedules
Attendance
Announcements
```

### Faculty Sidebar
```
Dashboard
My Courses
Attendance
Announcements
```

### Student Sidebar
```
Dashboard
My Courses
My Schedule
Attendance
Announcements
```

### Topbar (All Roles)
```
[Logo / System Name]    [Notification Bell]  [User Avatar / Name]  [Logout]
```

### Topbar (Student Only — Additional)
```
[Print Study Load Button]
```

---

*Trophe Smart Campus Management System — User Guide Manual v1.0.0*
