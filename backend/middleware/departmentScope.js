/**
 * Department Scope Middleware
 * 
 * For sub-admins with assignedDepartments, this middleware injects
 * the department filter into req so controllers can use it.
 * 
 * Super admins (isSuperAdmin: true) and admins without assignedDepartments
 * see all departments (no filter applied).
 * 
 * Usage in controllers:
 *   const deptFilter = req.departmentScope; // null (all) or { department: { $in: [...] } }
 */

const getDepartmentScope = (req) => {
  const user = req.user;

  // Super admins see everything
  if (user.isSuperAdmin) return null;

  // Non-admin roles: no scope filtering here (handled by role-based auth)
  if (user.role !== 'admin') return null;

  // Sub-admin with assigned departments
  if (user.assignedDepartments && user.assignedDepartments.length > 0) {
    return { department: { $in: user.assignedDepartments } };
  }

  // Sub-admin without assignedDepartments (undefined/empty) — sees all
  return null;
};

/**
 * Middleware that attaches departmentScope to req.
 * Use after `protect` middleware.
 */
const attachDepartmentScope = (req, res, next) => {
  req.departmentScope = getDepartmentScope(req);
  next();
};

module.exports = { attachDepartmentScope, getDepartmentScope };
