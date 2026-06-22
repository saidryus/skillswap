# CHAPTER 3: DESIGN AND METHODOLOGY

## Research Design

This study employs a **Qualitative Research Design** to evaluate the usability and effectiveness of the SkillSwap platform from the perspective of its end users. A qualitative approach is adopted as it enables the researchers to obtain rich, contextual descriptions of user experiences that quantitative instruments alone cannot capture (Creswell & Creswell, 2018). Through open-ended feedback and structured observation, the study seeks to understand how users perceive the system's functionality, identify usability barriers encountered during interaction, and elicit suggestions for improvement grounded in actual usage. This design is appropriate given that the study does not seek to test a hypothesis or establish causal relationships, but rather to describe and interpret user experiences with a newly developed technological artifact within a specific educational context.

## Method

SkillSwap utilizes a **Qualitative Research Design** applied to a design-and-development context. The researchers designed, built, and evaluated a fully functional web-based peer tutoring platform using the Agile Software Development methodology with iterative sprints. This approach focuses on understanding user experiences and platform effectiveness through in-depth user feedback, direct observation, and open-ended responses while maintaining methodological rigor and practical feasibility.

Evaluation of the system is conducted qualitatively through:

- **In-Depth User Feedback** — Participants respond to guided open-ended questions after testing to provide detailed feedback on usability, usefulness, and overall experience.
- **Direct Observation** — Researchers observe participants interacting with the system, documenting task completion behavior, hesitation points, and navigation patterns.
- **Open-Ended Written Feedback** — Participants provide written reflections on system strengths, weaknesses, and suggestions for improvement.

All collected data is analyzed using **Braun and Clarke's (2006) six-phase thematic analysis** to identify recurring patterns and themes regarding user experience and system effectiveness.

## Flow of the Study

| Phase | Activities |
|-------|-----------|
| **Phase 1: Preparation and Planning (2–3 weeks)** | • **Literature Review:** Study existing research on peer tutoring, constraint-based scheduling, and educational technology adoption in Philippine HEIs. <br>• **System Development:** Complete the design and development of the SkillSwap platform using the MERN stack with Agile methodology. <br>• **Instrument Development:** Create guided open-ended question sets, observation protocols, and feedback forms. <br>• **Pilot Testing:** Pilot-test instruments with 2–3 non-respondent students to ensure clarity and appropriateness. |
| **Phase 2: Participant Recruitment and Orientation (1–2 weeks)** | • **Participant Selection:** Identify key participants through purposive sampling (tutees, tutors, administrators) from the College of Computer Studies. <br>• **Consent Acquisition:** Obtain informed consent from all participants. <br>• **System Introduction:** Brief participants on the SkillSwap platform, provide login credentials, and explain testing procedures. <br>• **Account Preparation:** Set up test accounts with pre-loaded schedules and course data. |
| **Phase 3: Data Collection (2–3 weeks)** | • **Platform Testing Phase:** Facilitate participant use of SkillSwap across all core workflows (tutor search, session booking, tutor application, admin management). <br>• **Direct Observation:** Observe participants during system interaction, documenting task completion behavior, hesitation points, and navigation patterns. <br>• **User Feedback Collection:** Collect in-depth responses from participants using guided open-ended questions about their experience. <br>• **Written Feedback:** Distribute open-ended feedback forms for participants to provide additional reflections on system strengths and improvement areas. |
| **Phase 4: Analysis and Reporting (2–3 weeks)** | • **Data Organization:** Compile and organize all collected responses, observation notes, and written feedback. <br>• **Theme Identification:** Analyze patterns in participant responses using Braun & Clarke's (2006) six-phase thematic analysis. <br>• **Report Preparation:** Document findings, themes, and recommendations. <br>• **Member Checking:** Share interpreted themes with select participants for validation and accuracy. |

## Research Environment

The study is conducted within the **College of Computer Studies (CCS)** of the University of Cebu South Campus. The CCS was selected because:

- Students in computing programs are technically literate and accustomed to using web-based applications, reducing barriers to adoption.
- The curriculum includes computationally demanding subjects (data structures, database management, web development) where peer tutoring has demonstrated effectiveness.
- The department maintains structured class scheduling data that can be digitized for use in the constraint-based scheduling engine.

The system is deployed to a testing environment accessible to participants during the evaluation phase. The backend is built with Node.js and MongoDB, and the frontend is built with React.js, both accessible to respondents within the institutional context.

## Respondents

