University of Cebu Pardo-Talisay Campus Department of Computer Studies

**Acadia**: An AI-Assisted Peer Tutoring Platform for Philippine Higher Education

## **TEAM ODYSSEY**

**Team Members:**

Niño Angelo C. Bacalso Seth Wilson B. Canencia Dwight James O. Dupit Kishelle Aibhe F. Garay Simone Dominique Makinano

## **CHAPTER 1: INTRODUCTION**

## **Rationale of the Study**

Collaborative learning and peer-to-peer tutoring have long been recognized as effective approaches to learning in higher education. In Philippine colleges, students in computing and IT programs often encounter challenging subjects such as database management, data structures, and web development, where additional academic support can significantly improve student performance. Studies have consistently shown that peer tutoring benefits both participants. The student receiving assistance gains support from someone who has recently completed the same subject, while the tutor strengthens their own understanding through the process of teaching (Topping, 1996).

Despite these benefits, peer tutoring in many Philippine colleges remains largely informal and unstructured. Students who need help often rely on social media group chats, personal messages, or word-of-mouth recommendations to find someone who can assist them. Even when a suitable tutor is found, scheduling a study session can be difficult. Students have different class schedules, extracurricular activities, and personal responsibilities, making it challenging to find a time when both parties are available. As a result, study sessions are often postponed, canceled, or never take place at all. This issue extends beyond a single institution and affects peer learning opportunities across many Philippine colleges and universities.

The current educational technology tools are inadequate for overcoming this problem. Learning management systems (LMS) like Google Classroom and Moodle are primarily designed to deliver content, manage assignments, and connect teachers and students. Other commercial tutoring websites provide professional tutoring services and handle financial transactions, rather than peer tutoring in an educational setting. Consequently, there is no widely accessible platform that matches tutors and provides intelligent scheduling that accounts for college students' availability.

This study proposes developing Acadia, a web-based peer-to-peer academic tutoring platform that integrates Machine Learning-powered recommendation letter understanding, competency-based matching, and automated constraint-based scheduling. Acadia aims to address three key challenges: extracting structured information from faculty recommendation letters through AI-assisted analysis to support tutor qualification review, helping students connect with the most competent tutors through subject-specific ranking, and simplifying the process of scheduling study sessions through availability-based conflict detection. The system is designed with an architecture that supports deployment across different colleges and university departments.

To evaluate the system in a real academic setting, this study will implement and assess Acadia within the College of Computer Studies (CCS) of the University of Cebu Pardo-Talisay Campus. The department provides a suitable environment for evaluation because its curriculum, scheduling structure, and student population reflect conditions commonly found in computing programs across Philippine higher education institutions. The study aims to determine the platform's feasibility and provide insights into its potential adoption in other departments and institutions.

## **Objectives of the Study**

The general objective of this study is to design and develop a web-based peer tutoring platform that integrates Machine Learning-powered document understanding, competency-based tutor matching, and intelligent constraint-based scheduling for Philippine college departments. The system will be implemented and evaluated at the College of Computer Studies (CCS) of the University of Cebu Pardo-Talisay Campus, the pilot deployment site.

Specifically, this study aims to:

- Design and develop a centralized web-based peer tutoring platform with an architecture that supports deployment across different Philippine college curricula, with initial implementation and evaluation focused on the subjects and courses offered in the pilot department.

- Implement a Machine Learning-powered recommendation letter understanding system that uses trained classification models to extract recommended tutoring subjects, assess recommendation strength, and identify soft skills from faculty endorsement documents.

- Develop a tutor feedback understanding module using Machine Learning to analyze written student reviews and generate structured insights on tutor teaching strengths, improvement areas, and covered topics.

- Develop a competency-based matching module that identifies and ranks verified peer tutors based on subject-specific metrics including student ratings, faculty recommendation scores, session completion rates, and tutoring experience.

- Implement a constraint-based scheduling engine that automatically cross-references user-managed availability and generates conflict-free study sessions while respecting institutional holidays.

- Implement curriculum-based automatic subject eligibility using verified academic progression to determine which subjects are academically appropriate for each student.

- Provide integrated video conferencing and in-app messaging to support both on-campus and online tutoring sessions.

