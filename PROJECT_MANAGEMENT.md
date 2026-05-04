# Project Management, Timeline, Risk Assessment, and Budget Plan
## Trophe — Smart Campus Management System

---

# 1. Project Management Methodology

## Agile Framework

The Trophe Smart Campus Management System was developed using the **Agile Software Development Methodology**, specifically following a **Scrum-inspired iterative approach**. Agile was selected because the project required frequent feedback loops, incremental feature delivery, and the flexibility to adapt to evolving requirements throughout the development lifecycle.

Agile promotes collaboration, continuous improvement, and working software over rigid documentation. For a system like Trophe — which spans multiple user roles, a RESTful backend, and a dynamic frontend — Agile allowed the team to build, test, and validate each module independently before integrating them into the full system.

## Core Agile Principles Applied

- **Iterative Development** — The system was built in short development cycles (sprints), with each sprint delivering a working, testable increment of the product.
- **Continuous Integration** — Frontend and backend components were integrated and tested together at the end of each sprint rather than at the end of the project.
- **Collaborative Planning** — Sprint planning sessions were held at the start of each cycle to prioritize features from the product backlog.
- **Daily Standups** — Brief daily check-ins were conducted to surface blockers, align on progress, and adjust priorities.
- **Sprint Reviews and Retrospectives** — At the end of each sprint, the team reviewed completed work and identified process improvements for the next cycle.
- **Definition of Done** — A feature was considered complete only when it was implemented, tested, and integrated with the rest of the system without breaking existing functionality.

## Roles

| Role | Responsibility |
|---|---|
| Product Owner | Defines requirements, prioritizes the backlog, and accepts completed features |
| Scrum Master / Lead Developer | Facilitates sprints, removes blockers, ensures Agile practices are followed |
| Frontend Developer | Builds React components, pages, and UI/UX |
| Backend Developer | Implements API endpoints, database models, and business logic |
| QA / Tester | Validates features against requirements, performs integration and user testing |

## Sprint Structure

Each sprint ran for approximately **2–3 days** given the compressed project timeline. Sprints followed this structure:

1. **Sprint Planning** — Select backlog items, define sprint goal, assign tasks
2. **Development** — Build and integrate features
3. **Testing** — Unit and integration testing of sprint deliverables
4. **Sprint Review** — Demo working features, gather feedback
5. **Retrospective** — Identify what went well and what to improve

## Product Backlog (Prioritized)

| Priority | Feature | Story Points |
|---|---|---|
| 1 | User authentication (register, login, JWT) | 5 |
| 2 | User management (admin CRUD) | 3 |
| 3 | Course management and enrollment | 8 |
| 4 | Schedule management with conflict detection | 8 |
| 5 | Attendance tracking (bulk marking) | 5 |
| 6 | Announcement system | 3 |
| 7 | Notification system | 5 |
| 8 | Role-based dashboards | 5 |
| 9 | Study load print / PDF export | 3 |
| 10 | UI polish, animations, responsive design | 3 |
| 11 | Seed data and deployment preparation | 2 |
| 12 | Testing, bug fixes, documentation | 5 |

---

# 2. Project Timeline

| | |
|---|---|
| **Project Start** | April 18, 2026 |
| **Deployment / Go-Live** | April 28, 2026 |
| **Project End (Post-Deployment)** | May 15, 2026 |
| **Total Duration** | 27 days |

---

## Phase 1 — Project Initiation and Planning
**April 18 – April 19, 2026 (2 days)**

| Task | Duration | Owner |
|---|---|---|
| Finalize project scope and requirements | 1 day | Product Owner |
| Set up development environment (Node.js, MongoDB, Vite, Git) | 1 day | All Developers |
| Define database schema and API contract | 1 day | Backend Developer |
| Create project repository and folder structure | 0.5 day | Lead Developer |
| Sprint 1 planning session | 0.5 day | Full Team |

**Deliverables:** Finalized requirements document, initialized repository, defined data models and API structure.

---

## Phase 2 — Sprint 1: Core Backend and Authentication
**April 19 – April 21, 2026 (3 days)**

| Task | Duration | Owner |
|---|---|---|
| Implement User model with bcrypt hashing | 0.5 day | Backend |
| Build authentication endpoints (register, login, /me) | 1 day | Backend |
| Implement JWT protect and authorize middleware | 0.5 day | Backend |
| Build User management endpoints (admin CRUD) | 1 day | Backend |
| Set up Express server, CORS, MongoDB connection | 0.5 day | Backend |
| Build Login and Register pages (frontend) | 1 day | Frontend |
| Implement AuthContext and Axios interceptors | 0.5 day | Frontend |

**Deliverables:** Working authentication system, protected routes, user management API.

