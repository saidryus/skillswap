const express = require('express');
const router = express.Router();
const {
  getCourses, getCourseById, createCourse, updateCourse, deleteCourse, importCourses,
} = require('../controllers/course.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/import', authorize('admin'), importCourses);
router.route('/').get(getCourses).post(authorize('admin'), createCourse);
router.route('/:id')
  .get(getCourseById)
  .put(authorize('admin'), updateCourse)
  .delete(authorize('admin'), deleteCourse);

module.exports = router;
