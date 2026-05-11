# Trophe Smart Campus Management System — Backend Documentation

> **Audience:** Panelists, evaluators, and anyone reviewing the system who may not be familiar with the codebase.
> This document explains what the backend does, how it is structured, and why each part exists.

---

## Table of Contents

1. [What is the Backend?](#1-what-is-the-backend)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [How the Server Starts](#4-how-the-server-starts)
5. [Database Connection](#5-database-connection)
6. [Data Models (Database Schemas)](#6-data-models-database-schemas)
7. [Authentication and Security](#7-authentication-and-security)
8. [API Modules and Endpoints](#8-api-modules-and-endpoints)
9. [Notification System](#9-notification-system)
10. [Schedule Conflict Detection](#10-schedule-conflict-detection)
11. [Role and Permission System](#11-role-and-permission-system)
12. [Sample / Seed Data](#12-sample--seed-data)
13. [Environment Configuration](#13-environment-configuration)
14. [Request Flow — End to End](#14-request-flow--end-to-end)

---

## 1. What is the Backend?

The backend is the **server-side** of the Trophe Smart Campus Management System. It is the engine that:

- Stores and retrieves all data (users, courses, schedules, attendance, announcements, notifications)
- Enforces who is allowed to do what (authentication and authorization)
- Processes business logic (e.g., detecting schedule conflicts, calculating attendance percentages)
- Communicates with the frontend through a **REST API** — a set of URLs the frontend calls to get or send data

The frontend (the web pages users see) never talks to the database directly. Every action goes through the backend first.

---

## 2. Technology Stack

The system is a full-stack web application split into a **backend API** and a **React frontend**. Below is every technology used across both sides.

---

### Backend

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | runtime | JavaScript runtime environment — executes the server-side code |
| **Express.js** | 4.18.2 | Web framework — handles HTTP routing, middleware, and request/response lifecycle |
| **MongoDB** | — | NoSQL document database — stores all application data as JSON-like documents |
| **Mongoose** | 8.0.3 | ODM (Object Data Modeling) library — defines schemas, validates data, and queries MongoDB |
| **JSON Web Tokens (JWT)** | 9.0.2 | Stateless authentication — signs and verifies tokens so users stay logged in |
| **bcryptjs** | 2.4.3 | Password hashing — one-way encrypts passwords before storing; never saves plain text |
| **cors** | 2.8.5 | Cross-Origin Resource Sharing — allows the frontend (different port) to call the API |
| **dotenv** | 16.3.1 | Environment variable loader — reads secrets from `.env` so they stay out of source code |
| **mongodb** | 7.2.0 | Low-level MongoDB driver (used internally by Mongoose) |
| **nodemon** | 3.0.2 | Dev tool — auto-restarts the server whenever a file is saved |

---

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | 18.2.0 | UI library — builds the interface as reusable components |
| **React DOM** | 18.2.0 | Renders React components into the browser DOM |
| **React Router DOM** | 6.21.1 | Client-side routing — navigates between pages without full page reloads |
| **Vite** | 5.0.8 | Build tool and dev server — fast hot-reload during development, optimized production builds |
| **Tailwind CSS** | 3.4.0 | Utility-first CSS framework — all styling is done with class names, no separate CSS files |
| **PostCSS** | 8.4.32 | CSS processor — required by Tailwind to transform and optimize styles |
| **Autoprefixer** | 10.4.16 | PostCSS plugin — automatically adds vendor prefixes for browser compatibility |
| **Axios** | 1.6.2 | HTTP client — makes API calls from the frontend to the backend with clean syntax |
| **Framer Motion** | 10.16.16 | Animation library — powers page transitions, modal animations, and UI motion effects |
| **@dnd-kit/core** | 6.3.1 | Drag-and-drop engine — drives the schedule plotter grid (draggable cards, droppable cells) |
| **@dnd-kit/utilities** | 3.2.2 | Helper utilities for dnd-kit (CSS transform helpers used during drag) |
| **react-hot-toast** | 2.4.1 | Toast notification library — shows success/error pop-up messages after actions |
| **react-icons** | 4.12.0 | Icon library — provides all UI icons (HeroIcons set used throughout the app) |
| **jsPDF** | 2.5.1 | PDF generation — creates downloadable schedule PDFs client-side in the browser |
| **jspdf-autotable** | 3.8.1 | jsPDF plugin — generates formatted tables inside the exported PDF files |

---

### Development & Tooling

| Tool | Purpose |
|---|---|
| **@vitejs/plugin-react** | Vite plugin that enables React JSX and Fast Refresh during development |
| **@types/react** | TypeScript type definitions for React (used for editor intellisense) |
| **@types/react-dom** | TypeScript type definitions for React DOM |

---

## 3. Project Structure

```
backend/
├── server.js              # Entry point — starts the whole application
├── seed.js                # Script to populate the database with sample data
├── .env                   # Secret configuration (not committed to git)
├── package.json           # Project metadata and dependencies
│
├── config/
│   └── db.js              # Database connection logic
│
├── models/                # Database schemas — define the shape of stored data
│   ├── User.js
│   ├── Course.js
│   ├── Schedule.js
│   ├── Attendance.js
│   ├── Announcement.js
│   └── Notification.js
│
├── controllers/           # Business logic — what happens when an endpoint is called
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── course.controller.js
│   ├── schedule.controller.js
│   ├── attendance.controller.js
│   ├── announcement.controller.js
│   └── notification.controller.js
│
├── routes/                # URL definitions — maps URLs to controller functions
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── course.routes.js
│   ├── schedule.routes.js
│   ├── attendance.routes.js
│   ├── announcement.routes.js
│   ├── notification.routes.js
│   └── seed.routes.js
│
├── middleware/
│   └── auth.middleware.js # Guards — checks tokens and roles before allowing access
│
└── utils/
    └── notify.js          # Helper — creates notifications in the database
```

**The pattern used is MVC (Model-View-Controller):**
- **Model** — defines the data structure
- **Controller** — contains the logic
- **Route** — connects a URL to a controller function

The "View" is handled entirely by the React frontend.

---

## 4. How the Server Starts

**File:** `backend/server.js`

This is the first file that runs. It does the following in order:

1. **Loads environment variables** from `.env` (database URL, port, JWT secret)
2. **Creates the Express app** — the core web server object
3. **Registers global middleware:**
   - `CORS` — allows the frontend at `localhost:5173` to make requests
   - `express.json()` — parses incoming JSON request bodies so controllers can read them
4. **Mounts all route modules** — each feature gets its own URL prefix:
   - `/api/auth` → login and profile
   - `/api/users` → user management
   - `/api/courses` → course management
   - `/api/schedules` → class schedules
   - `/api/attendance` → attendance tracking
   - `/api/announcements` → announcements
   - `/api/notifications` → in-app notifications
   - `/api/seed` → sample data (disabled in production)
5. **Registers a global error handler** — catches any unhandled errors and returns a clean JSON error response
6. **Connects to MongoDB**, then starts listening for requests on the configured port

If the database connection fails, the server exits immediately rather than running in a broken state.

---

## 5. Database Connection

**File:** `backend/config/db.js`

A simple utility that calls `mongoose.connect()` using the `MONGO_URI` from the environment file. Mongoose handles the connection pool automatically — the rest of the application just uses models without worrying about the connection.

---

## 6. Data Models (Database Schemas)

Each model defines what a "document" (record) looks like in MongoDB. Think of each model as a table definition in a traditional database.

---

### 6.1 User

**File:** `backend/models/User.js`

Represents every person who can log in — admin, faculty, or student.

| Field | Type | Description |
|---|---|---|
| `firstName` | String | Required |
| `lastName` | String | Required |
| `email` | String | Unique, used for login |
| `password` | String | Stored as a bcrypt hash, never plain text |
| `role` | String | One of: `admin`, `faculty`, `student` |
| `studentId` | String | Optional, unique — only for students (e.g., STU-2024-001) |
| `department` | String | e.g., Computer Science |
| `isActive` | Boolean | Inactive users cannot log in |
| `isSuperAdmin` | Boolean | Only `admin@trophe.edu` — has unrestricted access |
| `permissions` | Array | Sub-admin only — lists which pages they can access |

**Key behaviors:**
- **Password hashing:** Before a user is saved, the password is automatically hashed using bcrypt (salt rounds: 10). The plain-text password is never stored.
- **`matchPassword()` method:** Used during login to compare the entered password against the stored hash.
- **`fullName` virtual:** A computed property that combines `firstName` and `lastName` — not stored in the database, generated on the fly.

---

### 6.2 Course

**File:** `backend/models/Course.js`

Represents an academic course offered in the system.

| Field | Type | Description |
|---|---|---|
| `courseCode` | String | Unique identifier, auto-uppercased (e.g., CS101) |
| `courseName` | String | Full name (e.g., Introduction to Programming) |
| `description` | String | Optional course description |
| `units` | Number | Credit units, between 1 and 6 |
| `type` | String | `lecture` or `laboratory` |
| `department` | String | Owning department |
| `faculty` | Reference → User | The assigned instructor |
| `students` | Array of References → User | All enrolled students |
| `isActive` | Boolean | Whether the course is currently active |

---

### 6.3 Schedule

**File:** `backend/models/Schedule.js`

Represents a single class meeting slot for a course.

| Field | Type | Description |
|---|---|---|
| `course` | Reference → Course | Which course this slot belongs to |
| `day` | String | Day of the week (Monday through Sunday) |
| `startTime` | String | 24-hour format, e.g., "08:00" |
| `endTime` | String | 24-hour format, e.g., "09:30" |
| `room` | String | Classroom or lab room name |
| `semester` | String | e.g., "1st Semester" |
| `schoolYear` | String | e.g., "2024-2025" |

A course can have multiple schedule entries (e.g., Monday and Wednesday).

---

### 6.4 Attendance

**File:** `backend/models/Attendance.js`

Records whether a student was present for a specific course on a specific date.

| Field | Type | Description |
|---|---|---|
| `student` | Reference → User | The student being tracked |
| `course` | Reference → Course | The course session |
| `date` | Date | The specific class date |
| `status` | String | One of: `present`, `absent`, `late`, `excused` |
| `markedBy` | Reference → User | The faculty or admin who recorded it |
| `remarks` | String | Optional notes |

**Important:** A unique index on `(student, course, date)` prevents duplicate records — you cannot mark the same student twice for the same course on the same day.

---

### 6.5 Announcement

**File:** `backend/models/Announcement.js`

A bulletin board post visible to specific user roles.

| Field | Type | Description |
|---|---|---|
| `title` | String | Announcement headline |
| `content` | String | Full announcement body |
| `author` | Reference → User | Who posted it |
| `targetRoles` | Array of Strings | Which roles can see it: admin, faculty, student |
| `isPinned` | Boolean | Pinned announcements appear at the top |
| `isActive` | Boolean | Soft delete — inactive announcements are hidden |

---

### 6.6 Notification

**File:** `backend/models/Notification.js`

An in-app notification sent to a specific user when something relevant happens.

| Field | Type | Description |
|---|---|---|
| `recipient` | Reference → User | Who receives this notification |
| `type` | String | Category of event (see below) |
| `title` | String | Short notification heading |
| `message` | String | Full notification text |
| `isRead` | Boolean | Whether the user has seen it |
| `link` | String | Optional frontend URL to navigate to when clicked |
| `meta` | Mixed | Extra data (e.g., courseId, scheduleId) for context |

**Notification types:**

| Type | When it is triggered |
|---|---|
| `schedule_created` | A new class schedule is added |
| `schedule_changed` | An existing schedule is updated or deleted |
| `instructor_assigned` | A faculty member is assigned to a course |
| `instructor_changed` | The instructor of a course is changed |
| `announcement` | A new announcement is posted |
| `enrollment` | A student is enrolled in a course |
| `unenrollment` | A student is removed from a course |
| `course_updated` | Course details are modified |
| `attendance_marked` | Attendance is recorded |

An index on `(recipient, isRead, createdAt)` makes fetching unread notifications fast.

---

## 7. Authentication and Security

**File:** `backend/middleware/auth.middleware.js`

Every protected endpoint requires the user to prove their identity. This is done using **JWT (JSON Web Tokens)**.

### How Login Works

1. User submits email and password to `POST /api/auth/login`
2. The server finds the user by email
3. bcrypt compares the submitted password to the stored hash
4. If they match and the account is active, the server generates a **JWT token** signed with a secret key
5. The token is returned to the frontend and stored (e.g., in localStorage)
6. Every subsequent request includes this token in the `Authorization` header: `Bearer <token>`

### The `protect` Middleware

Applied to every route that requires login. It:

1. Reads the `Authorization` header
2. Extracts the token after "Bearer "
3. Verifies the token's signature using `JWT_SECRET`
4. Decodes the user ID from the token
5. Fetches the full user record from the database
6. Checks that the user is still active
7. Attaches the user object to `req.user` so controllers can use it
8. If anything fails, returns `401 Unauthorized`

### The `authorize(...roles)` Middleware

Used after `protect` to restrict routes to specific roles. For example, `authorize('admin')` means only admins can proceed. Faculty or students get a `403 Forbidden` response.

### The `requirePermission(permission)` Middleware

A finer-grained check for sub-admins. The super admin always passes. Sub-admins must have the specific permission (e.g., `'courses'`, `'attendance'`) in their `permissions` array, otherwise they get `403 Forbidden`.

---

## 8. API Modules and Endpoints

Each module handles one feature area. All endpoints return JSON.

---

### 8.1 Authentication — `/api/auth`

Handles login and profile retrieval.

| Method | Endpoint | Access | What it does |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Validates credentials, returns user data + JWT token |
| GET | `/api/auth/me` | Logged in | Returns the current user's profile |

**Login response includes:** `_id`, `firstName`, `lastName`, `email`, `role`, `studentId`, `department`, `isSuperAdmin`, `permissions`, `token`

Note: There is no public registration endpoint in the routes — user accounts are created by admins through the Users module.

---

### 8.2 Users — `/api/users`

Admin-only user management.

| Method | Endpoint | Access | What it does |
|---|---|---|---|
| GET | `/api/users` | Admin | List all users. Can filter by `?role=student` |
| POST | `/api/users` | Admin | Create a new user account |
| GET | `/api/users/:id` | Admin | Get a single user's details |
| PUT | `/api/users/:id` | Admin | Update a user's information |
| DELETE | `/api/users/:id` | Admin | Delete a user account |
| GET | `/api/users/admin-permissions` | Super Admin | List all available sub-admin permissions |

**Business rules enforced:**
- Only the super admin can create, modify, or delete other admin accounts
- The super admin account (`isSuperAdmin: true`) cannot be deleted or modified by sub-admins
- Passwords are never returned in responses

---

### 8.3 Courses — `/api/courses`

Course catalog and enrollment management.

| Method | Endpoint | Access | What it does |
|---|---|---|---|
| GET | `/api/courses` | Logged in | List all courses with faculty and student details |
| POST | `/api/courses` | Admin | Create a new course |
| GET | `/api/courses/:id` | Logged in | Get a single course |
| PUT | `/api/courses/:id` | Admin | Update course details |
| DELETE | `/api/courses/:id` | Admin | Delete a course |
| POST | `/api/courses/:id/enroll` | Admin | Enroll a student in a course |
| POST | `/api/courses/:id/unenroll` | Admin | Remove a student from a course |
| GET | `/api/courses/my-courses` | Student | Get the logged-in student's enrolled courses |
| GET | `/api/courses/my-teaching` | Faculty | Get the courses the logged-in faculty teaches |

**Automatic notifications triggered:**
- When a student is enrolled → student receives an enrollment notification
- When a student is unenrolled → student receives an unenrollment notification
- When the instructor is changed → all enrolled students and the new faculty are notified

---

### 8.4 Schedules — `/api/schedules`

Class schedule management with conflict detection.

| Method | Endpoint | Access | What it does |
|---|---|---|---|
| GET | `/api/schedules` | Logged in | List all schedules sorted by day and time |
| POST | `/api/schedules` | Admin | Create a new schedule slot |
| GET | `/api/schedules/:id` | Logged in | Get a single schedule entry |
| PUT | `/api/schedules/:id` | Admin | Update a schedule entry |
| DELETE | `/api/schedules/:id` | Admin | Delete a schedule entry |
| GET | `/api/schedules/my-schedule` | Student | Get schedules for the student's enrolled courses |

**Conflict detection runs on every create and update** (see Section 10 for details).

**Automatic notifications triggered:**
- When a schedule is created → enrolled students and faculty are notified
- When a schedule is updated → affected users are notified with a summary of changes
- When a schedule is deleted → affected users are notified

---

### 8.5 Attendance — `/api/attendance`

Attendance recording and reporting.

| Method | Endpoint | Access | What it does |
|---|---|---|---|
| POST | `/api/attendance/mark` | Faculty, Admin | Mark attendance for multiple students at once |
| GET | `/api/attendance/course/:courseId` | Faculty, Admin | View all attendance records for a course |
| GET | `/api/attendance/my-attendance` | Student | View the logged-in student's attendance history |
| GET | `/api/attendance/summary/:studentId/:courseId` | Logged in | Get attendance statistics for a student in a course |

**Bulk marking:** The `mark` endpoint accepts an array of records `[{ studentId, status, remarks }]` for a given course and date. It uses "upsert" — if a record already exists for that student/course/date, it updates it; otherwise it creates a new one.

**Attendance summary returns:** `total`, `present`, `absent`, `late`, `excused`, and `percentage` (present + late counted as attended).

---

### 8.6 Announcements — `/api/announcements`

Campus-wide bulletin board.

| Method | Endpoint | Access | What it does |
|---|---|---|---|
| GET | `/api/announcements` | Logged in | Get announcements visible to the user's role |
| POST | `/api/announcements` | Admin, Faculty | Create a new announcement |
| PUT | `/api/announcements/:id` | Admin or Author | Update an announcement |
| DELETE | `/api/announcements/:id` | Admin or Author | Delete an announcement |

**Role-based visibility:** When fetching announcements, the system filters by `targetRoles`. A student only sees announcements that include `'student'` in their target. Admins see all active announcements regardless of target.

**Pinned announcements** always appear at the top of the list.

**Automatic notifications:** When an announcement is created, all active users whose role matches `targetRoles` receive an in-app notification (except the author).

---

### 8.7 Notifications — `/api/notifications`

In-app notification inbox for each user.

| Method | Endpoint | Access | What it does |
|---|---|---|---|
| GET | `/api/notifications` | Logged in | Get the user's last 50 notifications |
| GET | `/api/notifications/unread-count` | Logged in | Get the count of unread notifications |
| PUT | `/api/notifications/:id/read` | Logged in | Mark a single notification as read |
| PUT | `/api/notifications/mark-all-read` | Logged in | Mark all notifications as read |
| DELETE | `/api/notifications/:id` | Logged in | Delete a notification |

Users can only access their own notifications — the system always filters by `recipient: req.user._id`.

---

## 9. Notification System

**File:** `backend/utils/notify.js`

Rather than sending emails or SMS, the system uses an **in-app notification system**. Notifications are stored in the database and fetched by the frontend.

The `createNotifications()` utility function is called from controllers whenever a significant event occurs. It accepts either a single notification object or an array (for bulk creation), then inserts them all into the database at once using `insertMany()`.

**Design decision:** Notifications are treated as non-critical. If the notification insert fails for any reason, the error is logged but the original request still succeeds. This prevents a notification bug from breaking core features like enrollment or scheduling.

**Flow example — student enrollment:**
1. Admin calls `POST /api/courses/:id/enroll` with a student ID
2. The course controller adds the student to the course's `students` array
3. `createNotifications()` is called with a notification for that student
4. The student sees a bell icon badge on their next page load
5. Clicking the bell shows "You have been enrolled in CS101 — Introduction to Programming"

---

## 10. Schedule Conflict Detection

**File:** `backend/controllers/schedule.controller.js` — `checkConflicts()` function

Before any schedule is created or updated, the system runs a conflict check to prevent impossible or unfair scheduling situations.

**The four types of conflicts checked:**

### 1. Duplicate Course Slot
The same course cannot be scheduled twice on the same day at the same time.

### 2. Room Conflict
Two different courses cannot use the same room at the same time on the same day.
> Example: If CS101 is in Room 101 on Monday 8:00–9:30, no other course can be scheduled in Room 101 on Monday between 8:00 and 9:30.

### 3. Instructor Conflict
A faculty member cannot teach two courses simultaneously.
> Example: If Prof. Santos teaches CS101 on Monday 8:00–9:30, she cannot also be assigned to CS201 at the same time.

### 4. Student Conflict
If any student is enrolled in both courses, they cannot have overlapping schedules.
> Example: If Juan is enrolled in both CS101 and MATH101, those two courses cannot be scheduled at the same time.

**How overlap is detected:** The system uses a simple time comparison — two slots overlap if one starts before the other ends AND ends after the other starts. This works reliably with 24-hour "HH:MM" string format.

If a conflict is found, the API returns `409 Conflict` with a descriptive message explaining exactly what the conflict is, so the admin knows how to resolve it.

---

## 11. Role and Permission System

The system has three user roles with different levels of access:

### Student
- Can view their own enrolled courses
- Can view their own schedule
- Can view their own attendance records
- Can read announcements targeted to students
- Can manage their own notifications

### Faculty
- Everything a student can do, plus:
- Can view courses they are assigned to teach (with student lists)
- Can mark attendance for their courses
- Can create and manage their own announcements

### Admin
Admins have two tiers:

**Super Admin** (`isSuperAdmin: true`)
- Full unrestricted access to everything
- Only one super admin exists: `admin@trophe.edu`
- Can create, modify, and delete other admin accounts
- Can assign permissions to sub-admins

**Sub-Admin** (`isSuperAdmin: false`, has `permissions` array)
- Can only access the specific modules listed in their `permissions` array
- Available permissions: `users`, `courses`, `schedules`, `lab-schedules`, `attendance`, `announcements`
- Cannot modify the super admin account
- Cannot create or delete other admin accounts

This design allows the institution to delegate specific administrative tasks to staff members without giving them full system access.

---

## 12. Sample / Seed Data

**Files:** `backend/seed.js`, `backend/routes/seed.routes.js`

To make development and demonstration easier, the system includes a seed script that populates the database with realistic sample data.

**What gets created:**

| Type | Count | Details |
|---|---|---|
| Admin | 1 | admin@trophe.edu (Super Admin) |
| Faculty | 2 | Maria Santos (CS), Jose Reyes (Math) |
| Students | 3 | Juan Dela Cruz, Ana Gonzales, Carlos Mendoza |
| Courses | 4 | CS101, CS201, MATH101, CS301 |
| Schedules | 8 | 2 slots per course on different days |
| Announcements | 3 | Welcome message, midterm schedule, faculty meeting |

**Default credentials for demonstration:**

| Role | Email | Password |
|---|---|---|
| Super Admin | admin@trophe.edu | admin123 |
| Faculty | maria.santos@trophe.edu | faculty123 |
| Faculty | jose.reyes@trophe.edu | faculty123 |
| Student | juan.delacruz@trophe.edu | student123 |
| Student | ana.gonzales@trophe.edu | student123 |
| Student | carlos.mendoza@trophe.edu | student123 |

The seed can be run via `npm run seed` (script) or `GET /api/seed` (HTTP endpoint, disabled in production). **Warning: running the seed clears all existing data first.**

---

## 13. Environment Configuration

**File:** `backend/.env` (not committed to version control)

The backend reads sensitive configuration from environment variables:

| Variable | Purpose |
|---|---|
| `MONGO_URI` | MongoDB connection string (includes host, database name, credentials) |
| `PORT` | Port the server listens on (e.g., 5000) |
| `JWT_SECRET` | Secret key used to sign and verify JWT tokens |
| `FRONTEND_URL` | Allowed CORS origin (e.g., http://localhost:5173) |
| `NODE_ENV` | Environment mode (`development` or `production`) |
| `ENABLE_SEED` | Set to `true` to enable the seed endpoint in production |

Keeping these values out of the source code means the same codebase can run in development, staging, and production with different databases and secrets.

---

## 14. Request Flow — End to End

Here is a complete walkthrough of what happens when a faculty member marks attendance:

```
Faculty clicks "Mark Attendance" in the browser
        |
        v
Frontend sends: POST /api/attendance/mark
  Headers: { Authorization: "Bearer eyJhbGci..." }
  Body:    { courseId: "...", date: "2024-10-01", records: [...] }
        |
        v
Express receives the request and routes it to attendance.routes.js
        |
        v
[Middleware 1] protect() runs:
  - Extracts token from Authorization header
  - Verifies token signature with JWT_SECRET
  - Looks up user in database
  - Confirms user is active
  - Attaches user to req.user
        |
        v
[Middleware 2] authorize('admin', 'faculty') runs:
  - Checks req.user.role is 'admin' or 'faculty'
  - Faculty passes, students would be rejected here
        |
        v
markAttendance() controller runs:
  - Reads courseId, date, records from req.body
  - Loops through each student record
  - For each: findOneAndUpdate with upsert=true
    (creates new record or updates existing one)
  - Returns all saved records
        |
        v
Response: 201 Created
  { message: "Attendance marked successfully", results: [...] }
        |
        v
Frontend receives response and updates the UI
```

This same pattern applies to every endpoint in the system — request comes in, middleware validates identity and role, controller executes business logic, response goes back.

---

*Documentation generated for the Trophe Smart Campus Management System — Backend v1.0.0*

