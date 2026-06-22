University of Cebu Pardo-Talisay Campus Department of Computer Studies 

**SkillSwap** : Verified Tutors, Automated Scheduling — A Peer-to-Peer Learning Platform for Philippine Colleges 

**TEAM ODYSSEY Team Members:** 

Niño Angelo C. Bacalso Seth Wilson B. Canencia Dwight James O. Dupit Kishelle Aibhe F. Garay Simone Dominique Makinano 

## **CHAPTER 1: INTRODUCTION** 

## **Rationale of the Study** 

Collaborative learning and peer-to-peer tutoring have long been recognized as effective approaches to learning in higher education. In Philippine colleges, students in computing and IT programs often encounter challenging subjects such as database management, data structures, and web development, where additional academic support can significantly improve student performance. Studies have consistently shown that peer tutoring benefits both participants. The student receiving assistance gains support from someone who has recently completed the same subject, while the tutor strengthens their own understanding through the process of teaching (Topping, 1996). 

Despite these benefits, peer tutoring in many Philippine colleges remains largely informal and unstructured. Students who need help often rely on social media group chats, personal messages, or word-of-mouth recommendations to find someone who can assist them. Even when a suitable tutor is found, scheduling a study session can be difficult. Students have different class schedules, extracurricular activities, and personal responsibilities, making it challenging to find a time when both parties are available. As a result, study sessions are often postponed, canceled, or never take place at all. This issue extends beyond a single institution and affects peer learning opportunities across many Philippine colleges and universities. 

The current educational technology tools are inadequate for overcoming this problem. Learning management systems (LMS) like Google Classroom and Moodle are primarily designed to deliver content, manage assignments, and connect teachers and students. Other commercial tutoring websites provide professional tutoring services and handle financial transactions, rather than peer tutoring in an educational setting. Consequently, there is no widely accessible platform that matches tutors and provides intelligent scheduling that accounts for college students' class schedules. 

This study proposes developing SkillSwap, a web-based peer-to-peer academic tutoring registry and study session scheduler that can be adapted for use across different colleges and university departments. SkillSwap aims to address two key challenges: helping students connect with qualified peer tutors and simplifying the process of scheduling study sessions. Using a constraint-based scheduling engine, SkillSwap will automatically identify available time slots by comparing participants' class schedules and generating conflict-free study sessions. Through 

this approach, the system seeks to reduce scheduling difficulties, encourage more frequent peer-assisted learning, and provide a structured platform for academic collaboration. 

To evaluate the system in a real academic setting, this study will implement and assess SkillSwap within the College of Computer Studies (CCS) of the University of Cebu South Campus. The department provides a suitable environment for evaluation because its curriculum, scheduling structure, and student population reflect conditions commonly found in computing programs across Philippine higher education institutions. The study aims to determine the platform's feasibility and provide insights into its potential adoption in other departments and institutions. 

## **Objectives of the Study** 

The general objective of this study is to design and develop a web-based peer tutoring platform that integrates competency-based tutor matching with intelligent constraint-based scheduling for Philippine college departments. The system will be implemented and evaluated at the College of Computer Studies (CCS) of the University of Cebu South Campus, the pilot deployment site. 

Specifically, this study aims to: 

- Design and develop a centralized web-based peer tutoring platform adaptable to various Philippine college curricula, with initial implementation focused on the subjects and courses offered in the pilot department. 

- Implement a constraint-based scheduling engine that automatically cross-references student class schedules and generates conflict-free study sessions. 

- Develop a competency-based matching module that identifies and ranks verified peer tutors based on subject expertise, academic performance, ratings, and completed tutoring sessions. 

- Implement an automated grade document verification system using optical character recognition (OCR) to support and streamline the tutor application process. 

- Provide a unified role-based platform that supports user authentication, tutor registries, automated scheduling, session management, and real-time notifications. 

- Evaluate the system's usability and effectiveness in supporting peer-assisted learning through alpha testing with representative users. 

## **Scope and Limitations of the Study** 

## **Scope of the Study** 

The study covers the design and development of a full-stack web-based peer tutoring platform for the College of Computer Studies (CCS) of the University of Cebu South Campus. The system includes administrative, student, and intelligent scheduling functions intended to support peer-assisted learning and academic collaboration. 

## **Administrative Functions** 

- Student account management, including account creation, editing, and bulk import through CSV files 

- Course and subject management for the department 

- Tutor application review with OCR-assisted grade verification 

- Student schedule management through weekly class timetable input 

- Session monitoring and analytics 

- Announcement management and system-wide notifications 

## **Student Functions** 

- Log in using a student ID number with mandatory password change upon first access 

- Tutor application submission with grade document upload and OCR verification 

- Tutor discovery through a ranked list of verified tutors based on competency scores 

- Study session booking through automated schedule matching and timetable comparison 

- Session management covering pending, accepted, scheduled, completed, canceled, and rejected sessions 

- Post-session tutor evaluation using ratings and comments 

