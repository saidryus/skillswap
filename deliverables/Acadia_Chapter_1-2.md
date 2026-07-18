

<!-- Start of picture text -->
| (*<br>niversity of ce<br>—_ at —— at —— ——<br>irdo and Talis<br><!-- End of picture text -->

| (* niversity of ce —_ at —— at —— —— irdo and Talis 



<!-- Start of picture text -->
Lion<br>VGGSY<br>Sie ag<br>Wry<br><!-- End of picture text -->



# **CHAPTER 1: INTRODUCTION** 

# **Rationale of the Study** 

Collaborative learning and peer-to-peer tutoring have long been recognized as effective approaches to learning in higher education. In Philippine colleges, students in computing and IT programs often encounter challenging subjects such as database management, data structures, and web development, where additional academic support can significantly improve student performance. Studies have consistently shown that peer tutoring benefits both participants. The student receiving assistance gains support from someone who has recently completed the same subject, while the tutor strengthens their own understanding through the process of teaching (Topping, 1996). 

Despite these benefits, peer tutoring in many Philippine colleges remains largely informal and unstructured. Students who need help often rely on social media group chats, personal messages, or word-of-mouth recommendations to find someone who can assist them. Even when a suitable tutor is found, scheduling a study session can be difficult. Students have different class schedules, extracurricular activities, and personal responsibilities, making it challenging to find a time when both parties are available. As a result, study sessions are often postponed, canceled, or never take place at all. This issue extends beyond a single institution and affects peer learning opportunities across many Philippine colleges and universities. 

The current educational technology tools are inadequate for overcoming this problem. Learning management systems (LMS) like Google Classroom and Moodle are primarily designed to deliver content, manage assignments, and connect teachers and students. Other commercial tutoring websites provide professional tutoring services and handle financial transactions, rather than peer tutoring in an educational setting. Consequently, there is no widely accessible platform that matches tutors and provides intelligent scheduling that accounts for college students' availability. 

This study proposes developing Acadia, a web-based peer-to-peer academic tutoring platform that integrates **[Panel 2 — ML instead of rule-based]** Machine Learning-powered understanding of recommendation letters, **[Panel 3 — Analytics]** competency-based matching, and **[Panel 3 — Show available slots directly]** automated, constraint-based scheduling. Acadia aims to address three key challenges: **[Panel 1 — Recommendation letters / Panel 2 — AI checks documents]** extracting structured information from faculty recommendation letters via AI-assisted analysis to support tutor qualification reviews, **[Panel 1 — Happy path booking]** helping students connect with the most competent tutors through subject-specific rankings, and **[Panel 3 — Show available slots directly]** simplifying the process of scheduling study sessions through availability-based conflict detection. **[Panel 2 — Multi-university]** The system is designed with an architecture that supports deployment across different colleges and university departments. 

To evaluate the system in a real academic setting, this study will implement and assess Acadia within the College of Computer Studies (CCS) of the University of Cebu PardoTalisay Campus. The department provides a suitable environment for evaluation because its curriculum, scheduling structure, and student population reflect conditions commonly found in computing programs across Philippine higher education institutions. The study aims to determine the platform's feasibility and provide insights into its potential adoption in other departments and institutions. 

# **Objectives of the Study** 

The general objective of this study is to design and develop a web-based peer tutoring platform that integrates Machine Learning-powered document understanding, competency-based tutor matching, and intelligent constraint-based scheduling for Philippine college departments. The system will be implemented and evaluated at the College of Computer Studies (CCS) of the University of Cebu, Pardo-Talisay Campus, the pilot deployment site. 

Specifically, this study aims to: 

- **[Panel 2 — Multi-university]** Design and develop a centralized web-based peer tutoring platform with an architecture that supports deployment across different Philippine college curricula, with initial implementation and evaluation focused on the subjects and courses offered in the pilot department. 

- **[Panel 2 — ML instead of rule-based / AI checks documents aligned with tutor skills]** Implement a Machine Learning-powered recommendation letter understanding system that uses trained classification models to extract recommended tutoring subjects, assess recommendation strength, and identify soft skills from faculty endorsement documents. 

- **[Panel 2 — ML instead of rule-based]** Develop a tutor feedback understanding module using Machine Learning to analyze student written reviews and generate structured insights into tutors' teaching strengths, areas for improvement, and covered topics. 

- **[Panel 3 — Analytics for both roles]** Develop a competency-based matching module that identifies and ranks verified peer tutors based on subject-specific metrics, including student ratings, faculty recommendation scores, session completion rates, and tutoring experience. 

- **[Panel 3 — Show available slots directly]** Implement a constraint-based scheduling engine that automatically cross-references user-managed availability and generates conflict-free study sessions while respecting institutional holidays. 

- Implement curriculum-based automatic subject eligibility using verified academic progression to determine which subjects are academically appropriate for each student. 

- **[Panel 3 — Video + messaging]** Provide integrated video conferencing and in-app messaging to support both on-campus and online tutoring sessions. 

- **[Panel 1 — Dedicated resources section]** Provide a course-based learning resources module that allows verified tutors to share reusable supplementary materials with students. 

- Evaluate the system's usability, scheduling accuracy, and effectiveness in supporting peer-assisted learning through testing with representative users. 

# **Scope and Limitations of the Study** 

# **Scope of the Study** 

The study covers the design and development of a full-stack web-based peer tutoring platform for the College of Computer Studies (CCS) of the University of Cebu, PardoTalisay Campus. The system includes administrative, student, Machine Learning, and intelligent scheduling functions intended to support peer-assisted learning and academic collaboration. 

# **Administrative Functions** 

- Student account management, including account creation, editing, and bulk import through CSV files 

- Course and subject management for the department with year-level and semester tagging 

- **[Panel 2 — Multi-university]** Department management for multi-department deployment 

- **[Panel 1 — Recommendation letters / Panel 2 — AI checks documents]** Tutor application review with ML-assisted recommendation letter understanding, confidence scoring, and subject alignment assessment 

- Verified academic progression management (year level and semester updates) 

- **[Panel 3 — Analytics for both roles]** Session monitoring, analytics, and weekly frequency tracking 

- Announcement management and system-wide notifications 

- Resource moderation for uploaded learning materials 

# **Student Functions** 

- Log in using a student ID number with a mandatory password change upon first access. 

- **[Panel 1 — Recommendation letters instead of grade slips]** Tutor application submission with faculty recommendation letter upload and ML-powered understanding. Students must have at least one availability slot configured before a tutor application can be submitted. 

- Automatic subject eligibility based on verified academic progression (program, year level, semester) 

- Tutor discovery through a ranked list of verified tutors based on subject-specific competency scores 

- **[Panel 3 — Analytics for both roles]** AI-generated insights on tutor teaching strengths are displayed on tutor profiles 

- **[Panel 1 — Happy path booking / Panel 3 — Show available slots directly]** Study session booking through calendar-based date selection with availability-based slot generation and holiday awareness 

- Session management covering pending, scheduled, completed, cancelled, and rejected sessions 

- **[Panel 3 — Video + messaging]** Integrated video conferencing (Jitsi Meet) for online sessions, with the ability to share recording links in the session chat after sessions are externally recorded 

- **[Panel 3 — Video + messaging]** In-app messaging between session participants with automatic conversation locking when a session ends (upon completion, cancellation, or rejection) 

- Post-session tutor evaluation using ratings and written comments 

- Availability management through an interactive weekly calendar, with an optional class schedule import to generate suggested availability. The uploaded schedule file is deleted from the server immediately after processing; parsed schedule data is used only to compute suggested free time and is not used for scheduling decisions. 

- **[Panel 1 — Dedicated resources section]** Course-based learning resources browsing and downloading 

# **Machine Learning Features** 

- **[Panel 2 — ML instead of rule-based / AI checks documents aligned with tutor skills]** A trained multi-task classification model (Linear SVM + Logistic Regression) for recommendation letter understanding that predicts: 

   - Recommended tutoring subjects (multi-label classification) 

   - Recommendation strength (Strong/Moderate/Weak/None) 

   - Soft skills extracted from the recommendation letter (multi-label classification) 

- **[Panel 2 — ML instead of rule-based / Panel 3 — Analytics]** A trained tutor feedback analysis model that extracts: 

   - Review sentiment (Positive/Neutral/Negative) 

   - Teaching strengths 

   - Areas for improvement 

   - Topics covered 

- Designed with a graceful fallback architecture to maintain functionality even if certain services become unavailable. The recommendation letter analysis service and the feedback analysis service operate as separate Python processes. If either service fails or becomes unavailable, the system automatically falls back to an alternative method. Recommendation letter analysis relies on an LLM or rule-based pattern matching, while feedback insights are temporarily unavailable, rather than disrupting the rest of the platform. 

- Machine learning is used only to extract and organize information from documents. It does not make approval decisions or enforce system rules. All tutor applications are reviewed and verified by an administrator, who retains full authority over the final approval decision. 

# **Intelligent Features** 

- **[Panel 3 — Show available slots directly]** A constraint-based scheduling engine that analyzes user availability and existing session commitments to identify mutually available time slots, with Philippine holiday awareness 

- A subject-specific competency-based tutor ranking mechanism that uses fixed institutional weights: student ratings (45%), faculty recommendation scores (15%), session completion rates (20%), and tutoring experience (20%) to ensure transparency, consistency, fairness, and reproducibility 

- **[Panel 2 — AI checks documents aligned with tutor skills]** Deterministic subject alignment that compares tutor-selected subjects against ML-predicted recommended subjects 

- **[Panel 2 — AI checks fake documents]** Deterministic confidence scoring that evaluates document completeness and consistency using OCR quality, faculty identity fields (name, position, department), signature detection, subject alignment, student name presence, and required sections present 

- Automatic curriculum filtering based on verified academic progression (year level + semester) 

- Tutor workload management through administrator-configurable limits on weekly tutoring sessions 

# **Limitations of the Study** 

- **[Panel 2 — Multi-university]** Although the platform architecture supports deployment across different Philippine college departments, this study limits its implementation, testing, and evaluation to the College of Computer Studies (CCS) of the University of Cebu Pardo-Talisay Campus. Deployment across multiple departments or institutions is beyond the scope of the study and has not been validated. 

- The system does not support self-registration. All student accounts must be created and managed by an administrator. 

- The platform does not manage academic grades, GPA computation, or student performance tracking, except for the information required to compute tutor competency scores. 

- The constraint-based scheduling engine operates using user-managed availability. It accounts for institutional holidays but does not automatically detect temporary schedule changes or academic events. Uploaded class schedules are never used directly for scheduling — they are processed only temporarily to suggest availability, then deleted. 

- The accuracy of OCR-based text extraction depends on the quality of uploaded documents. Documents with poor image quality, handwritten entries, or unsupported formats may not be processed accurately. In such cases, the system gracefully degrades to lower confidence scores and flags the application for manual review by an administrator. 

- The Machine Learning models are trained on synthetic data generated to represent a range of recommendation letters and review-writing styles. Model performance may vary on realworld documents with significantly different formatting or language. The architecture supports future retraining with institutional data as it becomes available. 

- **[Panel 2 — Save recordings — PARTIAL]** Video conferencing is provided through embedded Jitsi Meet (open-source). The platform does not provide built-in recording infrastructure. Users may record sessions using Jitsi's built-in recording to Dropbox, local recording, or external screen recording tools, and share the resulting link through the in-app session chat. 

- The tutor competency scoring uses fixed institutional weights (45% subject-specific rating, 15% faculty recommendation score, 20% completion rate, and 20% tutoring experience). These weights are not user-configurable and are designed to ensure consistent, transparent, and reproducible ranking across the platform. 

- The system intentionally does not permanently store uploaded class schedule files. When users optionally upload a class schedule to help generate their availability, the uploaded file is deleted from the server immediately after processing. The parsed schedule data is used only to compute suggested free time slots for user review. The scheduler operates exclusively on user-confirmed availability and never references uploaded schedule data to detect session conflicts. 

# **Significance of the Study** 

This study is expected to benefit the following stakeholders: 

**Students (Tutees)** . The system allows students to connect with verified peer tutors for specific subjects through a structured, AI-enhanced discovery process. **[Panel 1 — Happy path booking]** The platform streamlines scheduling through automated availability matching, **[Panel 3 — Analytics]** provides AI-generated teaching insights into tutors' strengths to inform selection decisions, and **[Panel 3 — Video + messaging]** supports both on-campus and online sessions through integrated video conferencing and messaging. 

**Students (Tutors)** . The platform provides peer tutors with an organized environment to offer academic assistance, manage their availability, **[Panel 1 — Dedicated resources section]** share reusable course-based learning resources, and **[Panel 3 — Analytics]** build a record of completed tutoring sessions and student feedback. The ML-powered feedback analysis provides tutors with structured insights into their teaching strengths and areas for improvement. **[Panel 1 — Recommendation letters instead of grade slips / Panel 2 — AI checks documents]** **[Panel 1 — Recommendation letters instead of grade slips / Panel 2 — AI checks documents]** The faculty recommendation letter process, supported by ML-powered understanding with administrator oversight, establishes credibility for approved tutors. 

**Faculty and Academic Coordinators** . The system involves faculty members in the tutor verification process through recommendation letters. Faculty members prepare and issue their own recommendation letters for students they endorse as peer tutors. The ML-powered understanding module extracts structured information from these letters to assist administrators in the review 

process. Information such as frequently requested subjects, tutoring participation, and study session trends may help support academic advising, student support initiatives, and curriculum-related decision-making. 

**Department Administration** . The platform centralizes key administrative functions related to peer tutoring, including account management, tutor verification, academic progression management, and system notifications. The ML-assisted recommendation letter understanding reduces the manual effort of reading and evaluating uploaded documents while maintaining full administrator authority over all approval decisions. 

**The Institution** . The study demonstrates how Machine Learning, intelligent scheduling, and competency-based tutor matching can be implemented with accessible, cost-effective technologies while maintaining institutional data privacy through on-premise deployment. The privacy-first architecture ensures student data never leaves the institutional network. **[Panel 2 — Multi-university]** The resulting system may serve as a model for other departments or institutions seeking to strengthen peer-assisted learning programs. 

**Future Researchers** . This study contributes to the body of knowledge on peer-assisted learning systems by providing a practical implementation of Machine Learning-powered document understanding, constraint-based scheduling, and competency-based matching within a studentfacing tutoring platform. The findings may serve as a reference for future studies involving educational technology, academic support systems, NLP applications in education, and intelligent scheduling. 

# **Definition of Terms** 

**Constraint-Based Scheduling** — An approach to scheduling that identifies valid study session time slots by evaluating user availability against a set of predefined constraints, such as existing session commitments and institutional holidays. 

**Competency Score** — A subject-specific numerical score generated using fixed institutional weights: student ratings (45%), faculty recommendation score (15%), session completion rate (20%), and tutoring experience (20%). Tutors are ranked only within the subject being searched, ensuring fair and transparent comparison. 

**Machine Learning (ML)** — A branch of artificial intelligence where algorithms learn from training data to predict outcomes on new data without explicit programming. In Acadia, ML is used strictly to extract information from recommendation letters and tutor reviews; it plays no role in 

approving tutors, computing competency scores, scheduling sessions, or making administrative decisions. 

**Natural Language Understanding (NLU)** — The application of Machine Learning techniques to convert unstructured natural language text (such as recommendation letters and written reviews) into structured, machine-readable information. 

**[Panel 2 — ML instead of rule-based]** **TF-IDF Vectorization** — A text preprocessing technique (Term Frequency-Inverse Document Frequency) that converts text documents into numerical feature vectors based on word importance, used as input to the classification models. 

**Multi-label Classification** — A Machine Learning task where a single input can be assigned multiple labels simultaneously (e.g., a recommendation letter may endorse a student for multiple subjects). 

**[Panel 1 — Recommendation letters / Panel 2 — AI checks documents]** **[Panel 1 — Recommendation letters / Panel 2 — AI checks documents]** **Recommendation Letter Understanding** — The ML-powered process of extracting structured information from uploaded faculty recommendation letters, including predicted subjects, recommendation strength, and soft skills. The Machine Learning module performs information extraction; the administrator performs the actual verification and approval. 

**Faculty Recommendation Score** — A deterministic score computed from ML-predicted recommendation strength and subject alignment percentage, contributing 15% to the overall tutor competency score. This score is derived from ML outputs but calculated using deterministic weighted arithmetic. 

**[Panel 2 — AI checks documents aligned with tutor skills]** **[Panel 2 — AI checks documents aligned with tutor skills]** **Subject Alignment** — A deterministic comparison between the subjects a tutor selected for their application and the subjects predicted by the ML model from the faculty recommendation letter, expressed as a percentage. 

**[Panel 2 — AI checks fake documents]** **Confidence Score** — A deterministic weighted score (0-100) indicating the completeness and consistency of an uploaded recommendation letter. It evaluates OCR quality, faculty identity fields (name, position, department), signature detection, subject alignment, student name presence, and the presence of required sections. This score does not assess recommendation quality or document authenticity — it measures extractability and completeness, and is intended only as an aid for administrator review. 

**Peer Tutoring** — A structured learning activity in which a student who has demonstrated proficiency in a subject provides academic assistance to another student studying the same subject. 

**OCR (Optical Character Recognition)** — A technology that extracts text from PDF documents and scanned images, enabling automated analysis of uploaded recommendation letters. 

**Tutor Profile** — A verified record within the system that contains a tutor's approved subjects, recommendation letter understanding results, and accumulated subject-specific tutoring performance data. 

**Session Lifecycle** — The sequence of stages that a tutoring session passes through, including request submission, acceptance, scheduling, completion, cancellation, and post-session evaluation. 

**Availability** — User-managed time periods indicating when a student or tutor is available for tutoring sessions. The scheduler uses only confirmed availability for conflict detection. Class schedules are never used directly for scheduling. 

**Curriculum Filter** — An automatic eligibility computation that determines which subjects are academically appropriate for a student based on their verified program, year level, and current semester. 

**Academic Progression** — The verified combination of a student's program, year level, and current semester, maintained exclusively by administrators to prevent misrepresentation of academic standing. 

**Availability Cap** — A configurable administrative limit on the number of tutoring sessions a tutor may accept within a specified period to prevent excessive scheduling. 

**Data Minimization** — This principle dictates that the system collects and retains only the minimum personal information required, which is enforced by immediately deleting uploaded class schedules after text extraction and using the parsed data solely for temporary availability suggestions. Consequently, the scheduling engine operates exclusively on finalized, user-approved data stored securely within the Availability collection. Additionally, PII extracted from uploaded recommendation letters via OCR — including phone numbers, email addresses, physical addresses, and government ID numbers — is stripped from the stored OCR text before database persistence. The student's school ID number is intentionally preserved in the stored text to support administrator verification. 

**[Panel 3 — Show available slots directly]** **Interval Scheduling Algorithm** — The scheduling technique used by the constraint engine, which determines busy time blocks derived from confirmed availability and existing bookings, then scans time slots to find conflict-free periods where all participants are simultaneously available. 

**[Panel 3 — Analytics / Panel 2 — ML instead of rule-based]** **[Panel 3 — Analytics / Panel 2 — ML instead of rule-based]** **Feedback Insights** — ML-generated structured analysis of written tutor reviews, providing aggregated information on teaching strengths, improvement areas, sentiment distribution, and topics covered — displayed to students on tutor profiles to inform selection decisions. Feedback insights never modify ratings, competency scores, or tutor rankings. 

# **CHAPTER II: REVIEW OF RELATED LITERATURE AND STUDIES** 

# **Theoretical Background** 

Four theoretical frameworks inform the design and evaluation of Acadia. 

# **Technology Acceptance Model (TAM)** 

Proposed by Fred Davis in 1989, the Technology Acceptance Model (TAM) suggests that the adoption of a new system is primarily influenced by two factors: perceived usefulness, which refers to the extent to which users believe a system will help them improve their performance, and perceived ease of use, which refers to how simple the system is to use. This framework guides the study's evaluation phase, particularly the assessment of system usability and user acceptance. Since Acadia relies on voluntary student participation, its success depends on whether students perceive the platform as both useful and easy to use within their academic activities. For this reason, TAM provides an appropriate foundation for evaluating the likelihood of student adoption. 

# **Constraint Satisfaction Problem (CSP) Theory** 

Constraint Satisfaction Problem (CSP) theory provides the foundation for Acadia's scheduling component. A CSP is a type of computational problem in which a valid solution must satisfy multiple constraints simultaneously. Within the system, study sessions serve as the variables, available time slots serve as the domains, and scheduling restrictions such as user-managed availability, existing tutoring commitments, institutional holidays, and tutor availability limits serve as the constraints. 

**[Panel 3 — Show available slots directly]** This framework supports an automated scheduling engine that identifies valid study session schedules by eliminating time slots that violate any constraints. Rather than requiring students to manually coordinate schedules, the system generates only those time slots that satisfy all scheduling requirements. The work of Shimon Even, Alon Itai, and Adi Shamir (1976) established that timetabling problems belong to a class of computationally complex problems, providing theoretical support for algorithmic scheduling approaches. 

# **Social Constructivism** 

Social Constructivism, developed by Lev Vygotsky in 1978, posits that learning is a product of social interaction and collaborative problem-solving. One of the main points of this 

theory is the Zone of Proximal Development (ZPD), the difference between what a learner has already mastered and what they can accomplish with scaffolding. 

The educational basis of Acadia's peer tutoring model is grounded in this theory. The platform helps students connect with other students who can assist them with their studies, as well as with those who have demonstrated competence through faculty endorsement and proven tutoring performance. The system makes these connections easier to establish and implement through automated scheduling, video conferencing, and in-app messaging, creating opportunities for collaborative learning in line with the principles of Social Constructivism and the Zone of Proximal Development. 

# **Supervised Machine Learning for Text Classification** 

Supervised Machine Learning provides the theoretical foundation for Acadia's document understanding modules. Models are trained on labeled data in supervised learning to recognize patterns and classify new information based on what they have learned (Bishop, 2006). One of its most common applications is text classification, where documents are automatically assigned to predefined categories (Sebastiani, 2002). 

**[Panel 2 — ML instead of rule-based]** In Acadia, supervised text classification is used in two areas. First, it analyzes faculty recommendation letters to identify recommended subjects, the strength of recommendations, and relevant soft skills. Second, it examines written tutor reviews to determine sentiment, teaching strengths, and areas for improvement. To accomplish this, the system uses TF-IDF vectorization to represent textual features and a Linear Support Vector Machine (SVM) for multi-label classification, both of which are widely recognized techniques in text classification research (Joachims, 1998). 

The machine learning models are used solely to extract and organize information from text. They do not approve tutor applications, modify system rules, or make administrative decisions. Instead, the extracted information serves as decision support for administrators, who remain responsible for reviewing applications and making all final approval decisions. This approach follows the principles of human-in-the-loop AI, where machine learning assists rather than replaces human judgment (Amershi et al., 2019). 

# **Related Literature** 

# **Peer Tutoring Effectiveness in Higher Education** 

A 2024 meta-analysis published in _Asia Pacific Education Researcher_ examined the impact of peer tutoring programs on student academic performance across multiple higher education institutions. The study found consistent positive effects on tutee performance, with outcomes influenced by intervention type, duration, and implementation method (Springer, 2024). In a related study, Nature Humanities & Social Sciences Communications (2025) reported that peer tutors who receive pedagogical training develop clearer communication strategies, more structured teaching approaches, and higher levels of student engagement, resulting in improved tutee satisfaction. A systematic review by Gehreke (2024) further confirmed that peer mentoring has positive effects on academic integration, emotional well-being, and students' sense of belonging in higher education institutions. 

Collectively, these findings support the effectiveness of peer tutoring as an academic intervention. However, they also highlight that its success depends heavily on proper structure and accessibility, particularly in terms of coordination, tutor qualification assessment, and implementation. 

# **University Timetabling and Constraint-Based Scheduling** 

A 2023 comprehensive review of optimization techniques in university timetabling classified scheduling as a non-polynomial time (NP) combinatorial optimization problem and examined approaches such as constraint satisfaction, genetic algorithms, and hybrid methods (ResearchGate, 2023). The review concluded that constraint-based approaches remain among the most practical for generating feasible schedules under both hard and soft constraints. 

A separate mixed-integer programming study (2023) demonstrated that combining initial feasible solution generation with local search improves the efficiency and quality of generated timetables in real-world university settings. In addition, a 2024 study on fair course scheduling applied constraint programming with fairness considerations, showing that CSP techniques can also incorporate equity-based objectives beyond basic feasibility (arXiv, 2024). 

Although these studies focus on institutional timetabling, their underlying principles are directly applicable to peer-to-peer scheduling systems such as Acadia, where the same interval-based constraint logic is used to identify mutually available time slots from usermanaged availability data. 

# **Machine Learning for Document Understanding in Education** 

The increasing use of Machine learning has made it an important tool for processing and interpreting educational documents. One area that has seen significant progress is optical character recognition (OCR), which enables printed or scanned documents to be converted into machine-readable text. A 2022 study conducted at George Mason University demonstrated OCR's potential to automate grade processing, achieving 86 percent accuracy in recognizing numerical grades (GMU Journal of Student Scholarship Research, 2022). More recently, a 2025 systematic review highlighted continued improvements in deep learning techniques for educational document recognition, further increasing the accuracy and reliability of OCR-based systems (Preprints.org, 2025). 

Beyond OCR, machine learning techniques have also been widely applied to text classification tasks. Methods such as TF-IDF vectorization and Support Vector Machines (SVM) have consistently proven effective for categorizing educational documents, student feedback, and academic correspondence (Kotsiantis, 2007; Joachims, 1998). These approaches are particularly useful for multi-label classification, where a single document may belong to multiple categories simultaneously. In the context of faculty recommendation letters, for example, a single document may recommend a student for several subjects and describe various skills and competencies. 

Another established application of machine learning is sentiment analysis, which examines written feedback to identify opinions, strengths, and areas for improvement. Studies have shown that sentiment classification can complement numerical rating systems by providing richer insights from course evaluations and tutor reviews (Pang & Lee, 2008). Instead of relying solely on numerical scores, institutions can better understand user experiences by analyzing written comments. 

Acadia builds on these established techniques by applying machine learning to two key functions. The first is the analysis of faculty recommendation letters to identify recommended subjects, recommendation strength, and relevant soft skills. The second is the analysis of tutor reviews to extract sentiment, teaching strengths, and suggested areas for improvement. These models are intended only to organize and summarize information that would otherwise require manual review. Final decisions regarding tutor approval and competency evaluation remain under the authority of human administrators and the system's predefined scoring rules. 

# **Educational Technology Adoption in Philippine Higher Education** 

The World Bank (2022) reported that while most higher education institutions in the Philippines have adopted learning management systems, digital transformation remains largely concentrated on instructional delivery rather than administrative operations. A 2024 bibliometric analysis further confirmed that technology integration in Philippine higher education is primarily focused on classroom instruction rather than operational systems such as scheduling and student coordination (ResearchGate, 2024). 

Similarly, a UNESCO background paper (2023) emphasized persistent gaps in access to context-appropriate digital tools and highlighted the need for locally developed systems that address institutional realities in developing countries. 

Together, these studies support positioning Acadia as an operational academic support system rather than a content delivery platform, addressing gaps in understanding of tutor qualifications, scheduling coordination, and peer-learning infrastructure that existing systems do not fully cover. 

# **Data Privacy and Minimization in Educational Systems** 

Data minimization is a fundamental principle of modern privacy frameworks, including the Philippine Data Privacy Act of 2012 (RA 10173) and the European Union's General Data Protection Regulation (GDPR). It emphasizes collecting and processing only the personal information necessary to achieve a specific purpose. In educational technology, privacy plays an important role in user acceptance. Ifenthaler and Schumacher (2016) found that students are more willing to use learning analytics systems when they understand how their data is collected, used, and protected. 

Acadia incorporates this principle throughout its design. Uploaded class schedule files are used only for schedule extraction and are automatically deleted from the server once processing is complete, preventing unnecessary storage of personal documents. Instead of requiring students to share their complete academic timetables, the system relies on user-confirmed availability when generating scheduling suggestions. In addition, Acadia is designed as an institution-embedded, on-premise platform, allowing student information to remain within the institution's own network rather than being stored by external service providers. By limiting data collection and retention to what is strictly necessary, the system supports effective scheduling while respecting student privacy and complying with established data protection principles. 

# **Related Studies** 

# **Study 1: Course Signals at Purdue University (Arnold & Pistilli, 2012)** 

Arnold and Pistilli developed Course Signals at Purdue University as an earlywarning system that analyzed student behaviors, including attendance and classroom engagement, to identify students at risk of poor academic performance. The system generated automated alerts for both students and academic advisers, enabling timely intervention and contributing to improved course completion rates. 

This study demonstrates how data-driven systems can support academic success through early identification and intervention. Acadia builds on this concept by shifting the focus from institutional intervention to peer-assisted learning. Instead of simply identifying students who may need support, the platform helps connect them with qualified peer tutors whose competencies have been verified through machine learning-assisted recommendation analysis. While Course Signals emphasizes institutional alerts and adviser involvement, Acadia builds on this by facilitating timely peer-to-peer academic support. 

# **Study 2: UniTime — University Timetabling System** 

UniTime is an open-source academic scheduling system used by universities to generate class timetables that account for multiple constraints, such as room capacity, instructor availability, and enrollment conflicts. It applies constraint-based optimization techniques to produce feasible schedules from complex institutional data. 

Relevance to Acadia: Acadia applies the same constraint satisfaction principles used in UniTime, but at a more granular, user-centered level. Instead of scheduling institutional course offerings based on room and instructor data, Acadia cross-references individual users' availability to generate mutually available time slots for peer tutoring sessions. While the underlying interval-scheduling logic is similar, the application context shifts from institutional timetabling to privacy-respecting peer-to-peer coordination that uses only user-confirmed availability. 

# **Study 3: Knack — Peer Tutoring Platform (University of Central Florida)** 

Knack is a peer tutoring platform that connects university students with tutors who have previously excelled in the same courses. Tutor eligibility is verified through academic records, and students can book sessions through the platform. 

Relevance to Acadia: Knack validates the effectiveness of peer-tutoring marketplaces that verify tutors using academic performance. However, Knack operates as a commercial third-party platform in which student data is stored externally; it does not incorporate automated, constraint-based scheduling, and its tutor verification relies on institution-maintained academic records rather than faculty endorsement. Acadia differs by: (1) being institutionembedded (no third-party data sharing), (2) using ML-powered recommendation letter understanding to extract structured information from faculty endorsements for administrator review, (3) implementing automated availability-based scheduling with holiday awareness, and (4) providing subject-specific competency scoring with fixed institutional weights for transparency and reproducibility. 

# **Study 4: Wyzant — Online Tutoring Platform** 

Wyzant is a commercial tutoring platform that connects students to professional tutors based on ratings and availability. It contains scheduling and post-session evaluation features. 

Relevance to Acadia: Wyzant demonstrates the effectiveness of competency matching and tutor ranking based on feedback. Acadia adapts these ideas into a peer-to-peer educational setting, eliminates the monetary transaction, and adds: (1) ML-powered feedback understanding that extracts structured information from written reviews, (2) faculty recommendation letter understanding instead of self-declared qualifications, (3) constraint-based scheduling that automatically resolves conflicts, and (4) integrated video conferencing and in-app messaging for seamless session delivery. 

# **Comparative Matrix / Competitors' Analysis** 

| **Feature** | **Acadia** | **Google Classroom / LMS** | **UniTime** | **Knack** | **Wyzant** |
|---|---|---|---|---|---|
| Peer-to-peer tutoring platform | ✓ | ✗ | ✓ | ✓ | ✗ (professional tutors) |
| Constraint-based session scheduling | ✓ | ✗ | ✓ (institutional only) | ✗ | ✗ |
| Availability-based conflict detection | ✓ | ✗ | ✗ | ✗ | ✗ |
| ML-powered recommendation letter understanding | ✓ | ✗ | ✗ | ✗ | ✗ |
| Subject-specific competency ranking | ✓ | ✗ | ✗ | Partial (GPA filter) | ✓ (ratings only) |
| ML-powered feedback insights | ✓ | ✗ | ✗ | ✗ | ✗ |
| Curriculum-based subject eligibility | ✓ | ✗ | ✗ | ✗ | ✗ |
| Integrated video conferencing | ✓ | ✓ (Meet) | ✗ | ✗ | ✓ |
| In-app messaging | ✓ | ✓ | ✗ | ✗ | ✓ |
| Post-session rating system | ✓ | ✗ | ✗ | ✓ | ✓ |
| Holiday calendar awareness | ✓ | ✗ | ✗ | ✗ | ✗ |
| Learning resources sharing | ✓ | ✓ | ✗ | ✗ | ✗ |
| Tutor availability caps | ✓ | ✗ | ✗ | ✗ | ✓ |
| Session lifecycle (accept/reject) | ✓ | ✗ | ✗ | ✓ | ✓ |
| Privacy-first (institution-embedded) | ✓ | ✗ | ✗ | ✗ | ✗ |
| Designed for Philippine HEI context | ✓ | ✗ | ✗ | ✗ | ✗ |
| Free and self-hosted | ✓ | ✓ | ✗ | ✗ | ✗ |
| Session analytics / frequency tracking | ✓ | ✗ | ✗ | Partial | ✗ |
| Data minimization architecture | ✓ | ✗ | ✗ | ✗ | ✗ |



# **Key Differentiators of Acadia** 

Acadia is distinguished from existing systems through the following features: 

- Acadia integrates peer tutoring with machine-learning-assisted analysis of recommendation letters. Instead of relying solely on academic records or self-declared qualifications, the system analyzes faculty recommendation letters to identify recommended subjects, the strength of recommendations, and relevant soft skills. The extracted information supports the administrator during the review process, while all verification and approval decisions remain under human supervision. 

- The platform uses a subject-specific competency ranking system to recommend tutors. Each tutor is evaluated only within the subject being searched using a transparent scoring formula based on student ratings (45%), faculty recommendations (15%), session completion rate (20%), and tutoring experience (20%), ensuring fair and consistent rankings. 

- Acadia implements constraint-based scheduling that uses user-confirmed availability rather than requiring complete academic timetables. As an optional convenience, users may upload a class schedule to enable automatic extraction of availability. Once processing is complete, the uploaded file is immediately deleted, and only the extracted availability is used to generate suggested meeting times, supporting the principle of data minimization. 

- The system also includes machine learning-assisted feedback analysis, which examines written tutor reviews to identify teaching strengths, areas for improvement, and overall 

sentiment. These insights are displayed on tutor profiles to help students make more informed decisions when selecting a tutor. 

- To support both face-to-face and online tutoring, the platform integrates Jitsi Meet for video conferencing and provides a Messenger-style in-app messaging system. Tutors and students can continue communicating throughout an active session, share meeting or recording links when needed, and conversations are automatically locked once the session has ended. 

- Acadia is designed as a privacy-first, institution-embedded platform. Student information remains within the institution's network, and no third-party commercial service stores personal data. The system collects and retains only the information required for its intended functions, consistent with data minimization principles. 

- The platform is tailored to the Philippine higher education environment. It supports curriculum-based subject eligibility using verified year-level and semester information, accounts for Philippine holidays when generating schedules, and can be deployed across multiple departments while maintaining separate administrative scopes. 

- Finally, Acadia clearly separates machine learning from decision-making. Machine learning models are responsible only for extracting and classifying information, while scoring formulas enforce business rules, and administrators retain full authority over tutor approval, scheduling decisions, and overall system oversight. This separation promotes transparency, accountability, and trust in the platform. 

# **Legal Basis** 

The development and deployment of Acadia is guided by Philippine laws and regulations governing data privacy, cybersecurity, electronic documents, and higher education student services. 

# **Republic Act No. 10173 — Data Privacy Act of 2012** 

The Data Privacy Act of 2012 establishes the legal framework for protecting personal information in information and communications systems across both the public and private sectors. It requires organizations that collect and process personal data to implement appropriate physical, technical, and organizational safeguards against unauthorized access, disclosure, or misuse. 

Acadia processes personal information, including student identification numbers, academic progression data, and tutoring session records. To comply with the requirements of the Data Privacy Act, the system implements JWT-based authentication, role-based access control, and data minimization principles. As part of this approach, uploaded class schedule files are used only to generate availability suggestions and are automatically deleted from the server after text extraction. Only the information necessary for the platform's core functions is collected and processed. Student data remains confidential and is accessible only to authorized administrators and the respective users. In addition, Acadia's institution-embedded architecture ensures that student information remains within the institution's network rather than being stored by third-party service providers. 

# **Republic Act No. 10175 — Cybercrime Prevention Act of 2012** 

The Cybercrime Prevention Act of 2012 covers offenses committed against and through computer systems, including illegal access, data interference, and system misuse. This law underscores the need for adequate security measures to protect digital platforms from unauthorized access and data breaches. 

Acadia addresses these requirements through security mechanisms such as password hashing (bcrypt), progressive account lockout, server-side input validation, and secure API authentication. The system is designed to protect the integrity of student data and prevent unauthorized account access, including impersonation through falsified or compromised user accounts. 

# **Republic Act No. 8792 — Electronic Commerce Act of 2000** 

The Electronic Commerce Act of 2000 provides legal recognition for electronic documents and electronic data messages, granting them the same legal status as paper-based records under specified conditions. 

This provision is relevant to Acadia's use of digitally uploaded recommendation letters in the tutor application process. The system processes uploaded documents through OCR and ML-powered understanding, extracting structured information for administrative review. The administrator performs the actual verification and approval, using the ML analysis as an assistive tool to ensure thoroughness and accuracy. 

# **CHED Memorandum Order No. 9, Series of 2013 — Enhanced Policies and Guidelines on Student Affairs and Services** 

CHED Memorandum Order No. 9, s. 2013 mandates higher education institutions to provide student development and support services, including academic assistance programs such as tutorials. 

Acadia aligns with this directive by providing a structured, technology-enabled peer tutoring system that supports academic assistance within the institution. It operationalizes tutorial services by formalizing peer-to-peer academic support into a coordinated system with verified tutors, automated scheduling, and ML-assisted quality assurance, aligned with CHED's student welfare and development objectives. 

# **Synthesis** 

The literature and studies reviewed provide the foundation for Acadia's development by highlighting the educational, technical, and practical considerations the system seeks to address. 

First, the literature consistently supports the effectiveness of peer tutoring in higher education (Topping, 1996; Vygotsky, 1978). Despite its benefits, peer tutoring often remains difficult to implement because students struggle to find qualified tutors, evaluate their competency, and coordinate schedules that work for everyone involved. These logistical challenges reduce the accessibility and consistency of peer-assisted learning. 

Second, previous studies have established constraint satisfaction as an effective approach to solving scheduling problems (Even et al., 1976; Wren, 1996). While these techniques have been widely applied to institutional tasks such as class timetabling and resource allocation, they have seen limited use in student-centered applications that coordinate peer tutoring based on individual availability. 

Third, research on machine learning demonstrates that techniques such as TF-IDF vectorization, Support Vector Machines, and multi-label classification are effective for extracting structured information from unstructured text (Joachims, 1998; Sebastiani, 2002). In educational settings, these methods can assist with analyzing recommendation letters and written feedback, providing useful insights while leaving important decisions under human supervision. 

Finally, existing platforms address only parts of the overall problem. Systems such as Knack and Wyzant facilitate tutor matching but do not provide intelligent scheduling or machine 

learning-based document analysis. UniTime offers robust scheduling capabilities but is designed for institutional timetabling rather than peer-to-peer coordination. In addition, many commercial platforms rely on external data storage, which may raise privacy concerns for Philippine higher education institutions operating under the Data Privacy Act. 

Drawing from these findings, Acadia combines established approaches into a single platform tailored to the needs of Philippine colleges. It integrates machine-learning-assisted document analysis, constraint-based scheduling, subject-specific tutor ranking, and a privacy-first system architecture to address limitations identified in the literature. Rather than replacing human judgment, the platform uses machine learning to support decision-making, while administrators retain full control over tutor approval, scheduling, and overall system oversight. 

