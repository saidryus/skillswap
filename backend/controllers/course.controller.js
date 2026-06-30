const Course = require('../models/Course');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
const getCourses = async (req, res) => {
  try {
    const { yearLevel } = req.query;
    const filter = {};
    if (yearLevel) filter.yearLevel = Number(yearLevel);

    // Apply department scope for sub-admins
    if (req.user && req.user.role === 'admin' && !req.user.isSuperAdmin && req.user.assignedDepartments && req.user.assignedDepartments.length > 0) {
      filter.department = { $in: req.user.assignedDepartments };
    }

    const courses = await Course.find(filter).sort({ yearLevel: 1, courseCode: 1 });
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
    const course = await Course.findById(req.params.id);
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
    const { courseCode, courseName, description, units, yearLevel, semester, department } = req.body;

    const exists = await Course.findOne({ courseCode: courseCode?.toUpperCase() });
    if (exists) return res.status(400).json({ message: 'Course code already exists' });

    const course = await Course.create({
      courseCode,
      courseName,
      description,
      units,
      yearLevel,
      semester: [1, 2].includes(Number(semester)) ? Number(semester) : null,
      department: department || 'Information Technology',
    });
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
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    Object.assign(course, req.body);
    const updated = await course.save();
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

// @desc    Bulk import courses from CSV (parsed JSON array)
// @route   POST /api/courses/import
// @access  Admin
const importCourses = async (req, res) => {
  try {
    const rows = req.body;
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
      if (exists) { results.skipped++; continue; }

      try {
        await Course.create({
          courseCode,
          courseName,
          description: row.description?.toString().trim() || '',
          units: Number(row.units) || 3,
          yearLevel: [1, 2, 3, 4].includes(Number(row.yearLevel)) ? Number(row.yearLevel) : null,
          semester: [1, 2].includes(Number(row.semester)) ? Number(row.semester) : null,
          department: row.department?.toString().trim() || 'Information Technology',
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

module.exports = { getCourses, getCourseById, createCourse, updateCourse, deleteCourse, importCourses };
