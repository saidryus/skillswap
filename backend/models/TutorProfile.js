const mongoose = require('mongoose');

const tutorProfileSchema = new mongoose.Schema(
  {
    tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    grade: { type: Number, default: null, min: 1.0, max: 5.0 }, // PH college grading: 1.0 (highest) to 5.0 (failing), 3.0 is min passing
    detectedGrade: { type: Number, default: null }, // auto-detected by OCR
    gradeDetectionConfidence: { type: String, enum: ['none', 'low', 'medium', 'high', 'error'], default: 'none' },
    gradeDetectionMessage: { type: String, default: '' },
    gradeDocument: { type: String, default: '' },     // file path
    gradeDocumentName: { type: String, default: '' }, // original filename
    adminNotes: { type: String, trim: true, default: '' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// One application per student per course (only blocks if pending or approved)
// Rejected applications don't block reapply
tutorProfileSchema.index({ tutor: 1, course: 1, status: 1 });

module.exports = mongoose.model('TutorProfile', tutorProfileSchema);
