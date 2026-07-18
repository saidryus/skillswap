## **CHAPTER 3: DESIGN AND METHODOLOGY**

## **Research Design**

This study employs a qualitative research design to evaluate the usability and effectiveness of the Acadia platform from the perspective of its intended users. A qualitative approach is appropriate because it enables researchers to gather detailed insights into users' experiences, perceptions, and interactions with the system (Creswell & Creswell, 2018). Through open-ended feedback and structured observation, the study seeks to identify usability issues, understand how users interact with the platform, and collect recommendations for improvement based on actual system use.

This research does not aim to test hypotheses or establish cause-and-effect relationships. Instead, it focuses on describing and interpreting user experiences with the developed system within a specific educational setting. The findings will be used to assess the platform's usability and determine whether it effectively supports peer-assisted learning and scheduling study sessions among students.

## **Method**

This study follows a qualitative research approach within a design-and-development context. Using the Agile Software Development methodology, the researchers designed, developed, and evaluated Acadia, a web-based peer tutoring platform. The system was developed through iterative cycles, allowing features to be refined through testing and feedback throughout the process.

The evaluation focuses on understanding user experiences and perceptions after interaction with the platform. Data are collected through in-depth user feedback, direct observation, and open-ended written responses. In-depth feedback sessions allow participants to describe usability experiences and views on the platform's usefulness. Direct observation enables the researchers to document how participants interact with the system, including navigation behavior, task completion patterns, and points of difficulty or hesitation. Open-ended written feedback allows participants to identify strengths, weaknesses, and potential improvements based on their experience.

Braun and Clarke (2006) proposed a framework for analysis that is collected and analyzed using the six-phase thematic approach. This method enables the researchers to identify recurring patterns, themes, and insights related to system usability, user satisfaction, and the overall effectiveness of Acadia as a peer tutoring and scheduling platform.

## **Flow of the Study**

| **Phase** | **Activities** |
|---|---|
| **Phase 1: Preparation and Planning (2–3 weeks)** | • **Literature Review:** Review existing literature and related studies on peer tutoring, constraint-based scheduling, educational technology adoption, and student support systems in higher education. The findings will be used to establish the study's theoretical and conceptual foundations.<br>• **System Development:** Design, develop, and refine the Acadia platform using the MERN stack and Agile Software Development methodology. Core features will be implemented and tested through iterative development cycles.<br>• **Instrument Development:** Develop the data collection instruments, including guided open-ended interview questions, observation protocols, and user feedback forms, to support the qualitative evaluation of the system.<br>• **Pilot Testing:** Conduct pilot testing of the research instruments with two to three students who are not included in the actual study participants. The feedback gathered during this phase will be used to improve the clarity, relevance, and usability of the instruments before data collection begins. |
| **Phase 2: Participant Recruitment and Orientation (1–2 weeks)** | • **Participant Selection:** Select participants through purposive sampling from the College of Computer Studies, including students who will serve as tutors, students who will act as tutees, and designated administrators who will interact with the system.<br>• **Consent Acquisition:** Obtain informed consent from all participants prior to their involvement in the study. Participants are already informed of the study's purpose, procedures, and ethical considerations, including the confidentiality of their responses.<br>• **System Introduction:** Orient participants to the Acadia platform by explaining its purpose, key features, and testing procedures. Login credentials and instructions for accessing the system will be provided during this phase.<br>• **Account Preparation:** Prepare and configure participant accounts with the necessary test data, including sample schedules, course information, and user roles required for the evaluation activities. |
| **Phase 3: Data Collection (2–3 weeks)** | • **Platform Testing:** Facilitate participant interaction with the Acadia platform by guiding them through its core functionalities, including tutor search, session booking, tutor application, and administrative management tasks.<br>• **Direct Observation:** Observe participants while they use the system and document their interactions, including task completion behavior, navigation patterns, points of hesitation, and any difficulties encountered during use.<br>• **User Feedback Collection:** Gather detailed feedback through guided open-ended questions that explore participants' perceptions of the system's usability, usefulness, functionality, and overall user experience.<br>• **Written Feedback:** Distribute open-ended feedback forms to allow participants to provide additional comments, reflections, and suggestions for improving the platform beyond those discussed during the feedback session. |
| **Phase 4: Analysis and Reporting (2–3 weeks)** | • **Data Organization:** Compile and systematically organize all collected data, including participant responses, observation notes, and written feedback, to prepare them for analysis.<br>• **Theme Identification:** Analyze the collected data using Braun and Clarke's (2006) six-phase thematic analysis to identify recurring patterns, themes, and meaningful insights related to system usability and user experience.<br>• **Report Preparation:** Synthesize the identified themes into a structured report that presents key findings, interpretations, and recommendations for system improvement.<br>• **Member Checking:** Conduct member checking by presenting the interpreted themes to selected participants to validate accuracy and ensure that the findings reflect their actual experiences. |

