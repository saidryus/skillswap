# TROPHE — LOCAL SETUP GUIDE
### Run the Full System on Your Own Machine

---

## WHAT YOU NEED BEFORE STARTING

You only need **two things** installed:

### 1. Node.js (v18 or higher)
- Download from: https://nodejs.org/en/download
- Choose the **LTS** version (the one that says "Recommended For Most Users")
- Install it like a normal program
- To verify it installed correctly, open a terminal and run:
  ```
  node --version
  ```
  You should see something like `v18.17.0` or higher.

### 2. A Terminal
- **Windows**: Use Command Prompt, PowerShell, or Git Bash
- **Mac/Linux**: Use the built-in Terminal

> ✅ That's it. No need to install MongoDB — the database is already hosted in the cloud (MongoDB Atlas).

---

## STEP 1 — Open the Project

Open your terminal and navigate to the project folder. If the project is on your Desktop:

```bash
# Windows
cd Desktop\trophe

# Mac/Linux
cd ~/Desktop/trophe
```

You should be inside the folder that contains `backend/`, `frontend/`, and `README.md`.

---

## STEP 2 — Set Up the Backend

### 2a. Go into the backend folder
```bash
cd backend
```

### 2b. Install dependencies
```bash
npm install
```
This downloads all the packages the backend needs (Express, Mongoose, JWT, bcrypt, etc.).
It may take 1–2 minutes. You'll see a `node_modules` folder appear when it's done.

### 2c. Check the .env file
The `.env` file should already exist at `backend/.env` with these contents:
```
PORT=5000
MONGO_URI=mongodb+srv://sa8d:mastermc@redred.nx0qh43.mongodb.net/trophe?retryWrites=true&w=majority
JWT_SECRET=trophe_super_secret_jwt_key_2024
NODE_ENV=development
```

> ⚠️ Do NOT change these values. The `MONGO_URI` connects to the cloud database that already has data in it.

### 2d. Seed the database (first time only)
```bash
node seed.js
```

You should see:
```
Connected to MongoDB
✅ Seed data created successfully!

📋 Login Credentials:
Admin:   admin@trophe.edu / admin123
Faculty: maria.santos@trophe.edu / faculty123
...
```

> ℹ️ You only need to run this once. If you run it again, it will wipe and re-create all sample data.

### 2e. Start the backend server
```bash
npm start
```

You should see:
```
✅ MongoDB connected
🚀 Server running on port 5000
```

> ✅ The backend is now running. **Leave this terminal open** — closing it stops the server.

---

## STEP 3 — Set Up the Frontend

**Open a NEW terminal window** (keep the backend terminal running).

### 3a. Go into the frontend folder

From the project root:
```bash
cd frontend
```

### 3b. Install dependencies
```bash
npm install
```
This downloads all the packages the frontend needs (React, Tailwind, Axios, etc.).

### 3c. Start the frontend
```bash
npm run dev
```

You should see:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
```

> ✅ The frontend is now running. **Leave this terminal open too.**

---

## STEP 4 — Open the App

Open your browser and go to:

```
http://localhost:5173
```

You should see the Trophe login page with the owl logo.

---

## LOGIN CREDENTIALS

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@trophe.edu | admin123 |
| Faculty | maria.santos@trophe.edu | faculty123 |
| Faculty | jose.reyes@trophe.edu | faculty123 |
| Student | juan.delacruz@trophe.edu | student123 (ID: STU-2024-001) |
| Student | ana.gonzales@trophe.edu | student123 (ID: STU-2024-002) |
| Student | carlos.mendoza@trophe.edu | student123 (ID: STU-2024-003) |

---

## SUMMARY — WHAT TO RUN

Every time you want to run the project locally, you need **two terminals open**:

**Terminal 1 — Backend:**
```bash
cd backend
npm start
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Then open: **http://localhost:5173**

---

## RUNNING POSTMAN AGAINST LOCAL BACKEND

If you want to test the API locally with Postman:

1. Make sure the backend is running (`npm start` in the backend folder)
2. Open Postman
3. The collection already has `{{base_url}}` set to `http://localhost:5000/api`
4. That's it — all requests will hit your local backend

---

## TROUBLESHOOTING

### Problem: `npm install` fails or takes too long
**Fix:** Make sure you have Node.js v18+ installed. Run `node --version` to check.

---

### Problem: Backend shows `MongoDB connection error`
**Fix:** Check your internet connection. The database is on MongoDB Atlas (cloud), so you need internet access.

---

### Problem: `Port 5000 is already in use`
**Fix:** Something else is using port 5000. Either:
- Close whatever is using it, OR
- Change `PORT=5000` to `PORT=5001` in `backend/.env`, then restart the backend

---

### Problem: Frontend shows blank page or errors
**Fix:**
1. Make sure the backend is running first
2. Check the browser console (F12 → Console tab) for error messages
3. Try clearing browser cache: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

---

### Problem: Login says "Invalid email or password"
**Fix:** Run the seed script again to reset the database:
```bash
cd backend
node seed.js
```

---

### Problem: `node_modules not found` or `Cannot find module`
**Fix:** You haven't installed dependencies yet. Run:
```bash
# In backend folder:
npm install

# In frontend folder:
npm install
```

---

### Problem: Frontend can't reach the backend (network error in browser)
**Fix:** The frontend is configured to proxy `/api` requests to `http://localhost:5000`. Make sure:
1. Backend is running on port 5000
2. You're accessing the frontend at `http://localhost:5173` (not a different port)

---

### Problem: `CORS error` in browser console
**Fix:** The backend allows requests from `http://localhost:5173`. Make sure:
- Frontend is running on port 5173 (default Vite port)
- Backend is running on port 5000
- You haven't changed the `FRONTEND_URL` in `.env`

---

## HOW THE LOCAL CONNECTION WORKS

When running locally, here's how the two parts talk to each other:

```
Browser (http://localhost:5173)
        ↓
Vite Dev Server (port 5173)
        ↓ proxies /api/* requests to →
Express Backend (http://localhost:5000)
        ↓
MongoDB Atlas (cloud database)
```

The proxy is configured in `frontend/vite.config.js`:
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true,
  },
},
```

This means when the frontend calls `/api/auth/login`, Vite automatically forwards it to `http://localhost:5000/api/auth/login`. You don't need to configure anything — it just works.

---

## FILE LOCATIONS REFERENCE

| What | Where |
|------|-------|
| Backend entry point | `backend/server.js` |
| Backend config | `backend/.env` |
| Sample data script | `backend/seed.js` |
| Frontend entry point | `frontend/src/main.jsx` |
| Page routes | `frontend/src/App.jsx` |
| API connection | `frontend/src/utils/api.js` |
| Login/auth logic | `frontend/src/context/AuthContext.jsx` |

---

## STOPPING THE SERVERS

To stop either server, go to its terminal and press:
```
Ctrl + C
```

---

*Trophe Local Setup Guide — for running the system on your own machine*
