const Schedule = require('../models/Schedule');
const Course = require('../models/Course');
const { createNotifications } = require('../utils/notify');

/**
 * Returns true if two time ranges overlap.
 * Times are "HH:MM" strings — lexicographic comparison works fine for 24h format.
 */
const timesOverlap = (aStart, aEnd, bStart, bEnd) =>
  aStart < bEnd && aEnd > bStart;

/**
 * Core conflict checker.
 * Checks room, instructor, and student conflicts for a proposed slot.
 *
 * @param {string} day
 * @param {string} startTime
 * @param {string} endTime
 * @param {string} room
 * @param {string} courseId       - the course being scheduled
 * @param {string|null} excludeId - schedule _id to exclude (for updates)
 */
const checkConflicts = async (day, startTime, endTime, room, courseId, excludeId = null) => {
  // Fetch all schedules on the same day, excluding the one being updated
  const query = { day };
  if (excludeId) query._id = { $ne: excludeId };

  const sameDaySchedules = await Schedule.find(query).populate({
    path: 'course',
    select: 'courseCode courseName faculty students',
  });

  // Only care about schedules that actually overlap in time
  const overlapping = sameDaySchedules.filter((s) =>
    timesOverlap(startTime, endTime, s.startTime, s.endTime)
  );

  const course = await Course.findById(courseId).populate('faculty', 'firstName lastName');
  if (!course) throw new Error('Course not found');

  for (const s of overlapping) {
    const otherCourse = s.course;
    if (!otherCourse) continue;

    // 1. Same course scheduled twice in the same slot
    if (otherCourse._id.toString() === courseId.toString()) {
      return {
        conflict: true,
        type: 'course',
        message: `${course.courseCode} already has a schedule on ${day} from ${s.startTime}–${s.endTime}.`,
      };
    }

    // 2. Room conflict
    if (room && s.room && room.trim().toLowerCase() === s.room.trim().toLowerCase()) {
      return {
        conflict: true,
        type: 'room',
        message: `Room "${room}" is already occupied on ${day} from ${s.startTime}–${s.endTime} by ${otherCourse.courseCode}.`,
      };
    }

    // 3. Instructor conflict — same faculty teaching two courses at the same time
    if (
      course.faculty &&
      otherCourse.faculty &&
      course.faculty._id.toString() === otherCourse.faculty.toString()
    ) {
      return {
        conflict: true,
        type: 'instructor',
        message: `Instructor ${course.faculty.firstName} ${course.faculty.lastName} is already teaching ${otherCourse.courseCode} on ${day} from ${s.startTime}–${s.endTime}.`,
      };
    }

    // 4. Student conflict — a student enrolled in both courses
    if (course.students?.length && otherCourse.students?.length) {
      const courseStudentIds = course.students.map((id) => id.toString());
      const otherStudentIds = otherCourse.students.map((id) => id.toString());
      const clash = courseStudentIds.find((id) => otherStudentIds.includes(id));
      if (clash) {
        return {
          conflict: true,
          type: 'student',
          message: `One or more students are enrolled in both ${course.courseCode} and ${otherCourse.courseCode}, which overlap on ${day} from ${s.startTime}–${s.endTime}.`,
        };
      }
    }
  }

  return { conflict: false };
};

// @desc    Get all schedules
// @route   GET /api/schedules
// @access  Private
const getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate({ path: 'course', populate: { path: 'faculty', select: 'firstName lastName' } })
      .sort({ day: 1, startTime: 1 });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get schedule by ID