---

## Phase 3 — Sprint 2: Course and Enrollment Management
**April 21 – April 23, 2026 (2 days)**

| Task | Duration | Owner |
|---|---|---|
| Implement Course model and CRUD endpoints | 1 day | Backend |
| Build enroll/unenroll endpoints with notifications | 0.5 day | Backend |
| Implement getMyCourses and getMyTeachingCourses | 0.5 day | Backend |
| Build Admin Courses page with enrollment modal | 1 day | Frontend |
| Build Faculty Courses page | 0.5 day | Frontend |
| Build Student Courses page | 0.5 day | Frontend |

**Deliverables:** Full course management module, enrollment system, role-specific course views.

---

## Phase 4 — Sprint 3: Scheduling and Conflict Detection
**April 23 – April 25, 2026 (2 days)**

| Task | Duration | Owner |
|---|---|---|
| Implement Schedule model and CRUD endpoints | 0.5 day | Backend |
| Build conflict detection algorithm (room, instructor, student, course) | 1 day | Backend |
| Implement schedule change notifications | 0.5 day | Backend |
| Build Admin Schedules page with conflict error display | 1 day | Frontend |
| Build Student Schedule page (weekly view) | 0.5 day | Frontend |
| Build Faculty schedule view in dashboard | 0.5 day | Frontend |

**Deliverables:** Schedule management module with intelligent conflict detection, student and faculty schedule views.

---

## Phase 5 — Sprint 4: Attendance, Announcements, and Notifications
**April 25 – April 27, 2026 (2 days)**

| Task | Duration | Owner |
|---|---|---|
| Implement Attendance model and bulk mark endpoint | 0.5 day | Backend |
| Build attendance summary and course attendance endpoints | 0.5 day | Backend |
| Implement Announcement model, CRUD, and role filtering | 0.5 day | Backend |
| Implement Notification model, utility, and endpoints | 0.5 day | Backend |
| Build Admin and Faculty Attendance pages | 1 day | Frontend |
| Build Student Attendance page | 0.5 day | Frontend |
| Build Announcements page (shared) | 0.5 day | Frontend |
| Build Notification Bell component and dropdown | 0.5 day | Frontend |

**Deliverables:** Attendance tracking module, announcement system, in-app notification system.

---

## Phase 6 — Sprint 5: Dashboards, Study Load, and UI Polish
**April 27 – April 28, 2026 (1 day)**

| Task | Duration | Owner |
|---|---|---|
| Build Admin Dashboard with stats and recent data | 0.5 day | Frontend |
| Build Faculty Dashboard | 0.5 day | Frontend |
| Build Student Dashboard with today's classes | 0.5 day | Frontend |
| Build Print Study Load page with PDF export | 0.5 day | Frontend |
| Apply Tailwind styling, animations, responsive layout | 0.5 day | Frontend |
| Seed database with sample data | 0.5 day | Backend |
| Final integration testing | 0.5 day | QA |

**Deliverables:** All dashboards complete, study load PDF export, polished UI, seeded database.

---

## Phase 7 — Deployment
**April 28, 2026 (1 day)**

| Task | Duration | Owner |
|---|---|---|
| Configure production environment variables | 0.5 day | Lead Developer |
| Build frontend for production (`npm run build`) | 0.5 day | Frontend |
| Deploy backend to cloud server | 0.5 day | Lead Developer |
| Deploy frontend (static build or hosting platform) | 0.5 day | Lead Developer |
| Smoke test all features on live environment | 0.5 day | QA |
| Confirm all API endpoints are reachable | 0.5 day | QA |

**Deliverables:** Live, publicly accessible system. All features verified on production environment.

---

## Phase 8 — Post-Deployment: Testing, Monitoring, and Documentation
**April 29 – May 15, 2026 (17 days)**

| Task | Duration | Owner |
|---|---|---|
| User acceptance testing (UAT) with real users | 3 days | QA + Product Owner |
| Bug tracking and hotfix resolution | 5 days | Full Team |
| Performance monitoring and server health checks | Ongoing | Lead Developer |
| Write technical documentation | 3 days | Lead Developer |
| Write user manual and training guide | 2 days | Product Owner |
| Prepare final project report and presentation | 3 days | Full Team |
| Project closure and handover | 1 day | Product Owner |

**Deliverables:** UAT sign-off, resolved bug list, technical documentation, user manual, final project report.

---

## Milestone Summary

