# Trophe Setup Guide

Complete step-by-step guide to run the Trophe Smart Campus Management System.

---

## Prerequisites

Before starting, ensure you have:

1. **Node.js** (v18 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **MongoDB**
   - Option A: Local installation - https://www.mongodb.com/try/download/community
   - Option B: MongoDB Atlas (cloud) - https://www.mongodb.com/cloud/atlas
   - Verify: `mongod --version` (for local)

3. **Git** (optional, for cloning)
   - Download: https://git-scm.com/

---

## Installation Steps

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

This installs:
- express
- mongoose
- bcryptjs
- jsonwebtoken
- cors
- dotenv

### Step 2: Configure Environment Variables

The `.env` file is already created in `backend/.env` with default values:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/trophe
JWT_SECRET=trophe_super_secret_jwt_key_2024
NODE_ENV=development
```

**If using MongoDB Atlas:**
Replace `MONGO_URI` with your connection string:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/trophe?retryWrites=true&w=majority
```

### Step 3: Seed Sample Data

```bash
node seed.js
```

This creates:
- 1 Admin user
- 2 Faculty users
- 3 Student users
- 4 Courses
- 8 Schedules
- 3 Announcements

**Output:**
```
✅ MongoDB connected
✅ Seed data created successfully!

📋 Login Credentials:
Admin:   admin@trophe.edu / admin123
Faculty: maria.santos@trophe.edu / faculty123
Faculty: jose.reyes@trophe.edu / faculty123
Student: juan.delacruz@trophe.edu / student123 (ID: STU-2024-001)
Student: ana.gonzales@trophe.edu / student123 (ID: STU-2024-002)
Student: carlos.mendoza@trophe.edu / student123 (ID: STU-2024-003)
```

### Step 4: Start Backend Server

```bash
npm run dev
```

**Expected output:**
```
🚀 Server running on port 5000
✅ MongoDB connected
```

Backend is now running at: **http://localhost:5000**

---

### Step 5: Install Frontend Dependencies

Open a **new terminal** window:

```bash
cd frontend
npm install
```

This installs:
- react
- react-router-dom
- axios
- tailwindcss
- framer-motion
- react-hot-toast
- jspdf
- jspdf-autotable

### Step 6: Start Frontend Development Server

```bash
npm run dev
```

**Expected output:**
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Frontend is now running at: **http://localhost:5173**

---

## Testing the Application

### 1. Login as Admin

1. Open http://localhost:5173
2. Login with:
   - Email: `admin@trophe.edu`
   - Password: `admin123`
3. You should see the Admin Dashboard

**Admin Features:**
- View all users, courses, schedules
- Create/edit/delete users
- Create/edit/delete courses
- Enroll/unenroll students
- Create schedules
- Mark attendance
- Post announcements

### 2. Login as Faculty

1. Logout (click Logout in sidebar)
2. Login with:
   - Email: `maria.santos@trophe.edu`
   - Password: `faculty123`

**Faculty Features:**
- View assigned courses
- Mark attendance for students
- Post announcements

### 3. Login as Student

1. Logout
2. Login with:
   - Email: `juan.delacruz@trophe.edu`
   - Password: `student123`

**Student Features:**
- View enrolled courses
- View class schedule
- View attendance records
- **Print Study Load** (main feature)

### 4. Test Print Study Load

1. As a student, click **"Print Study Load"** button in topbar
2. You'll see a printer-friendly document with:
   - Student information
   - Enrolled courses table
   - Schedule details
   - Total units
3. Click **"Print"** to print using physical printer
4. Click **"Download PDF"** to save as PDF

---

## Project Structure Overview

```
trophe/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── auth.controller.js       # Login/register
│   │   ├── user.controller.js       # User CRUD
│   │   ├── course.controller.js     # Course CRUD
│   │   ├── schedule.controller.js   # Schedule CRUD
│   │   ├── attendance.controller.js # Attendance marking
│   │   └── announcement.controller.js
│   ├── middleware/
│   │   └── auth.middleware.js       # JWT & role auth
│   ├── models/
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Schedule.js
│   │   ├── Attendance.js
│   │   └── Announcement.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── course.routes.js
│   │   ├── schedule.routes.js
│   │   ├── attendance.routes.js
│   │   └── announcement.routes.js
│   ├── .env
│   ├── server.js                    # Entry point
│   ├── seed.js                      # Sample data
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx           # Main layout
    │   │   ├── Sidebar.jsx          # Navigation
    │   │   ├── Topbar.jsx           # Header
    │   │   ├── Modal.jsx            # Reusable modal
    │   │   ├── StatCard.jsx         # Dashboard cards
    │   │   └── PageHeader.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx      # Auth state
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── admin/               # Admin pages
    │   │   ├── faculty/             # Faculty pages
    │   │   ├── student/             # Student pages
    │   │   ├── shared/              # Shared pages
    │   │   └── print/
    │   │       └── PrintStudyLoad.jsx  # 🖨️ PRINT FEATURE
    │   ├── utils/
    │   │   └── api.js               # Axios config
    │   ├── App.jsx                  # Routes
    │   ├── main.jsx                 # Entry point
    │   └── index.css                # Tailwind styles
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## Common Issues & Solutions

### Issue 1: MongoDB Connection Error

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solution:**
- Ensure MongoDB is running: `mongod` (for local)
- Or use MongoDB Atlas and update `MONGO_URI` in `.env`

### Issue 2: Port Already in Use

**Error:** `Port 5000 is already in use`

**Solution:**
- Change `PORT` in `backend/.env` to another port (e.g., 5001)
- Or kill the process using port 5000

### Issue 3: CORS Error

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
- Ensure backend is running on port 5000
- Check `cors` configuration in `backend/server.js`

### Issue 4: JWT Token Invalid

**Error:** `Not authorized, token failed`

**Solution:**
- Clear browser localStorage
- Login again

---

## Production Deployment

### Backend (Node.js)

1. Set environment variables on hosting platform
2. Use production MongoDB URI
3. Set `NODE_ENV=production`
4. Deploy to: Heroku, Railway, Render, DigitalOcean, AWS, etc.

### Frontend (React)

1. Build production bundle:
   ```bash
   cd frontend
   npm run build
   ```
2. Deploy `dist/` folder to: Vercel, Netlify, AWS S3, etc.
3. Update API base URL in `frontend/src/utils/api.js`

---

## Tech Stack Summary

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs for password hashing

**Frontend:**
- React 18 (Vite)
- Tailwind CSS
- Framer Motion (animations)
- Axios (HTTP client)
- React Router (routing)
- jsPDF (PDF generation)
- React Hot Toast (notifications)

---

## Support

For issues or questions:
1. Check the README.md
2. Review API documentation
3. Check browser console for errors
4. Check backend terminal for errors

---

## License

MIT License - Free to use and modify
