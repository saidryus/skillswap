# Installation Guide — Acadia

## Overview

This guide walks through a complete installation of Acadia from scratch on a single machine. All services (backend, frontend, MongoDB, and ML services) run locally. Follow each step in order.

**Estimated setup time:** 30–60 minutes (depending on download speed and hardware)

---

## 1. Prerequisites

Install the following before proceeding. Verify each installation by running the version check command.

| Software | Required Version | Version Check | Download |
|---|---|---|---|
| Node.js | 18.x LTS | `node --version` | https://nodejs.org |
| npm | 9.x+ (bundled with Node.js 18) | `npm --version` | (bundled with Node.js) |
| Python | 3.10+ | `python --version` | https://python.org |
| pip | 22.x+ (bundled with Python 3.10) | `pip --version` | (bundled with Python) |
| MongoDB Community | 7.x | `mongod --version` | https://www.mongodb.com/try/download/community |
| Git | Any recent version | `git --version` | https://git-scm.com |

> On Windows, ensure that Node.js, Python, and MongoDB are added to your system PATH during installation.

---

## 2. Clone the Repository

```bash
git clone https://github.com/your-org/acadia.git
cd acadia
```

Replace the URL above with your actual repository URL.

---

## 3. Backend Setup

### 3.1 Install Backend Dependencies

```bash
cd backend
npm install
```

This installs all packages listed in `backend/package.json` (Express, Mongoose, Tesseract.js, etc.). Expect 300–500 MB in `node_modules`.

### 3.2 Create the Environment File

Create a file named `.env` inside the `backend/` directory:

```bash
# backend/.env

# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/trophe

# Authentication
JWT_SECRET=replace_with_a_long_random_string_at_least_32_chars

# CORS — set to your frontend URL
FRONTEND_URL=http://localhost:5173

# ML Service URLs
ML_RECOMMENDATION_URL=http://localhost:5002
ML_FEEDBACK_URL=http://localhost:5003

# File Encryption (AES-256-CBC)
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
DOC_ENCRYPTION_KEY=your_64_char_hex_key_here

# Document expiry — days before unreviewed recommendation letters are auto-deleted
DOC_EXPIRY_DAYS=30

# OpenAI (optional — LLM fallback for recommendation letter analysis)
# OPENAI_API_KEY=sk-...
# OPENAI_MODEL=gpt-4o-mini
```

Generate the encryption key using the command shown in the comment:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output into `DOC_ENCRYPTION_KEY`.

> **Important:** Keep `.env` private. Never commit it to version control. It is already listed in `backend/.gitignore`.

---

## 4. Frontend Setup

### 4.1 Install Frontend Dependencies

From the project root (or the `frontend/` directory if separate):

```bash
cd ../frontend
npm install
```

This installs all React, Vite, Tailwind, and other frontend packages. Expect 300–500 MB in `node_modules`.

> If there is no separate `frontend/` directory and the frontend is at the project root, run `npm install` from the root instead.

---

## 5. ML Services Setup

There are three separate ML services. Each requires the same Python dependencies.

### 5.1 Install Python Dependencies

Navigate to each ML service directory and install dependencies:

```bash
# ML Recommendation Service (port 5002)
cd ../ml/recommendation
pip install -r ../../ml/requirements.txt

# ML Feedback Service (port 5003)
cd ../ml/feedback
pip install -r ../../ml/requirements.txt

# ML Attendance Risk Service (port 5001)
cd ../ml
pip install -r requirements.txt
```

If a `requirements.txt` is not present, install dependencies manually:

```bash
pip install flask==2.3.3 scikit-learn==1.3.2 numpy==1.24.4 joblib==1.3.2
```

### 5.2 Generate Training Data

Each ML service includes a script to generate synthetic training data:

```bash
# Recommendation service
cd ml/recommendation
python generate_training_data.py

# Feedback service
cd ../feedback
python generate_training_data.py

# Attendance risk service uses synthetic generation inside train.py — skip this step
```

### 5.3 Train the Models

```bash
# Recommendation service
cd ml/recommendation
python train_model.py

# Feedback service
cd ../feedback
python train_model.py

# Attendance risk service
cd ..
python train.py
```

This produces `.pkl` model files used for inference. Training takes 1–5 minutes per service depending on hardware.

### 5.4 Verify Model Files

After training, verify that `.pkl` files exist in each service directory:

```bash
ls *.pkl
# Expected: vectorizer.pkl, model.pkl (names vary by service)
```

---

## 6. Start MongoDB

MongoDB must be running before you start the backend.

**Windows (as a service — if installed as a service):**
```bash
net start MongoDB
```

**Windows (manual start):**
```bash
mongod --dbpath "C:\data\db"
```
Create the `C:\data\db` directory if it does not exist.

**Linux/macOS:**
```bash
sudo systemctl start mongod
# or
mongod --dbpath /var/lib/mongodb
```

Verify MongoDB is running:
```bash
mongosh
# Should open the MongoDB shell connected to localhost:27017
```

---

## 7. Seed the Database

The seed script creates the initial demo data (admin account, 100 students, 5 tutors, 30 courses, sessions, ratings):

```bash
cd backend
node seed.js
```

Expected output:
```
✓ Connected to MongoDB (trophe)
✓ Seeded departments
✓ Seeded courses (30)
✓ Seeded users (admin + 100 students + 5 faculty)
✓ Seeded tutor profiles (5 approved)
✓ Seeded sessions
✓ Seeded ratings
✓ Seeding complete
```

