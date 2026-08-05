# Program Specification — Acadia

## Overview

This document describes Acadia's internal architecture, key algorithms, data flow pipelines, and behavioral logic. It is intended as a technical reference for developers and evaluators.

---

## 1. Architecture Overview

Acadia follows a **three-tier architecture**:

```
┌─────────────────────────────────┐
│         CLIENT TIER             │
│  React 18 SPA (Vite, port 5173) │
│  Browser — no server-side render│
└────────────────┬────────────────┘
                 │ HTTP/REST + WebSocket (Socket.io)
┌────────────────▼────────────────┐
│      APPLICATION TIER           │
│  Node.js + Express (port 5000)  │
│  JWT auth, business logic,      │
│  file handling, scheduling      │
└──────┬──────────────────────────┘
       │ HTTP (internal)         │ Mongoose
┌──────▼───────┐         ┌───────▼───────┐
│  ML SERVICES │         │  DATA TIER    │
│  Flask ×3    │         │  MongoDB 7.x  │
│  5001/5002/  │         │  DB: trophe   │
│  5003        │         │  13 collections│
└──────────────┘         └───────────────┘
```

---

## 2. Entry Points

| Service | Entry Point | Port |
|---|---|---|
| Backend API | `backend/server.js` | 5000 |
| Frontend Dev Server | Vite (`npm run dev` in frontend dir) | 5173 |
| ML Recommendation Service | `ml_recommendation/app.py` | 5002 |
| ML Feedback Service | `ml_feedback/app.py` | 5003 |
| ML Attendance Service | `ml_attendance/app.py` | 5001 |

---

## 3. Backend Middleware Pipeline

Requests to `backend/server.js` pass through middleware in this order:

```
Incoming Request
      │
      ▼
1. helmet()              — Sets security headers (CSP, HSTS, X-Frame-Options, etc.)
      │
      ▼
2. HTTPS redirect        — Active in NODE_ENV=production; redirects HTTP → HTTPS
      │
      ▼
3. cors()                — Allows requests from FRONTEND_URL origin only
      │
      ▼
4. express.json()        — Parses JSON request bodies
      │
      ▼
5. express-mongo-sanitize — Strips $ and . from req.body, req.params, req.query
      │
      ▼
6. Rate limiters         — Applied per route group (see rate limit table below)
      │
      ▼
7. Route modules         — 16 route files mounted under /api/*
      │
      ▼
8. Global error handler  — Catches unhandled errors, returns JSON error response
```

### Rate Limit Configuration

| Route Group | Limit | Window |
|---|---|---|
| `POST /api/auth/login` | 10 requests | 15 minutes |
| `POST /api/tutor-profiles/*/reauth` | 10 requests | 15 minutes |
| `GET /api/tutor-profiles/*/document` | 30 requests | 5 minutes |
| All other `/api/*` routes | 300 requests | 1 minute |

---

## 4. JWT Authentication Flow

```
1. Client POSTs credentials to POST /api/auth/login
2. Backend verifies password with bcryptjs.compare()
3. On success: signs JWT with jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' })
4. Token returned in response body
5. Client stores token in memory / localStorage
6. All subsequent requests include:  Authorization: Bearer <token>
7. auth.middleware.js verifies token with jwt.verify()
8. Decoded payload attached to req.user
9. Role/permission checks applied by downstream route middleware
```

Token expiry is **7 days**. There is no refresh token mechanism — users are redirected to login on expiry.

---

## 5. Role-Based Access Control

### Roles

| Role | Value | Description |
|---|---|---|
| Student | `student` | Default role. Can be a tutee, and optionally a tutor (`isTutor: true`). |
| Admin | `admin` | Department-scoped administrator. Manages users, sessions, applications. |
| Faculty | `faculty` | Read-only + announcement creation. Cannot manage users directly. |

### Permission System

