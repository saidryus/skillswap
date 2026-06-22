const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'global', unique: true },
    studentIdPrefix: { type: String, default: 'SS', trim: true, uppercase: true },
    studentIdCounter: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
