University of Cebu Pardo-Talisay Campus Department of Computer Studies 

**SkillSwap** : Verified Tutors, Automated Scheduling — A Peer-to-Peer Learning Platform for Philippine Colleges 

**TEAM ODYSSEY Team Members:** 

Niño Angelo C. Bacalso Seth Wilson B. Canencia Dwight James O. Dupit Kishelle Aibhe F. Garay Simone Dominique Makinano 

## **CHAPTER II: REVIEW OF RELATED LITERATURE AND STUDIES** 

## **Theoretical Background** 

Three theoretical frameworks inform the design and evaluation of SkillSwap. 

## **Technology Acceptance Model (TAM)** 

Proposed by Fred Davis in 1989, the Technology Acceptance Model (TAM) suggested that the adoption of a new system is primarily influenced by two factors: perceived usefulness, which refers to the extent to which users believe a system will help them improve their performance, and perceived ease of use, which refers to how simple the system is to use. This framework guides the study's evaluation phase, particularly the assessment of system usability and user acceptance. Since SkillSwap relies on voluntary student participation, its success depends on whether students perceive the platform as both useful and easy to use within their academic activities. For this reason, TAM provides an appropriate foundation for evaluating the likelihood of student adoption. 

## **Constraint Satisfaction Problem (CSP) Theory** 

Constraint Satisfaction Problem (CSP) theory provides the foundation for the scheduling component of SkillSwap. A CSP is a type of computational problem in which a valid solution must satisfy multiple constraints simultaneously. Within the system, study sessions serve as the variables, available time slots serve as the domains, and scheduling restrictions such as class schedules, existing tutoring commitments, and tutor availability limits serve as the constraints. 

This framework supports an automated scheduling engine that identifies valid study session schedules by eliminating time slots that violate any constraints. Rather than requiring students to manually compare schedules, the system generates only those time slots that satisfy all scheduling requirements. The work of Shimon Even, Alon Itai, and Adi Shamir (1976) established that timetabling problems belong to a class of computationally complex problems, providing theoretical support for algorithmic scheduling approaches. 

## **Social Constructivism** 

Social Constructivism, developed by Lev Vygotsky in 1978, posits that learning is a product of social interaction and collaborative problem-solving. One of the main points of 

this theory is the Zone of Proximal Development (ZPD), the difference between what a learner has already mastered and what they can accomplish with scaffolding. 

The educational basis of the peer tutoring model in SkillSwap is the learning styles theory. The platform helps students connect with other students who can help them with their studies and with those who have already demonstrated competence in the subject through proven academic work. The system makes these connections easier to plan and implement, creating opportunities for collaborative learning in line with the principles of Social Constructivism and the Zone of Proximal Development. 

## **Related Literature** 

## **Peer Tutoring Effectiveness in Higher Education** 

A 2024 meta-analysis published in _Asia Pacific Education Researcher_ examined the impact of peer tutoring programs on student academic performance across multiple higher education institutions. The study found consistent positive effects on tutee performance, with outcomes influenced by intervention type, duration, and implementation method (Springer, 2024). In a related study, Nature Humanities & Social Sciences Communications (2025) reported that peer tutors who receive pedagogical training develop clearer communication strategies, more structured teaching approaches, and higher levels of student engagement, resulting in improved tutee satisfaction. A systematic review by Gehreke (2024) further confirmed that peer mentoring has positive effects on academic integration, emotional wellbeing, and students’ sense of belonging in higher education institutions. 

Collectively, these findings support the effectiveness of peer tutoring as an academic intervention. However, they also highlight that its success depends heavily on proper structure and accessibility, particularly in terms of coordination and implementation. 

## **University Timetabling and Constraint-Based Scheduling** 

A 2023 comprehensive review of optimization techniques in university timetabling classified scheduling as a non-polynomial time (NP) combinatorial optimization problem and examined approaches such as constraint satisfaction, genetic algorithms, and hybrid methods (ResearchGate, 2023). The review concluded that constraint-based approaches remain among the most practical for generating feasible schedules under both hard and soft constraints. 

A separate mixed-integer programming study (2023) demonstrated that combining initial feasible solution generation with local search improves the efficiency and quality of generated timetables in real-world university settings. In addition, a 2024 study on fair course scheduling applied constraint programming with fairness considerations, showing that CSP techniques can also incorporate equity-based objectives beyond basic feasibility (arXiv, 2024). 

Although these studies focus on institutional timetabling, their underlying principles are directly applicable to peer-to-peer scheduling systems such as SkillSwap, where the same constraint satisfaction logic is used to identify mutually available time slots. 

## **OCR and Automated Document Processing in Education** 

A 2022 study at George Mason University explored the usage of optical character recognition (OCR) to automate grade entry in online systems. The system's numerical grade recognition accuracy was 86 percent, and the name recognition accuracy was 62 percent, showcasing the system's potential and limitations for use in academic document processing (GMU Journal of Student Scholarship Research, 2022). 

