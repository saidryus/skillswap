University of Cebu Pardo-Talisay Campus Department of Computer Studies

**Acadia**: An AI-Assisted Peer Tutoring Platform for Philippine Higher Education

## **TEAM ODYSSEY**

**Team Members:**

Niño Angelo C. Bacalso Seth Wilson B. Canencia Dwight James O. Dupit Kishelle Aibhe F. Garay Simone Dominique Makinano

## **CHAPTER II: REVIEW OF RELATED LITERATURE AND STUDIES**

## **Theoretical Background**

Four theoretical frameworks inform the design and evaluation of Acadia.

## **Technology Acceptance Model (TAM)**

Proposed by Fred Davis in 1989, the Technology Acceptance Model (TAM) suggests that the adoption of a new system is primarily influenced by two factors: perceived usefulness, which refers to the extent to which users believe a system will help them improve their performance, and perceived ease of use, which refers to how simple the system is to use. This framework guides the study's evaluation phase, particularly the assessment of system usability and user acceptance. Since Acadia relies on voluntary student participation, its success depends on whether students perceive the platform as both useful and easy to use within their academic activities. For this reason, TAM provides an appropriate foundation for evaluating the likelihood of student adoption.

## **Constraint Satisfaction Problem (CSP) Theory**

Constraint Satisfaction Problem (CSP) theory provides the foundation for the scheduling component of Acadia. A CSP is a type of computational problem in which a valid solution must satisfy multiple constraints simultaneously. Within the system, study sessions serve as the variables, available time slots serve as the domains, and scheduling restrictions such as user-managed availability, existing tutoring commitments, institutional holidays, and tutor availability limits serve as the constraints.

This framework supports an automated scheduling engine that identifies valid study session schedules by eliminating time slots that violate any constraints. Rather than requiring students to manually coordinate schedules, the system generates only those time slots that satisfy all scheduling requirements. The work of Shimon Even, Alon Itai, and Adi Shamir (1976) established that timetabling problems belong to a class of computationally complex problems, providing theoretical support for algorithmic scheduling approaches.

## **Social Constructivism**

Social Constructivism, developed by Lev Vygotsky in 1978, posits that learning is a product of social interaction and collaborative problem-solving. One of the main points of this theory is the Zone of Proximal Development (ZPD), the difference between what a learner has already mastered and what they can accomplish with scaffolding.

The educational basis of the peer tutoring model in Acadia is grounded in this theory. The platform helps students connect with other students who can assist them with their studies and with those who have demonstrated competence through faculty endorsement and proven tutoring performance. The system makes these connections easier to establish and implement through automated scheduling, video conferencing, and in-app messaging, creating opportunities for collaborative learning in line with the principles of Social Constructivism and the Zone of Proximal Development.

## **Supervised Machine Learning for Text Classification**

Supervised Machine Learning provides the theoretical foundation for Acadia's document understanding modules. In supervised learning, models are trained using labeled data so they can recognize patterns and classify new information based on what they have learned (Bishop, 2006). One of its most common applications is text classification, where documents are automatically assigned to predefined categories (Sebastiani, 2002).

In Acadia, supervised text classification is used in two areas. First, it analyzes faculty recommendation letters to identify recommended subjects, recommendation strength, and relevant soft skills. Second, it examines written tutor reviews to determine sentiment, teaching strengths, and areas for improvement. To accomplish this, the system uses TF-IDF vectorization to represent textual features and a Linear Support Vector Machine (SVM) for multi-label classification, both of which are widely recognized techniques in text classification research (Joachims, 1998).

The machine learning models are used solely to extract and organize information from text. They do not approve tutor applications, modify system rules, or make administrative decisions. Instead, the extracted information serves as decision support for administrators, who remain responsible for reviewing applications and making all final approval decisions. This approach follows the principles of human-in-the-loop AI, where machine learning assists rather than replaces human judgment (Amershi et al., 2019).

## **Related Literature**

## **Peer Tutoring Effectiveness in Higher Education**

A 2024 meta-analysis published in _Asia Pacific Education Researcher_ examined the impact of peer tutoring programs on student academic performance across multiple higher education institutions. The study found consistent positive effects on tutee performance, with outcomes influenced by intervention type, duration, and implementation method (Springer, 2024). In a related study, Nature Humanities & Social Sciences Communications (2025) reported that peer tutors who receive pedagogical training develop clearer communication strategies, more structured teaching approaches, and higher levels of student engagement, resulting in improved tutee satisfaction. A systematic review by Gehreke (2024) further confirmed that peer mentoring has positive effects on academic integration, emotional wellbeing, and students' sense of belonging in higher education institutions.

