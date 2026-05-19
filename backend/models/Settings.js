const mongoose = require('mongoose');

/**
 * Singleton settings document — always one record with key 'global'.
 */
const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'global', unique: true },
    studentIdPrefix: { type: String, default: 'UC', trim: true, uppercase: true },
    studentIdCounter: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