## **Research Environment**

**[Panel 2 — Multi-university]** The study is conducted within the College of Computer Studies (CCS) of the University of Cebu Pardo-Talisay Campus. The CCS was selected as the research environment for the following reasons:

- Students in computing-related programs are generally more technically literate and familiar with web-based applications, which reduces potential barriers to system adoption and interaction.

- The curriculum includes computationally intensive subjects such as data structures, database management, and web development, where peer tutoring has been shown to be particularly effective.

- The department maintains structured academic scheduling data that supports system testing. **[Panel 3 — Show available slots directly]** Students may optionally upload a class schedule to generate suggested availability; however, the uploaded file is deleted immediately after processing and is never used by the scheduling engine. The scheduler operates exclusively on user-confirmed availability to detect session conflicts.

The Acadia platform is deployed in a controlled testing environment accessible to participants during the evaluation phase. The system is built using the MERN stack: the backend is developed with Node.js (Express.js) and MongoDB, the frontend with React.js, Vite, Tailwind CSS, and Framer Motion. OCR text extraction uses Tesseract.js. Two Python Flask microservices handle ML inference: the recommendation letter service (port 5002) and the tutor feedback service (port 5003). Real-time in-session messaging is powered by Socket.io, enabling participants to access the full platform within the institutional setting.

## **Respondents**

The study employs purposive sampling to select ten (10) participants (n = 10) who represent the target users of the Acadia system. Participants are drawn from the College of Computer Studies and include the following groups:

- Students who have experienced the need for academic assistance from peers (potential tutees)

- Students with strong academic performance in IT-related subjects who are willing to serve as peer tutors (potential tutors)

- Faculty members or department staff involved in academic coordination and administrative processes (administrators)

## **Inclusion Criteria**

Participants must meet the following requirements:

- Currently enrolled in or employed by the College of Computer Studies

- Active student or staff status at the time of data collection

- Willingness to participate in system testing and provide informed feedback

## **Exclusion Criteria**

The following individuals are excluded from the study:

- Students currently on leave of absence

- Students who have not completed at least one full academic semester, as they would have had insufficient exposure to the platform's core features during testing

## **Research Instrument**

The primary research instrument is a researcher-developed survey questionnaire administered digitally through Google Forms. The questionnaire consists of open-ended questions designed to elicit detailed and descriptive feedback regarding participants' experiences using the Acadia platform.

The specific survey questions will be developed following the design hearing and will be subjected to validation through expert review by the research adviser prior to administration.

The survey will be distributed digitally to participants through a Google Forms link shared via Facebook Messenger after the system testing phase.

## **Observation Protocol**

In addition to the survey questionnaire, the researchers will use a structured observation protocol during testing sessions to document user interaction with the system. The following aspects will be observed:

- Task completion outcomes (successful, completed with difficulty, or failed)

- Instances of hesitation, confusion, or error during system use

- Verbal comments or reactions expressed during interaction

- Navigation patterns and feature discovery behavior

All instruments will undergo validation through expert review by the research adviser prior to data collection.

## **Research Procedure**

### 1. Preparation Phase (Weeks 1–2)

- Finalize the development of the Acadia system and deploy it to a controlled testing environment.

- Prepare test accounts for admin, tutor, and tutee roles with pre-loaded schedules and relevant data.

- Develop the survey questionnaire and observation protocol.

- Validate all research instruments through expert review by the research adviser.

### 2. Orientation Phase (Week 3)

- Brief respondents on the purpose of the study, system overview, and testing procedures.

- Ensure all participants provide informed consent before taking part.

- Distribute login credentials and assign corresponding user roles.

### 3. Testing Phase (Weeks 3–4)

- Respondents complete assigned tasks independently using the system.

