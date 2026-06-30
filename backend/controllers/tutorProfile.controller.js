const TutorProfile = require('../models/TutorProfile');
const User = require('../models/User');
const Course = require('../models/Course');
const { createNotifications } = require('../utils/notify');
const path = require('path');
const fs = require('fs');

// @desc    Student applies to become a tutor for a course
// @route   POST /api/tutor-profiles
// @access  Student
const applyAsTutor = async (req, res) => {
  try {
    const { courseId } = req.body;
    if (!courseId) return res.status(400).json({ message: 'courseId is required' });

    // Require schedule before applying as tutor
    const StudentSchedule = require('../models/StudentSchedule');
    const scheduleCount = await StudentSchedule.countDocuments({ student: req.user._id });
    if (scheduleCount === 0) {
      return res.status(400).json({
        message: 'You must upload your class schedule before applying as a tutor. Go to your schedule page to upload your study load.',
      });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Check for existing active application (pending or approved blocks reapply)
    const existing = await TutorProfile.findOne({
      tutor: req.user._id,
      course: courseId,
      status: { $in: ['pending', 'approved'] },
    });
    if (existing) {
      return res.status(400).json({
        message: existing.status === 'approved'
          ? `You are already an approved tutor for ${course.courseCode}`
          : `You already have a pending application for ${course.courseCode}`,
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Grade document is required' });
    }

    // Run OCR grade extraction with student ID verification
    const { extractGradeFromDocument } = require('../utils/gradeExtractor');
    const ocrResult = await extractGradeFromDocument(req.file.path, course.courseCode, req.user.studentIdNumber);

    // Reject if student ID doesn't match the uploaded document
    if (!ocrResult.idVerified && ocrResult.confidence !== 'none') {
      return res.status(400).json({
        message: `Student ID mismatch. Your ID (${req.user.studentIdNumber}) was not found in the uploaded document. Please upload your own grade slip.`,
      });
    }

    const profile = await TutorProfile.create({
      tutor: req.user._id,
      course: courseId,
      gradeDocument: req.file.path,
      gradeDocumentName: req.file.originalname,
      detectedGrade: ocrResult.grade,
      gradeDetectionConfidence: ocrResult.confidence,
      gradeDetectionMessage: ocrResult.message,
    });

    // Notify admins
    const admins = await User.find({ role: 'admin', isActive: true }).select('_id');
    await createNotifications(
      admins.map((a) => ({
        recipient: a._id,
        type: 'tutor_application',
        title: 'New Tutor Application',
        message: `${req.user.firstName} ${req.user.lastName} applied to tutor ${course.courseCode}.${ocrResult.grade ? ` Auto-detected grade: ${ocrResult.grade.toFixed(2)}` : ''}`,
        link: '/admin/tutor-applications',
        meta: { profileId: profile._id },
      }))
    );

    res.status(201).json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tutor applications (admin) or filter by status
// @route   GET /api/tutor-profiles
// @access  Admin
const getApplications = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    let profiles = await TutorProfile.find(filter)
      .populate('tutor', 'firstName lastName email studentIdNumber yearLevel currentSemester department')
      .populate('course', 'courseCode courseName yearLevel department')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    // Apply department scope for sub-admins
    const { getDepartmentScope } = require('../middleware/departmentScope');
    const scope = getDepartmentScope(req);
    if (scope) {
      const depts = scope.department.$in;
      profiles = profiles.filter(p =>
        p.tutor && depts.includes(p.tutor.department)
      );
    }

    res.json(profiles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged-in student's own applications
// @route   GET /api/tutor-profiles/my-applications
// @access  Student
const getMyApplications = async (req, res) => {
  try {
    const profiles = await TutorProfile.find({ tutor: req.user._id })
      .populate('course', 'courseCode courseName yearLevel')
      .sort({ createdAt: -1 });
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all approved tutors for a specific course (ranked by competency score)
// @route   GET /api/tutor-profiles/tutors?courseId=
// @access  Private
const getTutorsForCourse = async (req, res) => {
  try {
    const { courseId } = req.query;
    if (!courseId) return res.status(400).json({ message: 'courseId is required' });

    const profiles = await TutorProfile.find({ course: courseId, status: 'approved' })
      .populate('tutor', 'firstName lastName email studentIdNumber yearLevel currentSemester maxSessionsPerWeek')
      .populate('course', 'courseCode courseName');

    // Compute competency score for each tutor
    const Rating = require('../models/Rating');
    const Session = require('../models/Session');

    const rankedProfiles = await Promise.all(profiles.map(async (profile) => {
      const tutorId = profile.tutor._id;

      // Get completed and cancelled sessions for this tutor in this course
      const completedSessions = await Session.countDocuments({
        tutor: tutorId, course: courseId, status: 'completed',
      });
      const cancelledSessions = await Session.countDocuments({
        tutor: tutorId, course: courseId, status: 'cancelled',
      });

      // Completion rate: completed / (completed + cancelled). If no sessions yet, default 1.0
      const totalAttempted = completedSessions + cancelledSessions;
      const completionRate = totalAttempted > 0 ? completedSessions / totalAttempted : 1.0;

      // Get ratings for this tutor in this course
      const ratings = await Rating.find({ tutor: tutorId, course: courseId });
      const totalRatings = ratings.length;
      const avgRating = totalRatings > 0
        ? ratings.reduce((sum, r) => sum + r.score, 0) / totalRatings
        : 0;

      // Grade from tutor profile (1.0-3.0 scale, PH college grading — 1.0 is highest)
      const grade = profile.grade || 0;

      // Check availability this week
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

      const maxPerWeek = profile.tutor.maxSessionsPerWeek || 5;
      const availableSlots = Math.max(0, maxPerWeek - sessionsThisWeek);

      /* ── Competency Score (0-100) ──────────────────────────────
       *   Tutee Ratings:       35%  (avgRating / 5 * 35)
       *   Grade in Subject:    25%  (inverted: 1.0→25, 2.0→12.5, 3.0→0)
       *   Completion Rate:     20%  (completionRate * 20)
       *   Sessions Completed:  20%  (min(completedSessions, 20) / 20 * 20)
       * ──────────────────────────────────────────────────────────── */
      const ratingComponent = totalRatings > 0 ? (avgRating / 5) * 35 : 0;
      // Grade: 1.0 = full 25 points, 3.0 = 0 points. Formula: (3.0 - grade) / 2.0 * 25
      const gradeComponent = grade > 0 && grade <= 3.0 ? ((3.0 - grade) / 2.0) * 25 : 0;
      const completionComponent = completionRate * 20;
      const sessionComponent = Math.min(completedSessions, 20) / 20 * 20;

      const competencyScore = Math.round(ratingComponent + gradeComponent + completionComponent + sessionComponent);

      return {
        ...profile.toJSON(),
        competencyScore,
        completedSessions,
        cancelledSessions,
        completionRate: Math.round(completionRate * 100),
        avgRating: Math.round(avgRating * 10) / 10,
        totalRatings,
        grade,
        sessionsThisWeek,
        maxSessionsPerWeek: maxPerWeek,
        availableSlots,
        isAvailable: availableSlots > 0,
      };
    }));

    // Sort by competency score descending
    rankedProfiles.sort((a, b) => b.competencyScore - a.competencyScore);

    res.json(rankedProfiles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin approves a tutor application
// @route   PUT /api/tutor-profiles/:id/approve
// @access  Admin
const approveApplication = async (req, res) => {
  try {
    const profile = await TutorProfile.findById(req.params.id)
      .populate('tutor', 'firstName lastName email isTutor')
      .populate('course', 'courseCode courseName');

    if (!profile) return res.status(404).json({ message: 'Application not found' });
    if (profile.status === 'approved') {
      return res.status(400).json({ message: 'Application already approved' });
    }

    profile.status = 'approved';
    profile.reviewedBy = req.user._id;
    profile.reviewedAt = new Date();
    profile.adminNotes = req.body.adminNotes || '';
    profile.grade = req.body.grade ? Number(req.body.grade) : null;
    await profile.save();

    // Set isTutor = true on the user
    await User.findByIdAndUpdate(profile.tutor._id, { isTutor: true });

    // Notify the student
    await createNotifications({
      recipient: profile.tutor._id,
      type: 'tutor_approved',
      title: 'Tutor Application Approved',
      message: `Your application to tutor ${profile.course.courseCode} has been approved. You can now accept tutoring sessions for this course.`,
      link: '/student/my-sessions',
      meta: { profileId: profile._id, courseId: profile.course._id },
    });

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin rejects a tutor application
// @route   PUT /api/tutor-profiles/:id/reject
// @access  Admin
const rejectApplication = async (req, res) => {
  try {
    const profile = await TutorProfile.findById(req.params.id)
      .populate('tutor', 'firstName lastName email')
      .populate('course', 'courseCode courseName');

    if (!profile) return res.status(404).json({ message: 'Application not found' });

    profile.status = 'rejected';
    profile.reviewedBy = req.user._id;
    profile.reviewedAt = new Date();
    profile.adminNotes = req.body.adminNotes || '';
    await profile.save();

    // Notify the student
    await createNotifications({
      recipient: profile.tutor._id,
      type: 'tutor_rejected',
      title: 'Tutor Application Not Approved',
      message: `Your application to tutor ${profile.course.courseCode} was not approved.${profile.adminNotes ? ` Reason: ${profile.adminNotes}` : ''}`,
      link: '/student/become-tutor',
      meta: { profileId: profile._id },
    });

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Serve uploaded grade document for admin preview
// @route   GET /api/tutor-profiles/:id/document
// @access  Admin
const getDocument = async (req, res) => {
  try {
    const profile = await TutorProfile.findById(req.params.id);
    if (!profile || !profile.gradeDocument) {
      return res.status(404).json({ message: 'Document not found' });
    }
    const absPath = path.resolve(profile.gradeDocument);
    if (!fs.existsSync(absPath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }
    res.sendFile(absPath);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  applyAsTutor,
  getApplications,
  getMyApplications,
  getTutorsForCourse,
  approveApplication,
  rejectApplication,
  getDocument,
};
