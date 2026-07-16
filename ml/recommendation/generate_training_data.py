"""
Generate synthetic training data for the Recommendation Letter ML model.

Expanded v2 — more phrase variety, more Filipino institutional language,
more template diversity, larger dataset (4000 samples).

Run: python generate_training_data.py
Output: training_data.json
"""

import json
import random
import os
import re

SUBJECTS = [
    "Programming Fundamentals",
    "Database Systems",
    "Web Development",
    "Networking",
    "Information Security",
    "Data Structures",
    "Systems Administration",
    "Software Engineering",
]

SUBJECT_PHRASES = {
    "Programming Fundamentals": [
        "object-oriented programming", "programming concepts", "coding fundamentals",
        "algorithm implementation", "programming logic", "Java and Python programming",
        "fundamental programming constructs", "OOP principles and design",
        "writing clean and efficient code", "software development basics",
        "computational thinking and programming", "IT-PROG11", "IT-PROG12", "CC-PROG11",
        "programming fundamentals", "PROG11", "PROG12", "Introduction to Programming",
        "basic programming", "computer programming", "coding and logic formulation",
        "structured programming", "program design and development",
        "fundamentals of programming languages", "CC101", "IT101",
    ],
    "Database Systems": [
        "relational database systems", "SQL and database management",
        "database design and normalization", "data modeling concepts",
        "database administration", "managing relational databases",
        "structured query language", "database concepts and queries",
        "entity-relationship modeling", "RDBMS and data management",
        "IT-DBSYS21", "CC-DBMS21", "DBSYS", "DBMS", "database systems",
        "database management systems", "data management", "IT-DBS21",
        "Introduction to Database", "database fundamentals", "CC-DB21",
        "data storage and retrieval", "relational database design", "DB101",
    ],
    "Web Development": [
        "web application development", "frontend and backend development",
        "HTML CSS and JavaScript", "building web applications",
        "full-stack web development", "responsive web design",
        "modern web technologies", "creating dynamic websites",
        "web frameworks and APIs", "client-server web architecture",
        "IT-WEBDEV21", "IT-WEBDEV32", "WEBDEV", "web development",
        "web design and development", "Internet Technology", "IT-WEB21",
        "web programming", "dynamic web applications", "web systems",
        "web technologies", "e-commerce development", "CC-WEB21",
    ],
    "Networking": [
        "computer networking", "TCP/IP networking", "network administration",
        "LAN and WAN configuration", "network protocols and architecture",
        "data communications", "network infrastructure", "routing and switching",
        "network troubleshooting", "OSI model and protocols",
        "IT-NETWRK21", "IT-NETWRK32", "NETWRK", "networking",
        "data communications and networking", "IT-NETWORK31", "IT-NETWORK32",
        "network fundamentals", "computer networks", "IT-NET21",
        "network installation and configuration", "wireless networking",
        "network security and administration", "CC-NET21",
    ],
    "Information Security": [
        "cybersecurity principles", "information security", "network security",
        "ethical hacking and penetration testing", "security protocols and encryption",
        "data protection and privacy", "system security hardening",
        "vulnerability assessment", "security risk management",
        "cryptography fundamentals", "IT-INFOSEC32", "IT-INFOSEC", "INFOSEC",
        "information security", "infosec", "Information Assurance and Security",
        "cyber defense", "IT security", "security management", "IAS",
        "information assurance", "digital forensics", "IT-IAS32",
        "network defense", "security operations", "CC-IAS32",
    ],
    "Data Structures": [
        "data structures and algorithms", "algorithmic problem solving",
        "trees graphs and hash tables", "complexity analysis",
        "advanced data structures", "sorting and searching algorithms",
        "linked lists stacks and queues", "algorithm design techniques",
        "computational complexity", "efficient data organization",
        "IT-DSTRUC21", "CC-DSTRUC", "DSTRUC", "data structures",
        "data structures and algorithm analysis", "CC-DSTR21",
        "discrete data structures", "IT-DS21", "algorithm design",
        "data organization and management", "CC102",
    ],
    "Systems Administration": [
        "system administration", "Linux server management",
        "operating system administration", "server deployment and maintenance",
        "virtualization and cloud services", "system monitoring and automation",
        "infrastructure management", "Windows and Linux administration",
        "server configuration", "IT infrastructure operations",
        "IT-SYSADMN32", "IT-SYSADMN", "SYSADMN", "systems administration",
        "system administration and maintenance", "IT-SA32",
        "server management", "operating systems", "IT-OS21",
        "cloud computing and virtualization", "enterprise systems",
        "system configuration and deployment", "CC-SA32",
    ],
    "Software Engineering": [
        "software engineering practices", "software development lifecycle",
        "agile methodology", "requirements analysis and design",
        "software testing and quality assurance", "version control and collaboration",
        "system design and architecture", "project management in software",
        "UML and system modeling", "software documentation and maintenance",
        "IT-SOFENG32", "IT-SOFENG", "SOFENG", "software engineering",
        "software project management", "IT-SE32", "SE101",
        "systems analysis and design", "software quality assurance",
        "capstone project development", "IT-SAD21", "CC-SE32",
    ],
}

