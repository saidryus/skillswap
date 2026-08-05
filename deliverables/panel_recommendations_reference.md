# Panel Recommendations — Quick Reference

> Each entry shows the full paragraph or bullet as it appears in the document, with its location.
> Use Ctrl+F on the section name to jump there fast during the meeting.

---

## PANEL 1

---

### ✅ Recommendation letters instead of grade slips

**Ch.1 — Rationale of the Study (para. 4)**

> This study proposes developing Acadia, a web-based peer-to-peer academic tutoring platform that integrates Machine Learning-powered understanding of recommendation letters, competency-based matching, and automated, constraint-based scheduling. Acadia aims to address three key challenges: extracting structured information from faculty recommendation letters via AI-assisted analysis to support tutor qualification reviews, helping students connect with the most competent tutors through subject-specific rankings, and simplifying the process of scheduling study sessions through availability-based conflict detection. The system is designed with an architecture that supports deployment across different colleges and university departments.

---

**Ch.1 — Objectives (bullet 2)**

> Implement a Machine Learning-powered recommendation letter understanding system that uses trained classification models to extract recommended tutoring subjects, assess recommendation strength, and identify soft skills from faculty endorsement documents.

---

**Ch.1 — Scope > Administrative Functions (bullet 4)**

> Tutor application review with ML-assisted recommendation letter understanding, confidence scoring, and subject alignment assessment

---

**Ch.1 — Scope > Student Functions (bullet 2)**

> Tutor application submission with faculty recommendation letter upload and ML-powered understanding. Students must have at least one availability slot configured before a tutor application can be submitted.

---

**Ch.1 — Significance > Students (Tutors)**

> The platform provides peer tutors with an organized environment to offer academic assistance, manage their availability, share reusable course-based learning resources, and build a record of completed tutoring sessions and student feedback. The ML-powered feedback analysis provides tutors with structured insights into their teaching strengths and areas for improvement. The faculty recommendation letter process, supported by ML-powered understanding with administrator oversight, establishes credibility for approved tutors.

---

**Ch.1 — Significance > Faculty and Academic Coordinators**

> The system involves faculty members in the tutor verification process through recommendation letters. Faculty members prepare and issue their own recommendation letters for students they endorse as peer tutors. The ML-powered understanding module extracts structured information from these letters to assist administrators in the review process. Information such as frequently requested subjects, tutoring participation, and study session trends may help support academic advising, student support initiatives, and curriculum-related decision-making.

---

**Ch.1 — Definition of Terms — Recommendation Letter Understanding**

> Recommendation Letter Understanding — The ML-powered process of extracting structured information from uploaded faculty recommendation letters, including predicted subjects, recommendation strength, and soft skills. The Machine Learning module performs information extraction; the administrator performs the actual verification and approval.

---

**Ch.3 — Electronic Document Integrity**

> Consistent with Republic Act No. 8792 (Electronic Commerce Act of 2000), electronically uploaded documents such as faculty recommendation letters are treated as valid digital records. Original uploaded files are stored encrypted at rest and are deleted from the server either upon administrative decision or automatically after a configurable retention period (default: 30 days) via a document expiry scheduler. OCR-extracted text is analyzed through a three-tier pipeline: the recommendation letter ML service (TF-IDF + Linear SVM + Logistic Regression) is tried first; if unavailable, the system falls back to an LLM (OpenAI GPT-4o-mini) if configured; if neither is available, rule-based keyword matching is used. This graceful fallback architecture ensures the platform remains functional regardless of ML service availability. Administrative verification is always required before any approval decision is made.

---

### ✅ Happy path booking

**Ch.1 — Rationale of the Study (para. 4)**

> Acadia aims to address three key challenges: extracting structured information from faculty recommendation letters via AI-assisted analysis to support tutor qualification reviews, helping students connect with the most competent tutors through subject-specific rankings, and simplifying the process of scheduling study sessions through availability-based conflict detection.

