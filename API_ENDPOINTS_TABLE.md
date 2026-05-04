# API Endpoints Reference
## Trophe — Smart Campus Management System

**Base URL:** `http://localhost:5000/api`

---

## Authentication Endpoints

| # | Endpoint | Method | Description | Response | Status Code |
|---|---|---|---|---|---|
| 1 | `/api/auth/login` | POST | Authenticate user and receive JWT token | User object + JWT token | 200 OK |
| 2 | `/api/auth/me` | GET | Get current authenticated user profile | User object (no password) | 200 OK |

---

## User Management Endpoints

| # | Endpoint | Method | Description | Response | Status Code |
|---|---|---|---|---|---|
| 3 | `/api/users` | GET | Fetch all registered users (filterable by role) | Array of user objects | 200 OK |
| 4 | `/api/users/:id` | GET | Get a single user by ID | User object | 200 OK |
| 5 | `/api/users` | POST | Create a new user account | Created user object | 201 Created |
| 6 | `/api/users/:id` | PUT | Update user profile or information | Updated user object | 200 OK |
| 7 | `/api/users/:id` | DELETE | Delete a user account | Deletion confirmation | 200 OK |

---

## Course Management Endpoints

| # | Endpoint | Method | Description | Response | Status Code |
|---|---|---|---|---|---|
| 8 | `/api/courses` | GET | Get all courses with faculty and students | Array of course objects | 200 OK |
| 9 | `/api/courses/my-courses` | GET | Get courses enrolled by logged-in student | Array of course objects | 200 OK |
| 10 | `/api/courses/my-teaching` | GET | Get courses assigned to logged-in faculty | Array of course objects | 200 OK |
| 11 | `/api/courses/:id` | GET | Get a single course by ID | Course object | 200 OK |
| 12 | `/api/courses` | POST | Create a new course | Created course object | 201 Created |
| 13 | `/api/courses/:id` | PUT | Update course details | Updated course object | 200 OK |
| 14 | `/api/courses/:id` | DELETE | Delete a course | Deletion confirmation | 200 OK |
| 15 | `/api/courses/:id/enroll` | POST | Enroll a student in a course | Success message + course | 200 OK |
| 16 | `/api/courses/:id/unenroll` | POST | Remove a student from a course | Success message + course | 200 OK |

---

## Schedule Management Endpoints

| # | Endpoint | Method | Description | Response | Status Code |
|---|---|---|---|---|---|
| 17 | `/api/schedules` | GET | Get all class schedules | Array of schedule objects | 200 OK |
| 18 | `/api/schedules/my-schedule` | GET | Get schedules for student's enrolled courses | Array of schedule objects | 200 OK |
| 19 | `/api/schedules/:id` | GET | Get a single schedule by ID | Schedule object | 200 OK |
| 20 | `/api/schedules` | POST | Create a new schedule (with conflict detection) | Created schedule object | 201 Created |
| 21 | `/api/schedules/:id` | PUT | Update a schedule (with conflict detection) | Updated schedule object | 200 OK |
| 22 | `/api/schedules/:id` | DELETE | Delete a schedule | Deletion confirmation | 200 OK |

---

## Attendance Tracking Endpoints

| # | Endpoint | Method | Description | Response | Status Code |
|---|---|---|---|---|---|
| 23 | `/api/attendance/mark` | POST | Bulk mark attendance for multiple students | Success message + results | 201 Created |
| 24 | `/api/attendance/my-attendance` | GET | Get personal attendance records (student) | Array of attendance records | 200 OK |
| 25 | `/api/attendance/course/:courseId` | GET | Get attendance records for a course | Array of attendance records | 200 OK |
| 26 | `/api/attendance/summary/:studentId/:courseId` | GET | Get attendance statistics for a student | Summary object with percentage | 200 OK |

---

## Announcement Endpoints

| # | Endpoint | Method | Description | Response | Status Code |
|---|---|---|---|---|---|
| 27 | `/api/announcements` | GET | Get announcements filtered by user role | Array of announcement objects | 200 OK |
| 28 | `/api/announcements` | POST | Create a new campus announcement | Created announcement object | 201 Created |
| 29 | `/api/announcements/:id` | PUT | Update an announcement | Updated announcement object | 200 OK |
| 30 | `/api/announcements/:id` | DELETE | Delete an announcement | Deletion confirmation | 200 OK |

---

## Notification Endpoints

| # | Endpoint | Method | Description | Response | Status Code |
|---|---|---|---|---|---|
| 31 | `/api/notifications` | GET | Get last 50 notifications for current user | Array of notification objects | 200 OK |
| 32 | `/api/notifications/unread-count` | GET | Get count of unread notifications | Count object | 200 OK |
| 33 | `/api/notifications/mark-all-read` | PUT | Mark all notifications as read | Success message | 200 OK |
| 34 | `/api/notifications/:id/read` | PUT | Mark a single notification as read | Updated notification object | 200 OK |
| 35 | `/api/notifications/:id` | DELETE | Delete a notification | Deletion confirmation | 200 OK |

---

## Access Control Summary

| Role | Accessible Endpoints |
|---|---|
| **Public** | Login |
| **Admin** | All endpoints (full system access) |
| **Faculty** | Courses (view all, manage assigned), Schedules (view all), Attendance (mark for own courses), Announcements (create/edit own), Notifications (own) |
| **Student** | Courses (view enrolled), Schedules (view own), Attendance (view own), Announcements (read only), Notifications (own) |

---

## HTTP Status Codes

| Status Code | Meaning |
|---|---|
| 200 OK | Request succeeded |
| 201 Created | Resource created successfully |
| 400 Bad Request | Invalid input data |
| 401 Unauthorized | Missing or invalid token |
| 403 Forbidden | Insufficient permissions |
| 404 Not Found | Resource does not exist |
| 409 Conflict | Schedule conflict detected |
| 500 Internal Server Error | Server-side error |

---

**Total Endpoints:** 35  
**Authentication:** Bearer Token (JWT) required for all endpoints except login  
**Token Expiration:** 7 days
