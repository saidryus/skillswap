# Technology Stack — Acadia

## Overview

Acadia is a full-stack web application built on a three-tier architecture: a React-based single-page application on the frontend, a Node.js/Express REST API on the backend, and a set of Python Flask microservices for machine learning inference. All tiers communicate over HTTP/WebSocket and are designed to run on a single local or institutional server.

---

## 1. Frontend Layer

| Package | Version | Purpose |
|---|---|---|
| react | 18.x | Core UI library — component model, virtual DOM, hooks |
| react-dom | 18.x | DOM rendering for React |
| vite | 5.x | Build tool and development server (port 5173) |
| react-router-dom | 6.x | Client-side routing, nested routes, protected routes |
| tailwindcss | 3.4.x | Utility-first CSS framework for all layout and styling |
| framer-motion | latest | Declarative animation library for page transitions and UI feedback |
| gsap | latest | High-performance animation library used in landing/dashboard sequences |
| three | latest | 3D rendering engine (WebGL) |
| @react-three/fiber | latest | React renderer for Three.js — 3D scene composition |
| @dnd-kit/core | latest | Drag-and-drop primitives for schedule/availability management |
| axios | latest | HTTP client for all REST API calls to the backend |
| socket.io-client | latest | WebSocket client for real-time in-app messaging |
| jspdf | latest | Client-side PDF generation (e.g., session summaries) |
| react-icons | latest | Icon library (Font Awesome, Material, etc.) |
| react-hot-toast | latest | Toast notification system for user feedback |
| howler | latest | Audio playback library for notification sounds |

### Frontend Build Output

Vite compiles the React application into static assets (`dist/`) that can be served by any static host or proxied through the Express backend in production.

---

## 2. Backend Layer

| Package | Version | Purpose |
|---|---|---|
| express | 4.18.x | HTTP server framework, routing, middleware pipeline |
| mongoose | 8.x | MongoDB ODM — schema definition, validation, query building |
| jsonwebtoken | latest | JWT generation and verification (7-day expiry, Bearer tokens) |
| bcryptjs | latest | Password hashing with salt rounds for secure credential storage |
| helmet | 8.3.x | Sets secure HTTP response headers (CSP, HSTS, X-Frame-Options, etc.) |
| express-mongo-sanitize | latest | Strips `$` and `.` operators from request bodies to prevent NoSQL injection |
| express-rate-limit | 8.5.x | Request rate limiting (login: 10/15min, API: 300/min, doc routes: custom) |
| multer | 2.1.x | Multipart form-data handling for file uploads |
| sharp | 0.35.x | Image processing — resize and normalize uploaded images before OCR |
| pdfjs-dist | 4.4.x | Server-side PDF parsing and text extraction |
| tesseract.js | 7.0.x | Pure-JS OCR engine for extracting text from recommendation letter images and PDFs |
| openai | 4.52.x | OpenAI API client — optional LLM fallback for document analysis |
| socket.io | latest | WebSocket server for real-time messaging within session chat rooms |
| cors | latest | Cross-Origin Resource Sharing headers for frontend–backend communication |
| dotenv | latest | Loads environment variables from `.env` file |
| crypto (Node built-in) | N/A | AES-256-CBC file encryption/decryption for documents at rest |

### Backend Entry Point

`backend/server.js` — starts Express on **port 5000**, connects to MongoDB, registers all middleware and route modules, initializes the document expiry scheduler, and attaches Socket.io.

---

## 3. ML Services Layer

All three ML services are standalone Python Flask applications. They are invoked via HTTP from the Node.js backend.

### ML Service 1 — Recommendation Letter Analyzer (port 5002)

| Package | Version | Purpose |
|---|---|---|
| Python | 3.10+ | Runtime |
| Flask | 2.3+ | HTTP server exposing inference endpoints |
| scikit-learn | 1.3+ | TF-IDF vectorizer, LinearSVC (multi-label subject classification), Logistic Regression (strength classification) |
| numpy | 1.24+ | Numerical array operations for feature vectors |
| joblib | 1.3+ | Model serialization and deserialization (`.pkl` files) |