- **[Panel 1 — Happy path booking / Panel 1 — Recommendation letters / Panel 2 — ML instead of rule-based / Panel 2 — AI checks fake documents / Panel 3 — Show available slots / Panel 3 — Video + messaging / Panel 1 — Dedicated resources / Panel 3 — Analytics]** Tasks include logging in, browsing curriculum-eligible subjects, finding tutors ranked by competency score (weighted: student ratings 45%, faculty recommendation score 15%, session completion rate 20%, tutoring experience 20%), booking sessions through calendar-based conflict-free slot selection, submitting post-session ratings and written feedback, **[Panel 1 — Dedicated resources section]** browsing course learning materials, and viewing personal tutoring analytics (tutee role); uploading a faculty recommendation letter for tutor application, reviewing and responding to session requests, managing weekly availability, **[Panel 1 — Dedicated resources section]** uploading course materials, joining video conferencing sessions via Jitsi Meet and sharing external recording links through the in-session chat (tutor role); and managing user accounts, reviewing tutor applications with ML analysis reports and confidence scores, and monitoring session analytics (admin role).

- Researchers observe each participant using a structured observation protocol, documenting behavior, hesitation points, navigation patterns, and verbal reactions.

### 4. Data Collection Phase (Week 4)

- After testing, the Google Forms survey link is distributed to participants via Facebook Messenger.

- Participants respond to open-ended questions regarding their system experience at their own convenience.

### 5. Analysis Phase (Week 5)

- Compile and organize all survey responses and observation notes.

- Conduct thematic analysis following Braun and Clarke's (2006) six-phase framework.

- Document findings, themes, and recommendations.

## **Data Gathering**

Data are collected using two qualitative methods:

- **[Panel 3 — UI/UX]** **Survey Questionnaire (Google Forms):** A digital questionnaire consisting of open-ended questions administered to participants via Facebook Messenger after the testing phase. This instrument captures participants' perceptions, experiences, and suggestions regarding the Acadia system.

- **Direct Observation:** Researchers observe participants during system interaction using a structured observation protocol. This method captures behavioral data, including hesitation points, confusion, navigation patterns, and task completion behavior.

## **Treatment of Data**

All qualitative data is analyzed using **Braun and Clarke's (2006) Six-Phase Thematic Analysis**:

| **Phase** | **Activity** |
|---|---|
| Phase 1: Familiarization | Researchers read and re-read all survey responses, observation notes, and written feedback to become familiar with the data. Initial impressions are recorded to capture early insights, recurring ideas, and notable patterns that emerge during the review process. |
| Phase 2: Generating Initial Codes | All data are systematically coded by identifying and labeling significant features across the entire dataset. This process involves assigning meaningful codes to relevant segments of survey responses, observation notes, and written feedback that relate to the research objectives. |
| Phase 3: Searching for Themes | Codes are collated into potential themes by grouping related patterns across the dataset. All data extracts relevant to each identified theme are gathered and organized to support further analysis and interpretation. |
| Phase 4: Reviewing Themes | Identified themes are reviewed against the coded extracts and the entire dataset to ensure consistency and accuracy. Themes are refined, merged, or separated as necessary to better reflect the patterns present in the data. |
| Phase 5: Defining and Naming Themes | Each theme is clearly defined by identifying what it captures in relation to the dataset. Concise and descriptive names are assigned to each theme to accurately reflect their meaning and scope within the analysis. |
| Phase 6: Producing the Report | Representative data extracts are selected to support each identified theme. The analysis is then related back to the research questions and the existing literature to ensure that the findings are properly contextualized and aligned with the study's objectives. |

## **Trustworthiness Criteria (Lincoln & Guba, 1985)**

| **Criterion** | **Strategy** |
|---|---|
| **Credibility** | Triangulation is employed by comparing findings from survey responses and direct observation to ensure consistency and strengthen the credibility of the results. Member checking is also conducted by presenting the interpreted themes to selected participants for verification, ensuring that the findings accurately reflect their actual experiences. |
| **Transferability** | This study employs thick description to detail the research context, participants' backgrounds, and core findings, providing readers with a rich understanding of the study environment and situational conditions. This allows readers to better understand the research setting and assess the transferability or applicability of the findings to similar contexts. |
| **Dependability** | To ensure transparency in data interpretation and final findings, an audit trail tracks all research decisions, coding iterations, and theme development throughout the analysis. |
| **Confirmability** | Reflexive journaling is conducted by the researchers to record reflections, assumptions, and decision-making processes throughout the study. In addition, peer debriefing is carried out with the research adviser to review interpretations, challenge assumptions, and strengthen the credibility of the findings. |

## **Ethical Considerations**

The conduct of this study adheres to established ethical standards for research involving human participants, guided by Philippine data privacy laws, cybersecurity regulations, and general principles of research ethics.

## **Informed Consent and Voluntary Participation**