SOFT_SKILLS = [
    "Communication", "Leadership", "Patience", "Problem Solving",
    "Teamwork", "Teaching Ability", "Critical Thinking",
    "Adaptability", "Professionalism", "Dedication",
]

SOFT_SKILL_PHRASES = {
    "Communication": [
        "demonstrates excellent communication skills",
        "explains concepts clearly to peers",
        "articulates ideas effectively",
        "communicates complex topics in simple terms",
        "has strong verbal and written communication",
        "is easy to understand when explaining",
        "conveys information clearly",
        "translates complex procedures into simple steps",
        "makes technical concepts accessible",
        "explains without jargon",
        "communicates ideas with clarity and precision",
        "is able to discuss technical topics in layman's terms",
        "has a clear and articulate manner of speaking",
    ],
    "Leadership": [
        "shows strong leadership in group activities",
        "takes initiative in collaborative settings",
        "naturally guides peers toward solutions",
        "leads by example in laboratory sessions",
        "demonstrates leadership qualities",
        "assumes responsibility in team projects",
        "mentors other students effectively",
        "takes charge when the group needs direction",
        "inspires confidence in groupmates",
        "leads study groups with maturity and discipline",
    ],
    "Patience": [
        "exhibits patience when helping classmates",
        "is patient with struggling learners",
        "takes time to ensure understanding",
        "never rushes explanations",
        "willingly repeats concepts until understood",
        "demonstrates remarkable patience",
        "does not get frustrated with slow learners",
        "is calm and composed when teaching",
        "takes the time to address every question thoroughly",
        "never shows impatience even with repeated questions",
    ],
    "Problem Solving": [
        "displays strong problem-solving abilities",
        "approaches challenges methodically",
        "helps others develop analytical thinking",
        "demonstrates systematic problem-solving",
        "excels at debugging and troubleshooting",
        "breaks down complex problems into steps",
        "finds creative solutions to difficult problems",
        "approaches technical challenges with confidence",
        "demonstrates logical and structured thinking",
    ],
    "Teamwork": [
        "works collaboratively with team members",
        "fosters inclusive learning environments",
        "cooperates well in group settings",
        "contributes positively to team dynamics",
        "demonstrates excellent teamwork",
        "works well with students of different skill levels",
        "is a valuable team player in all group activities",
        "supports groupmates and encourages participation",
    ],
    "Teaching Ability": [
        "possesses strong teaching ability",
        "has natural mentoring skills",
        "adapts explanations to different levels",
        "makes learning engaging and accessible",
        "has a gift for explaining difficult topics",
        "is a natural educator among peers",
        "demonstrates the ability to simplify complex material",
        "can teach at the pace of the learner",
        "has been observed tutoring peers informally with great success",
        "has an innate ability to make difficult subjects understandable",
    ],
    "Critical Thinking": [
        "displays critical thinking abilities",
        "analyzes problems from multiple angles",
        "evaluates solutions thoughtfully",
        "demonstrates strong analytical skills",
        "applies logical reasoning consistently",
        "thinks critically before arriving at conclusions",
        "demonstrates sound judgment in problem analysis",
    ],
    "Adaptability": [
        "demonstrates adaptability in different situations",
        "adjusts approach based on learner needs",
        "is flexible in teaching methods",
        "handles unexpected challenges gracefully",
        "adapts quickly to new tools and methods",
        "is comfortable with changing requirements",
    ],
    "Professionalism": [
        "exhibits professionalism and strong work ethic",
        "is punctual and reliable",
        "maintains professional demeanor",
        "is respectful and courteous",
        "takes academic responsibilities seriously",
        "conducts himself/herself with professionalism at all times",
        "is consistently dependable and responsible",
        "behaves with maturity and respect in all academic settings",
    ],
    "Dedication": [
        "has shown dedication and responsibility",
        "consistently goes above and beyond",
        "shows commitment to academic excellence",
        "invests extra time in preparation",
        "demonstrates unwavering commitment",
        "shows genuine passion for the subject",
        "is one of the most hardworking students I have taught",
        "gives full effort in every activity and output",
        "is deeply committed to learning and helping others",
    ],
}

