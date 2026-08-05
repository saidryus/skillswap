# Data Dictionary — Acadia

> All collections are stored in MongoDB. Field types follow Mongoose schema definitions.
> `ObjectId` references are foreign keys pointing to the indicated collection.

---

## 1. User

**Collection:** `users`
**Description:** Stores all user accounts — both administrators and students (including tutors).

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `_id` | ObjectId | auto | — | Unique document identifier |
| `studentIdNumber` | String | No | `''` | Institutional student ID (e.g. `2021-00123`). Sparse unique index — skipped if empty. |
| `firstName` | String | Yes | — | User's first name |
| `lastName` | String | Yes | — | User's last name |
| `email` | String | Yes | — | Unique login email. Stored lowercase. |
| `password` | String | Yes | — | bcrypt-hashed password. Minimum 3 characters raw. |
| `role` | String (enum) | No | `student` | Account role. Values: `admin`, `student` |
| `yearLevel` | Number (enum) | No | `null` | Academic year level. Values: `1`, `2`, `3`, `4` |
| `phone` | String | No | — | Contact phone number |
| `department` | String | No | `''` | Department the student or admin belongs to |
| `isActive` | Boolean | No | `true` | Whether the account is active and can log in |
| `isTutor` | Boolean | No | `false` | `true` if the student has at least one approved tutor profile |
| `maxSessionsPerWeek` | Number | No | `5` | Tutor availability cap. Range: 1–20. |
| `mustChangePassword` | Boolean | No | `false` | Forces a password change on next login (set on account creation) |
| `currentSemester` | Number (enum) | No | `null` | Current semester. Values: `1`, `2` |
| `isSuperAdmin` | Boolean | No | `false` | Super admin flag — grants access to all departments |
| `loginAttempts` | Number | No | `0` | Failed consecutive login attempts counter |
| `lockUntil` | Date | No | `null` | Datetime until login is locked after repeated failures |
| `lockCount` | Number | No | `0` | Total number of lockout episodes |
| `docAccessLockedUntil` | Date | No | `null` | Datetime until document access is locked (progressive lockout after 3 failed re-auth attempts) |
| `docAccessAttempts` | Number | No | `0` | Failed document re-authentication attempts counter |
| `loginAuditLog` | Array | No | `[]` | Last 20 login events (successful and failed). Each entry has: `success`, `ip`, `userAgent`, `timestamp` |
| `permissions` | Array of String | No | `undefined` | Admin-only. Granular permission keys. Values: `users`, `courses`, `tutor-applications`, `sessions`, `announcements` |
| `assignedDepartments` | Array of String | No | `undefined` | Admin-only. Departments this admin can manage. `undefined` = all (super admin), `[]` = none |
| `createdAt` | Date | auto | — | Document creation timestamp |
| `updatedAt` | Date | auto | — | Document last update timestamp |

**Virtual:** `fullName` — concatenation of `firstName` and `lastName`

---

## 2. TutorProfile