The 2025 systematic review of OCR-based educational assessment systems also noted significant advances in deep learning methods for document recognition in educational environments (Preprints.org, 2025). Furthermore, Goedmo (2025) highlighted that the adoption of OCR-based automation in college administration led to substantial efficiency gains, streamlining processing times and saving considerable labor in admissions and records management. 

The results confirm OCR's potential for grade slip verification in SkillSwap and that manual review is advisable when input quality is poor or when there is uncertainty. 

## **Educational Technology Adoption in Philippine Higher Education** 

The World Bank (2022) reported that while most higher education institutions in the Philippines have adopted learning management systems, digital transformation remains largely concentrated on instructional delivery rather than administrative operations. A 2024 bibliometric analysis further confirmed that technology integration in Philippine higher education is primarily focused on classroom instruction rather than operational systems such as scheduling and student coordination (ResearchGate, 2024). 

Similarly, a UNESCO background paper (2023) emphasized persistent gaps in access to context-appropriate digital tools and highlighted the need for locally developed systems that address institutional realities in developing countries. 

Together, these studies support positioning SkillSwap as an operational academic support system rather than a content delivery platform, addressing gaps in coordination, scheduling, and peer-learning infrastructure that existing systems do not fully cover. 

## **Related Studies** 

## **Study 1: Course Signals at Purdue University (Arnold & Pistilli, 2012)** 

At Purdue University, Arnold and Pistilli created Course Signals, an early warning system that relied on students' classroom behavior, such as attendance and engagement, to identify students who might be struggling or at risk of poor performance. Automated alerts were created in the system, and both students and academic advisers were notified, resulting in a measurable increase in course completion rates. 

Relevance to SkillSwap: Course Signals has been developed to assist with institutional-level risk detection, but SkillSwap takes it further by allowing for peer-level intervention. The system not only recognizes at-risk students but also links them with qualified peer tutors. Both systems are based on the concept that early identification and intervention ultimately improve academic outcomes, but they differ in their approaches to intervention. 

## **Study 2: UniTime — University Timetabling System** 

UniTime is an open-source academic scheduling system used by universities to generate class timetables that account for multiple constraints, such as room capacity, instructor availability, and enrollment conflicts. It applies constraint-based optimization techniques to produce feasible schedules from complex institutional data. 

Relevance to SkillSwap: SkillSwap applies the same constraint satisfaction principles used in UniTime, but at a more granular level. Instead of scheduling institutional course offerings, it cross-references individual student schedules to generate mutually available study sessions. While the underlying logic is similar, the application context shifts from institutional timetabling to peer-to-peer coordination. 

## **Study 3: Knack — Peer Tutoring Platform (University of Central Florida)** 

Knack is a peer tutoring platform that connects university students with tutors who have previously excelled in the same courses. Tutor eligibility is verified through academic records, and students can book sessions through the platform. 

Relevance to SkillSwap: Knack validates the effectiveness of peer-tutoring marketplaces that rely on academic performance to verify tutors. However, it operates as a commercial platform primarily designed for the U.S. context and does not incorporate automated constraint-based scheduling or timetable conflict resolution. SkillSwap builds on this model by introducing scheduling intelligence and adapting the system to the constraints of Philippine higher education institutions. 

## **Study 4: Wyzant — Online Tutoring Platform** 

Wyzant is a commercial tutoring platform that connects students to professional tutors of their subject based on ratings and availability. It contains scheduling and post-session evaluation, among other things. 

Relevance to SkillSwap: Wyzant models assess the effectiveness of competency matching and tutor ranking based on feedback. SkillSwap repurposes these ideas into a peer-to-peer educational setting, eliminates the monetary transaction from the equation, and includes constraint-based scheduling to account for university class timetables, which Wyzant's design does not. 

## **Comparative Matrix / Competitors' Analysis** 

|**Feature**|**SkillSwap**<br>**(Proposed)**|**Google**<br>**Classroo**<br>**m**|**Knack**|**Wyzant**|**UniTime**|
|---|---|---|---|---|---|
|Peer-to-peer<br>tutoring<br>platform/marketplace|✓|✗|✓|✗<br>(professional<br>tutors)|✗|



||**Feature**<br>**SkillSwap**<br>**(Proposed)**<br>**Google**<br>**Classroo**<br>**m**<br>**Knack**<br>**Wyzant**<br>**UniTime**<br>Constraint-based<br>session scheduling<br>✓<br>✗<br>✗<br>✗<br>✓<br>(institutional<br>only)<br>Cross-references<br>student timetables<br>✓<br>✗<br>✗<br>✗<br>✗<br>(uses<br>room/course<br>data)<br>Competency-weighted<br>tutor ranking<br>✓<br>✗<br>Partial (GPA<br>filter)<br>✓<br>(ratings<br>only)<br>✗<br>Grade verification via<br>OCR<br>✓<br>✗<br>✗<br>✗<br>✗<br>Post-session<br>rating<br>system<br>✓<br>✗<br>✓<br>✓<br>✗<br>Tutor availability caps<br>✓<br>✗<br>✗<br>✓<br>✗<br>Session<br>lifecycle<br>(accept/reject)<br>✓<br>✗<br>✗<br>✓<br>✗<br>Visual<br>timetable<br>comparison<br>✓<br>✗<br>✗<br>✗<br>✗<br>Designed<br>for<br>Philippine HEI context<br>✓<br>✗<br>✗<br>✗<br>✗<br>Free and self-hosted<br>✓<br>✓<br>✗<br>✗<br>✓<br>Notification system<br>✓<br>✓<br>✓<br>✓<br>✗<br>Session<br>analytics/frequency<br>tracking<br>✓<br>✗<br>✗<br>Partial<br>✗|
|---|---|