The study employs **purposive sampling** to select 10 participants (n=10) who represent the system's target users. Participants are selected from the College of Computer Studies and include:

- Students who have experienced the need for peer academic assistance (potential tutees)
- Students who have achieved strong grades in IT subjects and are willing to tutor (potential tutors)
- Faculty members or department staff responsible for academic coordination (administrators)

**Inclusion Criteria:**
- Currently enrolled in or employed by the College of Computer Studies
- Active student/staff status
- Willing to participate in system testing and provide feedback

**Exclusion Criteria:**
- Students on leave of absence
- Students who have not completed at least one full semester (no schedule data available)

## Research Instrument

The primary evaluation instrument is a **researcher-developed survey questionnaire** administered digitally through Google Forms. The questionnaire will consist of open-ended questions designed to elicit descriptive feedback on user experiences with the SkillSwap platform.

The specific survey questions will be developed after the design hearing and validated through expert review by the research adviser prior to distribution.

**Distribution Method:** The Google Forms survey link will be shared digitally to participants via Facebook Messenger after the testing phase.

### Observation Protocol

In addition to the survey questionnaire, the researchers will use a structured observation protocol during testing sessions to document:
- Task completion behavior (successful, with difficulty, failed)
- Points of hesitation, confusion, or error
- Verbal comments or reactions during interaction
- Navigation patterns and feature discovery behavior

All instruments will be validated through expert review by the research adviser prior to data collection.

## Research Procedure

1. **Preparation Phase (Week 1–2):**
   - Finalize system development and deploy to testing environment.
   - Prepare test accounts (admin, tutor, and tutee roles) with pre-loaded schedules.
   - Develop survey questionnaire and observation protocol.
   - Validate instruments through expert review by the research adviser.

2. **Orientation Phase (Week 3):**
   - Brief respondents on the study purpose, system overview, and testing procedure.
   - Obtain informed consent from all participants.
   - Distribute login credentials and role assignments.

3. **Testing Phase (Week 3–4):**
   - Respondents complete assigned tasks independently using the system.
   - Tasks include: logging in, viewing schedule, finding a tutor, booking a session, rating a tutor (tutee role); accepting a session, managing availability (tutor role); managing users, reviewing applications (admin role).
   - Researchers observe each participant using the observation protocol, documenting behavior, hesitation points, and verbal reactions.

4. **Data Collection Phase (Week 4):**
   - After testing, the Google Forms survey questionnaire link is shared to participants via Facebook Messenger.
   - Participants respond to open-ended questions about their experience at their own convenience.

5. **Analysis Phase (Week 5):**
   - Compile and organize all survey responses and observation notes.
   - Conduct thematic analysis following Braun & Clarke's (2006) six-phase framework.
   - Document findings, themes, and recommendations.

## Data Gathering

Data is gathered through two qualitative methods:

1. **Survey Questionnaire (Google Forms)** — A digital questionnaire with open-ended questions distributed to participants via Facebook Messenger after the testing phase. Captures participants' perceptions, experiences, and suggestions regarding the system.
2. **Direct Observation** — Researchers observe participants during system interaction using a structured observation protocol. Captures behavioral data including hesitation, confusion, navigation patterns, and task completion behavior.

## Treatment of Data

All qualitative data is analyzed using **Braun and Clarke's (2006) Six-Phase Thematic Analysis**:

| Phase | Activity |
|-------|----------|
| Phase 1: Familiarization | Read and re-read all responses, observation notes, and feedback forms. Note initial impressions. |
| Phase 2: Generating Initial Codes | Systematically code interesting features across the entire dataset. |
| Phase 3: Searching for Themes | Collate codes into potential themes. Gather all data relevant to each theme. |
| Phase 4: Reviewing Themes | Check themes against coded extracts and the full dataset. Refine or split themes as needed. |
| Phase 5: Defining and Naming Themes | Define what each theme captures. Assign clear, concise names. |
| Phase 6: Producing the Report | Select compelling extracts. Relate analysis to research questions and literature. |

**Trustworthiness Criteria (Lincoln & Guba, 1985):**

| Criterion | Strategy |
|-----------|----------|
| **Credibility** | Triangulation (survey responses + observation); member checking (participants verify accuracy of interpreted themes) |
| **Transferability** | Thick description of the research context, participants, and findings to allow readers to assess applicability |
| **Dependability** | Audit trail documenting all research decisions, coding iterations, and theme development |
| **Confirmability** | Reflexive journaling by the researchers; peer debriefing with research adviser |

