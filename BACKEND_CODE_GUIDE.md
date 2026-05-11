# TROPHE BACKEND — CODE GUIDE
### A Plain-English Walkthrough for Someone New to the Codebase

---

## WHAT IS THE BACKEND?

The backend is the "engine" of the application. It runs on a server, handles all the logic, talks to the database, and responds to requests from the frontend (the website the user sees).

Think of it like a restaurant:
- The **frontend** is the dining area — what the customer sees
- The **backend** is the kitchen — where the actual work happens
- The **database** is the pantry — where all the data is stored
- The **API** is the waiter — it carries requests from the frontend to the backend and brings back responses

The backend is built with **Node.js** and **Express.js**, and the database is **MongoDB**.

---

## FOLDER STRUCTURE

```
backend/
├── server.js              ← Entry point. Starts the whole app.
├── .env                   ← Secret config values (port, database URL, JWT secret)
├── seed.js                ← Script to fill the database with sample data
│
├── config/
│   └── db.js              ← Database connection logic
│
├── middleware/
│   └── auth.middleware.js ← Security checks (is the user logged in? what role are they?)
│
├── models/                ← Database blueprints (what shape does each piece of data have?)
│   ├── User.js
│   ├── Course.js
│   ├── Schedule.js
│   ├── Attendance.js
│   ├── Announcement.js
│   └── Notification.js
│
├── routes/                ← URL definitions (which URL calls which function?)
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── course.routes.js
│   ├── schedule.routes.js
│   ├── attendance.routes.js
│   ├── announcement.routes.js
│   └── notification.routes.js
│
├── controllers/           ← The actual logic (what happens when a URL is called?)
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── course.controller.js
│   ├── schedule.controller.js
│   ├── attendance.controller.js
│   ├── announcement.controller.js
│   └── notification.controller.js
│
└── utils/
    └── notify.js          ← Helper function to create notifications
```

---

## HOW A REQUEST FLOWS THROUGH THE BACKEND

When the frontend sends a request (e.g., "get all courses"), here is the exact path it takes:

```
Frontend sends HTTP request
        ↓
server.js receives it and routes it to the correct router
        ↓
Middleware runs (check: is the user logged in? do they have permission?)
        ↓
Controller function runs (the actual logic: fetch data, save data, etc.)
        ↓
Controller talks to the Model (which talks to MongoDB)
        ↓
Response is sent back to the frontend
```

---

## FILE-BY-FILE EXPLANATION

---

### 1. `server.js` — The Entry Point

This is the first file that runs when you start the backend with `npm start`.

```javascript
const express = require('express');
const mongoose = require('mongoose');
```
These two lines import the tools we need:
- `express` — the framework that handles HTTP requests
- `mongoose` — the tool that connects to and talks to MongoDB

```javascript
dotenv.config();
```
This loads the `.env` file so we can use secret values like `PORT`, `MONGO_URI`, and `JWT_SECRET` without hardcoding them.

```javascript
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());
```
- `cors` — allows the frontend (running on a different port/domain) to talk to the backend. Without this, the browser would block the requests.
- `express.json()` — tells Express to automatically parse incoming JSON data from requests.

```javascript
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
// ... and so on
```
Each line here says: "If a request comes in starting with `/api/auth`, send it to `auth.routes.js` to handle."

```javascript
mongoose.connect(process.env.MONGO_URI).then(() => {
  app.listen(process.env.PORT, ...);
});
```
This connects to MongoDB first, and only starts the server after the connection is successful. If MongoDB fails, the server won't start.

---

### 2. `.env` — Environment Variables

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/trophe
JWT_SECRET=trophe_super_secret_jwt_key_2024
NODE_ENV=development
```

These are secret configuration values:
- `PORT` — which port the server listens on (5000 means `http://localhost:5000`)
- `MONGO_URI` — the address of the MongoDB database
- `JWT_SECRET` — a secret key used to sign and verify login tokens. **Never share this publicly.**
- `NODE_ENV` — tells the app whether it's running in development or production mode

> ⚠️ This file is in `.gitignore` — it should never be committed to GitHub because it contains secrets.

---

