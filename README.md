# Trophe - Smart Campus Management System

A full-stack MERN application for managing campus operations including users, courses, schedules, attendance, and announcements.

---

## Project Structure

```
trophe/
├── backend/
│   ├── config/          # DB config
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth & role middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # Express routes
│   ├── seed.js          # Sample data seeder
│   ├── server.js        # Entry point
│   └── .env             # Environment variables
└── frontend/
    └── src/
        ├── components/  # Reusable UI components
        ├── context/     # Auth context
        ├── pages/       # Page components
        │   ├── admin/
        │   ├── faculty/
        │   ├── student/
        │   ├── shared/
        │   └── print/
        └── utils/       # Axios instance
```

---

## Setup Guide

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Backend Setup

```bash
cd backend
npm install
```

Edit `.env` if needed (default uses localhost MongoDB):
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/trophe
JWT_SECRET=trophe_super_secret_jwt_key_2024
```

Seed sample data:
```bash
node seed.js
```

Start backend:
```bash
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:5173
Backend runs at: http://localhost:5000

---

## Demo Credentials

| Role    | Email                          | Password    |
|---------|--------------------------------|-------------|
| Admin   | admin@trophe.edu               | admin123    |
| Faculty | maria.santos@trophe.edu        | faculty123  |
| Faculty | jose.reyes@trophe.edu          | faculty123  |
| Student | juan.delacruz@trophe.edu       | student123  |
| Student | ana.gonzales@trophe.edu        | student123  |
| Student | carlos.mendoza@trophe.edu      | student123  |

---

## API Documentation

### Auth
| Method | Route              | Description         | Access  |
|--------|--------------------|---------------------|---------|
| POST   | /api/auth/register | Register user       | Public  |
| POST   | /api/auth/login    | Login               | Public  |
| GET    | /api/auth/me       | Get current user    | Private |

### Users
| Method | Route           | Description      | Access |
|--------|-----------------|------------------|--------|
| GET    | /api/users      | Get all users    | Admin  |
| POST   | /api/users      | Create user      | Admin  |
| GET    | /api/users/:id  | Get user by ID   | Admin  |
| PUT    | /api/users/:id  | Update user      | Admin  |
| DELETE | /api/users/:id  | Delete user      | Admin  |

### Courses
| Method | Route                      | Description          | Access        |
|--------|----------------------------|----------------------|---------------|
| GET    | /api/courses               | Get all courses      | Private       |
| POST   | /api/courses               | Create course        | Admin         |
| GET    | /api/courses/my-courses    | Student's courses    | Student       |
| GET    | /api/courses/:id           | Get course by ID     | Private       |
| PUT    | /api/courses/:id           | Update course        | Admin         |
| DELETE | /api/courses/:id           | Delete course        | Admin         |
| POST   | /api/courses/:id/enroll    | Enroll student       | Admin         |
| POST   | /api/courses/:id/unenroll  | Remove student       | Admin         |

### Schedules
| Method | Route                       | Description           | Access  |
|--------|-----------------------------|-----------------------|---------|
| GET    | /api/schedules              | Get all schedules     | Private |
| POST   | /api/schedules              | Create schedule       | Admin   |
| GET    | /api/schedules/my-schedule  | Student's schedule    | Student |
| GET    | /api/schedules/:id          | Get schedule by ID    | Private |
| PUT    | /api/schedules/:id          | Update schedule       | Admin   |
| DELETE | /api/schedules/:id          | Delete schedule       | Admin   |

### Attendance
| Method | Route                                    | Description           | Access          |
|--------|------------------------------------------|-----------------------|-----------------|
| POST   | /api/attendance/mark                     | Mark attendance       | Admin, Faculty  |
| GET    | /api/attendance/my-attendance            | Student's attendance  | Student         |
| GET    | /api/attendance/course/:courseId         | Course attendance     | Admin, Faculty  |
| GET    | /api/attendance/summary/:studentId/:courseId | Attendance summary | Private       |

### Announcements
| Method | Route                    | Description              | Access          |
|--------|--------------------------|--------------------------|-----------------|
| GET    | /api/announcements       | Get announcements        | Private         |
| POST   | /api/announcements       | Create announcement      | Admin, Faculty  |
| PUT    | /api/announcements/:id   | Update announcement      | Admin, Faculty  |
| DELETE | /api/announcements/:id   | Delete announcement      | Admin, Faculty  |

---

## Features

- JWT authentication with role-based access (Admin, Faculty, Student)
- Full CRUD for users, courses, schedules, announcements
- Attendance marking with bulk support
- Printable study load with `window.print()` and PDF download via jsPDF
- Dark mode UI with Framer Motion animations
- Responsive sidebar layout