Collectively, these findings support the effectiveness of peer tutoring as an academic intervention. However, they also highlight that its success depends heavily on proper structure and accessibility, particularly in terms of coordination, tutor qualification assessment, and implementation.

## **University Timetabling and Constraint-Based Scheduling**

A 2023 comprehensive review of optimization techniques in university timetabling classified scheduling as a non-polynomial time (NP) combinatorial optimization problem and examined approaches such as constraint satisfaction, genetic algorithms, and hybrid methods (ResearchGate, 2023). The review concluded that constraint-based approaches remain among the most practical for generating feasible schedules under both hard and soft constraints.

A separate mixed-integer programming study (2023) demonstrated that combining initial feasible solution generation with local search improves the efficiency and quality of generated timetables in real-world university settings. In addition, a 2024 study on fair course scheduling applied constraint programming with fairness considerations, showing that CSP techniques can also incorporate equity-based objectives beyond basic feasibility (arXiv, 2024).

Although these studies focus on institutional timetabling, their underlying principles are directly applicable to peer-to-peer scheduling systems such as Acadia, where the same interval-based constraint logic is used to identify mutually available time slots from user-managed availability data.

## **Machine Learning for Document Understanding in Education**

Machine learning has become an increasingly important tool for processing and interpreting educational documents. One area that has seen significant progress is optical character recognition (OCR), which enables printed or scanned documents to be converted into machine-readable text. A 2022 study conducted at George Mason University demonstrated the potential of OCR for automating grade processing, achieving 86 percent accuracy in recognizing numerical grades (GMU Journal of Student Scholarship Research, 2022). More recently, a 2025 systematic review highlighted continued improvements in deep learning techniques for educational document recognition, further increasing the accuracy and reliability of OCR-based systems (Preprints.org, 2025).

Beyond OCR, machine learning techniques have also been widely applied to text classification tasks. Methods such as TF-IDF vectorization and Support Vector Machines (SVM) have consistently proven effective for categorizing educational documents, student feedback, and academic correspondence (Kotsiantis, 2007; Joachims, 1998). These approaches are particularly useful for multi-label classification, where a single document may belong to multiple categories at the same time. In the context of faculty recommendation letters, for example, one document may recommend a student for several subjects while also describing different skills and competencies.

Another established application of machine learning is sentiment analysis, which examines written feedback to identify opinions, strengths, and areas for improvement. Studies have shown that sentiment classification can complement numerical rating systems by providing richer insights from course evaluations and tutor reviews (Pang & Lee, 2008). Instead of relying solely on numerical scores, institutions can better understand user experiences through the analysis of written comments.

Acadia builds on these established techniques by applying machine learning to two key functions. The first is the analysis of faculty recommendation letters to identify recommended subjects, recommendation strength, and relevant soft skills. The second is the analysis of tutor reviews to extract sentiment, teaching strengths, and suggested areas for improvement. These models are intended only to organize and summarize information that would otherwise require manual review. Final decisions regarding tutor approval and competency evaluation remain under the authority of human administrators and the system's predefined scoring rules.

## **Educational Technology Adoption in Philippine Higher Education**

The World Bank (2022) reported that while most higher education institutions in the Philippines have adopted learning management systems, digital transformation remains largely concentrated on instructional delivery rather than administrative operations. A 2024 bibliometric analysis further confirmed that technology integration in Philippine higher education is primarily focused on classroom instruction rather than operational systems such as scheduling and student coordination (ResearchGate, 2024).

Similarly, a UNESCO background paper (2023) emphasized persistent gaps in access to context-appropriate digital tools and highlighted the need for locally developed systems that address institutional realities in developing countries.

Together, these studies support positioning Acadia as an operational academic support system rather than a content delivery platform, addressing gaps in tutor qualification understanding, scheduling coordination, and peer-learning infrastructure that existing systems do not fully cover.

## **Data Privacy and Minimization in Educational Systems**