### 3. `middleware/auth.middleware.js` — Security Guard

Middleware is code that runs **between** receiving a request and running the controller. Think of it as a security checkpoint.

This file exports two functions: `protect` and `authorize`.

#### `protect` — "Are you logged in?"

```javascript
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
```
When a user logs in, they receive a **JWT token** (a long string). For every protected request, the frontend sends this token in the request header like:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
This code extracts the token from that header.

```javascript
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
```
- `jwt.verify` checks if the token is valid and not expired
- If valid, it decodes the token to get the user's ID
- It then fetches the full user from the database and attaches it to `req.user`
- `.select('-password')` means "get everything except the password"

After this, any controller can access `req.user` to know who is making the request.

#### `authorize` — "Do you have permission?"

```javascript
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Role '${req.user.role}' is not authorized` });
    }
    next();
  };
};
```
This checks if the logged-in user's role is in the allowed list. For example:
```javascript
router.post('/', authorize('admin'), createCourse);
```
This means only users with the role `admin` can call `createCourse`. If a student tries, they get a `403 Forbidden` error.

---

### 4. MODELS — Database Blueprints

Models define the **shape** of data stored in MongoDB. Each model = one collection (like a table in SQL).

---

#### `models/User.js`

```javascript
const userSchema = new mongoose.Schema({
  studentId: { type: String, unique: true, sparse: true },
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true, minlength: 6 },
  role:      { type: String, enum: ['admin', 'faculty', 'student'], default: 'student' },
  department:{ type: String },
  isActive:  { type: Boolean, default: true },
}, { timestamps: true });
```

Key things to understand:
- `required: true` — this field must be provided or the save will fail
- `unique: true` — no two users can have the same email
- `sparse: true` on `studentId` — allows multiple users to have no studentId (null), but if they do have one, it must be unique
- `enum` — the value must be one of the listed options
- `{ timestamps: true }` — automatically adds `createdAt` and `updatedAt` fields

**Password Hashing:**
```javascript
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
```
This is a **pre-save hook** — it runs automatically before any user is saved to the database. It converts the plain text password into a hashed version using bcrypt. The original password is never stored.

`if (!this.isModified('password')) return next();` — this check prevents re-hashing the password when updating other fields like email or department.

**Password Comparison:**
```javascript
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
```
This adds a custom method to every User document. During login, we call `user.matchPassword(enteredPassword)` to check if the password is correct without ever seeing the original.

---

#### `models/Course.js`

```javascript
const courseSchema = new mongoose.Schema({
  courseCode: { type: String, required: true, unique: true, uppercase: true },
  courseName: { type: String, required: true },
  units:      { type: Number, required: true, min: 1, max: 6 },
  type:       { type: String, enum: ['lecture', 'laboratory'], default: 'lecture' },
  faculty:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  students:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isActive:   { type: Boolean, default: true },
});
```

Key things:
- `uppercase: true` — automatically converts courseCode to uppercase (cs101 → CS101)
- `mongoose.Schema.Types.ObjectId` — this is a reference (foreign key) to another document
- `ref: 'User'` — tells Mongoose which collection this ID points to, enabling `.populate()`
- `students: [{ ... }]` — an array of ObjectIds, meaning a course can have many students (many-to-many relationship)

---

#### `models/Schedule.js`

```javascript
const scheduleSchema = new mongoose.Schema({
  course:    { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  day:       { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] },
  startTime: { type: String }, // stored as "08:00"
  endTime:   { type: String }, // stored as "09:30"
  room:      { type: String },
  semester:  { type: String },
  schoolYear:{ type: String },
});
```

Times are stored as strings in `"HH:MM"` format. This works for comparison because string comparison of `"08:00"` vs `"09:30"` gives the correct result in 24-hour format.

---

#### `models/Attendance.js`

```javascript
const attendanceSchema = new mongoose.Schema({
  student:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course:   { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  date:     { type: Date, required: true },
  status:   { type: String, enum: ['present', 'absent', 'late', 'excused'], default: 'absent' },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  remarks:  { type: String },
});

attendanceSchema.index({ student: 1, course: 1, date: 1 }, { unique: true });
```

The compound unique index on `{ student, course, date }` prevents duplicate attendance records. A student can only have one attendance record per course per day.

---

#### `models/Announcement.js`

```javascript
const announcementSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  content:     { type: String, required: true },
  author:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetRoles: { type: [String], enum: ['admin','faculty','student'], default: ['admin','faculty','student'] },
  isPinned:    { type: Boolean, default: false },
  isActive:    { type: Boolean, default: true },
});
```

`targetRoles` is an array of strings. An announcement can target one, two, or all three roles. When fetching announcements, the backend filters by the logged-in user's role.

---

#### `models/Notification.js`

```javascript
const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:      { type: String, enum: ['schedule_changed', 'enrollment', 'announcement', ...] },
  title:     { type: String, required: true },
  message:   { type: String, required: true },
  isRead:    { type: Boolean, default: false },
  link:      { type: String },
  meta:      { type: mongoose.Schema.Types.Mixed },
});

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
```

- `link` — an optional frontend URL to navigate to when the notification is clicked
- `meta` — a flexible field (`Mixed` type) that can store any extra data (like courseId, changes made, etc.)
- The index on `{ recipient, isRead, createdAt }` makes the unread count query very fast

---

### 5. ROUTES — URL Definitions

Routes connect a URL + HTTP method to a controller function. They also apply middleware.

#### Example: `routes/user.routes.js`

```javascript
router.use(protect); // ALL routes below require login

