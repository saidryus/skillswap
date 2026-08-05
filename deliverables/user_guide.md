# User Guide — Acadia

## Introduction

Acadia is a web-based peer-to-peer tutoring platform for college departments. It connects students who need academic help (tutees) with qualified student tutors, and gives administrators the tools to manage the process. This guide covers all three roles: Admin, Student (Tutee), and Student (Tutor).

Acadia runs in your browser — no installation is needed on your device. You only need a modern browser (Chrome, Firefox, or Edge) and access to the server.

---

# Administrator Guide

## 1. Logging In

1. Open your browser and go to the Acadia URL provided by your department.
2. Enter your admin email address and password.
3. Click **Log In**.
4. If this is your first login, you will be directed to the Change Password page. You must set a new password before continuing.

> If your account is locked after multiple failed attempts, contact your system administrator to unlock it.

---

## 2. Creating a Student Account

Accounts are created by administrators — students cannot self-register.

1. From the sidebar, click **Users**.
2. Click the **Add User** button (top right of the page).
3. Fill in the required fields:
   - Full name
   - Email address
   - Student ID
   - Department
   - Role (Student, Faculty, or Admin)
4. Click **Create User**.
5. The account is created with a default password. The student will be prompted to change their password on first login.

> The student ID must be unique across the system. If the ID is already in use, you will see an error and the account will not be created.

---

## 3. Bulk Importing Students (CSV)

To add many students at once:

1. Go to **Users** from the sidebar.
2. Click **Import CSV**.
3. Download the template CSV file if you have not already done so — use the provided column headers.
4. Fill in the CSV with your student data (name, email, studentId, department, role).
5. Upload the completed CSV file.
6. The system will process each row. Rows with errors (duplicate email, missing fields, etc.) are listed in the error report. Valid rows are created immediately.

> You do not need to fix errors before re-importing — only the failed rows need correction. Successfully created rows will not be duplicated.

---

## 4. Managing Courses and Departments

### Departments

1. Click **Departments** in the sidebar.
2. Click **Add Department** to create a new one. Enter the department name and code.
3. To edit or delete, click the action icons next to the department row.

### Courses

1. Click **Courses** in the sidebar.
2. Click **Add Course** to create a course. Fill in the course name, code, year level, semester, and department.
3. Courses can also be imported in bulk via CSV — click **Import CSV** on the Courses page and follow the same process as user imports.

> Year level and semester metadata are used to filter courses for students when they search for tutors. Make sure this information is accurate.

---

## 5. Reviewing Tutor Applications

When a student applies to become a tutor, their application appears in the **Tutor Applications** section.

1. Click **Tutor Applications** in the sidebar.
2. Find the pending application and click **Review**.

### Reading the AI Analysis Panel

The analysis panel shows what the system extracted from the student's recommendation letter:

- **Predicted Subjects** — courses the faculty recommends the student to tutor, predicted by the ML model
- **Strengths** — academic and soft skills identified in the letter
- **Confidence Score** — how certain the system is about its analysis (0–100%). A higher score means more text indicators were found (faculty name detected, signature present, clear subject mentions).
- **Analysis Method** — whether the result came from the ML model, the LLM fallback, or basic rule-based detection.

> A low confidence score does not automatically mean the application is weak — it may mean the document was unclear or poorly scanned. Use your judgment alongside the AI analysis.

### Viewing the Original Document

For security, the original recommendation letter requires a second verification step:

1. Click **View Document**.
2. Enter your admin password in the prompt that appears.
3. The document will open once your password is verified.

You have 3 attempts to enter the correct password. After 3 failures, document access is locked for 3 hours. Every time you view a document, the system logs your admin ID, IP address, and timestamp.

### Making a Decision

- **Approve** — The student becomes a tutor. Their profile is activated and they can begin accepting sessions.
- **Reject** — The application is declined. The student receives a notification.
- **Request Resubmission** — Ask the student to upload a new or clearer document. They receive a notification to resubmit.

---

## 6. Viewing and Managing Sessions

1. Click **Sessions** in the sidebar.
2. Use the filters at the top to narrow down by status (pending, scheduled, completed, cancelled), date range, tutor name, or tutee name.
3. Click any session row to view its details (participants, subject, time, status, any notes).
4. Admins can cancel sessions from the detail view if needed.

---

## 7. Creating Announcements

1. Click **Announcements** in the sidebar.
2. Click **New Announcement**.
3. Write your announcement title and body.
4. Set the **Target Audience**:
   - All Users
   - Students only
   - Faculty only
5. Click **Publish**.

The announcement is saved and all matching active users receive an in-app notification.

---

## 8. Moderating Learning Materials

1. Click **Resources** in the sidebar.
2. You can see all uploaded learning materials across departments.
3. To remove an inappropriate or outdated file, click the **Delete** icon next to the material.
4. Admins can also adjust visibility settings on any material.

---

## 9. Viewing System Analytics

The **Dashboard** (first page after login) shows a real-time overview:
- Total registered users
- Active sessions
- Pending tutor applications
- Recently completed sessions

For deeper analytics, navigate to specific sections (Sessions, Users) and use the built-in filters and tables to review trends.

---

---

# Student (Tutee) Guide

## 1. Logging In and Changing Your Password

1. Go to the Acadia URL and enter your email and default password (provided by your admin).
2. On first login, you will be redirected to the **Change Password** page.
3. Enter your current password, then your new password, then confirm it.
4. Click **Change Password**. You will be sent to your dashboard.

> Choose a strong password. You can change it again anytime from the profile menu.

---

## 2. Uploading Your Study Load

Your study load lets Acadia avoid scheduling sessions during your class hours.

