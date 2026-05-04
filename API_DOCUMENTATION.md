# API Documentation
## Trophe — Smart Campus Management System

**Base URL:** `http://localhost:5000/api`
**Authentication:** Bearer Token (JWT) — include in `Authorization` header for all protected routes
**Date:** April 28, 2026

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

| # | Endpoint | Method | Description | Response | Status Code |
|---|---|---|---|---|---|
| 1 | `/api/auth/login` | POST | Authenticate user and receive JWT token | User object + JWT token | 200 OK |
| 2 | `/api/auth/me` | GET | Get current authenticated user profile | User object (no password) | 200 OK |

---

### 1.1 Login

**POST** `/api/auth/login`
**Access:** Public

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
  "lastName": "User",
  "email": "admin@trophe.edu",
  "role": "admin",
  "department": "Administration",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response — 401 Unauthorized:**
```json
{
  "message": "Invalid email or password"
}
```

**Error Response — 403 Forbidden:**
```json
{
  "message": "Account is deactivated. Contact admin."
}
```

---

### 1.2 Get Current User

**GET** `/api/auth/me`
**Access:** Private (requires token)

**Headers:**
```
Authorization: Bearer {token}
```

**Success Response — 200 OK:**
```json
{
  "_id": "6614a1b2c3d4e5f6a7b8c9d0",
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@trophe.edu",
  "role": "admin",
  "department": "Administration",
  "isActive": true
}
```

---

## 2. User Management Endpoints

> All endpoints in this group require Admin role.

| # | Endpoint | Method | Description | Response | Status Code |
|---|---|---|---|---|---|
| 1 | `/api/users` | GET | Get all users (filterable by `?role=`) | Array of user objects | 200 OK |
| 2 | `/api/users/:id` | GET | Get a single user by ID | User object | 200 OK |
| 3 | `/api/users` | POST | Create a new user | Created user object | 201 Created |
| 4 | `/api/users/:id` | PUT | Update user information | Updated user object | 200 OK |
| 5 | `/api/users/:id` | DELETE | Delete a user | Success message | 200 OK |

---

### 2.1 Get All Users

**GET** `/api/users`
**Access:** Admin only

**Query Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `role` | string | No | Filter by role: `admin`, `faculty`, `student` |

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
    "isActive": true
  }
]
```

---

### 2.2 Get User by ID

**GET** `/api/users/:id`
**Access:** Admin only

**URL Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `id` | string | MongoDB ObjectId of the user |

**Success Response — 200 OK:** Single user object

**Error Response — 404 Not Found:**
```json
{ "message": "User not found" }
```

---

### 2.3 Create User

**POST** `/api/users`
**Access:** Admin only

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `firstName` | string | Yes | User's first name |
| `lastName` | string | Yes | User's last name |
| `email` | string | Yes | Unique email address |
| `password` | string | Yes | Minimum 6 characters |
| `role` | string | Yes | `admin`, `faculty`, or `student` |
| `department` | string | No | Department name |
| `studentId` | string | No | Required for student role |

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

**Success Response — 201 Created:** Created user object

**Error Response — 400 Bad Request:**
```json
{ "message": "User already exists with this email" }
```

---

### 2.4 Update User

**PUT** `/api/users/:id`
**Access:** Admin only

**Request Body:** Any subset of user fields to update.

```json
{
  "department": "Information Technology",
  "isActive": false
}
```

**Success Response — 200 OK:** Updated user object

---

### 2.5 Delete User

**DELETE** `/api/users/:id`
**Access:** Admin only

**Success Response — 200 OK:**
```json
{ "message": "User deleted successfully" }
```

---

## 3. Course Management Endpoints

| # | Endpoint | Method | Access | Description | Status Code |
|---|---|---|---|---|---|
| 1 | `/api/courses` | GET | All roles | Get all courses with faculty and students | 200 OK |
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

**Success Response — 200 OK:**
```json
[
  {
    "_id": "6614a1b2c3d4e5f6a7b8c9d0",
    "courseCode": "CS101",
    "courseName": "Introduction to Programming",
    "description": "Fundamentals of programming using Python",
    "units": 3,
    "department": "Computer Science",
    "faculty": {
      "_id": "6614a1b2c3d4e5f6a7b8c9d2",
      "firstName": "Maria",
      "lastName": "Santos",
      "email": "maria.santos@trophe.edu"
    },
    "students": [...],
    "isActive": true
  }
]
```

---

### 3.2 Create Course

**POST** `/api/courses`
**Access:** Admin only

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `courseCode` | string | Yes | Unique code, auto-uppercased |
| `courseName` | string | Yes | Full course name |
| `description` | string | No | Course description |
| `units` | number | Yes | Credit units (1–6) |
| `department` | string | No | Department name |
| `faculty` | string | No | MongoDB ObjectId of faculty user |

```json
{
  "courseCode": "CS101",
  "courseName": "Introduction to Programming",
  "description": "Fundamentals of programming using Python",
  "units": 3,
  "department": "Computer Science",
  "faculty": "6614a1b2c3d4e5f6a7b8c9d2"
}
```

**Success Response — 201 Created:** Created course object

**Error Response — 400 Bad Request:**
```json
{ "message": "Course code already exists" }
```

---

### 3.3 Update Course

**PUT** `/api/courses/:id`
**Access:** Admin only

> If the `faculty` field changes, enrolled students and the new faculty member automatically receive in-app notifications.

```json
{
  "courseName": "Introduction to Programming (Python)",
  "faculty": "6614a1b2c3d4e5f6a7b8c9d3"
}
```

**Success Response — 200 OK:** Updated course object

---

### 3.4 Enroll Student

**POST** `/api/courses/:id/enroll`
**Access:** Admin only

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `studentId` | string | Yes | MongoDB ObjectId of the student |

```json
{
  "studentId": "6614a1b2c3d4e5f6a7b8c9d5"
}
```

**Success Response — 200 OK:**
```json
{
  "message": "Student enrolled successfully",
  "course": { ... }
}
```

**Error Response — 400 Bad Request:**
```json
{ "message": "Student already enrolled" }
```

---

### 3.5 Unenroll Student

**POST** `/api/courses/:id/unenroll`
**Access:** Admin only

```json
{
  "studentId": "6614a1b2c3d4e5f6a7b8c9d5"
}
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