**Collection:** `tutorprofiles`
**Description:** One document per tutor application per course. Stores the full ML analysis pipeline result, subject alignment, confidence score, and document audit trail.

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `_id` | ObjectId | auto | — | Unique document identifier |
| `tutor` | ObjectId → User | Yes | — | The applicant student |
| `course` | ObjectId → Course | Yes | — | Primary course of this application |
| `selectedCourses` | Array of ObjectId → Course | No | `[]` | All courses the tutor selected for this application (multi-subject support) |
| `status` | String (enum) | No | `pending` | Application status. Values: `pending`, `approved`, `rejected`, `resubmit` |
| `grade` | Number | No | `null` | Tutor's grade in the course. Range: 1.0–5.0 |
| `recommendationDocument` | String | No | `''` | Server file path of the encrypted recommendation letter |
| `recommendationDocumentName` | String | No | `''` | Original filename of the uploaded recommendation letter |
| `extractedText` | String | No | `''` | PII-redacted OCR text stored after analysis |
| `ocrConfidence` | Number | No | `0` | OCR extraction quality score (0–100) |
| **`aiAnalysis`** | Object | No | — | Full AI analysis result (see sub-fields below) |
| `aiAnalysis.facultyName` | String | No | `null` | Faculty name extracted from the letter |
| `aiAnalysis.facultyPosition` | String | No | `null` | Faculty position/title extracted from the letter |
| `aiAnalysis.department` | String | No | `null` | Department extracted from the letter |
| `aiAnalysis.date` | String | No | `null` | Date detected in the letter |
| `aiAnalysis.studentMentioned` | Boolean | No | `false` | Whether the student's name appears in the letter |
| `aiAnalysis.studentIdMentioned` | Boolean | No | `false` | Whether the student's ID appears in the letter |
| `aiAnalysis.recommendationLanguage` | Array of String | No | `[]` | Specific recommendation phrases detected |
| `aiAnalysis.recommendationStrength` | String (enum) | No | `none` | ML-predicted strength. Values: `none`, `weak`, `moderate`, `strong` |
| `aiAnalysis.signatureDetected` | Boolean | No | `false` | Whether signature indicators were found |
| `aiAnalysis.signatureIndicators` | Array of String | No | `[]` | Keywords that triggered signature detection |
| `aiAnalysis.letterheadDetected` | Boolean | No | `false` | Whether institutional letterhead was detected |
| `aiAnalysis.templateUsed` | Boolean | No | `false` | Whether a standard template was detected |
| `aiAnalysis.softSkills` | Array of String | No | `[]` | Soft skills extracted from the letter |
| `aiAnalysis.subjectsMentioned` | Array of String | No | `[]` | Subjects predicted by the ML model |
| `aiAnalysis.summary` | String | No | `''` | Auto-generated summary of the analysis |
| `aiAnalysis.observations` | Array of String | No | `[]` | Notable observations from the analysis |
| `aiAnalysis.anomalies` | Array of String | No | `[]` | Flags raised during analysis (e.g. no date, no signature) |
| `aiAnalysis.wordCount` | Number | No | `0` | Word count of the extracted document text |
| `aiAnalysis.analysisMethod` | String (enum) | No | `rule-based` | Which pipeline tier ran. Values: `ml`, `llm`, `rule-based` |
| `aiAnalysis.llmModel` | String | No | `null` | LLM model name if LLM was used (e.g. `gpt-4o-mini`) |
| `aiAnalysis.tokensUsed` | Number | No | `0` | Tokens consumed if LLM was used |
| **`subjectAlignment`** | Object | No | — | Deterministic comparison of selected vs. ML-predicted subjects |
| `subjectAlignment.alignments` | Array of Object | No | `[]` | Per-subject result. Each entry: `subject` (String), `status` (`matched`/`uncertain`/`not_mentioned`), `confidence` (`exact`/`partial`/`weak`/`none`) |
| `subjectAlignment.alignmentPercentage` | Number | No | `0` | Percentage of selected subjects matched (0–100) |
| `subjectAlignment.matchedCount` | Number | No | `0` | Number of matched subjects |
| `subjectAlignment.totalSubjects` | Number | No | `0` | Total selected subjects in the application |
| `confidenceScore` | Number | No | `0` | Overall document completeness score (0–100). Does not assess authenticity. |
| `confidenceLevel` | String (enum) | No | `low` | Banded confidence level. Values: `low`, `medium`, `high` |
| `confidenceBreakdown` | Mixed | No | `{}` | Per-component score breakdown (OCR, faculty, signature, strength, alignment, sections) |
| `adminNotes` | String | No | `''` | Reviewer notes entered by the admin |
| `reviewedBy` | ObjectId → User | No | `null` | Admin who reviewed the application |
| `reviewedAt` | Date | No | `null` | Timestamp of admin review |
| **`mlCorrection`** | Object | No | — | Admin override of ML predictions for future retraining |
| `mlCorrection.correctedStrength` | String (enum) | No | `null` | Admin-corrected strength. Values: `none`, `weak`, `moderate`, `strong` |
| `mlCorrection.correctedSubjects` | Array of String | No | `null` | Admin-corrected subject list |
| `mlCorrection.correctedSoftSkills` | Array of String | No | `null` | Admin-corrected soft skills |
| `mlCorrection.correctionNotes` | String | No | `''` | Free-text reason for correction |
| `mlCorrection.correctedBy` | ObjectId → User | No | `null` | Admin who entered the correction |
| `mlCorrection.correctedAt` | Date | No | `null` | Timestamp of correction |
| `documentExpiresAt` | Date | No | `null` | When the uploaded document file will be auto-deleted |
| `documentExpired` | Boolean | No | `false` | `true` if the file has been deleted by the expiry scheduler |
| **`documentAuditLog`** | Array of Object | No | `[]` | Every document access or deletion event. Each entry: `adminId`, `adminName`, `action` (`viewed`/`auto_expired`/`deleted_on_decision`), `timestamp`, `ip` |
| `createdAt` | Date | auto | — | Document creation timestamp |
| `updatedAt` | Date | auto | — | Document last update timestamp |

