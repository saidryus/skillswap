# POSTMAN API DOCUMENTATION GUIDE
## Trophe Smart Campus Management System

**Purpose:** This guide provides step-by-step instructions for capturing Postman screenshots with actual API requests and responses for your project documentation.

---

## PREREQUISITES

### 1. Install Postman
- Download from: https://www.postman.com/downloads/
- Install and create a free account (optional but recommended)

### 2. Start Your Backend Server
```bash
cd backend
npm install
node seed.js    # Seed the database with sample data
npm start       # Start the server on port 5000
```

### 3. Import the Postman Collection
1. Open Postman
2. Click "Import" button (top left)
3. Select the file: `Trophe_Postman_Collection.json`
4. Collection will appear in the left sidebar

---

## SETUP ENVIRONMENT VARIABLES

Before testing, set up your environment variables:

1. Click on "Trophe API Collection" in the left sidebar
2. Go to the "Variables" tab
3. Set the following variables:
   - `base_url`: `http://localhost:5000/api` (already set)
   - `token`: Leave empty for now (will be filled after login)

---

## SCREENSHOT REQUIREMENTS

For each API endpoint, capture a screenshot showing:
1. ✅ Request method (GET, POST, PUT, DELETE)
2. ✅ Full URL
3. ✅ Headers tab (showing Authorization header when applicable)
4. ✅ Body tab (for POST/PUT requests with JSON data)
5. ✅ Response status code (200, 201, 400, etc.)
6. ✅ Response body (JSON data)
7. ✅ Response time

**Screenshot Format:**
- Full Postman window
- Clear and readable text
- Show both request and response in one screenshot if possible

---

## STEP-BY-STEP TESTING SEQUENCE

### PHASE 1: AUTHENTICATION (3 Screenshots)

#### Screenshot 1: Register User
**Endpoint:** `POST /api/auth/register`

1. Select "Authentication" → "Register User"
2. Verify the Body tab shows:
```json
{
  "firstName": "Juan",
  "lastName": "Dela Cruz",
  "email": "juan.delacruz@trophe.edu",
  "password": "student123",
  "role": "student",
  "studentId": "STU-2024-001",
  "department": "Computer Science"
}
```
3. Click "Send"
4. **CAPTURE SCREENSHOT** showing:
   - Request body
   - Response status: 201 Created
   - Response body with user data and token

---

#### Screenshot 2: Login (Admin)
**Endpoint:** `POST /api/auth/login`

1. Select "Authentication" → "Login"
2. Change the Body to:
```json
{
  "email": "admin@trophe.edu",
  "password": "admin123"
}
```
3. Click "Send"
4. **IMPORTANT:** Copy the `token` value from the response
5. Go to Collection Variables and paste the token in the `token` variable
6. **CAPTURE SCREENSHOT** showing:
   - Request body with admin credentials
   - Response status: 200 OK
   - Response body with user data and token (highlight the token)

---

#### Screenshot 3: Get Current User
**Endpoint:** `GET /api/auth/me`

1. Select "Authentication" → "Get Current User"
2. Go to "Headers" tab - verify Authorization header shows: `Bearer {{token}}`
3. Click "Send"
4. **CAPTURE SCREENSHOT** showing:
   - Headers tab with Authorization
   - Response status: 200 OK
   - Response body with current user profile

---

### PHASE 2: USER MANAGEMENT (5 Screenshots)

#### Screenshot 4: Get All Users
**Endpoint:** `GET /api/users`

1. Select "Users" → "Get All Users"
2. Ensure you're logged in as admin (token set)
3. Click "Send"
4. **CAPTURE SCREENSHOT** showing:
   - Authorization header
   - Response status: 200 OK
   - Response body with array of users

---

#### Screenshot 5: Get Users by Role (Students)
**Endpoint:** `GET /api/users?role=student`

1. Select "Users" → "Get Users by Role"
2. Verify URL has query parameter: `?role=student`
3. Click "Send"
4. **CAPTURE SCREENSHOT** showing:
   - URL with query parameter
   - Response status: 200 OK
   - Response body with only student users

---

