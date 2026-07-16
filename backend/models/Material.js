const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resourceType: {
      type: String,
      enum: ['pdf', 'powerpoint', 'word', 'image', 'zip', 'link', 'recording'],
      required: true,
    },
    fileUrl: { type: String, default: '' },         // file path or external URL
    fileName: { type: String, default: '' },        // original filename
    fileSize: { type: Number, default: 0 },         // bytes
    isExternal: { type: Boolean, default: false },  // true for links/recordings
    visibility: {
      type: String,
      enum: ['public', 'enrolled', 'private'],
      default: 'public',
    },
    downloadCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

materialSchema.index({ course: 1, isActive: 1 });
materialSchema.index({ uploader: 1 });

module.exports = mongoose.model('Material', materialSchema);