- Provide a course-based learning resources module that allows verified tutors to share reusable supplementary materials with students.

- Evaluate the system's usability, scheduling accuracy, and effectiveness in supporting peer-assisted learning through testing with representative users.

## **Scope and Limitations of the Study**

## **Scope of the Study**

The study covers the design and development of a full-stack web-based peer tutoring platform for the College of Computer Studies (CCS) of the University of Cebu Pardo-Talisay Campus. The system includes administrative, student, Machine Learning, and intelligent scheduling functions intended to support peer-assisted learning and academic collaboration.

## **Administrative Functions**

- Student account management, including account creation, editing, and bulk import through CSV files

- Course and subject management for the department with year level and semester tagging

- Department management for multi-department deployment

- Tutor application review with ML-assisted recommendation letter understanding, confidence scoring, and subject alignment assessment

- Verified academic progression management (year level and semester updates)

- Session monitoring, analytics, and weekly frequency tracking

- Announcement management and system-wide notifications

- Resource moderation for uploaded learning materials

## **Student Functions**

- Log in using a student ID number with mandatory password change upon first access

- Tutor application submission with faculty recommendation letter upload and ML-powered understanding

- Automatic subject eligibility based on verified academic progression (program, year level, semester)

- Tutor discovery through a ranked list of verified tutors based on subject-specific competency scores

- AI-generated insights on tutor teaching strengths displayed on tutor profiles

- Study session booking through calendar-based date selection with availability-based slot generation and holiday awareness

- Session management covering pending, accepted, scheduled, completed, canceled, and rejected sessions

- Integrated video conferencing (Jitsi Meet) for online sessions with the ability to share recording links in the session chat after sessions are externally recorded

- In-app messaging between session participants with automatic conversation locking upon session completion

- Post-session tutor evaluation using ratings and written comments

- Availability management through an interactive weekly calendar with optional class schedule import for generating suggested availability. The uploaded schedule file is deleted from the server immediately after processing; parsed schedule data is used only to compute suggested free time and is not used for scheduling decisions.

- Course-based learning resources browsing and downloading

## **Machine Learning Features**

- A trained multi-task classification model (Linear SVM + Logistic Regression) for recommendation letter understanding that predicts:
  - Recommended tutoring subjects (multi-label classification)
  - Recommendation strength (Strong/Moderate/Weak/None)
  - Soft skills extracted from the recommendation letter (multi-label classification)

- A trained tutor feedback analysis model that extracts:
  - Review sentiment (Positive/Neutral/Negative)
  - Teaching strengths
  - Areas for improvement
  - Topics covered

- Designed with a graceful fallback architecture to maintain functionality even if certain services become unavailable. The recommendation letter analysis service and the feedback analysis service operate as separate Python processes. If either service fails or cannot be reached, the system automatically switches to an alternative method. Recommendation letter analysis falls back to an LLM or rule-based pattern matching, while feedback insights are temporarily unavailable rather than disrupting the rest of the platform.

- Machine learning is used only to extract and organize information from documents. It does not make approval decisions or enforce system rules. All tutor applications are reviewed and verified by an administrator, who retains full authority over the final approval decision.

## **Intelligent Features**

- A constraint-based scheduling engine that analyzes user availability and existing session commitments to identify mutually available time slots, with Philippine holiday awareness

- A subject-specific competency-based tutor ranking mechanism that uses fixed institutional weights: student ratings (45%), faculty recommendation scores (15%), session completion rates (20%), and tutoring experience (20%) to ensure transparency, consistency, fairness, and reproducibility

- Deterministic subject alignment that compares tutor-selected subjects against ML-predicted recommended subjects

- Deterministic confidence scoring that evaluates document completeness and consistency using OCR quality, faculty identity fields (name, position, department), signature detection, subject alignment, student name presence, and required sections present

- Automatic curriculum filtering based on verified academic progression (year level + semester)

- Tutor workload management through administrator-configurable limits on weekly tutoring sessions

## **Limitations of the Study**

- Although the platform architecture supports deployment across different Philippine college departments, this study limits its implementation, testing, and evaluation to the College of Computer Studies (CCS) of the University of Cebu Pardo-Talisay Campus. Deployment across multiple departments or institutions is beyond the scope of the study and has not been validated.

