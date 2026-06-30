/**
 * SKILLSWAP DATABASE SEEDER
 * Seeds the database with: admin, departments, courses (UC-CCS BSIT curriculum),
 * students (25 per year level), schedules, tutor profiles, sessions, announcements.
 *
 * Usage: node seed.js
 * Note: This WIPES all existing data first!
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

// ─── HELPERS ─────────────────────────────────────────────────────
function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
function nextWeekday(dayName) {
  const map = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
  const today = new Date();
  const target = map[dayName];
  const diff = (target - today.getDay() + 7) % 7 || 7;
  return addDays(today, diff);
}

// ─── COURSES (UC-CCS BSIT Curriculum) ───────────────────────────
const COURSES = [
  // Year 1, Sem 1
  { courseCode: 'CC-INTCOM11', courseName: 'Introduction to Computing', units: 3, yearLevel: 1, semester: 1 },
  { courseCode: 'CC-COMPROG11', courseName: 'Computer Programming 1', units: 3, yearLevel: 1, semester: 1 },
  { courseCode: 'IT-WEBDEV11', courseName: 'Web Design & Development', units: 2, yearLevel: 1, semester: 1 },
  // Year 1, Sem 2
  { courseCode: 'CC-COMPROG12', courseName: 'Computer Programming 2', units: 3, yearLevel: 1, semester: 2 },
  { courseCode: 'CC-DISCRET12', courseName: 'Discrete Structures', units: 2, yearLevel: 1, semester: 2 },
  // Year 2, Sem 1
  { courseCode: 'CC-DIGILOG21', courseName: 'Digital Logic Design', units: 3, yearLevel: 2, semester: 1 },
  { courseCode: 'CC-DASTRUC21', courseName: 'Data Structures & Algorithms', units: 3, yearLevel: 2, semester: 1 },
  { courseCode: 'IT-OOPROG21', courseName: 'Object Oriented Programming', units: 3, yearLevel: 2, semester: 1 },
  { courseCode: 'CC-ACCTG21', courseName: 'Accounting for IT', units: 3, yearLevel: 2, semester: 1 },
  { courseCode: 'CC-TWRITE21', courseName: 'Tech. Writing & Presentation Skills in IT', units: 3, yearLevel: 2, semester: 1 },
  // Year 2, Sem 2
  { courseCode: 'CC-QUAMETH22', courseName: 'Quantitative Methods w/ Prob. Stat.', units: 3, yearLevel: 2, semester: 2 },
  { courseCode: 'IT-PLATECH22', courseName: 'Platform Technologies w/ Op. Sys.', units: 3, yearLevel: 2, semester: 2 },
  { courseCode: 'CC-APPSDEV22', courseName: "Applications Dev't & Emerging Tech.", units: 3, yearLevel: 2, semester: 2 },
  { courseCode: 'CC-DATACOM22', courseName: 'Data Communications', units: 3, yearLevel: 2, semester: 2 },
  { courseCode: 'IT-SAD22', courseName: 'System Analysis & Design', units: 3, yearLevel: 2, semester: 2 },
  // Year 3, Sem 1
  { courseCode: 'IT-IMDBSYS31', courseName: 'Information Management (DB Sys. 1)', units: 3, yearLevel: 3, semester: 1 },
  { courseCode: 'IT-NETWORK31', courseName: 'Computer Networks', units: 3, yearLevel: 3, semester: 1 },
  { courseCode: 'IT-TESTQUA31', courseName: 'Testing & Quality Assurance', units: 3, yearLevel: 3, semester: 1 },
  { courseCode: 'CC-HCI31', courseName: 'Human Computer Interaction', units: 3, yearLevel: 3, semester: 1 },
  { courseCode: 'CC-RESCOM31', courseName: 'Methods of Research in Computing', units: 3, yearLevel: 3, semester: 1 },
  // Year 3, Sem 2
  { courseCode: 'IT-IMDBSYS32', courseName: 'Information Management (DB Sys. 2)', units: 3, yearLevel: 3, semester: 2 },
  { courseCode: 'IT-INFOSEC32', courseName: 'Information Assurance & Security', units: 3, yearLevel: 3, semester: 2 },
  { courseCode: 'IT-SYSARCH32', courseName: 'System Integration & Architecture', units: 3, yearLevel: 3, semester: 2 },
  { courseCode: 'CC-TECHNO32', courseName: 'Technopreneurship', units: 3, yearLevel: 3, semester: 2 },
  { courseCode: 'IT-INTPROG32', courseName: 'Integrative Prog & Technologies', units: 3, yearLevel: 3, semester: 2 },
  { courseCode: 'IT-SYSADMN32', courseName: 'Systems Administration & Maintenance', units: 3, yearLevel: 3, semester: 2 },
  // Year 4, Sem 1
  { courseCode: 'IT-CPSTONE30', courseName: 'Capstone Project 1', units: 3, yearLevel: 4, semester: 1 },
  { courseCode: 'CC-PROFIS10', courseName: 'Professional Issues in Computing', units: 3, yearLevel: 4, semester: 1 },
  { courseCode: 'IT-CPSTONE40', courseName: 'Capstone Project 2', units: 3, yearLevel: 4, semester: 1 },
  // Year 4, Sem 2
  { courseCode: 'CC-PRACT40', courseName: 'Practicum', units: 9, yearLevel: 4, semester: 2 },
];

// ─── STUDENTS ────────────────────────────────────────────────────
const FIRST_NAMES = [
  'Juan', 'Maria', 'Carlos', 'Andrea', 'Miguel', 'Sofia', 'Diego', 'Isabella',
  'Rafael', 'Camille', 'Gabriel', 'Nicole', 'Antonio', 'Patricia', 'Marco',
  'Jasmine', 'Luis', 'Angela', 'Daniel', 'Karina', 'Jose', 'Christine',
  'Paolo', 'Bianca', 'Alejandro', 'Trisha', 'Enrique', 'Danielle', 'Vincent',
  'Samantha', 'Raphael', 'Angelica', 'Francis', 'Janine', 'Kevin',
  'Mariel', 'Bryan', 'Kathleen', 'Jericho', 'Alyssa', 'Patrick', 'Erika',
  'Christian', 'Hannah', 'Mark', 'Denise', 'James', 'Stephanie', 'Adrian',
  'Michelle', 'Kenneth', 'Clarisse', 'Nathaniel', 'Franchesca', 'Joshua',
  'Althea', 'Renz', 'Czarina', 'Darren', 'Michaela', 'Sean', 'Rhea',
  'Elijah', 'Giselle', 'Nathan', 'Jillian', 'Carl', 'Vanessa', 'Ivan',
  'Katrina', 'Timothy', 'Lorraine', 'Dominic', 'Ysabel', 'Lloyd',
  'Charmaine', 'Romeo', 'Pia', 'Felix', 'Cassandra', 'Aaron', 'Leah',
  'Cedric', 'Beatrice', 'Jerome', 'Audrey', 'Alvin', 'Dianne', 'Emilio',
  'Grace', 'Raymond', 'Vivian', 'Harold', 'Megan', 'Benedict', 'Joanne',
  'Roderick', 'Pauline', 'Gilbert', 'Marian',
];
const LAST_NAMES = [
  'Dela Cruz', 'Santos', 'Reyes', 'Cruz', 'Bautista', 'Ocampo', 'Garcia',
  'Mendoza', 'Torres', 'Villanueva', 'Ramos', 'Castro', 'Rivera', 'Flores',
  'Gonzales', 'Lopez', 'Martinez', 'Rodriguez', 'Hernandez', 'Perez',
  'Aquino', 'Navarro', 'Morales', 'Espinosa', 'Santiago',
];

// ─── SCHEDULES (per year level, 2nd semester) ────────────────────
const YEAR_SCHEDULES = {
  1: [
    { day: 'Monday', startTime: '07:30', endTime: '09:00', label: 'CC-COMPROG12 - Computer Programming 2' },
    { day: 'Monday', startTime: '09:30', endTime: '11:00', label: 'CC-DISCRET12 - Discrete Structures' },
    { day: 'Wednesday', startTime: '07:30', endTime: '09:00', label: 'CC-COMPROG12 - Computer Programming 2' },
    { day: 'Thursday', startTime: '09:30', endTime: '11:00', label: 'CC-DISCRET12 - Discrete Structures' },
    { day: 'Friday', startTime: '07:30', endTime: '09:00', label: 'CC-COMPROG12 - Computer Programming 2' },
  ],
  2: [
    { day: 'Monday', startTime: '10:30', endTime: '12:00', label: 'CC-QUAMETH22 - Quantitative Methods' },
    { day: 'Tuesday', startTime: '10:30', endTime: '12:00', label: 'IT-PLATECH22 - Platform Technologies' },
    { day: 'Wednesday', startTime: '10:30', endTime: '12:00', label: 'CC-APPSDEV22 - Applications Dev' },
    { day: 'Thursday', startTime: '10:30', endTime: '12:00', label: 'CC-DATACOM22 - Data Communications' },
    { day: 'Friday', startTime: '10:30', endTime: '12:00', label: 'IT-SAD22 - System Analysis & Design' },
  ],
  3: [
    { day: 'Monday', startTime: '13:00', endTime: '14:30', label: 'IT-IMDBSYS32 - Info Management DB2' },
    { day: 'Tuesday', startTime: '13:00', endTime: '14:30', label: 'IT-INFOSEC32 - Information Security' },
    { day: 'Wednesday', startTime: '13:00', endTime: '14:30', label: 'IT-SYSARCH32 - System Architecture' },
    { day: 'Thursday', startTime: '13:00', endTime: '14:30', label: 'IT-INTPROG32 - Integrative Programming' },
    { day: 'Friday', startTime: '13:00', endTime: '14:30', label: 'IT-SYSADMN32 - Systems Administration' },
  ],
  4: [
    { day: 'Monday', startTime: '15:00', endTime: '17:00', label: 'IT-CPSTONE40 - Capstone Project 2' },
    { day: 'Wednesday', startTime: '15:00', endTime: '17:00', label: 'IT-CPSTONE40 - Capstone Project 2' },
    { day: 'Friday', startTime: '15:00', endTime: '17:00', label: 'CC-PROFIS10 - Professional Issues' },
  ],
};

// ─── MAIN SEED ───────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB\n');

  // Wipe everything
  await Promise.all([
    User.deleteMany(), Course.deleteMany(), Department.deleteMany(),
    TutorProfile.deleteMany(), Session.deleteMany(), StudentSchedule.deleteMany(),
    Announcement.deleteMany(), Notification.deleteMany(), Rating.deleteMany(),
    Settings.deleteMany(),
  ]);
  console.log('✗ Cleared all collections');

  // Settings
  await Settings.create({ key: 'global', studentIdPrefix: 'SS', studentIdCounter: 0 });

  // Department
  await Department.create({ name: 'Information Technology', code: 'IT', description: 'College of Computer Studies — BSIT Program' });
  console.log('✓ Department created');

  // Admin
  const admin = await User.create({
    firstName: 'Admin', lastName: 'SkillSwap',
    email: 'admin@skillswap.edu', password: 'admin123',
    role: 'admin', isSuperAdmin: true, department: 'Information Technology',
  });
  console.log('✓ Admin created');

  // Courses
  const courses = [];
  for (const c of COURSES) {
    courses.push(await Course.create({ ...c, department: 'Information Technology' }));
  }
  console.log(`✓ ${courses.length} courses created`);

  // Build course lookup for schedule linking
  const courseMap = {};
  courses.forEach(c => { courseMap[c.courseCode] = c._id; });

  // Students (25 per year level = 100 total)
  const students = [];
  for (let year = 1; year <= 4; year++) {
    const yearPrefix = 2025 - year;
    for (let i = 1; i <= 25; i++) {
      const firstName = FIRST_NAMES[(year - 1) * 25 + i - 1] || FIRST_NAMES[i % FIRST_NAMES.length];
      const lastName = LAST_NAMES[(i - 1) % LAST_NAMES.length];
      const studentId = `${yearPrefix}${String(year).padStart(2, '0')}${String(i).padStart(3, '0')}`;
      const last3 = studentId.slice(-3);
      const email = `${firstName.toLowerCase().replace(/\s/g, '')}.${lastName.toLowerCase().replace(/\s/g, '')}${i}@student.uc.edu`;

      try {
        const student = await User.create({
          studentIdNumber: studentId,
          firstName, lastName, email,
          password: last3,
          role: 'student', yearLevel: year, currentSemester: 2,
          department: 'Information Technology',
          isActive: true, mustChangePassword: true,
        });
        students.push(student);
      } catch (err) {
        // Skip duplicates silently
      }
    }
  }
  console.log(`✓ ${students.length} students created (password = last 3 digits of ID)`);

  // Schedules (link to courses where possible)
  for (const student of students) {
    const entries = YEAR_SCHEDULES[student.yearLevel] || [];
    for (const entry of entries) {
      // Try to match course code from label
      const codeMatch = entry.label.match(/^([A-Z]{2,}-[A-Z0-9]+)/);
      const courseId = codeMatch ? courseMap[codeMatch[1]] || null : null;
      await StudentSchedule.create({ student: student._id, course: courseId, ...entry });
    }
  }
  console.log('✓ Student schedules created');

  // Tutor profiles (senior students tutor lower-year courses)
  const year3Students = students.filter(s => s.yearLevel === 3);
  const year4Students = students.filter(s => s.yearLevel === 4);
  const approvedProfiles = [];

  const tutorAssignments = [
    { tutor: year3Students[0], course: courses[0] },  // Y3 student tutors CC-INTCOM11
    { tutor: year3Students[1], course: courses[1] },  // CC-COMPROG11
    { tutor: year3Students[2], course: courses[3] },  // CC-COMPROG12
    { tutor: year4Students[0], course: courses[5] },  // CC-DIGILOG21
    { tutor: year4Students[1], course: courses[6] },  // CC-DASTRUC21
  ];

  for (const { tutor, course } of tutorAssignments) {
    const p = await TutorProfile.create({
      tutor: tutor._id, course: course._id, status: 'approved',
      grade: 1.0 + Math.random() * 0.75,
      gradeDocument: 'uploads/grade-documents/sample.pdf',
      gradeDocumentName: 'grade_slip.pdf',
      reviewedBy: admin._id, reviewedAt: new Date(),
      adminNotes: 'Verified — grade above threshold',
    });
    approvedProfiles.push(p);
    await User.findByIdAndUpdate(tutor._id, { isTutor: true });
  }

  // Pending applications
  await TutorProfile.create({ tutor: year3Students[3]._id, course: courses[4]._id, status: 'pending', gradeDocument: 'uploads/grade-documents/sample.pdf', gradeDocumentName: 'grade_slip.pdf' });
  await TutorProfile.create({ tutor: year3Students[4]._id, course: courses[7]._id, status: 'pending', gradeDocument: 'uploads/grade-documents/sample.pdf', gradeDocumentName: 'grade_slip.pdf' });
  console.log(`✓ ${approvedProfiles.length} approved tutors + 2 pending applications`);

  // Sessions
  const year1Students = students.filter(s => s.yearLevel === 1);
  const year2Students = students.filter(s => s.yearLevel === 2);

  const sessions = [
    { tutor: year3Students[0]._id, tutees: [year1Students[0]._id], course: courses[0]._id, date: nextWeekday('Tuesday'), startTime: '10:00', endTime: '11:00', venue: 'Library Room 1', venueType: 'on-campus', status: 'scheduled' },
    { tutor: year3Students[1]._id, tutees: [year1Students[1]._id, year1Students[2]._id], course: courses[1]._id, date: nextWeekday('Wednesday'), startTime: '11:00', endTime: '12:00', venue: 'Online via Google Meet', venueType: 'online', status: 'scheduled' },
    { tutor: year4Students[0]._id, tutees: [year2Students[0]._id], course: courses[5]._id, date: nextWeekday('Thursday'), startTime: '14:00', endTime: '15:00', venue: 'CS Lab 2', venueType: 'on-campus', status: 'scheduled' },
    { tutor: year3Students[0]._id, tutees: [year1Students[3]._id], course: courses[0]._id, date: addDays(new Date(), -7), startTime: '10:00', endTime: '11:00', venue: 'Library Room 2', venueType: 'on-campus', status: 'completed' },
    { tutor: year4Students[1]._id, tutees: [year2Students[1]._id], course: courses[6]._id, date: addDays(new Date(), -5), startTime: '15:00', endTime: '16:00', venue: 'Online via Zoom', venueType: 'online', status: 'completed' },
    { tutor: year3Students[2]._id, tutees: [year1Students[4]._id], course: courses[3]._id, date: addDays(new Date(), -3), startTime: '09:00', endTime: '10:00', venue: 'Room 204', venueType: 'on-campus', status: 'cancelled' },
  ];

  for (const s of sessions) { await Session.create(s); }
  console.log(`✓ ${sessions.length} sessions created`);

  // Ratings for completed sessions
  const completedSessions = await Session.find({ status: 'completed' });
  for (const sess of completedSessions) {
    for (const tuteeId of sess.tutees) {
      await Rating.create({
        session: sess._id, tutor: sess.tutor, ratedBy: tuteeId, course: sess.course,
        score: 4 + Math.round(Math.random()), // 4 or 5
        comment: 'Great session, very helpful!',
      });
    }
  }
  console.log('✓ Ratings created for completed sessions');

  // Announcements
  await Announcement.create([
    { title: 'Welcome to SkillSwap', content: 'SkillSwap is now live! Browse tutors, apply to become one, and book sessions.', author: admin._id, targetRoles: ['admin', 'student'], isPinned: true },
    { title: 'Tutor Applications Open', content: 'Students who passed their courses may apply as peer tutors. Upload your grade slip to get started.', author: admin._id, targetRoles: ['student'], isPinned: false },
  ]);
  console.log('✓ Announcements created');

  // Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ SEED COMPLETE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('🔑 LOGIN CREDENTIALS:');
  console.log('   Admin:   admin@skillswap.edu / admin123');
  console.log('   Students: login with Student ID, password = last 3 digits');
  console.log('');
  console.log('   Examples:');
  console.log('   Year 1: 202401001 / 001');
  console.log('   Year 2: 202302001 / 001');
  console.log('   Year 3: 202203001 / 001');
  console.log('   Year 4: 202104001 / 001');
  console.log('');
  console.log(`📊 ${students.length} students | ${courses.length} courses | ${approvedProfiles.length} tutors | ${sessions.length} sessions`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
