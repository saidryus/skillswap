require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const TutorProfile = require('./models/TutorProfile');
const Session = require('./models/Session');
const StudentSchedule = require('./models/StudentSchedule');
const Announcement = require('./models/Announcement');
const Notification = require('./models/Notification');
const Settings = require('./models/Settings');

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function nextWeekday(dayName) {
  const map = { Monday:1, Tuesday:2, Wednesday:3, Thursday:4, Friday:5, Saturday:6 };
  const today = new Date();
  const target = map[dayName];
  const diff = (target - today.getDay() + 7) % 7 || 7;
  return addDays(today, diff);
}

const COURSES = [
  { courseCode: 'IT101', courseName: 'Introduction to Computing', units: 3, yearLevel: 1, description: 'Fundamentals of computing and IT concepts' },
  { courseCode: 'IT102', courseName: 'Computer Programming 1', units: 3, yearLevel: 1, description: 'Programming fundamentals using Python' },
  { courseCode: 'IT103', courseName: 'Mathematics in the Modern World', units: 3, yearLevel: 1, description: 'Applied mathematics for IT students' },
  { courseCode: 'IT201', courseName: 'Data Structures and Algorithms', units: 3, yearLevel: 2, description: 'Core data structures and algorithm design' },
  { courseCode: 'IT202', courseName: 'Database Management Systems', units: 3, yearLevel: 2, description: 'Relational databases and SQL' },
  { courseCode: 'IT203', courseName: 'Object-Oriented Programming', units: 3, yearLevel: 2, description: 'OOP concepts using Java' },
  { courseCode: 'IT301', courseName: 'Web Development', units: 3, yearLevel: 3, description: 'Full-stack web development' },
  { courseCode: 'IT302', courseName: 'Networking Fundamentals', units: 3, yearLevel: 3, description: 'Computer networks and protocols' },
  { courseCode: 'IT401', courseName: 'Software Engineering', units: 3, yearLevel: 4, description: 'Software development lifecycle and methodologies' },
  { courseCode: 'IT402', courseName: 'Capstone Project', units: 6, yearLevel: 4, description: 'Final year project development' },
  // 3rd Year - 2nd Semester courses
  { courseCode: '32029', courseName: 'IT-INFOSEC32-R', units: 3, yearLevel: 3, description: 'INFORMATION ASSURANCE & SECURITY' },
  { courseCode: '32037', courseName: 'IT-INFOSEC32-L', units: 1, yearLevel: 3, description: 'INFORMATION ASSURANCE & SECURITY' },
  { courseCode: '32045', courseName: 'IT-IMDBSYS32-R', units: 3, yearLevel: 3, description: 'INFORMATION MANAGEMENT (DB SYS.2)' },
  { courseCode: '32052', courseName: 'IT-IMDBSYS32-L', units: 1, yearLevel: 3, description: 'INFORMATION MANAGEMENT (DB SYS.2)' },
  { courseCode: '32060', courseName: 'IT-SYSARCH32-R', units: 3, yearLevel: 3, description: 'SYSTEM INTEGRATION & ARCHITECTURE' },
  { courseCode: '32078', courseName: 'IT-SYSARCH32-L', units: 1, yearLevel: 3, description: 'SYSTEM INTEGRATION & ARCHITECTURE' },
  { courseCode: '32086', courseName: 'IT-SYSADMN32-R', units: 3, yearLevel: 3, description: 'SYSTEMS ADMINISTRATION & MAINTENANCE' },
  { courseCode: '32094', courseName: 'IT-SYSADMN32-L', units: 1, yearLevel: 3, description: 'SYSTEMS ADMINISTRATION & MAINTENANCE' },
  { courseCode: '32102', courseName: 'IT-INTPROG32-R', units: 3, yearLevel: 3, description: "INTEGRATIVE PROG'G & TECHNOLOGIES" },
  { courseCode: '32110', courseName: 'IT-INTPROG32-L', units: 1, yearLevel: 3, description: "INTEGRATIVE PROG'G & TECHNOLOGIES" },
  { courseCode: '32128', courseName: 'CC-TECHNO32-R', units: 3, yearLevel: 3, description: 'TECHNOPRENEURSHIP' },
];

