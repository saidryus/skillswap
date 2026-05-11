# API Documentation
## Trophe — Smart Campus Management System

**Base URL:** `http://localhost:5000/api`
**Authentication:** Bearer Token (JWT) — include in `Authorization` header for all protected routes
**Date:** April 28, 2026

---

## What is an API?

**API** stands for **Application Programming Interface**. In simple terms, it is a set of rules that allows two software systems to talk to each other.

In this system, the **frontend** (the web pages the user sees) and the **backend** (the server that stores and processes data) are two separate programs. They communicate through this API. The frontend sends a **request** to a specific URL, and the backend sends back a **response** — usually data in JSON format.

Think of it like a restaurant:
- The **frontend** is the customer
- The **API** is the menu and the waiter
- The **backend** is the kitchen
- The **database** is the pantry

The customer never goes into the kitchen directly. They order through the waiter (API), the kitchen prepares it, and the waiter brings it back.

---

## What is REST?

This API follows the **REST** (Representational State Transfer) architectural style. REST is a standard way of designing APIs that uses HTTP — the same protocol used by web browsers.

REST APIs are organized around **resources** (things like users, courses, schedules) and use standard **HTTP methods** to perform actions on them:

| HTTP Method | What it means | Real-world analogy |
|---|---|---|
| **GET** | Retrieve / read data | Looking something up |
| **POST** | Create new data | Filling out a form and submitting it |
| **PUT** | Update existing data | Editing a saved record |
| **DELETE** | Remove data | Deleting a record |

---

## How Authentication Works

Most endpoints in this API are **protected** — only logged-in users can access them. The system uses **JWT (JSON Web Token)** authentication.

### Step-by-step:

1. The user submits their email and password to `POST /api/auth/login`
2. The server verifies the credentials against the database
3. If correct, the server generates a **JWT token** — a digitally signed string that encodes the user's ID
4. The frontend stores this token and includes it in every subsequent request inside the `Authorization` header:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
5. The server reads the token, verifies its signature, and identifies who is making the request
6. The token expires after **7 days**, after which the user must log in again

### Why JWT instead of passwords every time?

Sending the password on every request would be a security risk. The token is a short-lived, signed credential — even if intercepted, it cannot be used to change the password or generate new tokens.

---

## User Roles and Access Levels

The system has three roles, each with different permissions:

| Role | Who they are | What they can do |
|---|---|---|
| **admin** | System administrator | Full access — manage users, courses, schedules, attendance, announcements |
| **faculty** | Teaching staff | View their courses and students, mark attendance, post announcements |
| **student** | Enrolled students | View their own courses, schedule, attendance, and announcements |

There are also two tiers of admin:
- **Super Admin** — one account (`admin@trophe.edu`) with unrestricted access, can manage other admins
- **Sub-Admin** — admin accounts with restricted access to specific modules only

---

## Understanding the Response Format

All responses are in **JSON** (JavaScript Object Notation) — a lightweight, human-readable data format.

**Successful response example:**
```json
{
  "_id": "6614a1b2c3d4e5f6a7b8c9d0",
  "firstName": "Juan",
  "lastName": "Dela Cruz",
  "role": "student"
}
```

**Error response example:**
```json
{
  "message": "Invalid email or password"
}
```

### HTTP Status Codes

Every response includes a **status code** — a 3-digit number that tells the frontend whether the request succeeded or failed:

| Code | Name | Meaning |
|---|---|---|
| **200** | OK | Request succeeded, data returned |
| **201** | Created | New record was successfully created |
| **400** | Bad Request | The request had invalid or missing data |
| **401** | Unauthorized | No token provided, or token is invalid/expired |
| **403** | Forbidden | Token is valid but the user does not have permission |
| **404** | Not Found | The requested resource does not exist |
| **409** | Conflict | The request conflicts with existing data (e.g., schedule overlap) |
| **500** | Internal Server Error | Something went wrong on the server side |

---

## Table of Contents

