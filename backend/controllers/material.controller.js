const Material = require('../models/Material');
const Course = require('../models/Course');
const TutorProfile = require('../models/TutorProfile');
const path = require('path');
const fs = require('fs');

// @desc    Get resources (filtered)
// @route   GET /api/materials
// @access  Private
const getMaterials = async (req, res) => {
  try {
    const { courseId, type, uploaderId, sort } = req.query;
    const filter = { isActive: true };
    if (courseId) filter.course = courseId;
    if (type) filter.resourceType = type;
    if (uploaderId) filter.uploader = uploaderId;

    let sortOption = { createdAt: -1 }; // default: newest
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'downloads') sortOption = { downloadCount: -1 };

    const materials = await Material.find(filter)
      .populate('course', 'courseCode courseName')
      .populate('uploader', 'firstName lastName studentIdNumber')
      .sort(sortOption);

    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get resources for a specific tutor
// @route   GET /api/materials/tutor/:tutorId
// @access  Private
const getTutorResources = async (req, res) => {
  try {
    const materials = await Material.find({ uploader: req.params.tutorId, isActive: true })
      .populate('course', 'courseCode courseName')
      .sort({ createdAt: -1 });
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload a resource
// @route   POST /api/materials
// @access  Tutor or Admin
const createMaterial = async (req, res) => {
  try {
    const { courseId, title, description, resourceType, externalUrl, visibility } = req.body;

    if (!courseId || !title || !resourceType) {
      return res.status(400).json({ message: 'courseId, title, and resourceType are required' });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // If student (tutor), verify they're approved for this course
    if (req.user.role === 'student') {
      const profile = await TutorProfile.findOne({
        tutor: req.user._id,
        course: courseId,
        status: 'approved',
      });
      if (!profile) {
        return res.status(403).json({ message: 'You can only upload resources for courses you are approved to tutor.' });
      }
    }

    const isExternal = resourceType === 'link' || resourceType === 'recording';

    let fileUrl = '';
    let fileName = '';
    let fileSize = 0;

    if (isExternal) {
      if (!externalUrl) return res.status(400).json({ message: 'URL is required for link/recording resources' });
      fileUrl = externalUrl;
    } else {
      if (!req.file) return res.status(400).json({ message: 'File is required for this resource type' });
      fileUrl = req.file.path;
      fileName = req.file.originalname;
      fileSize = req.file.size;
    }

    const material = await Material.create({
      title,
      description: description || '',
      course: courseId,
      uploader: req.user._id,
      resourceType,
      fileUrl,
      fileName,
      fileSize,
      isExternal,
      visibility: visibility || 'public',
    });

    const populated = await Material.findById(material._id)
      .populate('course', 'courseCode courseName')
      .populate('uploader', 'firstName lastName studentIdNumber');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a resource
// @route   PUT /api/materials/:id
// @access  Owner or Admin
const updateMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ message: 'Resource not found' });

    // Only owner or admin can edit
    if (material.uploader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only edit your own resources' });
    }

    const { title, description, visibility, isActive } = req.body;
    if (title !== undefined) material.title = title;
    if (description !== undefined) material.description = description;
    if (visibility !== undefined) material.visibility = visibility;
    if (isActive !== undefined) material.isActive = isActive;

    await material.save();

    const populated = await Material.findById(material._id)
      .populate('course', 'courseCode courseName')
      .populate('uploader', 'firstName lastName studentIdNumber');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a resource
// @route   DELETE /api/materials/:id
// @access  Owner or Admin
const deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ message: 'Resource not found' });

    if (material.uploader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only delete your own resources' });
    }

    // Delete file from disk if not external
    if (!material.isExternal && material.fileUrl) {
      try { fs.unlinkSync(material.fileUrl); } catch (_) {}
    }

    await Material.findByIdAndDelete(req.params.id);
    res.json({ message: 'Resource deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download/access a resource (increment count)
// @route   GET /api/materials/:id/download
// @access  Private
const downloadMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ message: 'Resource not found' });

    // Increment download count
    material.downloadCount = (material.downloadCount || 0) + 1;
    await material.save();

    if (material.isExternal) {
      return res.json({ url: material.fileUrl, type: 'external' });
    }

    const absPath = path.resolve(material.fileUrl);
    if (!fs.existsSync(absPath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }
    res.download(absPath, material.fileName || 'resource');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMaterials, getTutorResources, createMaterial, updateMaterial, deleteMaterial, downloadMaterial };
