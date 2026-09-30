# Technology Stack — Acadia

## Overview

Acadia is a full-stack web application built on a three-tier architecture: a React-based single-page application on the frontend, a Node.js/Express REST API on the backend, and a set of Python Flask microservices for machine learning inference. All tiers communicate over HTTP and are designed to run on a single local or institutional server.

---

## 1. Frontend Layer

| Package | Version | Purpose |
|---|---|---|
| react | 18.x | Core UI library — component model, virtual DOM, hooks |
| react-dom | 18.x | DOM rendering for React |
| vite | 5.x | Build tool and development server (port 5173) |
| react-router-dom | 6.x | Client-side routing, nested routes, protected routes |
| tailwindcss | 3.4.x | Utility-first CSS framework for all layout and styling |
| framer-motion | 10.x | Declarative animation library for page transitions and UI feedback |
| gsap | 3.15.x | High-performance animation library used in landing/dashboard sequences |
| three | 0.164.x | 3D rendering engine (WebGL) |
| @react-three/fiber | 8.x | React renderer for Three.js — 3D scene composition |
| @react-three/drei | 9.x | Helper components and abstractions for React Three Fiber |
| @dnd-kit/core | 6.x | Drag-and-drop primitives for schedule/availability management |
| @dnd-kit/utilities | 3.2.x | CSS and transform helpers for DnD Kit |
| axios | 1.6.x | HTTP client for all REST API calls to the backend |
| jspdf | 2.5.x | Client-side PDF generation (e.g., session summaries) |
| jspdf-autotable | 3.8.x | Table rendering plugin for jsPDF — structured data exports |
| react-icons | 4.12.x | Icon library (Font Awesome, Material, etc.) |
| react-hot-toast | 2.4.x | Toast notification system for user feedback |
| howler | 2.2.x | Audio playback library for notification sounds |

### Frontend Build Output

Vite compiles the React application into static assets (`dist/`) that can be served by any static host or proxied through the Express backend in production.

---

## 2. Backend Layer

| Package | Version | Purpose |
|---|---|---|
| express | 4.18.x | HTTP server framework, routing, middleware pipeline |
| mongoose | 8.x | MongoDB ODM — schema definition, validation, query building |
| jsonwebtoken | 9.0.x | JWT generation and verification (7-day expiry, Bearer tokens) |
| bcryptjs | 2.4.x | Password hashing with salt rounds for secure credential storage |
| helmet | 8.3.x | Sets secure HTTP response headers (CSP, HSTS, X-Frame-Options, etc.) |
| express-mongo-sanitize | 2.2.x | Strips `$` and `.` operators from request bodies to prevent NoSQL injection |
| express-rate-limit | 8.5.x | Request rate limiting (login: 10/15min, API: 300/min, doc routes: custom) |
| multer | 2.1.x | Multipart form-data handling for file uploads |
| sharp | 0.35.x | Image processing — resize and normalize uploaded images before OCR |
| pdfjs-dist | 4.4.x | Server-side PDF parsing and text extraction |
| tesseract.js | 7.0.x | Pure-JS OCR engine for extracting text from recommendation letter images and PDFs |
| openai | 4.52.x | OpenAI API client — optional LLM fallback for document analysis |
| docx | 8.5.x | Server-side Word (.docx) document generation |
| pdfkit | 0.19.x | Server-side PDF document generation |
| cors | 2.8.x | Cross-Origin Resource Sharing headers for frontend–backend communication |
| dotenv | 16.x | Loads environment variables from `.env` file |
| crypto (Node built-in) | N/A | AES-256-CBC file encryption/decryption for documents at rest |

### Backend Entry Point

`backend/server.js` — starts Express on **port 5000**, connects to MongoDB, registers all middleware and route modules, and initializes the document expiry scheduler.

---

## 3. ML Services Layer

Both ML services are standalone Python Flask applications. They are invoked via HTTP from the Node.js backend.

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

---

## 4. Database Layer

| Component | Version | Details |
|---|---|---|
| MongoDB | 7.x | NoSQL document database |
| Database name | `trophe` | Single database, 13 collections |
| mongodb | 7.x | Native MongoDB driver — underlying transport layer used by Mongoose |
| Mongoose | 8.x | ODM layer with schema validation |

### Collections

`Users`, `Courses`, `Departments`, `TutorProfiles`, `StudentSchedules`, `Sessions`, `Ratings`, `Notifications`, `Announcements`, `Settings`, `Availability`, `Materials`, `Messages`

---

## 5. Development & Testing Tools

| Tool | Version | Purpose |
|---|---|---|
| Newman | 6.1.1 | CLI runner for Postman collections — automated API testing |
| newman-reporter-htmlextra | latest | Generates rich HTML test reports from Newman runs |
| nodemon | 3.0.x | Auto-restarts the backend server on file changes during development |
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
| Video Conferencing | Jitsi Meet | External | — |
| LLM Fallback | OpenAI API | 4.52 (optional) | — |
| API Testing | Newman | 6.1.1 | — |