1. [Authentication Endpoints](#1-authentication-endpoints)
2. [User Management Endpoints](#2-user-management-endpoints)
3. [Course Management Endpoints](#3-course-management-endpoints)
4. [Schedule Management Endpoints](#4-schedule-management-endpoints)
5. [Attendance Endpoints](#5-attendance-endpoints)
6. [Announcement Endpoints](#6-announcement-endpoints)
7. [Notification Endpoints](#7-notification-endpoints)
8. [Summary Table](#8-summary-table)

---
## 1. Authentication Endpoints

> **What this module does:** Handles login and lets the frontend know who the current user is. Every other feature in the system depends on this — without a valid token from login, no other endpoint will respond.

| # | Endpoint | Method | Access | Description | Status Code |
|---|---|---|---|---|---|
| 1 | `/api/auth/login` | POST | Public | Authenticate user and receive JWT token | 200 OK |
| 2 | `/api/auth/me` | GET | Private | Get current authenticated user profile | 200 OK |

---

### 1.1 Login

**POST** `/api/auth/login`
**Access:** Public — no token required

**When is this called?**
Every time a user submits the login form. The frontend sends the email and password, and if valid, receives a token it will use for all future requests during that session.

**What the server checks:**
1. Finds the user by email in the database
2. Uses bcrypt to compare the submitted password against the stored hash
3. Checks that the account is active (`isActive: true`)
4. If all pass, generates and returns a JWT token

**Request Body:**
```json
{
  "email": "admin@trophe.edu",
  "password": "admin123"
}
```

**Success Response — 200 OK:**
```json
{
  "_id": "6614a1b2c3d4e5f6a7b8c9d0",
  "firstName": "Admin",
  "lastName": "Trophe",
  "email": "admin@trophe.edu",
  "role": "admin",
  "department": "Administration",
  "isSuperAdmin": true,
  "permissions": [],
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

> The `token` field is what the frontend stores and attaches to every future request. The `role` field tells the frontend which dashboard to redirect to (admin, faculty, or student).

**Error — 401 Unauthorized** (wrong email or password):
```json
{ "message": "Invalid email or password" }
```

**Error — 403 Forbidden** (account disabled by admin):
```json
{ "message": "Account is deactivated. Contact admin." }
```

---

### 1.2 Get Current User

**GET** `/api/auth/me`
**Access:** Private (requires token)

**When is this called?**
When the app loads or refreshes. The frontend checks if the stored token is still valid and retrieves the latest user profile (in case role or permissions changed since last login).

**Headers required:**
```
Authorization: Bearer {token}
```

**Success Response — 200 OK:**
```json
{
  "_id": "6614a1b2c3d4e5f6a7b8c9d0",
  "firstName": "Admin",
  "lastName": "Trophe",
  "email": "admin@trophe.edu",
  "role": "admin",
  "department": "Administration",
  "isActive": true,
  "isSuperAdmin": true,
  "permissions": []
}
```

---

## 2. User Management Endpoints

> **What this module does:** Allows admins to create and manage all user accounts in the system — students, faculty, and other admins. This is how new users get access to the platform.

> **Access:** All endpoints require Admin role. Sub-admins need the `users` permission.

| # | Endpoint | Method | Access | Description | Status Code |
|---|---|---|---|---|---|
| 1 | `/api/users` | GET | Admin | Get all users (filterable by `?role=`) | 200 OK |
| 2 | `/api/users/:id` | GET | Admin | Get a single user by ID | 200 OK |
| 3 | `/api/users` | POST | Admin | Create a new user account | 201 Created |
| 4 | `/api/users/:id` | PUT | Admin | Update user information | 200 OK |
| 5 | `/api/users/:id` | DELETE | Admin | Delete a user account | 200 OK |
| 6 | `/api/users/admin-permissions` | GET | Super Admin | List all available sub-admin permissions | 200 OK |

---

### 2.1 Get All Users

**GET** `/api/users`
**Access:** Admin only

**When is this called?**
When the admin opens the Users page. The frontend fetches the full list to display in the table. The `?role=` filter is used when the admin wants to see only students or only faculty.

**Query Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `role` | string | No | Filter by role: `admin`, `faculty`, or `student` |

**Example:** `GET /api/users?role=student`

**Success Response — 200 OK:**
```json
[
  {
    "_id": "6614a1b2c3d4e5f6a7b8c9d1",
    "firstName": "Juan",
    "lastName": "Dela Cruz",
    "email": "juan.delacruz@trophe.edu",
    "role": "student",
    "studentId": "STU-2024-001",
    "department": "Computer Science",
    "isActive": true,
    "createdAt": "2024-10-01T00:00:00.000Z"
  }
]
```

> Passwords are never included in any user response.

---

### 2.2 Get User by ID

**GET** `/api/users/:id`
**Access:** Admin only

**When is this called?**
When the admin clicks on a specific user to view or edit their details.

**URL Parameter:** `:id` — the unique MongoDB ID of the user (e.g., `6614a1b2c3d4e5f6a7b8c9d1`)

**Success Response — 200 OK:** Single user object (same structure as above)

**Error — 404 Not Found:**
```json
{ "message": "User not found" }
```

---

### 2.3 Create User

**POST** `/api/users`
**Access:** Admin only (Super Admin required to create other admins)

**When is this called?**
When the admin fills out the "Add User" form and submits it. This is the only way to create accounts — there is no public self-registration.

**Business rules enforced:**
- Email must be unique across all users
- Only the Super Admin can create accounts with `role: "admin"`
- If creating a sub-admin, a `permissions` array can be provided to restrict their access

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `firstName` | string | Yes | User's first name |
| `lastName` | string | Yes | User's last name |
| `email` | string | Yes | Must be unique — used for login |
| `password` | string | Yes | Minimum 6 characters, stored as a hash |
| `role` | string | Yes | `admin`, `faculty`, or `student` |
| `department` | string | No | Department name |
| `studentId` | string | No | Student ID number (for students only) |
| `permissions` | array | No | For sub-admins only — list of accessible modules |

```json
{
  "firstName": "Maria",
  "lastName": "Santos",
  "email": "maria.santos@trophe.edu",
  "password": "faculty123",
  "role": "faculty",
  "department": "Computer Science"
}
```

**Success Response — 201 Created:** The newly created user object (without password)

**Error — 400 Bad Request** (duplicate email):
```json
{ "message": "Email already in use" }
```

**Error — 403 Forbidden** (sub-admin trying to create an admin):
```json
{ "message": "Only the super admin can create admin accounts" }
```

---

### 2.4 Update User

**PUT** `/api/users/:id`
**Access:** Admin only

**When is this called?**
When the admin edits a user's profile — changing their department, deactivating their account, resetting their password, or updating their name.

**Business rules enforced:**
- The Super Admin account cannot be modified by sub-admins
- Only the Super Admin can change another admin's role or permissions
- Setting `isActive: false` prevents the user from logging in

**Request Body:** Any subset of user fields to update:
```json
{
  "department": "Information Technology",
  "isActive": false
}
```

**Success Response — 200 OK:** The updated user object

---

### 2.5 Delete User

**DELETE** `/api/users/:id`
**Access:** Admin only

**When is this called?**
When the admin permanently removes a user account from the system.

**Business rules enforced:**
- The Super Admin account (`isSuperAdmin: true`) can never be deleted
- Sub-admins cannot delete other admin accounts

**Success Response — 200 OK:**
```json
{ "message": "User deleted successfully" }
```

**Error — 403 Forbidden:**
```json
{ "message": "Cannot delete the super admin account" }
```

---

### 2.6 Get Admin Permissions List

**GET** `/api/users/admin-permissions`
**Access:** Super Admin only

**When is this called?**
When the Super Admin opens the form to create or edit a sub-admin account. The frontend fetches this list to populate the permissions checkboxes.

**Success Response — 200 OK:**
```json
{
  "permissions": ["users", "courses", "schedules", "lab-schedules", "attendance", "announcements"]
}
```

---

## 3. Course Management Endpoints

> **What this module does:** Manages the academic course catalog — creating courses, assigning faculty, and enrolling or removing students. Courses are the central entity that connects faculty, students, schedules, and attendance together.

| # | Endpoint | Method | Access | Description | Status Code |
|---|---|---|---|---|---|
| 1 | `/api/courses` | GET | All roles | Get all courses with faculty and student details | 200 OK |
| 2 | `/api/courses/my-courses` | GET | Student | Get courses the logged-in student is enrolled in | 200 OK |
| 3 | `/api/courses/my-teaching` | GET | Faculty | Get courses assigned to the logged-in faculty | 200 OK |
| 4 | `/api/courses/:id` | GET | All roles | Get a single course by ID | 200 OK |
| 5 | `/api/courses` | POST | Admin | Create a new course | 201 Created |
| 6 | `/api/courses/:id` | PUT | Admin | Update course details | 200 OK |
| 7 | `/api/courses/:id` | DELETE | Admin | Delete a course | 200 OK |
| 8 | `/api/courses/:id/enroll` | POST | Admin | Enroll a student in a course | 200 OK |
| 9 | `/api/courses/:id/unenroll` | POST | Admin | Remove a student from a course | 200 OK |

---

### 3.1 Get All Courses

**GET** `/api/courses`
**Access:** All authenticated roles

**When is this called?**
When the admin opens the Courses page, or when the Schedule Planner loads to populate the course list for drag-and-drop. Returns full details including the assigned faculty and all enrolled students.

**Success Response — 200 OK:**
```json
[
  {
    "_id": "6614a1b2c3d4e5f6a7b8c9d0",
    "courseCode": "CS101",
    "courseName": "Introduction to Programming",
    "description": "Fundamentals of programming using Python",
    "units": 3,
    "type": "lecture",
    "department": "Computer Science",
    "faculty": {
      "_id": "6614a1b2c3d4e5f6a7b8c9d2",
      "firstName": "Maria",
      "lastName": "Santos",
      "email": "maria.santos@trophe.edu"
    },
    "students": [
      { "_id": "...", "firstName": "Juan", "lastName": "Dela Cruz", "studentId": "STU-2024-001" }
    ],
    "isActive": true
  }
]
```

---

### 3.2 Get My Courses (Student)

**GET** `/api/courses/my-courses`
**Access:** Student only

**When is this called?**
When a student opens their Courses page. Returns only the courses that student is enrolled in, not the full catalog.

**Success Response — 200 OK:** Array of course objects (same structure, filtered to enrolled courses only)

---

### 3.3 Get My Teaching Courses (Faculty)

**GET** `/api/courses/my-teaching`
**Access:** Faculty only

**When is this called?**
When a faculty member opens their Courses page. Returns only the courses assigned to that faculty, with the full student roster for each.

**Success Response — 200 OK:** Array of course objects with populated student lists

---

### 3.4 Get Course by ID

**GET** `/api/courses/:id`
**Access:** All authenticated roles

**When is this called?**
When the system needs the full details of one specific course — for example, when opening a course detail view or when the attendance page loads a course's student list.

**Success Response — 200 OK:** Single course object with populated faculty and students

**Error — 404 Not Found:**
```json
{ "message": "Course not found" }
```

---

### 3.5 Create Course

**POST** `/api/courses`
**Access:** Admin only

**When is this called?**
When the admin fills out the "Add Course" form. The course code must be unique across the system.

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `courseCode` | string | Yes | Unique identifier, auto-uppercased (e.g., `CS101`) |
| `courseName` | string | Yes | Full descriptive name |
| `description` | string | No | Brief course description |
| `units` | number | Yes | Credit units, between 1 and 6 |
| `type` | string | No | `lecture` (default) or `laboratory` |
| `department` | string | No | Owning department |
| `faculty` | string | No | MongoDB ObjectId of the assigned faculty member |

```json
{
  "courseCode": "CS101",
  "courseName": "Introduction to Programming",
  "description": "Fundamentals of programming using Python",
  "units": 3,
  "type": "lecture",
  "department": "Computer Science",
  "faculty": "6614a1b2c3d4e5f6a7b8c9d2"
}
```

**Success Response — 201 Created:** The newly created course object

**Error — 400 Bad Request:**
```json
{ "message": "Course code already exists" }
```

---

### 3.6 Update Course

**PUT** `/api/courses/:id`
**Access:** Admin only

**When is this called?**
When the admin edits a course — changing its name, units, type, or reassigning the faculty.

**Automatic notifications triggered:**
- If the `faculty` field changes to a different instructor, all enrolled students receive a notification: *"The instructor for CS101 has been changed to [new name]."*
- The newly assigned faculty member also receives a notification: *"You have been assigned as the instructor for CS101."*

```json
{
  "courseName": "Introduction to Programming (Python)",
  "faculty": "6614a1b2c3d4e5f6a7b8c9d3"
}
```

**Success Response — 200 OK:** The updated course object

---

### 3.7 Delete Course

**DELETE** `/api/courses/:id`
**Access:** Admin only

**When is this called?**
When the admin permanently removes a course from the system.

**Success Response — 200 OK:**
```json
{ "message": "Course deleted successfully" }
```

---

### 3.8 Enroll Student

**POST** `/api/courses/:id/enroll`
**Access:** Admin only

**When is this called?**
When the admin adds a student to a course from the enrollment management interface.

**Automatic notification:** The enrolled student receives: *"You have been enrolled in CS101 — Introduction to Programming."*

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `studentId` | string | Yes | MongoDB ObjectId of the student to enroll |

```json
{ "studentId": "6614a1b2c3d4e5f6a7b8c9d5" }
```

**Success Response — 200 OK:**
```json
{
  "message": "Student enrolled successfully",
  "course": { ... }
}
```

**Error — 400 Bad Request** (already enrolled):
```json
{ "message": "Student already enrolled" }
```

---

### 3.9 Unenroll Student

**POST** `/api/courses/:id/unenroll`
**Access:** Admin only

**When is this called?**
When the admin removes a student from a course.

**Automatic notification:** The student receives: *"You have been removed from CS101 — Introduction to Programming."*

```json
{ "studentId": "6614a1b2c3d4e5f6a7b8c9d5" }
```

**Success Response — 200 OK:**
```json
{
  "message": "Student removed successfully",
  "course": { ... }
}
```

---
## 4. Schedule Management Endpoints

> **What this module does:** Manages the weekly class schedule for all courses. This is the most complex module — every create and update operation runs a four-layer conflict detection check before saving, ensuring no two classes can ever be double-booked for the same room, instructor, or student.

> The **Schedule Planner** page in the admin dashboard is a visual drag-and-drop interface built on top of these endpoints. When an admin drags a course card onto the grid and confirms the placement, it calls `POST /api/schedules`. The grid itself is built by reading `GET /api/schedules`.

| # | Endpoint | Method | Access | Description | Status Code |
|---|---|---|---|---|---|
| 1 | `/api/schedules` | GET | All roles | Get all schedules sorted by day and time | 200 OK |
| 2 | `/api/schedules/my-schedule` | GET | Student | Get schedules for the student's enrolled courses only | 200 OK |
| 3 | `/api/schedules/:id` | GET | All roles | Get a single schedule entry by ID | 200 OK |
| 4 | `/api/schedules` | POST | Admin | Create a new schedule slot (with conflict detection) | 201 Created |
| 5 | `/api/schedules/:id` | PUT | Admin | Update a schedule slot (with conflict detection) | 200 OK |
| 6 | `/api/schedules/:id` | DELETE | Admin | Delete a schedule slot | 200 OK |

---

### 4.1 Get All Schedules

**GET** `/api/schedules`
**Access:** All authenticated roles

**When is this called?**
When the Schedule Planner page loads. The frontend fetches all schedules to render the existing blocks on the weekly grid. Also used by the admin's full schedule overview.

**Success Response — 200 OK:**
```json
[
  {
    "_id": "6614a1b2c3d4e5f6a7b8c9e0",
    "course": {
      "_id": "6614a1b2c3d4e5f6a7b8c9d0",
      "courseCode": "CS101",
      "courseName": "Introduction to Programming",
      "faculty": { "firstName": "Maria", "lastName": "Santos" }
    },
    "day": "Monday",
    "startTime": "08:00",
    "endTime": "09:30",
    "room": "Room 101",
    "semester": "1st Semester",
    "schoolYear": "2024-2025"
  }
]
```

---

### 4.2 Get My Schedule (Student)

**GET** `/api/schedules/my-schedule`
**Access:** Student only

**When is this called?**
When a student opens their Schedule page. The backend finds all courses the student is enrolled in, then returns only the schedule entries for those courses — so students only see their own timetable.

**Success Response — 200 OK:** Array of schedule objects (same structure, filtered to the student's enrolled courses)

---

### 4.3 Get Schedule by ID

**GET** `/api/schedules/:id`
**Access:** All authenticated roles

**Success Response — 200 OK:** Single schedule object with populated course details

**Error — 404 Not Found:**
```json
{ "message": "Schedule not found" }
```

---

### 4.4 Create Schedule

**POST** `/api/schedules`
**Access:** Admin only

**When is this called?**
When the admin drops a course card onto the weekly grid and confirms the placement in the modal (choosing duration and room). This is the endpoint that actually saves the schedule to the database.

**Conflict Detection — runs before saving:**

Before creating the schedule, the system checks all existing schedules on the same day for four types of conflicts:

| Conflict Type | What it checks | Example |
|---|---|---|
| `course` | Same course scheduled twice in the same time slot | CS101 already has Monday 8:00–9:30 |
| `room` | Two courses using the same room at the same time | Room 101 is already booked Monday 8:00–9:30 |
| `instructor` | Same faculty teaching two courses simultaneously | Prof. Santos already teaches CS201 at that time |
| `student` | A student enrolled in both courses at the same time | Juan is in both CS101 and MATH101 which overlap |

If any conflict is found, the schedule is **not saved** and a `409 Conflict` response is returned with a descriptive message.

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `course` | string | Yes | MongoDB ObjectId of the course to schedule |
| `day` | string | Yes | Day of the week: `Monday` through `Sunday` |
| `startTime` | string | Yes | 24-hour format, e.g. `"08:00"` |
| `endTime` | string | Yes | 24-hour format, e.g. `"09:30"` |
| `room` | string | No | Room name or number |
| `semester` | string | No | e.g. `"1st Semester"` |
| `schoolYear` | string | No | e.g. `"2024-2025"` |

```json
{
  "course": "6614a1b2c3d4e5f6a7b8c9d0",
  "day": "Monday",
  "startTime": "08:00",
  "endTime": "09:30",
  "room": "Room 101",
  "semester": "1st Semester",
  "schoolYear": "2024-2025"
}
```

**Success Response — 201 Created:** The newly created schedule object

**Automatic notifications:** All enrolled students and the assigned faculty receive: *"A new schedule has been added for CS101 — Monday 08:00–09:30 in Room 101."*

**Error — 409 Conflict (Room):**
```json
{
  "message": "Room \"Room 101\" is already occupied on Monday from 08:00–09:30 by CS102.",
  "conflictType": "room"
}
```

**Error — 409 Conflict (Instructor):**
```json
{
  "message": "Instructor Maria Santos is already teaching CS102 on Monday from 08:00–09:30.",
  "conflictType": "instructor"
}
```

**Error — 409 Conflict (Student):**
```json
{
  "message": "One or more students are enrolled in both CS101 and CS102, which overlap on Monday from 08:00–09:30.",
  "conflictType": "student"
}
```

---

### 4.5 Update Schedule

**PUT** `/api/schedules/:id`
**Access:** Admin only

**When is this called?**
When the admin edits an existing schedule entry — changing the time, room, or day.

**Conflict detection runs on update as well**, but excludes the schedule being updated itself (so it does not conflict with its own current slot).

**Automatic notifications:** If the day, time, or room changes, all enrolled students and the faculty receive a change notification listing exactly what changed: *"Schedule for CS101 has been updated: day → Tuesday, start → 10:00."*

```json
{
  "room": "Room 202",
  "startTime": "10:00",
  "endTime": "11:30"
}
```

**Success Response — 200 OK:** The updated schedule object

---

### 4.6 Delete Schedule

**DELETE** `/api/schedules/:id`
**Access:** Admin only

**When is this called?**
When the admin clicks the × button on a schedule block in the planner grid.

**Automatic notifications:** All enrolled students and the faculty receive: *"The Monday 08:00–09:30 schedule for CS101 has been removed."*

**Success Response — 200 OK:**
```json
{ "message": "Schedule deleted successfully" }
```

---

## 5. Attendance Endpoints

> **What this module does:** Records and retrieves student attendance for each course session. Faculty mark attendance in bulk for an entire class at once. Students can view their own attendance history and statistics.

| # | Endpoint | Method | Access | Description | Status Code |
|---|---|---|---|---|---|
| 1 | `/api/attendance/mark` | POST | Admin, Faculty | Bulk mark attendance for a course on a date | 201 Created |
| 2 | `/api/attendance/my-attendance` | GET | Student | Get the logged-in student's full attendance history | 200 OK |
| 3 | `/api/attendance/course/:courseId` | GET | Admin, Faculty | Get all attendance records for a course | 200 OK |
| 4 | `/api/attendance/summary/:studentId/:courseId` | GET | All roles | Get attendance statistics for a student in a course | 200 OK |

---

### 5.1 Mark Attendance (Bulk)

**POST** `/api/attendance/mark`
**Access:** Admin, Faculty

**When is this called?**
When a faculty member opens the Attendance page for one of their courses, selects a date, sets each student's status, and clicks "Save". The entire class list is submitted in one request.

**How upsert works:**
The system uses "upsert" (update or insert). If an attendance record already exists for a given student + course + date combination, it updates it. If not, it creates a new one. This means faculty can safely re-submit attendance to correct mistakes without creating duplicates.

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `courseId` | string | Yes | MongoDB ObjectId of the course |
| `date` | string | Yes | The class date in ISO format, e.g. `"2026-04-23"` |
| `records` | array | Yes | One entry per student |
| `records[].studentId` | string | Yes | MongoDB ObjectId of the student |
| `records[].status` | string | Yes | `present`, `absent`, `late`, or `excused` |
| `records[].remarks` | string | No | Optional notes (e.g., reason for absence) |

```json
{
  "courseId": "6614a1b2c3d4e5f6a7b8c9d0",
  "date": "2026-04-23",
  "records": [
    { "studentId": "6614a1b2c3d4e5f6a7b8c9d1", "status": "present", "remarks": "" },
    { "studentId": "6614a1b2c3d4e5f6a7b8c9d2", "status": "late", "remarks": "Arrived 10 minutes late" },
    { "studentId": "6614a1b2c3d4e5f6a7b8c9d3", "status": "absent", "remarks": "No notice" }
  ]
}
```

**Success Response — 201 Created:**
```json
{
  "message": "Attendance marked successfully",
  "results": [
    { "_id": "...", "student": "...", "course": "...", "date": "2026-04-23T00:00:00.000Z", "status": "present" },
    { "_id": "...", "student": "...", "course": "...", "date": "2026-04-23T00:00:00.000Z", "status": "late" }
  ]
}
```

---

### 5.2 Get My Attendance (Student)

**GET** `/api/attendance/my-attendance`
**Access:** Student only

**When is this called?**
When a student opens their Attendance page to review their attendance history across all courses.

**Success Response — 200 OK:**
```json
[
  {
    "_id": "...",
    "course": { "courseCode": "CS101", "courseName": "Introduction to Programming" },
    "date": "2026-04-23T00:00:00.000Z",
    "status": "present",
    "remarks": ""
  },
  {
    "_id": "...",
    "course": { "courseCode": "MATH101", "courseName": "Calculus I" },
    "date": "2026-04-22T00:00:00.000Z",
    "status": "absent",
    "remarks": "No notice"
  }
]
```

---

### 5.3 Get Course Attendance

**GET** `/api/attendance/course/:courseId`
**Access:** Admin, Faculty

**When is this called?**
When a faculty member opens the attendance records for one of their courses. Can be filtered by a specific date to see who was present on a particular day.

**Query Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `date` | string | No | Filter to a specific date, e.g. `?date=2026-04-23` |

**Example:** `GET /api/attendance/course/6614a1b2c3d4e5f6a7b8c9d0?date=2026-04-23`

**Success Response — 200 OK:**
```json
[
  {
    "_id": "...",
    "student": { "firstName": "Juan", "lastName": "Dela Cruz", "studentId": "STU-2024-001" },
    "course": { "courseCode": "CS101", "courseName": "Introduction to Programming" },
    "date": "2026-04-23T00:00:00.000Z",
    "status": "present",
    "markedBy": "6614a1b2c3d4e5f6a7b8c9d2",
    "remarks": ""
  }
]
```

---

### 5.4 Get Attendance Summary

**GET** `/api/attendance/summary/:studentId/:courseId`
**Access:** All authenticated roles

**When is this called?**
When the system needs to display a student's attendance statistics for a specific course — for example, on the student's dashboard or in the faculty's attendance report view.

**How percentage is calculated:**
`percentage = (present + late) / total × 100`

Both `present` and `late` count as attended. Only `absent` and `excused` do not count toward the percentage.

**Success Response — 200 OK:**
```json
{
  "total": 20,
  "present": 16,
  "absent": 2,
  "late": 1,
  "excused": 1,
  "percentage": "85.00"
}
```

---

## 6. Announcement Endpoints

> **What this module does:** Manages the campus bulletin board. Admins and faculty can post announcements targeted to specific user groups. The system automatically sends in-app notifications to all affected users when a new announcement is posted.

| # | Endpoint | Method | Access | Description | Status Code |
|---|---|---|---|---|---|
| 1 | `/api/announcements` | GET | All roles | Get announcements visible to the current user's role | 200 OK |
| 2 | `/api/announcements` | POST | Admin, Faculty | Create a new announcement | 201 Created |
| 3 | `/api/announcements/:id` | PUT | Admin or Author | Update an announcement | 200 OK |
| 4 | `/api/announcements/:id` | DELETE | Admin or Author | Delete an announcement | 200 OK |

---

### 6.1 Get Announcements

**GET** `/api/announcements`
**Access:** All authenticated roles

**When is this called?**
When any user opens the Announcements page. The backend automatically filters results based on who is asking:
- **Admin** sees all active announcements regardless of target
- **Faculty** sees only announcements where `targetRoles` includes `"faculty"`
- **Student** sees only announcements where `targetRoles` includes `"student"`

Pinned announcements always appear first, then sorted by newest.

**Success Response — 200 OK:**
```json
[
  {
    "_id": "...",
    "title": "Welcome to Trophe Campus System",
    "content": "Welcome to the new Smart Campus Management System...",
    "author": { "firstName": "Admin", "lastName": "Trophe", "role": "admin" },
    "targetRoles": ["admin", "faculty", "student"],
    "isPinned": true,
    "isActive": true,
    "createdAt": "2024-10-01T00:00:00.000Z"
  }
]
```

---

### 6.2 Create Announcement

**POST** `/api/announcements`
**Access:** Admin, Faculty

**When is this called?**
When an admin or faculty member fills out the "Post Announcement" form and submits it.

**Automatic notifications:** After saving, the system finds all active users whose role is in `targetRoles` (excluding the author) and sends each of them an in-app notification: *"New Announcement: '[title]' — posted by [author name]."*

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | string | Yes | Short announcement headline |
| `content` | string | Yes | Full announcement body text |
| `targetRoles` | array | No | Which roles can see it. Defaults to all: `["admin", "faculty", "student"]` |
| `isPinned` | boolean | No | Whether to pin to the top. Defaults to `false` |

```json
{
  "title": "Midterm Examination Schedule",
  "content": "Midterm examinations will be held from October 14-18, 2026. Please check your respective schedules.",
  "targetRoles": ["faculty", "student"],
  "isPinned": true
}
```

**Success Response — 201 Created:** The newly created announcement object

---

### 6.3 Update Announcement

**PUT** `/api/announcements/:id`
**Access:** Admin, or the Faculty member who originally posted it

**When is this called?**
When the author needs to correct or update an announcement — for example, rescheduling an event.

**Authorization rule:** Faculty can only edit their own announcements. Admins can edit any announcement.

```json
{
  "content": "Updated: Midterm examinations rescheduled to October 21-25, 2026.",
  "isPinned": false
}
```

**Success Response — 200 OK:** The updated announcement object

**Error — 403 Forbidden** (faculty trying to edit someone else's announcement):
```json
{ "message": "Not authorized to update this announcement" }
```

---

### 6.4 Delete Announcement

**DELETE** `/api/announcements/:id`
**Access:** Admin, or the Faculty member who originally posted it

**When is this called?**
When an announcement is no longer relevant and needs to be removed.

**Success Response — 200 OK:**
```json
{ "message": "Announcement deleted successfully" }
```

---

## 7. Notification Endpoints

> **What this module does:** Manages the in-app notification inbox for each user. Notifications are created automatically by the system when significant events occur (enrollment, schedule changes, new announcements, etc.). Users can read, mark as read, and delete their own notifications.

> **Important:** Users can only access their own notifications. The system always filters by the logged-in user's ID — there is no way to read another user's notifications.

| # | Endpoint | Method | Access | Description | Status Code |
|---|---|---|---|---|---|
| 1 | `/api/notifications` | GET | All roles | Get the last 50 notifications for the current user | 200 OK |
| 2 | `/api/notifications/unread-count` | GET | All roles | Get the count of unread notifications | 200 OK |
| 3 | `/api/notifications/mark-all-read` | PUT | All roles | Mark all notifications as read | 200 OK |
| 4 | `/api/notifications/:id/read` | PUT | All roles | Mark a single notification as read | 200 OK |
| 5 | `/api/notifications/:id` | DELETE | All roles | Delete a notification | 200 OK |

---

### 7.1 Get Notifications

**GET** `/api/notifications`
**Access:** All authenticated roles

**When is this called?**
When the user clicks the notification bell icon in the top bar. Returns the 50 most recent notifications for the logged-in user, sorted newest first.

**Success Response — 200 OK:**
```json
[
  {
    "_id": "...",
    "type": "enrollment",
    "title": "Enrolled in Course",
    "message": "You have been enrolled in CS101 — Introduction to Programming.",
    "isRead": false,
    "link": "/student/schedule",
    "createdAt": "2026-04-23T10:00:00.000Z"
  },
  {
    "_id": "...",
    "type": "schedule_changed",
    "title": "Schedule Updated",
    "message": "Schedule for CS101 has been updated: room → Room 202.",
    "isRead": true,
    "link": "/student/schedule",
    "createdAt": "2026-04-22T14:30:00.000Z"
  }
]
```

**Notification types and what triggers them:**

| Type | Triggered when... |
|---|---|
| `enrollment` | Admin enrolls a student in a course |
| `unenrollment` | Admin removes a student from a course |
| `schedule_created` | Admin adds a new schedule slot for a course |
| `schedule_changed` | Admin updates or deletes an existing schedule |
| `instructor_assigned` | A faculty member is assigned to a course |
| `instructor_changed` | The instructor of a course is replaced |
| `announcement` | A new announcement is posted targeting the user's role |
| `attendance_marked` | Attendance is recorded (reserved for future use) |
| `course_updated` | Course details are modified (reserved for future use) |

---

### 7.2 Get Unread Count

**GET** `/api/notifications/unread-count`
**Access:** All authenticated roles

**When is this called?**
Periodically by the frontend to update the red badge number on the notification bell icon in the top navigation bar.

**Success Response — 200 OK:**
```json
{ "count": 5 }
```

---

### 7.3 Mark All as Read

**PUT** `/api/notifications/mark-all-read`
**Access:** All authenticated roles

**When is this called?**
When the user clicks "Mark all as read" in the notification dropdown. Sets `isRead: true` on all of the user's unread notifications at once.

**Success Response — 200 OK:**
```json
{ "message": "All marked as read" }
```

---

### 7.4 Mark Single Notification as Read

**PUT** `/api/notifications/:id/read`
**Access:** All authenticated roles

**When is this called?**
When the user clicks on a specific notification. Marks just that one notification as read.

**Success Response — 200 OK:**
```json
{ "message": "Marked as read" }
```

---

### 7.5 Delete Notification

**DELETE** `/api/notifications/:id`
**Access:** All authenticated roles

**When is this called?**
When the user dismisses or deletes a notification from their inbox.

**Success Response — 200 OK:**
```json
{ "message": "Notification deleted" }
```

---

## 8. Summary Table

A complete reference of all 35 API endpoints in the system.

| # | Endpoint | Method | Access | Description | Status Code |
|---|---|---|---|---|---|
| **Authentication** | | | | | |
| 1 | `/api/auth/login` | POST | Public | Login and receive JWT token | 200 OK |
| 2 | `/api/auth/me` | GET | Private | Get current user profile | 200 OK |
| **User Management** | | | | | |
| 3 | `/api/users` | GET | Admin | Get all users (filter by `?role=`) | 200 OK |
| 4 | `/api/users/:id` | GET | Admin | Get user by ID | 200 OK |
| 5 | `/api/users` | POST | Admin | Create user | 201 Created |
| 6 | `/api/users/:id` | PUT | Admin | Update user | 200 OK |
| 7 | `/api/users/:id` | DELETE | Admin | Delete user | 200 OK |
| 8 | `/api/users/admin-permissions` | GET | Super Admin | List sub-admin permissions | 200 OK |
| **Course Management** | | | | | |
| 9 | `/api/courses` | GET | All roles | Get all courses | 200 OK |
| 10 | `/api/courses/my-courses` | GET | Student | Get enrolled courses | 200 OK |
| 11 | `/api/courses/my-teaching` | GET | Faculty | Get teaching courses | 200 OK |
| 12 | `/api/courses/:id` | GET | All roles | Get course by ID | 200 OK |
| 13 | `/api/courses` | POST | Admin | Create course | 201 Created |
| 14 | `/api/courses/:id` | PUT | Admin | Update course | 200 OK |
| 15 | `/api/courses/:id` | DELETE | Admin | Delete course | 200 OK |
| 16 | `/api/courses/:id/enroll` | POST | Admin | Enroll student | 200 OK |
| 17 | `/api/courses/:id/unenroll` | POST | Admin | Unenroll student | 200 OK |
| **Schedule Management** | | | | | |
| 18 | `/api/schedules` | GET | All roles | Get all schedules | 200 OK |
| 19 | `/api/schedules/my-schedule` | GET | Student | Get personal schedule | 200 OK |
| 20 | `/api/schedules/:id` | GET | All roles | Get schedule by ID | 200 OK |
| 21 | `/api/schedules` | POST | Admin | Create schedule (conflict check) | 201 Created |
| 22 | `/api/schedules/:id` | PUT | Admin | Update schedule (conflict check) | 200 OK |
| 23 | `/api/schedules/:id` | DELETE | Admin | Delete schedule | 200 OK |
| **Attendance** | | | | | |
| 24 | `/api/attendance/mark` | POST | Admin, Faculty | Bulk mark attendance | 201 Created |
| 25 | `/api/attendance/my-attendance` | GET | Student | Get personal attendance history | 200 OK |
| 26 | `/api/attendance/course/:courseId` | GET | Admin, Faculty | Get course attendance records | 200 OK |
| 27 | `/api/attendance/summary/:studentId/:courseId` | GET | All roles | Get attendance statistics | 200 OK |
| **Announcements** | | | | | |
| 28 | `/api/announcements` | GET | All roles | Get role-filtered announcements | 200 OK |
| 29 | `/api/announcements` | POST | Admin, Faculty | Create announcement | 201 Created |
| 30 | `/api/announcements/:id` | PUT | Admin, Author | Update announcement | 200 OK |
| 31 | `/api/announcements/:id` | DELETE | Admin, Author | Delete announcement | 200 OK |
| **Notifications** | | | | | |
| 32 | `/api/notifications` | GET | All roles | Get last 50 notifications | 200 OK |
| 33 | `/api/notifications/unread-count` | GET | All roles | Get unread count | 200 OK |
| 34 | `/api/notifications/mark-all-read` | PUT | All roles | Mark all as read | 200 OK |
| 35 | `/api/notifications/:id/read` | PUT | All roles | Mark single as read | 200 OK |
| 36 | `/api/notifications/:id` | DELETE | All roles | Delete notification | 200 OK |

---

## Error Response Reference

All error responses follow the same format:
```json
{ "message": "A human-readable description of what went wrong" }
```

| Status Code | Name | Meaning | Common Cause |
|---|---|---|---|
| **200** | OK | Request succeeded | — |
| **201** | Created | New resource created successfully | Successful POST requests |
| **400** | Bad Request | Invalid or missing input data | Duplicate email, already enrolled, invalid student ID |
| **401** | Unauthorized | Authentication failed | No token provided, expired token, inactive account |
| **403** | Forbidden | Authenticated but not permitted | Wrong role for the endpoint, not the announcement author |
| **404** | Not Found | Resource does not exist | Invalid MongoDB ID, deleted record |
| **409** | Conflict | Request conflicts with existing data | Room double-booked, instructor overlap, student schedule clash |
| **500** | Internal Server Error | Unexpected server-side failure | Database error, unhandled exception |

---

## How to Read a MongoDB ObjectId

Throughout this documentation, IDs like `"6614a1b2c3d4e5f6a7b8c9d0"` appear. These are **MongoDB ObjectIds** — 24-character hexadecimal strings automatically generated by the database when a record is created. They are globally unique and are used to reference related records (e.g., a schedule references a course by its ObjectId).

---

*Trophe Smart Campus Management System — API Documentation v1.0*
*Base URL: `http://localhost:5000/api` — All protected routes require `Authorization: Bearer {token}` in the request header*
