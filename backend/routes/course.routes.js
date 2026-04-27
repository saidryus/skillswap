const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollStudent,
  unenrollStudent,
  getMyCourses,
  getMyTeachingCourses,
} = require('../controllers/course.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/my-courses', getMyCourses);
router.get('/my-teaching', authorize('faculty'), getMyTeachingCourses);
router.route('/').get(getCourses).post(authorize('admin'), createCourse);
router
  .route('/:id')
  .get(getCourseById)
  .put(authorize('admin'), updateCourse)
  .delete(authorize('admin'), deleteCourse);
router.post('/:id/enroll', authorize('admin'), enrollStudent);
router.post('/:id/unenroll', authorize('admin'), unenrollStudent);

module.exports = router;