- Personal schedule viewing and session history tracking 

## **Intelligent Features** 

- A constraint-based scheduling engine that analyzes student schedules and existing session commitments to identify mutually available time slots 

- A competency-based tutor ranking mechanism that evaluates tutors using academic grades, student ratings, session completion rates, and tutoring experience 

- OCR-based grade extraction and student ID verification for tutor applications 

- Tutor workload management through configurable limits on weekly tutoring sessions 

## **Limitations of the Study** 

- Although the platform is designed to be adaptable to different Philippine college departments, this study limits its implementation, testing, and evaluation to the College of Computer Studies (CCS) of the University of Cebu South Campus. Deployment across multiple departments or institutions is beyond the scope of the study. 

- The system does not support self-registration. All student accounts must be created and managed by an administrator. 

- The platform does not manage academic grades, GPA computation, or student performance tracking, except for the information required to verify tutor eligibility. 

- The constraint-based scheduling engine operates using weekly recurring class schedules. It does not account for temporary schedule changes, holidays, academic events, or other one-time scheduling adjustments. 

- The accuracy of OCR-based grade detection depends on the quality and format of uploaded documents. Documents with poor image quality, handwritten entries, or unsupported formats may not be processed accurately. In such cases, manual verification by an administrator is required. 

- The system does not provide built-in video conferencing, real-time messaging, or payment processing features. Online tutoring sessions must be conducted through external platforms such as Google Meet or Zoom. 

- The tutor-matching module uses a predefined rule-based scoring approach rather than machine-learning techniques. Tutor rankings are generated using fixed evaluation criteria and do not automatically adapt based on user behavior or historical system data. 

- Document verification is limited to OCR-assisted extraction and student ID matching. Advanced document authentication and forgery detection mechanisms are outside the scope of this study. 

## **Significance of the Study** 

This study is expected to benefit the following stakeholders: 

**Students (Tutees)** . The system allows students to link with verified peer tutors for specific subjects in their department in a structured and accessible manner. The platform streamlines the scheduling process, saves time and effort for coordinating study sessions, and helps students concentrate more on learning. The tutor ranking system also enables students to find qualified tutors based on specific academic and tutoring criteria. 

**Students (Tutors)** . The platform provides peer tutors with an organized environment to offer academic assistance, manage their availability, and build a record of completed tutoring sessions and student feedback. The tutor verification process also helps establish credibility by confirming tutors' academic qualifications for the subjects they wish to teach. 

**Faculty and Academic Coordinators** . The system provides faculty members and academic coordinators with greater visibility into peer learning activities within the department. Information such as frequently requested subjects, tutoring participation, and study session trends may help support academic advising, student support initiatives, and curriculum-related decision-making. 

**Department Administration** . The platform centralizes key administrative functions related to peer tutoring, including account management, tutor verification, schedule management, and system notifications. This reduces the administrative effort required to coordinate tutoring activities through manual processes. 

**The Institution** . The study demonstrates how intelligent scheduling and competency-based tutor matching can be implemented with accessible, cost-effective technologies. The resulting system may serve as a model for other departments or institutions seeking to strengthen peer-assisted learning programs. 

**Future Researchers** . This study contributes to the body of knowledge on peer-assisted learning systems by providing a practical implementation of constraint-based scheduling within a 

student-facing tutoring platform. The findings may serve as a reference for future studies involving educational technology, academic support systems, and intelligent scheduling applications. 

## **Definition of Terms** 

**Constraint-Based Scheduling** — An approach to scheduling that identifies valid study session time slots by evaluating available schedules against a set of predefined constraints, such as class schedule conflicts and existing commitments. 

**Competency-Weighted Matching** — A tutor ranking method that evaluates and ranks tutors using multiple competency indicators, including academic grades, student ratings, session completion rates, and tutoring experience. 

**Peer Tutoring** — A structured learning activity in which a student who has demonstrated proficiency in a subject provides academic assistance to another student studying the same subject. 

**OCR (Optical Character Recognition)** —A technology that translates text embedded in images and scanned documents into machine-readable text and separates out information like grades and student ID numbers. 

**Tutor Profile** — A verified record within the system that contains a tutor's approved subjects, academic qualifications, and accumulated tutoring performance data. 

**Session Lifecycle** — The sequence of stages that a tutoring session passes through, including request submission, acceptance, scheduling, completion, cancellation, and post-session evaluation. 

**Competency Score** — A numerical score generated from the weighted combination of a tutor's academic performance, ratings, session completion rate, and tutoring experience, which is used to determine tutor rankings within the system. 

**Student Schedule** — A weekly class timetable assigned to a student and maintained within the system for the purpose of identifying available study periods. 

**Availability Cap** — A configurable limit on the number of tutoring sessions a tutor may accept within a specified period to prevent excessive scheduling. 

**Grade Slip** — An official academic document issued by an educational institution that shows a student's grades for a particular academic term and serves as proof of qualification when applying to become a tutor. 

