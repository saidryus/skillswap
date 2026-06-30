const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ADMIN_PERMISSIONS = [
  'users',
  'courses',
  'tutor-applications',
  'sessions',
  'student-schedules',
  'announcements',
];

const userSchema = new mongoose.Schema(
  {
    studentIdNumber: { type: String, trim: true, default: '' }, // e.g. "2021-00123"
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 3 },
    role: { type: String, enum: ['admin', 'student'], default: 'student' },
    yearLevel: { type: Number, enum: [1, 2, 3, 4], default: null },
    phone: { type: String, trim: true },
    department: { type: String, trim: true, default: 'Information Technology' },
    isActive: { type: Boolean, default: true },
    isTutor: { type: Boolean, default: false }, // true if approved for at least one course
    maxSessionsPerWeek: { type: Number, default: 5, min: 1, max: 20 }, // tutor availability cap
    mustChangePassword: { type: Boolean, default: false }, // force password change on first login
    currentSemester: { type: Number, enum: [1, 2], default: null }, // detected from study load
    isSuperAdmin: { type: Boolean, default: false },
    permissions: {
      type: [{ type: String, enum: ADMIN_PERMISSIONS }],
      default: undefined,
    },
    assignedDepartments: {
      type: [{ type: String, trim: true }],
      default: undefined, // undefined = all departments (super admin), [] = none
    },
  },
  { timestamps: true }
);

module.exports.ADMIN_PERMISSIONS = ADMIN_PERMISSIONS;

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