router.route('/')
  .get(authorize('admin'), getUsers)    // GET /api/users → only admin
  .post(authorize('admin'), createUser); // POST /api/users → only admin

router.route('/:id')
  .get(authorize('admin'), getUserById)    // GET /api/users/123
  .put(authorize('admin'), updateUser)     // PUT /api/users/123
  .delete(authorize('admin'), deleteUser); // DELETE /api/users/123
```

`router.use(protect)` applies the `protect` middleware to every route in this file — so all user routes require a valid JWT token.

`/:id` is a URL parameter. If the request is `GET /api/users/abc123`, then `req.params.id` will be `"abc123"` inside the controller.

#### Example: `routes/course.routes.js`

```javascript
router.get('/my-courses', getMyCourses);           // student gets their courses
router.get('/my-teaching', authorize('faculty'), getMyTeachingCourses); // faculty only
router.route('/').get(getCourses).post(authorize('admin'), createCourse);
router.post('/:id/enroll', authorize('admin'), enrollStudent);
router.post('/:id/unenroll', authorize('admin'), unenrollStudent);
```

Note that `/my-courses` and `/my-teaching` are defined **before** `/:id`. This is important — if they were after, Express would try to match `my-courses` as an ID and fail.

---

### 6. CONTROLLERS — The Business Logic

Controllers are where the actual work happens. Each function handles one specific action.

---

#### `controllers/auth.controller.js`

**`register`**
```javascript
const userExists = await User.findOne({ email });
if (userExists) return res.status(400).json({ message: 'User already exists' });

const user = await User.create({ firstName, lastName, email, password, role, ... });

res.status(201).json({
  _id: user._id,
  ...
  token: generateToken(user._id),
});
```
1. Check if email is already taken
2. Create the user (password gets hashed automatically by the pre-save hook)
3. Return the user data + a JWT token

**`login`**
```javascript
const user = await User.findOne({ email });
if (!user || !(await user.matchPassword(password))) {
  return res.status(401).json({ message: 'Invalid email or password' });
}
```
1. Find the user by email
2. Use `matchPassword()` to compare the entered password with the stored hash
3. If correct, return user data + token

**`generateToken`**
```javascript
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};
```
Creates a JWT token that contains the user's ID and expires in 7 days. The `JWT_SECRET` is used to sign it — only the server can verify it.

---

#### `controllers/course.controller.js`

**`getCourses`**
```javascript
const courses = await Course.find()
  .populate('faculty', 'firstName lastName email')
  .populate('students', 'firstName lastName email studentId');
```
`.populate()` replaces the stored ObjectId with the actual document data. Instead of returning `faculty: "abc123"`, it returns `faculty: { firstName: "Maria", lastName: "Santos", ... }`.

**`enrollStudent`**
```javascript
course.students.push(studentId);
await course.save();