# Faculty names and positions for realistic letter headers
FACULTY_NAMES = [
    "Dr. Maria Teresa Gonzales", "Prof. Ramon dela Cruz", "Dr. Jose Antonio Reyes",
    "Prof. Lourdes Villanueva", "Dr. Eduardo Santos", "Prof. Marilou Fernandez",
    "Dr. Roberto Cruz", "Prof. Cecilia Torres", "Dr. Antonio Bautista",
    "Prof. Josephine Mendoza", "Dr. Emmanuel Garcia", "Prof. Ana Liza Lopez",
    "Dr. Ricardo Aquino", "Prof. Teresita Ramos", "Dr. Fernando Castillo",
]

POSITIONS = [
    "Department Head, College of Computer Studies",
    "Program Chair, Information Technology",
    "Faculty Member, Department of Information Technology",
    "Associate Professor, College of Computer Studies",
    "Instructor, Information Technology Department",
    "Dean, College of Computer Studies",
    "Course Coordinator, IT Department",
    "Subject Area Head, Computer Science",
    "Senior Faculty, College of Computer Studies",
]

INSTITUTIONS = [
    "University of Cebu",
    "Cebu Technological University",
    "University of San Carlos",
    "University of Southern Philippines Foundation",
    "Southwestern University PHINMA",
    "Cebu Normal University",
    "University of the Visayas",
]

# ═══════════════════════════════════════════════════════════════
# STRONG TEMPLATES — expanded with Filipino institutional language
# ═══════════════════════════════════════════════════════════════