- The system does not support self-registration. All student accounts must be created and managed by an administrator.

- The platform does not manage academic grades, GPA computation, or student performance tracking, except for the information required to compute tutor competency scores.

- The constraint-based scheduling engine operates using user-managed availability. It accounts for institutional holidays but does not automatically detect temporary schedule changes or academic events. Uploaded class schedules are never used directly for scheduling — they are processed temporarily only to suggest availability and then deleted.

- The accuracy of OCR-based text extraction depends on the quality of uploaded documents. Documents with poor image quality, handwritten entries, or unsupported formats may not be processed accurately. In such cases, the system gracefully degrades to lower confidence scores and flags the application for manual administrator review.

- The Machine Learning models are trained on synthetic data generated to represent varied recommendation letter and review writing styles. Model performance may vary on real-world documents with significantly different formatting or language. The architecture supports future retraining with institutional data as it becomes available.

- Video conferencing is provided through embedded Jitsi Meet (open-source). The platform does not provide built-in recording infrastructure. Users may record sessions using Jitsi's built-in recording to Dropbox, local recording, or external screen recording tools, and share the resulting link through the in-app session chat.

- The tutor competency scoring uses fixed institutional weights (45% subject-specific rating, 15% faculty recommendation score, 20% completion rate, and 20% tutoring experience). These weights are not user-configurable and are designed to ensure consistent, transparent, and reproducible ranking across the platform.

- The system intentionally does not store uploaded class schedule files permanently. When users optionally upload a class schedule to assist in generating their availability, the uploaded file is deleted from the server immediately after processing. The parsed schedule data is used only to compute suggested free time slots for user review. The scheduler operates exclusively on user-confirmed availability and never references uploaded schedule data for session conflict detection.

## **Significance of the Study**

This study is expected to benefit the following stakeholders:

**Students (Tutees)**. The system allows students to connect with verified peer tutors for specific subjects through a structured, AI-enhanced discovery process. The platform streamlines the scheduling process through automated availability matching, provides AI-generated teaching insights on tutor strengths to inform selection decisions, and supports both on-campus and online sessions through integrated video conferencing and messaging.

**Students (Tutors)**. The platform provides peer tutors with an organized environment to offer academic assistance, manage their availability, share reusable course-based learning resources, and build a record of completed tutoring sessions and student feedback. The ML-powered feedback analysis provides tutors with structured insights on their teaching strengths and areas for improvement. The faculty recommendation letter process, supported by ML-powered understanding with administrator oversight, establishes credibility for approved tutors.

**Faculty and Academic Coordinators**. The system involves faculty members in the tutor verification process through recommendation letters. Faculty prepare and issue their own recommendation letters for students they endorse as peer tutors. The ML-powered understanding module extracts structured information from these letters to assist administrators in the review process. Information such as frequently requested subjects, tutoring participation, and study session trends may help support academic advising, student support initiatives, and curriculum-related decision-making.

**Department Administration**. The platform centralizes key administrative functions related to peer tutoring, including account management, tutor verification, academic progression management, and system notifications. The ML-assisted recommendation letter understanding reduces the manual effort of reading and evaluating uploaded documents while maintaining full administrator authority over all approval decisions.

**The Institution**. The study demonstrates how Machine Learning, intelligent scheduling, and competency-based tutor matching can be implemented with accessible, cost-effective technologies while maintaining institutional data privacy through on-premise deployment. The privacy-first architecture ensures student data never leaves the institutional network. The resulting system may serve as a model for other departments or institutions seeking to strengthen peer-assisted learning programs.

**Future Researchers**. This study contributes to the body of knowledge on peer-assisted learning systems by providing a practical implementation of Machine Learning-powered document understanding, constraint-based scheduling, and competency-based matching within a student-facing tutoring platform. The findings may serve as a reference for future studies involving educational technology, academic support systems, NLP applications in education, and intelligent scheduling.

## **Definition of Terms**

**Constraint-Based Scheduling** — An approach to scheduling that identifies valid study session time slots by evaluating user availability against a set of predefined constraints, such as existing session commitments and institutional holidays.