Data minimization is a fundamental principle of modern privacy frameworks, including the Philippine Data Privacy Act of 2012 (RA 10173) and the European Union's General Data Protection Regulation (GDPR). It emphasizes collecting and processing only the personal information necessary to achieve a specific purpose. In educational technology, privacy plays an important role in user acceptance. Ifenthaler and Schumacher (2016) found that students are more willing to use learning analytics systems when they understand how their data is collected, used, and protected.

Acadia incorporates this principle throughout its design. Uploaded class schedule files are used only for schedule extraction and are automatically deleted from the server once processing is complete, preventing unnecessary storage of personal documents. Instead of requiring students to share their complete academic timetables, the system relies on user-confirmed availability when generating scheduling suggestions. In addition, Acadia is designed as an institution-embedded, on-premise platform, allowing student information to remain within the institution's own network rather than being stored by external service providers. By limiting data collection and retention to what is strictly necessary, the system supports effective scheduling while respecting student privacy and complying with established data protection principles.

## **Related Studies**

## **Study 1: Course Signals at Purdue University (Arnold & Pistilli, 2012)**

Arnold and Pistilli developed Course Signals at Purdue University as an early warning system that analyzed student behaviors, including attendance and classroom engagement, to identify those at risk of poor academic performance. The system generated automated alerts for both students and academic advisers, enabling timely intervention and contributing to improved course completion rates.

This study demonstrates how data-driven systems can support academic success through early identification and intervention. Acadia builds on this concept by shifting the focus from institutional intervention to peer-assisted learning. Instead of simply identifying students who may need support, the platform helps connect them with qualified peer tutors whose competencies have been verified through machine learning-assisted recommendation analysis. While Course Signals emphasizes institutional alerts and adviser involvement, Acadia extends the idea by facilitating timely peer-to-peer academic support.

## **Study 2: UniTime — University Timetabling System**

UniTime is an open-source academic scheduling system used by universities to generate class timetables that account for multiple constraints, such as room capacity, instructor availability, and enrollment conflicts. It applies constraint-based optimization techniques to produce feasible schedules from complex institutional data.

Relevance to Acadia: Acadia applies the same constraint satisfaction principles used in UniTime, but at a more granular, user-centered level. Instead of scheduling institutional course offerings using room and instructor data, Acadia cross-references individual user availability to generate mutually free time slots for peer tutoring sessions. While the underlying interval scheduling logic is similar, the application context shifts from institutional timetabling to privacy-respecting peer-to-peer coordination using only user-confirmed availability.

## **Study 3: Knack — Peer Tutoring Platform (University of Central Florida)**

Knack is a peer tutoring platform that connects university students with tutors who have previously excelled in the same courses. Tutor eligibility is verified through academic records, and students can book sessions through the platform.

Relevance to Acadia: Knack validates the effectiveness of peer-tutoring marketplaces that verify tutors using academic performance. However, Knack operates as a commercial third-party platform where student data is stored externally, it does not incorporate automated constraint-based scheduling, and its tutor verification relies on institution-maintained academic records rather than faculty endorsement. Acadia differs by: (1) being institution-embedded (no third-party data sharing), (2) using ML-powered recommendation letter understanding to extract structured information from faculty endorsements for administrator review, (3) implementing automated availability-based scheduling with holiday awareness, and (4) providing subject-specific competency scoring with fixed institutional weights for transparency and reproducibility.

## **Study 4: Wyzant — Online Tutoring Platform**

Wyzant is a commercial tutoring platform that connects students to professional tutors based on ratings and availability. It contains scheduling and post-session evaluation features.

Relevance to Acadia: Wyzant demonstrates the effectiveness of competency matching and tutor ranking based on feedback. Acadia adapts these ideas into a peer-to-peer educational setting, eliminates the monetary transaction, and adds: (1) ML-powered feedback understanding that extracts structured information from written reviews, (2) faculty recommendation letter understanding instead of self-declared qualifications, (3) constraint-based scheduling that automatically resolves conflicts, and (4) integrated video conferencing and in-app messaging for seamless session delivery.

## **Comparative Matrix / Competitors' Analysis**