// @route   GET /api/schedules/:id
// @access  Private
const getScheduleById = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id).populate('course');
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create schedule
// @route   POST /api/schedules
// @access  Admin
const createSchedule = async (req, res) => {
  try {
    const { course: courseId, day, startTime, endTime, room, semester, schoolYear } = req.body;

    const result = await checkConflicts(day, startTime, endTime, room, courseId);
    if (result.conflict) {
      return res.status(409).json({ message: result.message, conflictType: result.type });
    }

    const schedule = await Schedule.create({ course: courseId, day, startTime, endTime, room, semester, schoolYear });

    // Notify enrolled students and faculty
    const course = await Course.findById(courseId).populate('faculty', '_id firstName lastName');
    if (course) {
      const recipients = [...course.students];
      if (course.faculty) recipients.push(course.faculty._id);
      await createNotifications(
        recipients.map((id) => ({
          recipient: id,
          type: 'schedule_created',
          title: 'New Schedule Added',
          message: `A new schedule has been added for ${course.courseCode} — ${day} ${startTime}–${endTime}${room ? ` in ${room}` : ''}.`,
          link: '/student/schedule',
          meta: { courseId, day, startTime, endTime, room },
        }))
      );
    }

    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update schedule
// @route   PUT /api/schedules/:id
// @access  Admin
const updateSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id).populate('course');
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });

    // Resolve final values (use incoming or fall back to existing)
    const day       = req.body.day       || schedule.day;
    const startTime = req.body.startTime || schedule.startTime;
    const endTime   = req.body.endTime   || schedule.endTime;
    const room      = req.body.room      !== undefined ? req.body.room : schedule.room;
    const courseId  = req.body.course    || schedule.course?._id || schedule.course;

    // Run conflict check, excluding this schedule itself
    const result = await checkConflicts(day, startTime, endTime, room, courseId, schedule._id);
    if (result.conflict) {
      return res.status(409).json({ message: result.message, conflictType: result.type });
    }

    // Track human-readable changes for notification
    const changes = [];
    if (req.body.day       && req.body.day       !== schedule.day)       changes.push(`day → ${req.body.day}`);
    if (req.body.startTime && req.body.startTime !== schedule.startTime) changes.push(`start → ${req.body.startTime}`);
    if (req.body.endTime   && req.body.endTime   !== schedule.endTime)   changes.push(`end → ${req.body.endTime}`);
    if (req.body.room      && req.body.room      !== schedule.room)      changes.push(`room → ${req.body.room}`);

    Object.assign(schedule, req.body);
    const updated = await schedule.save();

    if (changes.length > 0) {
      const course = await Course.findById(courseId).populate('faculty', '_id');
      if (course) {
        const recipients = [...course.students];
        if (course.faculty) recipients.push(course.faculty._id);
        await createNotifications(
          recipients.map((id) => ({
            recipient: id,
            type: 'schedule_changed',
            title: 'Schedule Updated',
            message: `Schedule for ${course.courseCode} has been updated: ${changes.join(', ')}.`,
            link: '/student/schedule',
            meta: { courseId: course._id, changes },
          }))
        );
      }
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete schedule
// @route   DELETE /api/schedules/:id
// @access  Admin
const deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id).populate('course');
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });

    if (schedule.course) {
      const course = await Course.findById(schedule.course._id || schedule.course).populate('faculty', '_id');
      if (course) {
        const recipients = [...course.students];
        if (course.faculty) recipients.push(course.faculty._id);
        await createNotifications(
          recipients.map((id) => ({
            recipient: id,
            type: 'schedule_changed',
            title: 'Schedule Removed',
            message: `The ${schedule.day} ${schedule.startTime}–${schedule.endTime} schedule for ${course.courseCode} has been removed.`,
            link: '/student/schedule',
          }))
        );
      }
    }

    await schedule.deleteOne();
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get schedules for student's enrolled courses
// @route   GET /api/schedules/my-schedule
// @access  Student
const getMySchedule = async (req, res) => {
  try {
    const courses = await Course.find({ students: req.user._id });
    const courseIds = courses.map((c) => c._id);
    const schedules = await Schedule.find({ course: { $in: courseIds } })
      .populate({ path: 'course', populate: { path: 'faculty', select: 'firstName lastName' } })
      .sort({ day: 1, startTime: 1 });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getMySchedule,
};
