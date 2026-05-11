# Trophe — Backend PPT Slide Content
### What to put on each slide + what to say

> This covers the backend-specific slides only.
> Copy the bullet points directly onto your slides. The "What to say" sections are your spoken script.

---

## SLIDE — What is the Backend?

**Slide Title:** The Backend — The Engine Behind Trophe

**Bullet points for the slide:**
- The backend is the server-side of the system
- Built with Node.js and Express.js
- Handles all data storage, business logic, and security
- The frontend never touches the database directly — everything goes through the backend first
- Exposes 36 API endpoints across 7 modules

**What to say:**
> "The backend is the part of the system the user never sees, but it powers everything. When a student checks their schedule, when a faculty member marks attendance, when an admin creates a course — all of that goes through the backend. It receives the request, processes the logic, talks to the database, and sends back the result. The frontend is just the face. The backend is the brain."

---

## SLIDE — System Architecture

**Slide Title:** 3-Tier Client-Server Architecture

**Bullet points for the slide:**
- Client-Server Architecture — frontend and backend are separate systems
- 3 tiers: Presentation → Application Logic → Data
- Communication through a REST API over HTTP
- Frontend (React) sends requests → Backend (Express) processes them → Database (MongoDB) stores the data
- Axios is the HTTP client that sends requests from the browser
- CORS allows the frontend and backend to communicate across different ports

**Diagram to draw on the slide:**
```
[ React Frontend ]  ──Axios──►  [ Express Backend ]  ──Mongoose──►  [ MongoDB ]
  localhost:5173    ◄──JSON──    localhost:5000        ◄──Documents──
```

**What to say:**
> "The system follows a 3-tier client-server architecture. The first tier is the React frontend — what the user sees and interacts with. The second tier is the Express backend — where all the business logic runs. The third tier is MongoDB — where all the data is stored. These three layers are completely separate. The frontend communicates with the backend through HTTP requests using a library called Axios. The backend communicates with the database through Mongoose. The frontend never touches the database directly."

**If asked about CORS:**
> "CORS stands for Cross-Origin Resource Sharing. The frontend runs on port 5173 and the backend runs on port 5000. Browsers block requests between different ports by default for security. CORS is the backend's way of saying 'I allow requests from that origin.' Without it, Axios's requests would be blocked before they even reach Express."

---

## SLIDE — Backend Tech Stack

**Slide Title:** Backend Technologies

**Bullet points for the slide:**
- **Node.js** — JavaScript runtime, executes the server code
- **Express.js** — web framework, handles routing and HTTP requests
- **MongoDB** — NoSQL database, stores data as JSON-like documents
- **Mongoose** — defines data structure and validates before saving
- **JWT (jsonwebtoken)** — handles authentication via signed tokens
- **bcryptjs** — hashes passwords before storing, never saves plain text
- **dotenv** — keeps secrets (DB credentials, JWT key) out of the code

**What to say:**
> "On the backend we used the MERN stack — specifically Node.js as the runtime, Express as the web framework, MongoDB as the database, and Mongoose as the layer that connects them. For security, we used JWT for authentication and bcryptjs for password hashing. Environment variables managed through dotenv keep sensitive values like the database password and JWT secret out of the source code entirely."

**If asked why JavaScript on the backend:**
> "Using JavaScript on both sides means the same language across the entire codebase. No context switching between languages, easier to maintain, and the same data structures — JSON — flow naturally from the database all the way to the browser."

---

## SLIDE — MVC Pattern

**Slide Title:** How the Backend is Organized — MVC

**Bullet points for the slide:**
- Backend follows the MVC pattern — Model, View, Controller
- **Model** — defines the shape and rules of the data (Mongoose schemas)
- **Controller** — contains the business logic for each feature
- **Route** — maps a URL to a controller function
- The View is handled by the React frontend
- Each feature has its own model, controller, and route file

**Diagram to draw on the slide:**
```
HTTP Request
     │
     ▼
  Route          → "which controller handles this URL?"
     │
     ▼
  Controller     → "what logic runs? what does the DB need?"
     │
     ▼
  Model          → "validate the data, talk to MongoDB"
     │
     ▼
  MongoDB        → stores or retrieves the document
     │
     ▼
HTTP Response    → JSON sent back to the frontend
```

**What to say:**
> "The backend is organized using the MVC pattern — Model, View, Controller. The Route is the entry point — it receives the HTTP request and hands it off to the right controller function. The Controller is where the actual logic lives — it decides what to do, calls the database, and builds the response. The Model defines what the data looks like and enforces rules before anything is saved. For example, the Attendance model enforces that you cannot mark the same student twice for the same course on the same date — that rule lives in the model, not the controller."

---

## SLIDE — Database Models

**Slide Title:** 6 Database Collections