---

**Ch.1 — Scope > Student Functions (bullet 6)**

> Study session booking through calendar-based date selection with availability-based slot generation and holiday awareness

---

**Ch.1 — Significance > Students (Tutees)**

> The system allows students to connect with verified peer tutors for specific subjects through a structured, AI-enhanced discovery process. The platform streamlines scheduling through automated availability matching, provides AI-generated teaching insights into tutors' strengths to inform selection decisions, and supports both on-campus and online sessions through integrated video conferencing and messaging.

---

**Ch.3 — Testing Phase (para. 2)**

> Tasks include logging in, browsing curriculum-eligible subjects, finding tutors ranked by competency score (weighted: student ratings 45%, faculty recommendation score 15%, session completion rate 20%, tutoring experience 20%), booking sessions through calendar-based conflict-free slot selection, submitting post-session ratings and written feedback, browsing course learning materials, and viewing personal tutoring analytics (tutee role)…

---

### ✅ Dedicated resources section

**Ch.1 — Objectives (bullet 8)**

> Provide a course-based learning resources module that allows verified tutors to share reusable supplementary materials with students.

---

**Ch.1 — Scope > Student Functions (bullet 10)**

> Course-based learning resources browsing and downloading

---

**Ch.1 — Significance > Students (Tutors)**

> The platform provides peer tutors with an organized environment to offer academic assistance, manage their availability, share reusable course-based learning resources, and build a record of completed tutoring sessions and student feedback.

---

**Ch.3 — Testing Phase (para. 2)**

> Tasks include… browsing course learning materials (tutee role); uploading a faculty recommendation letter for tutor application, reviewing and responding to session requests, managing weekly availability, uploading course materials, joining video conferencing sessions via Jitsi Meet and sharing external recording links through the in-session chat (tutor role)…

---

## PANEL 2

---

### ✅ ML instead of rule-based

**Ch.1 — Objectives (bullet 2)**

> Implement a Machine Learning-powered recommendation letter understanding system that uses trained classification models to extract recommended tutoring subjects, assess recommendation strength, and identify soft skills from faculty endorsement documents.

---

**Ch.1 — Objectives (bullet 3)**

> Develop a tutor feedback understanding module using Machine Learning to analyze student written reviews and generate structured insights into tutors' teaching strengths, areas for improvement, and covered topics.

---

**Ch.1 — Scope > Machine Learning Features (bullets 1–2)**

> A trained multi-task classification model (Linear SVM + Logistic Regression) for recommendation letter understanding that predicts:
> - Recommended tutoring subjects (multi-label classification)
> - Recommendation strength (Strong/Moderate/Weak/None)
> - Soft skills extracted from the recommendation letter (multi-label classification)
>
> A trained tutor feedback analysis model that extracts:
> - Review sentiment (Positive/Neutral/Negative)
> - Teaching strengths
> - Areas for improvement
> - Topics covered

---

**Ch.1 — Scope > Machine Learning Features (bullet 3 — fallback)**

> Designed with a graceful fallback architecture to maintain functionality even if certain services become unavailable. The recommendation letter analysis service and the feedback analysis service operate as separate Python processes. If either service fails or becomes unavailable, the system automatically falls back to an alternative method. Recommendation letter analysis relies on an LLM or rule-based pattern matching, while feedback insights are temporarily unavailable, rather than disrupting the rest of the platform.

---

**Ch.1 — Scope > Machine Learning Features (bullet 4)**

> Machine learning is used only to extract and organize information from documents. It does not make approval decisions or enforce system rules. All tutor applications are reviewed and verified by an administrator, who retains full authority over the final approval decision.

---

**Ch.1 — Definition of Terms — TF-IDF Vectorization**

> TF-IDF Vectorization — A text preprocessing technique (Term Frequency-Inverse Document Frequency) that converts text documents into numerical feature vectors based on word importance, used as input to the classification models.

---

