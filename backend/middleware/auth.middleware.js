const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user || !req.user.isActive) {
        return res.status(401).json({ message: 'Not authorized, user inactive or not found' });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

/**
 * Permission-based authorization for sub-admins.
 * Super admins (isSuperAdmin: true) always pass.
 * Sub-admins must have the required permission in their permissions array.
 * Non-admin roles are rejected.
 *
 * Usage: requirePermission('users')
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    const user = req.user;

    // Must be admin role
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Super admin always has full access
    if (user.isSuperAdmin) return next();

    // Sub-admin: check permissions array
    if (!user.permissions || !user.permissions.includes(permission)) {
      return res.status(403).json({
        message: `You do not have permission to access: ${permission}`,
      });
    }

    next();
  };
};

module.exports = { protect, authorize, requirePermission };
