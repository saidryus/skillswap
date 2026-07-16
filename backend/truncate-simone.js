/**
 * TRUNCATE SIMONE — Resets Simone's data so you can redo the demo.
 * Clears her schedule, tutor profiles, sessions, ratings, and notifications.
 * Resets mustChangePassword to true.
 *
 * Usage: node truncate-simone.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const TutorProfile = require('./models/TutorProfile');
const Session = require('./models/Session');
const StudentSchedule = require('./models/StudentSchedule');
const Notification = require('./models/Notification');
const Rating = require('./models/Rating');

async function truncateSimone() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB\n');

  const simone = await User.findOne({ studentIdNumber: '23063670' });
  if (!simone) {
    console.log('❌ Simone not found (23063670). Run seed-demo.js first.');
    process.exit(1);
  }

  // Clear all Simone's data
  const scheduleCount = await StudentSchedule.deleteMany({ student: simone._id });
  const profileCount = await TutorProfile.deleteMany({ tutor: simone._id });
  const sessionCount = await Session.deleteMany({ $or: [{ tutor: simone._id }, { tutees: simone._id }] });
  const ratingCount = await Rating.deleteMany({ $or: [{ tutor: simone._id }, { ratedBy: simone._id }] });
  const notifCount = await Notification.deleteMany({ recipient: simone._id });

  // Reset her account state
  await User.findByIdAndUpdate(simone._id, {
    isTutor: false,
    mustChangePassword: true,
  });

  console.log('✓ Simone reset:');
  console.log(`  - ${scheduleCount.deletedCount} schedule entries deleted`);
  console.log(`  - ${profileCount.deletedCount} tutor profiles deleted`);
  console.log(`  - ${sessionCount.deletedCount} sessions deleted`);
  console.log(`  - ${ratingCount.deletedCount} ratings deleted`);
  console.log(`  - ${notifCount.deletedCount} notifications deleted`);
  console.log('  - mustChangePassword = true');
  console.log('  - isTutor = false');
  console.log('');
  console.log('✅ Simone is fresh — ready for demo again (23063670 / 670)');

  process.exit(0);
}

truncateSimone().catch((err) => { console.error(err); process.exit(1); });