The `User` model includes:
- `role` — string enum (`student`, `admin`, `faculty`)
- `isSuperAdmin` — boolean; grants cross-department access to admin users
- `permissions` — array of permission strings (fine-grained overrides)
- `assignedDepartments` — array of Department ObjectIds (scopes admin's data visibility)

Middleware `departmentScope.js` filters queries to only return records belonging to the admin's `assignedDepartments` unless `isSuperAdmin` is true.

---

## 6. ML Pipeline — Recommendation Letter Analysis

The tutor application document analysis follows a **3-tier fallback pipeline** implemented in `backend/utils/recommendationAnalyzer.js`:

```
Uploaded document (PDF or image)
        │
        ▼
gradeExtractor.js — pdfjs-dist (PDF) or Tesseract.js (image) → raw OCR text
        │
        ▼
textRedactor.js — removes PII (names, student IDs, contact info) → redacted text
        │
        ▼
signatureDetector.js — keyword scan for faculty signature presence
        │
        ▼
        ┌─────────────────────────────────────────┐
        │         TIER 1: ML Service              │
        │  POST http://localhost:5002/analyze     │
        │  mlRecommendationClient.js              │
        │  TF-IDF + LinearSVC + LogReg            │
        └──────────────┬──────────────────────────┘
                       │ (if ML service unavailable or low confidence)
                       ▼
        ┌─────────────────────────────────────────┐
        │         TIER 2: LLM Fallback            │
        │  llmDocumentAnalyzer.js                 │
        │  OpenAI API (if OPENAI_API_KEY set)     │
        └──────────────┬──────────────────────────┘
                       │ (if LLM unavailable or key absent)
                       ▼
        ┌─────────────────────────────────────────┐
        │         TIER 3: Rule-Based              │
        │  Keyword matching on redacted text      │
        │  Subject/strength detection by pattern  │
        └──────────────┬──────────────────────────┘
                       │
                       ▼
        Analysis result + confidence score
                       │
                       ▼
        fileEncryption.js — AES-256-CBC encrypt document bytes
                       │
                       ▼
        Save encrypted file to backend/uploads/grade-documents/
        Save analysis + encryptedFilePath to TutorProfile document
```

---

## 7. File Handling Pipeline

```
Client uploads file (multipart/form-data)
        │
        ▼
multer middleware — validates MIME type, enforces size limit, saves to temp path
        │
        ▼
sharp (images) or pdfjs-dist (PDFs) — normalize/extract for OCR
        │
        ▼
tesseract.js — OCR text extraction
        │
        ▼
textRedactor.js — strip PII from OCR text
        │
        ▼
fileEncryption.js — AES-256-CBC encrypt original file bytes
        │
        ▼
Write encrypted blob to backend/uploads/grade-documents/<filename>
        │
        ▼
Store { encryptedFilePath, iv } in TutorProfile.documents[]
        │
        ▼
(Delete unencrypted temp file)
```

**Serving documents:** Encrypted files are never served directly. An authenticated admin must complete the document re-auth gate (see Section 10) to obtain a short-lived `docToken`. The document route decrypts the file in memory and streams the plaintext to the client.

---

## 8. Competency Score Formula

A tutor's competency score is a weighted composite recalculated whenever its inputs change:

```
competencyScore =
  (averageRating / 5) × 0.45
  + (recommendationScore / 100) × 0.15
  + (completionRate / 100) × 0.20
  + min(completedSessions / 20, 1) × 0.20
```

| Component | Weight | Source |
|---|---|---|
| Average rating (1–5 stars normalized to 0–1) | 45% | `Ratings` collection |
| Faculty recommendation ML score (0–100) | 15% | ML Service 1 output stored in `TutorProfile` |
| Session completion rate (completed / total accepted) | 20% | `Sessions` collection |
| Completed session count (capped at 20 for full score) | 20% | `Sessions` collection |

The computed score (0.0–1.0) is stored in `TutorProfile.competencyScore` and used to rank tutors on the Find Tutor page.

---

## 9. Session Scheduling Algorithm

Implemented in `session.controller.js` (slot suggestion endpoint):

```
1. Load tutor's Availability documents (weekly recurring slots)
2. Load tutee's StudentSchedule (class times = busy periods)
3. Invert availability → list of free intervals for the tutor
4. Build a busy map for the tutee from StudentSchedule
5. Scan free intervals in 1-hour steps:
     a. Skip slots on Philippine public holidays (utils/holidays.js)
     b. Skip slots on Sundays
     c. Skip slots that overlap tutee's busy map
     d. Skip slots that already have a confirmed Session in DB (conflict detection)
6. Return sorted list of mutually free slot suggestions
```

---

## 10. Document Access Gate (Re-Authentication)

Protects access to encrypted recommendation letter documents:

```
1. Admin clicks "View Document"
2. Frontend prompts for admin password
3. POST /api/tutor-profiles/:id/reauth  (rate limited: 10/15min)
   → bcrypt.compare(password, admin.passwordHash)
   → On success: docAccessToken.js generates a signed, short-lived token (15 min)
   → Returns { docToken }
4. Admin's browser sends GET /api/tutor-profiles/:id/document?docToken=<token>
   → docAccessToken.js verifies token
   → fileEncryption.js decrypts file in memory
   → Streams decrypted bytes to client
5. Every document view is written to audit log:
   { adminId, ip, action: 'view', documentId, timestamp }
6. Failed re-auth attempts are counted in DB:
   3 failures within window → 3-hour lockout stored on User record
```

---

## 11. Real-Time Messaging (Socket.io)

```
1. Session is created with status = 'scheduled'
2. Frontend joins Socket.io room: socket.join(`session-${sessionId}`)
3. Both tutor and tutee join the same room
4. Messages sent via:  socket.to(`session-${sessionId}`).emit('message', payload)
5. Messages persisted to Messages collection via message.controller.js
6. Jitsi Meet room URL is generated:
   https://meet.jit.si/acadia-session-<sessionId>
   Embedded as a link/iframe within the session view
```

---

## 12. Document Expiry Scheduler

`backend/utils/docExpiry.js` runs on server startup:

```
1. Query TutorProfile documents where:
     documents[].documentExpiresAt < now  AND
     documents[].status != 'deleted'
2. For each expired document:
     a. Delete encrypted file from backend/uploads/grade-documents/
     b. Set document.status = 'deleted', document.encryptedFilePath = null
     c. Write audit log entry: { action: 'auto_delete', reason: 'expired', timestamp }
3. Schedule next run (polling interval: configurable, default every 24 hours)
```

This ensures uploaded recommendation letters do not persist indefinitely on disk.

---

## 13. Route Module Summary

| Mount Path | Route File | Key Operations |
|---|---|---|
| `/api/auth` | `auth.routes.js` | Login, change password |
| `/api/users` | `user.routes.js` | CRUD, CSV import, role management |
| `/api/courses` | `course.routes.js` | CRUD, CSV import |
| `/api/departments` | `department.routes.js` | CRUD |
| `/api/tutor-profiles` | `tutorProfile.routes.js` | Application pipeline, reauth, document view, approve/reject |
| `/api/student-schedules` | `studentSchedule.routes.js` | OCR upload, schedule management |
| `/api/sessions` | `session.routes.js` | Slot suggestion, book, accept, reject, complete, cancel |
| `/api/ratings` | `rating.routes.js` | Submit rating, get tutor ratings, ML insights |
| `/api/announcements` | `announcement.routes.js` | Create, list, delete |
| `/api/notifications` | `notification.routes.js` | List, mark read, delete |
| `/api/settings` | `settings.routes.js` | Get/update global settings |
| `/api/materials` | `material.routes.js` | Upload, list, download, delete, visibility control |
| `/api/messages` | `message.routes.js` | Send, list (per session) |
| `/api/availability` | `availability.routes.js` | Add slot, remove slot, list |
| `/api/curriculum` | `curriculum.routes.js` | Eligible courses by year/semester/department |