**Ch.1 — Theoretical Background — Supervised Machine Learning for Text Classification**

> In Acadia, supervised text classification is used in two areas. First, it analyzes faculty recommendation letters to identify recommended subjects, the strength of recommendations, and relevant soft skills. Second, it examines written tutor reviews to determine sentiment, teaching strengths, and areas for improvement. To accomplish this, the system uses TF-IDF vectorization to represent textual features and a Linear Support Vector Machine (SVM) for multi-label classification, both of which are widely recognized techniques in text classification research (Joachims, 1998).
>
> The machine learning models are used solely to extract and organize information from text. They do not approve tutor applications, modify system rules, or make administrative decisions. Instead, the extracted information serves as decision support for administrators, who remain responsible for reviewing applications and making all final approval decisions.

---

**Ch.3 — Electronic Document Integrity**

> OCR-extracted text is analyzed through a three-tier pipeline: the recommendation letter ML service (TF-IDF + Linear SVM + Logistic Regression) is tried first; if unavailable, the system falls back to an LLM (OpenAI GPT-4o-mini) if configured; if neither is available, rule-based keyword matching is used. This graceful fallback architecture ensures the platform remains functional regardless of ML service availability.

---

### ✅ AI checks fake documents (confidence score scope)

**Ch.1 — Scope > Intelligent Features (bullet 4)**

> Deterministic confidence scoring that evaluates document completeness and consistency using OCR quality, faculty identity fields (name, position, department), signature detection, subject alignment, student name presence, and required sections present

---

**Ch.1 — Definition of Terms — Confidence Score**

> Confidence Score — A deterministic weighted score (0-100) indicating the completeness and consistency of an uploaded recommendation letter. It evaluates OCR quality, faculty identity fields (name, position, department), signature detection, subject alignment, student name presence, and the presence of required sections. **This score does not assess recommendation quality or document authenticity — it measures extractability and completeness, and is intended only as an aid for administrator review.**

---

**Ch.1 — Limitations (bullet 5 — OCR degradation)**

> The accuracy of OCR-based text extraction depends on the quality of uploaded documents. Documents with poor image quality, handwritten entries, or unsupported formats may not be processed accurately. In such cases, the system gracefully degrades to lower confidence scores and flags the application for manual review by an administrator.

---

**Ch.3 — System Security**

> In accordance with Republic Act No. 10175 (Cybercrime Prevention Act of 2012), the Acadia platform implements security measures to protect participant data during the testing phase. These include password hashing (bcrypt), JWT-based authentication, role-based access control, AES-256-CBC file encryption at rest for uploaded documents, server-side input validation, a document access re-authentication gate with progressive lockout (3 failed attempts results in a 3-hour lockout), a document audit log that records every view and deletion action with administrator identity and timestamp, and PII redaction of OCR-extracted text before database storage (phone numbers, email addresses, physical addresses, and government ID numbers are stripped from stored OCR text; the student school ID number is intentionally preserved in the stored text to allow administrator verification).

---

### ✅ AI checks documents aligned with tutor skills (subject alignment)

**Ch.1 — Objectives (bullet 2)**

> Implement a Machine Learning-powered recommendation letter understanding system that uses trained classification models to extract recommended tutoring subjects, assess recommendation strength, and identify soft skills from faculty endorsement documents.

---

**Ch.1 — Scope > Intelligent Features (bullet 3)**

> Deterministic subject alignment that compares tutor-selected subjects against ML-predicted recommended subjects

---

**Ch.1 — Definition of Terms — Subject Alignment**

> Subject Alignment — A deterministic comparison between the subjects a tutor selected for their application and the subjects predicted by the ML model from the faculty recommendation letter, expressed as a percentage.

---

**Ch.1 — Definition of Terms — Faculty Recommendation Score**

> Faculty Recommendation Score — A deterministic score computed from ML-predicted recommendation strength and subject alignment percentage, contributing 15% to the overall tutor competency score. This score is derived from ML outputs but calculated using deterministic weighted arithmetic.