#### Screenshot 6: Create User (Faculty)
**Endpoint:** `POST /api/users`

1. Select "Users" → "Create User"
2. Verify Body shows:
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
3. Click "Send"
4. **CAPTURE SCREENSHOT** showing:
   - Request body
   - Response status: 201 Created
   - Response body with new user data

---

#### Screenshot 7: Update User
**Endpoint:** `PUT /api/users/:id`

1. Select "Users" → "Update User"
2. **IMPORTANT:** Replace `:id` in URL with actual user ID from previous response
   - Example: `http://localhost:5000/api/users/6614a1b2c3d4e5f6a7b8c9d0`
3. Verify Body shows:
```json
{
  "department": "Information Technology",
  "isActive": true
}
```
4. Click "Send"
5. **CAPTURE SCREENSHOT** showing:
   - URL with actual ID
   - Request body
   - Response status: 200 OK
   - Response body with updated user

---

#### Screenshot 8: Delete User
**Endpoint:** `DELETE /api/users/:id`

1. Select "Users" → "Delete User"
2. Replace `:id` with the user ID you just created
3. Click "Send"
4. **CAPTURE SCREENSHOT** showing:
   - URL with actual ID
   - Response status: 200 OK
   - Response body with success message

---

### PHASE 3: COURSE MANAGEMENT (4 Screenshots)

#### Screenshot 9: Get All Courses
**Endpoint:** `GET /api/courses`

1. Select "Courses" → "Get All Courses"
2. Click "Send"
3. **CAPTURE SCREENSHOT** showing:
   - Response status: 200 OK
   - Response body with array of courses (with populated faculty and students)

---

#### Screenshot 10: Create Course
**Endpoint:** `POST /api/courses`

1. Select "Courses" → "Create Course"
2. Verify Body shows:
```json
{
  "courseCode": "CS101",
  "courseName": "Introduction to Programming",
  "description": "Fundamentals of programming using Python",
  "units": 3,
  "department": "Computer Science"
}
```
3. Click "Send"
4. **COPY the course `_id` from response** (needed for next steps)
5. **CAPTURE SCREENSHOT** showing:
   - Request body
   - Response status: 201 Created
   - Response body with new course data

---

#### Screenshot 11: Enroll Student in Course
**Endpoint:** `POST /api/courses/:id/enroll`

1. Select "Courses" → "Enroll Student"
2. Replace `:id` in URL with the course ID from Screenshot 10
3. Get a student ID from "Get All Users" response
4. Update Body:
```json
{
  "studentId": "PASTE_ACTUAL_STUDENT_ID_HERE"
}
```
5. Click "Send"
6. **CAPTURE SCREENSHOT** showing:
   - URL with course ID
   - Request body with student ID
   - Response status: 200 OK
   - Response body showing updated course with enrolled student

---

#### Screenshot 12: Get My Courses (Student View)
**Endpoint:** `GET /api/courses/my-courses`

1. **FIRST:** Login as a student to get student token
   - Use "Authentication" → "Login"
   - Body: `{"email": "juan.delacruz@trophe.edu", "password": "student123"}`
   - Copy the token and update the `token` variable
2. Select "Courses" → "Get My Courses (Student)"
3. Click "Send"
4. **CAPTURE SCREENSHOT** showing:
   - Response status: 200 OK
   - Response body with student's enrolled courses only

---

### PHASE 4: SCHEDULE MANAGEMENT (3 Screenshots)

**NOTE:** Login as admin again before this phase

#### Screenshot 13: Get All Schedules
**Endpoint:** `GET /api/schedules`

1. Select "Schedules" → "Get All Schedules"
2. Click "Send"
3. **CAPTURE SCREENSHOT** showing:
   - Response status: 200 OK
   - Response body with array of schedules (with populated course data)

---

#### Screenshot 14: Create Schedule (Success)
**Endpoint:** `POST /api/schedules`

