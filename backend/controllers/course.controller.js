const Course = require('../models/Course');
const User = require('../models/User');
const { createNotifications } = require('../utils/notify');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('faculty', 'firstName lastName email')
      .populate('students', 'firstName lastName email studentId')
      .sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Private
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('faculty', 'firstName lastName email')
      .populate('students', 'firstName lastName email studentId');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create course
// @route   POST /api/courses
// @access  Admin
const createCourse = async (req, res) => {
  try {
    const { courseCode, courseName, description, units, type, department, yearLevel, faculty } = req.body;

    const exists = await Course.findOne({ courseCode });
    if (exists) return res.status(400).json({ message: 'Course code already exists' });

    const course = await Course.create({ courseCode, courseName, description, units, type, yearLevel, department, faculty });
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Admin
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('faculty', 'firstName lastName');
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const oldFacultyId = course.faculty?._id?.toString();
    const newFacultyId = req.body.faculty;

    Object.assign(course, req.body);
    const updated = await course.save();

    // Notify students if instructor changed
    if (newFacultyId && oldFacultyId !== newFacultyId) {
      const newFaculty = await User.findById(newFacultyId);
      const facultyName = newFaculty ? `${newFaculty.firstName} ${newFaculty.lastName}` : 'a new instructor';

      await createNotifications(
        course.students.map((studentId) => ({
          recipient: studentId,
          type: 'instructor_changed',
          title: 'Instructor Changed',
          message: `The instructor for ${course.courseCode} has been changed to ${facultyName}.`,
          link: '/student/schedule',
          meta: { courseId: course._id, newFacultyId },
        }))
      );

      // Also notify the new faculty
      if (newFaculty) {
        await createNotifications({
          recipient: newFacultyId,
          type: 'instructor_assigned',
          title: 'Course Assigned',
          message: `You have been assigned as the instructor for ${course.courseCode} — ${course.courseName}.`,
          link: '/faculty',
          meta: { courseId: course._id },
        });
      }
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Admin
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Enroll student in course
// @route   POST /api/courses/:id/enroll
// @access  Admin
const enrollStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
    const course = await Course.findById(req.params.id).populate('faculty', 'firstName lastName');
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(400).json({ message: 'Invalid student' });
    }

    if (course.students.includes(studentId)) {
      return res.status(400).json({ message: 'Student already enrolled' });
    }

    course.students.push(studentId);
    await course.save();

    // Notify the student
    await createNotifications({
      recipient: studentId,
      type: 'enrollment',
      title: 'Enrolled in Course',
      message: `You have been enrolled in ${course.courseCode} — ${course.courseName}.`,
      link: '/student/schedule',
      meta: { courseId: course._id },
    });

    res.json({ message: 'Student enrolled successfully', course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove student from course
// @route   POST /api/courses/:id/unenroll
// @access  Admin
const unenrollStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    course.students = course.students.filter((id) => id.toString() !== studentId);
    await course.save();

    // Notify the student
    await createNotifications({
      recipient: studentId,
      type: 'unenrollment',
      title: 'Removed from Course',
      message: `You have been removed from ${course.courseCode} — ${course.courseName}.`,
      link: '/student',
      meta: { courseId: course._id },
    });

    res.json({ message: 'Student removed successfully', course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk import courses from CSV (parsed to JSON array)
// @route   POST /api/courses/import
// @access  Admin
const importCourses = async (req, res) => {
  try {
    const rows = req.body; // array of course objects
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ message: 'No data provided' });
    }

    const results = { created: 0, skipped: 0, errors: [] };

    for (const row of rows) {
      const courseCode = row.courseCode?.toString().trim().toUpperCase();
      const courseName = row.courseName?.toString().trim();

      if (!courseCode || !courseName) {
        results.errors.push({ row: courseCode || '?', reason: 'Missing courseCode or courseName' });
        continue;
      }

      const exists = await Course.findOne({ courseCode });
      if (exists) {
        results.skipped++;
        continue;
      }

      try {
        await Course.create({
          courseCode,
          courseName,
          description: row.description?.toString().trim() || '',
          units: Number(row.units) || 3,
          type: ['lecture', 'laboratory'].includes(row.type?.toLowerCase())
            ? row.type.toLowerCase() : 'lecture',
          yearLevel: [1, 2, 3, 4].includes(Number(row.yearLevel))
            ? Number(row.yearLevel) : null,
          department: row.department?.toString().trim() || '',
        });
        results.created++;
      } catch (err) {
        results.errors.push({ row: courseCode, reason: err.message });
      }
    }

    res.status(201).json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ students: req.user._id })
      .populate('faculty', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get courses taught by logged-in faculty
// @route   GET /api/courses/my-teaching
// @access  Faculty
const getMyTeachingCourses = async (req, res) => {
  try {
    const courses = await Course.find({ faculty: req.user._id })
      .populate('students', 'firstName lastName email studentId')
      .sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollStudent,
  unenrollStudent,
  getMyCourses,
  getMyTeachingCourses,
  importCourses,
};
