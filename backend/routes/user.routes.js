const express = require('express');
const router = express.Router();
const {
  getUsers, getUserById, createUser, updateUser, deleteUser,
  getAdminPermissions, importStudents,
} = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/admin-permissions', authorize('admin'), getAdminPermissions);
router.post('/import', authorize('admin'), importStudents);
router.route('/').get(authorize('admin'), getUsers).post(authorize('admin'), createUser);
router.route('/:id')
  .get(authorize('admin'), getUserById)
  .put(authorize('admin'), updateUser)
  .delete(authorize('admin'), deleteUser);

module.exports = router;
