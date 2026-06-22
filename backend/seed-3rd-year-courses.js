require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/Course');

const NEW_COURSES = [
  { courseCode: '32029', courseName: 'IT-INFOSEC32-R', description: 'INFORMATION ASSURANCE & SECURITY', units: 3, yearLevel: 3 },
  { courseCode: '32037', courseName: 'IT-INFOSEC32-L', description: 'INFORMATION ASSURANCE & SECURITY', units: 1, yearLevel: 3 },
  { courseCode: '32045', courseName: 'IT-IMDBSYS32-R', description: 'INFORMATION MANAGEMENT (DB SYS.2)', units: 3, yearLevel: 3 },
  { courseCode: '32052', courseName: 'IT-IMDBSYS32-L', description: 'INFORMATION MANAGEMENT (DB SYS.2)', units: 1, yearLevel: 3 },
  { courseCode: '32060', courseName: 'IT-SYSARCH32-R', description: 'SYSTEM INTEGRATION & ARCHITECTURE', units: 3, yearLevel: 3 },
  { courseCode: '32078', courseName: 'IT-SYSARCH32-L', description: 'SYSTEM INTEGRATION & ARCHITECTURE', units: 1, yearLevel: 3 },
  { courseCode: '32086', courseName: 'IT-SYSADMN32-R', description: 'SYSTEMS ADMINISTRATION & MAINTENANCE', units: 3, yearLevel: 3 },
  { courseCode: '32094', courseName: 'IT-SYSADMN32-L', description: 'SYSTEMS ADMINISTRATION & MAINTENANCE', units: 1, yearLevel: 3 },
  { courseCode: '32102', courseName: 'IT-INTPROG32-R', description: 'INTEGRATIVE PROG\'G & TECHNOLOGIES', units: 3, yearLevel: 3 },
  { courseCode: '32110', courseName: 'IT-INTPROG32-L', description: 'INTEGRATIVE PROG\'G & TECHNOLOGIES', units: 1, yearLevel: 3 },
  { courseCode: '32128', courseName: 'CC-TECHNO32-R', description: 'TECHNOPRENEURSHIP', units: 3, yearLevel: 3 },
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  let created = 0;
  let skipped = 0;

  for (const course of NEW_COURSES) {
    const exists = await Course.findOne({ courseCode: course.courseCode });
    if (exists) {
      console.log(`  SKIPPED: ${course.courseCode} (${course.courseName}) — already exists`);
      skipped++;
      continue;
    }

    await Course.create({ ...course, department: 'Information Technology' });
    console.log(`  CREATED: ${course.courseCode} - ${course.courseName} (${course.description})`);
    created++;
  }

  console.log(`\n✅ Done! Created: ${created}, Skipped: ${skipped}`);
  process.exit(0);
};

run().catch((err) => { console.error(err); process.exit(1); });