const STUDENTS = [
  { firstName: 'Juan',      lastName: 'Dela Cruz',   email: 'juan.delacruz@student.skillswap.edu',   yearLevel: 1, studentIdNumber: '202400001' },
  { firstName: 'Ana',       lastName: 'Gonzales',    email: 'ana.gonzales@student.skillswap.edu',    yearLevel: 1, studentIdNumber: '202400002' },
  { firstName: 'Carlos',    lastName: 'Mendoza',     email: 'carlos.mendoza@student.skillswap.edu',  yearLevel: 2, studentIdNumber: '202300001' },
  { firstName: 'Maria',     lastName: 'Reyes',       email: 'maria.reyes@student.skillswap.edu',     yearLevel: 2, studentIdNumber: '202300002' },
  { firstName: 'Jose',      lastName: 'Santos',      email: 'jose.santos@student.skillswap.edu',     yearLevel: 2, studentIdNumber: '202300003' },
  { firstName: 'Luisa',     lastName: 'Torres',      email: 'luisa.torres@student.skillswap.edu',    yearLevel: 3, studentIdNumber: '202200001' },
  { firstName: 'Miguel',    lastName: 'Ramos',       email: 'miguel.ramos@student.skillswap.edu',    yearLevel: 3, studentIdNumber: '202200002' },
  { firstName: 'Sofia',     lastName: 'Villanueva',  email: 'sofia.villanueva@student.skillswap.edu', yearLevel: 3, studentIdNumber: '202200003' },
  { firstName: 'Diego',     lastName: 'Flores',      email: 'diego.flores@student.skillswap.edu',    yearLevel: 4, studentIdNumber: '202100001' },
  { firstName: 'Isabella',  lastName: 'Cruz',        email: 'isabella.cruz@student.skillswap.edu',   yearLevel: 4, studentIdNumber: '202100002' },
  { firstName: 'Andres',    lastName: 'Morales',     email: 'andres.morales@student.skillswap.edu',  yearLevel: 1, studentIdNumber: '202400003' },
  { firstName: 'Valentina', lastName: 'Aquino',      email: 'valentina.aquino@student.skillswap.edu', yearLevel: 2, studentIdNumber: '202300004' },
  { firstName: 'Sebastian', lastName: 'Bautista',    email: 'sebastian.bautista@student.skillswap.edu', yearLevel: 3, studentIdNumber: '202200004' },
  { firstName: 'Camila',    lastName: 'Dela Rosa',   email: 'camila.delarosa@student.skillswap.edu', yearLevel: 4, studentIdNumber: '202100003' },
  { firstName: 'Mateo',     lastName: 'Garcia',      email: 'mateo.garcia@student.skillswap.edu',    yearLevel: 1, studentIdNumber: '202400004' },
  { firstName: 'Gabriela',  lastName: 'Lopez',       email: 'gabriela.lopez@student.skillswap.edu',  yearLevel: 2, studentIdNumber: '202300005' },
  { firstName: 'Nicolas',   lastName: 'Hernandez',   email: 'nicolas.hernandez@student.skillswap.edu', yearLevel: 3, studentIdNumber: '202200005' },
  { firstName: 'Valeria',   lastName: 'Martinez',    email: 'valeria.martinez@student.skillswap.edu', yearLevel: 4, studentIdNumber: '202100004' },
  { firstName: 'Samuel',    lastName: 'Perez',       email: 'samuel.perez@student.skillswap.edu',    yearLevel: 1, studentIdNumber: '202400005' },
  { firstName: 'Daniela',   lastName: 'Ramirez',     email: 'daniela.ramirez@student.skillswap.edu', yearLevel: 2, studentIdNumber: '202300006' },
];

