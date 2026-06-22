const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tutees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // "HH:MM"
    endTime: { type: String, required: true },   // "HH:MM"
    venue: { type: String, trim: true, default: '' },
    venueType: { type: String, enum: ['on-campus', 'online'], default: 'on-campus' },
    status: {
      type: String,
      enum: ['pending', 'scheduled', 'completed', 'cancelled', 'rejected'],
      default: 'pending',
    },
    notes: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Session', sessionSchema);
