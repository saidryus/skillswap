# List of Modules — Acadia

## Overview

Acadia is composed of 50 named modules spanning three layers: backend controllers, backend utility helpers, and frontend pages. ML services add three additional inference modules. Each module is listed below with its location, role, and primary responsibility.

---

## Backend Modules (Controllers)

### 1. Authentication Module
**File:** `backend/controllers/auth.controller.js`
**Routes:** `backend/routes/auth.routes.js`

Handles all authentication logic. Manages user login with bcrypt password verification, JWT generation (7-day expiry), first-login forced password change, and account lockout after repeated failed attempts. Lockout state and attempt count are stored on the `User` document. Exposes `POST /api/auth/login` and `POST /api/auth/change-password`.

---

### 2. User Management Module
**File:** `backend/controllers/user.controller.js`
**Routes:** `backend/routes/user.routes.js`

Provides full CRUD operations for all user accounts (students, admins, faculty). Supports bulk creation via CSV import. Enforces unique email and unique student ID constraints. Applies department scoping via `departmentScope.js` middleware so admins only see users in their assigned departments. Manages role assignment, `permissions` array, and `isTutor` flag.

---

### 3. Course Management Module
**File:** `backend/controllers/course.controller.js`
**Routes:** `backend/routes/course.routes.js`

Manages the `Courses` collection. Supports CRUD operations and bulk CSV import. Courses are associated with departments and carry curriculum metadata (year level, semester) used by the curriculum eligibility filter. Admins can create, update, archive, and delete courses.

---

### 4. Department Management Module
**File:** `backend/controllers/department.controller.js`
**Routes:** `backend/routes/department.routes.js`

Manages the `Departments` collection. Supports creating, reading, updating, and deleting departments. Departments act as organizational scopes for users, courses, and tutor profiles. Admin accounts are assigned to one or more departments; the `isSuperAdmin` flag bypasses department scoping.

---

### 5. Tutor Application Module
**File:** `backend/controllers/tutorProfile.controller.js`
**Routes:** `backend/routes/tutorProfile.routes.js`

The most complex module. Manages the full tutor application lifecycle:
1. Student submits application with a recommendation letter file upload
2. OCR extraction via `gradeExtractor.js` → PII redaction via `textRedactor.js`
3. ML/LLM/rule-based analysis pipeline via `recommendationAnalyzer.js`
4. AES-256-CBC encryption of the document via `fileEncryption.js`
5. Admin reviews the AI analysis panel and confidence score
6. Admin approves (sets `isTutor: true`), rejects, or requests resubmission
7. Document re-authentication gate for secure document viewing
8. Document audit log for every view and deletion
9. Competency score calculation on approval and score updates

---

### 6. Student Schedule Module
**File:** `backend/controllers/studentSchedule.controller.js`
**Routes:** `backend/routes/studentSchedule.routes.js`

Handles study load management for students. Accepts PDF uploads of class schedules, extracts schedule data via `studyLoadExtractor.js` (OCR + parsing), validates that the extracted student ID matches the logged-in user, creates or updates the `StudentSchedule` document, and deletes the uploaded file after processing. Also supports manual schedule entry and bulk enrollment.

---

### 7. Session Scheduling Module
**File:** `backend/controllers/session.controller.js`
**Routes:** `backend/routes/session.routes.js`

Implements the full session lifecycle. Key operations:
- **Slot suggestion:** constraint-based algorithm using tutor availability, tutee study load, Philippine holidays (`holidays.js`), Sunday exclusion, and existing session conflict detection
- **Session states:** `pending` → `scheduled` → `completed` / `cancelled` / `rejected`
- **Actions:** book (student), accept/reject (tutor), complete (tutor), cancel (either party)
- Business rules: sessions cannot be completed before their scheduled time; tutors must have availability set before accepting bookings

---

### 8. Rating & Feedback Module
**File:** `backend/controllers/rating.controller.js`
**Routes:** `backend/routes/rating.routes.js`