STRONG_TEMPLATES = [
    "I strongly recommend {name} as a peer tutor. {subject_text} {quality_text}",
    "I highly recommend {name} for the peer tutoring program. {subject_text} {quality_text}",
    "It is my distinct pleasure to recommend {name}. {subject_text} {quality_text} I endorse {name} without reservation.",
    "I am confident that {name} would be an excellent peer tutor. {subject_text} {quality_text} I wholeheartedly recommend this student.",
    "I enthusiastically recommend {name} for peer tutoring. {subject_text} {quality_text} This student has consistently exceeded expectations.",
    "{name} is among the top students I have taught. {subject_text} {quality_text} I strongly endorse this application.",
    "Without hesitation, I recommend {name} as a qualified peer tutor. {subject_text} {quality_text}",
    "I am pleased to give my strongest recommendation for {name}. {subject_text} {quality_text} This student is exceptionally qualified.",
    "I cannot recommend {name} highly enough. {subject_text} This student consistently goes above and beyond. {quality_text} My strongest endorsement.",
    "It gives me great pleasure to recommend {name}. {subject_text} I have rarely seen a student with such depth of understanding. {quality_text}",
    # Filipino formal letterhead format
    "Republic of the Philippines\n{institution}\nCollege of Computer Studies\nDepartment of Information Technology\n\nRECOMMENDATION LETTER FOR PEER TUTORING\n\nTo Whom It May Concern:\n\nI am writing this letter to highly recommend {name} as a qualified peer tutor. {subject_text} {quality_text}\n\nI strongly recommend {name} without reservation.\n\nRespectfully yours,\n{faculty}\n{position}",
    "To Whom It May Concern:\n\nI, {faculty}, {position}, hereby highly recommend {name} as a qualified peer tutor. {subject_text} {quality_text}\n\nI endorse this student's capability to assist fellow students without reservation.\n\nRespectfully,\n{faculty}\n{position}",
    "RECOMMENDATION LETTER FOR PEER TUTORING\n\nTo Whom It May Concern:\n\nI, the undersigned faculty member, am writing to highly recommend {name} for the peer tutoring program. {subject_text} {quality_text}\n\nI strongly recommend this student as a peer tutor.\n\nRespectfully,\nNoted by: {faculty}\n{position}",
    "This is to certify that I, {faculty} of {institution}, strongly recommend {name} for the peer tutoring program. {subject_text} {quality_text} I give my full endorsement to this application.",
    "OFFICE OF THE DEPARTMENT HEAD\n\nTo Whom It May Concern:\n\nThis letter is to highly recommend {name} for the Peer Tutoring Program. {subject_text} {quality_text}\n\nI am fully confident in this student's ability to serve as a peer tutor. Very truly yours,\n{faculty}\n{position}",
    "I write this letter with great enthusiasm to recommend {name} for peer tutoring. {subject_text} {quality_text} I have no hesitation in giving my strongest endorsement.",
    "As {name}'s professor in {subject_text}, I am pleased to strongly recommend this student. {quality_text} This student stands out among the best I have taught.",
    "Having observed {name} over multiple semesters, I can attest that this student is exceptionally qualified. {subject_text} {quality_text} I wholeheartedly endorse this application.",
    "It is with great confidence that I recommend {name} for the peer tutoring program. {subject_text} {quality_text} I have full trust in this student's ability.",
]

MODERATE_TEMPLATES = [
    "{name} has shown competence in the courses I have taught. {subject_text} {quality_text}",
    "I recommend {name} for the tutoring program. {subject_text} While there is room for growth, this student shows promise.",
    "{name} has demonstrated adequate knowledge. {subject_text} {quality_text} I believe this student can contribute as a peer tutor.",
    "Based on my observation, {name} has the potential to assist fellow students. {subject_text} {quality_text}",
    "I support {name}'s application to become a peer tutor. {subject_text} This student has shown satisfactory performance.",
    "{name} has performed reasonably well in the relevant courses. {subject_text} {quality_text}",
    "I find {name} to be a capable student. {subject_text} {quality_text} I believe tutoring would benefit both this student and their peers.",
    "I am writing to support {name}'s application. {subject_text} This student participates actively and generally grasps the material.",
    "{name} has shown a good understanding of the subject matter. {subject_text} I believe this student is ready to assist peers.",
    "To Whom It May Concern:\n\nI am writing to support the application of {name} for the peer tutoring program. {subject_text} {quality_text}\n\nI believe this student has the competence to serve as a peer tutor.\n\nRespectfully,\n{faculty}\n{position}",
    "This letter serves to support {name}'s application as a peer tutor. {subject_text} This student has consistently shown satisfactory performance and I believe can assist fellow students.",
    "I am writing in support of {name} for the peer tutoring program at {institution}. {subject_text} {quality_text} I offer this recommendation with confidence.",
    "{name} has been a student under my instruction and has demonstrated the necessary skills. {subject_text} I recommend this student for consideration.",
    "As {name}'s instructor, I can say that this student has shown good grasp of the material. {subject_text} {quality_text} I support this application.",
    "I have observed {name} in the classroom and believe this student has what it takes to be a peer tutor. {subject_text} {quality_text}",
    "This is to certify that {name} is a student in good standing and has shown adequate mastery of {subject_text}. I support this application for peer tutoring.",
    "I am pleased to write in support of {name}. {subject_text} This student has shown steady improvement and I am confident in their ability to help others.",
]