await createNotifications({
  recipient: studentId,
  type: 'enrollment',
  title: 'Enrolled in Course',
  message: `You have been enrolled in ${course.courseCode}...`,
});
```
1. Add the student's ID to the course's `students` array
2. Save the course
3. Fire a notification to the student

**`updateCourse`** — Instructor Change Detection
```javascript
const oldFacultyId = course.faculty?._id?.toString();
const newFacultyId = req.body.faculty;

Object.assign(course, req.body);
await course.save();

if (newFacultyId && oldFacultyId !== newFacultyId) {
  // notify all enrolled students that instructor changed
  // notify the new faculty that they were assigned
}
```
Before saving, it compares the old and new faculty IDs. If they're different, it sends notifications to all enrolled students and the new instructor.

---

#### `controllers/schedule.controller.js`

This is the most complex controller. It contains the conflict detection system.

**`timesOverlap`**
```javascript
const timesOverlap = (aStart, aEnd, bStart, bEnd) =>
  aStart < bEnd && aEnd > bStart;
```
This tiny function checks if two time ranges overlap. For example:
- Schedule A: 08:00–09:30
- Schedule B: 08:30–10:00
- `"08:00" < "10:00"` ✅ and `"09:30" > "08:30"` ✅ → they overlap

**`checkConflicts`**
```javascript
const checkConflicts = async (day, startTime, endTime, room, courseId, excludeId = null) => {
```
This function is called before creating or updating any schedule. It:

1. Fetches all schedules on the same day (excluding the one being updated if it's an update)
2. Filters to only those that overlap in time
3. For each overlapping schedule, checks 4 conflict types:

```javascript
// 1. Same course scheduled twice
if (otherCourse._id.toString() === courseId.toString()) { ... }

// 2. Room conflict
if (room && s.room && room.toLowerCase() === s.room.toLowerCase()) { ... }

// 3. Instructor conflict
if (course.faculty && otherCourse.faculty &&
    course.faculty._id.toString() === otherCourse.faculty.toString()) { ... }

// 4. Student conflict
const clash = courseStudentIds.find(id => otherStudentIds.includes(id));
if (clash) { ... }
```

If any conflict is found, it returns `{ conflict: true, type: '...', message: '...' }` and the controller responds with `409 Conflict`.

---

#### `controllers/attendance.controller.js`

**`markAttendance`** — Bulk Upsert
```javascript
const attendance = await Attendance.findOneAndUpdate(
  { student: record.studentId, course: courseId, date: new Date(date) },
  { status: record.status, remarks: record.remarks, markedBy: req.user._id },
  { upsert: true, new: true }
);
```
`findOneAndUpdate` with `upsert: true` means:
- If a record already exists for this student + course + date → **update** it
- If it doesn't exist → **create** it

This allows faculty to re-submit attendance for the same day without creating duplicates.

**`getAttendanceSummary`**
```javascript
const percentage = total > 0 ? ((present + late) / total) * 100 : 0;
```
Note that `late` counts toward attendance — a student who was late is still considered to have attended.

---

#### `controllers/announcement.controller.js`

**`getAnnouncements`** — Role Filtering
```javascript
const filter = req.user.role === 'admin'
  ? { isActive: true }
  : { targetRoles: req.user.role, isActive: true };
```
Admins see all announcements. Faculty and students only see announcements where their role is in the `targetRoles` array.

**`createAnnouncement`** — Mass Notification
```javascript
const recipients = await User.find({
  role: { $in: roles },
  isActive: true,
  _id: { $ne: req.user._id }  // don't notify the author
}).select('_id');

await createNotifications(recipients.map(u => ({ recipient: u._id, ... })));
```
After creating the announcement, it finds all active users in the target roles (excluding the author) and creates a notification for each one.

---

### 7. `utils/notify.js` — Notification Helper

```javascript
const createNotifications = async (notifications) => {
  try {
    const items = Array.isArray(notifications) ? notifications : [notifications];
    if (items.length === 0) return;
    await Notification.insertMany(items);
  } catch (err) {
    console.error('Notification error:', err.message);
  }
};
```

This utility accepts either a single notification object or an array of them and inserts them all at once using `insertMany` (more efficient than inserting one by one).

The `try/catch` here is intentional — if notifications fail, the error is logged but **does not crash the main request**. Notifications are non-critical; the primary action (creating a schedule, enrolling a student) should still succeed even if notifications fail.

---

## HOW JWT AUTHENTICATION WORKS (END TO END)

```
1. User submits email + password to POST /api/auth/login

2. Server finds the user in MongoDB by email

3. Server calls user.matchPassword(password)
   → bcrypt compares entered password with stored hash
   → returns true or false

4. If true, server calls generateToken(user._id)
   → jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })
   → returns a long encoded string (the token)

