require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const StudentSchedule = require('./models/StudentSchedule');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const studentId = '23063670';
  const email = 'simone.makinano@student.skillswap.edu';

  // Remove existing test student and their schedule if present
  const existing = await User.findOne({ studentIdNumber: studentId });
  if (existing) {
    await StudentSchedule.deleteMany({ student: existing._id });
    await User.findByIdAndDelete(existing._id);
    console.log('Cleared existing test student and schedule');
  }

  // Create fresh student — no schedule, mustChangePassword = false so you can log in directly
  const student = await User.create({
    firstName: 'Simone Dominique',
    lastName: 'Makinano',
    email,
    password: '670', // last 3 digits of student ID
    studentIdNumber: studentId,
    role: 'student',
    yearLevel: 2,
    department: 'Information Technology',
    mustChangePassword: false, // skip password change so you can test OCR right away
  });

  console.log('\n✅ Test student created!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Student ID: ${studentId}`);
  console.log(`  Password:   670`);
  console.log(`  Name:       ${student.firstName} ${student.lastName}`);
  console.log(`  Year Level: ${student.yearLevel}`);
  console.log(`  Schedule:   EMPTY (ready for OCR upload test)`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\nLogin with: 23063670 / 670');
  console.log('Then go to My Schedule → Upload your study load PDF');

  process.exit(0);
};

run().catch((err) => { console.error(err); process.exit(1); });
