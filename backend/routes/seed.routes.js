const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const Schedule = require('../models/Schedule');
const Announcement = require('../models/Announcement');

// @desc    Seed database with sample data
// @route   GET /api/seed
// @access  Public (temporary - remove after seeding)
router.get('/', async (req, res) => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Course.deleteMany();
    await Schedule.deleteMany();
    await Announcement.deleteMany();

    // Create users
    const admin = await User.create({
      firstName: 'Admin', lastName: 'Trophe',
      email: 'admin@trophe.edu', password: 'admin123',
      role: 'admin', department: 'Administration',
      isSuperAdmin: true,
    });

    const faculty1 = await User.create({
      firstName: 'Maria', lastName: 'Santos',
      email: 'maria.santos@trophe.edu', password: 'faculty123',
      role: 'faculty', department: 'Computer Science',
    });

    const faculty2 = await User.create({
      firstName: 'Jose', lastName: 'Reyes',
      email: 'jose.reyes@trophe.edu', password: 'faculty123',
      role: 'faculty', department: 'Mathematics',
    });

    const student1 = await User.create({
      firstName: 'Juan', lastName: 'Dela Cruz',
      email: 'juan.delacruz@trophe.edu', password: 'student123',
      role: 'student', studentId: 'STU-2024-001', department: 'Computer Science',
    });

    const student2 = await User.create({
      firstName: 'Ana', lastName: 'Gonzales',
      email: 'ana.gonzales@trophe.edu', password: 'student123',
      role: 'student', studentId: 'STU-2024-002', department: 'Computer Science',
    });

    const student3 = await User.create({
      firstName: 'Carlos', lastName: 'Mendoza',
      email: 'carlos.mendoza@trophe.edu', password: 'student123',
      role: 'student', studentId: 'STU-2024-003', department: 'Information Technology',
    });

    // Create courses
    const cs101 = await Course.create({
      courseCode: 'CS101', courseName: 'Introduction to Programming',
      description: 'Fundamentals of programming using Python',
      units: 3, department: 'Computer Science',
      faculty: faculty1._id,
      students: [student1._id, student2._id, student3._id],
    });

    const cs201 = await Course.create({
      courseCode: 'CS201', courseName: 'Data Structures and Algorithms',
      description: 'Core data structures and algorithm design',
      units: 3, department: 'Computer Science',
      faculty: faculty1._id,
      students: [student1._id, student2._id],
    });

    const math101 = await Course.create({
      courseCode: 'MATH101', courseName: 'Calculus I',
      description: 'Differential and integral calculus',
      units: 4, department: 'Mathematics',
      faculty: faculty2._id,
      students: [student1._id, student3._id],
    });

    const cs301 = await Course.create({
      courseCode: 'CS301', courseName: 'Web Development',
      description: 'Full-stack web development with modern frameworks',
      units: 3, department: 'Computer Science',
      faculty: faculty1._id,
      students: [student2._id, student3._id],
    });

    // Create schedules
    await Schedule.create([
      { course: cs101._id, day: 'Monday',    startTime: '08:00', endTime: '09:30', room: 'Room 101', semester: '1st Semester', schoolYear: '2024-2025' },
      { course: cs101._id, day: 'Wednesday', startTime: '08:00', endTime: '09:30', room: 'Room 101', semester: '1st Semester', schoolYear: '2024-2025' },
      { course: cs201._id, day: 'Tuesday',   startTime: '10:00', endTime: '11:30', room: 'Room 202', semester: '1st Semester', schoolYear: '2024-2025' },
      { course: cs201._id, day: 'Thursday',  startTime: '10:00', endTime: '11:30', room: 'Room 202', semester: '1st Semester', schoolYear: '2024-2025' },
      { course: math101._id, day: 'Monday',  startTime: '13:00', endTime: '14:30', room: 'Room 305', semester: '1st Semester', schoolYear: '2024-2025' },
      { course: math101._id, day: 'Friday',  startTime: '13:00', endTime: '14:30', room: 'Room 305', semester: '1st Semester', schoolYear: '2024-2025' },
      { course: cs301._id, day: 'Wednesday', startTime: '15:00', endTime: '16:30', room: 'Lab 1',    semester: '1st Semester', schoolYear: '2024-2025' },
      { course: cs301._id, day: 'Friday',    startTime: '10:00', endTime: '11:30', room: 'Lab 1',    semester: '1st Semester', schoolYear: '2024-2025' },
    ]);

    // Create announcements
    await Announcement.create([
      {
        title: 'Welcome to Trophe Campus System',
        content: 'Welcome to the new Smart Campus Management System.',
        author: admin._id,
        targetRoles: ['admin', 'faculty', 'student'],
        isPinned: true,
      },
      {
        title: 'Midterm Examination Schedule',
        content: 'Midterm examinations will be held from October 14-18, 2024.',
        author: admin._id,
        targetRoles: ['faculty', 'student'],
      },
    ]);

    res.json({
      message: '✅ Database seeded successfully!',
      credentials: {
        admin:    'admin@trophe.edu / admin123',
        faculty1: 'maria.santos@trophe.edu / faculty123',
        faculty2: 'jose.reyes@trophe.edu / faculty123',
        student1: 'juan.delacruz@trophe.edu / student123',
        student2: 'ana.gonzales@trophe.edu / student123',
        student3: 'carlos.mendoza@trophe.edu / student123',
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    One-time migration: mark admin@trophe.edu as super admin
// @route   GET /api/seed/migrate-super-admin
// @access  Public (temporary)
router.get('/migrate-super-admin', async (req, res) => {
  try {
    const admin = await User.findOne({ email: 'admin@trophe.edu' });
    if (!admin) {
      return res.status(404).json({ message: 'admin@trophe.edu not found' });
    }
    if (admin.isSuperAdmin) {
      return res.json({ message: 'Already a super admin' });
    }
    admin.isSuperAdmin = true;
    await admin.save();
    res.json({ message: '✅ admin@trophe.edu is now a super admin' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