| Milestone | Target Date |
|---|---|
| Project kickoff and environment setup | April 18, 2026 |
| Authentication and user management complete | April 21, 2026 |
| Course and enrollment module complete | April 23, 2026 |
| Schedule management with conflict detection complete | April 25, 2026 |
| Attendance, announcements, and notifications complete | April 27, 2026 |
| All dashboards and UI polish complete | April 28, 2026 |
| **System deployed to production** | **April 28, 2026** |
| User acceptance testing complete | May 5, 2026 |
| All bugs resolved | May 10, 2026 |
| Documentation and final report complete | May 13, 2026 |
| **Project officially closed** | **May 15, 2026** |

---

## Gantt Chart

| Phase | Apr 18 | Apr 19–21 | Apr 21–23 | Apr 23–25 | Apr 25–27 | Apr 27–28 | Apr 28 | Apr 29–May 15 |
|---|---|---|---|---|---|---|---|---|
| Phase 1: Initiation & Planning | ██ | | | | | | | |
| Sprint 1: Auth & Backend | | ██████ | | | | | | |
| Sprint 2: Courses & Enrollment | | | ██████ | | | | | |
| Sprint 3: Scheduling | | | | ██████ | | | | |
| Sprint 4: Attendance & Notifs | | | | | ██████ | | | |
| Sprint 5: Dashboards & Polish | | | | | | ██████ | | |
| Deployment | | | | | | | ██ | |
| Post-Deployment & Docs | | | | | | | | ██████████ |

---

# 3. Risk Assessment

## Risk Matrix

| ID | Risk | Category | Likelihood | Impact | Severity | Mitigation Strategy |
|---|---|---|---|---|---|---|
| R01 | MongoDB connection failure in production | Technical | Low | High | High | Use MongoDB Atlas; configure connection retries and validate env variables on startup |
| R02 | JWT secret key exposure | Security | Low | Critical | Critical | Store JWT secret in `.env` only; never commit to version control; enforce `.gitignore` |
| R03 | Schedule conflict detection edge cases | Technical | Medium | Medium | Medium | Thoroughly test overlapping time scenarios; unit test the `timesOverlap()` function |
| R04 | Compressed timeline leading to incomplete features | Schedule | Medium | High | High | Prioritize MVP features; defer non-critical features to post-deployment phase |
| R05 | Frontend-backend CORS misconfiguration in production | Technical | Medium | High | High | Set `FRONTEND_URL` env variable correctly; test CORS headers before go-live |
| R06 | Data loss due to missing database backups | Operational | Low | Critical | Critical | Enable automated backups on MongoDB Atlas; document manual backup procedure |
| R07 | Unauthorized access due to role bypass | Security | Low | Critical | Critical | Enforce `authorize()` middleware on all sensitive routes; test each role's access boundaries |
| R08 | PDF generation failure on certain browsers | Technical | Medium | Low | Low | Test jsPDF output on Chrome, Firefox, Edge, and Safari; provide fallback browser print |
| R09 | Attendance duplicate records | Data Integrity | Low | Medium | Medium | Unique compound index on (student, course, date) enforced at database level |
| R10 | Team member unavailability during sprint | Resource | Medium | High | High | Cross-train team members on frontend and backend; document all code clearly |
| R11 | Scope creep from stakeholder requests | Project | Medium | Medium | Medium | Freeze scope after Sprint 1 planning; log new requests as post-deployment backlog items |
| R12 | Notification system failure blocking core operations | Technical | Low | Low | Low | Notifications wrapped in non-critical try-catch; failures logged but do not interrupt primary operations |
| R13 | Slow API response times under load | Performance | Low | Medium | Low | Use MongoDB indexes on frequently queried fields; implement pagination in future releases |
| R14 | User confusion due to role-based UI differences | UX | Medium | Low | Low | Provide role-specific onboarding; include a user manual for each role |
| R15 | Deployment environment differences from development | Technical | Medium | Medium | Medium | Use environment variables for all configuration; test production build locally before deploying |

## Risk Severity Legend

| Severity | Description |
|---|---|
| Critical | Could cause project failure or serious data breach |
| High | Significant impact on timeline, security, or functionality |
| Medium | Moderate impact; manageable with mitigation |
| Low | Minor impact; acceptable risk |

## Top Risks and Contingency Plans

### R04 — Compressed Timeline
Given the 10-day development window (April 18–28), the primary contingency is strict backlog prioritization. If time runs short, features such as the notification bell dropdown, PDF export, and study load printing are deprioritized in favor of core CRUD operations and authentication. These can be completed during the post-deployment phase.

### R02 / R07 — Security Risks
All sensitive routes are protected by both the `protect` middleware (JWT validation) and the `authorize` middleware (role check). The `.env` file is listed in `.gitignore` and must never be committed. A pre-deployment security checklist is recommended before go-live.

### R01 / R06 — Database Risks
MongoDB Atlas is recommended for production deployment as it provides automated backups, connection pooling, and uptime monitoring out of the box. The application already validates the MongoDB connection on startup and exits with a clear error message if the connection fails, preventing silent failures.

