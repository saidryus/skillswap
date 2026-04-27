const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'schedule_changed',
        'schedule_created',
        'instructor_assigned',
        'instructor_changed',
        'announcement',
        'attendance_marked',
        'enrollment',
        'unenrollment',
        'course_updated',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    link: { type: String }, // optional frontend route to navigate to
    meta: { type: mongoose.Schema.Types.Mixed }, // extra context data
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