5. Server sends back: { user data + token }

6. Frontend stores the token in localStorage

7. For every future request, frontend sends:
   Authorization: Bearer <token>

8. protect middleware intercepts the request:
   → extracts the token from the header
   → calls jwt.verify(token, JWT_SECRET)
   → if valid, decodes it to get user._id
   → fetches the user from MongoDB
   → attaches user to req.user

9. Controller runs with req.user available
```

---

## COMMON PATTERNS USED THROUGHOUT THE CODE

### Pattern 1: Try/Catch on Every Controller
```javascript
const someController = async (req, res) => {
  try {
    // ... logic
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```
Every controller wraps its logic in try/catch. If anything goes wrong (database error, invalid ID, etc.), it catches the error and returns a 500 response with the error message instead of crashing the server.

### Pattern 2: Early Return on Not Found
```javascript
const user = await User.findById(req.params.id);
if (!user) return res.status(404).json({ message: 'User not found' });
// continue with user...
```
Check if the resource exists first. If not, return immediately with 404. This avoids deeply nested if/else blocks.

### Pattern 3: Object.assign for Partial Updates
```javascript
Object.assign(course, req.body);
await course.save();
```
Instead of manually updating each field, `Object.assign` copies all properties from `req.body` onto the `course` object. Only the fields sent in the request body get updated.

### Pattern 4: Populate for Relationships
```javascript
await Course.find()
  .populate('faculty', 'firstName lastName email')
  .populate('students', 'firstName lastName studentId');
```
MongoDB stores only the ObjectId reference. `.populate()` replaces it with the actual document. The second argument `'firstName lastName email'` is a field selector — only those fields are included (like `SELECT firstName, lastName, email` in SQL).

---

## HTTP STATUS CODES USED

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST (new resource created) |
| 400 | Bad Request | Invalid input (duplicate email, already enrolled, etc.) |
| 401 | Unauthorized | No token or invalid token |
| 403 | Forbidden | Valid token but wrong role |
| 404 | Not Found | Resource doesn't exist in database |
| 409 | Conflict | Schedule conflict detected |
| 500 | Internal Server Error | Unexpected error (database failure, etc.) |

---

## HOW TO RUN THE BACKEND

```bash
# 1. Go into the backend folder
cd backend

# 2. Install all dependencies
npm install

# 3. Make sure .env file exists with correct values
# (PORT, MONGO_URI, JWT_SECRET)

# 4. Seed the database with sample data (first time only)
node seed.js

# 5. Start the server
npm start
# OR for development with auto-restart on file changes:
npm run dev
```

You should see:
```
✅ MongoDB connected
🚀 Server running on port 5000
```

The API is now available at `http://localhost:5000/api`

---

## DEPENDENCIES EXPLAINED

| Package | What It Does |
|---------|-------------|
| `express` | Web framework — handles routing and HTTP |
| `mongoose` | Connects to MongoDB and provides schema/model tools |
| `jsonwebtoken` | Creates and verifies JWT tokens for authentication |
| `bcryptjs` | Hashes passwords so they're never stored as plain text |
| `cors` | Allows the frontend (different origin) to call the backend |
| `dotenv` | Loads `.env` file into `process.env` |
| `nodemon` | Dev tool — restarts server automatically when files change |

---

*Trophe Backend Code Guide — written for developers new to the codebase*
