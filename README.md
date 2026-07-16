# Acadia

**Verified Tutors, Automated Scheduling — A Peer-to-Peer Learning Platform for Philippine Colleges**

Built by Team Odyssey | University of Cebu Pardo-Talisay Campus | College of Computer Studies

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js + Tailwind CSS + Framer Motion + Vite |
| Backend | Node.js + Express.js |
| Database | MongoDB (Mongoose ODM) |
| OCR | Tesseract.js |
| Auth | JWT + bcrypt |
| ML Services | Python + Flask + scikit-learn (2 microservices) |
| Real-time | Socket.io (messaging + video) |
| File Security | AES-256-CBC encryption at rest |

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/try/download/community) running locally on port 27017
- [Python](https://www.python.org/) 3.10+ with pip
- npm (comes with Node.js)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/saidryus/Acadia.git
cd Acadia
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

# Optional — enables LLM fallback for recommendation letter analysis
# OPENAI_API_KEY=sk-...
# OPENAI_MODEL=gpt-4o-mini

# Optional — ML service URLs (defaults shown)
# ML_RECOMMENDATION_URL=http://localhost:5002
# ML_FEEDBACK_URL=http://localhost:5003
```

### 3. Set up the frontend

```bash
cd frontend
npm install
```

### 4. Set up the ML services

```bash
cd ml

# Install Python dependencies
pip install flask flask-cors scikit-learn numpy joblib

# Train and start the recommendation letter ML service (port 5002)
cd recommendation
python generate_training_data.py
python train_model.py
python app.py

# In a separate terminal — train and start the feedback ML service (port 5003)
cd ../feedback
python generate_training_data.py
python train_model.py
python app.py
```

> The ML services are optional. If they are not running, the system falls back to
> rule-based analysis automatically. The recommendation service also supports an
> OpenAI LLM fallback if `OPENAI_API_KEY` is set in `.env`.

### 5. Start MongoDB

```bash
mongod
```

### 6. Seed the database

From the `backend/` directory:

```bash
node seed.js
```

This creates:
- Admin account: `admin@acadia.edu` / `admin123`
- 100 students (25 per year level) with schedules
- 30 courses (UC-CCS BSIT curriculum)
- 5 approved tutors + 2 pending applications
- 6 sample sessions + ratings
- 2 announcements

```bash
# Optional — seed additional demo reviews for tutor feedback analysis
node seed-reviews.js
```

### Full database wipe (if needed)

```bash
node truncate-all.js   # clears ALL collections
node seed.js           # repopulate
```

### 7. Run the application

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
|---|---|---|---|
| Admin | admin@acadia.edu | admin123 | Full access |
| Student (Year 3) | 23063670 | 670 | Simone Makinano — no schedule, upload study load manually |
| Student (Year 1) | 202401001 | 001 | Juan Dela Cruz |
| Student (Year 2) | 202302001 | 001 | Miguel Dela Cruz |
| Student (Year 3) | 202203001 | 001 | Rafael Dela Cruz |
| Student (Year 4) | 202104001 | 001 | Antonio Dela Cruz |

> All student passwords = last 3 digits of their Student ID. All seeded students will be prompted to change password on first login.

---

## Key Features

### Core Platform
- **Constraint-Based Scheduling** — Finds mutual free time slots by cross-referencing tutor and tutee class schedules, holidays, and existing session bookings
- **Competency-Based Tutor Ranking** — Weighted formula: Ratings (45%) + Faculty Recommendation Score (15%) + Completion Rate (20%) + Sessions (20%)
- **Study Load Upload** — Students upload their study load PDF; system extracts schedule via OCR, detects semester, and links to courses
- **Session Lifecycle** — Pending → Scheduled → Completed / Cancelled with in-app notifications at every step
- **Real-time Messaging** — In-session chat with Socket.io
- **Video Rooms** — Integrated video call support per session
- **Learning Materials** — Tutors can upload and share resources per session
- **Availability Management** — Tutors set weekly availability; scheduling respects it

### Tutor Application & Verification
- **Recommendation Letter Upload** — Students upload a faculty recommendation letter as part of their tutor application
- **ML Analysis Pipeline** — Three-tier analysis: ML model (TF-IDF + SVM) → LLM fallback (GPT-4o-mini) → rule-based fallback
  - Predicts recommendation strength (Strong / Moderate / Weak / None)
  - Identifies subjects mentioned in the letter
  - Extracts soft skills
  - Computes a 0–100 confidence score with breakdown
- **OCR Text Extraction** — Tesseract.js extracts text from uploaded PDFs/images
- **PII Redaction** — Student ID numbers are redacted from OCR text before database storage
- **Document Encryption** — Uploaded files are AES-256-CBC encrypted at rest
- **Document Expiry** — Files are auto-deleted after a configurable number of days if not yet reviewed
- **Admin Re-authentication Gate** — Document access requires password re-entry, with 3-attempt lockout
- **Audit Log** — Every document view and deletion is logged with admin identity and IP
- **ML Correction Feedback Loop** — Admins can correct ML predictions via a ✏️ button; corrections accumulate in the database and can be used to retrain the model

### Admin Tools
- **Department Scoping** — Sub-admins see only their department's data
- **Tutor Application Review** — Full AI analysis report, subject alignment breakdown, anomaly detection
- **Announcements** — Platform-wide and department-targeted announcements
- **User & Course Management** — Full CRUD for users and courses

### Student Analytics
- **My Analytics Page** — Session history, tutor ratings, subject breakdown
- **Tutor Dashboard** — Tutors see their own performance metrics and feedback insights

---

## ML Services

Two separate Flask microservices handle ML inference.

### Recommendation Letter Model (port 5002)

Analyzes uploaded recommendation letters to support admin review.

```
ml/recommendation/
├── generate_training_data.py   # Generates 4000 synthetic training samples
├── train_model.py              # Trains TF-IDF (word+char n-grams) + SVM + LogReg
├── app.py                      # Flask inference API
├── realistic_letters.py        # 30 manually crafted realistic Filipino university letters
├── add_to_training.py          # Merges realistic letters into training data and retrains
├── merge_corrections.py        # Pulls admin corrections from backend and retrains
└── recommendation_model.pkl    # Trained model (generated, not committed)
```

**To improve the model with realistic letters:**
```bash
cd ml/recommendation
python realistic_letters.py     # generates realistic_letters.json
# review and correct realistic_letters.json if needed
python add_to_training.py       # merges + retrains
python app.py                   # restart service
```

**To retrain with admin corrections (after real applications come in):**
```bash
python merge_corrections.py --token <admin-jwt-token>
python app.py
```

### Tutor Feedback Model (port 5003)

Analyzes written tutor reviews to extract structured insights (sentiment, strengths, improvements, topics). Display only — does not affect ratings or rankings.

```
ml/feedback/
├── generate_training_data.py   # Generates 1200 synthetic review samples
├── train_model.py              # Trains TF-IDF + SVM + LogReg (4 tasks)
├── app.py                      # Flask inference API
├── integrate_rmp.py            # Integrates RateMyProfessors public dataset (CC BY 4.0)
└── feedback_model.pkl          # Trained model (generated, not committed)
```

**To improve the model with real RateMyProfessors data:**
```bash
cd ml/feedback
python integrate_rmp.py    # downloads ~80MB dataset, merges, retrains
python app.py              # restart service
```

---

## Project Structure

```
Acadia/
├── backend/
│   ├── controllers/      # Route handlers (14 controllers)
│   ├── models/           # Mongoose schemas (13 collections)
│   ├── routes/           # Express routes
│   ├── middleware/       # Auth, upload, rate limiting, department scoping
│   ├── utils/            # OCR, ML clients, encryption, PII redaction,
│   │                     # recommendation analysis, feedback analysis,
│   │                     # document access tokens, expiry, notifications
│   ├── uploads/          # Encrypted uploaded documents
│   └── server.js         # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components (chat, video, modals, etc.)
│   │   ├── context/      # Auth + Theme context providers
│   │   ├── pages/        # Page components
│   │   │   ├── admin/    # Admin dashboard, users, courses, tutor applications
│   │   │   ├── student/  # Sessions, schedule, become tutor, analytics
│   │   │   └── shared/   # Announcements, resources
│   │   └── utils/        # API client, sounds, helpers
│   └── index.html
├── ml/
│   ├── recommendation/   # Recommendation letter ML service (port 5002)
│   ├── feedback/         # Tutor feedback ML service (port 5003)
│   └── train.py          # Attendance risk ML model (port 5001)
└── deliverables/         # Documentation, ER diagrams, workflow diagrams
```

---

## Database

**MongoDB database name:** `trophe`

**Collections (13):**
Users, Courses, Departments, TutorProfiles, StudentSchedules, Sessions, Ratings, Notifications, Announcements, Settings, Availability, Materials, Messages

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| PORT | Backend server port | 5000 |
| MONGO_URI | MongoDB connection string | mongodb://localhost:27017/trophe |
| JWT_SECRET | Secret key for JWT tokens | (required) |
| NODE_ENV | Environment mode | development |
| OPENAI_API_KEY | Enables LLM fallback for recommendation analysis | (optional) |
| OPENAI_MODEL | OpenAI model to use | gpt-4o-mini |
| ML_RECOMMENDATION_URL | Recommendation ML service URL | http://localhost:5002 |
| ML_FEEDBACK_URL | Feedback ML service URL | http://localhost:5003 |

---

## Troubleshooting

| Issue | Fix |
|---|---|
| `ECONNREFUSED` on backend start | Make sure MongoDB is running (`mongod`) |
| Frontend shows blank page | Check backend is running on port 5000 |
| ML analysis falls back to rule-based | Start the ML services (`python app.py` in both ml/ folders) |
| OCR takes too long on first run | Tesseract downloads language data (~15MB) on first use |
| Login fails for seeded student | Password is last 3 digits of student ID |
| "Schedule required" error | Upload a study load PDF first from My Schedule page |
| Document access locked | 3 failed re-auth attempts triggers a 3-hour lockout |

---

## License

This project is developed as an academic capstone project for the University of Cebu Pardo-Talisay Campus, College of Computer Studies.