---

# 4. Costing and Budget Plan

## Budget Overview

The following budget plan is structured for a small development team of 4–5 members building and deploying the Trophe system within the April 18 – May 15, 2026 timeframe. Costs are presented in **Philippine Peso (PHP)** as the primary currency.

---

## 4.1 Human Resource Costs

| Role | Daily Rate (PHP) | Days Engaged | Total Cost (PHP) |
|---|---|---|---|
| Lead Developer / Scrum Master | ₱2,500 | 27 | ₱67,500 |
| Backend Developer | ₱2,000 | 20 | ₱40,000 |
| Frontend Developer | ₱2,000 | 20 | ₱40,000 |
| QA / Tester | ₱1,500 | 15 | ₱22,500 |
| Product Owner / Project Manager | ₱2,000 | 27 | ₱54,000 |
| **Subtotal — Human Resources** | | | **₱224,000** |

> **Note:** For academic or capstone projects, human resource costs may be waived or replaced with volunteer/stipend arrangements. The figures above reflect fair market rates for freelance developers in the Philippines.

---

## 4.2 Infrastructure and Hosting Costs

| Item | Provider | Plan | Monthly Cost (PHP) | Duration | Total (PHP) |
|---|---|---|---|---|---|
| Cloud Database | MongoDB Atlas | M0 Free Tier (dev) / M10 Shared (prod) | ₱0 – ₱1,400 | 1 month | ₱0 – ₱1,400 |
| Backend Hosting | Render / Railway | Free Tier or Starter | ₱0 – ₱1,000 | 1 month | ₱0 – ₱1,000 |
| Frontend Hosting | Vercel / Netlify | Free Tier | ₱0 | 1 month | ₱0 |
| Custom Domain (optional) | Namecheap / GoDaddy | .com domain | ₱700 | 1 year | ₱700 |
| SSL Certificate | Let's Encrypt | Free | ₱0 | — | ₱0 |
| **Subtotal — Infrastructure** | | | | | **₱700 – ₱3,100** |

---

## 4.3 Software and Tools Costs

| Tool | Purpose | Cost |
|---|---|---|
| Node.js | Backend runtime | Free (Open Source) |
| React + Vite | Frontend framework | Free (Open Source) |
| MongoDB | Database | Free (Open Source) |
| Tailwind CSS | UI styling | Free (Open Source) |
| VS Code | Code editor | Free |
| Postman | API testing | Free (Basic Plan) |
| GitHub | Version control and collaboration | Free |
| Figma | UI/UX wireframing (optional) | Free (Starter Plan) |
| Notion / Trello | Sprint and task management | Free (Basic Plan) |
| **Subtotal — Software and Tools** | | **₱0** |

---

## 4.4 Miscellaneous Costs

| Item | Estimated Cost (PHP) |
|---|---|
| Internet connectivity (team, 1 month) | ₱3,000 |
| Printing (documentation, user manuals) | ₱500 |
| Contingency buffer (10% of total) | ₱22,810 |
| **Subtotal — Miscellaneous** | **₱26,310** |

---

## 4.5 Total Project Budget Summary

| Category | Estimated Cost (PHP) |
|---|---|
| Human Resources | ₱224,000 |
| Infrastructure and Hosting | ₱1,900 *(midpoint estimate)* |
| Software and Tools | ₱0 |
| Miscellaneous | ₱26,310 |
| **TOTAL PROJECT BUDGET** | **₱252,210** |

> Approximate USD equivalent at ₱56/USD: **~$4,504 USD**

---

## 4.6 Cost Optimization Notes

- **Open-source stack** — The entire technology stack (React, Node.js, MongoDB, Tailwind CSS) is free and open-source, eliminating licensing costs entirely.
- **Free hosting tiers** — For demonstration and academic purposes, the system can be fully deployed at zero infrastructure cost using MongoDB Atlas M0, Render free tier (backend), and Vercel free tier (frontend).
- **Scalability path** — If the system is adopted for production use beyond the academic context, upgrading to paid hosting tiers (MongoDB Atlas M10 at ~₱1,400/month, Render Starter at ~₱1,000/month) provides significantly improved performance and uptime guarantees.
- **Capstone/Academic context** — If this project is submitted as an academic capstone, the human resource line items represent opportunity cost rather than actual expenditure. The realistic out-of-pocket cost is limited to infrastructure and miscellaneous items, totaling approximately **₱4,400 – ₱6,100 PHP**.

---

*Document prepared for the Trophe Smart Campus Management System project. All timelines, costs, and risk assessments are based on the actual system architecture and codebase as developed.*