**Bullet points for the slide:**
- MongoDB stores data in **collections** (equivalent to tables)
- The system has 6 collections, each defined by a Mongoose schema
- **Users** — stores all accounts with role, department, hashed password
- **Courses** — stores course catalog with faculty and student references
- **Schedules** — stores class time slots linked to courses
- **Attendance** — stores per-student, per-course, per-date records
- **Announcements** — stores bulletin posts with role-based visibility
- **Notifications** — stores in-app alerts per user

**What to say:**
> "The database has six collections. Each one is defined by a Mongoose schema that specifies exactly what fields are allowed, what type they must be, and what rules they must follow. For example, the Course model stores the course code, name, units, type — lecture or laboratory — and references to the assigned faculty and all enrolled students. Those references are MongoDB ObjectIds that link to records in the Users collection. When the frontend requests a course, Mongoose automatically populates those references with the actual names and details — this is called population."

---

## SLIDE — Authentication Flow

**Slide Title:** How Authentication Works — JWT

**Bullet points for the slide:**
- No sessions — the system uses **stateless JWT authentication**
- User logs in with email and password
- Backend verifies password using bcrypt comparison
- If valid, backend signs a **JWT token** with a secret key — expires in 7 days
- Token is stored in the browser and sent with every request
- Every protected route runs the `protect` middleware first
- Middleware verifies the token, fetches the user, checks if account is active

**Diagram to draw on the slide:**
```
1. POST /api/auth/login  →  email + password
2. bcrypt compares password to stored hash
3. Match ✓  →  JWT token generated and returned
4. Frontend stores token
5. Every future request:  Authorization: Bearer <token>
6. protect() middleware verifies token → attaches user to request
7. Controller runs with req.user available
```

**What to say:**
> "Authentication uses JWT — JSON Web Tokens. When a user logs in, the backend verifies their password using bcrypt — it never stores the plain-text password, only a hash. If the password matches, the backend generates a signed token containing the user's ID and returns it. The frontend stores this token and attaches it to every subsequent request in the Authorization header. On the backend, the protect middleware intercepts every protected request, verifies the token's signature, fetches the user from the database, and checks that the account is still active. Only then does the request reach the controller."

**If asked what happens if the token is stolen:**
> "The token expires after 7 days, so the window of exposure is limited. The token cannot be used to change the password or generate new tokens — it only proves identity. If a token is compromised, changing the JWT_SECRET in the environment variables immediately invalidates all existing tokens system-wide."

---

## SLIDE — Role-Based Access Control

**Slide Title:** 3 Roles, 2 Middleware Layers

**Bullet points for the slide:**
- Every protected route passes through 2 middleware checks
- **Layer 1 — `protect()`** — verifies the JWT token (are you logged in?)
- **Layer 2 — `authorize()`** — checks the user's role (are you allowed here?)
- Three roles: Admin, Faculty, Student
- Admin has two tiers: Super Admin (full access) and Sub-Admin (restricted by permissions)
- If either check fails, the request is rejected before any logic runs

**Table for the slide:**

| Action | Admin | Faculty | Student |
|---|---|---|---|
| Create/delete users | ✅ | ❌ | ❌ |
| Create courses | ✅ | ❌ | ❌ |
| Enroll students | ✅ | ❌ | ❌ |
| Create schedules | ✅ | ❌ | ❌ |
| Mark attendance | ✅ | ✅ | ❌ |
| Post announcements | ✅ | ✅ | ❌ |
| View own schedule | ✅ | ✅ | ✅ |
| Print study load | ❌ | ❌ | ✅ |

**What to say:**
> "Every route in the system is protected by two layers of middleware. The first layer — protect — checks that the user is logged in by verifying their token. The second layer — authorize — checks that their role is allowed to access that specific route. For example, the route to create a schedule is wrapped with authorize('admin') — if a faculty member or student tries to call it, they get a 403 Forbidden response before any logic runs. The role is stored in the database and embedded in the JWT token, so it cannot be tampered with on the client side."

---

## SLIDE — Schedule Conflict Detection

**Slide Title:** Automated Schedule Conflict Detection

**Bullet points for the slide:**
- Every schedule creation and update runs a 4-layer conflict check
- **Room conflict** — same room cannot be used by two courses at the same time
- **Instructor conflict** — a faculty member cannot teach two courses simultaneously
- **Student conflict** — a student enrolled in both courses cannot have overlapping schedules
- **Course conflict** — the same course cannot be scheduled twice in the same slot
- If any conflict is found → API returns **409 Conflict** with a specific message
- Nothing is saved until all four checks pass

**Overlap formula for the slide:**
```
Two time slots overlap if:
  startA < endB  AND  endA > startB
```

**What to say:**
> "The conflict detection system is one of the most technically interesting parts of the backend. Before any schedule is saved, the system fetches all existing schedules on the same day and checks four types of conflicts. The time overlap check uses a simple mathematical formula — two slots overlap if the first starts before the second ends, and the first ends after the second starts. This covers every possible overlap scenario. If a conflict is found, the API returns a 409 status code with a message that tells the admin exactly what the conflict is — for example, 'Room 101 is already occupied on Monday from 08:00 to 09:30 by CS102.' The admin can then resolve it before trying again."

