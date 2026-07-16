const mongoose = require('mongoose');

/**
 * Availability Model
 * 
 * Stores time periods when a user is available for tutoring.
 * This is separate from academic information — no class schedules stored.
 * 
 * Users manage their own availability (when they CAN tutor/be tutored).
 * The scheduler uses this + existing bookings to find conflict-free slots.
 */
const availabilitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    day: {
      type: String,
      required: true,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
    startTime: { type: String, required: true }, // "HH:MM" — when availability starts
    endTime: { type: String, required: true },   // "HH:MM" — when availability ends
  },
  { timestamps: true }
);

availabilitySchema.index({ user: 1, day: 1 });

module.exports = mongoose.model('Availability', availabilitySchema);
