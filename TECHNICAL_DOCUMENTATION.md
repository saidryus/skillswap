# TROPHE TECHNICAL DOCUMENTATION
## Smart Campus Management System

**Version:** 1.0.0  
**Last Updated:** April 23, 2026  
**Document Type:** Technical Specification & Developer Guide

---

## TABLE OF CONTENTS

1. [System Overview](#1-system-overview)
2. [Architecture](#2-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Database Design](#4-database-design)
5. [API Documentation](#5-api-documentation)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Frontend Architecture](#7-frontend-architecture)
8. [Backend Architecture](#8-backend-architecture)
9. [Core Features Implementation](#9-core-features-implementation)
10. [Security Implementation](#10-security-implementation)
11. [Deployment Guide](#11-deployment-guide)
12. [Testing Strategy](#12-testing-strategy)
13. [Troubleshooting](#13-troubleshooting)
14. [Appendices](#14-appendices)

---

## 1. SYSTEM OVERVIEW

### 1.1 Purpose

Trophe is a full-stack web application designed to digitize and streamline campus management operations for educational institutions. The system provides role-based access for administrators, faculty members, and students to manage courses, schedules, attendance, and communications.

### 1.2 Key Features

- **User Management**: CRUD operations with role-based access control
- **Course Management**: Course creation, faculty assignment, student enrollment
- **Schedule Management**: Intelligent scheduling with conflict detection
- **Attendance Tracking**: Digital attendance marking and reporting
- **Notification System**: Real-time notifications for system events
- **Announcement System**: Campus-wide communication platform
- **Print System**: Official study load document generation

### 1.3 System Requirements

**Server Requirements:**
- Node.js v18.0.0 or higher
- MongoDB v5.0 or higher
- 2GB RAM minimum (4GB recommended)
- 10GB disk space

**Client Requirements:**
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- JavaScript enabled
- Internet connection
- Screen resolution: 1024x768 minimum


---

## 2. ARCHITECTURE

### 2.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT TIER                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  React Single Page Application (SPA)                      │  │
│  │  - React Router (Client-side routing)                     │  │
│  │  - Context API (State management)                         │  │
│  │  - Axios (HTTP client)                                    │  │
│  │  - Tailwind CSS (Styling)                                 │  │
│  │  - Framer Motion (Animations)                             │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS/REST API
                         │ JSON Payloads
┌────────────────────────▼────────────────────────────────────────┐
│                     APPLICATION TIER                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Express.js Server                                        │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Middleware Layer                                   │  │  │
│  │  │  - CORS Handler                                     │  │  │
│  │  │  - JSON Body Parser                                 │  │  │
│  │  │  - JWT Authentication (protect)                     │  │  │
│  │  │  - Role Authorization (authorize)                   │  │  │
│  │  │  - Error Handler                                    │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Route Layer                                        │  │  │
│  │  │  - /api/auth (Authentication)                       │  │  │
│  │  │  - /api/users (User Management)                     │  │  │
│  │  │  - /api/courses (Course Management)                 │  │  │
│  │  │  - /api/schedules (Schedule Management)             │  │  │
│  │  │  - /api/attendance (Attendance Tracking)            │  │  │
│  │  │  - /api/announcements (Announcements)               │  │  │
│  │  │  - /api/notifications (Notifications)               │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Controller Layer                                   │  │  │
│  │  │  - Business Logic                                   │  │  │
│  │  │  - Request Validation                               │  │  │
│  │  │  - Response Formatting                              │  │  │
│  │  │  - Conflict Detection                               │  │  │
│  │  │  - Notification Triggers                            │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Model Layer (Mongoose ODM)                         │  │  │
│  │  │  - Schema Definitions                               │  │  │
│  │  │  - Validation Rules                                 │  │  │
│  │  │  - Virtual Fields                                   │  │  │
│  │  │  - Pre/Post Hooks                                   │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │ Mongoose ODM
                         │ TCP Connection
┌────────────────────────▼────────────────────────────────────────┐
│                       DATA TIER                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  MongoDB Database                                         │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Collections:                                       │  │  │
│  │  │  - users (Authentication & Profiles)                │  │  │
│  │  │  - courses (Course Information)                     │  │  │
│  │  │  - schedules (Class Schedules)                      │  │  │
│  │  │  - attendance (Attendance Records)                  │  │  │
│  │  │  - announcements (Campus Announcements)             │  │  │
│  │  │  - notifications (User Notifications)               │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Indexes:                                           │  │  │
│  │  │  - Unique indexes (email, courseCode, etc.)        │  │  │
│  │  │  - Compound indexes (conflict detection)           │  │  │
│  │  │  - Query optimization indexes                      │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Design Patterns

**MVC (Model-View-Controller)**
- **Model**: Mongoose schemas define data structure and validation
- **View**: React components render UI
- **Controller**: Express route handlers process business logic

**Repository Pattern**
- Mongoose models act as repositories
- Abstraction layer between business logic and data access

**Middleware Pattern**
- Express middleware chain for request processing
- Authentication, authorization, error handling

**Observer Pattern**
- Notification system triggers on data changes
- Event-driven notification creation


---

## 3. TECHNOLOGY STACK

### 3.1 Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | JavaScript runtime environment |
| Express.js | 4.18+ | Web application framework |
| MongoDB | 5.0+ | NoSQL database |
| Mongoose | 8.0+ | MongoDB ODM |
| jsonwebtoken | 9.0+ | JWT token generation/verification |
| bcryptjs | 2.4+ | Password hashing |
| cors | 2.8+ | Cross-origin resource sharing |
| dotenv | 16.3+ | Environment variable management |

### 3.2 Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2+ | UI library |
| Vite | 5.0+ | Build tool and dev server |
| React Router | 6.21+ | Client-side routing |
| Axios | 1.6+ | HTTP client |
| Tailwind CSS | 3.4+ | Utility-first CSS framework |
| Framer Motion | 10.16+ | Animation library |
| React Hot Toast | 2.4+ | Toast notifications |
| React Icons | 4.12+ | Icon library |
| jsPDF | 2.5+ | PDF generation |
| jsPDF-AutoTable | 3.8+ | PDF table generation |

### 3.3 Development Tools

| Tool | Purpose |
|------|---------|
| Git | Version control |
| VS Code | Code editor (recommended) |
| Postman | API testing |
| MongoDB Compass | Database GUI |
| Chrome DevTools | Frontend debugging |

### 3.4 Dependency Tree

**Backend Dependencies:**
```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.0.3"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

**Frontend Dependencies:**
```json
{
  "dependencies": {
    "axios": "^1.6.2",
    "framer-motion": "^10.16.16",
    "jspdf": "^2.5.1",
    "jspdf-autotable": "^3.8.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hot-toast": "^2.4.1",
    "react-icons": "^4.12.0",
    "react-router-dom": "^6.21.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "vite": "^5.0.8"
  }
}
```


---

## 4. DATABASE DESIGN

### 4.1 Entity Relationship Diagram

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│    USERS     │────────▶│   COURSES    │────────▶│  SCHEDULES   │
│              │ faculty │              │ course  │              │
│ _id          │         │ _id          │         │ _id          │
│ email        │         │ courseCode   │         │ day          │
│ password     │         │ courseName   │         │ startTime    │
│ role         │         │ faculty (FK) │         │ endTime      │
│ firstName    │         │ students[]   │         │ room         │
│ lastName     │         │ units        │         │ course (FK)  │
│ studentId    │         │ department   │         └──────────────┘
│ department   │         └──────────────┘
│ isActive     │                │
└──────┬───────┘                │
       │                        │
       │ students[]             │
       │                        │
       ▼                        ▼
┌──────────────┐         ┌──────────────┐
│  ATTENDANCE  │         │ANNOUNCEMENTS │
│              │         │              │
│ _id          │         │ _id          │
│ student (FK) │         │ title        │
│ course (FK)  │         │ content      │
│ date         │         │ author (FK)  │
│ status       │         │ targetRoles  │
│ markedBy(FK) │         │ isPinned     │
│ remarks      │         └──────────────┘
└──────────────┘
       │
       │ recipient
       ▼
┌──────────────┐
│NOTIFICATIONS │
│              │
│ _id          │
│ recipient(FK)│
│ type         │
│ title        │
│ message      │
│ isRead       │
│ link         │
│ meta         │
└──────────────┘
```

### 4.2 Collection Schemas

#### 4.2.1 Users Collection

```javascript
{
  _id: ObjectId,
  studentId: String (unique, sparse),
  firstName: String (required),
  lastName: String (required),
  email: String (required, unique, lowercase),
  password: String (required, hashed),
  role: String (enum: ['admin', 'faculty', 'student']),
  department: String,
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ email: 1 }` (unique)
- `{ studentId: 1 }` (unique, sparse)
- `{ role: 1 }`

#### 4.2.2 Courses Collection

```javascript
{
  _id: ObjectId,
  courseCode: String (required, unique, uppercase),
  courseName: String (required),
  description: String,
  units: Number (required, min: 1, max: 6),
  department: String,
  faculty: ObjectId (ref: 'User'),
  students: [ObjectId] (ref: 'User'),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ courseCode: 1 }` (unique)
- `{ faculty: 1 }`
- `{ students: 1 }`

#### 4.2.3 Schedules Collection

```javascript
{
  _id: ObjectId,
  course: ObjectId (required, ref: 'Course'),
  day: String (required, enum: days of week),
  startTime: String (required, format: "HH:MM"),
  endTime: String (required, format: "HH:MM"),
  room: String,
  semester: String,
  schoolYear: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ course: 1 }`
- `{ day: 1, startTime: 1 }`

#### 4.2.4 Attendance Collection

```javascript
{
  _id: ObjectId,
  student: ObjectId (required, ref: 'User'),
  course: ObjectId (required, ref: 'Course'),
  date: Date (required),
  status: String (enum: ['present', 'absent', 'late', 'excused']),
  markedBy: ObjectId (ref: 'User'),
  remarks: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ student: 1, course: 1, date: 1 }` (unique compound)
- `{ student: 1 }`
- `{ course: 1 }`

#### 4.2.5 Announcements Collection

```javascript
{
  _id: ObjectId,
  title: String (required),
  content: String (required),
  author: ObjectId (required, ref: 'User'),
  targetRoles: [String] (enum: ['admin', 'faculty', 'student']),
  isPinned: Boolean (default: false),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ author: 1 }`
- `{ targetRoles: 1 }`
- `{ isPinned: -1, createdAt: -1 }`

#### 4.2.6 Notifications Collection

```javascript
{
  _id: ObjectId,
  recipient: ObjectId (required, ref: 'User'),
  type: String (required, enum: notification types),
  title: String (required),
  message: String (required),
  isRead: Boolean (default: false),
  link: String,
  meta: Mixed (JSON object),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ recipient: 1, isRead: 1, createdAt: -1 }`
- `{ recipient: 1 }`


---

## 5. API DOCUMENTATION

### 5.1 Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

### 5.2 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### 5.3 API Endpoints

#### 5.3.1 Authentication Endpoints

**POST /api/auth/register**
- **Description**: Register a new user
- **Access**: Public
- **Request Body**:
```json
{
  "firstName": "string (required)",
  "lastName": "string (required)",
  "email": "string (required, unique)",
  "password": "string (required, min 6 chars)",
  "role": "string (optional, default: 'student')",
  "department": "string (optional)",
  "studentId": "string (optional, for students)"
}
```
- **Response**: `201 Created`
```json
{
  "_id": "string",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "role": "string",
  "token": "string (JWT)"
}
```

**POST /api/auth/login**
- **Description**: Authenticate user and get token
- **Access**: Public
- **Request Body**:
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```
- **Response**: `200 OK`
```json
{
  "_id": "string",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "role": "string",
  "token": "string (JWT)"
}
```

**GET /api/auth/me**
- **Description**: Get current user profile
- **Access**: Private
- **Response**: `200 OK` - User object

#### 5.3.2 User Management Endpoints

**GET /api/users**
- **Description**: Get all users
- **Access**: Admin only
- **Query Parameters**: `?role=admin|faculty|student`
- **Response**: `200 OK` - Array of user objects

**GET /api/users/:id**
- **Description**: Get user by ID
- **Access**: Admin only
- **Response**: `200 OK` - User object

**POST /api/users**
- **Description**: Create new user (admin function)
- **Access**: Admin only
- **Request Body**: Same as register
- **Response**: `201 Created` - User object

**PUT /api/users/:id**
- **Description**: Update user
- **Access**: Admin only
- **Request Body**: Partial user object
- **Response**: `200 OK` - Updated user object

**DELETE /api/users/:id**
- **Description**: Delete user
- **Access**: Admin only
- **Response**: `200 OK` - Success message

#### 5.3.3 Course Management Endpoints

**GET /api/courses**
- **Description**: Get all courses
- **Access**: Private (all roles)
- **Response**: `200 OK` - Array of course objects with populated faculty and students

**GET /api/courses/my-courses**
- **Description**: Get courses for logged-in student
- **Access**: Student
- **Response**: `200 OK` - Array of enrolled courses

**GET /api/courses/:id**
- **Description**: Get course by ID
- **Access**: Private
- **Response**: `200 OK` - Course object

**POST /api/courses**
- **Description**: Create new course
- **Access**: Admin only
- **Request Body**:
```json
{
  "courseCode": "string (required, unique)",
  "courseName": "string (required)",
  "description": "string (optional)",
  "units": "number (required, 1-6)",
  "department": "string (optional)",
  "faculty": "ObjectId (optional)"
}
```
- **Response**: `201 Created` - Course object

**PUT /api/courses/:id**
- **Description**: Update course
- **Access**: Admin only
- **Request Body**: Partial course object
- **Response**: `200 OK` - Updated course object

**DELETE /api/courses/:id**
- **Description**: Delete course
- **Access**: Admin only
- **Response**: `200 OK` - Success message

**POST /api/courses/:id/enroll**
- **Description**: Enroll student in course
- **Access**: Admin only
- **Request Body**:
```json
{
  "studentId": "ObjectId (required)"
}
```
- **Response**: `200 OK` - Updated course object

**POST /api/courses/:id/unenroll**
- **Description**: Remove student from course
- **Access**: Admin only
- **Request Body**:
```json
{
  "studentId": "ObjectId (required)"
}
```
- **Response**: `200 OK` - Updated course object

#### 5.3.4 Schedule Management Endpoints

**GET /api/schedules**
- **Description**: Get all schedules
- **Access**: Private
- **Response**: `200 OK` - Array of schedule objects

**GET /api/schedules/my-schedule**
- **Description**: Get schedules for student's enrolled courses
- **Access**: Student
- **Response**: `200 OK` - Array of schedule objects

**GET /api/schedules/:id**
- **Description**: Get schedule by ID
- **Access**: Private
- **Response**: `200 OK` - Schedule object

**POST /api/schedules**
- **Description**: Create new schedule (with conflict detection)
- **Access**: Admin only
- **Request Body**:
```json
{
  "course": "ObjectId (required)",
  "day": "string (required, enum: days)",
  "startTime": "string (required, HH:MM)",
  "endTime": "string (required, HH:MM)",
  "room": "string (optional)",
  "semester": "string (optional)",
  "schoolYear": "string (optional)"
}
```
- **Response**: `201 Created` - Schedule object
- **Error**: `409 Conflict` - Conflict detected
```json
{
  "message": "Conflict description",
  "conflictType": "room|instructor|student|course"
}
```

**PUT /api/schedules/:id**
- **Description**: Update schedule (with conflict detection)
- **Access**: Admin only
- **Request Body**: Partial schedule object
- **Response**: `200 OK` - Updated schedule object
- **Error**: `409 Conflict` - Conflict detected

**DELETE /api/schedules/:id**
- **Description**: Delete schedule
- **Access**: Admin only
- **Response**: `200 OK` - Success message


#### 5.3.5 Attendance Endpoints

**POST /api/attendance/mark**
- **Description**: Mark attendance for multiple students (bulk operation)
- **Access**: Admin, Faculty
- **Request Body**:
```json
{
  "courseId": "ObjectId (required)",
  "date": "string (required, ISO date)",
  "records": [
    {
      "studentId": "ObjectId (required)",
      "status": "string (required, enum: present|absent|late|excused)",
      "remarks": "string (optional)"
    }
  ]
}
```
- **Response**: `201 Created` - Array of attendance records

**GET /api/attendance/my-attendance**
- **Description**: Get attendance records for logged-in student
- **Access**: Student
- **Response**: `200 OK` - Array of attendance records

**GET /api/attendance/course/:courseId**
- **Description**: Get attendance records for a course
- **Access**: Admin, Faculty
- **Query Parameters**: `?date=YYYY-MM-DD` (optional)
- **Response**: `200 OK` - Array of attendance records

**GET /api/attendance/summary/:studentId/:courseId**
- **Description**: Get attendance summary statistics
- **Access**: Private
- **Response**: `200 OK`
```json
{
  "total": "number",
  "present": "number",
  "absent": "number",
  "late": "number",
  "excused": "number",
  "percentage": "string"
}
```

#### 5.3.6 Announcement Endpoints

**GET /api/announcements**
- **Description**: Get announcements filtered by user role
- **Access**: Private
- **Response**: `200 OK` - Array of announcement objects

**POST /api/announcements**
- **Description**: Create new announcement
- **Access**: Admin, Faculty
- **Request Body**:
```json
{
  "title": "string (required)",
  "content": "string (required)",
  "targetRoles": ["string"] (optional, default: all roles),
  "isPinned": "boolean (optional, default: false)"
}
```
- **Response**: `201 Created` - Announcement object

**PUT /api/announcements/:id**
- **Description**: Update announcement
- **Access**: Admin, Faculty (own announcements)
- **Request Body**: Partial announcement object
- **Response**: `200 OK` - Updated announcement object

**DELETE /api/announcements/:id**
- **Description**: Delete announcement
- **Access**: Admin, Faculty (own announcements)
- **Response**: `200 OK` - Success message

#### 5.3.7 Notification Endpoints

**GET /api/notifications**
- **Description**: Get notifications for logged-in user (last 50)
- **Access**: Private
- **Response**: `200 OK` - Array of notification objects

**GET /api/notifications/unread-count**
- **Description**: Get count of unread notifications
- **Access**: Private
- **Response**: `200 OK`
```json
{
  "count": "number"
}
```

**PUT /api/notifications/:id/read**
- **Description**: Mark notification as read
- **Access**: Private (own notifications)
- **Response**: `200 OK` - Success message

**PUT /api/notifications/mark-all-read**
- **Description**: Mark all notifications as read
- **Access**: Private
- **Response**: `200 OK` - Success message

**DELETE /api/notifications/:id**
- **Description**: Delete notification
- **Access**: Private (own notifications)
- **Response**: `200 OK` - Success message

### 5.4 Error Responses

All endpoints may return the following error responses:

**400 Bad Request**
```json
{
  "message": "Error description"
}
```

**401 Unauthorized**
```json
{
  "message": "Not authorized, no token" | "Not authorized, token failed"
}
```

**403 Forbidden**
```json
{
  "message": "Role 'role_name' is not authorized to access this route"
}
```

**404 Not Found**
```json
{
  "message": "Resource not found"
}
```

**409 Conflict**
```json
{
  "message": "Conflict description",
  "conflictType": "string (optional)"
}
```

**500 Internal Server Error**
```json
{
  "message": "Error description"
}
```


---

## 6. AUTHENTICATION & AUTHORIZATION

### 6.1 JWT Authentication Flow

```
┌─────────┐                                    ┌─────────┐
│ Client  │                                    │ Server  │
└────┬────┘                                    └────┬────┘
     │                                              │
     │  POST /api/auth/login                       │
     │  { email, password }                        │
     ├────────────────────────────────────────────▶│
     │                                              │
     │                                              │ 1. Validate credentials
     │                                              │ 2. Generate JWT token
     │                                              │    jwt.sign({ id }, SECRET, { expiresIn: '7d' })
     │                                              │
     │  200 OK                                      │
     │  { user, token }                             │
     │◀────────────────────────────────────────────┤
     │                                              │
     │ Store token in localStorage                 │
     │                                              │
     │  GET /api/protected-route                   │
     │  Authorization: Bearer <token>              │
     ├────────────────────────────────────────────▶│
     │                                              │
     │                                              │ 1. Extract token from header
     │                                              │ 2. Verify token: jwt.verify(token, SECRET)
     │                                              │ 3. Load user from database
     │                                              │ 4. Attach user to req.user
     │                                              │ 5. Check role authorization
     │                                              │
     │  200 OK                                      │
     │  { data }                                    │
     │◀────────────────────────────────────────────┤
     │                                              │
```

### 6.2 Token Structure

**JWT Payload:**
```json
{
  "id": "user_object_id",
  "iat": 1234567890,
  "exp": 1234567890
}
```

**Token Expiration:** 7 days

**Storage:** localStorage (key: `trophe_user`)

### 6.3 Middleware Implementation

**protect Middleware** (`backend/middleware/auth.middleware.js`):
```javascript
const protect = async (req, res, next) => {
  let token;
  
  // Extract token from Authorization header
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Load user (exclude password)
      req.user = await User.findById(decoded.id).select('-password');
      
      // Check if user exists and is active
      if (!req.user || !req.user.isActive) {
        return res.status(401).json({ message: 'Not authorized' });
      }
      
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token failed' });
    }
  }
  
  if (!token) {
    return res.status(401).json({ message: 'No token' });
  }
};
```

**authorize Middleware**:
```javascript
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role '${req.user.role}' is not authorized`
      });
    }
    next();
  };
};
```

### 6.4 Role-Based Access Control (RBAC)

| Resource | Admin | Faculty | Student |
|----------|-------|---------|---------|
| User Management | Full CRUD | Read own | Read own |
| Course Management | Full CRUD | Read all | Read enrolled |
| Schedule Management | Full CRUD | Read all | Read own |
| Attendance | View all, Mark | View/Mark own courses | View own |
| Announcements | Full CRUD | Create/Edit own | Read only |
| Notifications | View own | View own | View own |

### 6.5 Password Security

**Hashing Algorithm:** bcrypt with salt rounds = 10

**Implementation:**
```javascript
// Pre-save hook in User model
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Password comparison method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
```

### 6.6 Frontend Authentication

**AuthContext** (`frontend/src/context/AuthContext.jsx`):
- Manages authentication state globally
- Stores user data and token in localStorage
- Provides login/logout functions
- Auto-loads user on app initialization

**Protected Routes**:
```javascript
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  
  return children;
};
```

**Axios Interceptors** (`frontend/src/utils/api.js`):
- Automatically attach token to all requests
- Handle 401 errors globally (auto-logout)


---

## 7. FRONTEND ARCHITECTURE

### 7.1 Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Layout.jsx       # Main layout wrapper
│   │   ├── Sidebar.jsx      # Navigation sidebar
│   │   ├── Topbar.jsx       # Top navigation bar
│   │   ├── Modal.jsx        # Reusable modal component
│   │   ├── StatCard.jsx     # Dashboard stat cards
│   │   ├── PageHeader.jsx   # Page title component
│   │   ├── Logo.jsx         # Greek-themed logo
│   │   └── NotificationBell.jsx  # Notification dropdown
│   ├── context/
│   │   └── AuthContext.jsx  # Authentication state management
│   ├── pages/
│   │   ├── admin/           # Admin dashboard pages
│   │   ├── faculty/         # Faculty dashboard pages
│   │   ├── student/         # Student dashboard pages
│   │   ├── shared/          # Shared pages (announcements)
│   │   ├── print/           # Print study load page
│   │   ├── LoginPage.jsx
│   │   └── RegisterPage.jsx
│   ├── utils/
│   │   └── api.js           # Axios instance with interceptors
│   ├── App.jsx              # Main app component with routes
│   ├── main.jsx             # App entry point
│   └── index.css            # Global styles (Tailwind)
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

### 7.2 State Management

**Context API** is used for global state:
- **AuthContext**: User authentication state, login/logout functions
- No Redux/Zustand needed due to simple state requirements

**Local State**: Component-level state using `useState` hook

### 7.3 Routing

**React Router v6** with role-based route protection:

```javascript
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  
  {/* Admin routes */}
  <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Layout /></ProtectedRoute>}>
    <Route index element={<AdminDashboard />} />
    <Route path="users" element={<UsersPage />} />
    <Route path="courses" element={<CoursesPage />} />
    {/* ... more routes */}
  </Route>
  
  {/* Faculty routes */}
  <Route path="/faculty" element={<ProtectedRoute roles={['faculty']}><Layout /></ProtectedRoute>}>
    {/* ... faculty routes */}
  </Route>
  
  {/* Student routes */}
  <Route path="/student" element={<ProtectedRoute roles={['student']}><Layout /></ProtectedRoute>}>
    {/* ... student routes */}
  </Route>
</Routes>
```

### 7.4 Styling Approach

**Tailwind CSS** utility-first approach:
- Custom color palette (dark mode theme)
- Reusable component classes in `index.css`
- Responsive design with mobile-first approach
- Print-specific styles with `@media print`

**Framer Motion** for animations:
- Page transitions
- Modal animations
- Hover effects
- Loading states


---

## 8. BACKEND ARCHITECTURE

### 8.1 Project Structure

```
backend/
├── config/
│   └── db.js                # MongoDB connection
├── controllers/             # Business logic
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── course.controller.js
│   ├── schedule.controller.js
│   ├── attendance.controller.js
│   ├── announcement.controller.js
│   └── notification.controller.js
├── middleware/
│   └── auth.middleware.js   # JWT verification & authorization
├── models/                  # Mongoose schemas
│   ├── User.js
│   ├── Course.js
│   ├── Schedule.js
│   ├── Attendance.js
│   ├── Announcement.js
│   └── Notification.js
├── routes/                  # API routes
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── course.routes.js
│   ├── schedule.routes.js
│   ├── attendance.routes.js
│   ├── announcement.routes.js
│   └── notification.routes.js
├── utils/
│   └── notify.js            # Notification helper
├── .env                     # Environment variables
├── server.js                # App entry point
├── seed.js                  # Database seeder
└── package.json
```

### 8.2 Middleware Chain

```
Request → CORS → JSON Parser → Route Handler → protect → authorize → Controller → Response
```

### 8.3 Error Handling

**Global Error Handler** in `server.js`:
```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});
```

**Controller-level Error Handling**:
```javascript
try {
  // Business logic
} catch (error) {
  res.status(500).json({ message: error.message });
}
```

---

## 9. CORE FEATURES IMPLEMENTATION

### 9.1 Conflict Detection System

**Location**: `backend/controllers/schedule.controller.js`

**Conflict Types Checked**:
1. **Course Conflict**: Same course scheduled twice at overlapping times
2. **Room Conflict**: Same room double-booked
3. **Instructor Conflict**: Faculty teaching two courses simultaneously
4. **Student Conflict**: Student enrolled in overlapping courses

**Algorithm**:
```javascript
const checkConflicts = async (day, startTime, endTime, room, courseId, excludeId) => {
  // 1. Fetch all schedules on same day (excluding current if updating)
  const sameDaySchedules = await Schedule.find({ day, _id: { $ne: excludeId } })
    .populate('course');
  
  // 2. Filter to only overlapping time slots
  const overlapping = sameDaySchedules.filter(s =>
    timesOverlap(startTime, endTime, s.startTime, s.endTime)
  );
  
  // 3. Check each conflict type
  for (const schedule of overlapping) {
    // Check room conflict
    if (room && schedule.room && room === schedule.room) {
      return { conflict: true, type: 'room', message: '...' };
    }
    
    // Check instructor conflict
    if (sameFaculty) {
      return { conflict: true, type: 'instructor', message: '...' };
    }
    
    // Check student conflict
    if (sharedStudents) {
      return { conflict: true, type: 'student', message: '...' };
    }
  }
  
  return { conflict: false };
};
```

### 9.2 Notification System

**Trigger Points**:
- Schedule created/updated/deleted → Notify enrolled students + faculty
- Instructor assigned/changed → Notify students + new faculty
- Student enrolled/unenrolled → Notify the student
- Announcement posted → Notify users matching target roles

**Implementation** (`backend/utils/notify.js`):
```javascript
const createNotifications = async (notifications) => {
  try {
    const items = Array.isArray(notifications) ? notifications : [notifications];
    await Notification.insertMany(items);
  } catch (err) {
    // Non-critical - log but don't crash
    console.error('Notification error:', err.message);
  }
};
```

**Frontend Polling** (`frontend/src/components/NotificationBell.jsx`):
- Polls `/api/notifications/unread-count` every 30 seconds
- Displays unread badge on bell icon
- Dropdown shows last 50 notifications
- Mark as read / delete functionality

### 9.3 Print System

**Location**: `frontend/src/pages/print/PrintStudyLoad.jsx`

**Features**:
- Printer-friendly layout (white background, clean typography)
- `window.print()` for physical printing
- PDF download using jsPDF + autoTable
- Official document formatting with university branding
- Student info, course list, schedule details, total units

**Print Styles**:
```css
@media print {
  body { background: white !important; }
  .no-print { display: none !important; }
  @page { size: A4; margin: 15mm; }
}
```


---

## 10. SECURITY IMPLEMENTATION

### 10.1 Security Measures

| Layer | Implementation | Purpose |
|-------|----------------|---------|
| **Transport** | HTTPS (production) | Encrypt data in transit |
| **Authentication** | JWT tokens | Stateless authentication |
| **Password** | bcrypt hashing (10 rounds) | Secure password storage |
| **Authorization** | Role-based middleware | Access control |
| **Input Validation** | Mongoose schema validation | Prevent invalid data |
| **XSS Protection** | React auto-escaping | Prevent script injection |
| **CORS** | Configured origin whitelist | Prevent unauthorized access |
| **Token Expiry** | 7-day expiration | Limit token lifetime |
| **Inactive Accounts** | isActive flag check | Disable compromised accounts |

### 10.2 Environment Variables

**Required Variables** (`.env`):
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/trophe
JWT_SECRET=your_super_secret_key_here
NODE_ENV=development
```

**Security Best Practices**:
- Never commit `.env` to version control
- Use strong, random JWT_SECRET (32+ characters)
- Different secrets for dev/staging/production
- Rotate secrets periodically

### 10.3 Data Validation

**Mongoose Schema Validation**:
```javascript
email: {
  type: String,
  required: true,
  unique: true,
  lowercase: true,
  trim: true,
  match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/  // Email regex
}
```

**Controller-level Validation**:
- Check for required fields
- Validate data types
- Verify relationships (e.g., student exists before enrollment)
- Prevent duplicate records

### 10.4 SQL Injection Prevention

**Mongoose ODM** automatically prevents SQL injection:
- Parameterized queries
- Type casting
- No raw query execution

---

## 11. DEPLOYMENT GUIDE

### 11.1 Prerequisites

- Node.js 18+ installed
- MongoDB 5.0+ running
- Git installed
- Domain name (for production)
- SSL certificate (Let's Encrypt recommended)

### 11.2 Backend Deployment

**Option 1: Heroku**
```bash
# Install Heroku CLI
heroku login
heroku create trophe-backend

# Set environment variables
heroku config:set MONGO_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_secret
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

**Option 2: DigitalOcean / AWS / Railway**
1. Create a server instance
2. Install Node.js and MongoDB
3. Clone repository
4. Install dependencies: `npm install`
5. Set environment variables
6. Use PM2 for process management:
```bash
npm install -g pm2
pm2 start server.js --name trophe-backend
pm2 startup
pm2 save
```

### 11.3 Frontend Deployment

**Build for Production**:
```bash
cd frontend
npm run build
# Creates dist/ folder with optimized static files
```

**Option 1: Vercel**
```bash
npm install -g vercel
vercel --prod
```

**Option 2: Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

**Option 3: Static Hosting (AWS S3, GitHub Pages)**
- Upload `dist/` folder contents
- Configure routing for SPA (redirect all to index.html)

### 11.4 Database Deployment

**MongoDB Atlas** (Recommended):
1. Create account at mongodb.com/cloud/atlas
2. Create cluster (free tier available)
3. Whitelist IP addresses
4. Create database user
5. Get connection string
6. Update `MONGO_URI` in backend

**Self-hosted MongoDB**:
```bash
# Install MongoDB
sudo apt-get install mongodb

# Start service
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Secure with authentication
mongo
> use admin
> db.createUser({user: "admin", pwd: "password", roles: ["root"]})
```

### 11.5 Environment Configuration

**Production `.env`**:
```
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/trophe
JWT_SECRET=production_secret_key_32_chars_min
NODE_ENV=production
```

**Frontend API URL**:
Update `baseURL` in `frontend/src/utils/api.js`:
```javascript
const api = axios.create({
  baseURL: 'https://your-backend-domain.com/api',
  headers: { 'Content-Type': 'application/json' },
});
```

### 11.6 SSL Certificate

**Let's Encrypt (Free)**:
```bash
sudo apt-get install certbot
sudo certbot --nginx -d your-domain.com
```

**Auto-renewal**:
```bash
sudo certbot renew --dry-run
```

---

## 12. TESTING STRATEGY

### 12.1 Manual Testing Checklist

**Authentication**:
- [ ] Register new user (all roles)
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Access protected route without token
- [ ] Access route with wrong role
- [ ] Token expiration handling

**User Management** (Admin):
- [ ] Create user
- [ ] Update user
- [ ] Delete user
- [ ] Deactivate user
- [ ] Filter users by role

**Course Management**:
- [ ] Create course
- [ ] Update course
- [ ] Delete course
- [ ] Assign faculty
- [ ] Enroll student
- [ ] Unenroll student

**Schedule Management**:
- [ ] Create schedule
- [ ] Detect room conflict
- [ ] Detect instructor conflict
- [ ] Detect student conflict
- [ ] Update schedule
- [ ] Delete schedule

**Attendance**:
- [ ] Mark attendance (bulk)
- [ ] View attendance history
- [ ] View attendance summary
- [ ] Student view own attendance

**Notifications**:
- [ ] Receive notification on schedule change
- [ ] Receive notification on enrollment
- [ ] Mark notification as read
- [ ] Delete notification
- [ ] Unread count updates

**Print System**:
- [ ] View study load
- [ ] Print study load
- [ ] Download PDF

### 12.2 API Testing with Postman

**Collection Structure**:
```
Trophe API
├── Auth
│   ├── Register
│   ├── Login
│   └── Get Me
├── Users
│   ├── Get All Users
│   ├── Create User
│   ├── Update User
│   └── Delete User
├── Courses
│   ├── Get All Courses
│   ├── Create Course
│   ├── Enroll Student
│   └── Unenroll Student
└── ... (other endpoints)
```

**Environment Variables**:
```
base_url: http://localhost:5000/api
token: {{auth_token}}
```

### 12.3 Performance Testing

**Load Testing** (using Apache Bench):
```bash
# Test login endpoint
ab -n 1000 -c 10 -p login.json -T application/json http://localhost:5000/api/auth/login

# Test protected endpoint
ab -n 1000 -c 10 -H "Authorization: Bearer token" http://localhost:5000/api/courses
```

**Expected Performance**:
- Login: < 200ms
- Get courses: < 100ms
- Create schedule: < 300ms (includes conflict detection)
- Mark attendance: < 500ms (bulk operation)


---

## 13. TROUBLESHOOTING

### 13.1 Common Issues

**Issue: MongoDB Connection Error**
```
Error: MongooseServerSelectionError: connect ECONNREFUSED
```
**Solution**:
- Ensure MongoDB is running: `sudo systemctl status mongodb`
- Check `MONGO_URI` in `.env`
- Verify network connectivity
- Check firewall rules

**Issue: JWT Token Invalid**
```
Error: Not authorized, token failed
```
**Solution**:
- Clear localStorage and login again
- Verify `JWT_SECRET` matches between environments
- Check token expiration (7 days)
- Ensure token format: `Bearer <token>`

**Issue: CORS Error**
```
Error: Access to XMLHttpRequest blocked by CORS policy
```
**Solution**:
- Update CORS origin in `backend/server.js`:
```javascript
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
```
- For production, use actual frontend domain

**Issue: Port Already in Use**
```
Error: Port 5000 is already in use
```
**Solution**:
```bash
# Find process using port
lsof -i :5000
# Kill process
kill -9 <PID>
# Or change PORT in .env
```

**Issue: Schedule Conflict Not Detected**
**Solution**:
- Verify course has enrolled students
- Check faculty assignment
- Ensure time format is "HH:MM"
- Review conflict detection logic in controller

**Issue: Notifications Not Appearing**
**Solution**:
- Check notification route is registered in `server.js`
- Verify user role matches `targetRoles`
- Check browser console for API errors
- Ensure polling is active (30s interval)

### 13.2 Debugging Tips

**Backend Debugging**:
```javascript
// Add console logs in controllers
console.log('Request body:', req.body);
console.log('User:', req.user);
console.log('Query result:', result);
```

**Frontend Debugging**:
```javascript
// Check API responses
console.log('API response:', response.data);

// Check auth state
const { user } = useAuth();
console.log('Current user:', user);

// Check localStorage
console.log('Stored user:', localStorage.getItem('trophe_user'));
```

**Database Debugging**:
```bash
# Connect to MongoDB
mongo

# Switch to database
use trophe

# Check collections
show collections

# Query data
db.users.find().pretty()
db.schedules.find({ day: 'Monday' }).pretty()

# Check indexes
db.schedules.getIndexes()
```

### 13.3 Logs

**Backend Logs**:
- Console output shows all requests and errors
- Use `morgan` for HTTP request logging (optional)

**Frontend Logs**:
- Browser console shows React errors
- Network tab shows API requests/responses

**MongoDB Logs**:
```bash
# View MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

---

## 14. APPENDICES

### 14.1 Sample Data

**Sample Admin User**:
```json
{
  "email": "admin@trophe.edu",
  "password": "admin123",
  "role": "admin",
  "firstName": "Admin",
  "lastName": "Trophe"
}
```

**Sample Faculty User**:
```json
{
  "email": "maria.santos@trophe.edu",
  "password": "faculty123",
  "role": "faculty",
  "firstName": "Maria",
  "lastName": "Santos",
  "department": "Computer Science"
}
```

**Sample Student User**:
```json
{
  "email": "juan.delacruz@trophe.edu",
  "password": "student123",
  "role": "student",
  "firstName": "Juan",
  "lastName": "Dela Cruz",
  "studentId": "STU-2024-001",
  "department": "Computer Science"
}
```

**Sample Course**:
```json
{
  "courseCode": "CS101",
  "courseName": "Introduction to Programming",
  "description": "Fundamentals of programming using Python",
  "units": 3,
  "department": "Computer Science"
}
```

**Sample Schedule**:
```json
{
  "course": "course_object_id",
  "day": "Monday",
  "startTime": "08:00",
  "endTime": "09:30",
  "room": "Room 101",
  "semester": "1st Semester",
  "schoolYear": "2024-2025"
}
```

### 14.2 Useful Commands

**Backend**:
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Seed database
node seed.js

# Start production server
npm start
```

**Frontend**:
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**Database**:
```bash
# Start MongoDB
sudo systemctl start mongodb

# Stop MongoDB
sudo systemctl stop mongodb

# MongoDB shell
mongo

# Backup database
mongodump --db trophe --out /backup/

# Restore database
mongorestore --db trophe /backup/trophe/
```

### 14.3 Code Conventions

**Naming Conventions**:
- Variables/Functions: camelCase (`getUserById`, `courseData`)
- Components: PascalCase (`UserCard`, `LoginPage`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_RETRIES`)
- Files: PascalCase for components, camelCase for utilities

**Code Style**:
- 2 spaces indentation
- Single quotes for strings
- Semicolons required
- Arrow functions preferred
- Async/await over promises

**Git Commit Messages**:
```
feat: Add notification system
fix: Resolve schedule conflict detection bug
docs: Update API documentation
style: Format code with prettier
refactor: Simplify authentication logic
test: Add unit tests for user controller
```

### 14.4 Resources

**Official Documentation**:
- React: https://react.dev/
- Express: https://expressjs.com/
- MongoDB: https://docs.mongodb.com/
- Mongoose: https://mongoosejs.com/
- Tailwind CSS: https://tailwindcss.com/

**Learning Resources**:
- MERN Stack Tutorial: https://www.mongodb.com/mern-stack
- JWT Authentication: https://jwt.io/introduction
- REST API Best Practices: https://restfulapi.net/

**Community**:
- Stack Overflow: https://stackoverflow.com/
- GitHub Issues: Report bugs and feature requests
- Discord/Slack: Developer community channels

---

## DOCUMENT REVISION HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-04-23 | Justice League | Initial technical documentation |

---

**END OF TECHNICAL DOCUMENTATION**

For additional support or questions, contact the development team or refer to the project repository.