WEAK_TEMPLATES = [
    "{name} has attended my classes. {subject_text} This student may benefit from the tutoring experience.",
    "I am writing regarding {name}'s application. {subject_text} I have limited interaction with this student outside of class.",
    "{name} has completed the required coursework. While not among the top performers, this student has passed.",
    "This letter is to confirm that {name} has been my student. {subject_text}",
    "{name} has shown some interest in the subject matter. Further development would be beneficial.",
    "I acknowledge {name}'s application for peer tutoring. This student attended classes regularly. {subject_text}",
    "I can confirm that {name} has taken courses under my instruction. {subject_text} Performance was acceptable.",
    "{name} passed the course and demonstrated basic understanding. {subject_text} I have no objection to this application.",
    "This is to certify that {name} is enrolled in our program. {subject_text} This student meets the minimum academic requirements.",
    "I am writing this letter as requested by {name}. This student has attended my class. {subject_text}",
    "To Whom It May Concern:\n\nThis letter confirms that {name} is a student under my instruction. {subject_text} I have no objection to this application.\n\nRespectfully,\n{faculty}",
    "{name} is a student in my class. I can confirm attendance and course completion. {subject_text}",
    "I write this letter upon the request of {name}. This student has completed the required coursework. Performance has been adequate.",
]

NONE_TEMPLATES = [
    "This letter confirms that {name} is enrolled in our department.",
    "To whom it may concern, {name} is a student in our program.",
    "This is to certify that {name} is currently registered in the College of Computer Studies.",
    "{name} has requested this letter. I can confirm enrollment status only.",
    "This letter serves as confirmation of enrollment for {name}.",
    "I am writing to confirm that {name} is a student at this institution.",
    "This certifies that {name} is a bona fide student of this college.",
    "To Whom It May Concern:\n\nThis is to certify that {name} is enrolled in our institution.\n\nRespectfully,\n{faculty}",
    "This letter is issued upon the request of {name} for whatever purpose it may serve.",
    "This is to acknowledge receipt of {name}'s application. No further endorsement is provided at this time.",
]

# ── Ambiguous templates ──────────────────────────────────────

AMBIGUOUS_MODERATE_STRONG = [
    "I believe {name} would make a good peer tutor. {subject_text} I have seen this student help classmates on several occasions. {quality_text} I think this student is ready, though I would encourage continued improvement.",
    "{name} is a diligent student who works hard. {subject_text} I have confidence this student can contribute to the tutoring program. {quality_text}",
    "I am writing in support of {name}'s application. This student has done well in my class. {subject_text} I think {name} has what it takes, with some room still to grow. {quality_text}",
    "I would like to recommend {name} for consideration. {subject_text} While I have not observed exceptional performance in every area, this student has shown consistent effort. {quality_text}",
    "I am happy to write this letter for {name}. {subject_text} I believe this student could be a useful resource for peers. {quality_text} I offer this recommendation with confidence.",
    "I think {name} would do well as a peer tutor. {subject_text} {quality_text} I believe this student is capable, though I encourage further growth.",
    "Based on my experience teaching {name}, I believe this student can handle the responsibilities of a peer tutor. {subject_text} {quality_text}",
]

AMBIGUOUS_MODERATE_WEAK = [
    "{name} has satisfactorily completed coursework under my instruction. {subject_text} I believe there is potential here, although I have not seen this student in a formal teaching role.",
    "I have known {name} as a student for one semester. {subject_text} Performance has been adequate. I have no major concerns about recommending this student for the tutoring program.",
    "{name} is a student who tries hard. {subject_text} I think with the right support, this student could assist peers. I offer a cautious recommendation.",
    "I am willing to support {name}'s application. {subject_text} This student has demonstrated competence in coursework. I would say this student is suitable with some reservations.",
    "I can say that {name} has performed satisfactorily. {subject_text} Whether this student is ready for tutoring is something I leave to the program coordinators to assess.",
]