**Index:** `{ tutor, course, status }` — enforces one active application per student per course.

---

## 3. Session

**Collection:** `sessions`
**Description:** A tutoring session between one tutor and one or more tutees for a specific course.

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `_id` | ObjectId | auto | — | Unique document identifier |
| `tutor` | ObjectId → User | Yes | — | The tutor conducting the session |
| `tutees` | Array of ObjectId → User | No | `[]` | Students attending the session |
| `course` | ObjectId → Course | Yes | — | Subject the session covers |
| `date` | Date | Yes | — | Scheduled date of the session |
| `startTime` | String | Yes | — | Session start time in `HH:MM` format |
| `endTime` | String | Yes | — | Session end time in `HH:MM` format |
| `venue` | String | No | `''` | Physical location or online meeting link |
| `venueType` | String (enum) | No | `on-campus` | Values: `on-campus`, `online` |
| `status` | String (enum) | No | `pending` | Session lifecycle state. Values: `pending`, `scheduled`, `completed`, `cancelled`, `rejected` |
| `notes` | String | No | `''` | Optional notes from the booking request |
| `createdAt` | Date | auto | — | Document creation timestamp |
| `updatedAt` | Date | auto | — | Document last update timestamp |

---

## 4. Availability

**Collection:** `availabilities`
**Description:** User-managed weekly time slots indicating when a user is available for tutoring. Used exclusively by the scheduling engine — uploaded class schedules are never stored here.

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `_id` | ObjectId | auto | — | Unique document identifier |
| `user` | ObjectId → User | Yes | — | The user this availability belongs to |
| `day` | String (enum) | Yes | — | Day of the week. Values: `Monday`, `Tuesday`, `Wednesday`, `Thursday`, `Friday`, `Saturday` |
| `startTime` | String | Yes | — | Availability start time in `HH:MM` format |
| `endTime` | String | Yes | — | Availability end time in `HH:MM` format |
| `createdAt` | Date | auto | — | Document creation timestamp |
| `updatedAt` | Date | auto | — | Document last update timestamp |

**Index:** `{ user, day }`

---

## 5. Course

**Collection:** `courses`
**Description:** Academic courses/subjects offered by the department. Used for curriculum filtering, tutor applications, and session matching.

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `_id` | ObjectId | auto | — | Unique document identifier |
| `courseCode` | String | Yes | — | Unique course code (e.g. `IT201`). Stored uppercase. |
| `courseName` | String | Yes | — | Full name of the course |
| `description` | String | No | `''` | Optional course description |
| `units` | Number | Yes | — | Academic units. Range: 1–12. |
| `yearLevel` | Number (enum) | No | `null` | Year level the course is offered. Values: `1`, `2`, `3`, `4` |
| `semester` | Number (enum) | No | `null` | Semester the course is offered. Values: `1`, `2` |
| `department` | String | No | `''` | Department that owns this course |
| `isActive` | Boolean | No | `true` | Whether the course is available for use in the platform |
| `createdAt` | Date | auto | — | Document creation timestamp |
| `updatedAt` | Date | auto | — | Document last update timestamp |

