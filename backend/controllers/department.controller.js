const Department = require('../models/Department');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create department
// @route   POST /api/departments
// @access  Admin
const createDepartment = async (req, res) => {
  try {
    const { name, code, description } = req.body;

    const exists = await Department.findOne({ $or: [{ code: code?.toUpperCase() }, { name }] });
    if (exists) return res.status(400).json({ message: 'Department name or code already exists' });

    const department = await Department.create({ name, code, description });
    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Admin
const updateDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) return res.status(404).json({ message: 'Department not found' });
    Object.assign(department, req.body);
    const updated = await department.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Admin
const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) return res.status(404).json({ message: 'Department not found' });
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk import departments from CSV (parsed JSON array)
// @route   POST /api/departments/import
// @access  Admin
const importDepartments = async (req, res) => {
  try {
    const rows = req.body;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ message: 'No data provided' });
    }

    const results = { created: 0, skipped: 0, errors: [] };

    for (const row of rows) {
      const name = row.name?.toString().trim();
      const code = row.code?.toString().trim().toUpperCase();

      if (!name || !code) {
        results.errors.push({ row: code || '?', reason: 'Missing name or code' });
        continue;
      }

      const exists = await Department.findOne({ $or: [{ code }, { name }] });
      if (exists) { results.skipped++; continue; }

      try {
        await Department.create({
          name,
          code,
          description: row.description?.toString().trim() || '',
        });
        results.created++;
      } catch (err) {
        results.errors.push({ row: code, reason: err.message });
      }
    }

    res.status(201).json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDepartments, createDepartment, updateDepartment, deleteDepartment, importDepartments };