## Ethical Considerations

The conduct of this study adheres to established ethical standards in research involving human participants, guided by Philippine laws governing data privacy and student welfare, as well as general principles of research ethics.

**Informed Consent and Voluntary Participation.** All participants are briefed on the study's purpose, procedures, and data collection methods prior to their involvement. Written informed consent is obtained from each participant before testing begins. Participation is entirely voluntary, and respondents are informed of their right to withdraw at any time without consequence. No academic incentive or penalty is associated with participation or non-participation. Participants are free to skip any survey question they are uncomfortable answering.

**Data Privacy and Confidentiality.** In compliance with Republic Act No. 10173 (Data Privacy Act of 2012), all personal information collected during the study — including survey responses, observation notes, and system interaction data — is treated as strictly confidential. Participants are assigned pseudonyms (e.g., Participant 1, Participant 2) in all documentation and reports to protect their identity. Only the researchers and the research adviser have access to the raw data. Collected data is stored securely, used exclusively for research purposes, and will not be shared with any external party. The system itself implements data minimization principles, collecting only information necessary for its functionality.

**System Security.** Consistent with Republic Act No. 10175 (Cybercrime Prevention Act of 2012), the SkillSwap platform incorporates security measures to protect participant data during the testing phase. These include password hashing, JWT-based authentication, role-based access control, and server-side input validation, ensuring that unauthorized access to test accounts and participant data is prevented.

**Electronic Document Integrity.** In accordance with Republic Act No. 8792 (Electronic Commerce Act of 2000), which grants electronic documents the same legal standing as paper-based records, the system preserves the integrity of digitally uploaded grade slips used in the tutor verification process. Original uploaded documents are stored securely and processed through OCR with administrative review as an additional validation layer to ensure authenticity and accuracy.

**Institutional Alignment.** The study aligns with CHED Memorandum Order No. 9, Series of 2013, which mandates higher education institutions to provide student development and support services including academic assistance programs. SkillSwap operationalizes this directive by providing a structured peer tutoring system, and the evaluation of its effectiveness through this study contributes to the institution's compliance with student welfare objectives.

**No Harm and Beneficence.** The study does not involve deception, sensitive psychological procedures, or any activity that exposes participants to physical or emotional risk. System test accounts use pseudonymized data, and no real student grades or personal academic records are used during the testing phase. The research is designed to benefit the academic community by contributing a functional tool for peer learning support. The rating system is designed as a constructive feedback mechanism rather than a punitive one. Ratings are not publicly displayed to other students, and tutors who receive unfavorable feedback are not automatically penalized by the system. Administrative oversight ensures that any concerns arising from ratings are handled through appropriate institutional support channels.

**Respect for Persons.** Participants are treated as autonomous individuals capable of making informed decisions about their involvement. Their feedback — whether positive or critical — is valued equally and reported without alteration. No participant is pressured to provide favorable responses about the system.

**Honesty and Integrity.** The researchers commit to reporting findings accurately and transparently, including any negative feedback or system limitations identified during the evaluation. Data is not fabricated, falsified, or selectively reported to present a misleading picture of system effectiveness.

**Right to Access and Rectification.** In accordance with the Data Privacy Act, participants are informed that they have the right to access their personal data held by the researchers, request corrections, and request deletion of their data after the study's conclusion.

---

## Software Engineering Methodology

The system is developed using the **Agile Software Development Methodology**. In this approach, the development process is divided into iterative cycles where a usable prototype is built, tested by the developers themselves, and then improved based on observed issues and quality-of-life enhancements identified during use. Each iteration produces a working version of the system with incremental feature additions and refinements, allowing the developers to continuously evaluate the product from a user's perspective before proceeding to the next set of features. This cycle of building, using, and improving repeats throughout the development period until the system reaches a level of completeness and stability suitable for external evaluation with actual users. Agile is appropriate for this study because it accommodates evolving requirements, supports rapid prototyping, and ensures that the final product reflects real usage feedback rather than purely theoretical design decisions.

The development process is organized into the following phases:

---

## Planning / Conception-Initiation Phase

### Business Model Canvas