AMBIGUOUS_PRAISE_NO_RECOMMENDATION = [
    "{name} is a pleasure to have in class. {subject_text} This student asks thoughtful questions and participates actively. I have always found {name} to be respectful and hardworking.",
    "{name} has impressed me with their dedication. {subject_text} This student consistently submits work on time and shows genuine curiosity. A motivated individual.",
    "I would like to say a few words about {name}. {subject_text} This student has been attentive, diligent, and cooperative throughout the semester. A commendable attitude.",
    "{name} is one of the more engaged students in my class. {subject_text} Always prepared, always attentive. It has been a pleasure teaching this student.",
    "I have observed {name} to be a conscientious student. {subject_text} This student takes academics seriously and is well-regarded by classmates.",
    "{name} is a responsible student who takes initiative. {subject_text} I appreciate this student's attitude and work ethic.",
]

AMBIGUOUS_STRONG_NO_SUBJECT = [
    "I strongly recommend {name} for the peer tutoring program. This student has demonstrated exceptional academic ability across all coursework. {quality_text} I endorse this application without reservation.",
    "It is my pleasure to highly recommend {name}. A standout student who consistently exceeds expectations. {quality_text} I have full confidence in this student's ability to assist peers.",
    "I wholeheartedly endorse {name} for the tutoring program. An exceptional student in every respect. {quality_text} My strongest recommendation.",
    "Without any reservation, I recommend {name}. This student has proven to be one of the best in our program. {quality_text}",
    "I am proud to recommend {name} for this program. This student exemplifies academic excellence. {quality_text} I give my full endorsement.",
]

# ═══════════════════════════════════════════════════════════════
# OCR NOISE SIMULATION
# ═══════════════════════════════════════════════════════════════

def add_ocr_noise(text, level='light'):
    if level == 'light':
        text = re.sub(r' ', lambda m: '  ' if random.random() < 0.05 else ' ', text)
        words = text.split()
        if len(words) > 15:
            insert_at = random.randint(8, len(words) - 5)
            words.insert(insert_at, '\n')
        text = ' '.join(words)
        text = re.sub(r'[.,]', lambda m: '' if random.random() < 0.08 else m.group(), text)
    elif level == 'medium':
        words = text.split()
        words = [w for w in words if not (len(w) <= 3 and random.random() < 0.06)]
        chars = list(' '.join(words))
        for i in range(len(chars)):
            if chars[i].isalpha() and random.random() < 0.015:
                chars[i] = random.choice('0O1lI|')
        text = ''.join(chars)
        text = re.sub(r' ', lambda m: '   ' if random.random() < 0.03 else ' ', text)
    return text.strip()


# ═══════════════════════════════════════════════════════════════
# HELPERS
# ═══════════════════════════════════════════════════════════════

NAMES = [
    "Rafael Dela Cruz", "Simone Makinano", "Maria Santos", "Juan Garcia",
    "Angelo Reyes", "Patricia Lopez", "Michael Tan", "Sofia Fernandez",
    "Carlos Rivera", "Andrea Villanueva", "Gabriel Cruz", "Isabella Torres",
    "David Ramos", "Francesca Lim", "Marco Gonzales", "Nicole Aquino",
    "Jose Bautista", "Ana Reyes", "Luis Castillo", "Kristine Mendoza",
    "Ramon Flores", "Clarissa Domingo", "Bernard Santos", "Jessa Villanueva",
    "John Paul Ocampo", "Maricel Buenaventura", "Francis Dela Torre",
    "Rhea Mae Salvacion", "Nico Evangelista", "Katrina Palma",
    "Aldrin Cabrera", "Sheila Mae Dizon", "Renz Bonifacio", "Lovely Soriano",
]