---

## 8. Start All Services

Open separate terminal windows for each service.

### Terminal 1 — Backend

```bash
cd backend
npm run dev
```

Expected output:
```
Server running on port 5000
Connected to MongoDB (trophe)
Document expiry scheduler started
```

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
```

### Terminal 3 — ML Recommendation Service (port 5002)

```bash
cd ml/recommendation
python app.py
```

### Terminal 4 — ML Feedback Service (port 5003)

```bash
cd ml/feedback
python app.py
```

### Terminal 5 — ML Attendance Risk Service (port 5001)

```bash
cd ml
python app.py
```

---

## 9. Verification Checklist

Open your browser and go to `http://localhost:5173`. Use the checklist below to verify everything is running:

| Check | How to Verify | Expected |
|---|---|---|
| Frontend loads | Navigate to `http://localhost:5173` | Login page displayed |
| Backend running | Navigate to `http://localhost:5000/api/health` (if health endpoint exists) or check terminal | No errors in backend terminal |
| MongoDB connected | Check backend terminal output | "Connected to MongoDB (trophe)" message |
| Admin login works | Log in with `admin@acadia.edu` / `admin123` | Admin Dashboard loads |
| ML Recommendation reachable | Submit a tutor application | Analysis result appears (not "service unavailable") |
| Slot suggestions work | Log in as a tutee → Find Tutor → Book Session | Suggested slots appear |
| Notifications work | Perform an action that triggers a notification | Notification bell shows new count |

---

## 10. Demo Accounts

| Role | Login ID | Password | Notes |
|---|---|---|---|
| Super Admin | `admin@acadia.edu` | `admin123` | Full access — must change password on first login |
| Student (Year 3) | `23063670` | `670` | Simone Makinano — no schedule, upload study load manually |
| Student (Year 1) | `202401001` | `001` | Juan Dela Cruz |
| Student (Year 2) | `202302001` | `001` | Miguel Dela Cruz |
| Student (Year 3) | `202203001` | `001` | Rafael Dela Cruz — has tutor profile |
| Student (Year 4) | `202104001` | `001` | Antonio Dela Cruz |

> All student passwords are the **last 3 digits of their Student ID**. All seeded students will be prompted to change their password on first login.

---

## 11. Troubleshooting

| Problem | Likely Cause | Solution |
|---|---|---|
| `Error: ECONNREFUSED 127.0.0.1:27017` | MongoDB is not running | Start MongoDB (`mongod`) before starting the backend |
| Frontend shows blank page | Vite not started, or built files not found | Run `npm run dev` in the frontend directory; check browser console for JS errors |
| ML analysis always shows "rule-based" | ML service not running or ECONNREFUSED on port 5002 | Start `ml_recommendation/app.py`; check that port 5002 is not blocked by firewall |
| OCR takes very long (>60 seconds) | Low RAM; Tesseract.js loading large language model | Ensure at least 8 GB RAM is available; close other applications |
| Login fails with correct credentials | Database not seeded, or wrong `MONGO_URI` | Run `node seed.js`; verify `MONGO_URI` in `.env` points to the correct database |
| "Schedule required" error when booking | Student has no study load and no availability set | Student must upload study load or manually set availability before booking |
| Document access locked (3-hour lockout) | 3 failed document re-auth attempts | Wait 3 hours, or have a super admin reset the `docAuthLockedUntil` field on the User document in MongoDB |
| `dotenv: Missing .env file` | `.env` not created in `backend/` | Create `backend/.env` using the template in Step 3.2 |
| `DOC_ENCRYPTION_KEY must be 64 hex chars` | Key is wrong length | Regenerate using `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| Jitsi Meet room does not load | No internet access or browser blocking third-party iframes | Ensure internet is available; check browser popup/iframe blocking settings |

---

## 12. Production Deployment Notes

Before deploying Acadia to a production environment, apply the following changes:

| Setting | Action |
|---|---|
| `NODE_ENV` | Set to `production` in `.env`. This activates the HTTPS redirect middleware and tightens error responses. |
| `FRONTEND_URL` | Set to your actual production domain (e.g., `https://acadia.yourdomain.edu`). |
| `JWT_SECRET` | Use a cryptographically random string of at least 64 characters. |
| `DOC_ENCRYPTION_KEY` | Generate a fresh key for production. Store securely (e.g., environment secret manager). |
| HTTPS | Configure your reverse proxy (Nginx, Caddy, or Apache) to terminate SSL. The backend HTTPS redirect requires the server to be behind HTTPS. |
| MongoDB | Use a dedicated MongoDB instance with authentication enabled. Update `MONGO_URI` to include credentials. |
| Rate limits | The default limits (300/min general, 10/15min login) are appropriate for departmental use. Adjust in `backend/middleware/rateLimiter.js` if needed. |
| `OPENAI_API_KEY` | Set only if you want LLM fallback in production. Be aware of API usage costs. |
| PM2 or systemd | Use a process manager to keep the Node.js backend and Python ML services running after system restarts. |
| File storage | Consider a dedicated volume or object storage for `backend/uploads/` in production to prevent disk space issues. |
| Demo accounts | Change or deactivate all seeded demo passwords immediately in production. |