**Competency Score** — A subject-specific numerical score generated using fixed institutional weights: student ratings (45%), faculty recommendation score (15%), session completion rate (20%), and tutoring experience (20%). Tutors are ranked only within the subject being searched, ensuring fair and transparent comparison.

**Machine Learning (ML)** — A subset of artificial intelligence where algorithms learn patterns from training data to make predictions on new, unseen data without being explicitly programmed for each case. In Acadia, ML performs information extraction from recommendation letters and tutor reviews. ML never approves tutors, computes competency scores, schedules sessions, or makes administrative decisions.

**Natural Language Understanding (NLU)** — The application of Machine Learning techniques to convert unstructured natural language text (such as recommendation letters and written reviews) into structured, machine-readable information.

**TF-IDF Vectorization** — A text preprocessing technique (Term Frequency-Inverse Document Frequency) that converts text documents into numerical feature vectors based on word importance, used as input to the classification models.

**Multi-label Classification** — A Machine Learning task where a single input can be assigned multiple labels simultaneously (e.g., a recommendation letter may endorse a student for multiple subjects).

**Recommendation Letter Understanding** — The ML-powered process of extracting structured information from uploaded faculty recommendation letters, including predicted subjects, recommendation strength, and soft skills. The Machine Learning module performs information extraction; the administrator performs the actual verification and approval.

**Faculty Recommendation Score** — A deterministic score computed from ML-predicted recommendation strength and subject alignment percentage, contributing 15% to the overall tutor competency score. This score is derived from ML outputs but calculated using deterministic weighted arithmetic.

**Subject Alignment** — A deterministic comparison between the subjects a tutor selected for their application and the subjects predicted by the ML model from the faculty recommendation letter, expressed as a percentage.

**Confidence Score** — A deterministic weighted score (0-100) indicating the completeness and consistency of an uploaded recommendation letter. It evaluates: OCR quality, faculty identity fields (name, position, department), signature detection, subject alignment, student name presence, and required sections present. This score does not assess recommendation quality or document authenticity — it measures extractability and completeness, and is intended only as an aid for administrator review.

**Peer Tutoring** — A structured learning activity in which a student who has demonstrated proficiency in a subject provides academic assistance to another student studying the same subject.

**OCR (Optical Character Recognition)** — A technology that extracts text from PDF documents and scanned images, enabling automated analysis of uploaded recommendation letters.

**Tutor Profile** — A verified record within the system that contains a tutor's approved subjects, recommendation letter understanding results, and accumulated subject-specific tutoring performance data.

**Session Lifecycle** — The sequence of stages that a tutoring session passes through, including request submission, acceptance, scheduling, completion, cancellation, and post-session evaluation.

**Availability** — User-managed time periods indicating when a student or tutor is available for tutoring sessions. The scheduler uses only confirmed availability for conflict detection. Class schedules are never used directly for scheduling.

**Curriculum Filter** — An automatic eligibility computation that determines which subjects are academically appropriate for a student based on their verified program, year level, and current semester.

**Academic Progression** — The verified combination of a student's program, year level, and current semester, maintained exclusively by administrators to prevent misrepresentation of academic standing.

**Availability Cap** — A configurable administrative limit on the number of tutoring sessions a tutor may accept within a specified period to prevent excessive scheduling.

**Data Minimization** — A privacy principle followed by the system where only the minimum necessary personal information is collected and retained. When users optionally upload class schedules, the uploaded file is deleted from the server immediately after text extraction. The parsed schedule data is used only to generate availability suggestions for user review. The scheduler operates exclusively on user-confirmed availability stored in the Availability collection.

**Interval Scheduling Algorithm** — The scheduling technique used by the constraint engine, which determines busy time blocks derived from confirmed availability and existing bookings, then scans time slots to find conflict-free periods where all participants are simultaneously available.

**Feedback Insights** — ML-generated structured analysis of written tutor reviews, providing aggregated information on teaching strengths, improvement areas, sentiment distribution, and topics covered — displayed to students on tutor profiles to inform selection decisions. Feedback insights never modify ratings, competency scores, or tutor rankings.