---

### ✅ Multi-university / multi-department architecture

**Ch.1 — Rationale of the Study (para. 4)**

> The system is designed with an architecture that supports deployment across different colleges and university departments.

---

**Ch.1 — Objectives (bullet 1)**

> Design and develop a centralized web-based peer tutoring platform with an architecture that supports deployment across different Philippine college curricula, with initial implementation and evaluation focused on the subjects and courses offered in the pilot department.

---

**Ch.1 — Scope > Administrative Functions (bullet 3)**

> Department management for multi-department deployment

---

**Ch.1 — Limitations (bullet 1)**

> Although the platform architecture supports deployment across different Philippine college departments, this study limits its implementation, testing, and evaluation to the College of Computer Studies (CCS) of the University of Cebu Pardo-Talisay Campus. Deployment across multiple departments or institutions is beyond the scope of the study and has not been validated.

---

**Ch.1 — Significance > The Institution**

> The study demonstrates how Machine Learning, intelligent scheduling, and competency-based tutor matching can be implemented with accessible, cost-effective technologies while maintaining institutional data privacy through on-premise deployment. The privacy-first architecture ensures student data never leaves the institutional network. The resulting system may serve as a model for other departments or institutions seeking to strengthen peer-assisted learning programs.

---

**Ch.3 — Institutional Alignment**

> The study aligns with CHED Memorandum Order No. 9, Series of 2013, which mandates higher education institutions to provide student development and support services, including academic assistance programs. Acadia operationalizes this mandate by providing a structured peer tutoring system, and this study evaluates its effectiveness in supporting institutional student welfare objectives.

---

### ✅ Save recordings (partial — Jitsi limitation)

**Ch.1 — Limitations (bullet 6)**

> Video conferencing is provided through embedded Jitsi Meet (open-source). The platform does not provide built-in recording infrastructure. Users may record sessions using Jitsi's built-in recording to Dropbox, local recording, or external screen recording tools, and share the resulting link through the in-app session chat.

---

## PANEL 3

---

### ✅ Show available slots directly

**Ch.1 — Objectives (bullet 5)**

> Implement a constraint-based scheduling engine that automatically cross-references user-managed availability and generates conflict-free study sessions while respecting institutional holidays.

---

**Ch.1 — Scope > Student Functions (bullet 6)**

> Study session booking through calendar-based date selection with availability-based slot generation and holiday awareness

---

**Ch.1 — Scope > Intelligent Features (bullet 1)**

> A constraint-based scheduling engine that analyzes user availability and existing session commitments to identify mutually available time slots, with Philippine holiday awareness

---

**Ch.1 — Definition of Terms — Interval Scheduling Algorithm**

> Interval Scheduling Algorithm — The scheduling technique used by the constraint engine, which determines busy time blocks derived from confirmed availability and existing bookings, then scans time slots to find conflict-free periods where all participants are simultaneously available.

---

**Ch.1 — Theoretical Background — Constraint Satisfaction Problem (CSP) Theory**

> Constraint Satisfaction Problem (CSP) theory provides the foundation for Acadia's scheduling component. A CSP is a type of computational problem in which a valid solution must satisfy multiple constraints simultaneously. Within the system, study sessions serve as the variables, available time slots serve as the domains, and scheduling restrictions such as user-managed availability, existing tutoring commitments, institutional holidays, and tutor availability limits serve as the constraints.
>
> This framework supports an automated scheduling engine that identifies valid study session schedules by eliminating time slots that violate any constraints. Rather than requiring students to manually coordinate schedules, the system generates only those time slots that satisfy all scheduling requirements. The work of Shimon Even, Alon Itai, and Adi Shamir (1976) established that timetabling problems belong to a class of computationally complex problems, providing theoretical support for algorithmic scheduling approaches.

---

**Ch.3 — Research Environment (bullet 3)**