---

## 6. Department

**Collection:** `departments`
**Description:** Academic departments supported by the platform. Enables multi-department deployment.

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `_id` | ObjectId | auto | — | Unique document identifier |
| `name` | String | Yes | — | Full department name. Unique. |
| `code` | String | Yes | — | Short department code (e.g. `CCS`). Unique, stored uppercase. |
| `description` | String | No | `''` | Optional description |
| `isActive` | Boolean | No | `true` | Whether the department is active |
| `createdAt` | Date | auto | — | Document creation timestamp |
| `updatedAt` | Date | auto | — | Document last update timestamp |

---

## 7. Material

**Collection:** `materials`
**Description:** Learning resources uploaded by tutors and associated with a specific course.

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `_id` | ObjectId | auto | — | Unique document identifier |
| `title` | String | Yes | — | Resource title |
| `description` | String | No | `''` | Optional description of the resource |
| `course` | ObjectId → Course | Yes | — | Course this material belongs to |
| `uploader` | ObjectId → User | Yes | — | Tutor who uploaded the resource |
| `resourceType` | String (enum) | Yes | — | File type. Values: `pdf`, `powerpoint`, `word`, `image`, `zip`, `link`, `recording` |
| `fileUrl` | String | No | `''` | Server file path or external URL |
| `fileName` | String | No | `''` | Original uploaded filename |
| `fileSize` | Number | No | `0` | File size in bytes |
| `isExternal` | Boolean | No | `false` | `true` for links and recording URLs (not a stored file) |
| `visibility` | String (enum) | No | `public` | Access control. Values: `public`, `enrolled`, `private` |
| `downloadCount` | Number | No | `0` | Total number of times this resource was downloaded |
| `isActive` | Boolean | No | `true` | Whether this resource is visible |
| `createdAt` | Date | auto | — | Document creation timestamp |
| `updatedAt` | Date | auto | — | Document last update timestamp |

**Indexes:** `{ course, isActive }`, `{ uploader }`

---

## 8. Message

**Collection:** `messages`
**Description:** In-app chat messages within a session. Includes text messages, system events, and recording link shares.

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `_id` | ObjectId | auto | — | Unique document identifier |
| `session` | ObjectId → Session | Yes | — | The session this message belongs to |
| `sender` | ObjectId → User | Yes | — | User who sent the message |
| `content` | String | Yes | — | Message text content |
| `type` | String (enum) | No | `text` | Message type. Values: `text`, `system`, `recording` |
| `metadata` | Mixed | No | `null` | Optional extra data (e.g. recording link URL, system event context) |
| `createdAt` | Date | auto | — | Document creation timestamp |
| `updatedAt` | Date | auto | — | Document last update timestamp |

**Index:** `{ session, createdAt }` — for efficient chat history retrieval in order

---

## 9. Notification

**Collection:** `notifications`
**Description:** In-app notifications sent to users for system events (session requests, application decisions, announcements, etc.).

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `_id` | ObjectId | auto | — | Unique document identifier |
| `recipient` | ObjectId → User | Yes | — | User who receives this notification |
| `type` | String (enum) | Yes | — | Event type. Values: `tutor_application`, `tutor_approved`, `tutor_rejected`, `session_request`, `session_accepted`, `session_rejected`, `session_cancelled`, `session_completed`, `announcement` |
| `title` | String | Yes | — | Short notification title |
| `message` | String | Yes | — | Full notification message body |
| `isRead` | Boolean | No | `false` | Whether the recipient has read this notification |
| `link` | String | No | — | Optional frontend route to navigate to when clicked |
| `meta` | Mixed | No | — | Optional extra context data for the notification |
| `createdAt` | Date | auto | — | Document creation timestamp |
| `updatedAt` | Date | auto | — | Document last update timestamp |

**Index:** `{ recipient, isRead, createdAt DESC }` — for fast unread notification queries

---

## 10. Rating