| Component | Description |
|-----------|-------------|
| **Customer Segments** | College students needing peer academic assistance (tutees), Students with strong academic performance (potential tutors), University administrators and academic coordinators |
| **Value Propositions** | Automated conflict-free scheduling via constraint engine; Verified competency-based tutor matching; Reduced coordination overhead for peer tutoring; Structured peer learning platform; OCR-assisted grade verification |
| **Channels** | Web application (browser-based); University intranet/network; Department and institutional announcements |
| **Customer Relationships** | Self-service platform with admin oversight; Automated notifications; Rating-based quality assurance; Admin-managed onboarding |
| **Revenue Streams** | Institutional subscription (annual SaaS license per HEI); One-time implementation and setup fee per institution; Technical support and maintenance contracts |
| **Key Resources** | MERN stack development expertise; MongoDB database; Institutional class schedule data; Server infrastructure; OCR technology (Tesseract.js) |
| **Key Activities** | System development and maintenance; Tutor application verification and approval; Student schedule encoding; Platform monitoring and bug fixes |
| **Key Partners** | Philippine colleges and universities; Registrar offices (schedule and grade data); University IT/infrastructure teams; Academic departments |
| **Cost Structure** | Development time (labor); Server hosting; Domain registration (optional); Maintenance and support overhead |

### Program Workflow

**Overall System Workflow:**

1. Administrator creates student accounts and inputs class schedules.
2. Students log in and change their default password.
3. Student applies to become a tutor by selecting a course and uploading a grade slip.
4. System performs OCR on the grade slip, extracts grade, and flags the application for admin review.
5. Administrator reviews the application and approves/rejects the tutor profile.
6. Tutee searches for tutors by course → system returns ranked list based on competency score.
7. Tutee selects a tutor and initiates a session booking → constraint engine cross-references both schedules and returns available mutual time slots.
8. Tutee selects a time slot, adds venue details, and submits the session request.
9. Tutor receives notification and accepts/rejects the session.
10. Session occurs at the scheduled time and place.
11. Tutee rates the tutor post-session → rating feeds back into competency score.
12. Cycle repeats.

### Business Roadmap

| Phase | Timeline | Deliverables |
|-------|----------|-------------|
| Phase 1: Foundation | Weeks 1–3 | Requirements document, database design, UI wireframes, authentication module |
| Phase 2: Core Features | Weeks 4–7 | User management, course management, schedule input, tutor application with OCR |
| Phase 3: Intelligent Engine | Weeks 8–10 | Constraint-based scheduling engine, competency scoring algorithm, session lifecycle |
| Phase 4: Polish & Integration | Weeks 11–12 | Notifications, announcements, analytics dashboard, UI refinement |
| Phase 5: Testing & Evaluation | Weeks 13–15 | System testing, alpha deployment, qualitative evaluation, documentation |
| Phase 6: Finalization | Week 16 | Final revisions, deployment documentation, study write-up |

### Functional Decomposition Diagram

*(See: diagrams/functional_decomposition.html)*

**SkillSwap System**
- **Authentication Module**
  - Login (Student ID + Password)
  - Forced Password Change
  - JWT Token Management
- **User Management Module (Admin)**
  - Create Student Account
  - Edit Student Account
  - Bulk Import via CSV
  - Activate/Deactivate Accounts
- **Course Management Module (Admin)**
  - Add/Edit/Delete Courses
  - Assign Year Level
  - Toggle Active Status
- **Schedule Management Module**
  - Input Weekly Schedule (Admin)
  - View Personal Schedule (Student)
  - Schedule Conflict Detection
- **Tutor Application Module**
  - Submit Application with Grade Document
  - OCR Grade Extraction (Tesseract.js)
  - Admin Review and Approval
  - Grade Confidence Flagging
- **Tutor Matching Module**
  - Competency Score Computation
  - Multi-factor Ranking (Ratings 35%, Grade 25%, Completion Rate 20%, Sessions 20%)
  - Course-based Tutor Search
- **Session Scheduling Module**
  - Constraint-Based Free Slot Detection
  - Visual Timetable Comparison
  - Session Request Submission
  - Tutor Accept/Reject
  - Session Lifecycle (Pending → Scheduled → Completed/Cancelled)
- **Rating Module**
  - Post-Session Star Rating (1–5)
  - Comment Submission
  - One Rating per Session per Tutee
- **Notification Module**
  - Real-time In-app Notifications
  - Event-driven Triggers (application status, session updates)
  - Read/Unread Management
- **Announcement Module**
  - Admin Create/Edit Announcements
  - Role-based Targeting
  - Pin/Unpin Announcements

### Gantt Chart

*(See: diagrams/gantt_chart.html)*

---

## Analysis-Design Phase

### Use Case Diagrams

*(See: diagrams/use_case_diagrams.html)*

