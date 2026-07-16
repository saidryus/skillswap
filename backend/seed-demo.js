/**
 * DEMO SEED — Sets up the demo environment with IT department, courses, and student accounts.
 * Run after truncate-all.js for a fresh start.
 *
 * Usage: node seed-demo.js
 * 
 * What it creates:
 * - Information Technology department
 * - All IT courses (30 subjects)
 * - Simone (23063670) — Year 3, NO schedule (you upload live)
 * - Rafael (23063672) — Year 3, WITH schedule
 * - Announcements
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const Department = require('./models/Department');
const StudentSchedule = require('./models/StudentSchedule');
const Announcement = require('./models/Announcement');
const Notification = require('./models/Notification');

// IT Courses (UC-CCS BSIT Curriculum)
const COURSES = [
  { courseCode: 'CC-INTCOM11', courseName: 'Introduction to Computing', units: 3, yearLevel: 1, semester: 1 },
  { courseCode: 'CC-COMPROG11', courseName: 'Computer Programming 1', units: 3, yearLevel: 1, semester: 1 },
  { courseCode: 'IT-WEBDEV11', courseName: 'Web Design & Development', units: 2, yearLevel: 1, semester: 1 },
  { courseCode: 'CC-COMPROG12', courseName: 'Computer Programming 2', units: 3, yearLevel: 1, semester: 2 },
  { courseCode: 'CC-DISCRET12', courseName: 'Discrete Structures', units: 2, yearLevel: 1, semester: 2 },
  { courseCode: 'CC-DIGILOG21', courseName: 'Digital Logic Design', units: 3, yearLevel: 2, semester: 1 },
  { courseCode: 'CC-DASTRUC21', courseName: 'Data Structures & Algorithms', units: 3, yearLevel: 2, semester: 1 },
  { courseCode: 'IT-OOPROG21', courseName: 'Object Oriented Programming', units: 3, yearLevel: 2, semester: 1 },
  { courseCode: 'CC-ACCTG21', courseName: 'Accounting for IT', units: 3, yearLevel: 2, semester: 1 },
  { courseCode: 'CC-TWRITE21', courseName: 'Tech. Writing & Presentation Skills in IT', units: 3, yearLevel: 2, semester: 1 },
  { courseCode: 'CC-QUAMETH22', courseName: 'Quantitative Methods w/ Prob. Stat.', units: 3, yearLevel: 2, semester: 2 },
  { courseCode: 'IT-PLATECH22', courseName: 'Platform Technologies w/ Op. Sys.', units: 3, yearLevel: 2, semester: 2 },
  { courseCode: 'CC-APPSDEV22', courseName: "Applications Dev't & Emerging Tech.", units: 3, yearLevel: 2, semester: 2 },
  { courseCode: 'CC-DATACOM22', courseName: 'Data Communications', units: 3, yearLevel: 2, semester: 2 },
  { courseCode: 'IT-SAD22', courseName: 'System Analysis & Design', units: 3, yearLevel: 2, semester: 2 },
  { courseCode: 'IT-IMDBSYS31', courseName: 'Information Management (DB Sys. 1)', units: 3, yearLevel: 3, semester: 1 },
  { courseCode: 'IT-NETWORK31', courseName: 'Computer Networks', units: 3, yearLevel: 3, semester: 1 },
  { courseCode: 'IT-TESTQUA31', courseName: 'Testing & Quality Assurance', units: 3, yearLevel: 3, semester: 1 },
  { courseCode: 'CC-HCI31', courseName: 'Human Computer Interaction', units: 3, yearLevel: 3, semester: 1 },
  { courseCode: 'CC-RESCOM31', courseName: 'Methods of Research in Computing', units: 3, yearLevel: 3, semester: 1 },
  { courseCode: 'IT-IMDBSYS32', courseName: 'Information Management (DB Sys. 2)', units: 3, yearLevel: 3, semester: 2 },
  { courseCode: 'IT-INFOSEC32', courseName: 'Information Assurance & Security', units: 3, yearLevel: 3, semester: 2 },
  { courseCode: 'IT-SYSARCH32', courseName: 'System Integration & Architecture', units: 3, yearLevel: 3, semester: 2 },
  { courseCode: 'CC-TECHNO32', courseName: 'Technopreneurship', units: 3, yearLevel: 3, semester: 2 },
  { courseCode: 'IT-INTPROG32', courseName: 'Integrative Prog & Technologies', units: 3, yearLevel: 3, semester: 2 },
  { courseCode: 'IT-SYSADMN32', courseName: 'Systems Administration & Maintenance', units: 3, yearLevel: 3, semester: 2 },
  { courseCode: 'IT-CPSTONE30', courseName: 'Capstone Project 1', units: 3, yearLevel: 4, semester: 1 },
  { courseCode: 'CC-PROFIS10', courseName: 'Professional Issues in Computing', units: 3, yearLevel: 4, semester: 1 },
  { courseCode: 'IT-CPSTONE40', courseName: 'Capstone Project 2', units: 3, yearLevel: 4, semester: 1 },
  { courseCode: 'CC-PRACT40', courseName: 'Practicum', units: 9, yearLevel: 4, semester: 2 },
];

async function seedDemo() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB\n');
  console.log('━━━ DEMO SEED ━━━\n');

  // Ensure admin exists
  let admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    admin = await User.create({
      firstName: 'Admin', lastName: 'Acadia',
      email: 'admin@acadia.edu', password: 'admin123',
      role: 'admin', isSuperAdmin: true,
    });
    console.log('✓ Admin created');
  } else {
    console.log('✓ Admin exists');
  }

  // ═══ DEPARTMENT ═══
  let dept = await Department.findOne({ code: 'IT' });
  if (!dept) {
    dept = await Department.create({ name: 'Information Technology', code: 'IT', description: 'College of Computer Studies — BSIT Program' });
    console.log('✓ IT Department created');
  } else {
    console.log('✓ IT Department exists');
  }

  // ═══ COURSES ═══
  let coursesCreated = 0;
  for (const c of COURSES) {
    const exists = await Course.findOne({ courseCode: c.courseCode });
    if (!exists) {
      await Course.create({ ...c, department: 'Information Technology' });
      coursesCreated++;
    }
  }
  console.log(`✓ ${coursesCreated} courses created (${COURSES.length - coursesCreated} already existed)`);

  // ═══ DEMO ACCOUNT: Simone (23063670) ═══
  // Simone has mustChangePassword = true to demo the forced password change
  let simone = await User.findOne({ studentIdNumber: '23063670' });
  if (!simone) {
    simone = await User.create({
      studentIdNumber: '23063670',
      firstName: 'Simone Dominique', lastName: 'Makinano',
      email: 'simone.makinano@student.uc.edu',
      password: '670',
      role: 'student', yearLevel: 3, currentSemester: 2,
      department: 'Information Technology',
      isActive: true, mustChangePassword: true,
    });
    console.log('✓ Created Simone (23063670 / 670, must change password)');
  } else {
    await User.findByIdAndUpdate(simone._id, { mustChangePassword: true });
    console.log('✓ Simone exists — forced password change enabled');
  }

  // Simone has NO schedule — she'll upload it live during the demo
  console.log('✓ Simone has no schedule (will upload live during demo)');

  // ═══ DEMO TUTEE: Rafael (year 3, will book a session with Simone) ═══
  let rafael = await User.findOne({ studentIdNumber: '202203001' });
  if (!rafael) {
    rafael = await User.create({
      studentIdNumber: '202203001',
      firstName: 'Rafael', lastName: 'Dela Cruz',
      email: 'rafael.delacruz@student.uc.edu',
      password: '001',
      role: 'student', yearLevel: 3, currentSemester: 2,
      department: 'Information Technology',
      isActive: true, mustChangePassword: false,
      maxSessionsPerWeek: 6,
    });
    console.log('✓ Created Rafael (202203001 / 001, Year 3)');
  } else {
    await User.findByIdAndUpdate(rafael._id, { mustChangePassword: false });
    console.log('✓ Rafael exists — updated for demo');
  }

  // Rafael's schedule (year 3, 2nd sem)
  const rafaelScheduleCount = await StudentSchedule.countDocuments({ student: rafael._id });
  if (rafaelScheduleCount === 0) {
    const rafaelSchedule = [
      { day: 'Monday', startTime: '07:30', endTime: '09:00', label: '32094 - IT-SYSADMN32 (LEC)' },
      { day: 'Monday', startTime: '10:30', endTime: '12:00', label: '32095 - IT-INTPROG32 (LEC)' },
      { day: 'Tuesday', startTime: '07:30', endTime: '09:00', label: '32096 - IT-IMDBSYS32 (LEC)' },
      { day: 'Tuesday', startTime: '13:00', endTime: '14:30', label: '32097 - IT-INFOSEC32 (LEC)' },
      { day: 'Wednesday', startTime: '07:30', endTime: '09:00', label: '32094 - IT-SYSADMN32 (LAB)' },
      { day: 'Wednesday', startTime: '13:00', endTime: '14:30', label: '32098 - IT-SYSARCH32 (LEC)' },
      { day: 'Thursday', startTime: '07:30', endTime: '09:00', label: '32095 - IT-INTPROG32 (LAB)' },
      { day: 'Thursday', startTime: '10:30', endTime: '12:00', label: '32099 - CC-TECHNO32 (LEC)' },
      { day: 'Friday', startTime: '07:30', endTime: '09:00', label: '32096 - IT-IMDBSYS32 (LAB)' },
      { day: 'Friday', startTime: '13:00', endTime: '14:30', label: '32097 - IT-INFOSEC32 (LAB)' },
    ];
    for (const entry of rafaelSchedule) {
      await StudentSchedule.create({ student: rafael._id, ...entry });
    }
    console.log('✓ Rafael schedule created (10 entries — Year 3 load)');
  }

  // ═══ NOTIFICATIONS (so the bell has content during demo) ═══
  await Notification.deleteMany({ recipient: simone._id });
  await Notification.create([
    {
      recipient: simone._id, type: 'session_completed',
      title: 'Session Completed',
      message: 'Welcome to Acadia! Upload your study load to get started.',
      isRead: false, link: '/student/my-schedule',
    },
  ]);
  await Notification.deleteMany({ recipient: rafael._id });
  await Notification.create([
    {
      recipient: rafael._id, type: 'announcement',
      title: 'Welcome',
      message: 'Welcome to Acadia! Upload your study load to get started.',
      isRead: true, link: '/student/my-schedule',
    },
  ]);
  console.log('✓ Notifications created for Simone and Rafael');

  // ═══ ANNOUNCEMENTS ═══
  const existingAnn = await Announcement.countDocuments();
  if (existingAnn < 2) {
    await Announcement.create([
      { title: 'Welcome to Acadia', content: 'Acadia is now live for the College of Computer Studies! Browse tutors or apply to become one.', author: admin._id, targetRoles: ['admin', 'student'], isPinned: true },
      { title: 'Tutor Applications Open', content: 'Students who achieved 2.0 or better may apply as peer tutors. Upload your grade slip to get started.', author: admin._id, targetRoles: ['student'], isPinned: false },
    ]);
    console.log('✓ Announcements created');
  }

  // ═══ SUMMARY ═══
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ DEMO SEED COMPLETE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('🎬 DEMO ACCOUNTS:');
  console.log('');
  console.log('   ADMIN:');
  console.log('   admin@acadia.edu / admin123');
  console.log('');
  console.log('   SIMONE (you — upload schedule + apply as tutor live):');
  console.log('   23063670 / 670 — Simone Makinano (Year 3, NO schedule yet)');
  console.log('');
  console.log('   RAFAEL (tutee who will book a session with you):');
  console.log('   202203001 / 001 — Rafael Dela Cruz (Year 3, has schedule)');
  console.log('');
  console.log('🎯 DEMO FLOW:');
  console.log('   1. Admin login → show dashboard/students/courses/departments');
  console.log('   2. Login as Simone → upload study load (OCR) → apply as tutor (OCR)');
  console.log('   3. Admin approves Simone (show confidence badge)');
  console.log('   4. Login as Rafael (202203001/001) → find Simone → book session (constraint engine)');
  console.log('   5. Switch to Simone → accept session');
  console.log('   6. For tutor applications — done live with your real documents');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  process.exit(0);
}

seedDemo().catch((err) => { console.error(err); process.exit(1); });

