const Course = require('../models/Course');
const Department = require('../models/Department');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
const getCourses = async (req, res) => {
  try {
    const { yearLevel, department } = req.query;
    const filter = {};
    if (yearLevel) filter.yearLevel = Number(yearLevel);
    if (department) filter.department = department;

    // Apply department scope for sub-admins
    if (req.user && req.user.role === 'admin' && !req.user.isSuperAdmin && req.user.assignedDepartments && req.user.assignedDepartments.length > 0) {
      filter.department = { $in: req.user.assignedDepartments };
    }

    // For students, default to their own department if no department filter specified
    if (req.user && req.user.role === 'student' && !department && req.user.department) {
      filter.department = req.user.department;
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

    if (!courseCode || !courseCode.trim()) {
      return res.status(400).json({ message: 'Course code is required' });
    }
    if (!courseName || !courseName.trim()) {
      return res.status(400).json({ message: 'Course name is required' });
    }
    if (!units || Number(units) < 1 || Number(units) > 12) {
      return res.status(400).json({ message: 'Units must be between 1 and 12' });
    }
    if (![1, 2, 3, 4].includes(Number(yearLevel))) {
      return res.status(400).json({ message: 'Year level is required (1-4)' });
    }
    if (![1, 2].includes(Number(semester))) {
      return res.status(400).json({ message: 'Semester is required (1 or 2)' });
    }
    if (!department || !department.trim()) {
      return res.status(400).json({ message: 'Department is required' });
    }
    const deptExists = await Department.findOne({ name: department.trim(), isActive: true });
    if (!deptExists) {
      return res.status(400).json({ message: `Department "${department}" does not exist. Create it first in the Departments page.` });
    }

    const exists = await Course.findOne({ courseCode: courseCode.trim().toUpperCase() });
    if (exists) return res.status(400).json({ message: 'Course code already exists' });

    const course = await Course.create({
      courseCode: courseCode.trim().toUpperCase(),
      courseName: courseName.trim(),
      description: description?.trim() || '',
      units: Number(units),
      yearLevel: Number(yearLevel),
      semester: Number(semester),
      department: department?.trim() || '',
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

    // Preload valid department names for validation
    const validDepts = await Department.find({ isActive: true });
    const validDeptNames = new Set(validDepts.map(d => d.name.toLowerCase()));

    for (const row of rows) {
      const courseCode = (row.courseCode || row.coursecode || row.code || '')?.toString().trim().toUpperCase();
      const courseName = (row.courseName || row.coursename || row.name || '')?.toString().trim();
      const units = parseInt(row.units || row.Units) || 0;
      const yearLevel = Number(row.yearLevel || row.yearlevel || row.year) || 0;
      const semester = Number(row.semester || row.Semester) || 0;
      const department = (row.department || row.Department || '')?.toString().trim();

      // Validate required fields
      if (!courseCode) {
        results.errors.push({ row: courseName || '?', reason: 'Missing course code' });
        continue;
      }
      if (courseCode.length < 2) {
        results.errors.push({ row: courseCode, reason: 'Course code too short (min 2 characters)' });
        continue;
      }
      if (!courseName) {
        results.errors.push({ row: courseCode, reason: 'Missing course name' });
        continue;
      }
      if (units < 1 || units > 12) {
        results.errors.push({ row: courseCode, reason: 'Invalid units (must be 1-12)' });
        continue;
      }
      if (![1, 2, 3, 4].includes(yearLevel)) {
        results.errors.push({ row: courseCode, reason: 'Invalid or missing year level (must be 1-4)' });
        continue;
      }
      if (![1, 2].includes(semester)) {
        results.errors.push({ row: courseCode, reason: 'Invalid or missing semester (must be 1 or 2)' });
        continue;
      }
      if (!department) {
        results.errors.push({ row: courseCode, reason: 'Missing department' });
        continue;
      }
      if (!validDeptNames.has(department.toLowerCase())) {
        results.errors.push({ row: courseCode, reason: `Department "${department}" does not exist. Create it first.` });
        continue;
      }

      // Check duplicate
      const exists = await Course.findOne({ courseCode });
      if (exists) { results.skipped++; continue; }

      try {
        await Course.create({
          courseCode,
          courseName,
          description: (row.description || row.Description || '')?.toString().trim(),
          units,
          yearLevel,
          semester,
          department,
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