| # | Endpoint | Method | Access | Description | Status Code |
|---|---|---|---|---|---|
| 1 | `/api/schedules` | GET | All roles | Get all schedules sorted by day and time | 200 OK |
| 2 | `/api/schedules/my-schedule` | GET | Student | Get schedules for enrolled courses | 200 OK |
| 3 | `/api/schedules/:id` | GET | All roles | Get a single schedule by ID | 200 OK |
| 4 | `/api/schedules` | POST | Admin | Create a schedule (with conflict detection) | 201 Created |
| 5 | `/api/schedules/:id` | PUT | Admin | Update a schedule (with conflict detection) | 200 OK |
| 6 | `/api/schedules/:id` | DELETE | Admin | Delete a schedule | 200 OK |

---

### 4.1 Create Schedule

**POST** `/api/schedules`
**Access:** Admin only

> Before saving, the system runs a four-layer conflict check: course duplicate, room conflict, instructor conflict, and student conflict. Returns `409 Conflict` if any conflict is detected.

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `course` | string | Yes | MongoDB ObjectId of the course |
| `day` | string | Yes | `Monday` through `Sunday` |
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

**Success Response — 201 Created:** Created schedule object

**Error Response — 409 Conflict (Room):**
```json
{
  "message": "Room \"Room 101\" is already occupied on Monday from 08:00–09:30 by CS102.",
  "conflictType": "room"
}
```

**Error Response — 409 Conflict (Instructor):**
```json
{
  "message": "Instructor Maria Santos is already teaching CS102 on Monday from 08:00–09:30.",
  "conflictType": "instructor"
}
```

**Error Response — 409 Conflict (Student):**
```json
{
  "message": "One or more students are enrolled in both CS101 and CS102, which overlap on Monday from 08:00–09:30.",
  "conflictType": "student"
}
```

---

### 4.2 Update Schedule

**PUT** `/api/schedules/:id`
**Access:** Admin only

> Conflict detection runs on update as well, excluding the schedule being updated. If the day, time, or room changes, enrolled students and faculty receive change notifications.

```json
{
  "room": "Room 202",
  "startTime": "10:00",
  "endTime": "11:30"
}
```

**Success Response — 200 OK:** Updated schedule object

