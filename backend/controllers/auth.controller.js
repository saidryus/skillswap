const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @desc    Login user
//          Students log in with studentIdNumber + password
//          Admins log in with email + password
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    // identifier can be an email (admin) or studentIdNumber (student)

    if (!identifier || !password) {
      return res.status(400).json({ message: 'ID number (or email) and password are required' });
    }

    // Try email first (admin), then studentIdNumber (student)
    let user = await User.findOne({ email: identifier.toLowerCase().trim() });
    if (!user) {
      user = await User.findOne({ studentIdNumber: identifier.trim() });
    }

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid ID number or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated. Contact your administrator.' });
    }

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      studentIdNumber: user.studentIdNumber,
      yearLevel: user.yearLevel,
      isTutor: user.isTutor,
      mustChangePassword: user.mustChangePassword || false,
      isSuperAdmin: user.isSuperAdmin || false,
      permissions: user.permissions || [],
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change own password (used for forced first-login change)
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id);
    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.json(req.user);
};

module.exports = { login, getMe, changePassword };
