"""
Realistic Filipino University Recommendation Letters
for Peer Tutoring Programs

These are manually crafted to mimic real letter styles:
- Formal Filipino academic English
- Tagalog-English code-switching (common in informal letters)
- Various institution formats (state universities, private colleges)
- Real edge cases: vague letters, overly formal, handwritten-style OCR artifacts
- Mix of department heads, faculty, coordinators as signatories

Each letter is pre-labeled. Review realistic_letters.json and correct
any labels before running add_to_training.py.

Run: python realistic_letters.py
Output: realistic_letters.json
"""

import json, os

LETTERS = [

# ═══════════════════════════════════════
# STRONG — clear, formal endorsements
# ═══════════════════════════════════════
{
"text": """Republic of the Philippines
University of Cebu
College of Computer Studies
Department of Information Technology

RECOMMENDATION LETTER FOR PEER TUTORING PROGRAM

To Whom It May Concern:

I am writing this letter to highly and unreservedly recommend Mr. Rafael Dela Cruz for the Peer Tutoring Program of the College of Computer Studies. I have had the privilege of teaching Mr. Dela Cruz in Programming Fundamentals (IT-PROG11) and Data Structures and Algorithms (IT-DSTRUC21) during the first and second semesters of Academic Year 2023-2024.

Throughout the duration of these courses, Mr. Dela Cruz consistently demonstrated exceptional academic performance, ranking among the top three students in both subjects. His mastery of object-oriented programming concepts, algorithm design, and data structure implementation is commendable and goes beyond what is expected of a student at his level.

More importantly, Mr. Dela Cruz possesses a natural ability to explain complex programming concepts in simple, accessible terms. I have personally observed him assist his classmates during laboratory sessions, showing remarkable patience and a genuine desire to help others understand difficult topics. He demonstrates strong communication skills and the ability to adapt his explanations to the learning pace of his peers.

I strongly and wholeheartedly recommend Mr. Rafael Dela Cruz for the Peer Tutoring Program without any reservation. He is, without doubt, one of the most qualified students I have encountered in my years of teaching.

Respectfully yours,

Dr. Maria Teresa Gonzales
Department Head, Information Technology
University of Cebu
Date: January 15, 2024""",
"strength": "Strong",
"subjects": ["Programming Fundamentals", "Data Structures"],
"softSkills": ["Communication", "Patience", "Teaching Ability"]
},

{
"text": """POLYTECHNIC UNIVERSITY OF THE PHILIPPINES
COLLEGE OF INFORMATION AND COMMUNICATIONS TECHNOLOGY
DEPARTMENT OF INFORMATION TECHNOLOGY

January 20, 2024

TO WHOM IT MAY CONCERN:

Greetings!

It is with great enthusiasm and full confidence that I recommend Ms. Simone Makinano for the Peer Tutoring Program. Ms. Makinano has been my student in Database Management Systems (IT-DBSYS21) and Web Development (IT-WEBDEV32), where she consistently achieved the highest marks in class.

Ms. Makinano's technical proficiency in SQL, database normalization, and web application development is truly outstanding. What sets her apart is not only her academic excellence but her remarkable ability to mentor her groupmates. During our project-based activities, she would voluntarily explain concepts to struggling classmates, demonstrating both leadership and patience beyond her years.

I have observed her conduct informal study sessions for her block section, and the results speak for themselves — her peers performed significantly better in subsequent assessments. Her communication skills are excellent, and she possesses the rare ability to make technically difficult subjects approachable.

I give Ms. Simone Makinano my strongest possible endorsement for the Peer Tutoring Program. The students under her tutoring will be in very capable hands.

Very truly yours,

Prof. Emmanuel Garcia, MIT
Program Chair, Information Technology
Polytechnic University of the Philippines""",
"strength": "Strong",
"subjects": ["Database Systems", "Web Development"],
"softSkills": ["Leadership", "Patience", "Communication", "Teaching Ability"]
},

{
"text": """Cebu Technological University
College of Computer Studies

Office of the Department Head
Department of Information Technology

To Whom It May Concern:

This letter serves to highly recommend Mr. Angelo Reyes for the Peer Tutoring Program. Mr. Reyes has been a student in my classes — specifically in Networking (IT-NETWRK21) and Information Security (IT-INFOSEC32) — and has proven himself to be an exceptional learner and educator.

His grasp of TCP/IP protocols, network configuration, and cybersecurity principles is at a professional level. During our hands-on network setup activities, Mr. Reyes was consistently the first to complete tasks correctly and was immediately willing to guide those who were struggling.

I have never seen a student so naturally inclined toward teaching. He explains without condescension, checks for understanding, and adjusts his approach based on who he is helping. He would make an excellent peer tutor for both Networking and Information Security courses.

I wholeheartedly recommend Mr. Angelo Reyes. Please do not hesitate to contact me for further information.

Sincerely,
Dr. Ricardo Aquino
Department Head, College of Computer Studies
Cebu Technological University
January 2024""",
"strength": "Strong",
"subjects": ["Networking", "Information Security"],
"softSkills": ["Teaching Ability", "Patience", "Adaptability"]
},

{
"text": """University of Southern Philippines Foundation
College of Computer Studies

TO WHOM IT MAY CONCERN:

I, Prof. Lourdes Villanueva, faculty member of the Department of Information Technology, am writing to strongly recommend Ms. Patricia Lopez for our institution's Peer Tutoring Program.

Ms. Lopez was my student in Software Engineering (IT-SOFENG32) and Systems Administration (IT-SYSADMN32). In both subjects, she finished with the highest grade in her section. Her understanding of the software development lifecycle, agile practices, and Linux server administration is thorough and demonstrably superior to her peers.

Beyond academics, Ms. Lopez has consistently shown a passion for helping others learn. She organized study groups for her block every week before major examinations. Her groupmates have cited her as the primary reason they passed these challenging subjects. She is patient, articulate, and genuinely invested in the success of those around her.

I strongly endorse Ms. Patricia Lopez for the Peer Tutoring Program. She is exactly the kind of student this program was designed for.

Prof. Lourdes Villanueva, MSCS
Faculty, Department of Information Technology
University of Southern Philippines Foundation""",
"strength": "Strong",
"subjects": ["Software Engineering", "Systems Administration"],
"softSkills": ["Leadership", "Patience", "Dedication", "Communication"]
},

{
"text": """UNIVERSITY OF SAN CARLOS
SCHOOL OF LAW AND GOVERNANCE / COLLEGE OF ENGINEERING
DEPARTMENT OF COMPUTER SCIENCE AND INFORMATION TECHNOLOGY

February 3, 2024

RE: Recommendation for Peer Tutoring — Mr. Michael Tan

To the Peer Tutoring Program Coordinator:

I am pleased to write this letter in strong support of Mr. Michael Tan's application to serve as a peer tutor. Mr. Tan completed both Programming Fundamentals (CC-PROG11) and Data Structures (CC-DSTRUC21) under my instruction with perfect scores in all major examinations.

His programming skills — particularly in Java and Python — are exceptional. More than his technical ability, what impresses me most is his natural pedagogical instinct. During recitation and laboratory work, he consistently frames explanations in ways that make the material accessible to students with varying backgrounds. He demonstrates critical thinking and excellent problem-solving skills, and he is known throughout his section as the student his peers approach when they are stuck.

It is my sincere and enthusiastic recommendation that Mr. Michael Tan be accepted into the Peer Tutoring Program. He will be an asset to any student he works with.

Respectfully,
Dr. Fernando Castillo, PhD
Associate Professor, Department of Computer Science
University of San Carlos""",
"strength": "Strong",
"subjects": ["Programming Fundamentals", "Data Structures"],
"softSkills": ["Problem Solving", "Critical Thinking", "Teaching Ability", "Communication"]
},

# ═══════════════════════════════════════
# STRONG — shorter / less formal but clear
# ═══════════════════════════════════════
{
"text": """To Whom It May Concern,

This is to highly recommend Ms. Sofia Fernandez for the peer tutoring program of our department. She was my student in Web Development and consistently performed at the top of her class. Her knowledge of HTML, CSS, JavaScript, and web frameworks is excellent.

What makes Ms. Fernandez stand out is that she is not just academically gifted — she is a natural teacher. She has helped organize review sessions for her classmates and is always willing to stay after class to help peers who are having difficulty.

I strongly recommend her without reservation.

Prof. Ana Liza Lopez
Faculty, IT Department
Southwestern University PHINMA
January 2024""",
"strength": "Strong",
"subjects": ["Web Development"],
"softSkills": ["Teaching Ability", "Dedication"]
},

{
"text": """Cebu Normal University
Department of Information Technology

January 30, 2024

TO WHOM IT MAY CONCERN:

I am writing to enthusiastically endorse Mr. Carlos Rivera for the Peer Tutoring Program. I have taught Mr. Rivera in both Networking and Systems Administration, and I can say without hesitation that he is the most technically capable student I have had in five years of teaching.

His ability to configure networks, manage Linux servers, and troubleshoot infrastructure problems rivals that of working professionals. He has voluntarily assisted the IT department in maintaining laboratory computers and has trained junior students in basic server administration.

I endorse Mr. Carlos Rivera with the utmost confidence.

Dr. Eduardo Santos
Department Head
Cebu Normal University""",
"strength": "Strong",
"subjects": ["Networking", "Systems Administration"],
"softSkills": ["Professionalism", "Dedication", "Teaching Ability"]
},

{
"text": """TO WHOM IT MAY CONCERN:

Ako si Prof. Ramon dela Cruz, faculty ng Department of Information Technology ng aming kolehiyo. Isinusulat ko itong liham para lubos na irekomenda si G. Juan Garcia para sa Peer Tutoring Program.

Si G. Garcia ay naging estudyante ko sa Information Security at Software Engineering. Bukod sa mataas na grado, napapansin ko palagi na tinutulungan niya ang kanyang mga kaklase sa mga mahirap na paksa. Malinaw ang kanyang paliwanag at napakamaintindihan niya ang ibang tao.

Lubos kong inirerekomenda si G. Juan Garcia para sa Peer Tutoring Program. Siguradong makakatulong siya sa kanyang mga kapwa estudyante.

Prof. Ramon dela Cruz
IT Department
January 2024""",
"strength": "Strong",
"subjects": ["Information Security", "Software Engineering"],
"softSkills": ["Communication", "Patience", "Teaching Ability"]
},

{
"text": """This is to certify that Ms. Andrea Villanueva, a fourth-year BSIT student, is hereby strongly recommended for the Peer Tutoring Program.

Ms. Villanueva excelled in my class on Database Systems and also in Programming Fundamentals. She has consistently been among the top students and has demonstrated a deep understanding of relational database design, SQL, and normalization.

She is a highly dedicated student who takes her academic responsibilities seriously. I have seen her mentor her groupmates on multiple occasions and they have improved noticeably because of her guidance.

I give my strongest recommendation for Ms. Andrea Villanueva.

Dr. Josephine Mendoza
Faculty, College of Computer Studies
University of the Visayas""",
"strength": "Strong",
"subjects": ["Database Systems", "Programming Fundamentals"],
"softSkills": ["Dedication", "Teaching Ability", "Professionalism"]
},

{
"text": """REPUBLIC OF THE PHILIPPINES
CEBU TECHNOLOGICAL UNIVERSITY
COLLEGE OF COMPUTER STUDIES

RECOMMENDATION LETTER

To the Peer Tutoring Coordinator:

I am writing on behalf of Mr. Gabriel Cruz who is applying to serve as a peer tutor in Data Structures and Algorithms. Having taught Mr. Cruz in this subject as well as in Software Engineering, I can confidently say that he is among the most analytically gifted students I have encountered.

His ability to implement complex algorithms, analyze time complexity, and design efficient data structures exceeds course requirements. He approaches problems methodically and has demonstrated exceptional critical thinking and problem-solving skills.

Mr. Cruz is also known for his willingness to help peers. He has led informal review sessions and his teaching approach is clear and systematic.

I strongly and unreservedly recommend Mr. Gabriel Cruz.

Prof. Teresita Ramos
Faculty, Information Technology
Cebu Technological University
February 2024""",
"strength": "Strong",
"subjects": ["Data Structures", "Software Engineering"],
"softSkills": ["Critical Thinking", "Problem Solving", "Teaching Ability"]
},

# ═══════════════════════════════════════
# MODERATE — supportive but not enthusiastic
# ═══════════════════════════════════════
{
"text": """To Whom It May Concern:

I am writing to support the application of Ms. Isabella Torres for the Peer Tutoring Program. Ms. Torres was my student in Web Development this semester and performed well, finishing with a grade of 1.5.

She has a good understanding of frontend development and has shown competence in HTML, CSS, and basic JavaScript. She participates actively in class and is generally helpful to her groupmates.

I believe Ms. Torres has the capability to serve as a peer tutor for Web Development. I support her application.

Prof. Cecilia Torres
Faculty, IT Department
January 2024""",
"strength": "Moderate",
"subjects": ["Web Development"],
"softSkills": ["Communication"]
},

{
"text": """University of Cebu — Banilad Campus
Department of Information Technology

To Whom It May Concern:

This letter is in support of Mr. David Ramos' application to become a peer tutor. Mr. Ramos was my student in Networking (IT-NETWRK21) and passed the subject with satisfactory marks.

He demonstrates a reasonable understanding of network protocols and basic LAN configuration. While he is not among the highest performers in class, he is consistent and hardworking. He has shown willingness to help classmates and I believe he can be a useful resource for peer learning.

I recommend Mr. David Ramos for the program with confidence that he will perform his duties responsibly.

Respectfully,
Prof. Ramon dela Cruz
Faculty Member, IT Department
University of Cebu""",
"strength": "Moderate",
"subjects": ["Networking"],
"softSkills": ["Dedication", "Professionalism"]
},

{
"text": """TO WHOM IT MAY CONCERN:

I am recommending Ms. Francesca Lim for the Peer Tutoring Program. She has been my student in Programming Fundamentals and Database Systems.

Ms. Lim performed adequately in both subjects. Her grades reflect a solid understanding of the core concepts, though there is still room for growth. She is a cooperative student who engages well with group work and has been observed explaining concepts to her peers during laboratory sessions.

I believe she is ready to take on peer tutoring responsibilities for introductory-level courses.

Dr. Antonio Bautista
Faculty
Southwestern University PHINMA
Date: February 5, 2024""",
"strength": "Moderate",
"subjects": ["Programming Fundamentals", "Database Systems"],
"softSkills": ["Teamwork"]
},

{
"text": """This letter is to support the application of Mr. Marco Gonzales for the Peer Tutoring Program.

Mr. Gonzales completed my course in Information Security with a grade of 2.0 (Very Good). He showed a satisfactory understanding of cybersecurity concepts, risk management, and basic encryption.

During the semester, he demonstrated a willingness to assist classmates with laboratory exercises. He is a responsible student and I have no objection to his application.

I recommend Mr. Gonzales for peer tutoring in Information Security.

Dr. Maria Teresa Gonzales
IT Department
Cebu Technological University""",
"strength": "Moderate",
"subjects": ["Information Security"],
"softSkills": ["Professionalism"]
},

{
"text": """Dear Peer Tutoring Coordinator,

I am writing this letter in support of Ms. Nicole Aquino's application to serve as a peer tutor. Ms. Aquino was my student in Systems Administration and Data Structures.

She performed well in both subjects and has a good grasp of Linux server management and basic data structures implementation. I have seen her help her groupmates during laboratory work and she communicates clearly.

While she may not be the top student in the class, she is consistent, dependable, and genuinely interested in helping others. I support her application.

Sincerely,
Prof. Lourdes Villanueva
Faculty, Information Technology
University of Southern Philippines Foundation""",
"strength": "Moderate",
"subjects": ["Systems Administration", "Data Structures"],
"softSkills": ["Communication", "Dedication"]
},

{
"text": """To Whom It May Concern,

I am pleased to write this letter of support for Mr. Jose Bautista who wishes to apply as a peer tutor for Software Engineering.

Mr. Bautista completed IT-SOFENG32 under my instruction and achieved a grade of 1.75. His understanding of the software development lifecycle, requirements analysis, and UML modeling is above average.

He is a participative student and a team player. During our group capstone project, he took a leadership role and helped ensure the team met their deliverables on time. I believe he has the capability to tutor other students in this subject.

I recommend Mr. Bautista for the program.

Prof. Emmanuel Garcia
Program Chair, IT
Polytechnic University of the Philippines""",
"strength": "Moderate",
"subjects": ["Software Engineering"],
"softSkills": ["Leadership", "Teamwork", "Professionalism"]
},

{
"text": """Recommendation Letter

This is to recommend Ms. Ana Reyes for the Peer Tutoring Program of our college. Ms. Reyes was enrolled in my class for Web Development and Programming Fundamentals during AY 2023-2024.

She performed satisfactorily in both subjects and has shown a reasonable grasp of web programming concepts. I have observed her assisting classmates during lab sessions and she does so patiently and effectively.

I support her application to serve as a peer tutor.

Dr. Fernando Castillo
Associate Professor
University of San Carlos
February 2024""",
"strength": "Moderate",
"subjects": ["Web Development", "Programming Fundamentals"],
"softSkills": ["Patience"]
},

# ═══════════════════════════════════════
# WEAK — minimal, obligatory letters
# ═══════════════════════════════════════
{
"text": """To Whom It May Concern:

This is to certify that Mr. Luis Castillo has been my student in Networking this semester. He has attended classes regularly and has completed all required outputs.

Mr. Castillo passed the subject with a grade of 3.0.

This letter is issued upon his request for whatever legitimate purpose it may serve.

Prof. Ana Liza Lopez
Faculty, IT Department
January 2024""",
"strength": "Weak",
"subjects": ["Networking"],
"softSkills": []
},

{
"text": """To the Peer Tutoring Program:

I am writing to acknowledge the application of Ms. Kristine Mendoza for the peer tutoring program. She has completed the required courses under my instruction, including Programming Fundamentals and Data Structures.

Her performance was acceptable. She passed both subjects.

I have no objection to her application.

Dr. Ricardo Aquino
Department Head
Cebu Normal University""",
"strength": "Weak",
"subjects": ["Programming Fundamentals", "Data Structures"],
"softSkills": []
},

{
"text": """This letter is written upon the request of Mr. Ramon Flores who is applying for the peer tutoring program.

Mr. Flores attended my class in Database Systems. He submitted all required outputs and passed the subject.

I can confirm his enrollment and course completion.

Prof. Josephine Mendoza
Faculty
University of the Visayas
February 2024""",
"strength": "Weak",
"subjects": ["Database Systems"],
"softSkills": []
},

{
"text": """TO WHOM IT MAY CONCERN:

Si Ms. Clarissa Domingo ay naging estudyante ko sa Information Security at Systems Administration. Pumasa siya sa pareho ng mga subject.

Inilalabas ang liham na ito ayon sa kanyang kahilingan.

Prof. Ramon dela Cruz
IT Department""",
"strength": "Weak",
"subjects": ["Information Security", "Systems Administration"],
"softSkills": []
},

{
"text": """To Whom It May Concern,

This is to confirm that Mr. Bernard Santos is a student in our department. He has taken Web Development under my supervision.

He passed the course requirements.

This letter is issued for peer tutoring application purposes.

Prof. Teresita Ramos
Faculty
February 2024""",
"strength": "Weak",
"subjects": ["Web Development"],
"softSkills": []
},

{
"text": """RE: Peer Tutoring Application — Ms. Jessa Villanueva

Ms. Villanueva completed Software Engineering under my instruction. She met the minimum requirements of the course.

I am issuing this letter as requested.

Dr. Eduardo Santos
Department Head
Cebu Technological University""",
"strength": "Weak",
"subjects": ["Software Engineering"],
"softSkills": []
},

{
"text": """To the Coordinator:

This letter confirms that Mr. John Paul Ocampo has been enrolled in and has completed Networking (IT-NETWORK31) and Data Structures (IT-DSTRUC21) under my instruction.

Both subjects have been passed.

Respectfully,
Prof. Lourdes Villanueva
IT Faculty""",
"strength": "Weak",
"subjects": ["Networking", "Data Structures"],
"softSkills": []
},

# ═══════════════════════════════════════
# NONE — enrollment certs, no recommendation
# ═══════════════════════════════════════
{
"text": """CERTIFICATION

This is to certify that Ms. Maricel Buenaventura is a bona fide student of the College of Computer Studies, enrolled in the Bachelor of Science in Information Technology program.

This certification is issued upon her request for whatever purpose it may serve.

Dr. Maria Teresa Gonzales
Department Head
University of Cebu
January 30, 2024""",
"strength": "None",
"subjects": [],
"softSkills": []
},

{
"text": """To Whom It May Concern:

This is to certify that Mr. Francis Dela Torre is currently enrolled at our institution as a third-year BSIT student.

Issued this 25th day of January 2024 upon the request of the above-named student.

Registrar's Office
Cebu Technological University""",
"strength": "None",
"subjects": [],
"softSkills": []
},

{
"text": """UNIVERSITY OF THE VISAYAS
OFFICE OF THE REGISTRAR

CERTIFICATE OF ENROLLMENT

This certifies that Ms. Rhea Mae Salvacion, ID No. 2021-00456, is officially enrolled as a student of this university for the Second Semester of Academic Year 2023-2024.

This certificate is issued for peer tutoring application purposes.

University Registrar""",
"strength": "None",
"subjects": [],
"softSkills": []
},

{
"text": """To the Peer Tutoring Coordinator,

I received the application of Mr. Nico Evangelista for the peer tutoring program. I can confirm that he is a student in our department.

No further endorsement is being provided at this time.

Faculty Office
Department of Information Technology""",
"strength": "None",
"subjects": [],
"softSkills": []
},

# ═══════════════════════════════════════
# EDGE CASES — ambiguous, unusual formats
# ═══════════════════════════════════════
{
"text": """To Whom It May Concern:

Ms. Katrina Palma is a student I have observed closely over the past two semesters. She is one of the brightest and most hardworking students in her batch. Her performance in Programming Fundamentals and Web Development has been outstanding — she consistently scores in the 95th percentile.

She is patient with her peers, always willing to explain concepts, and takes pride in seeing her classmates succeed. I have seen her conduct informal tutorials for her blockmates on multiple occasions.

Honestly, if this program needs the best candidate available, Katrina is it.

Dr. Antonio Bautista
Faculty
Southwestern University PHINMA""",
"strength": "Strong",
"subjects": ["Programming Fundamentals", "Web Development"],
"softSkills": ["Patience", "Teaching Ability", "Dedication"]
},

{
"text": """Hi,

Just writing to support Aldrin Cabrera for the peer tutoring thing. He was in my class for Database Systems. Pretty good student, knows his SQL, passed with a 1.5.

He seems to get along well with classmates and helped a few of them during lab. I think he'd do fine as a tutor.

— Prof. Emmanuel Garcia""",
"strength": "Moderate",
"subjects": ["Database Systems"],
"softSkills": []
},

{
"text": """T0 Wh0m lt May C0ncern:

l am wrlting th1s letter t0 rec0mmend Ms. Sheila Mae Diz0n f0r the Peer Tut0ring Pr0gram. She was my student in lnf0rmati0n Security and Netw0rking, where she perf0rmed excepti0nally well.

Her kn0wledge 0f cybersecurity pr1nciples and netw0rk adm1nistratin is 0utstanding. She has helped classmates understand c0mplex t0pics and sh0ws great patience and c0mmunication skills.

l str0ngly rec0mmend her with0ut reservati0n.

Dr. Ric4rd0 Aquin0
Dept Head
Cebu N0rmal University""",
"strength": "Strong",
"subjects": ["Information Security", "Networking"],
"softSkills": ["Patience", "Communication"]
},

{
"text": """Recommendation Letter for Renz Bonifacio

I have the pleasure of writing this letter for Renz Bonifacio, who is applying as a peer tutor. Renz was in my Software Engineering class and consistently demonstrated a mature understanding of agile development, system design, and software quality assurance.

Beyond technical skills, Renz has a gift for breaking down complex software concepts for others. During our capstone presentations, he voluntarily helped three other groups refine their system architecture — not because he was asked to, but because he wanted them to succeed.

I recommend Renz Bonifacio highly. He is exactly the kind of peer tutor that makes a difference.

Prof. Cecilia Torres
Faculty, IT Department
University of Southern Philippines Foundation
January 2024""",
"strength": "Strong",
"subjects": ["Software Engineering"],
"softSkills": ["Teaching Ability", "Leadership", "Dedication"]
},

{
"text": """To the Program Coordinator:

I am writing regarding Ms. Lovely Soriano's application. She attended my classes in Data Structures and Systems Administration. Her grades were satisfactory — not the highest in class, but she put in consistent effort.

I think she could manage tutoring if paired with supportive supervision. I have seen her help classmates when asked. She is cooperative and does not cause problems.

I support her application, though I note that she may need some mentoring herself as she develops her tutoring skills.

Prof. Eduardo Santos
IT Faculty""",
"strength": "Moderate",
"subjects": ["Data Structures", "Systems Administration"],
"softSkills": ["Teamwork"]
},

{
"text": """RECOMMENDATION LETTER

To Whom It May Concern,

This letter is issued to support Mr. John Paul Ocampo in his application for the peer tutoring program. I have served as his adviser and also taught him in Programming Fundamentals.

While Mr. Ocampo is not the most academically outstanding student, he has shown genuine improvement over his college career and has developed a good foundational understanding of programming concepts. He has mentioned to me his desire to help junior students, which I think is commendable.

I support his application with cautious optimism.

Dr. Fernando Castillo
Associate Professor and Academic Adviser
University of San Carlos""",
"strength": "Moderate",
"subjects": ["Programming Fundamentals"],
"softSkills": ["Dedication"]
},

{
"text": """Sa Kinauukulan:

Isinusulat ko itong liham para irekomenda ang aming estudyante na si Ms. Maricel Buenaventura para sa Peer Tutoring Program. Siya ay isa sa aking mga estudyante sa Web Development at Programming Fundamentals.

Lubos na pinapahalagahan ng kanyang mga kaklase ang tulong na ibinibigay niya sa kanila lalo na sa mga laboratory activities. Malinaw ang kanyang paliwanag at hindi siya nagagalit kahit paulit-ulit ang tanong ng kanyang mga kaklase.

Lubos ko siyang inirerekomenda para sa programang ito.

Prof. Ana Liza Lopez
Fakulti, Departamento ng Information Technology
Cebu Technological University
Enero 2024""",
"strength": "Strong",
"subjects": ["Web Development", "Programming Fundamentals"],
"softSkills": ["Patience", "Communication", "Teaching Ability"]
},

]


# ══════════════════════════════════════════════════════════════
# OUTPUT
# ══════════════════════════════════════════════════════════════

if __name__ == '__main__':
    from collections import Counter

    output_path = os.path.join(os.path.dirname(__file__), 'realistic_letters.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(LETTERS, f, indent=2, ensure_ascii=False)

    total = len(LETTERS)
    dist = Counter(l['strength'] for l in LETTERS)
    print(f"✅ Generated {total} realistic letter samples")
    print(f"📁 Saved to: {output_path}")
    print(f"\nStrength distribution:")
    for k in ['Strong', 'Moderate', 'Weak', 'None']:
        print(f"  {k:>10}: {dist.get(k, 0):>3}")
    print(f"\n📝 Review realistic_letters.json and correct any labels,")
    print(f"   then run: python add_to_training.py")