Manages post-session ratings submitted by tutees. Accepts a 1–5 star rating and optional written comment. Validates that the session is in `completed` status and that a rating has not already been submitted for the session. After saving the `Rating` document, triggers competency score recalculation on the tutor's profile. Written feedback is analyzed by `feedbackAnalyzer.js` (ML Service 2) and the resulting insights are stored on the rating document.

---

### 9. Announcement Module
**File:** `backend/controllers/announcement.controller.js`
**Routes:** `backend/routes/announcement.routes.js`

Manages the `Announcements` collection. Admins and faculty can create announcements targeted by role (all users, students only, faculty only). On creation, the module fans out notifications to all matching active users via `notify.js`. Supports listing and deletion.

---

### 10. Notification Module
**File:** `backend/controllers/notification.controller.js`
**Routes:** `backend/routes/notification.routes.js`

Manages in-app notifications stored in the `Notifications` collection. Handles listing notifications for the current user, marking individual or all notifications as read, and deletion. Notifications are created by other modules via the shared `notify.js` helper — this module only handles retrieval and state management.

---

### 11. Learning Materials Module
**File:** `backend/controllers/material.controller.js`
**Routes:** `backend/routes/material.routes.js`

Allows tutors and admins to upload learning resources (PDFs, documents, slides) to the `Materials` collection. Supports visibility control (public to all students, restricted to specific department or course). Students and admins can list and download materials. Admins can delete any material; tutors can delete their own.

---

### 12. Messaging Module
**File:** `backend/controllers/message.controller.js`
**Routes:** `backend/routes/message.routes.js`

Handles in-session chat messages stored in the `Messages` collection. Messages are scoped to a session (via `sessionId`). The HTTP endpoints handle persistence and retrieval; real-time delivery is handled by Socket.io rooms (`session-<sessionId>`). Also manages Jitsi Meet room URL generation for video sessions and supports sharing recording links.

---

### 13. Availability Module
**File:** `backend/controllers/availability.controller.js`
**Routes:** `backend/routes/availability.routes.js`

Manages weekly recurring availability slots in the `Availability` collection. Tutors define which days and time windows they are available for sessions. These slots are the prerequisite for appearing in slot suggestions. Supports adding, listing, and removing slots. The session scheduling algorithm reads this collection to compute free intervals.

---

### 14. Curriculum Module
**File:** (curriculum filtering logic)
**Routes:** `backend/routes/curriculum.routes.js`

Exposes an endpoint that returns eligible courses for a given year level, semester, and department. The eligibility filter is implemented in `backend/utils/curriculumFilter.js`. Used by the Find Tutor and Book Session flows to restrict tutor search to courses the tutee is currently enrolled in or eligible for based on their curriculum.

---

### 15. Settings Module
**File:** `backend/controllers/settings.controller.js`
**Routes:** `backend/routes/settings.routes.js`

Manages a singleton `Settings` document in the database. Currently stores global configuration such as `studentIdPrefix` (used for student ID generation and validation) and counters. Exposes GET and PATCH endpoints accessible to super admins.

---

## ML Modules (Python Flask Services)

### 16. Recommendation Letter ML Service
**Location:** ML service on **port 5002**
**Algorithm:** TF-IDF vectorizer + LinearSVC (multi-label subject classification) + Logistic Regression (strength/soft skill classification)

Accepts POST requests with OCR-extracted text from recommendation letters. Returns predicted subject competencies (multi-label), academic strengths, soft skills, and a confidence score. Results power the AI analysis panel shown to admins during tutor application review. Integrated via `backend/utils/mlRecommendationClient.js`.

---

### 17. Tutor Feedback ML Service
**Location:** ML service on **port 5003**
**Algorithm:** TF-IDF + 4 independent classifiers (sentiment, strengths, improvements, topics)

Accepts POST requests with written tutor feedback text. Returns structured insights: overall sentiment (positive/neutral/negative), identified teaching strengths, areas for improvement, and topic tags. Results are stored on `Rating` documents and displayed in the Tutor Dashboard and My Analytics pages. Integrated via `backend/utils/feedbackAnalyzer.js`.

