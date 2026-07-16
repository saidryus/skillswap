"""
Generate synthetic training data for the Tutor Feedback ML model.

Creates labeled examples of tutor reviews with:
- Sentiment classification (Positive/Neutral/Negative)
- Teaching strengths extraction (multi-label)
- Improvement areas extraction (multi-label)
- Topics mentioned extraction (multi-label)

Run: python generate_training_data.py
Output: training_data.json
"""

import json
import random
import os

# ═══════════════════════════════════════════════════════════════
# LABELS
# ═══════════════════════════════════════════════════════════════

STRENGTHS = [
    "Clear Explanations",
    "Communication",
    "Patience",
    "Problem Solving",
    "Teaching Ability",
    "Encouraging",
    "Preparedness",
    "Knowledgeable",
    "Engagement",
    "Professionalism",
]

IMPROVEMENTS = [
    "Teaching Pace",
    "Time Management",
    "Clarity",
    "Examples Needed",
    "Organization",
    "Interaction",
    "Confidence",
]

TOPICS = [
    "Recursion",
    "Object-Oriented Programming",
    "SQL",
    "Normalization",
    "Networking",
    "Cybersecurity",
    "Data Structures",
    "Algorithms",
    "Web Development",
    "HTML CSS",
    "JavaScript",
    "Python",
    "Java",
    "Linux",
    "Server Administration",
    "Database Design",
    "API Development",
    "Version Control",
]

# ═══════════════════════════════════════════════════════════════
# PHRASE TEMPLATES BY STRENGTH
# ═══════════════════════════════════════════════════════════════

STRENGTH_PHRASES = {
    "Clear Explanations": [
        "explained things really clearly",
        "made the topic easy to understand",
        "broke down complex concepts into simple terms",
        "explained it in a way that made sense",
        "very clear in explaining",
        "I finally understood the topic because of how well it was explained",
        "the explanations were straightforward and easy to follow",
    ],
    "Communication": [
        "communicated well throughout the session",
        "great at communicating ideas",
        "easy to talk to and ask questions",
        "always made sure I understood before moving on",
        "very approachable and easy to communicate with",
        "good at verbalizing solutions step by step",
    ],
    "Patience": [
        "was very patient with me",
        "never got frustrated when I asked questions",
        "patiently explained it multiple times",
        "took time to make sure I got it",
        "was patient even when I kept making the same mistake",
        "didn't rush me at all",
        "waited for me to think through problems",
    ],
    "Problem Solving": [
        "helped me work through problems step by step",
        "great at guiding me to the solution without giving it away",
        "taught me how to approach problems differently",
        "showed different ways to solve the same problem",
        "helped me debug my code effectively",
        "walked me through the logic clearly",
    ],
    "Teaching Ability": [
        "really good at teaching",
        "natural teacher",
        "has a gift for explaining things",
        "makes learning fun and engaging",
        "knows how to teach at my level",
        "adapted the explanation to how I learn",
    ],
    "Encouraging": [
        "very encouraging throughout",
        "made me feel like I could do it",
        "always positive and supportive",
        "encouraged me to try on my own",
        "boosted my confidence",
        "never made me feel dumb for not knowing",
    ],
    "Preparedness": [
        "came prepared with examples",
        "had materials ready",
        "clearly prepared for the session",
        "brought practice problems that were helpful",
        "well-organized session",
    ],
    "Knowledgeable": [
        "clearly knows the subject well",
        "very knowledgeable about the topic",
        "could answer all my questions",
        "deep understanding of the material",
        "knows the subject inside and out",
    ],
    "Engagement": [
        "kept me engaged the whole time",
        "made the session interactive",
        "asked me questions to check understanding",
        "made it feel like a conversation not a lecture",
        "kept things interesting throughout",
    ],
    "Professionalism": [
        "very professional and punctual",
        "started on time and stayed focused",
        "was respectful of my time",
        "maintained a professional attitude",
        "organized and efficient",
    ],
}

