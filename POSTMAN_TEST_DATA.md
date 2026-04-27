# POSTMAN TEST DATA REFERENCE
## Quick Copy-Paste Data for API Testing

This document contains ready-to-use JSON data for testing all API endpoints in Postman.

---

## AUTHENTICATION

### Register User
```json
{
  "firstName": "Pedro",
  "lastName": "Garcia",
  "email": "pedro.garcia@trophe.edu",
  "password": "student123",
  "role": "student",
  "studentId": "STU-2024-004",
  "department": "Computer Science"
}
```

### Login - Admin
```json
{
  "email": "admin@trophe.edu",
  "password": "admin123"
}
```

### Login - Faculty
```json
{
  "email": "maria.santos@trophe.edu",
  "password": "faculty123"
}
```

### Login - Student
```json
{
  "email": "juan.delacruz@trophe.edu",
  "password": "student123"
}
```

---

## USER MANAGEMENT

### Create User - Faculty
```json
{
  "firstName": "Roberto",
  "lastName": "Cruz",
  "email": "roberto.cruz@trophe.edu",
  "password": "faculty123",
  "role": "faculty",
  "department": "Information Technology"
}
```

### Create User - Student
```json
{
  "firstName": "Isabella",
  "lastName": "Reyes",
  "email": "isabella.reyes@trophe.edu",
  "password": "student123",
  "role": "student",
  "studentId": "STU-2024-005",
  "department": "Computer Science"
}
```

### Update User
```json
{
  "department": "Information Technology",
  "isActive": true
}
```

---

## COURSE MANAGEMENT

### Create Course - CS102
```json
{
  "courseCode": "CS102",
  "courseName": "Object-Oriented Programming",
  "description": "Introduction to OOP concepts using Java",
  "units": 3,
  "department": "Computer Science"
}
```

### Create Course - IT101
```json
{
  "courseCode": "IT101",
  "courseName": "Database Management Systems",
  "description": "Fundamentals of database design and SQL",
  "units": 3,
  "department": "Information Technology"
}
```

### Create Course - MATH102
```json
{
  "courseCode": "MATH102",
  "courseName": "Calculus II",
  "description": "Advanced calculus and applications",
  "units": 4,
  "department": "Mathematics"
}
```

### Enroll Student (replace IDs with actual values)
```json
{
  "studentId": "REPLACE_WITH_ACTUAL_STUDENT_ID"
}
```

### Unenroll Student
```json
{
  "studentId": "REPLACE_WITH_ACTUAL_STUDENT_ID"
}
```

---

## SCHEDULE MANAGEMENT

### Create Schedule - Morning Class
```json
{
  "course": "REPLACE_WITH_ACTUAL_COURSE_ID",
  "day": "Monday",
  "startTime": "08:00",
  "endTime": "09:30",
  "room": "Room 201",
  "semester": "1st Semester",
  "schoolYear": "2024-2025"
}
```

### Create Schedule - Afternoon Class
```json
{
  "course": "REPLACE_WITH_ACTUAL_COURSE_ID",
  "day": "Tuesday",
  "startTime": "13:00",
  "endTime": "14:30",
  "room": "Room 305",
  "semester": "1st Semester",
  "schoolYear": "2024-2025"
}
```

### Create Schedule - Lab Class
```json
{
  "course": "REPLACE_WITH_ACTUAL_COURSE_ID",
  "day": "Wednesday",
  "startTime": "15:00",
  "endTime": "17:00",
  "room": "Computer Lab 2",
  "semester": "1st Semester",
  "schoolYear": "2024-2025"
}
```

### Create Schedule - CONFLICT TEST (Room)
```json
{
  "course": "REPLACE_WITH_DIFFERENT_COURSE_ID",
  "day": "Monday",
  "startTime": "08:30",
  "endTime": "10:00",
  "room": "Room 201",
  "semester": "1st Semester",
  "schoolYear": "2024-2025"
}
```

### Update Schedule
```json
{
  "room": "Room 401",
  "startTime": "10:00",
  "endTime": "11:30"
}
```

---

## ATTENDANCE TRACKING

### Mark Attendance - All Present
```json
{
  "courseId": "REPLACE_WITH_ACTUAL_COURSE_ID",
  "date": "2026-04-23",
  "records": [
    {
      "studentId": "REPLACE_WITH_STUDENT_ID_1",
      "status": "present",
      "remarks": ""
    },
    {
      "studentId": "REPLACE_WITH_STUDENT_ID_2",
      "status": "present",
      "remarks": ""
    },
    {
      "studentId": "REPLACE_WITH_STUDENT_ID_3",
      "status": "present",
      "remarks": ""
    }
  ]
}
```

### Mark Attendance - Mixed Status
```json
{
  "courseId": "REPLACE_WITH_ACTUAL_COURSE_ID",
  "date": "2026-04-24",
  "records": [
    {
      "studentId": "REPLACE_WITH_STUDENT_ID_1",
      "status": "present",
      "remarks": "On time"
    },
    {
      "studentId": "REPLACE_WITH_STUDENT_ID_2",
      "status": "late",
      "remarks": "Arrived 15 minutes late"
    },
    {
      "studentId": "REPLACE_WITH_STUDENT_ID_3",
      "status": "absent",
      "remarks": "No excuse letter"
    }
  ]
}
```

