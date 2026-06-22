const Session = require('../models/Session');
const StudentSchedule = require('../models/StudentSchedule');
const TutorProfile = require('../models/TutorProfile');
const { createNotifications } = require('../utils/notify');

/* ── Time helpers ──────────────────────────────────────────────── */
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TIME_SLOTS = (() => {
  const slots = [];
  for (let h = 7; h < 21; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    slots.push(`${String(h).padStart(2, '0')}:30`);
  }
  return slots;
})();

function parseTime(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function timesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}

/**
 * Build busy map for a list of user IDs.
 * busy[userId][day] = [[startTime, endTime], ...]
 */
async function buildBusyMap(userIds, dateStr) {
  const busy = {};

  // Initialize
  for (const id of userIds) {
    busy[id.toString()] = {};
    for (const day of DAYS) busy[id.toString()][day] = [];
  }

  // Weekly class schedules
  const classSchedules = await StudentSchedule.find({ student: { $in: userIds } });
  for (const s of classSchedules) {
    const uid = s.student.toString();
    if (!busy[uid][s.day]) busy[uid][s.day] = [];
    busy[uid][s.day].push([s.startTime, s.endTime]);
  }

  // Existing sessions on the requested date (if provided)
  if (dateStr) {
    const date = new Date(dateStr);
    const dayName = DAYS[date.getDay() === 0 ? 6 : date.getDay() - 1];
    const sessions = await Session.find({
      $or: [
        { tutor: { $in: userIds } },
        { tutees: { $in: userIds } },
      ],
      date,
      status: { $ne: 'cancelled' },
    });
    for (const s of sessions) {
      const participants = [s.tutor.toString(), ...s.tutees.map((t) => t.toString())];
      for (const uid of participants) {
        if (busy[uid]) {
          if (!busy[uid][dayName]) busy[uid][dayName] = [];
          busy[uid][dayName].push([s.startTime, s.endTime]);
        }
      }
    }
  }

  return busy;
}

/**
 * Find all mutual free time slots for a set of users on a given day.
 * Returns array of { startTime, endTime } pairs (30-min minimum, up to 3 hrs).
 */
function findMutualFreeSlots(busyMap, userIds, day, sessionDurationMinutes = 60) {
  const slotsNeeded = sessionDurationMinutes / 30;
  const free = [];

  for (let ti = 0; ti <= TIME_SLOTS.length - slotsNeeded; ti++) {
    const startTime = TIME_SLOTS[ti];
    const endTime = TIME_SLOTS[ti + slotsNeeded - 1]
      ? (() => {
          const [h, m] = TIME_SLOTS[ti + slotsNeeded - 1].split(':').map(Number);
          const total = h * 60 + m + 30;
          return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
        })()
      : null;

    if (!endTime) continue;
    if (parseTime(endTime) > parseTime('21:00')) break;

    // Check all users are free during this slot
    const allFree = userIds.every((uid) => {
      const uidStr = uid.toString();
      const dayBusy = busyMap[uidStr]?.[day] || [];
      return !dayBusy.some(([bs, be]) => timesOverlap(startTime, endTime, bs, be));
    });

    if (allFree) {
      free.push({ startTime, endTime });
    }
  }

  return free;
}