**Purpose:** Analyzes OCR-extracted text from faculty recommendation letters. Outputs predicted subject competencies (multi-label), academic strengths, and soft skills. Used to populate the tutor profile's competency fields and the admin's AI analysis panel.

### ML Service 2 — Tutor Feedback Insights (port 5003)

| Package | Version | Purpose |
|---|---|---|
| Python | 3.10+ | Runtime |
| Flask | 2.3+ | HTTP server |
| scikit-learn | 1.3+ | TF-IDF + 4 classifiers (sentiment, strengths, improvements, topics) |
| numpy | 1.24+ | Feature processing |
| joblib | 1.3+ | Model I/O |

**Purpose:** Processes written tutor feedback/ratings submitted by students. Returns structured insights: overall sentiment, identified strengths, areas for improvement, and topic tags. Results are displayed in the Tutor Dashboard and My Analytics pages.

### ML Service 3 — Attendance Risk Predictor (port 5001)

| Package | Version | Purpose |
|---|---|---|
| Python | 3.10+ | Runtime |
| Flask | 2.3+ | HTTP server |
| scikit-learn | 1.3+ | Random Forest classifier |
| numpy | 1.24+ | Feature engineering |
| joblib | 1.3+ | Model I/O |

**Purpose:** Predicts a student's attendance risk level (low/medium/high) based on session attendance patterns. Used in the student analytics view and admin session overview.

---

## 4. Database Layer

| Component | Version | Details |
|---|---|---|
| MongoDB | 7.x | NoSQL document database |
| Database name | `trophe` | Single database, 13 collections |
| Mongoose | 8.x | ODM layer with schema validation |

### Collections

`Users`, `Courses`, `Departments`, `TutorProfiles`, `StudentSchedules`, `Sessions`, `Ratings`, `Notifications`, `Announcements`, `Settings`, `Availability`, `Materials`, `Messages`

---

## 5. Development & Testing Tools

| Tool | Version | Purpose |
|---|---|---|
| Newman | 6.1.1 | CLI runner for Postman collections — automated API testing |
| newman-reporter-htmlextra | latest | Generates rich HTML test reports from Newman runs |
| nodemon | latest | Auto-restarts the backend server on file changes during development |
| Postman | latest | API collection authoring and manual endpoint testing |
| Git | latest | Version control |

---

## 6. External Integrations

| Service | Integration Method | Purpose |
|---|---|---|
| Jitsi Meet | URL-based room generation | Video conferencing for tutoring sessions. The backend generates a Jitsi room URL (e.g., `https://meet.jit.si/<roomId>`) that is embedded or linked within the session view. No self-hosted WebRTC infrastructure is required. Requires internet access. |
| OpenAI API | `openai` npm package v4.52 | Optional LLM fallback for document analysis when the ML recommendation service (port 5002) is unavailable. Controlled by the `OPENAI_API_KEY` environment variable. If the key is absent, the system falls through to rule-based analysis. |

---

## 7. Full Stack Summary Table

| Layer | Technology | Version | Port |
|---|---|---|---|
| Frontend SPA | React + Vite | 18 / 5 | 5173 |
| Frontend Styling | Tailwind CSS | 3.4 | — |
| Backend API | Node.js + Express | 18+ / 4.18 | 5000 |
| Database | MongoDB | 7.x | 27017 |
| ML Recommendation | Python + Flask + scikit-learn | 3.10+ / 2.3+ / 1.3+ | 5002 |
| ML Feedback | Python + Flask + scikit-learn | 3.10+ / 2.3+ / 1.3+ | 5003 |
| ML Attendance | Python + Flask + scikit-learn | 3.10+ / 2.3+ / 1.3+ | 5001 |
| Real-time | Socket.io | latest | (via 5000) |
| Video Conferencing | Jitsi Meet | External | — |
| LLM Fallback | OpenAI API | 4.52 (optional) | — |
| API Testing | Newman | 6.1.1 | — |
