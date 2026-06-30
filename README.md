# SkillSwap

**Verified Tutors, Automated Scheduling — A Peer-to-Peer Learning Platform for Philippine Colleges**

Built by Team Odyssey | University of Cebu Pardo-Talisay Campus | College of Computer Studies

---

## Tech Stack

- **Frontend:** React.js + Tailwind CSS + Framer Motion + Vite
- **Backend:** Node.js + Express.js
- **Database:** MongoDB (Mongoose ODM)
- **OCR:** Tesseract.js
- **Auth:** JWT + bcrypt

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/try/download/community) running locally on port 27017
- npm (comes with Node.js)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/saidryus/skillswap.git
cd skillswap
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/trophe
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

### 3. Set up the frontend

```bash
cd frontend
npm install
```

### 4. Start MongoDB

Make sure MongoDB is running locally:
```bash
mongod
```

### 5. Seed the database

From the `backend/` directory:

```bash
# Full seed — creates admin, courses, 100 students, schedules, tutors, sessions
node seed.js
```

This creates:
- Admin account: `admin@skillswap.edu` / `admin123`
- 100 students (25 per year level) with schedules
- 30 courses (UC-CCS BSIT curriculum)
- 5 approved tutors + 2 pending applications
- 6 sample sessions + ratings
- 2 announcements

### Full database wipe (if needed)

```bash
node truncate.js
```

Clears ALL data from all collections. Run `node seed.js` after to repopulate.

### 6. Run the application

**Backend** (from `backend/`):
```bash
npm run dev
```
Server starts at `http://localhost:5000`

**Frontend** (from `frontend/`):
```bash
npm run dev
```
App starts at `http://localhost:5173`

---

## Demo Accounts

| Role | Login ID | Password | Notes |
|------|----------|----------|-------|
| Admin | admin@skillswap.edu | admin123 | Full access |
| Student (Year 3) | 23063670 | 670 | Simone Makinano — must change password, no schedule (upload study load manually) |
| Student (Year 1) | 202401001 | 001 | Juan Dela Cruz |
| Student (Year 2) | 202302001 | 001 | Miguel Dela Cruz |
| Student (Year 3) | 202203001 | 001 | Rafael Dela Cruz |
| Student (Year 4) | 202104001 | 001 | Antonio Dela Cruz |

> All student passwords = last 3 digits of their Student ID. All seeded students (including Simone) will be prompted to change password on first login.

---

## Key Features

- **Constraint-Based Scheduling** — Automatically finds mutual free time slots between tutor and tutee by cross-referencing their class schedules
- **Competency-Based Tutor Ranking** — Weighted formula: Ratings (35%) + Grade (25%) + Completion Rate (20%) + Sessions (20%)
- **OCR Grade Verification** — Extracts grades from uploaded grade slips using Tesseract.js
- **Study Load Upload** — Students upload their study load PDF; system extracts schedule, detects semester, links to courses
- **Schedule Required Gates** — Can't apply as tutor or book a session without uploading schedule first
- **Session Lifecycle** — Pending → Scheduled → Completed/Cancelled with notifications at each step
- **Real-time Notifications** — In-app alerts for session requests, approvals, completions
- **Admin Dashboard** — Overview stats, user management, course management, tutor application review

---

## Project Structure

```
skillswap/
├── backend/
│   ├── controllers/      # Route handlers
│   ├── models/           # Mongoose schemas (10 collections)
│   ├── routes/           # Express routes
│   ├── middleware/       # Auth, upload, department scoping
│   ├── utils/            # OCR extractors, notification helpers
│   ├── uploads/          # Uploaded grade documents
│   └── server.js         # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── context/      # Auth context provider
│   │   ├── pages/        # Page components (admin/ + student/)
│   │   └── utils/        # API client, sounds, helpers
│   └── index.html
└── deliverables/         # Documentation, diagrams, study guides
```

---

## Database

**MongoDB database name:** `trophe`

**Collections (10):**
Users, Courses, Departments, TutorProfiles, StudentSchedules, Sessions, Ratings, Notifications, Announcements, Settings

See `deliverables/DATABASE_STUDY_GUIDE.md` for full schema documentation.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `ECONNREFUSED` on backend start | Make sure MongoDB is running (`mongod`) |
| Frontend shows blank page | Check backend is running on port 5000 |
| OCR takes too long | First run downloads language data (~15MB). Subsequent runs are faster |
| Login fails for seeded student | Password is `password123`. If already changed, reset via admin |
| "Schedule required" error | Upload a study load PDF first from My Schedule page |

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Backend server port | 5000 |
| MONGO_URI | MongoDB connection string | mongodb://localhost:27017/trophe |
| JWT_SECRET | Secret key for JWT tokens | (required) |
| NODE_ENV | Environment mode | development |

---

## License

This project is developed as an academic capstone project for the University of Cebu Pardo-Talisay Campus, College of Computer Studies.