| **Feature** | **Acadia (Proposed)** | **Google Classroom** | **Knack** | **Wyzant** | **UniTime** |
|---|---|---|---|---|---|
| Peer-to-peer tutoring platform | ✓ | ✗ | ✓ | ✗ (professional tutors) | ✗ |
| Constraint-based session scheduling | ✓ | ✗ | ✗ | ✗ | ✓ (institutional only) |
| Availability-based conflict detection | ✓ | ✗ | ✗ | ✗ | ✗ |
| ML-powered recommendation letter understanding | ✓ | ✗ | ✗ | ✗ | ✗ |
| Subject-specific competency ranking | ✓ | ✗ | Partial (GPA filter) | ✓ (ratings only) | ✗ |
| ML-powered feedback insights | ✓ | ✗ | ✗ | ✗ | ✗ |
| Curriculum-based subject eligibility | ✓ | ✗ | ✗ | ✗ | ✗ |
| Integrated video conferencing | ✓ | ✓ (Meet) | ✗ | ✓ | ✗ |
| In-app messaging | ✓ | ✓ | ✗ | ✓ | ✗ |
| Post-session rating system | ✓ | ✗ | ✓ | ✓ | ✗ |
| Holiday calendar awareness | ✓ | ✗ | ✗ | ✗ | ✗ |
| Learning resources sharing | ✓ | ✓ | ✗ | ✗ | ✗ |
| Tutor availability caps | ✓ | ✗ | ✗ | ✓ | ✗ |
| Session lifecycle (accept/reject) | ✓ | ✗ | ✗ | ✓ | ✗ |
| Privacy-first (institution-embedded) | ✓ | ✗ | ✗ | ✗ | ✓ |
| Designed for Philippine HEI context | ✓ | ✗ | ✗ | ✗ | ✗ |
| Free and self-hosted | ✓ | ✓ | ✗ | ✗ | ✓ |
| Session analytics/frequency tracking | ✓ | ✗ | ✗ | Partial | ✗ |
| Data minimization architecture | ✓ | ✗ | ✗ | ✗ | ✗ |

## **Key Differentiators of Acadia**

Acadia is distinguished from existing systems through the following features:

- Acadia integrates peer tutoring with machine learning-assisted recommendation letter analysis. Instead of relying solely on academic records or self-declared qualifications, the system analyzes faculty recommendation letters to identify recommended subjects, recommendation strength, and relevant soft skills. The extracted information supports the administrator during the review process, while all verification and approval decisions remain under human supervision.

- The platform uses a subject-specific competency ranking system to recommend tutors. Each tutor is evaluated only within the subject being searched using a transparent scoring formula based on student ratings (45%), faculty recommendations (15%), session completion rate (20%), and tutoring experience (20%), ensuring fair and consistent rankings.

- Acadia implements constraint-based scheduling using user-confirmed availability instead of requiring complete academic timetables. As an optional convenience feature, users may upload a class schedule for automatic availability extraction. Once processing is complete, the uploaded file is immediately deleted, and only the extracted availability is used to generate suggested meeting times, supporting the principle of data minimization.

- The system also includes machine learning-assisted feedback analysis, which examines written tutor reviews to identify teaching strengths, areas for improvement, and overall sentiment. These insights are displayed on tutor profiles to help students make more informed decisions when selecting a tutor.

- To support both face-to-face and online tutoring, the platform integrates Jitsi Meet for video conferencing and provides a Messenger-style in-app messaging system. Tutors and students can continue communicating throughout an active session, share meeting or recording links when needed, and conversations are automatically locked once the session has ended.

- Acadia is designed as a privacy-first, institution-embedded platform. Student information remains within the institution's network, and no third-party commercial service stores personal data. The system collects and retains only the information required for its intended functions, consistent with data minimization principles.

- The platform is tailored to the Philippine higher education environment. It supports curriculum-based subject eligibility using verified year level and semester information, considers Philippine holidays when generating schedules, and can be deployed across multiple departments while maintaining separate administrative scopes.

- Finally, Acadia clearly separates machine learning from decision-making. Machine learning models are responsible only for extracting and classifying information, while scoring formulas enforce business rules and administrators retain full authority over tutor approval, scheduling decisions, and overall system oversight. This separation promotes transparency, accountability, and trust in the platform.

## **Legal Basis**

The development and deployment of Acadia is guided by Philippine laws and regulations governing data privacy, cybersecurity, electronic documents, and higher education student services.

## **Republic Act No. 10173 — Data Privacy Act of 2012**