**Collection:** `ratings`
**Description:** Post-session tutor evaluation submitted by a tutee. One rating per session per tutee.

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `_id` | ObjectId | auto | — | Unique document identifier |
| `session` | ObjectId → Session | Yes | — | The session being rated |
| `tutor` | ObjectId → User | Yes | — | The tutor being evaluated |
| `ratedBy` | ObjectId → User | Yes | — | The tutee who submitted the rating |
| `course` | ObjectId → Course | Yes | — | Course the session covered |
| `score` | Number | Yes | — | Numeric rating. Range: 1–5. |
| `comment` | String | No | `''` | Written feedback about the tutor |
| `createdAt` | Date | auto | — | Document creation timestamp |
| `updatedAt` | Date | auto | — | Document last update timestamp |

**Index:** `{ session, ratedBy }` — unique constraint (one rating per tutee per session)

---

## 11. Announcement

**Collection:** `announcements`
**Description:** System-wide announcements created by admins and broadcast to target user roles.

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `_id` | ObjectId | auto | — | Unique document identifier |
| `title` | String | Yes | — | Announcement title |
| `content` | String | Yes | — | Full announcement body |
| `author` | ObjectId → User | Yes | — | Admin who created the announcement |
| `targetRoles` | Array of String (enum) | No | `['admin','student']` | Which roles can see this. Values: `admin`, `student` |
| `isPinned` | Boolean | No | `false` | Whether this announcement is pinned to the top |
| `isActive` | Boolean | No | `true` | Whether this announcement is visible |
| `createdAt` | Date | auto | — | Document creation timestamp |
| `updatedAt` | Date | auto | — | Document last update timestamp |

---

## 12. Settings

**Collection:** `settings`
**Description:** Global system configuration. Single document keyed by `global`.

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `_id` | ObjectId | auto | — | Unique document identifier |
| `key` | String | No | `global` | Document key. Always `global` — only one settings document exists. |
| `studentIdPrefix` | String | No | `SS` | Prefix used when auto-generating student IDs. Stored uppercase. |
| `studentIdCounter` | Number | No | `0` | Auto-increment counter for student ID generation |
| `createdAt` | Date | auto | — | Document creation timestamp |
| `updatedAt` | Date | auto | — | Document last update timestamp |

---

## 13. StudentSchedule

**Collection:** `studentschedules`
**Description:** Temporary class schedule entries parsed from an uploaded schedule file. Used only to suggest availability slots. This data is never used by the scheduling engine for conflict detection — it is deleted after the user confirms their availability.

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `_id` | ObjectId | auto | — | Unique document identifier |
| `student` | ObjectId → User | Yes | — | The student this schedule entry belongs to |
| `course` | ObjectId → Course | No | `null` | Course associated with this schedule block, if matched |
| `day` | String (enum) | Yes | — | Day of the week. Values: `Monday`, `Tuesday`, `Wednesday`, `Thursday`, `Friday`, `Saturday` |
| `startTime` | String | Yes | — | Class start time in `HH:MM` format |
| `endTime` | String | Yes | — | Class end time in `HH:MM` format |
| `label` | String | No | `''` | Display label for the schedule block (e.g. `CS101 - Intro to Programming`) |
| `createdAt` | Date | auto | — | Document creation timestamp |
| `updatedAt` | Date | auto | — | Document last update timestamp |

---

## Collection Relationships

```
User ──────────────────── TutorProfile (tutor, reviewedBy)
User ──────────────────── Session (tutor, tutees)
User ──────────────────── Availability (user)
User ──────────────────── Rating (tutor, ratedBy)
User ──────────────────── Message (sender)
User ──────────────────── Material (uploader)
User ──────────────────── Notification (recipient)
User ──────────────────── Announcement (author)
User ──────────────────── StudentSchedule (student)

Course ─────────────────── TutorProfile (course, selectedCourses)
Course ─────────────────── Session (course)
Course ─────────────────── Rating (course)
Course ─────────────────── Material (course)
Course ─────────────────── StudentSchedule (course)

Session ────────────────── Rating (session)
Session ────────────────── Message (session)
```
