# Hardware Specification — Acadia

## Overview

This document defines the hardware requirements for running Acadia. Two sets of specifications are provided: **minimum** (the lowest configuration on which the system has been tested and confirmed functional) and **recommended** (the configuration for comfortable, stable operation under typical departmental load).

Hardware requirements differ by role:
- **Server** — the machine hosting the Node.js backend, MongoDB database, and all three Python ML services.
- **Client** — any device used by students, tutors, or admins to access Acadia through a web browser.

---

## 1. Server Hardware Specifications

The server requirements are the most significant. The ML services (scikit-learn models + Flask + Tesseract.js OCR) are memory-intensive and benefit greatly from additional RAM and CPU cores.

| Component | Minimum | Recommended |
|---|---|---|
| **Processor** | Dual-core CPU, 2.0 GHz (x86-64) | Quad-core CPU, 2.5 GHz+ (e.g., Intel Core i5 10th gen or equivalent) |
| **RAM** | 8 GB | 16 GB — ML inference, OCR, and MongoDB each hold resident memory; 8 GB is tight when all services run concurrently |
| **Storage** | 10 GB free disk space (HDD or SSD) | 20 GB free disk space on SSD — SSD significantly improves MongoDB query latency and OCR temp file I/O |
| **Network Interface** | 10 Mbps upload/download | 25 Mbps+ — required if hosting video relay or if multiple concurrent sessions pull resources from the server |
| **Display** | Not required (headless server) | Not required |
| **Operating System** | Windows 10 64-bit / Ubuntu 20.04 LTS / macOS 12 | Windows 11 / Ubuntu 22.04 LTS / macOS 13+ |

> **Minimum hardware tested:** The system has been verified on Windows 10, 8 GB RAM, dual-core CPU, 10 GB available storage, standard broadband connection. Performance under heavy concurrent load (>20 simultaneous users) has not been evaluated at minimum spec.

---

## 2. Client Hardware Specifications

Client devices run only a web browser. No local software installation is required beyond the browser itself.

| Component | Minimum | Recommended |
|---|---|---|
| **Processor** | Any dual-core CPU (2010 or newer) | Any modern CPU (2018+) |
| **RAM** | 4 GB | 8 GB |
| **Storage** | No local storage requirement | No local storage requirement |
| **Network** | 5 Mbps (browsing + booking) | 10–25 Mbps — 25 Mbps recommended for smooth Jitsi Meet video sessions |
| **Display** | 1280 × 720 (HD) | 1920 × 1080 (Full HD) — the dashboard and analytics pages are optimized for FHD |
| **Webcam / Microphone** | Required for video tutoring sessions | HD webcam (720p+) and headset recommended for video quality |
| **Operating System** | Windows 10+, Ubuntu 20.04+, macOS 12+, Android 10+, iOS 15+ | Windows 11 / macOS 13+ / latest iOS or Android |
| **Browser** | Chrome 100+, Firefox 100+, Edge 100+ | Chrome (latest stable) |

---

## 3. Additional Notes

### Video Sessions (Jitsi Meet)
Jitsi Meet runs on Jitsi's external public servers — no WebRTC infrastructure, TURN/STUN servers, or video relay hardware is needed on the Acadia server. The server only generates and delivers a Jitsi room URL. All video/audio traffic flows directly between participant browsers and Jitsi's infrastructure. Internet access is required on client devices for video sessions to work.

### ML Services Memory Profile
Running all three ML services simultaneously (ports 5001, 5002, 5003) alongside Node.js and MongoDB is the primary reason the 8 GB RAM minimum is tight. Under the minimum spec:
- MongoDB: ~200–400 MB resident
- Node.js backend: ~150–300 MB resident
- Tesseract.js OCR (per document): ~300–500 MB during inference
- Each Flask ML service: ~200–400 MB resident (model loaded in memory)

On 8 GB RAM, this leaves limited headroom. 16 GB is strongly recommended for multi-user departmental deployment.

### Storage Growth
The `backend/uploads/` directory stores AES-256-CBC encrypted document files. Each recommendation letter (PDF or image) averages 500 KB–2 MB encrypted. Documents are auto-deleted after processing or upon expiry (`documentExpiresAt`). The 10 GB minimum accounts for node_modules, ML models, MongoDB data, and a modest uploads volume. For production use, 20 GB+ SSD is recommended.

### Single-Machine vs. Distributed
All services (backend, MongoDB, ML ×3) can run on a single machine at minimum spec. For larger deployments, ML services can be moved to a separate machine — update `ML_REC_URL`, `ML_FEEDBACK_URL`, and `ML_ATTENDANCE_URL` in the backend `.env` accordingly.
