const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// All available admin permissions (maps to sidebar pages)
const ADMIN_PERMISSIONS = [
  'users',
  'courses',
  'schedules',
  'lab-schedules',
  'attendance',
  'announcements',
];

const userSchema = new mongoose.Schema(
  {
    studentId: { type: String, unique: true, sparse: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['admin', 'faculty', 'student'], default: 'student' },
    department: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    // Super admin flag — only admin@trophe.edu gets this
    isSuperAdmin: { type: Boolean, default: false },
    // Sub-admin permissions — null/empty means full access (for super admin)
    permissions: {
      type: [{ type: String, enum: ADMIN_PERMISSIONS }],
      default: undefined,
    },
  },
  { timestamps: true }
);

module.exports.ADMIN_PERMISSIONS = ADMIN_PERMISSIONS;

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Virtual for full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