### Mark Attendance - With Excused Absence
```json
{
  "courseId": "REPLACE_WITH_ACTUAL_COURSE_ID",
  "date": "2026-04-25",
  "records": [
    {
      "studentId": "REPLACE_WITH_STUDENT_ID_1",
      "status": "present",
      "remarks": ""
    },
    {
      "studentId": "REPLACE_WITH_STUDENT_ID_2",
      "status": "excused",
      "remarks": "Medical certificate provided"
    }
  ]
}
```

---

## ANNOUNCEMENTS

### Create Announcement - General
```json
{
  "title": "Campus Maintenance Notice",
  "content": "The campus will undergo scheduled maintenance on Saturday, April 26, 2026. All facilities will be closed from 8:00 AM to 5:00 PM.",
  "targetRoles": ["admin", "faculty", "student"],
  "isPinned": false
}
```

### Create Announcement - Students Only
```json
{
  "title": "Scholarship Application Deadline",
  "content": "Reminder: The deadline for scholarship applications is May 1, 2026. Please submit all required documents to the Registrar's Office.",
  "targetRoles": ["student"],
  "isPinned": true
}
```

### Create Announcement - Faculty Only
```json
{
  "title": "Grade Submission Deadline",
  "content": "All faculty members must submit final grades by May 15, 2026. Late submissions will require written justification.",
  "targetRoles": ["faculty"],
  "isPinned": true
}
```

### Create Announcement - Emergency
```json
{
  "title": "Class Suspension Announcement",
  "content": "Due to inclement weather, all classes are suspended today, April 23, 2026. Online classes will proceed as scheduled.",
  "targetRoles": ["admin", "faculty", "student"],
  "isPinned": true
}
```

### Update Announcement
```json
{
  "title": "Updated: Campus Maintenance Notice",
  "content": "The scheduled maintenance has been rescheduled to Sunday, April 27, 2026.",
  "isPinned": false
}
```

---

## ADDITIONAL TEST SCENARIOS

### Create Multiple Courses for Testing
```json
// Course 1
{
  "courseCode": "CS103",
  "courseName": "Computer Architecture",
  "description": "Study of computer organization and design",
  "units": 3,
  "department": "Computer Science"
}

// Course 2
{
  "courseCode": "IT102",
  "courseName": "Network Administration",
  "description": "Fundamentals of network setup and management",
  "units": 3,
  "department": "Information Technology"
}

// Course 3
{
  "courseCode": "CS104",
  "courseName": "Software Engineering",
  "description": "Principles and practices of software development",
  "units": 3,
  "department": "Computer Science"
}
```

### Create Multiple Students for Testing
```json
// Student 1
{
  "firstName": "Miguel",
  "lastName": "Torres",
  "email": "miguel.torres@trophe.edu",
  "password": "student123",
  "role": "student",
  "studentId": "STU-2024-006",
  "department": "Computer Science"
}

// Student 2
{
  "firstName": "Sofia",
  "lastName": "Ramos",
  "email": "sofia.ramos@trophe.edu",
  "password": "student123",
  "role": "student",
  "studentId": "STU-2024-007",
  "department": "Information Technology"
}

// Student 3
{
  "firstName": "Diego",
  "lastName": "Fernandez",
  "email": "diego.fernandez@trophe.edu",
  "password": "student123",
  "role": "student",
  "studentId": "STU-2024-008",
  "department": "Computer Science"
}
```

---

## TESTING WORKFLOW SUMMARY

1. **Start Fresh**: Run `node seed.js` to reset database
2. **Login as Admin**: Get admin token
3. **Test User Management**: Create, read, update users
4. **Test Course Management**: Create courses, enroll students
5. **Test Schedule Management**: Create schedules, test conflicts
6. **Login as Faculty**: Get faculty token
7. **Test Attendance**: Mark attendance for courses
8. **Test Announcements**: Create announcements
9. **Login as Student**: Get student token
10. **Test Student Views**: My courses, my attendance, my schedule
11. **Test Notifications**: View notifications triggered by actions

---

## TIPS FOR SUCCESSFUL TESTING

1. **Always copy actual IDs**: Don't use placeholder text like "USER_ID_HERE"
2. **Keep a notepad**: Save IDs as you create resources
3. **Test in order**: Follow the sequence to ensure data exists
4. **Use different emails**: Avoid duplicate email errors
5. **Check status codes**: 200/201 = success, 400/401/403/409/500 = error
6. **Update token variable**: After each login, update the collection variable
7. **Test both success and error cases**: Show that validation works

---

## COMMON IDS TO TRACK

As you test, keep track of these IDs:

```
Admin Token: _________________________________

Faculty User ID: _____________________________
Faculty Token: _______________________________

Student User ID: _____________________________
Student Token: _______________________________

Course 1 ID (CS101): _________________________
Course 2 ID (CS201): _________________________
Course 3 ID (MATH101): _______________________

Schedule 1 ID: _______________________________
Schedule 2 ID: _______________________________

Notification ID: _____________________________
```

---

**Ready to test!** Follow the POSTMAN_SCREENSHOT_GUIDE.md for step-by-step instructions.