def generate_subject_text(subjects):
    phrases = []
    for subj in subjects:
        phrase = random.choice(SUBJECT_PHRASES[subj])
        connectors = [
            f"has demonstrated strong knowledge in {phrase}",
            f"consistently excels in {phrase}",
            f"shows excellent understanding of {phrase}",
            f"has performed exceptionally well in {phrase}",
            f"demonstrates competence in {phrase}",
            f"has solid foundations in {phrase}",
            f"exhibits proficiency in {phrase}",
            f"has been my student in {phrase}",
            f"has demonstrated exceptional academic performance in {phrase}",
            f"has excelled in both theoretical and practical aspects of {phrase}",
            f"has shown mastery of {phrase}",
            f"has consistently performed above average in {phrase}",
            f"has a thorough grasp of {phrase}",
            f"has displayed outstanding ability in {phrase}",
            f"has proven their competence in {phrase}",
        ]
        phrases.append(random.choice(connectors))

    if random.random() < 0.35 and len(subjects) > 1:
        listed = " ".join([
            f"{i+1}. {random.choice(SUBJECT_PHRASES[s])}"
            for i, s in enumerate(subjects)
        ])
        return f"This student has been enrolled in the following subjects: {listed}."

    if len(phrases) == 1:
        return f"This student {phrases[0]}."
    elif len(phrases) == 2:
        return f"This student {phrases[0]} and {phrases[1]}."
    else:
        return f"This student {', '.join(phrases[:-1])}, and {phrases[-1]}."


def generate_quality_text(strength):
    if strength not in ['Strong', 'Moderate']:
        return "", []
    num_skills = random.randint(2, 4) if strength == 'Strong' else random.randint(1, 2)
    selected_skills = random.sample(SOFT_SKILLS, num_skills)
    phrases = [random.choice(SOFT_SKILL_PHRASES[skill]) for skill in selected_skills]
    if len(phrases) == 1:
        text = f"This student {phrases[0]}."
    elif len(phrases) == 2:
        text = f"This student {phrases[0]} and {phrases[1]}."
    else:
        text = f"This student {', '.join(phrases[:-1])}, and {phrases[-1]}."
    return text, selected_skills


def fill_template(template, name, subject_text, quality_text):
    """Fill template placeholders including optional faculty/institution tokens."""
    faculty = random.choice(FACULTY_NAMES)
    position = random.choice(POSITIONS)
    institution = random.choice(INSTITUTIONS)
    return template.format(
        name=name,
        subject_text=subject_text,
        quality_text=quality_text,
        faculty=faculty,
        position=position,
        institution=institution,
    )

# ═══════════════════════════════════════════════════════════════
# SAMPLE GENERATORS
# ═══════════════════════════════════════════════════════════════

def generate_clean_sample(strength):
    name = random.choice(NAMES)
    num_subjects = random.randint(1, min(4, len(SUBJECTS)))
    subjects = random.sample(SUBJECTS, num_subjects)
    subject_text = generate_subject_text(subjects)
    quality_text, soft_skills = generate_quality_text(strength)

    if strength == 'Strong':
        template = random.choice(STRONG_TEMPLATES)
    elif strength == 'Moderate':
        template = random.choice(MODERATE_TEMPLATES)
    elif strength == 'Weak':
        template = random.choice(WEAK_TEMPLATES)
        quality_text = ""
        soft_skills = []
    else:
        template = random.choice(NONE_TEMPLATES)
        subjects = []
        subject_text = ""
        quality_text = ""
        soft_skills = []

    text = fill_template(template, name, subject_text, quality_text)
    return {"text": text.strip(), "subjects": subjects, "strength": strength, "softSkills": soft_skills}


def generate_ambiguous_sample():
    name = random.choice(NAMES)
    num_subjects = random.randint(1, 3)
    subjects = random.sample(SUBJECTS, num_subjects)
    subject_text = generate_subject_text(subjects)
    quality_text, soft_skills = generate_quality_text('Moderate')

    choice = random.random()

    if choice < 0.25:
        template = random.choice(AMBIGUOUS_MODERATE_STRONG)
        strength = 'Moderate'
    elif choice < 0.50:
        template = random.choice(AMBIGUOUS_MODERATE_WEAK)
        strength = 'Moderate'
        soft_skills = []
        quality_text = ""
    elif choice < 0.75:
        template = random.choice(AMBIGUOUS_PRAISE_NO_RECOMMENDATION)
        strength = 'Weak'
        soft_skills = []
        quality_text = ""
    else:
        template = random.choice(AMBIGUOUS_STRONG_NO_SUBJECT)
        strength = 'Strong'
        subjects = []
        subject_text = ""

    text = fill_template(template, name, subject_text, quality_text)
    return {"text": text.strip(), "subjects": subjects, "strength": strength, "softSkills": soft_skills}


