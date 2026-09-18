# Software Specification — Acadia

## Overview

This document defines the software requirements for installing and operating Acadia — a web-based peer-to-peer academic tutoring platform. It covers runtime environments, required software versions, environment variable configuration, and dependency summaries for all three service layers.

---

## 1. Operating System Requirements

Acadia is designed to run on any OS capable of hosting Node.js 18+, Python 3.10+, and MongoDB 7.x.

| Component | Supported OS |
|---|---|
| Application Server (backend + ML) | Windows 10/11, Ubuntu 20.04+, macOS 12+ |
| Client (browser-based) | Any OS with a supported modern browser |
| Development Environment (tested) | Windows 10 64-bit |

> The client-side application is entirely browser-based. No software installation is required on student or admin devices — only a compatible browser and network access to the server.

---

## 2. Runtime Version Requirements

| Runtime | Minimum Version | Notes |
|---|---|---|
| Node.js | 18.x LTS | Required for backend (`backend/server.js`) and frontend build (`vite`) |
| npm | 9.x+ | Bundled with Node.js 18; used for all JS dependency management |
| Python | 3.10+ | Required for all three ML Flask services |
| pip | 22.x+ | Python package manager; bundled with Python 3.10+ |
| MongoDB | 7.x | Document database; must be running before the backend starts |

---

## 3. Browser Requirements (Client)

| Browser | Minimum Version | Notes |
|---|---|---|
| Google Chrome | 100+ | Recommended; best tested |
| Mozilla Firefox | 100+ | Fully supported |
| Microsoft Edge | 100+ | Chromium-based; fully supported |
| Safari | 15.4+ | Supported; minor WebRTC/Jitsi differences possible |
| Internet Explorer | Not supported | — |

> Jitsi Meet video sessions require WebRTC support. All listed browsers include WebRTC. Users on Safari should ensure camera/microphone permissions are granted at the OS level.

---

## 4. Required Environment Variables

Create a `.env` file in the `backend/` directory. All variables below are required unless marked optional.

| Variable | Example Value | Description |
|---|---|---|
| `PORT` | `5000` | Port the Express backend listens on |
| `MONGO_URI` | `mongodb://localhost:27017/trophe` | Full MongoDB connection string. Database name is `trophe`. |
| `JWT_SECRET` | `your_jwt_secret_key_here` | Secret key used to sign and verify JWT tokens. Use a long, random string in production. |
| `NODE_ENV` | `development` | Set to `production` to enable HTTPS redirect, stricter CSP, and production error handling |
| `FRONTEND_URL` | `http://localhost:5173` | Allowed CORS origin. In production, set to the actual frontend domain. |
| `ML_RECOMMENDATION_URL` | `http://localhost:5002` | Base URL of the Recommendation Letter ML service |
| `ML_FEEDBACK_URL` | `http://localhost:5003` | Base URL of the Tutor Feedback ML service |
| `DOC_ENCRYPTION_KEY` | `64-char hex string` | 256-bit key used for AES-256-CBC encryption of uploaded documents. Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `DOC_EXPIRY_DAYS` | `30` | Number of days before an unreviewed recommendation document is auto-deleted |
| `OPENAI_API_KEY` | `sk-...` | **(Optional)** OpenAI API key for LLM fallback in document analysis. If omitted, falls through to rule-based analysis. |
| `OPENAI_MODEL` | `gpt-4o-mini` | **(Optional)** OpenAI model to use for LLM fallback |

---

## 5. Software Dependencies Summary

### 5.1 Backend (Node.js)

Located in `backend/package.json`. Install with `npm install` inside the `backend/` directory.

| Category | Key Packages |
|---|---|
| Server framework | `express@4.18.x` |
| Database | `mongoose@8.x` |
| Authentication | `jsonwebtoken`, `bcryptjs` |
| Security | `helmet@8.3.x`, `express-mongo-sanitize`, `express-rate-limit@8.5.x` |
| File handling | `multer@2.1.x`, `sharp@0.35.x` |
| OCR | `tesseract.js@7.0.x`, `pdfjs-dist@4.4.x` |
| Real-time | `socket.io` |
| LLM (optional) | `openai@4.52.x` |
| Utilities | `cors`, `dotenv` |

### 5.2 Frontend (React/Vite)

Located in `frontend/package.json` (or root). Install with `npm install`.

| Category | Key Packages |
|---|---|
| UI framework | `react@18.x`, `react-dom@18.x` |
| Build tool | `vite@5.x` |
| Routing | `react-router-dom@6.x` |
| Styling | `tailwindcss@3.4.x` |
| Animation | `framer-motion`, `gsap` |
| 3D | `three`, `@react-three/fiber`, `@react-three/drei` |
| HTTP | `axios` |
| DnD | `@dnd-kit/core`, `@dnd-kit/utilities` |
| PDF export | `jspdf`, `jspdf-autotable` |
| Utilities | `react-icons`, `react-hot-toast`, `howler` |

### 5.3 ML Services (Python)

All three ML services share a single `requirements.txt` located at `ml/requirements.txt`. Install with `pip install -r ml/requirements.txt`.

| Package | Version | Used By |
|---|---|---|
| Flask | 2.3+ | All three ML services |
| scikit-learn | 1.3+ | All three ML services |
| numpy | 1.24+ | All three ML services |
| joblib | 1.3+ | All three ML services |

### 5.4 Testing Tools

| Tool | Version | Install |
|---|---|---|
| Newman | 6.1.1 | `npm install -g newman@6.1.1` |
| newman-reporter-htmlextra | latest | `npm install -g newman-reporter-htmlextra` |

---

## 6. External Services

| Service | Requirement | Notes |
|---|---|---|
| Jitsi Meet | Internet access from client devices | Video sessions open a Jitsi Meet room URL in the browser. The Jitsi infrastructure is hosted externally — no server-side WebRTC setup is needed. LAN-only deployments will not support video sessions unless Jitsi is self-hosted. |
| OpenAI API | Internet access from server | Only required if `OPENAI_API_KEY` is set. The backend calls `api.openai.com` when the ML recommendation service is unavailable. |

---

## 7. Disk Space Requirements

| Component | Estimated Space |
|---|---|
| `backend/node_modules` | ~300–500 MB |
| `frontend/node_modules` | ~300–500 MB |
| ML model files (`.pkl`) | ~50–200 MB (per service, after training) |
| Tesseract language data (`eng.traineddata`) | ~22 MB |
| Uploaded documents (encrypted, `backend/uploads/`) | Variable; plan for ≥1 GB in production |
| MongoDB data directory | Variable; plan for ≥500 MB |
| **Total minimum** | **~2 GB free disk space recommended** |

> The installation guide provides specific commands to generate training data and train models. Trained model sizes depend on the volume of synthetic training samples used.

---

## 8. Network Requirements

| Connection | Requirement |
|---|---|
| Client → Server | LAN or internet; minimum 10 Mbps for video sessions |
| Server → MongoDB | Localhost (same machine) or LAN |
| Server → ML Recommendation Service | Localhost; port 5002 must be reachable |
| Server → ML Feedback Service | Localhost; port 5003 must be reachable |
| Server → ML Attendance Service | Localhost; port 5001 must be reachable |
| Server → OpenAI | Internet access (optional) |
| Client → Jitsi Meet | Internet access required for video |