IMPROVEMENT_PHRASES = {
    "Teaching Pace": [
        "moved a bit too fast",
        "sometimes went too quickly through topics",
        "could slow down a little",
        "rushed through the last part",
        "pace was a bit fast for beginners",
        "should give more time to absorb information",
    ],
    "Time Management": [
        "ran out of time before covering everything",
        "we didn't finish all the topics",
        "could manage time better",
        "spent too long on the easy parts",
        "should allocate time more evenly",
    ],
    "Clarity": [
        "some explanations were confusing",
        "wasn't always clear in explaining",
        "could be clearer when explaining certain parts",
        "I got lost during some explanations",
        "needs to simplify some concepts more",
    ],
    "Examples Needed": [
        "could use more examples",
        "would help to see more code examples",
        "needs more practical examples",
        "more real-world examples would be helpful",
        "theory was good but needed more hands-on",
    ],
    "Organization": [
        "session felt a bit disorganized",
        "jumped between topics",
        "could structure the session better",
        "would help to have an outline",
        "topics were a bit scattered",
    ],
    "Interaction": [
        "could ask more questions to check understanding",
        "felt more like a lecture than tutoring",
        "should check in more often",
        "didn't really ask if I was following",
        "more interaction would help",
    ],
    "Confidence": [
        "seemed a bit unsure at times",
        "could be more confident in explanations",
        "hesitated when answering some questions",
        "would benefit from more confidence",
    ],
}

TOPIC_PHRASES = {
    "Recursion": ["recursion", "recursive functions", "recursive calls", "base case and recursive case"],
    "Object-Oriented Programming": ["OOP", "object-oriented", "classes and objects", "inheritance and polymorphism", "encapsulation"],
    "SQL": ["SQL", "SQL queries", "SELECT statements", "JOINs in SQL", "database queries"],
    "Normalization": ["normalization", "database normalization", "normal forms", "1NF 2NF 3NF"],
    "Networking": ["networking", "TCP/IP", "network protocols", "subnetting", "OSI model"],
    "Cybersecurity": ["cybersecurity", "security", "encryption", "firewalls", "vulnerabilities"],
    "Data Structures": ["data structures", "linked lists", "stacks and queues", "trees", "hash tables"],
    "Algorithms": ["algorithms", "sorting algorithms", "binary search", "time complexity", "Big O notation"],
    "Web Development": ["web development", "building websites", "frontend development", "backend development"],
    "HTML CSS": ["HTML", "CSS", "styling", "responsive design", "flexbox"],
    "JavaScript": ["JavaScript", "JS", "async await", "DOM manipulation", "event handling"],
    "Python": ["Python", "Python programming", "Python syntax", "Python libraries"],
    "Java": ["Java", "Java programming", "Java classes", "Java syntax"],
    "Linux": ["Linux", "terminal commands", "command line", "bash", "shell scripting"],
    "Server Administration": ["server admin", "server management", "deployment", "server configuration"],
    "Database Design": ["database design", "ER diagrams", "schema design", "table relationships"],
    "API Development": ["API", "REST API", "endpoints", "API design", "HTTP methods"],
    "Version Control": ["Git", "version control", "branching", "commits", "GitHub"],
}

# ═══════════════════════════════════════════════════════════════
# GENERATION
# ═══════════════════════════════════════════════════════════════

def generate_positive():
    strengths = random.sample(STRENGTHS, random.randint(2, 4))
    topics = random.sample(TOPICS, random.randint(1, 3))
    
    parts = []
    for s in strengths:
        parts.append(random.choice(STRENGTH_PHRASES[s]))
    for t in topics:
        phrase = random.choice(TOPIC_PHRASES[t])
        connectors = [f"during the {phrase} lesson", f"especially when covering {phrase}", f"the part about {phrase} was great", f"helped me with {phrase}"]
        parts.append(random.choice(connectors))
    
    random.shuffle(parts)
    text = ". ".join(p.capitalize() for p in parts) + "."
    # Sometimes add overall praise
    if random.random() < 0.5:
        endings = ["Overall great session!", "Would definitely book again.", "Highly recommend this tutor.", "Best tutoring session I've had.", "Very helpful session."]
        text += " " + random.choice(endings)
    
    return {"text": text, "sentiment": "Positive", "strengths": strengths, "improvements": [], "topics": topics}