---

### 18. Attendance Risk ML Service
**Location:** ML service on **port 5001**
**Algorithm:** Random Forest classifier on attendance features (attended sessions, missed sessions, ratio, trend)

Accepts POST requests with a student's session attendance features. Returns a predicted risk level: `low`, `medium`, or `high`. Used in the student analytics view and admin session overview to flag students who may need intervention.

---

## Utility Modules (`backend/utils/`)

### 19. recommendationAnalyzer.js
Orchestrates the full OCR-to-analysis pipeline for recommendation letters. Coordinates `gradeExtractor.js`, `textRedactor.js`, `signatureDetector.js`, `mlRecommendationClient.js`, `llmDocumentAnalyzer.js`, and the rule-based fallback into a single function called by the tutor application controller.

### 20. gradeExtractor.js
Extracts text from uploaded documents. Uses `pdfjs-dist` for PDF text layer extraction and falls back to `tesseract.js` OCR for image-based PDFs and image files (JPG, PNG). Returns raw extracted text.

### 21. feedbackAnalyzer.js
HTTP client for ML Service 2 (port 5003). Sends written feedback text and returns structured feedback insights. Called by the rating controller after a rating is saved.

### 22. mlRecommendationClient.js
HTTP client for ML Service 1 (port 5002). Sends redacted OCR text and returns subject/strength classification results and confidence score. Called by `recommendationAnalyzer.js` as Tier 1 of the fallback pipeline.

### 23. llmDocumentAnalyzer.js
OpenAI API client used as Tier 2 fallback in the recommendation analysis pipeline. Sends redacted OCR text to the OpenAI chat completion endpoint with a structured prompt. Only invoked when ML Service 1 is unavailable or returns low confidence, and only when `OPENAI_API_KEY` is set in the environment.

### 24. fileEncryption.js
Implements AES-256-CBC symmetric encryption and decryption using Node.js's built-in `crypto` module. `encrypt(buffer)` returns `{ encryptedData, iv }`. `decrypt(encryptedData, iv)` returns the plaintext buffer. Used for encrypting uploaded documents at rest and decrypting them for authorized viewing.

### 25. textRedactor.js
Strips personally identifiable information from OCR-extracted text before it is stored in the database or sent to ML services. Removes patterns matching names, student ID formats, email addresses, phone numbers, and other PII using regex rules.

### 26. docAccessToken.js
Generates and verifies short-lived document access tokens (15-minute expiry) using `jsonwebtoken`. The token encodes `{ documentId, adminId }`. Used as the access credential for the document view route, issued only after a successful re-authentication.

### 27. docExpiry.js
Runs on server startup and periodically scans for `TutorProfile` documents where `documentExpiresAt` is in the past. Deletes the encrypted file from disk and marks the document record as expired. Writes an audit log entry for each deletion.

### 28. signatureDetector.js
Scans OCR-extracted text for keywords and patterns indicative of a faculty or institutional signature (e.g., "Respectfully yours", "Department Head", signature block patterns). Returns a boolean and a confidence indicator used in the competency confidence score calculation.

### 29. curriculumFilter.js
Computes eligible courses for a given student based on year level, semester, and department. Queries the `Courses` collection and filters by curriculum metadata. Used by the curriculum route and the Find Tutor flow.

### 30. holidays.js
Exports a hardcoded list of Philippine national public holidays (by month/day). Used by the session scheduling algorithm to exclude holiday dates from slot suggestions.

### 31. notify.js
Shared helper that creates `Notification` documents in the database. Called by other modules (session controller, announcement controller, tutor profile controller) to deliver in-app notifications to target users. Accepts `{ userId, type, message, refId }`.

### 32. studyLoadExtractor.js
Parses study load PDFs uploaded by students. Extracts class schedule data (subject codes, days, time ranges) using `pdfjs-dist` text extraction and regex pattern matching. Returns structured schedule entries consumed by the student schedule controller.

---

## Frontend Modules (Pages)