1. Go to **My Schedule** from the sidebar.
2. Click **Upload Study Load**.
3. Select your class schedule PDF (the official one from your registrar or enrollment system).
4. Click **Upload**. The system reads your schedule automatically.
5. Your class times will appear on the page after processing (this may take 10–30 seconds).

> The student ID on your PDF must match the ID on your account. If they don't match, the upload will be rejected. Contact your admin if your ID is incorrect.

---

## 3. Setting Your Availability

Setting your availability tells the system when you are free to attend tutoring sessions.

1. Go to **My Schedule** from the sidebar.
2. Scroll to the **Availability** section.
3. Click **Add Slot**.
4. Choose the day of the week and the start/end time.
5. Click **Save**. Repeat for each free block.

> You need at least one availability slot set before you can book a session, and before you can apply to become a tutor.

---

## 4. Finding a Tutor

1. Click **Find Tutor** in the sidebar.
2. The page shows tutors ranked by their competency score — a combined measure of their ratings, faculty recommendation, and session history.
3. Use the search or filter to narrow tutors by subject.
4. Click a tutor's card to see their subjects, rating, and session count.

---

## 5. Booking a Session

1. From the **Find Tutor** page, click **Book Session** on a tutor's card.
2. The system suggests available time slots — these are times when both you and the tutor are free, excluding your class hours, Sundays, and public holidays.
3. Click a slot that works for you.
4. Add an optional note (e.g., what topic you need help with).
5. Click **Send Request**.

The tutor will receive a notification and can accept or decline your request. You will be notified of their response.

---

## 6. Joining a Session (Online via Jitsi)

1. Go to **My Sessions** from the sidebar.
2. Find your scheduled session.
3. When it is time for the session, click **Join Session**.
4. A Jitsi Meet video room opens in your browser. Allow camera and microphone access when prompted.

> Jitsi Meet requires an internet connection. Make sure you are on a stable network before joining.

---

## 7. Rating Your Tutor

After the tutor marks a session as complete, you can rate the session.

1. Go to **My Sessions** and find the completed session.
2. Click **Rate Session**.
3. Select 1–5 stars.
4. Optionally, write a comment about your experience.
5. Click **Submit Rating**.

Your feedback helps the system refine tutor rankings and gives your tutor useful insights.

---

## 8. Browsing Learning Materials

1. Click **Resources** in the sidebar.
2. Browse or search for materials by course or subject.
3. Click **Download** on any file you want to save.

---

## 9. Viewing My Analytics

1. Click **My Analytics** from the sidebar.
2. The page shows:
   - Your session history (how many sessions you've attended)
   - Attendance rate
   - Risk level (low/medium/high) based on your attendance pattern
   - Session trend over time

Use this page to track your tutoring activity and identify if you are falling behind on sessions.

---

---

# Student (Tutor) Guide

## 1. Applying to Be a Tutor

Before applying, make sure you have set at least one availability slot (see the Tutee guide, Section 3).

1. Click **Become a Tutor** in the sidebar.
2. Read the application requirements.
3. Click **Apply Now**.
4. Upload your **faculty recommendation letter** (PDF or image). This should be an official letter from a faculty member recommending you as a tutor.
5. Click **Submit Application**.

The system will analyze your recommendation letter using OCR and AI to extract subject competencies and strengths. This takes about 10–30 seconds. Once submitted, your application status will show as **Pending**.

An admin will review your application and either approve it, reject it, or ask you to resubmit with a clearer document. You will be notified of the outcome.

---

## 2. Managing Your Availability

As a tutor, your availability determines when students can book sessions with you.

1. Go to **My Schedule** from the sidebar.
2. In the **Availability** section, click **Add Slot**.
3. Set the day and time range for each block you are free.
4. Click **Save**.

You can remove a slot by clicking the delete icon next to it. Changes take effect immediately for new booking requests.

---

## 3. Responding to Session Requests

When a student books a session with you, you will receive an in-app notification.

1. Click **My Sessions** in the sidebar.
2. Find the session with status **Pending**.
3. Review the details (subject, time, tutee name, any notes).
4. Click **Accept** to confirm, or **Reject** to decline.

The tutee is notified of your response.

---

## 4. Completing a Session

After the session has taken place:

1. Go to **My Sessions**.
2. Find the session (status should be **Scheduled**).
3. After the scheduled end time has passed, click **Mark as Complete**.

> You cannot mark a session as complete before its scheduled end time. The button becomes active once the session time has passed.

Once marked complete, the tutee can submit a rating.

---

## 5. Uploading Learning Materials

1. Click **Resources** in the sidebar.
2. Click **Upload Material**.
3. Select the file (PDF, slides, etc.) from your device.
4. Set the title, course, and visibility:
   - **All Students** — visible to everyone on the platform
   - **Department Only** — visible only to students in your department
5. Click **Upload**.

The material will appear in the Resources page for the appropriate audience.

---

## 6. Viewing Your Tutor Dashboard

1. Click **Tutor Dashboard** in the sidebar (only visible to approved tutors).
2. The dashboard shows:
   - Your **competency score** and its breakdown (ratings 45%, recommendation 15%, completion rate 20%, sessions 20%)
   - Average star rating
   - Total completed sessions
   - ML-generated insights from recent student feedback (strengths, areas for improvement, common topics)
   - Pending session requests

---

## 7. Sharing a Recording Link

Jitsi Meet does not record sessions natively within Acadia. If you use an external recording tool (e.g., the Jitsi recording feature or a screen recorder):

1. After the session, copy the recording link.
2. Go to **My Sessions** and open the completed session.
3. In the session chat, paste and send the recording link.

The tutee will see the link in their session chat thread.
