# Trophe — Smart Campus Management System
## System Documentation

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Scope and Limitations](#2-scope-and-limitations)
3. [Purpose and Benefits](#3-purpose-and-benefits)
4. [Featured Functionalities](#4-featured-functionalities)
5. [System Requirements and Specifications](#5-system-requirements-and-specifications)
6. [System Architecture, Frameworks, and Models](#6-system-architecture-frameworks-and-models)
7. [Technologies Used](#7-technologies-used)
8. [Deployment](#8-deployment)
9. [References](#9-references)

---

## 1. Introduction

**Trophe** is a web-based Smart Campus Management System designed to streamline the core academic operations of an educational institution. The system provides a centralized platform where administrators, faculty members, and students can manage and access information related to courses, class schedules, attendance, and institutional announcements — all from a single, role-aware interface.

The name *Trophe* (from the Greek root meaning nourishment or growth) reflects the system's goal: to support the academic growth of students and the operational efficiency of campus staff through technology.

Trophe is built on the MERN stack (MongoDB, Express.js, React, Node.js) and follows a RESTful API architecture. It enforces role-based access control (RBAC) to ensure that each user type — admin, faculty, or student — only sees and interacts with the features relevant to their role.

---

## 2. Scope and Limitations

### Scope

Trophe covers the following operational areas of a campus:

- **User Management** — Registration, authentication, and profile management for admins, faculty, and students.
- **Course Management** — Creation, assignment, and enrollment management for academic courses.
- **Schedule Management** — Class scheduling with automated conflict detection across rooms, instructors, and students.
- **Attendance Tracking** — Bulk attendance marking by faculty and admins, with per-student and per-course reporting.
- **Announcements** — Role-targeted announcements posted by admins and faculty.
- **Notifications** — Automated in-app notifications triggered by system events such as enrollment, schedule changes, and new announcements.
- **Study Load Printing** — Students can generate and download a PDF of their enrolled courses and class schedule.

### Limitations

- **No real-time communication** — The system does not include live chat, video conferencing, or real-time collaborative tools.
- **No grade management** — Academic grading, GWA computation, and transcript generation are outside the current scope.
- **No payment or billing module** — Tuition fees, enrollment fees, and financial transactions are not handled.
- **No mobile application** — Trophe is a web application and does not have a dedicated iOS or Android app, though the interface is responsive.
- **No email or SMS notifications** — All notifications are in-app only; external messaging channels are not integrated.
- **Single institution** — The system is designed for a single campus or institution and does not support multi-tenant configurations.
- **No offline support** — The application requires an active internet connection and does not function offline.
- **Manual enrollment** — Student enrollment into courses is performed by administrators; self-enrollment by students is not supported.

---

## 3. Purpose and Benefits

### Purpose

Trophe was developed to address the inefficiencies of manual, paper-based, or fragmented campus management processes. Its primary purpose is to provide a unified digital platform that connects administrators, faculty, and students, reducing administrative overhead and improving the flow of academic information.

### Benefits

**For Administrators**
- Centralized control over users, courses, and schedules from a single dashboard.
- Automated conflict detection when creating or updating class schedules prevents double-booking of rooms and instructors.
- Real-time visibility into attendance data across all courses.
- Efficient communication with faculty and students through targeted announcements.

**For Faculty**
- Quick access to assigned courses and enrolled student lists.
- Streamlined bulk attendance marking — mark an entire class in one submission.
- Ability to post announcements directly to students.
- Automatic notifications when course assignments or schedules change.

**For Students**
- A clear, organized view of enrolled courses, class schedules, and attendance records.
- Instant notifications for enrollment confirmations, schedule updates, and new announcements.
- Printable study load in PDF format for official or personal use.
- Transparent attendance tracking with status breakdowns (present, absent, late, excused).

---

## 4. Featured Functionalities

### 4.1 Role-Based Access Control

Trophe enforces three distinct user roles — **Admin**, **Faculty**, and **Student** — each with a dedicated dashboard and a specific set of permitted actions. Access to routes and API endpoints is protected by JWT authentication and role-based authorization middleware.

---

### 4.2 Admin Features

| Feature | Description |
|---|---|
| **User Management** | Create, view, update, and deactivate user accounts for all roles. |
| **Course Management** | Create and manage courses including code, name, units, department, and faculty assignment. |
| **Student Enrollment** | Enroll or unenroll students in courses; triggers automatic notifications. |
| **Schedule Management** | Create and manage class schedules with day, time, room, semester, and school year. |
| **Conflict Detection** | Automatically detects and blocks scheduling conflicts for rooms, instructors, and students. |
| **Attendance Management** | View and manage attendance records across all courses. |
| **Announcements** | Post announcements targeted to specific roles (admin, faculty, student, or all). |
| **Admin Dashboard** | Overview of system statistics including total users, courses, and schedules. |

---

### 4.3 Faculty Features

| Feature | Description |
|---|---|
| **My Courses** | View all courses assigned to the logged-in faculty member. |
| **Attendance Marking** | Bulk-mark attendance for all students in a course for a given date. |
| **Attendance Records** | View attendance history per course, filterable by date. |
| **Announcements** | Create and manage announcements targeted to students or all roles. |
| **Notifications** | Receive in-app notifications for course assignments, schedule changes, and announcements. |
| **Faculty Dashboard** | Summary view of assigned courses and recent activity. |

---

### 4.4 Student Features

| Feature | Description |
|---|---|
| **My Courses** | View all courses the student is enrolled in, including faculty and unit information. |
| **Class Schedule** | View weekly class schedule with day, time, room, semester, and school year. |
| **Attendance Records** | View personal attendance per course with status breakdown and attendance percentage. |
| **Announcements** | Read announcements posted by admins and faculty. |
| **Notifications** | Receive in-app notifications for enrollment changes, schedule updates, and announcements. |
| **Print Study Load** | Generate and download a PDF of enrolled courses and schedule. |
| **Student Dashboard** | Overview of enrolled courses, upcoming schedule, and recent notifications. |

---

### 4.5 Notification System

Notifications are automatically generated by the system when key events occur:

- Student enrolled or unenrolled from a course
- Class schedule created or modified
- Faculty assigned or reassigned to a course
- New announcement posted
- Attendance marked for a student

Each notification includes a title, message, read/unread status, and an optional link to the relevant page. Users can mark individual or all notifications as read.

---

### 4.6 Schedule Conflict Detection

When creating or updating a class schedule, the system checks for four types of conflicts:

1. **Course conflict** — The same course is already scheduled at the same time on the same day.
2. **Room conflict** — The room is already occupied by another course at the overlapping time.
3. **Instructor conflict** — The assigned faculty member is already teaching another course at the same time.
4. **Student conflict** — One or more students enrolled in the course are already scheduled in another course at the same time.

If any conflict is detected, the schedule is rejected and a descriptive error message is returned.

---

### 4.7 PDF Study Load Export

Students can generate a printable PDF of their study load, which includes their enrolled courses (course code, course name, units, faculty, schedule) formatted for official or personal use. The PDF is generated client-side using jsPDF and jspdf-autotable.

---

## 5. System Requirements and Specifications

### 5.1 Server Requirements (Backend)

| Component | Minimum Requirement |
|---|---|
| **Runtime** | Node.js v18.0 or higher |
| **Package Manager** | npm v9.0 or higher |
| **Database** | MongoDB v6.0 or higher (local or Atlas) |
| **RAM** | 512 MB minimum (1 GB recommended) |
| **Storage** | 500 MB minimum for application and dependencies |
| **Network** | Stable internet connection for MongoDB Atlas (if cloud-hosted) |

### 5.2 Client Requirements (Frontend)

| Component | Minimum Requirement |
|---|---|
| **Browser** | Chrome 90+, Firefox 88+, Edge 90+, Safari 14+ |
| **JavaScript** | Must be enabled |
| **Screen Resolution** | 1024 × 768 minimum (1280 × 720 recommended) |
| **Internet** | Required for all operations |

### 5.3 Development Environment

| Tool | Version |
|---|---|
| Node.js | v18+ |
| npm | v9+ |
| Vite | v5.0.8 |
| MongoDB | v6+ or MongoDB Atlas |
| Git | Any recent version |

### 5.4 Environment Variables

The backend requires the following environment variables defined in `backend/.env`:

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port the Express server listens on | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `your_secret_key` |
| `NODE_ENV` | Application environment | `development` or `production` |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:5173` |
| `ENABLE_SEED` | Enable seed route in production | `true` or `false` |

---

## 6. System Architecture, Frameworks, and Models

### 6.1 Architecture Overview

Trophe follows a **three-tier client-server architecture**:

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT TIER                         │
│         React SPA (Vite) — Port 5173                    │
│   Role-based routing, Axios HTTP client, JWT auth       │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP/REST (JSON)
                         │ Authorization: Bearer <token>
┌────────────────────────▼────────────────────────────────┐
│                   APPLICATION TIER                      │
│         Express.js REST API — Port 5000                 │
│   JWT middleware, RBAC, Controllers, Business Logic     │
└────────────────────────┬────────────────────────────────┘
                         │ Mongoose ODM
┌────────────────────────▼────────────────────────────────┐
│                     DATA TIER                           │
│              MongoDB (Atlas or Local)                   │
│   Collections: Users, Courses, Schedules,               │
│   Attendance, Announcements, Notifications              │
└─────────────────────────────────────────────────────────┘
```

### 6.2 Request Flow

1. The user submits credentials via the login form.
2. The frontend sends `POST /api/auth/login` to the Express server.
3. The server validates credentials, generates a JWT (7-day expiry), and returns it.
4. The frontend stores the token in `localStorage` and attaches it to all subsequent requests via the `Authorization: Bearer <token>` header.
5. The `protect` middleware on the backend verifies the token and attaches the user object to `req.user`.
6. The `authorize` middleware checks the user's role against the route's allowed roles.
7. The controller executes the business logic and returns a JSON response.
8. The frontend renders the response data.

### 6.3 Frontend Architecture

The frontend is a **React Single Page Application (SPA)** structured as follows:

```
frontend/src/
├── App.jsx                  # Root component with route definitions
├── main.jsx                 # React DOM entry point
├── index.css                # Global styles
├── components/              # Reusable UI components
│   ├── Layout.jsx           # Main layout with sidebar and topbar
│   ├── Sidebar.jsx          # Role-aware navigation sidebar
│   ├── Topbar.jsx           # Top navigation bar
│   ├── NotificationBell.jsx # Notification dropdown
│   ├── Modal.jsx            # Reusable modal dialog
│   ├── StatCard.jsx         # Dashboard statistic card
│   ├── PageHeader.jsx       # Page title header
│   └── Logo.jsx             # Application logo
├── context/
│   └── AuthContext.jsx      # Global auth state (user, login, logout)
├── pages/
│   ├── LoginPage.jsx        # Authentication page
│   ├── admin/               # Admin-only pages
│   ├── faculty/             # Faculty-only pages
│   ├── student/             # Student-only pages
│   ├── shared/              # Shared pages (e.g., Announcements)
│   └── print/               # Print-only views (no layout)
└── utils/
    └── api.js               # Axios instance with interceptors
```

**Routing** is handled by React Router DOM v6 with protected routes that enforce role-based access. Unauthenticated users are redirected to `/login`. Authenticated users are redirected to their role-specific dashboard (`/admin`, `/faculty`, or `/student`).

### 6.4 Backend Architecture

The backend is a **Node.js/Express REST API** structured as follows:

```
backend/
├── server.js                # Express app setup, middleware, route mounting
├── seed.js                  # Database seeder for demo data
├── config/
│   └── db.js                # MongoDB connection setup
├── middleware/
│   └── auth.middleware.js   # JWT protect + role authorize middleware
├── models/                  # Mongoose schemas and models
├── controllers/             # Business logic per resource
├── routes/                  # Express route definitions
└── utils/
    └── notify.js            # Notification creation helper
```

### 6.5 Database Models

#### User
Represents all system users (admin, faculty, student).

| Field | Type | Description |
|---|---|---|
| `studentId` | String | Unique student identifier (students only) |
| `firstName` | String | First name (required) |
| `lastName` | String | Last name (required) |
| `email` | String | Unique email address (required) |
| `password` | String | Bcrypt-hashed password (required) |
| `role` | String | `admin`, `faculty`, or `student` |
| `department` | String | Academic department |
| `isActive` | Boolean | Account active status (default: true) |

---

#### Course
Represents an academic course offered by the institution.

| Field | Type | Description |
|---|---|---|
| `courseCode` | String | Unique course code (e.g., CS101) |
| `courseName` | String | Full course name |
| `description` | String | Course description |
| `units` | Number | Credit units (1–6) |
| `department` | String | Offering department |
| `faculty` | ObjectId | Reference to assigned faculty User |
| `students` | [ObjectId] | Array of enrolled student User references |
| `isActive` | Boolean | Course active status |

---

#### Schedule
Represents a class schedule entry for a course.

| Field | Type | Description |
|---|---|---|
| `course` | ObjectId | Reference to Course (required) |
| `day` | String | Day of week (Monday–Sunday) |
| `startTime` | String | Start time in HH:MM format |
| `endTime` | String | End time in HH:MM format |
| `room` | String | Classroom or room identifier |
| `semester` | String | Academic semester (e.g., 1st Semester) |
| `schoolYear` | String | School year (e.g., 2024–2025) |

---

#### Attendance
Records a single student's attendance for a course on a specific date.

| Field | Type | Description |
|---|---|---|
| `student` | ObjectId | Reference to student User (required) |
| `course` | ObjectId | Reference to Course (required) |
| `date` | Date | Date of attendance (required) |
| `status` | String | `present`, `absent`, `late`, or `excused` |
| `markedBy` | ObjectId | Reference to User who marked attendance |
| `remarks` | String | Optional notes |

*Unique index on `{ student, course, date }` prevents duplicate records.*

---

#### Announcement
Represents a system-wide or role-targeted announcement.

| Field | Type | Description |
|---|---|---|
| `title` | String | Announcement title (required) |
| `content` | String | Announcement body (required) |
| `author` | ObjectId | Reference to User who created it |
| `targetRoles` | [String] | Roles that can see this announcement |
| `isPinned` | Boolean | Whether the announcement is pinned to the top |
| `isActive` | Boolean | Soft-delete flag |

---

#### Notification
Represents an in-app notification sent to a specific user.

| Field | Type | Description |
|---|---|---|
| `recipient` | ObjectId | Reference to target User (required) |
| `type` | String | Event type (e.g., `enrollment`, `schedule_changed`) |
| `title` | String | Short notification title |
| `message` | String | Full notification message |
| `isRead` | Boolean | Read status (default: false) |
| `link` | String | Optional frontend route for navigation |
| `meta` | Mixed | Additional context data |

*Indexed on `{ recipient, isRead, createdAt }` for efficient querying.*

### 6.6 API Endpoints Summary

#### Authentication — `/api/auth`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/login` | Public | Authenticate user, return JWT |
| GET | `/me` | Private | Get current user profile |

#### Users — `/api/users`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Admin | List all users |
| POST | `/` | Admin | Create a new user |
| GET | `/:id` | Admin | Get user by ID |
| PUT | `/:id` | Admin | Update user |
| DELETE | `/:id` | Admin | Delete user |

#### Courses — `/api/courses`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Private | List all courses |
| POST | `/` | Admin | Create a course |
| GET | `/my-courses` | Student | Get enrolled courses |
| GET | `/my-teaching` | Faculty | Get teaching courses |
| GET | `/:id` | Private | Get course by ID |
| PUT | `/:id` | Admin | Update course |
| DELETE | `/:id` | Admin | Delete course |
| POST | `/:id/enroll` | Admin | Enroll a student |
| POST | `/:id/unenroll` | Admin | Unenroll a student |

#### Schedules — `/api/schedules`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Private | List all schedules |
| POST | `/` | Admin | Create a schedule |
| GET | `/my-schedule` | Student | Get personal schedule |
| GET | `/:id` | Private | Get schedule by ID |
| PUT | `/:id` | Admin | Update schedule |
| DELETE | `/:id` | Admin | Delete schedule |

#### Attendance — `/api/attendance`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/mark` | Admin, Faculty | Bulk mark attendance |
| GET | `/my-attendance` | Student | Get personal attendance |
| GET | `/course/:courseId` | Admin, Faculty | Get course attendance |
| GET | `/summary/:studentId/:courseId` | Private | Get attendance summary |

#### Announcements — `/api/announcements`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Private | Get role-filtered announcements |
| POST | `/` | Admin, Faculty | Create announcement |
| PUT | `/:id` | Admin, Faculty | Update announcement |
| DELETE | `/:id` | Admin, Faculty | Delete announcement |

#### Notifications — `/api/notifications`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Private | Get user notifications (last 50) |
| GET | `/unread-count` | Private | Get unread count |
| PUT | `/:id/read` | Private | Mark one as read |
| PUT | `/mark-all-read` | Private | Mark all as read |
| DELETE | `/:id` | Private | Delete notification |

---

## 7. Technologies Used

### 7.1 Backend

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | v18+ | JavaScript runtime environment |
| **Express.js** | v4.18.2 | Web framework for building the REST API |
| **MongoDB** | v7.2.0 | NoSQL document database |
| **Mongoose** | v8.0.3 | MongoDB ODM for schema definition and queries |
| **jsonwebtoken** | v9.0.2 | JWT generation and verification for authentication |
| **bcryptjs** | v2.4.3 | Password hashing and comparison |
| **cors** | v2.8.5 | Cross-Origin Resource Sharing middleware |
| **dotenv** | v16.3.1 | Environment variable management |
| **nodemon** | v3.0.2 | Auto-restart server during development |

### 7.2 Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | v18.2.0 | UI component library |
| **Vite** | v5.0.8 | Frontend build tool and dev server |
| **React Router DOM** | v6.21.1 | Client-side routing and navigation |
| **Axios** | v1.6.2 | HTTP client for API requests |
| **Tailwind CSS** | v3.4.0 | Utility-first CSS framework for styling |
| **Framer Motion** | v10.16.16 | Animation library for UI transitions |
| **React Hot Toast** | v2.4.1 | Toast notification system |
| **React Icons** | v4.12.0 | Icon library |
| **jsPDF** | v2.5.1 | Client-side PDF generation |
| **jspdf-autotable** | v3.8.1 | Table plugin for jsPDF |
| **@dnd-kit/core** | v6.3.1 | Drag-and-drop interaction toolkit |
| **PostCSS** | v8.4.32 | CSS transformation tool (used with Tailwind) |
| **Autoprefixer** | v10.4.16 | Adds vendor prefixes to CSS |

### 7.3 Development Tools

| Tool | Purpose |
|---|---|
| **Git** | Version control |
| **Postman** | API testing and documentation |
| **MongoDB Atlas** | Cloud-hosted MongoDB service |
| **VS Code / Kiro** | Code editor and AI-assisted development |

---

## 8. Deployment

### 8.1 Local Development Setup

**Prerequisites:** Node.js v18+, npm v9+, MongoDB (local or Atlas URI)

**1. Clone the repository**
```bash
git clone <repository-url>
cd trophe
```

**2. Install backend dependencies**
```bash
cd backend
npm install
```

**3. Configure environment variables**

Create `backend/.env`:
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/trophe
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**4. Seed the database (optional)**
```bash
npm run seed
```

**5. Start the backend server**
```bash
npm run dev
```

**6. Install frontend dependencies**
```bash
cd ../frontend
npm install
```

**7. Start the frontend dev server**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`. The frontend proxies all `/api` requests to the backend at `http://localhost:5000`.

---

### 8.2 Production Deployment

#### Backend

The backend can be deployed to any Node.js-compatible hosting platform such as **Render**, **Railway**, **Heroku**, or **DigitalOcean App Platform**.

1. Set all required environment variables on the hosting platform.
2. Set `NODE_ENV=production`.
3. Use `npm start` as the start command (`node server.js`).
4. Use a **MongoDB Atlas** cluster as the database.

#### Frontend

The frontend is a static SPA built with Vite and can be deployed to **Vercel**, **Netlify**, or **AWS S3 + CloudFront**.

1. Build the production bundle:
   ```bash
   cd frontend
   npm run build
   ```
2. Deploy the generated `frontend/dist/` directory to your static hosting provider.
3. Set the `VITE_API_URL` environment variable to the deployed backend URL (e.g., `https://api.trophe.edu/api`).
4. Configure the hosting provider to redirect all routes to `index.html` for SPA routing.

#### Environment Variable for Production Frontend

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `https://api.trophe.edu/api` |

---

### 8.3 Demo Credentials

The seed script populates the database with the following demo accounts:

| Role | Email | Password | Student ID |
|---|---|---|---|
| Admin | admin@trophe.edu | admin123 | — |
| Faculty | maria.santos@trophe.edu | faculty123 | — |
| Faculty | jose.reyes@trophe.edu | faculty123 | — |
| Student | juan.delacruz@trophe.edu | student123 | STU-2024-001 |
| Student | ana.gonzales@trophe.edu | student123 | STU-2024-002 |
| Student | carlos.mendoza@trophe.edu | student123 | STU-2024-003 |

---

## 9. References

- **Node.js Documentation** — https://nodejs.org/en/docs
- **Express.js Documentation** — https://expressjs.com/en/4x/api.html
- **MongoDB Documentation** — https://www.mongodb.com/docs/
- **Mongoose Documentation** — https://mongoosejs.com/docs/
- **JSON Web Tokens (JWT)** — https://jwt.io/introduction
- **bcryptjs** — https://github.com/dcodeIO/bcrypt.js
- **React Documentation** — https://react.dev
- **React Router DOM v6** — https://reactrouter.com/en/main
- **Vite Documentation** — https://vitejs.dev/guide/
- **Tailwind CSS Documentation** — https://tailwindcss.com/docs
- **Axios Documentation** — https://axios-http.com/docs/intro
- **Framer Motion Documentation** — https://www.framer.com/motion/
- **jsPDF Documentation** — https://artskydj.github.io/jsPDF/docs/
- **React Hot Toast** — https://react-hot-toast.com/docs
- **@dnd-kit Documentation** — https://docs.dndkit.com/
- **MongoDB Atlas** — https://www.mongodb.com/atlas/database
- **Render (Deployment)** — https://render.com/docs
- **Vercel (Deployment)** — https://vercel.com/docs

---

*Document version: 1.0 — April 2026*
