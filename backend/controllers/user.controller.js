const User = require('../models/User');
const { ADMIN_PERMISSIONS } = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Admin
const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};

    // Apply department scope for sub-admins
    const { getDepartmentScope } = require('../middleware/departmentScope');
    const scope = getDepartmentScope(req);
    if (scope) Object.assign(filter, scope);

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create user (admin only — no self-registration)
// @route   POST /api/users
// @access  Admin
const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, yearLevel, phone, studentIdNumber, department, permissions } = req.body;

    if (role === 'admin' && !req.user.isSuperAdmin) {
      return res.status(403).json({ message: 'Only the super admin can create admin accounts' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Email already in use' });

    if (studentIdNumber && studentIdNumber.trim()) {
      const idExists = await User.findOne({ studentIdNumber: studentIdNumber.trim() });
      if (idExists) return res.status(400).json({ message: `Student ID ${studentIdNumber} is already assigned to another user` });
    }

    const userData = {
      firstName,
      lastName,
      email,
      password,
      role: role || 'student',
      department: department || '',
    };

    if (phone && phone.trim() !== '') userData.phone = phone.trim();
    if (studentIdNumber) userData.studentIdNumber = studentIdNumber.trim();
    if (yearLevel) userData.yearLevel = Number(yearLevel);

    // For students — default password is last 3 digits of student ID, force change on first login
    if ((role || 'student') === 'student' && studentIdNumber) {
      const last3 = studentIdNumber.trim().slice(-3);
      userData.password = password || last3;
      userData.mustChangePassword = true;
    }

    if (role === 'admin') {
      userData.isSuperAdmin = false;
      userData.permissions = Array.isArray(permissions) ? permissions : [];
      if (Array.isArray(req.body.assignedDepartments)) {
        userData.assignedDepartments = req.body.assignedDepartments;
      }
    }

    const user = await User.create(userData);
    res.status(201).json({ ...user.toJSON(), password: undefined });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Admin
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.isSuperAdmin && !req.user.isSuperAdmin) {
      return res.status(403).json({ message: 'Cannot modify the super admin account' });
    }

    if (user.role === 'admin' && !req.user.isSuperAdmin) {
      return res.status(403).json({ message: 'Only the super admin can modify admin accounts' });
    }

    const { firstName, lastName, email, yearLevel, phone, isActive, password, permissions, studentIdNumber, currentSemester } = req.body;

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone && phone.trim() !== '' ? phone.trim() : undefined;
    if (yearLevel !== undefined) {
      const newYear = yearLevel ? Number(yearLevel) : null;
      user.yearLevel = newYear;
    }
    if (currentSemester !== undefined) {
      user.currentSemester = currentSemester ? Number(currentSemester) : null;
    }
    if (isActive !== undefined) user.isActive = isActive;
    if (password) user.password = password;
    if (studentIdNumber !== undefined) user.studentIdNumber = studentIdNumber;
    if (req.user.isSuperAdmin && Array.isArray(permissions)) user.permissions = permissions;
    if (req.user.isSuperAdmin && req.body.assignedDepartments !== undefined) {
      user.assignedDepartments = Array.isArray(req.body.assignedDepartments) ? req.body.assignedDepartments : undefined;
    }

    const updated = await user.save();
    res.json({ ...updated.toJSON(), password: undefined });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.isSuperAdmin) {
      return res.status(403).json({ message: 'Cannot delete the super admin account' });
    }

    if (user.role === 'admin' && !req.user.isSuperAdmin) {
      return res.status(403).json({ message: 'Only the super admin can delete admin accounts' });
    }

    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get available admin permissions list
// @route   GET /api/users/admin-permissions
// @access  Super Admin
const getAdminPermissions = async (req, res) => {
  if (!req.user.isSuperAdmin) {
    return res.status(403).json({ message: 'Super admin only' });
  }
  res.json({ permissions: ADMIN_PERMISSIONS });
};

// @desc    Bulk import students from CSV (parsed JSON array)
// @route   POST /api/users/import
// @access  Admin
const importStudents = async (req, res) => {
  try {
    const rows = req.body;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ message: 'No data provided' });
    }

    const results = { created: 0, skipped: 0, errors: [] };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (const row of rows) {
      const email = (row.email || row.Email || '')?.toString().trim().toLowerCase();
      const firstName = (row.firstName || row.firstname || row.Firstname || row['first name'] || '')?.toString().trim();
      const lastName = (row.lastName || row.lastname || row.Lastname || row['last name'] || '')?.toString().trim();
      const sid = (row.studentIdNumber || row.studentidnumber || row.studentid || row['student id'] || '')?.toString().trim();
      const yearLevel = Number(row.yearLevel || row.yearlevel || row.year) || 0;
      const currentSemester = Number(row.semester || row.currentSemester || row.Semester) || null;
      const department = (row.department || row.Department || '')?.toString().trim();

      // Validate required fields
      if (!firstName || !lastName) {
        results.errors.push({ row: email || sid || '?', reason: 'Missing first name or last name' });
        continue;
      }
      if (!email) {
        results.errors.push({ row: `${firstName} ${lastName}`, reason: 'Missing email' });
        continue;
      }
      if (!emailRegex.test(email)) {
        results.errors.push({ row: email, reason: 'Invalid email format' });
        continue;
      }
      if (!sid) {
        results.errors.push({ row: email, reason: 'Missing Student ID' });
        continue;
      }
      if (![1, 2, 3, 4].includes(yearLevel)) {
        results.errors.push({ row: email, reason: 'Invalid or missing year level (must be 1-4)' });
        continue;
      }

      // Check duplicates
      const exists = await User.findOne({ email });
      if (exists) { results.skipped++; continue; }

      const sidExists = await User.findOne({ studentIdNumber: sid });
      if (sidExists) { results.errors.push({ row: email, reason: `Student ID ${sid} already exists` }); continue; }

      try {
        const last3 = sid.slice(-3);
        await User.create({
          firstName,
          lastName,
          email,
          password: (row.password || row.Password || '')?.toString().trim() || last3,
          mustChangePassword: true,
          role: 'student',
          department,
          studentIdNumber: sid,
          yearLevel,
          currentSemester,
          phone: (row.phone || row.Phone || '')?.toString().trim(),
        });
        results.created++;
      } catch (err) {
        results.errors.push({ row: email, reason: err.message });
      }
    }

    res.status(201).json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser, getAdminPermissions, importStudents };