---

### 4.3 Delete Schedule

**DELETE** `/api/schedules/:id`
**Access:** Admin only

> Enrolled students and faculty are notified when a schedule is deleted.

**Success Response — 200 OK:**
```json
{ "message": "Schedule deleted successfully" }
```

---

## 5. Attendance Endpoints

| # | Endpoint | Method | Access | Description | Status Code |
|---|---|---|---|---|---|
| 1 | `/api/attendance/mark` | POST | Admin, Faculty | Bulk mark attendance for a course | 201 Created |
| 2 | `/api/attendance/my-attendance` | GET | Student | Get personal attendance records | 200 OK |
| 3 | `/api/attendance/course/:courseId` | GET | Admin, Faculty | Get attendance records for a course | 200 OK |
| 4 | `/api/attendance/summary/:studentId/:courseId` | GET | All roles | Get attendance statistics | 200 OK |

---

### 5.1 Mark Attendance (Bulk)

**POST** `/api/attendance/mark`
**Access:** Admin, Faculty

> Uses upsert — re-marking attendance for the same student, course, and date updates the existing record rather than creating a duplicate.

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `courseId` | string | Yes | MongoDB ObjectId of the course |
| `date` | string | Yes | ISO date string, e.g. `"2026-04-23"` |
| `records` | array | Yes | Array of student attendance entries |
| `records[].studentId` | string | Yes | MongoDB ObjectId of the student |
| `records[].status` | string | Yes | `present`, `absent`, `late`, or `excused` |
| `records[].remarks` | string | No | Optional notes |

```json
{
  "courseId": "6614a1b2c3d4e5f6a7b8c9d0",
  "date": "2026-04-23",
  "records": [
    { "studentId": "6614a1b2c3d4e5f6a7b8c9d1", "status": "present", "remarks": "" },
    { "studentId": "6614a1b2c3d4e5f6a7b8c9d2", "status": "late", "remarks": "Arrived 10 minutes late" },
    { "studentId": "6614a1b2c3d4e5f6a7b8c9d3", "status": "absent", "remarks": "" }
  ]
}
```

**Success Response — 201 Created:**
```json
{
  "message": "Attendance marked successfully",
  "results": [ ... ]
}
```

---

### 5.2 Get My Attendance

**GET** `/api/attendance/my-attendance`
**Access:** Student only

**Success Response — 200 OK:**
```json
[
  {
    "_id": "...",
    "student": "6614a1b2c3d4e5f6a7b8c9d1",
    "course": { "courseCode": "CS101", "courseName": "Introduction to Programming" },
    "date": "2026-04-23T00:00:00.000Z",
    "status": "present",
    "remarks": ""
  }
]
```

---

### 5.3 Get Course Attendance

**GET** `/api/attendance/course/:courseId`
**Access:** Admin, Faculty

**Query Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `date` | string | No | Filter by specific date, e.g. `?date=2026-04-23` |

**Success Response — 200 OK:** Array of attendance records with populated student and course data.

---

### 5.4 Get Attendance Summary

**GET** `/api/attendance/summary/:studentId/:courseId`
**Access:** All authenticated roles

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

> Percentage counts both `present` and `late` as attended.

---

## 6. Announcement Endpoints

| # | Endpoint | Method | Access | Description | Status Code |
|---|---|---|---|---|---|
| 1 | `/api/announcements` | GET | All roles | Get announcements filtered by user role | 200 OK |
| 2 | `/api/announcements` | POST | Admin, Faculty | Create a new announcement | 201 Created |
| 3 | `/api/announcements/:id` | PUT | Admin, Author | Update an announcement | 200 OK |
| 4 | `/api/announcements/:id` | DELETE | Admin, Author | Delete an announcement | 200 OK |

---

### 6.1 Get Announcements

**GET** `/api/announcements`
**Access:** All authenticated roles

> Returns only announcements where `targetRoles` includes the current user's role. Pinned announcements appear first, then sorted by newest.

**Success Response — 200 OK:**
```json
[
  {
    "_id": "...",
    "title": "Midterm Examination Schedule",
    "content": "Midterm examinations will be held from October 14-18.",
    "author": { "firstName": "Admin", "lastName": "User", "role": "admin" },
    "targetRoles": ["faculty", "student"],
    "isPinned": true,
    "isActive": true,
    "createdAt": "2026-04-20T08:00:00.000Z"
  }
]
```

