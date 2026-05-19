const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    courseCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    courseName: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    units: { type: Number, required: true, min: 1, max: 6 },
    type: { type: String, enum: ['lecture', 'laboratory'], default: 'lecture' },
    yearLevel: { type: Number, enum: [1, 2, 3, 4], default: null },
    department: { type: String, trim: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