### Authentication

### 33. Login Page
**Path:** `/login`
Entry point for all users. Email + password form. On successful authentication, redirects to the appropriate dashboard based on role. Displays error messages for invalid credentials, inactive accounts, and locked accounts.

### 34. Change Password Page
**Path:** `/change-password`
Forces first-login users to set a new password before accessing any other page. Also accessible voluntarily from the profile menu. Validates new password confirmation match.

---

### Admin Pages

### 35. Admin Dashboard
**Path:** `/admin/dashboard`
Overview statistics panel: total users, active sessions, pending tutor applications, recent activity feed. Uses GSAP for entry animations.

### 36. User Management Page
**Path:** `/admin/users`
Full CRUD interface for user accounts. Table view with search, filter by role/department, and pagination. Supports single user creation form and bulk CSV import with row-level error reporting.

### 37. Course Management Page
**Path:** `/admin/courses`
CRUD interface for courses. Includes CSV bulk import. Shows curriculum structure (year level, semester, department association).

### 38. Department Management Page
**Path:** `/admin/departments`
CRUD interface for departments. Simple form and table. Department records anchor all other scoped data.

### 39. Session Management Page
**Path:** `/admin/sessions`
Admin view of all sessions across departments. Filterable by status, date range, tutor, and tutee. Allows admins to cancel sessions or view session details.

### 40. Student Schedules Page
**Path:** `/admin/student-schedules`
Admin view of uploaded student schedules. Displays parsed class schedule data. Useful for resolving scheduling conflicts or verifying enrollment.

### 41. Tutor Applications Page
**Path:** `/admin/tutor-applications`
Review interface for tutor applications. Displays the AI analysis panel (predicted subjects, strengths, soft skills, confidence score), document re-auth gate for viewing the original recommendation letter, and approve / reject / request-resubmission action buttons. Includes the ML correction feedback loop.

---

### Student Pages

### 42. Student Dashboard
**Path:** `/student/dashboard`
Overview of upcoming sessions, recent notifications, and quick-action links. Entry point for the student experience.

### 43. Find Tutor Page
**Path:** `/student/find-tutor`
Tutor discovery interface. Displays ranked tutors filtered by subject eligibility (curriculum filter), competency score, and availability. Shows each tutor's star rating, subject specialties, and session count.

### 44. Book Session Page
**Path:** `/student/book-session`
Slot selection interface. Calls the slot suggestion endpoint to display mutually available time slots for the selected tutor. Student selects a slot and submits a session request.

### 45. My Sessions Page
**Path:** `/student/my-sessions`
Lists all sessions for the current student (as tutee or tutor). Displays session status, scheduled time, and action buttons (join, rate, cancel) appropriate to the session's current state.

### 46. My Schedule Page
**Path:** `/student/my-schedule`
Allows students to upload their study load PDF (triggering OCR extraction) and manage their parsed class schedule. Also displays their set availability slots.

### 47. Become Tutor Page
**Path:** `/student/become-tutor`
Tutor application form. Student uploads a faculty recommendation letter. Progress indicator shows the pipeline stages (uploading → OCR → analyzing → submitted). Displays current application status.

### 48. My Analytics Page
**Path:** `/student/my-analytics`
Personalized analytics for the student. Shows session history, attendance rate, risk level (from ML Service 3), and feedback summary. Uses Framer Motion for animated chart entries.

### 49. Tutor Dashboard Page
**Path:** `/student/tutor-dashboard`
Available only to users with `isTutor: true`. Shows tutor-specific metrics: competency score breakdown, average rating, completed sessions, ML feedback insights from recent reviews, and pending session requests.

---

### Shared Pages

### 50. Announcements Page
**Path:** `/announcements`
Displays role-targeted announcements in reverse chronological order. Available to all authenticated users. Announcements are marked read on view.

### 51. Learning Resources Page
**Path:** `/resources`
Lists available learning materials with filter by course/department. Supports download. Tutors see an upload button to add new materials. Visibility-controlled — restricted materials only appear for eligible students.
