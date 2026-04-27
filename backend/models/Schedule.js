const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    day: {
      type: String,
      required: true,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    startTime: { type: String, required: true }, // e.g. "08:00"
    endTime: { type: String, required: true },   // e.g. "09:30"
    room: { type: String, trim: true },
    semester: { type: String, trim: true },
    schoolYear: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Schedule', scheduleSchema);
