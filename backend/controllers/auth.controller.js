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

    if (!user) {
      return res.status(401).json({ message: 'Invalid ID number or password' });
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      const secondsLeft = Math.ceil((user.lockUntil - new Date()) / 1000);
      return res.status(429).json({
        message: `Account temporarily locked due to too many failed attempts. Try again in ${secondsLeft} seconds.`,
        lockUntil: user.lockUntil,
        secondsLeft,
      });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      // Increment failed attempts
      const attempts = (user.loginAttempts || 0) + 1;
      const update = { loginAttempts: attempts };

      // Lock after 3 failed attempts (progressive: 30s → 60s → 180s max)
      if (attempts >= 3) {
        const lockCount = (user.lockCount || 0) + 1;
        const lockDurations = [30, 60, 180]; // seconds
        const lockSeconds = lockDurations[Math.min(lockCount - 1, lockDurations.length - 1)];
        update.lockUntil = new Date(Date.now() + lockSeconds * 1000);
        update.loginAttempts = 0;
        update.lockCount = lockCount;
        await User.findByIdAndUpdate(user._id, update);
        return res.status(429).json({
          message: `Too many failed login attempts. Account locked for ${lockSeconds} seconds.`,
          lockUntil: update.lockUntil,
          secondsLeft: lockSeconds,
        });
      }

      await User.findByIdAndUpdate(user._id, update);
      return res.status(401).json({
        message: `Invalid ID number or password. ${3 - attempts} attempt(s) remaining.`,
        attemptsRemaining: 3 - attempts,
      });
    }

    // Successful login — reset attempts
    if (user.loginAttempts > 0 || user.lockUntil || user.lockCount > 0) {
      await User.findByIdAndUpdate(user._id, { loginAttempts: 0, lockUntil: null, lockCount: 0 });
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
      currentSemester: user.currentSemester || null,
      isTutor: user.isTutor,
      mustChangePassword: user.mustChangePassword || false,
      isSuperAdmin: user.isSuperAdmin || false,
      permissions: user.permissions || [],
      assignedDepartments: user.assignedDepartments || [],
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
