const Availability = require('../models/Availability');

// @desc    Get a user's availability
// @route   GET /api/availability/:userId
// @access  Private
const getUserAvailability = async (req, res) => {
  try {
    const availability = await Availability.find({ user: req.params.userId })
      .sort({ day: 1, startTime: 1 });
    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my availability
// @route   GET /api/availability
// @access  Private
const getMyAvailability = async (req, res) => {
  try {
    const availability = await Availability.find({ user: req.user._id })
      .sort({ day: 1, startTime: 1 });
    res.json(availability);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Set availability (replaces existing)
// @route   PUT /api/availability
// @access  Private
const setMyAvailability = async (req, res) => {
  try {
    const { slots } = req.body;

    if (!Array.isArray(slots)) {
      return res.status(400).json({ message: 'slots must be an array of { day, startTime, endTime }' });
    }

    // Clear existing and replace
    await Availability.deleteMany({ user: req.user._id });

    const created = [];
    for (const slot of slots) {
      if (!slot.day || !slot.startTime || !slot.endTime) continue;
      const entry = await Availability.create({
        user: req.user._id,
        day: slot.day,
        startTime: slot.startTime,
        endTime: slot.endTime,
      });
      created.push(entry);
    }

    res.json({ message: `Availability set with ${created.length} time slots`, slots: created });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a single availability slot
// @route   POST /api/availability
// @access  Private
const addAvailabilitySlot = async (req, res) => {
  try {
    const { day, startTime, endTime } = req.body;
    if (!day || !startTime || !endTime) {
      return res.status(400).json({ message: 'day, startTime, and endTime are required' });
    }

    const slot = await Availability.create({
      user: req.user._id,
      day,
      startTime,
      endTime,
    });

    res.status(201).json(slot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove an availability slot
// @route   DELETE /api/availability/:slotId
// @access  Private
const removeAvailabilitySlot = async (req, res) => {
  try {
    const slot = await Availability.findById(req.params.slotId);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });

    // Only allow user to delete their own
    if (slot.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Availability.findByIdAndDelete(req.params.slotId);
    res.json({ message: 'Slot removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check if user has availability set
// @route   GET /api/availability/has-availability
// @access  Private
const hasAvailability = async (req, res) => {
  try {
    const count = await Availability.countDocuments({ user: req.user._id });
    res.json({ hasAvailability: count > 0, slotCount: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserAvailability,
  getMyAvailability,
  setMyAvailability,
  addAvailabilitySlot,
  removeAvailabilitySlot,
  hasAvailability,
};