All participants are briefed on the study's purpose, procedures, and data collection methods prior to participation. Prior to the commencement of testing, written informed consent is secured from each participant. Participation remains entirely voluntary, with individuals explicitly notified of their right to withdraw at any stage of the study without consequence. No academic incentives or penalties are associated with participation or non-participation. Participants may also skip any survey question they are not comfortable answering.

## **Data Privacy and Confidentiality**

In compliance with Republic Act No. 10173 (Data Privacy Act of 2012), all data collected during the study, including survey responses, observation notes, and system interaction data, are treated as strictly confidential. Participants are assigned pseudonyms (e.g., Participant 1, Participant 2) in all documentation and reporting to protect their identities. Access to raw data is restricted to the researchers and the research adviser only. All data are securely stored, used solely for research purposes, and not shared with any external parties. The system also applies data minimization principles by collecting only information necessary for its intended functionality.

## **System Security**

**[Panel 2 — AI checks fake documents]** In accordance with Republic Act No. 10175 (Cybercrime Prevention Act of 2012), the Acadia platform implements security measures to protect participant data during the testing phase. These include password hashing (bcrypt), JWT-based authentication, role-based access control, AES-256-CBC file encryption at rest for uploaded documents, server-side input validation, a document access re-authentication gate with progressive lockout (3 failed attempts results in a 3-hour lockout), a document audit log that records every view and deletion action with administrator identity and timestamp, and PII redaction of OCR-extracted text before database storage (phone numbers, email addresses, physical addresses, and government ID numbers are stripped from stored OCR text; the student school ID number is intentionally preserved in the stored text to allow administrator verification).

## **Electronic Document Integrity**

**[Panel 1 — Recommendation letters / Panel 2 — AI checks documents / Panel 2 — ML instead of rule-based]** Consistent with Republic Act No. 8792 (Electronic Commerce Act of 2000), electronically uploaded documents such as faculty recommendation letters are treated as valid digital records. Original uploaded files are stored encrypted at rest and are deleted from the server either upon administrative decision or automatically after a configurable retention period (default: 30 days) via a document expiry scheduler. OCR-extracted text is analyzed through a three-tier pipeline: the recommendation letter ML service (TF-IDF + Linear SVM + Logistic Regression) is tried first; if unavailable, the system falls back to an LLM (OpenAI GPT-4o-mini) if configured; if neither is available, rule-based keyword matching is used. This graceful fallback architecture ensures the platform remains functional regardless of ML service availability. Administrative verification is always required before any approval decision is made.

## **Institutional Alignment**

**[Panel 2 — Multi-university]** The study aligns with CHED Memorandum Order No. 9, Series of 2013, which mandates higher education institutions to provide student development and support services, including academic assistance programs. Acadia operationalizes this mandate by providing a structured peer tutoring system, and this study evaluates its effectiveness in supporting institutional student welfare objectives.

## **No Harm and Beneficence**

The study does not involve deception, sensitive psychological procedures, or activities that expose participants to physical or emotional harm. Test accounts use pseudonymized data, and no real student academic records are used during testing. The system is designed to benefit the academic community by supporting peer learning through structured interaction. The rating system serves as a constructive feedback mechanism and is not used as a punitive tool. Ratings and written feedback are visible to students when browsing tutors to support informed selection decisions. Any concerns arising from feedback are handled through appropriate administrative channels.

## **Respect for Persons**

Participants are treated as autonomous individuals capable of making informed decisions regarding their participation. All feedback, whether positive or critical, is treated with equal importance and reported objectively. Participants are not pressured to provide favorable responses about the system.

## **Honesty and Integrity**

The researchers commit to reporting findings truthfully and transparently, including negative feedback and system limitations identified during evaluation. No data fabrication, falsification, or selective reporting is conducted.

## **Right to Access and Rectification**

In accordance with the Data Privacy Act of 2012, participants are informed of their rights to access personal data collected during the study, request corrections, and request deletion of their data after the completion of the research.

## **Software Engineering Methodology**

**[Panel 3 — UI/UX / Panel 2 — ML instead of rule-based]** The system is developed using the Agile Software Development methodology. This approach divides development into iterative cycles in which a working prototype is continuously built, tested, and refined. Each iteration produces a functional version of the system that is evaluated by the developers through actual use, allowing issues and usability concerns to be identified early. Improvements and additional features are then incorporated in the next cycle based on observed performance and feedback.

This iterative build–test–refine process continues throughout the development period until the system reaches a level of completeness and stability suitable for evaluation by external users. Agile is appropriate for this study because it supports evolving requirements, enables rapid prototyping, and ensures that the final system is shaped by practical usage rather than purely theoretical design assumptions.
