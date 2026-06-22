const express = require('express');
const router = express.Router();
const {
  getDepartments, createDepartment, updateDepartment, deleteDepartment, importDepartments,
} = require('../controllers/department.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/import', authorize('admin'), importDepartments);
router.route('/').get(getDepartments).post(authorize('admin'), createDepartment);
router.route('/:id')
  .put(authorize('admin'), updateDepartment)
  .delete(authorize('admin'), deleteDepartment);

module.exports = router;