1. Select "Schedules" → "Create Schedule"
2. Get a course ID from "Get All Courses" response
3. Update Body:
```json
{
  "course": "PASTE_ACTUAL_COURSE_ID_HERE",
  "day": "Monday",
  "startTime": "08:00",
  "endTime": "09:30",
  "room": "Room 101",
  "semester": "1st Semester",
  "schoolYear": "2024-2025"
}
```
4. Click "Send"
5. **CAPTURE SCREENSHOT** showing:
   - Request body with actual course ID
   - Response status: 201 Created
   - Response body with new schedule

---

#### Screenshot 15: Create Schedule (Room Conflict)
**Endpoint:** `POST /api/schedules` (Conflict Test)

1. Select "Schedules" → "Create Schedule - Room Conflict"
2. Use a DIFFERENT course ID
3. Update Body to create a conflict:
```json
{
  "course": "DIFFERENT_COURSE_ID",
  "day": "Monday",
  "startTime": "08:30",
  "endTime": "10:00",
  "room": "Room 101",
  "semester": "1st Semester",
  "schoolYear": "2024-2025"
}
```
4. Click "Send"
5. **CAPTURE SCREENSHOT** showing:
   - Request body
   - Response status: 409 Conflict
   - Response body with conflict error message and conflictType

---

### PHASE 5: ATTENDANCE TRACKING (3 Screenshots)

#### Screenshot 16: Mark Attendance (Bulk)
**Endpoint:** `POST /api/attendance/mark`

1. Select "Attendance" → "Mark Attendance"
2. Get course ID and student IDs from previous responses
3. Update Body:
```json
{
  "courseId": "PASTE_COURSE_ID",
  "date": "2026-04-23",
  "records": [
    {
      "studentId": "STUDENT_ID_1",
      "status": "present",
      "remarks": ""
    },
    {
      "studentId": "STUDENT_ID_2",
      "status": "late",
      "remarks": "Arrived 10 minutes late"
    },
    {
      "studentId": "STUDENT_ID_3",
      "status": "absent",
      "remarks": ""
    }
  ]
}
```
4. Click "Send"
5. **CAPTURE SCREENSHOT** showing:
   - Request body with actual IDs
   - Response status: 201 Created
   - Response body with array of attendance records

---

#### Screenshot 17: Get My Attendance (Student View)
**Endpoint:** `GET /api/attendance/my-attendance`

1. **FIRST:** Login as student (juan.delacruz@trophe.edu)
2. Update token variable
3. Select "Attendance" → "Get My Attendance"
4. Click "Send"
5. **CAPTURE SCREENSHOT** showing:
   - Response status: 200 OK
   - Response body with student's attendance records

---

#### Screenshot 18: Get Attendance Summary
**Endpoint:** `GET /api/attendance/summary/:studentId/:courseId`

1. Login as admin again
2. Select "Attendance" → "Get Attendance Summary"
3. Replace `:studentId` and `:courseId` in URL with actual IDs
4. Click "Send"
5. **CAPTURE SCREENSHOT** showing:
   - URL with actual IDs
   - Response status: 200 OK
   - Response body with attendance statistics (total, present, absent, percentage)

---

### PHASE 6: ANNOUNCEMENTS (2 Screenshots)

#### Screenshot 19: Get Announcements
**Endpoint:** `GET /api/announcements`

1. Select "Announcements" → "Get Announcements"
2. Click "Send"
3. **CAPTURE SCREENSHOT** showing:
   - Response status: 200 OK
   - Response body with array of announcements (filtered by user role)

---

#### Screenshot 20: Create Announcement
**Endpoint:** `POST /api/announcements`

1. Select "Announcements" → "Create Announcement"
2. Verify Body shows:
```json
{
  "title": "Midterm Examination Schedule",
  "content": "Midterm examinations will be held from October 14-18, 2024. Please check your respective schedules.",
  "targetRoles": ["faculty", "student"],
  "isPinned": true
}
```
3. Click "Send"
4. **CAPTURE SCREENSHOT** showing:
   - Request body
   - Response status: 201 Created
   - Response body with new announcement

---

### PHASE 7: NOTIFICATIONS (3 Screenshots)

#### Screenshot 21: Get Notifications
**Endpoint:** `GET /api/notifications`

1. Select "Notifications" → "Get Notifications"
2. Click "Send"
3. **CAPTURE SCREENSHOT** showing:
   - Response status: 200 OK
   - Response body with array of notifications (last 50)