The Data Privacy Act of 2012 establishes the legal framework for protecting personal information in information and communications systems across both the public and private sectors. It requires organizations that collect and process personal data to implement appropriate physical, technical, and organizational safeguards against unauthorized access, disclosure, or misuse.

Acadia processes personal information such as student identification numbers, academic progression data, and tutoring session records. To comply with the requirements of the Data Privacy Act, the system implements JWT-based authentication, role-based access control, and data minimization principles. As part of this approach, uploaded class schedule files are used only to generate availability suggestions and are automatically deleted from the server after text extraction. Only the information necessary for the platform's core functions is collected and processed. Student data remains confidential and is accessible only to authorized administrators and the respective users. In addition, Acadia's institution-embedded architecture ensures that student information remains within the institution's network rather than being stored by third-party service providers.

## **Republic Act No. 10175 — Cybercrime Prevention Act of 2012**

The Cybercrime Prevention Act of 2012 covers offenses committed against and through computer systems, including illegal access, data interference, and system misuse. This law underscores the need for adequate security measures to protect digital platforms from unauthorized access and data breaches.

Acadia addresses these requirements through security mechanisms such as password hashing (bcrypt), progressive account lockout, server-side input validation, and secure API authentication. The system is designed to protect the integrity of student data and prevent unauthorized account access, including impersonation through falsified or compromised user accounts.

## **Republic Act No. 8792 — Electronic Commerce Act of 2000**

The Electronic Commerce Act of 2000 provides legal recognition for electronic documents and electronic data messages, granting them the same legal status as paper-based records under specified conditions.

This provision is relevant to Acadia's use of digitally uploaded recommendation letters as part of the tutor application process. The system processes uploaded documents through OCR and ML-powered understanding, extracting structured information for administrative review. The administrator performs the actual verification and approval, using the ML analysis as an assistive tool to ensure thoroughness and accuracy.

## **CHED Memorandum Order No. 9, Series of 2013 — Enhanced Policies and Guidelines on Student Affairs and Services**

CHED Memorandum Order No. 9, s. 2013 mandates higher education institutions to provide student development and support services, including academic assistance programs such as tutorials.

Acadia aligns with this directive by providing a structured, technology-enabled peer tutoring system that supports academic assistance within the institution. It operationalizes tutorial services by formalizing peer-to-peer academic support into a coordinated system with verified tutors, automated scheduling, and ML-assisted quality assurance, aligned with CHED's student welfare and development objectives.

## **Synthesis**

The literature and studies reviewed provide the foundation for the development of Acadia by highlighting the educational, technical, and practical considerations that the system seeks to address.

First, the literature consistently supports the effectiveness of peer tutoring in higher education (Topping, 1996; Vygotsky, 1978). Despite its benefits, peer tutoring often remains difficult to implement because students struggle to find qualified tutors, evaluate their competency, and coordinate schedules that work for everyone involved. These logistical challenges reduce the accessibility and consistency of peer-assisted learning.

Second, previous studies have established constraint satisfaction as an effective approach to solving scheduling problems (Even et al., 1976; Wren, 1996). While these techniques have been widely applied to institutional tasks such as class timetabling and resource allocation, they have seen limited use in student-centered applications that coordinate peer tutoring based on individual availability.

Third, research on machine learning demonstrates that techniques such as TF-IDF vectorization, Support Vector Machines, and multi-label classification are effective for extracting structured information from unstructured text (Joachims, 1998; Sebastiani, 2002). In educational settings, these methods can assist with analyzing recommendation letters and written feedback, providing useful insights while leaving important decisions under human supervision.

Finally, existing platforms address only parts of the overall problem. Systems such as Knack and Wyzant facilitate tutor matching but do not provide intelligent scheduling or machine learning-based document analysis. UniTime offers robust scheduling capabilities but is designed for institutional timetabling rather than peer-to-peer coordination. In addition, many commercial platforms rely on external data storage, which may raise privacy concerns for Philippine higher education institutions operating under the Data Privacy Act.

Drawing from these findings, Acadia combines established approaches into a single platform tailored to the needs of Philippine colleges. It integrates machine learning-assisted document analysis, constraint-based scheduling, subject-specific tutor ranking, and a privacy-first system architecture to address the limitations identified in the literature. Rather than replacing human judgment, the platform uses machine learning to support decision-making, while administrators retain full control over tutor approval, scheduling, and overall system oversight.
