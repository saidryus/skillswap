require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const StudentSchedule = require('./models/StudentSchedule');

// Same schedule as Simone (23063670)
const SCHEDULE_ENTRIES = [
  { day: 'Tuesday', startTime: '10:30', endTime: '12:00', label: '32094 - IT-SYSADMN32 (LAB)' },
  { day: 'Thursday', startTime: '10:30', endTime: '12:00', label: '32094 - IT-SYSADMN32 (LAB)' },
  { day: 'Monday', startTime: '13:30', endTime: '14:30', label: '32227 - IT-FRE (LEC)' },
  { day: 'Wednesday', startTime: '13:30', endTime: '14:30', label: '32227 - IT-FRE (LEC)' },
  { day: 'Friday', startTime: '13:30', endTime: '14:30', label: '32227 - IT-FRE (LEC)' },
  { day: 'Saturday', startTime: '15:30', endTime: '18:31', label: '32144 - IT-EL (LAB)' },
  { day: 'Saturday', startTime: '13:30', endTime: '15:30', label: '32136 - IT-EL (LEC)' },
  { day: 'Tuesday', startTime: '15:00', endTime: '16:30', label: '32128 - CC-TECHNO32 (LEC)' },
  { day: 'Thursday', startTime: '15:00', endTime: '16:30', label: '32128 - CC-TECHNO32 (LEC)' },
  { day: 'Tuesday', startTime: '12:30', endTime: '13:30', label: '32102 - IT-INTPROG32 (LEC)' },
  { day: 'Thursday', startTime: '12:30', endTime: '13:30', label: '32102 - IT-INTPROG32 (LEC)' },
  { day: 'Tuesday', startTime: '09:00', endTime: '10:00', label: '32086 - IT-SYSADMN32 (LEC)' },
  { day: 'Thursday', startTime: '09:00', endTime: '10:00', label: '32086 - IT-SYSADMN32 (LEC)' },
  { day: 'Monday', startTime: '14:30', endTime: '15:30', label: '32078 - IT-SYSARCH32 (LAB)' },
  { day: 'Wednesday', startTime: '14:30', endTime: '15:30', label: '32078 - IT-SYSARCH32 (LAB)' },
  { day: 'Friday', startTime: '14:30', endTime: '15:30', label: '32078 - IT-SYSARCH32 (LAB)' },
  { day: 'Monday', startTime: '15:30', endTime: '16:30', label: '32060 - IT-SYSARCH32 (LEC)' },
  { day: 'Wednesday', startTime: '15:30', endTime: '16:30', label: '32060 - IT-SYSARCH32 (LEC)' },
  { day: 'Monday', startTime: '10:30', endTime: '11:30', label: '32052 - IT-IMDBSYS32 (LAB)' },
  { day: 'Wednesday', startTime: '10:30', endTime: '11:30', label: '32052 - IT-IMDBSYS32 (LAB)' },
  { day: 'Friday', startTime: '10:30', endTime: '11:30', label: '32052 - IT-IMDBSYS32 (LAB)' },
  { day: 'Monday', startTime: '11:30', endTime: '12:30', label: '32045 - IT-IMDBSYS32 (LEC)' },
  { day: 'Wednesday', startTime: '11:30', endTime: '12:30', label: '32045 - IT-IMDBSYS32 (LEC)' },
  { day: 'Monday', startTime: '08:30', endTime: '09:30', label: '32037 - IT-INFOSEC32 (LAB)' },
  { day: 'Wednesday', startTime: '08:30', endTime: '09:30', label: '32037 - IT-INFOSEC32 (LAB)' },
  { day: 'Friday', startTime: '08:30', endTime: '09:30', label: '32037 - IT-INFOSEC32 (LAB)' },
  { day: 'Tuesday', startTime: '13:30', endTime: '15:00', label: '32110 - IT-INTPROG32 (LAB)' },
  { day: 'Thursday', startTime: '13:30', endTime: '15:00', label: '32110 - IT-INTPROG32 (LAB)' },
  { day: 'Monday', startTime: '09:30', endTime: '10:30', label: '32029 - IT-INFOSEC32 (LEC)' },
  { day: 'Wednesday', startTime: '09:30', endTime: '10:30', label: '32029 - IT-INFOSEC32 (LEC)' },
];

const NEW_STUDENTS = [
  { firstName: 'Marco', lastName: 'Villanueva', studentIdNumber: '23063671', email: 'marco.villanueva@student.skillswap.edu' },
  { firstName: 'Angela', lastName: 'Tan', studentIdNumber: '23063672', email: 'angela.tan@student.skillswap.edu' },
  { firstName: 'Kyle', lastName: 'Reyes', studentIdNumber: '23063673', email: 'kyle.reyes@student.skillswap.edu' },
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  for (const s of NEW_STUDENTS) {
    // Remove existing if present
    const existing = await User.findOne({ studentIdNumber: s.studentIdNumber });
    if (existing) {
      await StudentSchedule.deleteMany({ student: existing._id });
      await User.findByIdAndDelete(existing._id);
      console.log(`  Cleared existing: ${s.studentIdNumber}`);
    }

    const password = s.studentIdNumber.slice(-3);
    const student = await User.create({
      ...s,
      password,
      role: 'student',
      yearLevel: 2,
      department: 'Information Technology',
      mustChangePassword: false,
    });

    // Create schedule entries
    for (const entry of SCHEDULE_ENTRIES) {
      await StudentSchedule.create({ student: student._id, ...entry });
    }

    console.log(`  ✅ Created: ${s.firstName} ${s.lastName} (${s.studentIdNumber} / ${password}) — ${SCHEDULE_ENTRIES.length} schedule entries`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('New test accounts:');
  for (const s of NEW_STUDENTS) {
    const pw = s.studentIdNumber.slice(-3);
    console.log(`  ${s.firstName} ${s.lastName} → ID: ${s.studentIdNumber} / Password: ${pw}`);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  process.exit(0);
};

run().catch((err) => { console.error(err); process.exit(1); });
