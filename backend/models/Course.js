const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    courseCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    courseName: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    units: { type: Number, required: true, min: 1, max: 12 },
    yearLevel: { type: Number, enum: [1, 2, 3, 4], default: null },
    semester: { type: Number, enum: [1, 2], default: null },
    department: { type: String, trim: true, default: 'Information Technology' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
