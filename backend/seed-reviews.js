/**
 * Seed reviews with comments for Simone Dominique Makinano
 * Creates completed sessions + ratings with written feedback
 * so the ML feedback insights appear on her tutor card.
 *
 * Usage: node seed-reviews.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const Session = require('./models/Session');
const Rating = require('./models/Rating');
const TutorProfile = require('./models/TutorProfile');

const REVIEWS = [
  {
    score: 5,
    comment: "Simone explained recursion and data structures really clearly. She was very patient when I kept asking questions about linked lists. Great communication skills and she used real-world examples that made everything click.",
  },
  {
    score: 5,
    comment: "Excellent tutor! She broke down complex SQL queries into simple steps. Her teaching ability is impressive and she prepared practice problems that were really helpful. Very knowledgeable about database normalization.",
  },
  {
    score: 4,
    comment: "Good session on web development. She knows HTML CSS and JavaScript well. Sometimes she moved a bit too quickly through the advanced topics but overall very helpful and encouraging.",
  },
  {
    score: 5,
    comment: "She helped me understand object-oriented programming and inheritance. Very patient and professional. She adapted her explanations when I didn't get it the first time. Strong problem solving approach.",
  },
  {
    score: 4,
    comment: "Simone is knowledgeable about networking and TCP/IP protocols. The session was well organized. Could use a few more practical examples but her explanations were clear and easy to follow.",
  },
  {
    score: 5,
    comment: "Amazing tutor for database systems. She walked me through ER diagrams and normalization step by step. Great communication and leadership in guiding the session. Highly recommend.",
  },
  {
    score: 3,
    comment: "The session on algorithms was okay. She knows the material but sometimes the pace was too fast. Needed more time for the sorting algorithms section. Could improve time management.",
  },
  {
    score: 5,
    comment: "Best tutoring session I've had. Simone explained Python programming fundamentals in a way that made sense. She was encouraging and patient. Her teaching ability really stands out.",
  },
  {
    score: 4,
    comment: "Helpful session on cybersecurity and encryption. She demonstrated the concepts well and was prepared with materials. Would appreciate more hands-on coding examples next time.",
  },
  {
    score: 5,
    comment: "Simone is an excellent tutor for web development. She helped me with API development and JavaScript. Very engaging session with lots of interaction. She checks if you understand before moving on.",
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Find Simone
  const simone = await User.findOne({ studentIdNumber: '23063670' });
  if (!simone) {
    console.log('❌ Simone not found. Run seed-demo.js first.');
    process.exit(1);
  }
  console.log(`Found Simone: ${simone.firstName} ${simone.lastName} (${simone._id})`);

  // Find her approved tutor profile
  const profile = await TutorProfile.findOne({ tutor: simone._id, status: 'approved' }).populate('course');
  if (!profile) {
    console.log('❌ Simone has no approved tutor profile. Approve her application first.');
    process.exit(1);
  }
  console.log(`Tutor profile for: ${profile.course.courseCode} — ${profile.course.courseName}`);

  // Find other students to be the reviewers
  const reviewers = await User.find({ 
    role: 'student', 
    _id: { $ne: simone._id },
    isActive: true 
  }).limit(10);

  if (reviewers.length < 5) {
    console.log('❌ Need at least 5 other students. Run seed-demo.js first.');
    process.exit(1);
  }
  console.log(`Found ${reviewers.length} reviewers`);

  // Create completed sessions + ratings
  let created = 0;
  for (let i = 0; i < Math.min(REVIEWS.length, reviewers.length); i++) {
    const reviewer = reviewers[i];
    const review = REVIEWS[i];

    // Create a completed session
    const sessionDate = new Date();
    sessionDate.setDate(sessionDate.getDate() - (i + 1) * 3); // spread over past weeks

    const session = await Session.create({
      tutor: simone._id,
      tutees: [reviewer._id],
      course: profile.course._id,
      date: sessionDate,
      startTime: '14:00',
      endTime: '15:00',
      venue: 'Library Study Room',
      venueType: 'on-campus',
      status: 'completed',
    });

    // Check if rating already exists
    const existing = await Rating.findOne({ session: session._id, ratedBy: reviewer._id });
    if (!existing) {
      await Rating.create({
        session: session._id,
        tutor: simone._id,
        ratedBy: reviewer._id,
        course: profile.course._id,
        score: review.score,
        comment: review.comment,
      });
      created++;
      console.log(`  ✓ Review ${created}: ${review.score}★ by ${reviewer.firstName} — "${review.comment.substring(0, 50)}..."`);
    }
  }

  console.log(`\n✅ Seeded ${created} reviews for Simone`);
  console.log('   Restart the feedback ML service (port 5003) to see insights on her card.');
  
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
