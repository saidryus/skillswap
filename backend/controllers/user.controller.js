const User = require('../models/User');
const { ADMIN_PERMISSIONS } = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Admin
const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
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

// @desc    Create user (admin)
// @route   POST /api/users
// @access  Admin
const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, department, studentId, permissions } = req.body;

    // Only super admin can create other admins
    if (role === 'admin' && !req.user.isSuperAdmin) {
      return res.status(403).json({ message: 'Only the super admin can create admin accounts' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Email already in use' });

    const userData = { firstName, lastName, email, password, role, department };
    // Only set studentId if it's actually provided (avoids duplicate key errors on the unique index)
    if (studentId && studentId.trim() !== '') {
      userData.studentId = studentId.trim();
    }

    // If creating a sub-admin, attach permissions
    if (role === 'admin') {
      userData.isSuperAdmin = false;
      userData.permissions = Array.isArray(permissions) ? permissions : [];
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

    // Protect the super admin account from being modified by sub-admins
    if (user.isSuperAdmin && !req.user.isSuperAdmin) {
      return res.status(403).json({ message: 'Cannot modify the super admin account' });
    }

    // Only super admin can change permissions or role of another admin
    if (user.role === 'admin' && !req.user.isSuperAdmin) {
      return res.status(403).json({ message: 'Only the super admin can modify admin accounts' });
    }

    const { firstName, lastName, email, role, department, studentId, isActive, password, permissions } = req.body;

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.role = role || user.role;
    user.department = department !== undefined ? department : user.department;
    // Only update studentId if provided; clear it if explicitly set to empty string
    if (studentId !== undefined) {
      user.studentId = (studentId && studentId.trim() !== '') ? studentId.trim() : undefined;
    }
    if (isActive !== undefined) user.isActive = isActive;
    if (password) user.password = password;

    // Super admin can update sub-admin permissions
    if (req.user.isSuperAdmin && Array.isArray(permissions)) {
      user.permissions = permissions;
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

    // Cannot delete super admin
    if (user.isSuperAdmin) {
      return res.status(403).json({ message: 'Cannot delete the super admin account' });
    }

    // Sub-admins cannot delete other admins
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

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser, getAdminPermissions };