## **Key Differentiators of SkillSwap** 

- SkillSwap is distinguished from existing systems through the following features: 

- The system integrates peer tutoring with constraint-based scheduling, which cross-references individual students' timetables to automatically generate mutually available study sessions. 

- It incorporates optical character recognition (OCR) to support automated verification of academic grades during the tutor application process, reducing manual validation workload. 

- The system is designed specifically for the Philippine academic context, including the 1.0–5.0 grading scale and common scheduling structures used in higher education institutions, with initial deployment focused on the College of Computer Studies of the University of Cebu South Campus. 

- It provides a side-by-side visual timetable comparison during the booking process, allowing users to directly identify overlapping free time slots between tutors and tutees. 

- The platform is designed as a free and self-hosted system, making it accessible to institutions and departments with limited information technology budgets and infrastructure. 

## **Legal Basis** 

The development and deployment of SkillSwap is guided by Philippine laws and regulations governing data privacy, cybersecurity, electronic documents, and higher education student services. 

## **Republic Act No. 10173 — Data Privacy Act of 2012** 

The Data Privacy Act of 2012 establishes the legal framework for protecting personal information in information and communications systems across both the public and private sectors. This requires controllers to safeguard personal data from unauthorized access or processing using appropriate physical, technical, and organizational tools. 

SkillSwap processes personal and sensitive student information, including student identification numbers, academic grades, class schedules, and session activity logs. In compliance with this law, the system implements JWT-based authentication, role-based access control, and data minimization principles, ensuring that only data necessary for system 

functionality is collected and processed. Student data is strictly confidential, accessible only to authorized administrators and the respective students, and never shared externally. 

## **Republic Act No. 10175 — Cybercrime Prevention Act of 2012** 

The Cybercrime Prevention Act of 2012 covers offenses committed against and through computer systems, including illegal access, data interference, and system misuse. This law underscores the need for adequate security measures to protect digital platforms from unauthorized access and data breaches. 

SkillSwap addresses these requirements through security mechanisms such as password hashing (bcrypt), server-side input validation, and secure API authentication. The system is designed to protect the integrity of student data and prevent unauthorized account access, including impersonation through falsified or compromised user accounts. 

## **Republic Act No. 8792 — Electronic Commerce Act of 2000** 

The Electronic Commerce Act of 2000 provides legal recognition for electronic documents and electronic data messages, granting them the same legal status as paper-based records under specified conditions. 

This provision is relevant to SkillSwap’s use of digitally uploaded grade slips as part of the tutor verification process. The system stores original uploaded documents and extracts relevant data using OCR, while preserving file integrity and requiring administrative review as an additional validation layer to ensure authenticity and accuracy. 

## **CHED Memorandum Order No. 9, Series of 2013 — Enhanced Policies and Guidelines on Student Affairs and Services** 

CHED Memorandum Order No. 9, s. 2013 mandates higher education institutions to provide student development and support services, including academic assistance programs such as tutorials. 

SkillSwap aligns with this directive by providing a structured, technology-enabled peer tutoring system that supports academic assistance within the institution. 

It operationalizes tutorial services by formalizing peer-to-peer academic support into a coordinated system aligned with CHED’s student welfare and development objectives. 

## **Synthesis** 

The literature and studies reviewed establish three main foundations for SkillSwap. 

First, peer tutoring has been consistently shown to be effective in higher education (Topping, 1996; Vygotsky, 1978). However, its implementation is often limited by logistical challenges, particularly the difficulty of matching qualified tutors with learners and coordinating mutually available schedules. 

Second, constraint satisfaction techniques are well established as effective approaches for solving scheduling problems (Even et al., 1976; Wren, 1996). However, their application has largely been confined to institutional contexts such as class timetabling and resource allocation, rather than peer-to-peer or student-centered systems. 

Third, existing related systems address only specific aspects of the overall problem. Tutoring platforms such as Knack and Wyzant focus on matching learners with tutors, while systems such as UniTime focus on institutional scheduling. In addition, established models of technology adoption (Davis, 1989) explain how users evaluate and accept such systems. Despite these developments, there is no single integrated system that combines peer tutoring, constraint-based scheduling, and automated verification within a unified platform tailored to Philippine university contexts, particularly at institutions such as the College of Computer Studies at the University of Cebu South Campus. 

SkillSwap addresses this gap by integrating established scheduling principles with competency-based tutor matching and OCR-assisted verification into a single system. Rather than introducing new theoretical concepts, it applies existing methods through a unified, localized implementation tailored to the operational realities of Philippine higher education. 

