const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true },
    type: { type: String, enum: ['text', 'system', 'recording'], default: 'text' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: null }, // for recording links, etc.
  },
  { timestamps: true }
);

messageSchema.index({ session: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
