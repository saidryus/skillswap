/**
 * TRUNCATE ALL — Wipes all collections EXCEPT the admin account.
 * Use this to reset the demo without losing admin login.
 *
 * Usage: node truncate-all.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const Department = require('./models/Department');
const TutorProfile = require('./models/TutorProfile');
const Session = require('./models/Session');
const StudentSchedule = require('./models/StudentSchedule');
const Announcement = require('./models/Announcement');
const Notification = require('./models/Notification');
const Rating = require('./models/Rating');
const Settings = require('./models/Settings');

async function truncate() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB\n');

  // Wipe everything EXCEPT admin users
  await Course.deleteMany();
  await Department.deleteMany();
  await TutorProfile.deleteMany();
  await Session.deleteMany();
  await StudentSchedule.deleteMany();
  await Announcement.deleteMany();
  await Notification.deleteMany();
  await Rating.deleteMany();
  await Settings.deleteMany();

  // Delete all students but keep admins
  await User.deleteMany({ role: { $ne: 'admin' } });

  console.log('✗ Cleared all collections (admin accounts preserved)');

  // Ensure admin exists
  const admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    await User.create({
      firstName: 'Admin', lastName: 'Acadia',
      email: 'admin@acadia.edu', password: 'admin123',
      role: 'admin', isSuperAdmin: true, department: '',
    });
    console.log('✓ Admin re-created (admin@acadia.edu / admin123)');
  } else {
    console.log(`✓ Admin preserved: ${admin.email}`);
  }

  // Re-create settings
  await Settings.create({ key: 'global', studentIdPrefix: 'SS', studentIdCounter: 0 });
  console.log('✓ Settings reset');

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ TRUNCATE COMPLETE — Admin account ready');
  console.log('   Login: admin@acadia.edu / admin123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  process.exit(0);
}

truncate().catch((err) => { console.error(err); process.exit(1); });