def generate_negative():
    improvements = random.sample(IMPROVEMENTS, random.randint(2, 3))
    topics = random.sample(TOPICS, random.randint(1, 2))
    
    parts = []
    for imp in improvements:
        parts.append(random.choice(IMPROVEMENT_PHRASES[imp]))
    for t in topics:
        phrase = random.choice(TOPIC_PHRASES[t])
        parts.append(f"struggled with {phrase} and didn't get much help")
    
    random.shuffle(parts)
    text = ". ".join(p.capitalize() for p in parts) + "."
    if random.random() < 0.4:
        endings = ["Not the best experience.", "Might try a different tutor next time.", "Expected more from the session.", "Left feeling confused."]
        text += " " + random.choice(endings)
    
    return {"text": text, "sentiment": "Negative", "strengths": [], "improvements": improvements, "topics": topics}


def generate_mixed():
    strengths = random.sample(STRENGTHS, random.randint(1, 3))
    improvements = random.sample(IMPROVEMENTS, random.randint(1, 2))
    topics = random.sample(TOPICS, random.randint(1, 2))
    
    parts = []
    for s in strengths:
        parts.append(random.choice(STRENGTH_PHRASES[s]))
    for imp in improvements:
        connector = random.choice(["but", "however", "though", "although"])
        parts.append(f"{connector} {random.choice(IMPROVEMENT_PHRASES[imp])}")
    for t in topics:
        phrase = random.choice(TOPIC_PHRASES[t])
        parts.append(f"we covered {phrase}")
    
    random.shuffle(parts)
    text = ". ".join(p.capitalize() for p in parts) + "."
    
    # Mixed can be positive-leaning or negative-leaning
    sentiment = "Positive" if len(strengths) > len(improvements) else "Neutral"
    return {"text": text, "sentiment": sentiment, "strengths": strengths, "improvements": improvements, "topics": topics}


def generate_neutral():
    topics = random.sample(TOPICS, random.randint(1, 2))
    
    neutral_phrases = [
        "The session was okay",
        "It was a standard tutoring session",
        "Nothing special but nothing bad either",
        "Average session",
        "The session was fine",
        "Got some help with my work",
        "Tutor was available and we went through the material",
    ]
    
    parts = [random.choice(neutral_phrases)]
    for t in topics:
        phrase = random.choice(TOPIC_PHRASES[t])
        parts.append(f"we worked on {phrase}")
    
    text = ". ".join(p.capitalize() for p in parts) + "."
    return {"text": text, "sentiment": "Neutral", "strengths": [], "improvements": [], "topics": topics}


def generate_dataset(n=1200):
    samples = []
    # 40% positive, 25% mixed, 20% negative, 15% neutral
    for _ in range(int(n * 0.40)):
        samples.append(generate_positive())
    for _ in range(int(n * 0.25)):
        samples.append(generate_mixed())
    for _ in range(int(n * 0.20)):
        samples.append(generate_negative())
    for _ in range(int(n * 0.15)):
        samples.append(generate_neutral())
    
    random.shuffle(samples)
    return samples


if __name__ == '__main__':
    random.seed(123)
    dataset = generate_dataset(1200)
    
    output_path = os.path.join(os.path.dirname(__file__), 'training_data.json')
    with open(output_path, 'w') as f:
        json.dump(dataset, f, indent=2)
    
    print(f"✅ Generated {len(dataset)} training samples")
    
    from collections import Counter
    sentiments = Counter(s['sentiment'] for s in dataset)
    print(f"\nSentiment distribution:")
    for k, v in sentiments.items():
        print(f"  {k}: {v}")