---

## SLIDE — Notification System

**Slide Title:** Event-Driven In-App Notifications

**Bullet points for the slide:**
- Notifications are stored in the database, not sent via email or SMS
- Created automatically when significant events occur
- **9 notification types:** enrollment, unenrollment, schedule created, schedule changed, instructor assigned, instructor changed, announcement, attendance marked, course updated
- Uses a shared utility function `createNotifications()` called from controllers
- Non-critical by design — a notification failure never breaks the main operation
- Frontend polls for unread count every 30 seconds to update the bell badge

**What to say:**
> "The notification system is event-driven. Whenever something significant happens in the system — a student is enrolled, a schedule is changed, a new announcement is posted — the relevant users are automatically notified. This is handled by a shared utility function called createNotifications that any controller can call. It accepts a single notification or an array and inserts them all into the database at once. One important design decision: notifications are treated as non-critical. If the notification insert fails for any reason, the error is logged but the original operation — the enrollment, the schedule save — still succeeds. This prevents a notification bug from breaking core features."

---

## SLIDE — API Overview

**Slide Title:** 36 RESTful API Endpoints — 7 Modules

**Bullet points for the slide:**
- All communication between frontend and backend goes through the REST API
- Base URL: `http://localhost:5000/api`
- 7 modules: Auth, Users, Courses, Schedules, Attendance, Announcements, Notifications
- All responses are in JSON format
- Protected routes require `Authorization: Bearer <token>` header
- Standard HTTP status codes: 200, 201, 400, 401, 403, 404, 409, 500

**Table for the slide:**

| Module | Endpoints | Access |
|---|---|---|
| Auth | 2 | Public + Private |
| Users | 6 | Admin only |
| Courses | 9 | Mixed |
| Schedules | 6 | Mixed |
| Attendance | 4 | Mixed |
| Announcements | 4 | Mixed |
| Notifications | 5 | All logged-in users |

**What to say:**
> "The backend exposes 36 RESTful API endpoints organized into 7 modules. Each module maps to one feature area of the system. REST means each URL represents a resource — like users or courses — and the HTTP method tells the server what to do with it. GET retrieves data, POST creates new data, PUT updates existing data, and DELETE removes it. Every response comes back as JSON. Protected endpoints require the JWT token in the Authorization header — without it, the server returns 401 Unauthorized before any logic runs."

---

## SLIDE — Request Flow (End to End)

**Slide Title:** What Happens When You Click a Button

**Bullet points for the slide:**
- Every user action in the frontend triggers an HTTP request
- The request travels through: Route → Middleware → Controller → Model → Database
- The response travels back: Database → Controller → JSON → Frontend → UI update

**Diagram for the slide:**
```
User clicks "Mark Attendance"
          │
          ▼
Axios sends POST /api/attendance/mark
  + Authorization: Bearer <token>
  + Body: { courseId, date, records[] }
          │
          ▼
Express routes to attendance.routes.js
          │
          ▼
protect() — verifies token, attaches req.user
          │
          ▼
authorize('admin','faculty') — checks role
          │
          ▼
markAttendance() controller
  — loops through records
  — upserts each attendance document
          │
          ▼
MongoDB saves the records
          │
          ▼
201 Created → { message, results[] }
          │
          ▼
Frontend updates the UI
```

**What to say:**
> "This diagram shows the complete lifecycle of a single request — in this case, a faculty member marking attendance. The user clicks the button. Axios sends the HTTP request with the token in the header and the attendance data in the body. Express receives it and routes it to the attendance module. The protect middleware verifies the token. The authorize middleware confirms the user is faculty or admin. Then the controller runs — it loops through each student record and upserts it into the database, meaning it creates a new record or updates an existing one. Finally, the database confirms the save, the controller sends back a 201 response, and the frontend updates the UI. This same pattern — route, middleware, controller, model, response — applies to every single endpoint in the system."

---

## SLIDE — Security Summary

**Slide Title:** Security Measures

**Bullet points for the slide:**
- Passwords hashed with **bcrypt** (10 salt rounds) — never stored in plain text
- Authentication via **JWT tokens** — expire after 7 days
- **Role-based middleware** on every protected route — prevents privilege escalation
- **Environment variables** — secrets never committed to the repository
- **CORS** configured to allow only the known frontend origin
- **Input validation** via Mongoose schema rules — invalid data is rejected before saving
- **Unique indexes** on email and student ID — prevent duplicate accounts

**What to say:**
> "Security was built into the backend from the ground up. Passwords are never stored — only their bcrypt hash. JWT tokens are signed with a secret key stored in environment variables, not in the code. Every protected route has role-based middleware that rejects unauthorized requests before any logic runs. Mongoose schemas validate all incoming data — if a required field is missing or a value is outside the allowed enum, the database rejects it. And CORS is configured to only accept requests from the known frontend URL, blocking requests from unknown origins."

---

*Trophe Smart Campus Management System — Backend PPT Slide Content*