---

#### Screenshot 22: Get Unread Count
**Endpoint:** `GET /api/notifications/unread-count`

1. Select "Notifications" → "Get Unread Count"
2. Click "Send"
3. **CAPTURE SCREENSHOT** showing:
   - Response status: 200 OK
   - Response body with unread count

---

#### Screenshot 23: Mark Notification as Read
**Endpoint:** `PUT /api/notifications/:id/read`

1. Select "Notifications" → "Mark as Read"
2. Get a notification ID from "Get Notifications" response
3. Replace `:id` in URL with actual notification ID
4. Click "Send"
5. **CAPTURE SCREENSHOT** showing:
   - URL with actual notification ID
   - Response status: 200 OK
   - Response body with success message

---

## ORGANIZING YOUR SCREENSHOTS

### File Naming Convention
Use this format for easy organization:
```
01_Auth_Register.png
02_Auth_Login_Admin.png
03_Auth_GetCurrentUser.png
04_Users_GetAll.png
05_Users_GetByRole.png
06_Users_Create.png
07_Users_Update.png
08_Users_Delete.png
09_Courses_GetAll.png
10_Courses_Create.png
11_Courses_Enroll.png
12_Courses_MyCoursesStudent.png
13_Schedules_GetAll.png
14_Schedules_Create.png
15_Schedules_Conflict.png
16_Attendance_Mark.png
17_Attendance_MyAttendance.png
18_Attendance_Summary.png
19_Announcements_GetAll.png
20_Announcements_Create.png
21_Notifications_GetAll.png
22_Notifications_UnreadCount.png
23_Notifications_MarkRead.png
```

---

## CREATING THE DOCUMENTATION DOCUMENT

After capturing all screenshots, create a document with this structure:

### Option 1: Microsoft Word Document
1. Create a new Word document
2. Title: "Trophe API Documentation - Postman Testing"
3. For each endpoint, include:
   - Endpoint name and description
   - Screenshot
   - Brief explanation of what the screenshot shows

### Option 2: PDF Document
1. Use Google Docs or Word
2. Insert screenshots with captions
3. Export as PDF

### Document Structure:
```
TROPHE API DOCUMENTATION
Postman Testing Results

1. AUTHENTICATION ENDPOINTS
   1.1 Register User
       [Screenshot]
       Description: Shows successful user registration...
   
   1.2 Login
       [Screenshot]
       Description: Shows admin login with token generation...
   
   ... continue for all endpoints

2. USER MANAGEMENT ENDPOINTS
   ...

3. COURSE MANAGEMENT ENDPOINTS
   ...

[Continue for all sections]
```

---

## TROUBLESHOOTING

### Issue: "Not authorized, no token"
**Solution:** Make sure you've set the `token` variable after logging in

### Issue: "User already exists"
**Solution:** Use different email addresses or run `node seed.js` to reset database

### Issue: "Cannot find user/course/schedule"
**Solution:** Make sure you're using actual IDs from previous responses, not placeholder text

### Issue: Connection refused
**Solution:** Ensure backend server is running on port 5000

---

## QUICK REFERENCE: TEST DATA

### Login Credentials (from seed.js):
```
Admin:
  Email: admin@trophe.edu
  Password: admin123

Faculty:
  Email: maria.santos@trophe.edu
  Password: faculty123

Student:
  Email: juan.delacruz@trophe.edu
  Password: student123
  Student ID: STU-2024-001
```

### Sample Course Codes (from seed):
- CS101 - Introduction to Programming
- CS201 - Data Structures and Algorithms
- MATH101 - Calculus I
- CS301 - Web Development

---

## FINAL CHECKLIST

Before submitting, verify you have:
- [ ] All 23 screenshots captured
- [ ] Screenshots are clear and readable
- [ ] All screenshots show both request and response
- [ ] Screenshots include status codes
- [ ] Screenshots show actual data (not placeholder IDs)
- [ ] Screenshots are properly named
- [ ] Document is well-organized
- [ ] Each screenshot has a brief description

---

**Good luck with your documentation!** 🚀