> Students may optionally upload a class schedule to generate suggested availability; however, the uploaded file is deleted immediately after processing and is never used by the scheduling engine. The scheduler operates exclusively on user-confirmed availability to detect session conflicts.

---

### ✅ Analytics for both roles

**Ch.1 — Objectives (bullet 4)**

> Develop a competency-based matching module that identifies and ranks verified peer tutors based on subject-specific metrics, including student ratings, faculty recommendation scores, session completion rates, and tutoring experience.

---

**Ch.1 — Scope > Administrative Functions (bullet 6)**

> Session monitoring, analytics, and weekly frequency tracking

---

**Ch.1 — Scope > Student Functions (bullet 5)**

> AI-generated insights on tutor teaching strengths are displayed on tutor profiles

---

**Ch.1 — Significance > Students (Tutees)**

> The system allows students to connect with verified peer tutors for specific subjects through a structured, AI-enhanced discovery process. The platform streamlines scheduling through automated availability matching, provides AI-generated teaching insights into tutors' strengths to inform selection decisions, and supports both on-campus and online sessions through integrated video conferencing and messaging.

---

**Ch.1 — Significance > Students (Tutors)**

> The ML-powered feedback analysis provides tutors with structured insights into their teaching strengths and areas for improvement.

---

**Ch.1 — Definition of Terms — Feedback Insights**

> Feedback Insights — ML-generated structured analysis of written tutor reviews, providing aggregated information on teaching strengths, improvement areas, sentiment distribution, and topics covered — displayed to students on tutor profiles to inform selection decisions. Feedback insights never modify ratings, competency scores, or tutor rankings.

---

**Ch.3 — Testing Phase (para. 2)**

> Tasks include… viewing personal tutoring analytics (tutee role); … monitoring session analytics (admin role).

---

### ✅ Video + messaging

**Ch.1 — Objectives (bullet 7)**

> Provide integrated video conferencing and in-app messaging to support both on-campus and online tutoring sessions.

---

**Ch.1 — Scope > Student Functions (bullet 8)**

> Integrated video conferencing (Jitsi Meet) for online sessions, with the ability to share recording links in the session chat after sessions are externally recorded

---

**Ch.1 — Scope > Student Functions (bullet 9)**

> In-app messaging between session participants with automatic conversation locking when a session ends (upon completion, cancellation, or rejection)

---

**Ch.1 — Significance > Students (Tutees)**

> The system allows students to connect with verified peer tutors for specific subjects through a structured, AI-enhanced discovery process. The platform streamlines scheduling through automated availability matching, provides AI-generated teaching insights into tutors' strengths to inform selection decisions, and supports both on-campus and online sessions through integrated video conferencing and messaging.

---

**Ch.3 — Testing Phase (para. 2)**

> Tasks include… joining video conferencing sessions via Jitsi Meet and sharing external recording links through the in-session chat (tutor role)…

---

### ✅ UI/UX

**Ch.3 — Software Engineering Methodology**

> The system is developed using the Agile Software Development methodology. This approach divides development into iterative cycles in which a working prototype is continuously built, tested, and refined. Each iteration produces a functional version of the system that is evaluated by the developers through actual use, allowing issues and usability concerns to be identified early. Improvements and additional features are then incorporated in the next cycle based on observed performance and feedback.
>
> This iterative build–test–refine process continues throughout the development period until the system reaches a level of completeness and stability suitable for evaluation by external users. Agile is appropriate for this study because it supports evolving requirements, enables rapid prototyping, and ensures that the final system is shaped by practical usage rather than purely theoretical design assumptions.

---

**Ch.3 — Data Gathering — Survey Questionnaire**

> Survey Questionnaire (Google Forms): A digital questionnaire consisting of open-ended questions administered to participants via Facebook Messenger after the testing phase. This instrument captures participants' perceptions, experiences, and suggestions regarding the Acadia system.

---