// @desc    Suggest mutual free time slots for a tutor + tutee(s)
// @route   POST /api/sessions/suggest
// @access  Private
const suggestSlots = async (req, res) => {
  try {
    const { tutorId, tuteeIds, courseId, date, durationMinutes = 60 } = req.body;

    if (!tutorId || !tuteeIds || !Array.isArray(tuteeIds) || tuteeIds.length === 0) {
      return res.status(400).json({ message: 'tutorId and tuteeIds (array) are required' });
    }

    // Verify tutor is approved for this course
    if (courseId) {
      const profile = await TutorProfile.findOne({
        tutor: tutorId, course: courseId, status: 'approved',
      });
      if (!profile) {
        return res.status(400).json({ message: 'Tutor is not approved for this course' });
      }
    }

    const allUserIds = [tutorId, ...tuteeIds];
    const busyMap = await buildBusyMap(allUserIds, date);

    const suggestions = [];

    // If a specific date is provided, find slots for that day only
    if (date) {
      const d = new Date(date);
      const dowIndex = d.getDay(); // 0=Sun
      const dayName = dowIndex === 0 ? 'Sunday' : DAYS[dowIndex - 1];
      const slots = findMutualFreeSlots(busyMap, allUserIds, dayName, durationMinutes);
      suggestions.push({ day: dayName, date, slots });
    } else {
      // Return suggestions for each day of the week
      for (const day of DAYS) {
        const slots = findMutualFreeSlots(busyMap, allUserIds, day, durationMinutes);
        if (slots.length > 0) {
          suggestions.push({ day, slots }); // all available slots
        }
      }
    }

    res.json({ suggestions, durationMinutes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Book a session
// @route   POST /api/sessions
// @access  Student (tutee initiates)
const createSession = async (req, res) => {
  try {
    const { tutorId, tuteeIds, courseId, date, startTime, endTime, venue, venueType, notes } = req.body;

    if (!tutorId || !courseId || !date || !startTime || !endTime) {
      return res.status(400).json({ message: 'tutorId, courseId, date, startTime, endTime are required' });
    }

    // Prevent booking a session with yourself
    if (tutorId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot book a session with yourself' });
    }

    // Check tutor's weekly availability cap
    const tutorUser = await require('../models/User').findById(tutorId);
    if (tutorUser) {
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      const sessionsThisWeek = await Session.countDocuments({
        tutor: tutorId,
        date: { $gte: weekStart, $lt: weekEnd },
        status: { $in: ['pending', 'scheduled'] },
      });

      const maxPerWeek = tutorUser.maxSessionsPerWeek || 5;
      if (sessionsThisWeek >= maxPerWeek) {
        return res.status(400).json({
          message: `This tutor has reached their maximum of ${maxPerWeek} sessions this week. Try another time or tutor.`,
        });
      }
    }

    // Verify tutor approval
    const profile = await TutorProfile.findOne({
      tutor: tutorId, course: courseId, status: 'approved',
    });
    if (!profile) {
      return res.status(400).json({ message: 'Tutor is not approved for this course' });
    }

    const sessionDate = new Date(date);
    const allUserIds = [tutorId, ...(tuteeIds || [req.user._id])];

    // Conflict check
    const busyMap = await buildBusyMap(allUserIds, date);
    const d = new Date(date);
    const dowIndex = d.getDay();
    const dayName = dowIndex === 0 ? 'Sunday' : DAYS[dowIndex - 1];

    for (const uid of allUserIds) {
      const uidStr = uid.toString();
      const dayBusy = busyMap[uidStr]?.[dayName] || [];
      const conflict = dayBusy.some(([bs, be]) => timesOverlap(startTime, endTime, bs, be));
      if (conflict) {
        return res.status(409).json({
          message: `A participant has a schedule conflict on ${dayName} from ${startTime}–${endTime}`,
        });
      }
    }

    const session = await Session.create({
      tutor: tutorId,
      tutees: tuteeIds || [req.user._id],
      course: courseId,
      date: sessionDate,
      startTime,
      endTime,
      venue: venue || '',
      venueType: venueType || 'on-campus',
      status: 'pending', // tutor must accept
      notes: notes || '',
    });

    // Notify tutor of the pending request
    await createNotifications({
      recipient: tutorId,
      type: 'session_request',
      title: 'New Session Request',
      message: `${req.user.firstName} ${req.user.lastName} wants to book a study session with you on ${new Date(date).toDateString()} at ${startTime}.`,
      link: '/student/my-sessions',
      meta: { sessionId: session._id },
    });

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged-in student's sessions (as tutor or tutee)
// @route   GET /api/sessions/my-sessions
// @access  Student
const getMySessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [
        { tutor: req.user._id },
        { tutees: req.user._id },
      ],
    })
      .populate('tutor', 'firstName lastName studentIdNumber')
      .populate('tutees', 'firstName lastName studentIdNumber')
      .populate('course', 'courseCode courseName')
      .sort({ date: 1, startTime: 1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all sessions (admin)
// @route   GET /api/sessions
// @access  Admin
const getAllSessions = async (req, res) => {
  try {
    const { status, courseId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (courseId) filter.course = courseId;

    const sessions = await Session.find(filter)
      .populate('tutor', 'firstName lastName studentIdNumber')
      .populate('tutees', 'firstName lastName studentIdNumber')
      .populate('course', 'courseCode courseName')
      .sort({ date: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark session as completed
// @route   PUT /api/sessions/:id/complete
// @access  Student (tutor only) or Admin
const completeSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    if (
      req.user.role !== 'admin' &&
      session.tutor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Only the tutor or admin can complete a session' });
    }

    session.status = 'completed';
    await session.save();
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel a session
// @route   PUT /api/sessions/:id/cancel
// @access  Student (tutor or tutee) or Admin
const cancelSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('tutor', 'firstName lastName')
      .populate('course', 'courseCode');

    if (!session) return res.status(404).json({ message: 'Session not found' });

    const isParticipant =
      session.tutor._id.toString() === req.user._id.toString() ||
      session.tutees.map((t) => t.toString()).includes(req.user._id.toString());

    if (req.user.role !== 'admin' && !isParticipant) {
      return res.status(403).json({ message: 'Not authorized to cancel this session' });
    }

    session.status = 'cancelled';
    await session.save();

    // Notify all participants
    const recipients = [session.tutor._id, ...session.tutees];
    await createNotifications(
      recipients
        .filter((id) => id.toString() !== req.user._id.toString())
        .map((id) => ({
          recipient: id,
          type: 'session_cancelled',
          title: 'Session Cancelled',
          message: `The ${session.course.courseCode} session on ${new Date(session.date).toDateString()} at ${session.startTime} has been cancelled.`,
          link: '/student/my-sessions',
        }))
    );

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get session history for a student
// @route   GET /api/sessions/history/:studentId
// @access  Admin
const getSessionHistory = async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [
        { tutor: req.params.studentId },
        { tutees: req.params.studentId },
      ],
    })
      .populate('tutor', 'firstName lastName')
      .populate('tutees', 'firstName lastName')
      .populate('course', 'courseCode courseName')
      .sort({ date: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Tutor accepts a pending session request
// @route   PUT /api/sessions/:id/accept
// @access  Student (tutor only)
const acceptSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('course', 'courseCode')
      .populate('tutees', 'firstName lastName');

    if (!session) return res.status(404).json({ message: 'Session not found' });

    if (session.tutor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the tutor can accept this session' });
    }

    if (session.status !== 'pending') {
      return res.status(400).json({ message: `Cannot accept a session that is ${session.status}` });
    }

    session.status = 'scheduled';
    await session.save();

    // Notify tutees
    await createNotifications(
      session.tutees.map(t => ({
        recipient: t._id,
        type: 'session_accepted',
        title: 'Session Accepted',
        message: `${req.user.firstName} ${req.user.lastName} accepted your ${session.course.courseCode} session on ${new Date(session.date).toDateString()} at ${session.startTime}.`,
        link: '/student/my-sessions',
        meta: { sessionId: session._id },
      }))
    );

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Tutor rejects a pending session request
// @route   PUT /api/sessions/:id/reject
// @access  Student (tutor only)
const rejectSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('course', 'courseCode')
      .populate('tutees', 'firstName lastName');

    if (!session) return res.status(404).json({ message: 'Session not found' });

    if (session.tutor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the tutor can reject this session' });
    }

    if (session.status !== 'pending') {
      return res.status(400).json({ message: `Cannot reject a session that is ${session.status}` });
    }

    session.status = 'rejected';
    await session.save();

    const reason = req.body.reason || '';

    // Notify tutees
    await createNotifications(
      session.tutees.map(t => ({
        recipient: t._id,
        type: 'session_rejected',
        title: 'Session Declined',
        message: `${req.user.firstName} ${req.user.lastName} declined your ${session.course.courseCode} session request.${reason ? ` Reason: ${reason}` : ''}`,
        link: '/student/my-sessions',
        meta: { sessionId: session._id },
      }))
    );

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get scheduled sessions for a specific user (for timetable visualization)
// @route   GET /api/sessions/user/:userId
// @access  Private (any authenticated user)
const getUserSessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [
        { tutor: req.params.userId },
        { tutees: req.params.userId },
      ],
      status: 'scheduled',
    })
      .populate('course', 'courseCode courseName')
      .sort({ date: 1 });

    // Return only what's needed for timetable visualization
    const entries = sessions.map(s => ({
      _id: s._id,
      date: s.date,
      startTime: s.startTime,
      endTime: s.endTime,
      courseCode: s.course?.courseCode || '',
      status: s.status,
    }));

    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get session statistics (frequency tracking)
// @route   GET /api/sessions/stats
// @access  Admin
const getSessionStats = async (req, res) => {
  try {
    const total = await Session.countDocuments();
    const pending = await Session.countDocuments({ status: 'pending' });
    const scheduled = await Session.countDocuments({ status: 'scheduled' });
    const completed = await Session.countDocuments({ status: 'completed' });
    const cancelled = await Session.countDocuments({ status: 'cancelled' });
    const rejected = await Session.countDocuments({ status: 'rejected' });

    // Weekly breakdown (last 8 weeks)
    const weeklyData = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() - (i * 7));
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      const count = await Session.countDocuments({
        createdAt: { $gte: weekStart, $lt: weekEnd },
      });
      const completedCount = await Session.countDocuments({
        status: 'completed',
        date: { $gte: weekStart, $lt: weekEnd },
      });

      weeklyData.push({
        weekStart: weekStart.toISOString().split('T')[0],
        booked: count,
        completed: completedCount,
      });
    }

    // Top tutors by completed sessions
    const topTutors = await Session.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$tutor', completedCount: { $sum: 1 } } },
      { $sort: { completedCount: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: {
        completedCount: 1,
        'user.firstName': 1,
        'user.lastName': 1,
        'user.studentIdNumber': 1,
      }},
    ]);

    // Top courses by session count
    const topCourses = await Session.aggregate([
      { $group: { _id: '$course', sessionCount: { $sum: 1 } } },
      { $sort: { sessionCount: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'course' } },
      { $unwind: '$course' },
      { $project: {
        sessionCount: 1,
        'course.courseCode': 1,
        'course.courseName': 1,
      }},
    ]);

    res.json({
      totals: { total, pending, scheduled, completed, cancelled, rejected },
      weeklyData,
      topTutors,
      topCourses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  suggestSlots,
  createSession,
  getMySessions,
  getAllSessions,
  completeSession,
  cancelSession,
  acceptSession,
  rejectSession,
  getSessionHistory,
  getUserSessions,
  getSessionStats,
};
