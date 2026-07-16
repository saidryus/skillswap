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
    const { courseId, selectedCourseIds } = req.body;
    if (!courseId) return res.status(400).json({ message: 'courseId is required' });

    // Require availability before applying as tutor
    const Availability = require('../models/Availability');
    const availCount = await Availability.countDocuments({ user: req.user._id });
    if (availCount === 0) {
      return res.status(400).json({
        message: 'You must set your availability before applying as a tutor. Go to your availability settings.',
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
      return res.status(400).json({ message: 'Recommendation letter document is required' });
    }

    // Resolve selected subjects for alignment analysis
    let selectedSubjectNames = [course.courseName];
    let selectedCourses = [courseId];
    if (selectedCourseIds && Array.isArray(JSON.parse(selectedCourseIds || '[]'))) {
      const parsedIds = JSON.parse(selectedCourseIds);
      if (parsedIds.length > 0) {
        const courses = await Course.find({ _id: { $in: parsedIds } });
        selectedSubjectNames = courses.map(c => c.courseName);
        selectedCourses = parsedIds;
      }
    }

    // Run the full recommendation analysis pipeline (OCR + ML/LLM) on the plaintext file
    const { analyzeRecommendationLetter } = require('../utils/recommendationAnalyzer');
    const studentFullName = `${req.user.firstName} ${req.user.lastName}`;
    const analysisResult = await analyzeRecommendationLetter(req.file.path, {
      studentName: studentFullName,
      studentId: req.user.studentIdNumber,
      selectedSubjects: selectedSubjectNames,
    });

    // Encrypt the file at rest AFTER OCR — encrypting first corrupts the PDF for parsing
    const { encryptFile } = require('../utils/fileEncryption');
    try {
      encryptFile(req.file.path);
    } catch (encErr) {
      console.error('[TutorProfile] Encryption failed:', encErr.message);
      // Continue — file still stored, encryption failure logged
    }

    const profile = await TutorProfile.create({
      tutor: req.user._id,
      course: courseId,
      selectedCourses,
      recommendationDocument: req.file.path,
      recommendationDocumentName: req.file.originalname,
      // OCR
      extractedText: analysisResult.ocrResult?.text || '',
      ocrConfidence: analysisResult.ocrResult?.ocrConfidence || 0,
      // AI Analysis
      aiAnalysis: analysisResult.analysis || {},
      // Subject Alignment
      subjectAlignment: analysisResult.alignment || {},
      // Confidence Score
      confidenceScore: analysisResult.confidence?.score || 0,
      confidenceLevel: analysisResult.confidence?.level || 'low',
      confidenceBreakdown: analysisResult.confidence?.breakdown || {},
      // Legacy fields
      gradeDocument: req.file.path,
      gradeDocumentName: req.file.originalname,
      signatureDetected: analysisResult.analysis?.signatureDetected || false,
      signatureConfidence: analysisResult.confidence?.level || 'none',
      verificationMessage: analysisResult.message || '',
      gradeDetectionConfidence: analysisResult.confidence?.level || 'none',
      gradeDetectionMessage: analysisResult.message || '',
      // Document expiry — file auto-deleted after DOC_EXPIRY_DAYS if still pending
      documentExpiresAt: (() => { const { calcExpiresAt } = require('../utils/docExpiry'); return calcExpiresAt(new Date()); })(),
    });

    // Privacy: delete the uploaded recommendation letter file after admin decision (approve/reject)
    // The file remains encrypted on disk until then so the admin can verify the original document.
    // Do NOT delete here.

    // Notify admins
    const admins = await User.find({ role: 'admin', isActive: true }).select('_id');
    const confidenceLabel = analysisResult.confidence?.level || 'low';
    await createNotifications(
      admins.map((a) => ({
        recipient: a._id,
        type: 'tutor_application',
        title: 'New Tutor Application',
        message: `${req.user.firstName} ${req.user.lastName} applied to tutor ${course.courseCode}. Confidence: ${analysisResult.confidence?.score || 0}% (${confidenceLabel}).`,
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

    const Rating = require('../models/Rating');
    const Session = require('../models/Session');

    const rankedProfiles = await Promise.all(profiles.map(async (profile) => {
      const tutorId = profile.tutor._id;

      // ══════════════════════════════════════════════════════════
      // SUBJECT-SPECIFIC METRICS (for the selected course only)
      // ══════════════════════════════════════════════════════════

      // Subject-specific sessions
      const subjectCompleted = await Session.countDocuments({
        tutor: tutorId, course: courseId, status: 'completed',
      });
      const subjectAccepted = await Session.countDocuments({
        tutor: tutorId, course: courseId, status: { $in: ['completed', 'scheduled', 'cancelled'] },
      });

      // Subject-specific ratings
      const subjectRatings = await Rating.find({ tutor: tutorId, course: courseId });
      const subjectRatingCount = subjectRatings.length;
      const subjectAvgRating = subjectRatingCount > 0
        ? subjectRatings.reduce((sum, r) => sum + r.score, 0) / subjectRatingCount
        : 0;

      // Subject-specific completion rate
      const subjectCompletionRate = subjectAccepted > 0
        ? subjectCompleted / subjectAccepted
        : -1; // -1 means no data (use fallback)

      // ══════════════════════════════════════════════════════════
      // OVERALL FALLBACK METRICS (used if subject-specific is insufficient)
      // ══════════════════════════════════════════════════════════

      const overallCompleted = await Session.countDocuments({ tutor: tutorId, status: 'completed' });
      const overallAccepted = await Session.countDocuments({
        tutor: tutorId, status: { $in: ['completed', 'scheduled', 'cancelled'] },
      });
      const overallCompletionRate = overallAccepted > 0 ? overallCompleted / overallAccepted : 1.0;

      const overallRatings = await Rating.find({ tutor: tutorId });
      const overallRatingCount = overallRatings.length;
      const overallAvgRating = overallRatingCount > 0
        ? overallRatings.reduce((sum, r) => sum + r.score, 0) / overallRatingCount
        : 0;

      // ══════════════════════════════════════════════════════════
      // RESOLVED METRICS (subject-specific with fallback)
      // ══════════════════════════════════════════════════════════

      const hasSubjectRatings = subjectRatingCount > 0;
      const hasSubjectSessions = subjectAccepted > 0;

      const avgRating = hasSubjectRatings ? subjectAvgRating : overallAvgRating;
      const totalRatings = hasSubjectRatings ? subjectRatingCount : overallRatingCount;
      const completedSessions = hasSubjectSessions ? subjectCompleted : overallCompleted;
      const completionRate = hasSubjectSessions
        ? (subjectCompletionRate >= 0 ? subjectCompletionRate : 1.0)
        : overallCompletionRate;

      // ══════════════════════════════════════════════════════════
      // FACULTY RECOMMENDATION SCORE (15%)
      // Deterministic — uses ML prediction outputs
      // ══════════════════════════════════════════════════════════

      // Recommendation Strength Score
      const strengthScores = { strong: 100, moderate: 80, weak: 60, none: 0 };
      const recStrength = profile.aiAnalysis?.recommendationStrength || 'none';
      const strengthScore = strengthScores[recStrength] || 0;

      // Subject Alignment from stored analysis
      const alignmentPercentage = profile.subjectAlignment?.alignmentPercentage || 0;

      // Recommendation Score = (70% × Alignment) + (30% × Strength)
      const recommendationScore = (0.70 * alignmentPercentage) + (0.30 * strengthScore);

      // ══════════════════════════════════════════════════════════
      // COMPETENCY SCORE (0-100)
      //   Average Tutor Rating:           45%
      //   Faculty Recommendation Score:   15%
      //   Completion Rate:                20%
      //   Completed Tutoring Sessions:    20%
      // ══════════════════════════════════════════════════════════

      // Rating Component (45 points max)
      const ratingComponent = totalRatings > 0 ? (avgRating / 5) * 45 : 0;

      // Recommendation Component (15 points max)
      const recommendationComponent = (recommendationScore / 100) * 15;

      // Completion Rate Component (20 points max)
      const completionComponent = completionRate * 20;

      // Session Experience Component (20 points max, normalized — caps at 20 sessions)
      const sessionComponent = Math.min(completedSessions, 20) / 20 * 20;

      const competencyScore = Math.round(ratingComponent + recommendationComponent + completionComponent + sessionComponent);

      // ══════════════════════════════════════════════════════════
      // AVAILABILITY CHECK
      // ══════════════════════════════════════════════════════════

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

      return {
        ...profile.toJSON(),
        competencyScore,
        completedSessions,
        completionRate: Math.round(completionRate * 100),
        avgRating: Math.round(avgRating * 10) / 10,
        totalRatings,
        recommendationScore: Math.round(recommendationScore),
        recStrength,
        alignmentPercentage,
        usingSubjectSpecific: hasSubjectRatings || hasSubjectSessions,
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

    // Delete the recommendation document from disk (no longer needed after decision)
    const docPath = profile.recommendationDocument || profile.gradeDocument;
    if (docPath) {
      const fs = require('fs');
      try { fs.unlinkSync(docPath); } catch (_) {}
    }

    // Audit log
    profile.documentAuditLog.push({
      adminId:   req.user._id,
      adminName: `${req.user.firstName} ${req.user.lastName}`,
      action:    'deleted_on_decision',
      timestamp: new Date(),
      ip:        req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '',
    });
    // Clear stored OCR text and document paths — no longer needed after decision
    profile.extractedText = '';
    profile.recommendationDocument = '';
    profile.gradeDocument = '';
    await profile.save();

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

    // Delete the recommendation document from disk now that a decision has been made
    const docPath = profile.recommendationDocument || profile.gradeDocument;
    if (docPath) {
      const fs = require('fs');
      try { fs.unlinkSync(docPath); } catch (_) {}
    }

    // Audit log
    profile.documentAuditLog.push({
      adminId:   req.user._id,
      adminName: `${req.user.firstName} ${req.user.lastName}`,
      action:    'deleted_on_decision',
      timestamp: new Date(),
      ip:        req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '',
    });
    // Clear stored OCR text and document paths — no longer needed after decision
    profile.extractedText = '';
    profile.recommendationDocument = '';
    profile.gradeDocument = '';
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
    const { docToken } = req.query;

    // Check DB-backed lockout first — even a valid JWT won't bypass a doc-access lock
    const adminUser = await User.findById(req.user._id).select('docAccessLockedUntil');
    if (adminUser?.docAccessLockedUntil && adminUser.docAccessLockedUntil > new Date()) {
      const secondsLeft = Math.ceil((adminUser.docAccessLockedUntil - Date.now()) / 1000);
      return res.status(429).json({
        message: `Document access is locked. Try again in ${(secondsLeft / 3600).toFixed(1)} hour(s).`,
        secondsLeft,
        locked: true,
      });
    }

    // Verify document access token
    const { verifyDocAccessToken } = require('../utils/docAccessToken');
    if (!docToken || !verifyDocAccessToken(docToken, req.user._id)) {
      return res.status(403).json({
        message: 'Document access requires re-authentication.',
        requiresReauth: true,
      });
    }

    const profile = await TutorProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ message: 'Application not found' });

    const docPath = profile.recommendationDocument || profile.gradeDocument;
    if (!docPath) {
      // Fallback: return extracted text if file already deleted
      if (profile.extractedText) {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.send(profile.extractedText);
      }
      return res.status(404).json({ message: 'Document not available. It may have been deleted after processing.' });
    }

    const absPath = path.resolve(docPath);
    if (!fs.existsSync(absPath)) {
      // File already deleted — serve extracted text instead
      if (profile.extractedText) {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.send(profile.extractedText);
      }
      return res.status(404).json({ message: 'File not found. It may have been deleted after the application was reviewed.' });
    }

    // Decrypt in memory — never write decrypted content to disk
    const { decryptFileToBuffer, isEncrypted } = require('../utils/fileEncryption');
    let fileBuffer;
    try {
      fileBuffer = isEncrypted(absPath)
        ? decryptFileToBuffer(absPath)
        : fs.readFileSync(absPath);
    } catch (decryptErr) {
      // If decryption fails (legacy unencrypted file), serve as-is
      fileBuffer = fs.readFileSync(absPath);
    }

    const ext = path.extname(absPath).toLowerCase();
    const contentTypes = { '.pdf': 'application/pdf', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png' };
    res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="recommendation${ext}"`);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

    // Audit log — record every view
    const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
    profile.documentAuditLog.push({
      adminId:   req.user._id,
      adminName: `${req.user.firstName} ${req.user.lastName}`,
      action:    'viewed',
      timestamp: new Date(),
      ip:        clientIp,
    });
    await profile.save();

    res.send(fileBuffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin requests resubmission of a tutor application
// @route   PUT /api/tutor-profiles/:id/resubmit
// @access  Admin
const requestResubmission = async (req, res) => {
  try {
    const profile = await TutorProfile.findById(req.params.id)
      .populate('tutor', 'firstName lastName email')
      .populate('course', 'courseCode courseName');

    if (!profile) return res.status(404).json({ message: 'Application not found' });

    profile.status = 'resubmit';
    profile.reviewedBy = req.user._id;
    profile.reviewedAt = new Date();
    profile.adminNotes = req.body.adminNotes || 'Please resubmit your recommendation letter with the required corrections.';
    await profile.save();

    // Delete the old document — student will upload a new one on resubmission
    const docPath = profile.recommendationDocument || profile.gradeDocument;
    if (docPath) {
      const fs = require('fs');
      try { fs.unlinkSync(docPath); } catch (_) {}
    }

    // Audit log
    profile.documentAuditLog.push({
      adminId:   req.user._id,
      adminName: `${req.user.firstName} ${req.user.lastName}`,
      action:    'deleted_on_decision',
      timestamp: new Date(),
      ip:        req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '',
    });
    // Clear stored OCR text and document paths — no longer needed after decision
    profile.extractedText = '';
    profile.recommendationDocument = '';
    profile.gradeDocument = '';
    await profile.save();

    // Notify the student
    await createNotifications({
      recipient: profile.tutor._id,
      type: 'tutor_rejected',
      title: 'Resubmission Requested',
      message: `Your application to tutor ${profile.course.courseCode} needs revision.${profile.adminNotes ? ` Notes: ${profile.adminNotes}` : ''}`,
      link: '/student/become-tutor',
      meta: { profileId: profile._id },
    });

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin submits a correction to the ML prediction for retraining
// @route   POST /api/tutor-profiles/:id/ml-correction
// @access  Admin
const submitMLCorrection = async (req, res) => {
  try {
    const { correctedStrength, correctedSubjects, correctedSoftSkills, correctionNotes } = req.body;

    const validStrengths = ['none', 'weak', 'moderate', 'strong'];
    if (correctedStrength && !validStrengths.includes(correctedStrength)) {
      return res.status(400).json({ message: `correctedStrength must be one of: ${validStrengths.join(', ')}` });
    }

    const profile = await TutorProfile.findById(req.params.id);
    if (!profile) return res.status(404).json({ message: 'Application not found' });

    // extractedText is cleared after decision — we still allow corrections on historical records
    // as long as the admin saw the AI analysis when it was live.
    profile.mlCorrection = {
      correctedStrength: correctedStrength || null,
      correctedSubjects: Array.isArray(correctedSubjects) ? correctedSubjects : null,
      correctedSoftSkills: Array.isArray(correctedSoftSkills) ? correctedSoftSkills : null,
      correctionNotes: correctionNotes || '',
      correctedBy: req.user._id,
      correctedAt: new Date(),
    };

    await profile.save();
    res.json({ message: 'Correction saved. Thank you — this will improve future ML predictions.', mlCorrection: profile.mlCorrection });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Export ML corrections as training data (for model retraining)
// @route   GET /api/tutor-profiles/ml-corrections/export
// @access  Admin
const exportMLCorrections = async (req, res) => {
  try {
    // Only export records that have both a correction AND an extractedText at time of correction.
    // After approve/reject the extractedText is cleared — we still export corrections that have
    // the AI analysis (from which the model can infer the original text context was valid enough
    // to produce a prediction). The ML pipeline will use aiAnalysis.summary as proxy text if
    // extractedText is empty.
    const profiles = await TutorProfile.find({
      'mlCorrection.correctedAt': { $exists: true, $ne: null },
    })
      .select('extractedText aiAnalysis mlCorrection subjectAlignment createdAt')
      .lean();

    const samples = profiles
      .map((p) => {
        const correction = p.mlCorrection;
        const analysis = p.aiAnalysis || {};

        // Use the stored extracted text, or fall back to the AI summary (which captures key phrases)
        const text = (p.extractedText || analysis.summary || '').trim();
        if (!text) return null; // skip if no usable text at all

        return {
          text,
          // Corrected labels take priority; fall back to what ML predicted
          strength: correction.correctedStrength || analysis.recommendationStrength || 'none',
          subjects: correction.correctedSubjects !== null
            ? correction.correctedSubjects
            : (analysis.subjectsMentioned || []),
          softSkills: correction.correctedSoftSkills !== null
            ? correction.correctedSoftSkills
            : (analysis.softSkills || []),
          source: 'admin_correction',
          correctionNotes: correction.correctionNotes || '',
          createdAt: p.createdAt,
        };
      })
      .filter(Boolean);

    // Return as JSON (the Python merge script reads this directly)
    res.json({
      total: samples.length,
      exportedAt: new Date().toISOString(),
      samples,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin re-authenticates to get a short-lived document access token
// @route   POST /api/tutor-profiles/doc-access
// @access  Admin
const requestDocAccess = async (req, res) => {
  try {
    const { generateDocAccessToken, TOKEN_TTL_MS } = require('../utils/docAccessToken');

    const MAX_DOC_ATTEMPTS = 3;
    const LOCKOUT_MS = 3 * 60 * 60 * 1000; // 3 hours

    const admin = await User.findById(req.user._id);

    // Check DB-backed lockout (survives server restarts and logouts)
    if (admin.docAccessLockedUntil && admin.docAccessLockedUntil > new Date()) {
      const secondsLeft = Math.ceil((admin.docAccessLockedUntil - Date.now()) / 1000);
      const hoursLeft = (secondsLeft / 3600).toFixed(1);
      return res.status(429).json({
        message: `Document access locked for ${hoursLeft} more hour(s) due to too many failed attempts.`,
        secondsLeft,
        locked: true,
      });
    }

    const { password } = req.body;
    if (!password) return res.status(400).json({ message: 'Password is required' });

    const isMatch = await admin.matchPassword(password);

    if (!isMatch) {
      const attempts = (admin.docAccessAttempts || 0) + 1;

      if (attempts >= MAX_DOC_ATTEMPTS) {
        // Lock the account — persisted to DB, survives logout
        const lockedUntil = new Date(Date.now() + LOCKOUT_MS);
        await User.findByIdAndUpdate(admin._id, {
          docAccessAttempts: 0,
          docAccessLockedUntil: lockedUntil,
        });

        // Invalidate all in-memory doc tokens for this admin
        const { resetDocAccessAttempts } = require('../utils/docAccessToken');
        resetDocAccessAttempts(admin._id.toString());

        return res.status(429).json({
          message: 'Too many failed attempts. Document access locked for 3 hours. You will be logged out.',
          secondsLeft: LOCKOUT_MS / 1000,
          locked: true,
          forceLogout: true, // frontend should log the admin out immediately
        });
      }

      await User.findByIdAndUpdate(admin._id, { docAccessAttempts: attempts });
      return res.status(401).json({
        message: `Incorrect password. ${MAX_DOC_ATTEMPTS - attempts} attempt${MAX_DOC_ATTEMPTS - attempts !== 1 ? 's' : ''} remaining.`,
        attemptsRemaining: MAX_DOC_ATTEMPTS - attempts,
      });
    }

    // Success — reset attempts and issue token
    await User.findByIdAndUpdate(admin._id, { docAccessAttempts: 0 });
    const docToken = generateDocAccessToken(admin._id.toString());

    res.json({
      docToken,
      expiresIn: TOKEN_TTL_MS / 1000,
      message: `Document access granted for ${TOKEN_TTL_MS / 60000} minutes.`,
    });
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
  requestResubmission,
  getDocument,
  requestDocAccess,
  submitMLCorrection,
  exportMLCorrections,
};