---

### 6.2 Create Announcement

**POST** `/api/announcements`
**Access:** Admin, Faculty

> Creating an announcement automatically sends in-app notifications to all active users whose role is in `targetRoles`.

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | string | Yes | Announcement title |
| `content` | string | Yes | Announcement body text |
| `targetRoles` | array | No | Roles to target. Defaults to all roles |
| `isPinned` | boolean | No | Pin to top of list. Defaults to `false` |

```json
{
  "title": "Midterm Examination Schedule",
  "content": "Midterm examinations will be held from October 14-18, 2026.",
  "targetRoles": ["faculty", "student"],
  "isPinned": true
}
```

**Success Response — 201 Created:** Created announcement object

---

### 6.3 Update Announcement

**PUT** `/api/announcements/:id`
**Access:** Admin or the original author (Faculty)

```json
{
  "content": "Updated: Midterm examinations rescheduled to October 21-25, 2026.",
  "isPinned": false
}
```

**Success Response — 200 OK:** Updated announcement object

**Error Response — 403 Forbidden:**
```json
{ "message": "Not authorized to update this announcement" }
```

---

### 6.4 Delete Announcement

**DELETE** `/api/announcements/:id`
**Access:** Admin or the original author (Faculty)

**Success Response — 200 OK:**
```json
{ "message": "Announcement deleted successfully" }
```

---

## 7. Notification Endpoints

| # | Endpoint | Method | Access | Description | Status Code |
|---|---|---|---|---|---|
| 1 | `/api/notifications` | GET | All roles | Get last 50 notifications for current user | 200 OK |
| 2 | `/api/notifications/unread-count` | GET | All roles | Get count of unread notifications | 200 OK |
| 3 | `/api/notifications/mark-all-read` | PUT | All roles | Mark all notifications as read | 200 OK |
| 4 | `/api/notifications/:id/read` | PUT | All roles | Mark a single notification as read | 200 OK |
| 5 | `/api/notifications/:id` | DELETE | All roles | Delete a notification | 200 OK |

---

### 7.1 Get Notifications

**GET** `/api/notifications`
**Access:** All authenticated roles

**Success Response — 200 OK:**
```json
[
  {
    "_id": "...",
    "recipient": "6614a1b2c3d4e5f6a7b8c9d1",
    "type": "enrollment",
    "title": "Enrolled in Course",
    "message": "You have been enrolled in CS101 — Introduction to Programming.",
    "isRead": false,
    "link": "/student/schedule",
    "createdAt": "2026-04-23T10:00:00.000Z"
  }
]
```

**Notification Types:**

| Type | Trigger |
|---|---|
| `enrollment` | Student enrolled in a course |
| `unenrollment` | Student removed from a course |
| `schedule_created` | New schedule added for a course |
| `schedule_changed` | Existing schedule updated or deleted |
| `instructor_assigned` | Faculty assigned to a course |
| `instructor_changed` | Course instructor changed |
| `announcement` | New announcement posted |
| `course_updated` | Course details updated |

---

### 7.2 Get Unread Count

**GET** `/api/notifications/unread-count`
**Access:** All authenticated roles

**Success Response — 200 OK:**
```json
{ "count": 5 }
```

---

### 7.3 Mark All as Read

**PUT** `/api/notifications/mark-all-read`
**Access:** All authenticated roles

**Success Response — 200 OK:**
```json
{ "message": "All notifications marked as read" }
```

---

### 7.4 Mark Single as Read

**PUT** `/api/notifications/:id/read`
**Access:** All authenticated roles

**Success Response — 200 OK:** Updated notification object

---

### 7.5 Delete Notification

**DELETE** `/api/notifications/:id`
**Access:** All authenticated roles

**Success Response — 200 OK:**
```json
{ "message": "Notification deleted" }
```

---

## 8. Summary Table