// Weekly class schedules per year level
const YEAR_SCHEDULES = {
  1: [
    { day: 'Monday',    startTime: '07:30', endTime: '09:00', label: 'IT101 - Introduction to Computing' },
    { day: 'Monday',    startTime: '09:00', endTime: '10:30', label: 'IT102 - Computer Programming 1' },
    { day: 'Tuesday',   startTime: '07:30', endTime: '09:00', label: 'IT103 - Mathematics in the Modern World' },
    { day: 'Wednesday', startTime: '07:30', endTime: '09:00', label: 'IT101 - Introduction to Computing' },
    { day: 'Thursday',  startTime: '07:30', endTime: '09:00', label: 'IT103 - Mathematics in the Modern World' },
    { day: 'Friday',    startTime: '09:00', endTime: '10:30', label: 'IT102 - Computer Programming 1' },
  ],
  2: [
    { day: 'Monday',    startTime: '10:30', endTime: '12:00', label: 'IT201 - Data Structures' },
    { day: 'Tuesday',   startTime: '10:30', endTime: '12:00', label: 'IT202 - Database Management' },
    { day: 'Wednesday', startTime: '10:30', endTime: '12:00', label: 'IT203 - OOP' },
    { day: 'Thursday',  startTime: '10:30', endTime: '12:00', label: 'IT201 - Data Structures' },
    { day: 'Friday',    startTime: '10:30', endTime: '12:00', label: 'IT202 - Database Management' },
  ],
  3: [
    { day: 'Monday',    startTime: '13:00', endTime: '14:30', label: 'IT301 - Web Development' },
    { day: 'Tuesday',   startTime: '13:00', endTime: '14:30', label: 'IT302 - Networking' },
    { day: 'Wednesday', startTime: '13:00', endTime: '14:30', label: 'IT301 - Web Development' },
    { day: 'Thursday',  startTime: '13:00', endTime: '14:30', label: 'IT302 - Networking' },
  ],
  4: [
    { day: 'Monday',    startTime: '15:00', endTime: '17:00', label: 'IT401 - Software Engineering' },
    { day: 'Wednesday', startTime: '15:00', endTime: '17:00', label: 'IT402 - Capstone Project' },
    { day: 'Friday',    startTime: '15:00', endTime: '17:00', label: 'IT401 - Software Engineering' },
  ],
};

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  await Promise.all([
    User.deleteMany(),
    Course.deleteMany(),
    TutorProfile.deleteMany(),
    Session.deleteMany(),
    StudentSchedule.deleteMany(),
    Announcement.deleteMany(),
    Notification.deleteMany(),
    Settings.deleteMany(),
  ]);
  console.log('Cleared existing data');

  await Settings.create({ key: 'global', studentIdPrefix: 'SS', studentIdCounter: 0 });

  /* ── Admin ── */
  const admin = await User.create({
    firstName: 'Admin', lastName: 'SkillSwap',
    email: 'admin@skillswap.edu', password: 'admin123',
    role: 'admin', isSuperAdmin: true,
  });
  console.log('Created admin');

  /* ── Courses ── */
  const courses = [];
  for (const c of COURSES) {
    courses.push(await Course.create({ ...c, department: 'Information Technology' }));
  }
  console.log(`Created ${courses.length} courses`);

  /* ── Students ── */
  const students = [];
  for (const s of STUDENTS) {
    const last3 = s.studentIdNumber.slice(-3);
    students.push(await User.create({
      ...s,
      password: last3,
      mustChangePassword: true,
      role: 'student',
      department: 'Information Technology',
    }));
  }
  console.log(`Created ${students.length} students`);

  /* ── Student schedules ── */
  for (const student of students) {
    const entries = YEAR_SCHEDULES[student.yearLevel] || [];
    for (const entry of entries) {
      await StudentSchedule.create({ student: student._id, ...entry });
    }
  }
  console.log('Created student schedules');

  /* ── Tutor profiles — 5 approved, 3 pending ── */
  // Approved tutors: senior students tutoring courses from lower years
  const approvedTutors = [
    { tutor: students[5], course: courses[0] }, // Luisa → IT101
    { tutor: students[6], course: courses[1] }, // Miguel → IT102
    { tutor: students[8], course: courses[3] }, // Diego → IT201
    { tutor: students[9], course: courses[4] }, // Isabella → IT202
    { tutor: students[7], course: courses[2] }, // Sofia → IT103
  ];

  const approvedProfiles = [];
  for (const { tutor, course } of approvedTutors) {
    const p = await TutorProfile.create({
      tutor: tutor._id,
      course: course._id,
      status: 'approved',
      grade: 1.0 + Math.random() * 0.75, // random grade between 1.0-1.75 (honor range)
      gradeDocument: 'uploads/grade-documents/sample.pdf',
      gradeDocumentName: 'grade_slip.pdf',
      reviewedBy: admin._id,
      reviewedAt: new Date(),
      adminNotes: 'Verified — grade above threshold',
    });
    approvedProfiles.push(p);
    await User.findByIdAndUpdate(tutor._id, { isTutor: true });
  }

  // Pending applications
  const pendingTutors = [
    { tutor: students[2], course: courses[0] }, // Carlos → IT101
    { tutor: students[3], course: courses[1] }, // Maria → IT102
    { tutor: students[4], course: courses[2] }, // Jose → IT103
  ];
  for (const { tutor, course } of pendingTutors) {
    await TutorProfile.create({
      tutor: tutor._id,
      course: course._id,
      status: 'pending',
      gradeDocument: 'uploads/grade-documents/sample.pdf',
      gradeDocumentName: 'grade_slip.pdf',
    });
  }
  console.log('Created tutor profiles');

  /* ── Sessions ── */
  const sessionData = [
    // Scheduled sessions (upcoming)
    {
      tutor: students[5]._id, tutees: [students[0]._id, students[1]._id],
      course: courses[0]._id, date: nextWeekday('Tuesday'),
      startTime: '10:00', endTime: '11:00',
      venue: 'Library Study Room 1', venueType: 'on-campus', status: 'scheduled',
    },
    {
      tutor: students[6]._id, tutees: [students[1]._id],
      course: courses[1]._id, date: nextWeekday('Wednesday'),
      startTime: '11:00', endTime: '12:00',
      venue: 'Online via Google Meet', venueType: 'online', status: 'scheduled',
    },
    {
      tutor: students[8]._id, tutees: [students[2]._id, students[3]._id],
      course: courses[3]._id, date: nextWeekday('Thursday'),
      startTime: '14:00', endTime: '15:00',
      venue: 'CS Lab 2', venueType: 'on-campus', status: 'scheduled',
    },
    {
      tutor: students[9]._id, tutees: [students[4]._id],
      course: courses[4]._id, date: nextWeekday('Friday'),
      startTime: '15:00', endTime: '16:00',
      venue: 'Online via Zoom', venueType: 'online', status: 'scheduled',
    },
    {
      tutor: students[7]._id, tutees: [students[10]._id],
      course: courses[2]._id, date: nextWeekday('Monday'),
      startTime: '11:00', endTime: '12:00',
      venue: 'Room 204', venueType: 'on-campus', status: 'scheduled',
    },
    // Completed sessions
    {
      tutor: students[5]._id, tutees: [students[0]._id],
      course: courses[0]._id, date: addDays(new Date(), -7),
      startTime: '10:00', endTime: '11:00',
      venue: 'Library Study Room 2', venueType: 'on-campus', status: 'completed',
    },
    {
      tutor: students[6]._id, tutees: [students[1]._id, students[10]._id],
      course: courses[1]._id, date: addDays(new Date(), -5),
      startTime: '13:00', endTime: '14:00',
      venue: 'Online via Google Meet', venueType: 'online', status: 'completed',
    },
    {
      tutor: students[8]._id, tutees: [students[3]._id],
      course: courses[3]._id, date: addDays(new Date(), -3),
      startTime: '15:00', endTime: '16:00',
      venue: 'CS Lab 1', venueType: 'on-campus', status: 'completed',
    },
    // Cancelled
    {
      tutor: students[9]._id, tutees: [students[2]._id],
      course: courses[4]._id, date: addDays(new Date(), -2),
      startTime: '14:00', endTime: '15:00',
      venue: 'Room 101', venueType: 'on-campus', status: 'cancelled',
    },
    {
      tutor: students[7]._id, tutees: [students[4]._id],
      course: courses[2]._id, date: addDays(new Date(), -1),
      startTime: '09:00', endTime: '10:00',
      venue: 'Online via Zoom', venueType: 'online', status: 'cancelled',
    },
  ];

  for (const s of sessionData) {
    await Session.create(s);
  }
  console.log(`Created ${sessionData.length} sessions`);

  /* ── Announcements ── */
  await Announcement.create([
    {
      title: 'Welcome to SkillSwap',
      content: 'SkillSwap is now live for the IT department. Browse available tutors, apply to become one, and book your first study session today.',
      author: admin._id, targetRoles: ['admin', 'student'], isPinned: true,
    },
    {
      title: 'Tutor Applications Now Open',
      content: 'Students who have completed their 1st year courses with a passing grade may apply to become peer tutors. Upload your grade slip through the Become a Tutor section.',
      author: admin._id, targetRoles: ['student'], isPinned: false,
    },
    {
      title: 'System Maintenance Notice',
      content: 'SkillSwap will undergo scheduled maintenance this Saturday from 10:00 PM to 12:00 AM. Please plan your sessions accordingly.',
      author: admin._id, targetRoles: ['admin', 'student'], isPinned: false,
    },
  ]);

  console.log('\n✅ Seed complete!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔑 LOGIN CREDENTIALS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin:    admin@skillswap.edu / admin123');
  console.log('');
  console.log('Students — login with Student ID + last 3 digits as password');
  console.log('(mustChangePassword = true, will be prompted on first login)');
  students.slice(0, 5).forEach((s) => {
    const last3 = s.studentIdNumber.slice(-3);
    console.log(`  ID: ${s.studentIdNumber}  Password: ${last3}  (${s.firstName} ${s.lastName})`);
  });
  console.log(`  ... and ${students.length - 5} more`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 ${students.length} students | ${courses.length} courses | ${approvedProfiles.length} approved tutors | 3 pending | ${sessionData.length} sessions`);

  process.exit(0);
};

seed().catch((err) => { console.error(err); process.exit(1); });
