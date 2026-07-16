const mongoose = require('mongoose');

const tutorProfileSchema = new mongoose.Schema(
  {
    tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    // Multi-subject support: courses the tutor selected for this application
    selectedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'resubmit'],
      default: 'pending',
    },
    grade: { type: Number, default: null, min: 1.0, max: 5.0 },

    // Recommendation Letter fields
    recommendationDocument: { type: String, default: '' },
    recommendationDocumentName: { type: String, default: '' },

    // OCR Result
    extractedText: { type: String, default: '' },
    ocrConfidence: { type: Number, default: 0 },

    // AI Analysis Result
    aiAnalysis: {
      facultyName: { type: String, default: null },
      facultyPosition: { type: String, default: null },
      department: { type: String, default: null },
      date: { type: String, default: null },
      studentMentioned: { type: Boolean, default: false },
      studentIdMentioned: { type: Boolean, default: false },
      recommendationLanguage: [String],
      recommendationStrength: { type: String, enum: ['none', 'weak', 'moderate', 'strong'], default: 'none' },
      signatureDetected: { type: Boolean, default: false },
      signatureIndicators: [String],
      letterheadDetected: { type: Boolean, default: false },
      templateUsed: { type: Boolean, default: false },
      softSkills: [String],
      subjectsMentioned: [String],
      summary: { type: String, default: '' },
      observations: [String],
      anomalies: [String],
      wordCount: { type: Number, default: 0 },
      analysisMethod: { type: String, enum: ['ml', 'llm', 'rule-based'], default: 'rule-based' },
      llmModel: { type: String, default: null },
      tokensUsed: { type: Number, default: 0 },
    },

    // Subject Alignment (deterministic)
    subjectAlignment: {
      alignments: [{
        subject: String,
        status: { type: String, enum: ['matched', 'uncertain', 'not_mentioned'] },
        confidence: { type: String, enum: ['exact', 'partial', 'weak', 'none'] },
      }],
      alignmentPercentage: { type: Number, default: 0 },
      matchedCount: { type: Number, default: 0 },
      totalSubjects: { type: Number, default: 0 },
    },

    // Confidence Score
    confidenceScore: { type: Number, default: 0 },
    confidenceLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    confidenceBreakdown: { type: mongoose.Schema.Types.Mixed, default: {} },

    // Legacy fields (backward compatibility)
    detectedGrade: { type: Number, default: null },
    gradeDetectionConfidence: { type: String, enum: ['none', 'low', 'medium', 'high', 'error'], default: 'none' },
    gradeDetectionMessage: { type: String, default: '' },
    gradeDocument: { type: String, default: '' },
    gradeDocumentName: { type: String, default: '' },
    signatureDetected: { type: Boolean, default: false },
    signatureConfidence: { type: String, enum: ['none', 'low', 'medium', 'high'], default: 'none' },
    verificationMessage: { type: String, default: '' },

    // Admin review
    adminNotes: { type: String, trim: true, default: '' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },

    // ML Correction — admin override of ML prediction for model retraining
    // Captured when admin disagrees with the ML's strength or subject predictions.
    mlCorrection: {
      correctedStrength: {
        type: String,
        enum: ['none', 'weak', 'moderate', 'strong', null],
        default: null,
      },
      correctedSubjects: { type: [String], default: null },
      correctedSoftSkills: { type: [String], default: null },
      correctionNotes: { type: String, default: '' },
      correctedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      correctedAt: { type: Date, default: null },
    },

    // Document security
    documentExpiresAt: { type: Date, default: null },   // set at upload; file auto-deleted after this
    documentExpired: { type: Boolean, default: false }, // true if file was auto-deleted by the expiry job
    documentAuditLog: [{
      adminId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      adminName: { type: String },
      action:    { type: String, enum: ['viewed', 'auto_expired', 'deleted_on_decision'] },
      timestamp: { type: Date, default: Date.now },
      ip:        { type: String, default: '' },
    }],
  },
  { timestamps: true }
);

// One application per student per course (only blocks if pending or approved)
// Rejected applications don't block reapply
tutorProfileSchema.index({ tutor: 1, course: 1, status: 1 });

module.exports = mongoose.model('TutorProfile', tutorProfileSchema);