| # | Endpoint | Method | Access | Description | Status Code |
|---|---|---|---|---|---|
| **Authentication** | | | | | |
| 1 | `/api/auth/login` | POST | Public | Login and receive JWT token | 200 OK |
| 2 | `/api/auth/me` | GET | Private | Get current user profile | 200 OK |
| **User Management** | | | | | |
| 3 | `/api/users` | GET | Admin | Get all users | 200 OK |
| 4 | `/api/users/:id` | GET | Admin | Get user by ID | 200 OK |
| 5 | `/api/users` | POST | Admin | Create user | 201 Created |
| 6 | `/api/users/:id` | PUT | Admin | Update user | 200 OK |
| 7 | `/api/users/:id` | DELETE | Admin | Delete user | 200 OK |
| **Course Management** | | | | | |
| 8 | `/api/courses` | GET | All roles | Get all courses | 200 OK |
| 9 | `/api/courses/my-courses` | GET | Student | Get enrolled courses | 200 OK |
| 10 | `/api/courses/my-teaching` | GET | Faculty | Get teaching courses | 200 OK |
| 11 | `/api/courses/:id` | GET | All roles | Get course by ID | 200 OK |
| 12 | `/api/courses` | POST | Admin | Create course | 201 Created |
| 13 | `/api/courses/:id` | PUT | Admin | Update course | 200 OK |
| 14 | `/api/courses/:id` | DELETE | Admin | Delete course | 200 OK |
| 15 | `/api/courses/:id/enroll` | POST | Admin | Enroll student | 200 OK |
| 16 | `/api/courses/:id/unenroll` | POST | Admin | Unenroll student | 200 OK |
| **Schedule Management** | | | | | |
| 17 | `/api/schedules` | GET | All roles | Get all schedules | 200 OK |
| 18 | `/api/schedules/my-schedule` | GET | Student | Get personal schedule | 200 OK |
| 19 | `/api/schedules/:id` | GET | All roles | Get schedule by ID | 200 OK |
| 20 | `/api/schedules` | POST | Admin | Create schedule | 201 Created |
| 21 | `/api/schedules/:id` | PUT | Admin | Update schedule | 200 OK |
| 22 | `/api/schedules/:id` | DELETE | Admin | Delete schedule | 200 OK |
| **Attendance** | | | | | |
| 23 | `/api/attendance/mark` | POST | Admin, Faculty | Bulk mark attendance | 201 Created |
| 24 | `/api/attendance/my-attendance` | GET | Student | Get personal attendance | 200 OK |
| 25 | `/api/attendance/course/:courseId` | GET | Admin, Faculty | Get course attendance | 200 OK |
| 26 | `/api/attendance/summary/:studentId/:courseId` | GET | All roles | Get attendance summary | 200 OK |
| **Announcements** | | | | | |
| 27 | `/api/announcements` | GET | All roles | Get role-filtered announcements | 200 OK |
| 28 | `/api/announcements` | POST | Admin, Faculty | Create announcement | 201 Created |
| 29 | `/api/announcements/:id` | PUT | Admin, Author | Update announcement | 200 OK |
| 30 | `/api/announcements/:id` | DELETE | Admin, Author | Delete announcement | 200 OK |
| **Notifications** | | | | | |
| 31 | `/api/notifications` | GET | All roles | Get last 50 notifications | 200 OK |
| 32 | `/api/notifications/unread-count` | GET | All roles | Get unread count | 200 OK |
| 33 | `/api/notifications/mark-all-read` | PUT | All roles | Mark all as read | 200 OK |
| 34 | `/api/notifications/:id/read` | PUT | All roles | Mark single as read | 200 OK |
| 35 | `/api/notifications/:id` | DELETE | All roles | Delete notification | 200 OK |

---

## Error Response Reference

| Status Code | Meaning | Common Cause |
|---|---|---|
| 200 OK | Request succeeded | — |
| 201 Created | Resource created successfully | POST requests |
| 400 Bad Request | Invalid input data | Duplicate email, already enrolled, invalid student |
| 401 Unauthorized | Missing or invalid token | No token, expired token, inactive account |
| 403 Forbidden | Insufficient role permissions | Wrong role for endpoint, not the author |
| 404 Not Found | Resource does not exist | Invalid ID |
| 409 Conflict | Schedule conflict detected | Room, instructor, student, or course conflict |
| 500 Internal Server Error | Server-side error | Database error, unexpected exception |

---

*Trophe Smart Campus Management System — API Documentation*
*Base URL: `http://localhost:5000/api` — All protected routes require `Authorization: Bearer {token}`*