**Actors:**
- **Student (Tutee)** — Searches for tutors, books sessions, rates tutors, views schedule
- **Student (Tutor)** — Applies as tutor, accepts/rejects sessions, manages availability
- **Administrator** — Manages users, courses, schedules, reviews applications, posts announcements

**Primary Use Cases:**

| Use Case ID | Use Case Name | Actor(s) |
|-------------|---------------|----------|
| UC-01 | Login | Student, Admin |
| UC-02 | Change Password | Student, Admin |
| UC-03 | Manage Students | Admin |
| UC-04 | Manage Courses | Admin |
| UC-05 | Input Student Schedule | Admin |
| UC-06 | Apply as Tutor | Student (Tutor) |
| UC-07 | Review Tutor Application | Admin |
| UC-08 | Find Tutor | Student (Tutee) |
| UC-09 | Book Session | Student (Tutee) |
| UC-10 | Accept/Reject Session | Student (Tutor) |
| UC-11 | Complete Session | Student (Tutor) |
| UC-12 | Rate Tutor | Student (Tutee) |
| UC-13 | View My Sessions | Student |
| UC-14 | View My Schedule | Student |
| UC-15 | Manage Announcements | Admin |
| UC-16 | View Announcements | Student, Admin |
| UC-17 | View Notifications | Student, Admin |
| UC-18 | Monitor Sessions | Admin |

### Activity Diagram — Session Booking Workflow

*(See: diagrams/activity_diagram.html)*

### Sequence Diagram — Constraint-Based Scheduling

*(See: diagrams/sequence_diagram.html)*

### UI/UX Design

The user interface is designed following these principles:

- **Role-based Navigation:** Separate sidebar menus for Admin and Student roles with contextual navigation items.
- **Responsive Design:** Built with Tailwind CSS utility classes for mobile-first responsive layouts.
- **Dark Mode Support:** Full light/dark theme toggle with system preference detection.
- **Visual Feedback:** Toast notifications (react-hot-toast), loading spinners, and animated transitions (Framer Motion, GSAP).
- **Accessibility:** Semantic HTML, ARIA labels, keyboard navigation support, sufficient color contrast ratios.

**Key UI Screens:**
1. Login Page — Student ID and password authentication
2. Admin Dashboard — Overview statistics (total students, active tutors, sessions this week)
3. Student Dashboard — Personal session summary, upcoming sessions, quick actions
4. Find Tutor — Course filter, ranked tutor cards with competency scores
5. Book Session — Tutor selection → visual timetable comparison → slot picker → confirmation
6. My Sessions — Tabbed view (Pending, Scheduled, Completed, Cancelled)
7. Become Tutor — Course selection, grade document upload, application status tracker
8. Tutor Applications (Admin) — Queue with OCR results, grade confidence indicators, approve/reject actions

### Database Design

**Technology:** MongoDB (NoSQL document database) via Mongoose ODM

The database uses a document-oriented design with the following collections:

| Collection | Purpose | Key Relationships |
|------------|---------|-------------------|
| Users | Student and admin accounts | Referenced by Sessions, TutorProfiles, Ratings, Notifications |
| Courses | CCS department subjects | Referenced by TutorProfiles, Sessions |
| TutorProfiles | Tutor applications and approved profiles | References User (tutor), Course |
| StudentSchedules | Weekly class timetable entries | References User (student) |
| Sessions | Study session records | References User (tutor), Users (tutees), Course |
| Ratings | Post-session tutor ratings | References Session, User (tutor), User (ratedBy), Course |
| Notifications | In-app notification messages | References User (recipient) |
| Announcements | System-wide announcements | References User (author) |
| Settings | Global system configuration | Standalone |

### Entity-Relationship Diagram

*(See: diagrams/er_diagram.html)*

**Key Relationships:**
- User (1) → (M) TutorProfile — A student can apply to tutor multiple courses
- User (1) → (M) StudentSchedule — A student has multiple schedule entries (time blocks per day)
- User (1) → (M) Session (as tutor) — A tutor can have many sessions
- User (M) → (M) Session (as tutees) — Multiple tutees can join a session
- Session (1) → (M) Rating — Each session can receive ratings from each tutee
- Course (1) → (M) TutorProfile — A course can have many approved tutors
- Course (1) → (M) Session — Sessions are tied to a specific course
- User (1) → (M) Notification — A user receives many notifications
- User (1) → (M) Announcement (as author) — Admins author announcements
