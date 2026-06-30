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
    const { firstName, lastName, email, password, role, yearLevel, phone, studentIdNumber, permissions } = req.body;

    if (role === 'admin' && !req.user.isSuperAdmin) {
      return res.status(403).json({ message: 'Only the super admin can create admin accounts' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Email already in use' });

    const userData = {
      firstName,
      lastName,
      email,
      password,
      role: role || 'student',
      department: 'Information Technology',
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

    const { firstName, lastName, email, yearLevel, phone, isActive, password, permissions, studentIdNumber } = req.body;

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone && phone.trim() !== '' ? phone.trim() : undefined;
    if (yearLevel !== undefined) {
      const newYear = yearLevel ? Number(yearLevel) : null;
      // If year level changed, delete the old schedule (it's no longer valid)
      if (newYear !== user.yearLevel) {
        const StudentSchedule = require('../models/StudentSchedule');
        await StudentSchedule.deleteMany({ student: user._id });
      }
      user.yearLevel = newYear;
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

    for (const row of rows) {
      const email = row.email?.toString().trim().toLowerCase();
      const firstName = row.firstName?.toString().trim();
      const lastName = row.lastName?.toString().trim();

      if (!email || !firstName || !lastName) {
        results.errors.push({ row: email || '?', reason: 'Missing required fields' });
        continue;
      }

      const exists = await User.findOne({ email });
      if (exists) { results.skipped++; continue; }

      try {
        const sid = row.studentIdNumber?.toString().trim() || '';
        const last3 = sid.slice(-3);
        await User.create({
          firstName,
          lastName,
          email,
          password: row.password?.toString().trim() || last3 || 'skillswap123',
          mustChangePassword: true,
          role: 'student',
          department: 'Information Technology',
          studentIdNumber: sid,
          yearLevel: [1,2,3,4].includes(Number(row.yearLevel)) ? Number(row.yearLevel) : null,
          phone: row.phone?.toString().trim() || '',
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
