const mongoose = require('mongoose');

const studentScheduleSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    day: {
      type: String,
      required: true,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
    startTime: { type: String, required: true }, // "HH:MM"
    endTime: { type: String, required: true },   // "HH:MM"
    label: { type: String, trim: true, default: '' }, // e.g. "CS101 - Intro to Programming"
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudentSchedule', studentScheduleSchema);