def generate_noisy_sample(strength):
    sample = generate_clean_sample(strength)
    noise_level = random.choice(['light', 'light', 'medium'])
    sample['text'] = add_ocr_noise(sample['text'], level=noise_level)
    return sample


def generate_short_sample():
    name = random.choice(NAMES)
    faculty = random.choice(FACULTY_NAMES)
    short_templates = [
        f"To Whom It May Concern. {name} is a student in our program. Respectfully.",
        f"This certifies that {name} has completed coursework in our department.",
        f"Re: {name}. I confirm this student is enrolled and has performed satisfactorily.",
        f"{name} — qualified applicant. Recommendation enclosed separately.",
        f"Please accept {name}'s application. This student passed all required subjects.",
        f"I support {name}. Good student. Recommended.",
        f"I am unable to provide a detailed letter at this time. {name} attended my class.",
        f"This is to certify that {name} is a bona fide student. Issued upon request.",
        f"To Whom It May Concern:\nThis certifies {name}'s enrollment. {faculty}.",
        f"Certification of enrollment for {name}. No further endorsement provided.",
    ]
    text = random.choice(short_templates)
    strength = random.choice(['Weak', 'None'])
    return {"text": text.strip(), "subjects": [], "strength": strength, "softSkills": []}


# ═══════════════════════════════════════════════════════════════
# DATASET GENERATION
# ═══════════════════════════════════════════════════════════════

def generate_dataset(n_clean=3200, n_ambiguous=400, n_noisy=300, n_short=100):
    """
    Expanded dataset — 4000 total samples (up from 2000).
    More templates, more phrase variety, Filipino institutional language.
    """
    samples = []

    distribution = {
        'Strong':   int(n_clean * 0.35),
        'Moderate': int(n_clean * 0.30),
        'Weak':     int(n_clean * 0.20),
        'None':     int(n_clean * 0.15),
    }
    for strength, count in distribution.items():
        for _ in range(count):
            samples.append(generate_clean_sample(strength))

    for _ in range(n_ambiguous):
        samples.append(generate_ambiguous_sample())

    noisy_dist = {
        'Strong':   int(n_noisy * 0.35),
        'Moderate': int(n_noisy * 0.30),
        'Weak':     int(n_noisy * 0.20),
        'None':     int(n_noisy * 0.15),
    }
    for strength, count in noisy_dist.items():
        for _ in range(count):
            samples.append(generate_noisy_sample(strength))

    for _ in range(n_short):
        samples.append(generate_short_sample())

    random.shuffle(samples)
    return samples


if __name__ == '__main__':
    random.seed(42)

    dataset = generate_dataset(
        n_clean=3200,
        n_ambiguous=400,
        n_noisy=300,
        n_short=100,
    )

    output_path = os.path.join(os.path.dirname(__file__), 'training_data.json')
    with open(output_path, 'w') as f:
        json.dump(dataset, f, indent=2)

    total = len(dataset)
    print(f"✅ Generated {total} training samples")
    print(f"📁 Saved to: {output_path}")

    from collections import Counter
    strengths = Counter(s['strength'] for s in dataset)
    print(f"\nStrength distribution:")
    for k in ['Strong', 'Moderate', 'Weak', 'None']:
        pct = strengths[k] / total * 100
        print(f"  {k:>10}: {strengths[k]:>4}  ({pct:.1f}%)")

    all_subjects = []
    for s in dataset:
        all_subjects.extend(s['subjects'])
    subject_counts = Counter(all_subjects)
    print(f"\nSubject frequency:")
    for k, v in sorted(subject_counts.items(), key=lambda x: -x[1]):
        print(f"  {k}: {v}")
